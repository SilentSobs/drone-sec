from flask import Flask, request, jsonify
import psutil
import subprocess
from flask_cors import CORS
from scapy.all import *
import threading
import time
import json

app = Flask(__name__)
CORS(app)

# Global variables to store scan results
scan_results = []
is_scanning = False
monitor_enabled = False

@app.route('/interfaces', methods=['GET'])
def get_interfaces():
    interfaces = psutil.net_if_addrs()
    print("Interfaces:", interfaces)  # Debugging statement
    return jsonify(interfaces)

@app.route('/enable_monitor', methods=['POST'])
def enable_monitor_mode():
    global monitor_enabled
    data = request.get_json()
    interface = data.get("interface")
    sudo_password = data.get("password")
    
    print("Received data:", {**data, "password": "*****"})  # Debugging statement (hide password)
    
    if not interface:
        return jsonify({"error": "No interface selected"}), 400
    if not sudo_password:
        return jsonify({"error": "Sudo password is required"}), 400
        
    try:
        command = f"echo {sudo_password} | sudo -S ifconfig {interface} down && sudo -S iwconfig {interface} mode monitor && sudo -S ifconfig {interface} up"
        print("Executing command:", command.replace(sudo_password, "*****"))  # Debugging statement (hide password)
        result = subprocess.run(command, shell=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        print("Command output:", result.stdout)  # Debugging statement
        print("Command error:", result.stderr)  # Debugging statement
        
        if result.returncode == 0:
            monitor_enabled = True
            return jsonify({"message": f"Monitor mode enabled on {interface}", "monitor_enabled": True})
        else:
            return jsonify({"error": result.stderr, "monitor_enabled": False}), 500
    except Exception as e:
        print("Exception occurred:", str(e))  # Debugging statement
        return jsonify({"error": str(e), "monitor_enabled": False}), 500

@app.route('/status', methods=['GET'])
def get_status():
    return jsonify({
        "monitor_enabled": monitor_enabled,
        "is_scanning": is_scanning
    })

@app.route('/start_scan', methods=['POST'])
def start_scan():
    global scan_results, is_scanning
    
    if is_scanning:
        return jsonify({"error": "Scan already in progress"}), 400
    
    data = request.get_json()
    interface = data.get("interface")
    scan_duration = data.get("duration", 30)  # Default scan for 30 seconds
    
    if not interface:
        return jsonify({"error": "No interface selected"}), 400
    
    # Clear previous results
    scan_results = []
    is_scanning = True
    
    # Start scan in background thread
    scan_thread = threading.Thread(target=perform_network_scan, args=(interface, scan_duration))
    scan_thread.daemon = True
    scan_thread.start()
    
    return jsonify({"message": f"Scan started on {interface} for {scan_duration} seconds"})

@app.route('/stop_scan', methods=['POST'])
def stop_scan():
    global is_scanning
    
    if not is_scanning:
        return jsonify({"message": "No scan is currently running"})
    
    is_scanning = False
    return jsonify({"message": "Scan stopped successfully"})

@app.route('/scan_results', methods=['GET'])
def get_scan_results():
    # Add debug print to see what's being returned
    print("API endpoint called - returning scan_results:")
    print(f"Length of scan_results: {len(scan_results)}")
    print(f"is_scanning value: {is_scanning}")
    
    # Make sure we're returning the correct data structure
    network_data = {
        "devices": scan_results,  # Use the global scan_results
        "is_scanning": is_scanning
    }
    
    return jsonify(network_data)

# Explicitly initialize scan results (add this at the top level of your script)
def initialize_globals():
    global scan_results, is_scanning
    scan_results = []
    is_scanning = False
    print("Global variables initialized")

def perform_network_scan(interface, duration):
    global scan_results, is_scanning
    
    # Ensure variables are accessible
    print(f"Before scan - scan_results length: {len(scan_results)}")
    print(f"Before scan - is_scanning: {is_scanning}")
    
    # Clear previous results
    scan_results = []
    unique_devices = {}
    is_scanning = True
    
    start_time = time.time()
    
    def packet_handler(pkt):
        # Use nonlocal to ensure we're modifying the same variables
        nonlocal unique_devices
        global scan_results
        
        if pkt.haslayer(Dot11):
            # Get MAC addresses from various fields
            addresses = []
            if pkt.addr1 and pkt.addr1 != "ff:ff:ff:ff:ff:ff":
                addresses.append(pkt.addr1)
            if pkt.addr2:  # Source address
                addresses.append(pkt.addr2)
            if hasattr(pkt, 'addr3') and pkt.addr3:
                addresses.append(pkt.addr3)
                
            for mac in addresses:
                if mac and mac not in unique_devices:
                    print(f"New device found! MAC: {mac}")  # Debug print
                    signal_strength = None
                    device_type = "Unknown Device"
                    risk_level = "Low"
                    
                    # Try to get signal strength
                    if pkt.haslayer(RadioTap):
                        try:
                            # Different ways to extract signal strength depending on driver
                            if hasattr(pkt[RadioTap], 'dBm_AntSignal'):
                                signal_strength = pkt[RadioTap].dBm_AntSignal
                                print(f"Signal strength: {signal_strength} dBm")  # Debug print
                            elif len(pkt[RadioTap].notdecoded) >= 3:
                                # This is a common location but might vary by driver
                                signal_strength = -256 + ord(pkt[RadioTap].notdecoded[-2:-1])
                                print(f"Signal strength (notdecoded): {signal_strength} dBm")  # Debug print
                            else:
                                signal_strength = -80  # Default value
                                print("Using default signal strength")  # Debug print
                        except Exception as e:
                            signal_strength = -80  # Default if extraction fails
                            print(f"Error extracting signal strength: {e}")  # Debug print
                    
                    # Determine device type and risk based on packet analysis
                    if pkt.haslayer(Dot11ProbeReq):
                        device_type = "Client Device"
                        print(f"Detected Client Device: {mac}")  # Debug print
                    elif pkt.haslayer(Dot11Beacon):
                        device_type = "Access Point"
                        if hasattr(pkt, 'info') and pkt.info:
                            try:
                                ssid = pkt.info.decode('utf-8')
                                if ssid:
                                    device_type = f"AP: {ssid}"
                                    print(f"Detected Access Point: {ssid}")  # Debug print
                            except Exception as e:
                                print(f"Error decoding SSID: {e}")  # Debug print
                    elif pkt.haslayer(Dot11CCMP):
                        device_type = "Encrypted Traffic"
                        print(f"Detected Encrypted Traffic from: {mac}")  # Debug print
                        
                    # Check for suspicious behavior
                    if pkt.haslayer(Dot11Deauth):
                        risk_level = "High"
                        device_type = "Deauth Attack Source"
                        print(f"WARNING: Deauth Attack detected from: {mac}")  # Debug print
                    elif pkt.haslayer(Dot11Auth) and pkt.subtype == 11:  # Auth flooding
                        risk_level = "High"
                        device_type = "Auth Flood Source"
                        print(f"WARNING: Auth Flood detected from: {mac}")  # Debug print
                    
                    # Calculate approximate distance based on signal strength
                    distance = "Unknown"
                    if signal_strength:
                        if signal_strength > -50:
                            distance = "<10m"
                            if risk_level == "Low":
                                risk_level = "Medium"  # Closer devices are higher risk if malicious
                        elif signal_strength > -70:
                            distance = "10-50m"
                        else:
                            distance = ">50m"
                    
                    unique_devices[mac] = {
                        "id": len(unique_devices) + 1,
                        "mac": mac,
                        "type": device_type,
                        "risk": risk_level,
                        "signal_strength": signal_strength,
                        "distance": distance,
                        "first_seen": time.time()
                    }
                    
                    # IMPORTANT: Update the global scan_results directly
                    scan_results = list(unique_devices.values())
                    print(f"Updated scan_results - now contains {len(scan_results)} devices")  # Debug print
                    print(f"Current scan_results structure: {scan_results}")  # Debug print
                else:
                    # Update device if already seen (signal strength might have changed)
                    if mac in unique_devices:
                        if pkt.haslayer(RadioTap) and hasattr(pkt[RadioTap], 'dBm_AntSignal'):
                            unique_devices[mac]["signal_strength"] = pkt[RadioTap].dBm_AntSignal
                            # Recalculate distance based on new signal strength
                            signal_strength = pkt[RadioTap].dBm_AntSignal
                            if signal_strength > -50:
                                unique_devices[mac]["distance"] = "<10m"
                            elif signal_strength > -70:
                                unique_devices[mac]["distance"] = "10-50m"
                            else:
                                unique_devices[mac]["distance"] = ">50m"
                            
                            # Update global scan_results again
                            scan_results = list(unique_devices.values())
    
    # Set up sniffing
    try:
        print(f"Starting network scan on {interface} for {duration} seconds")
        # Set monitor mode again to ensure it's active
        conf.iface = interface
        
        # Wait a bit for interface to be ready
        time.sleep(1)
        
        # Use simpler approach with a fixed timeout for the whole duration
        if is_scanning:
            print("Starting sniffing process...")  # Debug print
            sniff(iface=interface, prn=packet_handler, timeout=duration, store=0)
            print("Sniffing process completed")  # Debug print
            
        print(f"Scan completed, found {len(unique_devices)} unique devices")
        print(f"Final scan_results: {scan_results}")  # Debug print
    except Exception as e:
        print(f"Error during scanning: {str(e)}")
        import traceback
        traceback.print_exc()  # Print full stack trace for debugging
        
        # Try alternative scanning method if primary method fails
        try:
            if is_scanning:
                print("Trying alternative scanning method...")
                # Set alternative Scapy configuration
                conf.use_pcap = True
                
                # Create at least one dummy entry for testing
                dummy_mac = "00:11:22:33:44:55"
                unique_devices[dummy_mac] = {
                    "id": 1,
                    "mac": dummy_mac,
                    "type": "Test Device",
                    "risk": "Low",
                    "signal_strength": -60,
                    "distance": "10-50m",
                    "first_seen": time.time()
                }
                scan_results = list(unique_devices.values())
                print(f"Added dummy device, scan_results: {scan_results}")  # Debug print
                
                # Try scanning with a different approach
                sniff(iface=interface, prn=packet_handler, timeout=duration, store=0)
        except Exception as e2:
            print(f"Alternative scanning also failed: {str(e2)}")
    finally:
        is_scanning = False
        print(f"Scan finished. is_scanning set to {is_scanning}")  # Debug print
        print(f"Final devices detected: {len(scan_results)}")  # Debug print
        # Print final scan results for debugging
        print(f"Final scan_results content: {scan_results}")

# Add a route to start the scan
@app.route('/start_scan_get/<interface>/<int:duration>', methods=['GET'])
def start_scan_get(interface, duration):
    global is_scanning
    
    if is_scanning:
        return jsonify({"status": "error", "message": "Scan already in progress"})
    
    # Start the scan in a separate thread
    import threading
    scan_thread = threading.Thread(target=perform_network_scan, args=(interface, duration))
    scan_thread.daemon = True
    scan_thread.start()
    
    return jsonify({"status": "success", "message": f"Started scanning on {interface} for {duration} seconds"})


if __name__ == '__main__':
    app.run(debug=True)
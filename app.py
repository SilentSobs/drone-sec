from flask import Flask, request, jsonify
import psutil
import subprocess
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/interfaces', methods=['GET'])
def get_interfaces():
    interfaces = psutil.net_if_addrs()
    print("Interfaces:", interfaces)  # Debugging statement
    return jsonify(interfaces)

@app.route('/enable_monitor', methods=['POST'])
def enable_monitor_mode():
    data = request.get_json()
    interface = data.get("interface")
    sudo_password = data.get("password")

    print("Received data:", data)  # Debugging statement

    if not interface:
        return jsonify({"error": "No interface selected"}), 400

    if not sudo_password:
        return jsonify({"error": "Sudo password is required"}), 400

    try:
        command = f"echo {sudo_password} | sudo -S ifconfig {interface} down && sudo -S iwconfig {interface} mode monitor && sudo -S ifconfig {interface} up"
        print("Executing command:", command)  # Debugging statement
        result = subprocess.run(command, shell=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        print("Command output:", result.stdout)  # Debugging statement
        print("Command error:", result.stderr)  # Debugging statement

        if result.returncode == 0:
            return jsonify({"message": f"Monitor mode enabled on {interface}"})
        else:
            return jsonify({"error": result.stderr}), 500

    except Exception as e:
        print("Exception occurred:", str(e))  # Debugging statement
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

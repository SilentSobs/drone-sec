import React, { useState, useEffect } from 'react';
import { Wifi, AlertTriangle, Shield, Search, StopCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import StatusCard from './components/StatusCard';
import SignalStrengthChart from './components/SignalStrengthChart';
import TreemapChart from './components/TreemapChart';
import ThreatList from './components/ThreatList';





const SecurityDashboard = () => {
  const [selectedInterface, setSelectedInterface] = useState('');
  const [sudoPassword, setSudoPassword] = useState('');
  const [interfaces, setInterfaces] = useState([]);
  const [activeTab, setActiveTab] = useState('detection');
  const [monitorEnabled, setMonitorEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanDuration, setScanDuration] = useState(30);
  const [threats, setThreats] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    console.log('Fetching interfaces...');
    fetch('http://localhost:5000/interfaces')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched interfaces:', data);
        setInterfaces(Object.keys(data));
      })
      .catch(error => {
        console.error('Error fetching interfaces:', error);
        setStatusMessage('Failed to fetch network interfaces. Check if the server is running.');
      });
      
    // Check the initial status
    checkStatus();
  }, []);
  
  // Effect to update results while scanning
  useEffect(() => {
    let intervalId;
    
    if (isScanning) {
      // Start polling for results
      intervalId = setInterval(() => {
        fetchScanResults();
      }, 2000);  // Poll every 2 seconds
      
      setStatusMessage('Scanning network for devices...');
    } else {
      clearInterval(intervalId);
    }
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isScanning]);

  useEffect(() => {
    console.log('Selected Interface:', selectedInterface);
  }, [selectedInterface]);
  
  const checkStatus = () => {
    fetch('http://localhost:5000/status')
      .then(response => response.json())
      .then(data => {
        setMonitorEnabled(data.monitor_enabled);
        setIsScanning(data.is_scanning);
        
        if (data.is_scanning) {
          fetchScanResults();
        }
      })
      .catch(error => console.error('Error checking status:', error));
  };

  const enableMonitorMode = () => {
    if (!selectedInterface) {
      setStatusMessage('Please select an interface first!');
      return;
    }

    if (!sudoPassword) {
      setStatusMessage('Please enter the sudo password!');
      return;
    }

    setStatusMessage('Enabling monitor mode...');
    
    fetch('http://localhost:5000/enable_monitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interface: selectedInterface, password: sudoPassword })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setStatusMessage(`Error: ${data.error}`);
        } else {
          setStatusMessage(data.message);
          setMonitorEnabled(data.monitor_enabled);
        }
      })
      .catch(error => {
        console.error('Error enabling monitor mode:', error);
        setStatusMessage('Failed to enable monitor mode. Check the server logs.');
      });
  };
  
  const startNetworkScan = () => {
    if (!selectedInterface) {
      setStatusMessage('Please select an interface first!');
      return;
    }
    
    if (!monitorEnabled) {
      setStatusMessage('Please enable monitor mode first!');
      return;
    }
    
    setStatusMessage(`Starting network scan for ${scanDuration} seconds...`);
    
    fetch('http://localhost:5000/start_scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        interface: selectedInterface,
        duration: scanDuration
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setStatusMessage(`Error: ${data.error}`);
        } else {
          setIsScanning(true);
          setStatusMessage(data.message);
        }
      })
      .catch(error => {
        console.error('Error starting scan:', error);
        setStatusMessage('Failed to start network scan. Check the server logs.');
      });
  };
  
  const stopNetworkScan = () => {
    setStatusMessage('Stopping network scan...');
    
    fetch('http://localhost:5000/stop_scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => response.json())
      .then(data => {
        setIsScanning(false);
        setStatusMessage(data.message);
        
        // Get final results
        fetchScanResults();
      })
      .catch(error => {
        console.error('Error stopping scan:', error);
        setStatusMessage('Failed to stop network scan. Check the server logs.');
        setIsScanning(false);
      });
  };
  
// Improved fetch function with better debugging and error handling
const fetchScanResults = () => {
  console.log('Fetching scan results...');
  
  // Add timestamp to prevent caching
  const url = `http://localhost:5000/scan_results?t=${new Date().getTime()}`;
  
  fetch(url)
    .then(response => {
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Raw scan results:', data);
      
      // Check if data exists and has the correct structure
      if (!data) {
        console.error('No data received from server');
        return;
      }
      
      // Check for devices array
      if (!data.devices) {
        console.error('No devices array in response:', data);
        return;
      }
      
      console.log(`Found ${data.devices.length} devices in scan results`);
      
      if (data.devices && data.devices.length > 0) {
        // Use a functional update to ensure we're not depending on stale state
        setThreats(prevThreats => {
          const newThreats = data.devices.map(device => ({
            id: device.id,
            type: device.type,
            risk: device.risk,
            distance: device.distance,
            mac: device.mac,
            signal_strength: device.signal_strength
          }));
          console.log('Mapped threats:', newThreats);
          return newThreats;
        });
      } else {
        console.log('No devices found in scan results');
      }
      
      setIsScanning(data.is_scanning);
      
      // Use a callback to ensure we're accessing the latest threats state
      setIsScanning(isScanning => {
        if (!isScanning) {
          setThreats(currentThreats => {
            if (currentThreats.length > 0) {
              setStatusMessage(`Scan complete. Found ${currentThreats.length} device(s).`);
            } else {
              setStatusMessage('Scan complete. No devices found.');
            }
            return currentThreats;
          });
        }
        return isScanning;
      });
    })
    .catch(error => {
      console.error('Error fetching scan results:', error);
      setStatusMessage(`Error: ${error.message}. Check console for details.`);
    });
};

  const signalData = threats.filter(t => t.signal_strength).map((threat, index) => {
    const timePoint = new Date();
    timePoint.setMinutes(timePoint.getMinutes() - (threats.length - index));
    return {
      time: timePoint.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      strength: threat.signal_strength,
      mac: threat.mac.slice(-8) // last 8 chars of MAC for label
    };
  });

  // Create data for treemap based on device types
  const deviceTypeCount = {};
  threats.forEach(threat => {
    if (!deviceTypeCount[threat.type]) {
      deviceTypeCount[threat.type] = 0;
    }
    deviceTypeCount[threat.type]++;
  });
  
  const treemapData = Object.entries(deviceTypeCount).map(([type, count]) => ({
    name: type,
    value: count
  }));

  console.log('Rendering SecurityDashboard with activeTab:', activeTab);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto py-6 px-4">
        {statusMessage && (
          <div className="mb-6 p-4 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
            {statusMessage}
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700">Enter Sudo Password</label>
          <input
            type="password"
            value={sudoPassword}
            onChange={(e) => setSudoPassword(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Sudo Password"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700">Select Network Interface</label>
          <select
            value={selectedInterface}
            onChange={(e) => setSelectedInterface(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Choose Interface...</option>
            {interfaces.map((iface) => (
              <option key={iface} value={iface}>{iface}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-6 flex space-x-4">
          <button
            onClick={enableMonitorMode}
            disabled={isScanning}
            className={`px-4 py-2 ${monitorEnabled ? 'bg-green-600' : 'bg-blue-600'} text-white rounded-lg hover:${monitorEnabled ? 'bg-green-700' : 'bg-blue-700'} disabled:opacity-50`}
          >
            {monitorEnabled ? 'Monitor Mode Enabled' : 'Enable Monitor Mode'}
          </button>
          
          {monitorEnabled && (
            <>
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700">Scan Duration (seconds)</label>
                <input
                  type="number"
                  value={scanDuration}
                  onChange={(e) => setScanDuration(parseInt(e.target.value) || 30)}
                  min="5"
                  max="300"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              {!isScanning ? (
                <button
                  onClick={startNetworkScan}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                >
                  <Search size={18} />
                  <span>Start Network Scanner</span>
                </button>
              ) : (
                <button
                  onClick={stopNetworkScan}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                >
                  <StopCircle size={18} />
                  <span>Stop Scanning</span>
                </button>
              )}
            </>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatusCard 
            icon={<Wifi className="w-6 h-6 text-blue-600" />} 
            title="Active Signals" 
            value={threats.length.toString()} 
            color="blue" 
          />
          <StatusCard 
            icon={<AlertTriangle className="w-6 h-6 text-red-600" />} 
            title="Threats Detected" 
            value={threats.filter(t => t.risk === 'High').length.toString()} 
            color="red" 
          />
          <StatusCard 
            icon={<Shield className="w-6 h-6 text-green-600" />} 
            title="Security Status" 
            value={isScanning ? "Scanning" : (threats.filter(t => t.risk === 'High').length > 0 ? "Threats Detected" : "Protected")} 
            color={isScanning ? "blue" : (threats.filter(t => t.risk === 'High').length > 0 ? "red" : "green")} 
          />
        </div>
        
        {threats.length > 0 && (
          <>
            <SignalStrengthChart data={signalData} />
            {treemapData.length > 0 && <TreemapChart data={treemapData} />}
          </>
        )}
        
        <ThreatList threats={threats} />
      </main>
    </div>
  );
};

export default SecurityDashboard;
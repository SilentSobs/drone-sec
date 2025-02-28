import React, { useState, useEffect } from 'react';
import { Wifi, AlertTriangle, Shield } from 'lucide-react';
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
      .catch(error => console.error('Error fetching interfaces:', error));
  }, []);

  useEffect(() => {
    console.log('Selected Interface:', selectedInterface);
  }, [selectedInterface]);

  const enableMonitorMode = () => {
    if (!selectedInterface) {
      alert('Please select an interface first!');
      return;
    }

    if (!sudoPassword) {
      alert('Please enter the sudo password!');
      return;
    }

    fetch('http://localhost:5000/enable_monitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interface: selectedInterface, password: sudoPassword })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(`Error: ${data.error}`);
        } else {
          alert(data.message);
        }
      })
      .catch(error => console.error('Error enabling monitor mode:', error));
  };

  const signalData = [
    { time: '00:00', strength: -50 },
    { time: '00:01', strength: -55 },
    { time: '00:02', strength: -45 },
    { time: '00:03', strength: -60 },
    { time: '00:04', strength: -52 },
  ];

  const threats = [
    { id: 1, type: 'Unknown Drone', risk: 'High', distance: '120m', mac: '00:11:22:33:44:55' },
    { id: 2, type: 'DJI Mavic', risk: 'Medium', distance: '250m', mac: 'AA:BB:CC:DD:EE:FF' },
  ];

  const treemapData = [
    { name: 'Category 1', value: 400, children: [{ name: 'Sub 1', value: 200 }, { name: 'Sub 2', value: 200 }] },
    { name: 'Category 2', value: 300 },
    { name: 'Category 3', value: 200 },
  ];

  console.log('Rendering SecurityDashboard with activeTab:', activeTab);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto py-6 px-4">
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
        <button
          onClick={enableMonitorMode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-6"
        >
          Enable Monitor Mode
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatusCard icon={<Wifi className="w-6 h-6 text-blue-600" />} title="Active Signals" value="3" color="blue" />
          <StatusCard icon={<AlertTriangle className="w-6 h-6 text-red-600" />} title="Threats Detected" value="1" color="red" />
          <StatusCard icon={<Shield className="w-6 h-6 text-green-600" />} title="Security Status" value="Protected" color="green" />
        </div>
        <SignalStrengthChart data={signalData} />
        <TreemapChart data={treemapData} />
        <ThreatList threats={threats} />
      </main>
    </div>
  );
};

export default SecurityDashboard;

import React, { useState } from 'react';

import { Wifi, AlertTriangle, Shield } from 'lucide-react';
import Navbar from './components/Navbar';
import StatusCard from './components/StatusCard';
import SignalStrengthChart from './components/SignalStrengthChart';
import TreemapChart from './components/TreemapChart';
import ThreatList from './components/ThreatList';

const SecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState('detection');

  // Mock data for demonstration
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto py-6 px-4">
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

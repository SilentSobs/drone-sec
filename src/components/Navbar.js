import React from 'react';
import { Radio, Activity, Map } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <button
              className={`flex items-center px-3 py-2 text-sm font-medium ${
                activeTab === 'detection' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('detection')}
            >
              <Radio className="w-5 h-5 mr-2" />
              Detection
            </button>
            <button
              className={`flex items-center px-3 py-2 text-sm font-medium ${
                activeTab === 'analysis' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('analysis')}
            >
              <Activity className="w-5 h-5 mr-2" />
              Analysis
            </button>
            <button
              className={`flex items-center px-3 py-2 text-sm font-medium ${
                activeTab === 'mapping' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('mapping')}
            >
              <Map className="w-5 h-5 mr-2" />
              Mapping
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

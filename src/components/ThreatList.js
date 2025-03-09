import React from 'react';

const ThreatList = ({ threats }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Detected Threats</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {threats.map((threat) => (
          <div key={threat.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">{threat.type}</h3>
                <p className="text-sm text-gray-500">MAC: {threat.mac}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  threat.risk === 'High' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {threat.risk} Risk
                </p>
                <p className="text-sm text-gray-500">{threat.distance}</p>
              </div>
            </div>
            <div className="mt-4 flex space-x-4">
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreatList;

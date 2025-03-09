import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const SignalStrengthChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Signal Strength Monitor</h2>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center p-6">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            <p className="mt-4 text-gray-600 font-medium">No signal data available yet</p>
            <p className="text-gray-500 text-sm mt-2">Start a network scan to collect signal strength data</p>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-semibold text-gray-800">{`Time: ${label}`}</p>
          <p className="text-blue-600 font-medium">{`Device: ${payload[0].payload.mac}`}</p>
          <p className="text-blue-800">{`Signal: ${payload[0].value} dBm`}</p>
          <p className="text-gray-600 text-sm mt-1">
            {payload[0].value > -50 ? 'Excellent connection' : 
             payload[0].value > -70 ? 'Good connection' : 
             payload[0].value > -90 ? 'Fair connection' : 'Poor connection'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">Signal Strength Monitor</h2>
      <p className="text-gray-500 mb-4 text-sm">Real-time signal strength monitoring of detected devices</p>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              domain={[-100, -20]}
              label={{ 
                value: 'Signal Strength (dBm)', 
                angle: -90, 
                position: 'insideLeft', 
                style: { textAnchor: 'middle', fill: '#6B7280' } 
              }}
              tick={{ fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }} 
              formatter={(value) => <span className="text-gray-700 font-medium">{value}</span>}
            />
            
            {/* Reference lines for signal quality zones */}
            <ReferenceLine y={-50} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Excellent', position: 'right', fill: '#10B981' }} />
            <ReferenceLine y={-70} stroke="#FBBF24" strokeDasharray="3 3" label={{ value: 'Good', position: 'right', fill: '#FBBF24' }} />
            <ReferenceLine y={-90} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Poor', position: 'right', fill: '#EF4444' }} />
            
            <Line
              type="monotone"
              dataKey="strength"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ stroke: '#2563EB', strokeWidth: 2, r: 4, fill: 'white' }}
              activeDot={{ r: 8, stroke: '#1D4ED8', strokeWidth: 2, fill: '#3B82F6' }}
              name="Signal Strength"
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <p className="text-gray-700">-30 to -50 dBm: Excellent</p>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
          <p className="text-gray-700">-50 to -70 dBm: Good</p>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-orange-400 mr-2"></div>
          <p className="text-gray-700">-70 to -90 dBm: Fair</p>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <p className="text-gray-700">Below -90 dBm: Poor</p>
        </div>
      </div>
    </div>
  );
};

export default SignalStrengthChart;
import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

const TreemapChart = ({ data }) => {
  // Rich color palette for better visualization
  const COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#14B8A6', // Teal
    '#6366F1'  // Indigo
  ];

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Device Type Distribution</h2>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center p-6">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <p className="mt-4 text-gray-600 font-medium">No device data available yet</p>
            <p className="text-gray-500 text-sm mt-2">Start a network scan to collect device data</p>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-semibold text-gray-800">{payload[0].payload.name}</p>
          <p className="text-gray-700 mt-1">Count: <span className="font-medium">{payload[0].value}</span></p>
          <p className="text-gray-500 text-sm mt-1">
            {payload[0].value > 5 ? 'High frequency' : 
             payload[0].value > 2 ? 'Medium frequency' : 'Low frequency'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Add colors to each item
  const coloredData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">Device Type Distribution</h2>
      <p className="text-gray-500 mb-4 text-sm">Analysis of detected device types in your network</p>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={coloredData}
            dataKey="value"
            nameKey="name"
            aspectRatio={4/3}
            stroke="#ffffff"
            strokeWidth={2}
            animationDuration={800}
            animationEasing="ease-in-out"
            content={(props) => {
              const { x, y, width, height, name, value, fill } = props;
              
              // Only display text if there's enough space
              return (width > 50 && height > 30) ? (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                      fill,
                      stroke: '#ffffff',
                      strokeWidth: 2,
                      strokeOpacity: 0.8,
                      rx: 2,
                      ry: 2
                    }}
                  />
                  <text
                    x={x + width / 2}
                    y={y + height / 2 - 10}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={12}
                    fontWeight="bold"
                    style={{
                      textShadow: '0px 1px 2px rgba(0,0,0,0.5)'
                    }}
                  >
                    {name}
                  </text>
                  <text
                    x={x + width / 2}
                    y={y + height / 2 + 10}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={11}
                    style={{
                      textShadow: '0px 1px 2px rgba(0,0,0,0.5)'
                    }}
                  >
                    {value}
                  </text>
                </g>
              ) : (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  style={{
                    fill,
                    stroke: '#ffffff',
                    strokeWidth: 2,
                    strokeOpacity: 0.8,
                    rx: 2,
                    ry: 2
                  }}
                />
              );
            }}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {coloredData.map((item, index) => (
          <div key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
            <div
              className="w-4 h-4 mr-2 rounded-sm"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-sm truncate">
              <span className="font-medium">{item.name}</span>: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TreemapChart;
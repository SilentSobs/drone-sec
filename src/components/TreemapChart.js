import React from 'react';
import { Treemap, ResponsiveContainer } from 'recharts';

const TreemapChart = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Threat Distribution</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            width={400}
            height={200}
            data={data}
            dataKey="value"
            stroke="#fff"
            fill="#8884d8"
          />
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TreemapChart;

import React from 'react';

const StatusCard = ({ icon, title, value, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`bg-${color}-100 rounded-full p-3`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;

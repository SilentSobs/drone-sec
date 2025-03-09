import React from 'react';

const StatusCard = ({ icon, title, value, color, subtitle }) => {
  // Define background and text colors based on the color prop
  const getCardStyles = () => {
    switch (color) {
      case 'red':
        return {
          background: 'bg-gradient-to-br from-red-50 to-red-100',
          border: 'border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          value: 'text-red-700',
          subtitle: 'text-red-600/70'
        };
      case 'green':
        return {
          background: 'bg-gradient-to-br from-green-50 to-green-100',
          border: 'border-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          value: 'text-green-700',
          subtitle: 'text-green-600/70'
        };
      case 'yellow':
        return {
          background: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          value: 'text-yellow-700',
          subtitle: 'text-yellow-600/70'
        };
      case 'blue':
      default:
        return {
          background: 'bg-gradient-to-br from-blue-50 to-blue-100',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          value: 'text-blue-700',
          subtitle: 'text-blue-600/70'
        };
    }
  };

  const styles = getCardStyles();

  // Generate dynamic subtitle if not provided
  const generateSubtitle = () => {
    if (subtitle) return subtitle;
    
    if (title === 'Active Signals') {
      const count = parseInt(value) || 0;
      return count === 0 ? 'No devices detected' : 
             count === 1 ? '1 device on your network' : 
             `${count} devices on your network`;
    }
    
    if (title === 'Threats Detected') {
      const count = parseInt(value) || 0;
      return count === 0 ? 'No threats detected' : 
             count === 1 ? '1 potential threat found' : 
             `${count} potential threats found`;
    }
    
    if (title === 'Security Status') {
      if (value === 'Protected') return 'Your network is secure';
      if (value === 'Scanning') return 'Analysis in progress';
      if (value.includes('Threats')) return 'Action recommended';
      return 'Check network status';
    }
    
    return '';
  };

  return (
    <div className={`${styles.background} rounded-lg shadow-md border ${styles.border} p-6 transition-all duration-300 hover:shadow-lg`}>
      <div className="flex justify-between items-start">
        <div>
          <h2 className={`text-sm font-medium ${styles.title}`}>{title}</h2>
          <p className={`text-2xl font-bold mt-2 ${styles.value}`}>{value}</p>
          <p className={`text-xs mt-1 ${styles.subtitle}`}>{generateSubtitle()}</p>
        </div>
        <div className={`p-3 rounded-full ${styles.background} ${styles.icon}`}>
          {icon}
        </div>
      </div>
      
      {/* Add animated progress bar for certain cards */}
      {(title === 'Security Status' && value === 'Scanning') && (
        <div className="mt-4 w-full h-1 bg-blue-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse rounded-full"></div>
        </div>
      )}
      
      {/* Add alert indicator for high threat cards */}
      {(title === 'Threats Detected' && parseInt(value) > 0) && (
        <div className="mt-4 flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping absolute"></span>
          <span className="w-2 h-2 bg-red-500 rounded-full relative"></span>
          <span className="ml-3 text-xs text-red-600">Action required</span>
        </div>
      )}
    </div>
  );
};

export default StatusCard;
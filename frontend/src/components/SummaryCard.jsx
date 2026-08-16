import React from 'react';

const SummaryCard = ({ title, value, icon, color }) => {
  return (
    <div className={`summary-card ${color || 'blue'}`}>
      <div className="summary-card-body">
        <div className="summary-card-info">
          <span className="summary-card-title">{title}</span>
          <h3 className="summary-card-value">{value}</h3>
        </div>
        <div className="summary-card-icon">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;

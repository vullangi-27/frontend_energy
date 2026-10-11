import React from 'react';

/**
 * Dashboard Component
 * Displays summary metrics: Total Appliances, Total Energy (kWh), and Total Cost (₹).
 */
function Dashboard({ appliances = [] }) {
  const safeAppliances = Array.isArray(appliances) ? appliances : [];

  // 1. Total number of appliances
  const totalCount = safeAppliances.length;

  // 2. Sum of energy consumed across all appliances
  const totalEnergy = safeAppliances.reduce(
    (sum, item) => sum + (Number(item.energyConsumed) || 0),
    0
  );

  // 3. Sum of estimated cost across all appliances
  const totalCost = safeAppliances.reduce(
    (sum, item) => sum + (Number(item.estimatedCost) || 0),
    0
  );

  return (
    <div className="dashboard-grid">
      <div className="stat-card card-appliances">
        <div className="stat-icon">🔌</div>
        <div className="stat-info">
          <span className="stat-label">Total Appliances</span>
          <h2 className="stat-value">{totalCount}</h2>
          <span className="stat-sub">Configured in system</span>
        </div>
      </div>

      <div className="stat-card card-energy">
        <div className="stat-icon">⚡</div>
        <div className="stat-info">
          <span className="stat-label">Total Energy</span>
          <h2 className="stat-value">{totalEnergy.toFixed(2)} <span className="unit">kWh</span></h2>
          <span className="stat-sub">Total energy consumed</span>
        </div>
      </div>

      <div className="stat-card card-cost">
        <div className="stat-icon">💰</div>
        <div className="stat-info">
          <span className="stat-label">Total Estimated Cost</span>
          <h2 className="stat-value">₹{totalCost.toFixed(2)}</h2>
          <span className="stat-sub">Estimated total bill</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

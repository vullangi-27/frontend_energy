import React from 'react';

/**
 * ApplianceList Component
 * Displays a clean tabular list of all saved electrical appliances.
 * Each row shows power, hours, days, calculated energy, cost, and Edit/Delete buttons.
 */
function ApplianceList({ appliances = [], onEdit, onDelete }) {
  const items = Array.isArray(appliances) ? appliances : [];

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💡</div>
        <h3>No Appliances Added Yet</h3>
        <p>Use the form above to add an appliance and monitor its energy usage & cost.</p>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-header">
        <h3>📋 Appliance Inventory & Energy Consumption</h3>
        <span className="table-badge">{items.length} items</span>
      </div>

      <div className="table-responsive">
        <table className="appliance-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Appliance Name</th>
              <th>Power (Watts)</th>
              <th>Hours / Day</th>
              <th>Days</th>
              <th>Rate (₹/kWh)</th>
              <th>Energy (kWh)</th>
              <th>Estimated Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appliances.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td className="appliance-name-cell">
                  <strong>{item.name}</strong>
                </td>
                <td>{item.powerWatts} W</td>
                <td>{item.hoursPerDay} hrs</td>
                <td>{item.daysUsed} days</td>
                <td>₹{item.electricityRate}</td>
                <td>
                  <span className="energy-badge">
                    {item.energyConsumed} kWh
                  </span>
                </td>
                <td>
                  <span className="cost-badge">
                    ₹{item.estimatedCost}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    className="action-btn edit-btn"
                    title="Edit Appliance"
                    onClick={() => onEdit(item)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="action-btn delete-btn"
                    title="Delete Appliance"
                    onClick={() => onDelete(item.id, item.name)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ApplianceList;

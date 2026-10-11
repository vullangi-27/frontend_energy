import React, { useState, useEffect } from 'react';

/**
 * ApplianceForm Component
 * Used to both ADD a new appliance and EDIT an existing appliance.
 * Features live calculation preview and input validation.
 */
function ApplianceForm({ onSave, editingAppliance, onCancelEdit }) {
  const [name, setName] = useState('');
  const [powerWatts, setPowerWatts] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('');
  const [daysUsed, setDaysUsed] = useState(30);
  const [electricityRate, setElectricityRate] = useState(8);
  const [errorMessage, setErrorMessage] = useState('');

  // When editingAppliance changes, populate the form
  useEffect(() => {
    if (editingAppliance) {
      setName(editingAppliance.name || '');
      setPowerWatts(editingAppliance.powerWatts || '');
      setHoursPerDay(editingAppliance.hoursPerDay || '');
      setDaysUsed(editingAppliance.daysUsed || 30);
      setElectricityRate(editingAppliance.electricityRate || 8);
      setErrorMessage('');
    } else {
      resetForm();
    }
  }, [editingAppliance]);

  const resetForm = () => {
    setName('');
    setPowerWatts('');
    setHoursPerDay('');
    setDaysUsed(30);
    setElectricityRate(8);
    setErrorMessage('');
  };

  // Live calculation preview
  const numPower = parseFloat(powerWatts) || 0;
  const numHours = parseFloat(hoursPerDay) || 0;
  const numDays = parseFloat(daysUsed) || 0;
  const numRate = parseFloat(electricityRate) || 0;

  const previewEnergy =
    numPower > 0 && numHours > 0 && numDays > 0
      ? ((numPower * numHours * numDays) / 1000).toFixed(2)
      : '0.00';

  const previewCost =
    numRate > 0 ? (parseFloat(previewEnergy) * numRate).toFixed(2) : '0.00';

  // Quick preset helper for viva demo
  const applyPreset = (presetName, watts, hours, days, rate) => {
    setName(presetName);
    setPowerWatts(watts);
    setHoursPerDay(hours);
    setDaysUsed(days);
    setElectricityRate(rate);
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // --- Validation Rules ---
    // 1. Name should not be empty
    if (!name.trim()) {
      setErrorMessage('Appliance name cannot be empty.');
      return;
    }

    // 2. Power should be greater than 0
    if (isNaN(numPower) || numPower <= 0) {
      setErrorMessage('Power in watts must be greater than 0.');
      return;
    }

    // 3. Hours should be between 0 and 24
    if (isNaN(numHours) || numHours <= 0 || numHours > 24) {
      setErrorMessage('Hours per day must be between 0 and 24.');
      return;
    }

    // 4. Days should be greater than 0
    if (isNaN(numDays) || numDays <= 0) {
      setErrorMessage('Number of days used must be greater than 0.');
      return;
    }

    // 5. Rate should be greater than 0
    if (isNaN(numRate) || numRate <= 0) {
      setErrorMessage('Electricity rate must be greater than 0.');
      return;
    }

    const applianceData = {
      name: name.trim(),
      powerWatts: numPower,
      hoursPerDay: numHours,
      daysUsed: parseInt(numDays, 10),
      electricityRate: numRate
    };

    onSave(applianceData);

    if (!editingAppliance) {
      resetForm();
    }
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <h3>{editingAppliance ? '✏️ Edit Appliance' : '➕ Add Electrical Appliance'}</h3>
        <p className="form-subtext">
          {editingAppliance
            ? 'Update the parameters to re-calculate energy consumption.'
            : 'Enter appliance specifications to estimate energy and cost.'}
        </p>
      </div>

      {/* Quick Demo Presets */}
      {!editingAppliance && (
        <div className="preset-bar">
          <span className="preset-label">Quick Presets:</span>
          <button
            type="button"
            className="preset-btn"
            onClick={() => applyPreset('Ceiling Fan', 75, 6, 30, 8)}
          >
            🌀 Fan (75W)
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => applyPreset('Refrigerator', 200, 24, 30, 8)}
          >
            ❄️ Refrigerator (200W)
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => applyPreset('Air Conditioner', 1500, 8, 30, 8)}
          >
            ❄️ AC (1.5kW)
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => applyPreset('LED TV', 100, 4, 30, 8)}
          >
            📺 Smart TV (100W)
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="error-alert">
          ⚠️ {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="appliance-name">Appliance Name *</label>
            <input
              id="appliance-name"
              type="text"
              placeholder="e.g. Ceiling Fan, AC, Refrigerator"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="power-watts">Power Rating (Watts) *</label>
            <input
              id="power-watts"
              type="number"
              step="any"
              min="1"
              placeholder="e.g. 75"
              value={powerWatts}
              onChange={(e) => setPowerWatts(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hours-per-day">Hours Used Per Day (0 - 24) *</label>
            <input
              id="hours-per-day"
              type="number"
              step="any"
              min="0.1"
              max="24"
              placeholder="e.g. 6"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="days-used">Days Used in Month *</label>
            <input
              id="days-used"
              type="number"
              min="1"
              max="365"
              placeholder="e.g. 30"
              value={daysUsed}
              onChange={(e) => setDaysUsed(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="electricity-rate">Electricity Rate (₹ / kWh) *</label>
            <input
              id="electricity-rate"
              type="number"
              step="any"
              min="0.1"
              placeholder="e.g. 8"
              value={electricityRate}
              onChange={(e) => setElectricityRate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="calc-preview-banner">
          <div className="preview-item">
            <span className="preview-label">Live Energy Preview:</span>
            <span className="preview-value">{previewEnergy} kWh</span>
          </div>
          <div className="preview-divider">|</div>
          <div className="preview-item">
            <span className="preview-label">Live Estimated Cost:</span>
            <span className="preview-value">₹{previewCost}</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" id="save-appliance-btn">
            {editingAppliance ? '💾 Update Appliance' : '➕ Calculate & Add Appliance'}
          </button>

          {editingAppliance && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancelEdit}
              id="cancel-edit-btn"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ApplianceForm;

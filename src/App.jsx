import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ApplianceForm from './components/ApplianceForm';
import ApplianceList from './components/ApplianceList';
import Auth from './components/Auth';
import './App.css';

// Base API URL for Spring Boot Backend
const BACKEND_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_URL = `${BACKEND_BASE}/api/appliances`;

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('energy_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [appliances, setAppliances] = useState([]);
  const [editingAppliance, setEditingAppliance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Fetch user-specific appliances whenever logged in
  useEffect(() => {
    const uid = currentUser?.userId || currentUser?.id;
    if (uid) {
      fetchAppliances(uid);
    } else {
      setAppliances([]);
    }
  }, [currentUser]);

  const showNotification = (text, type = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem('energy_user', JSON.stringify(userData));
    } catch (e) {
      console.error('Storage error:', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAppliances([]);
    setEditingAppliance(null);
    try {
      localStorage.removeItem('energy_user');
    } catch (e) {
      console.error('Storage error:', e);
    }
    showNotification('Logged out successfully.');
  };

  // GET: Fetch appliances belonging ONLY to the logged-in user
  const fetchAppliances = async (userId) => {
    const targetUserId = userId || currentUser?.userId || currentUser?.id;
    if (!targetUserId) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?userId=${targetUserId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch appliances from backend');
      }
      const data = await response.json();
      setAppliances(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('API Error:', error);
      showNotification('Cannot connect to backend (port 8080). Make sure Spring Boot is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // POST: Add new appliance OR PUT: Update existing appliance with userId attached
  const handleSaveAppliance = async (applianceData) => {
    const uid = currentUser?.userId || currentUser?.id;
    if (!uid) {
      showNotification('Please sign in first.', 'error');
      return;
    }

    try {
      const payload = {
        ...applianceData,
        userId: uid
      };

      if (editingAppliance) {
        // PUT /api/appliances/{id}
        const response = await fetch(`${API_URL}/${editingAppliance.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || 'Failed to update appliance');
        }

        const updated = await response.json();
        setAppliances((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        setEditingAppliance(null);
        showNotification(`Appliance "${updated.name}" updated successfully!`);
      } else {
        // POST /api/appliances
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || 'Failed to save appliance');
        }

        const created = await response.json();
        setAppliances((prev) => [...prev, created]);
        showNotification(`Appliance "${created.name}" added successfully!`);
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification(error.message, 'error');
    }
  };

  // DELETE: Remove appliance by ID
  const handleDeleteAppliance = async (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete appliance');
      }

      setAppliances((prev) => prev.filter((item) => item.id !== id));
      if (editingAppliance && editingAppliance.id === id) {
        setEditingAppliance(null);
      }
      showNotification(`Appliance "${name}" deleted successfully!`);
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Error deleting appliance.', 'error');
    }
  };

  // Set editing mode
  const handleEditSelect = (appliance) => {
    setEditingAppliance(appliance);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingAppliance(null);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-logo">⚡</span>
          <div>
            <h1>Smart Energy Consumption Management System</h1>
            <p className="header-subtitle">
              {currentUser
                ? `Personalized Energy Tracker for ${currentUser.fullName || currentUser.username}`
                : 'Monitor, Calculate & Optimize Energy Usage'}
            </p>
          </div>
        </div>

        {currentUser && (
          <div className="header-user-actions">
            <div className="user-profile-badge">
              <span className="user-avatar">👤</span>
              <div className="user-info">
                <span className="user-name">{currentUser.fullName || currentUser.username}</span>
                <span className="user-role">{currentUser.role || 'USER'}</span>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout} title="Sign Out">
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Notification Toast */}
      {statusMessage && (
        <div className={`toast-message ${statusMessage.type}`}>
          {statusMessage.type === 'success' ? '✅' : '⚠️'} {statusMessage.text}
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {!currentUser ? (
          // Auth Screen (Login / Register)
          <Auth
            onLoginSuccess={handleLoginSuccess}
            showNotification={showNotification}
          />
        ) : (
          // Authenticated User's Personal Dashboard & Appliance Manager
          <>
            {/* 1. Dashboard Section */}
            <section className="section">
              <Dashboard appliances={appliances} />
            </section>

            {/* 2. Add / Edit Form Section */}
            <section className="section">
              <ApplianceForm
                onSave={handleSaveAppliance}
                editingAppliance={editingAppliance}
                onCancelEdit={handleCancelEdit}
              />
            </section>

            {/* 3. Appliance List Section */}
            <section className="section">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading your appliances...</p>
                </div>
              ) : (
                <ApplianceList
                  appliances={appliances}
                  onEdit={handleEditSelect}
                  onDelete={handleDeleteAppliance}
                />
              )}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Smart Energy Consumption Management System</p>
      </footer>
    </div>
  );
}

export default App;

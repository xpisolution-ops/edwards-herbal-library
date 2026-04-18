import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { herbs } from '../data/herbs';
import { Unlock, ShieldCheck, Bookmark, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  const { user, purchasedRemedies, loading } = useContext(UserContext);
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    // Check if we just returned from a successful Stripe checkout
    const query = new URLSearchParams(location.search);
    if (query.get('session_id')) {
      setSuccessMessage(true);
      // Remove query param from URL without refreshing
      window.history.replaceState({}, document.title, "/dashboard");
      
      // Hide message after 5 seconds
      setTimeout(() => setSuccessMessage(false), 5000);
    }
  }, [location]);

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>Loading your library...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Use the local mock db or the generated db
  const unlockedHerbs = herbs.filter(herb => purchasedRemedies.includes(herb.id));

  return (
    <div className="container">
      {successMessage && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={20} />
          Payment successful! Your new remedy has been unlocked below.
        </div>
      )}

      <div className="dashboard-header">
        <h1>My Herbal Library</h1>
        <p>Welcome back, {user.email}. Here are your permanently unlocked remedies.</p>
      </div>

      {unlockedHerbs.length === 0 ? (
        <div className="empty-state">
          <Bookmark size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
          <h3>No remedies unlocked yet</h3>
          <p>Go to the home page to search for symptoms and unlock natural remedies.</p>
        </div>
      ) : (
        <div className="remedy-grid">
          {unlockedHerbs.map(herb => (
            <div key={herb.id} className="remedy-card" style={{ borderTop: '4px solid var(--secondary-color)' }}>
              <div className="card-img-container" style={{ height: '150px' }}>
                <span className="card-badge">{herb.symptom}</span>
                <img src={herb.image} alt={herb.name} className="card-img" />
              </div>
              <div className="card-content">
                <h3 className="card-title">{herb.name}</h3>
                <p className="card-desc">{herb.description}</p>
                
                <div className="unlocked-content" style={{ marginTop: 'auto' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Unlock size={18} color="var(--secondary-color)" />
                    Preparation & Dosage
                  </h4>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{herb.preparation}</p>
                  <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#B22222', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <ShieldCheck size={16} /> Warnings
                    </strong>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>{herb.warnings}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

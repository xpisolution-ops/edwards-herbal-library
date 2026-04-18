import React, { useState, useContext } from 'react';
import { Search, LockKeyhole, Unlock, ShieldCheck } from 'lucide-react';
import { herbs } from '../data/herbs';
import { UserContext } from '../context/UserContext';
import CheckoutModal from '../components/CheckoutModal';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRemedy, setSelectedRemedy] = useState(null);
  const { user, hasPurchased } = useContext(UserContext);
  const navigate = useNavigate();

  const filteredHerbs = herbs.filter(herb => 
    herb.symptom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    herb.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUnlockClick = (remedy) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedRemedy(remedy);
  };

  return (
    <div className="container">
      <section className="hero">
        <h1>Discover Nature's Healing Power</h1>
        <p>Search your symptoms and unlock detailed, step-by-step natural remedies curated by master herbalists.</p>
        
        <div className="search-container">
          <Search className="search-icon" size={24} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search for a symptom (e.g., headache, anxiety, nausea)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section className="remedy-grid">
        {filteredHerbs.map(herb => {
          const unlocked = user && hasPurchased(herb.id);
          
          return (
            <div key={herb.id} className="remedy-card">
              <div className="card-img-container">
                <span className="card-badge">{herb.symptom}</span>
                <img src={herb.image} alt={herb.name} className="card-img" />
              </div>
              <div className="card-content">
                <h3 className="card-title">{herb.name}</h3>
                <p className="card-desc">{herb.description}</p>
                
                {unlocked ? (
                  <div className="unlocked-content">
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
                ) : (
                  <div className="locked-content">
                    <LockKeyhole size={24} color="#888" style={{ marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                      Detailed preparation instructions, exact dosages, and safety warnings are locked.
                    </p>
                    <button 
                      className="btn-primary" 
                      style={{ width: '100%' }}
                      onClick={() => handleUnlockClick(herb)}
                    >
                      Unlock for $0.99
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {filteredHerbs.length === 0 && (
        <div className="empty-state">
          <h3>No remedies found</h3>
          <p>Try searching for a different symptom or herb.</p>
        </div>
      )}

      {selectedRemedy && (
        <CheckoutModal 
          remedy={selectedRemedy} 
          onClose={() => setSelectedRemedy(null)} 
        />
      )}
    </div>
  );
};

export default Home;

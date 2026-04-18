import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { CreditCard, Lock, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutModal = ({ remedy, onClose }) => {
  const { user } = useContext(UserContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      const stripe = await stripePromise;

      // Call our backend to create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          remedyId: remedy.id,
          remedyName: remedy.name,
          userId: user.id
        }),
      });

      const session = await response.json();

      if (session.error) {
        throw new Error(session.error);
      }

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong during checkout.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {!isProcessing && (
          <button className="close-modal" onClick={() => onClose(false)}><X /></button>
        )}
        
        <div className="checkout-header">
          <Lock size={32} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
          <h2>Unlock Full Remedy</h2>
          <p>Secure checkout via Stripe for {remedy.name}</p>
          <div className="price-tag">$0.99</div>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div className="payment-form">
          <button 
            className="btn-pay" 
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Redirecting to Stripe...' : (
              <>
                <CreditCard size={18} />
                Pay $0.99 & Unlock
              </>
            )}
          </button>
          
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#888', marginTop: '1rem' }}>
            Payments are securely processed by Stripe.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;

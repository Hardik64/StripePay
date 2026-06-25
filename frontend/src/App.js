import './App.css';
import { useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';

function App() {
  const [product] = useState({
    name: "Pro Plan",
    price: 10,
    description: "Full access to all premium features"
  });

  const [paymentStatus, setPaymentStatus] = useState(null); // null | 'processing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const makePayment = (token) => {
    setPaymentStatus('processing');
    setErrorMessage('');

    const body = { token, product };
    const headers = { "Content-Type": "application/json" };

    return fetch('http://localhost:3000/payment', {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setPaymentStatus('error');
          setErrorMessage(data.error);
        } else {
          setPaymentStatus('success');
        }
      })
      .catch(error => {
        console.error(error);
        setPaymentStatus('error');
        setErrorMessage('Something went wrong. Please try again.');
      });
  };

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">S</div>
          <span className="navbar-title">StripePay</span>
        </div>
        <div className="navbar-badge">
          <span className="navbar-badge-dot"></span>
          Test Mode
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="checkout-container">
          <div className="product-card">
            {/* Card Header */}
            <div className="card-header">
              <span className="card-label">Checkout</span>
              <span className="card-secure-badge">
                <span className="lock-icon">🔒</span>
                Secured by Stripe
              </span>
            </div>

            {/* Product Info */}
            <div className="product-info">
              <div className="product-icon">⚡</div>
              <h1 className="product-name">{product.name}</h1>
              <p className="product-description">{product.description}</p>
            </div>

            {/* Price Breakdown */}
            <div className="price-section">
              <div className="price-row">
                <span className="price-label">{product.name}</span>
                <span className="price-value">${product.price.toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span className="price-label">Processing fee</span>
                <span className="price-value">$0.00</span>
              </div>
              <div className="price-row price-row-total">
                <span className="price-label">Total</span>
                <span className="price-value">${product.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Stripe Checkout Button */}
            <StripeCheckout
              stripeKey={process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY}
              token={makePayment}
              name="StripePay Checkout"
              description={product.name}
              amount={product.price * 100}
              currency="USD"
              panelLabel="Pay {{amount}}"
            >
              <button className="pay-button" disabled={paymentStatus === 'processing'}>
                {paymentStatus === 'processing' ? 'Processing...' : `Pay $${product.price.toFixed(2)}`}
              </button>
            </StripeCheckout>

            {/* Payment Status */}
            {paymentStatus === 'processing' && (
              <div className="payment-status processing">
                <div className="spinner"></div>
                Processing your payment...
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="payment-status success">
                <span className="status-icon">✅</span>
                Payment successful! Thank you for your purchase.
              </div>
            )}

            {paymentStatus === 'error' && (
              <div className="payment-status error">
                <span className="status-icon">❌</span>
                {errorMessage || 'Payment failed. Please try again.'}
              </div>
            )}

            {/* Trust Badges */}
            <div className="trust-section">
              <div className="trust-badge">
                <span className="trust-icon">🔐</span>
                SSL Encrypted
              </div>
              <div className="trust-badge">
                <span className="trust-icon">💳</span>
                Secure Checkout
              </div>
              <div className="trust-badge">
                <span className="trust-icon">🛡️</span>
                Money-back Guarantee
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">
          Powered by{' '}
          <a href="https://stripe.com" className="footer-link" target="_blank" rel="noopener noreferrer">
            Stripe
          </a>
          {' '}• Secure payments
        </p>
      </footer>
    </div>
  );
}

export default App;

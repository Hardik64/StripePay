# StripePay 💳

A full-stack payment integration project built to learn and understand how **Stripe** processes payments. This project demonstrates a complete checkout flow using Stripe's API — from collecting card details on the frontend to creating charges on the backend.

> **Note:** This project was built purely for learning purposes. It uses Stripe's **test mode**, so no real transactions are processed.

---

## How the Payment Flow Works

Here's a step-by-step breakdown of how a payment moves through the system:

```
┌──────────────────────────────────────────────────────────────────────┐
│                        PAYMENT FLOW                                  │
│                                                                      │
│   Customer          Frontend (React)         Backend (Node.js)       │
│      │                    │                        │                  │
│      │  1. Clicks "Pay"   │                        │                  │
│      │ ──────────────────>│                        │                  │
│      │                    │                        │                  │
│      │  2. Stripe Checkout│                        │                  │
│      │     modal opens    │                        │                  │
│      │ <──────────────────│                        │                  │
│      │                    │                        │                  │
│      │  3. Enters card    │                        │                  │
│      │     details        │                        │                  │
│      │ ──────────────────>│                        │                  │
│      │                    │                        │                  │
│      │                    │  4. Sends token +      │                  │
│      │                    │     product info       │                  │
│      │                    │ ──────────────────────>│                  │
│      │                    │                        │                  │
│      │                    │                 5. Creates Stripe         │
│      │                    │                    Customer               │
│      │                    │                        │                  │
│      │                    │                 6. Creates Charge         │
│      │                    │                    (with idempotency)     │
│      │                    │                        │                  │
│      │                    │  7. Returns charge     │                  │
│      │                    │     result             │                  │
│      │                    │ <──────────────────────│                  │
│      │                    │                        │                  │
│      │  8. Shows success  │                        │                  │
│      │     or error       │                        │                  │
│      │ <──────────────────│                        │                  │
│      │                    │                        │                  │
└──────────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Explanation

#### 1. Customer Clicks "Pay"
The user sees a product card displaying the **Pro Plan ($10.00)** and clicks the pay button.

#### 2. Stripe Checkout Modal Opens
The `react-stripe-checkout` library opens Stripe's pre-built, secure checkout modal. This modal is hosted by Stripe — card details **never touch our servers**.

#### 3. Customer Enters Card Details
The customer enters their email, card number, expiry, and CVC directly into Stripe's modal. Stripe validates the card and **tokenizes** it — converting sensitive card data into a safe, one-time-use token.

#### 4. Token Sent to Backend
The frontend receives the token from Stripe and sends it to our backend (`POST /payment`) along with the product details (name, price). The token contains:
- A unique token ID (e.g., `tok_xxx`)
- Customer's email
- Card metadata (last 4 digits, country — **not** the full card number)

#### 5. Backend Creates a Stripe Customer
Using the Stripe Node.js SDK, the backend creates a **Customer** object in Stripe:
```js
const customer = await stripe.customers.create({
    email: token.email,
    source: token.id   // the tokenized card
});
```
This associates the payment source (card) with a customer record in Stripe's system.

#### 6. Backend Creates a Charge
A **Charge** is created against the customer with an **idempotency key** (using UUID) to prevent duplicate charges if the request is accidentally sent twice:
```js
const charge = await stripe.charges.create({
    amount: product.price * 100,  // Stripe uses cents
    currency: 'usd',
    customer: customer.id,
    receipt_email: token.email,
    description: `Purchased the ${product.name}`,
    shipping: {
        name: token.card.name,
        address: { country: token.card.address_country }
    }
}, { idempotencyKey });
```

#### 7. Backend Returns Result
The charge result (success or failure) is sent back to the frontend as a JSON response.

#### 8. Frontend Shows Status
Based on the response, the UI updates to show:
- ✅ **Success** — "Payment successful! Thank you for your purchase."
- ❌ **Error** — The specific error message from Stripe.
- ⏳ **Processing** — A spinner while waiting for the backend response.

---

## Key Concepts Learned

| Concept | Description |
|---|---|
| **Tokenization** | Card details are converted to a secure token by Stripe — sensitive data never reaches our server |
| **Idempotency Keys** | Prevents duplicate charges if a request is retried (e.g., due to network issues) |
| **Customer Creation** | Stripe stores customer records, enabling features like saved cards and recurring billing |
| **Charges API** | The core API to actually charge a customer's card |
| **Test Mode** | Stripe provides test API keys and fake card numbers for safe development |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, react-stripe-checkout |
| **Backend** | Node.js, Express 5 |
| **Payments** | Stripe API (Node SDK) |
| **Other** | dotenv, cors, uuid |

---

## Project Structure

```
StripePay/
├── backend/
│   ├── index.js          # Express server with /payment endpoint
│   ├── package.json
│   └── .env              # STRIPE_SECRET_KEY (not committed)
├── frontend/
│   ├── src/
│   │   ├── App.js        # React checkout UI
│   │   ├── App.css       # Styling
│   │   └── index.js      # React entry point
│   ├── package.json
│   └── .env              # REACT_APP_STRIPE_PUBLISHABLE_KEY (not committed)
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js installed
- A [Stripe account](https://dashboard.stripe.com/register) (free to create)

### 1. Clone the repo
```bash
git clone https://github.com/Hardik64/StripePay.git
cd StripePay
```

### 2. Set up environment variables

**Backend** — create `backend/.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

**Frontend** — create `frontend/.env`:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

> Get your test keys from the [Stripe Dashboard → API Keys](https://dashboard.stripe.com/test/apikeys).

### 3. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Run the app
```bash
# Terminal 1 — Start backend (port 3000)
cd backend
npm run dev

# Terminal 2 — Start frontend (port 3001)
cd frontend
npm start
```

### 5. Test with Stripe's test card
| Field | Value |
|---|---|
| Card Number | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |

---

## ⚠️ Important Notes

- This project uses Stripe's **test mode** — no real money is charged.
- **Never commit your `.env` files** — they contain your secret Stripe API keys.
- The Charges API used here is Stripe's legacy approach. For production apps, Stripe recommends the newer [Payment Intents API](https://docs.stripe.com/payments/payment-intents).

---

## License

This project is for educational purposes only.

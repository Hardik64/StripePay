require('dotenv').config();
const cors = require('cors');
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const uuid = require('uuid').v4;

const app = express();
//middleware
app.use(express.json());
app.use(cors());

//routes
app.get('/', (req, res) => {
    res.send("Hello World");
});

app.post('/payment', async (req, res) => {
    const { product, token } = req.body;
    console.log('PRODUCT', product);
    console.log('PRICE', product.price);
    console.log('TOKEN EMAIL', token.email);
    console.log('TOKEN ID', token.id);
    const idempotencyKey = uuid();

    try {
        // Step 1: Create a Stripe customer
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        });
        console.log('CUSTOMER CREATED', customer.id);

        // Step 2: Create a charge
        const charge = await stripe.charges.create({
            amount: product.price * 100,
            currency: 'usd',
            customer: customer.id,
            receipt_email: token.email,
            description: `Purchased the ${product.name}`,
            shipping: {
                name: token.card.name,
                address: {
                    country: token.card.address_country
                }
            }
        }, {idempotencyKey});
        console.log('CHARGE CREATED', charge.id, 'STATUS', charge.status);

        res.status(200).json(charge);
    } catch (err) {
        console.error('PAYMENT ERROR:', err.type, err.message);
        console.error('FULL ERROR:', JSON.stringify(err, null, 2));
        res.status(500).json({ error: err.message });
    }
});

//listen
app.listen(3000, () => {
    console.log('Server running on port 3000');
    console.log('Stripe key loaded:', process.env.STRIPE_SECRET_KEY ? 'YES (starts with ' + process.env.STRIPE_SECRET_KEY.substring(0, 7) + '...)' : 'NO - KEY MISSING!');
});
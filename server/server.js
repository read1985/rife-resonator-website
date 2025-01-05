require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Create Payment Intent
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, items } = req.body;

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                order_items: JSON.stringify(items.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity
                })))
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Webhook handler for asynchronous events
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            // Handle successful payment
            console.log('Payment succeeded:', paymentIntent.id);
            // Here you would typically:
            // 1. Update order status in your database
            // 2. Send confirmation email to customer
            // 3. Update inventory
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            // Handle failed payment
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 
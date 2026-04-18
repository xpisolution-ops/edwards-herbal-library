import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use service role key if available for backend, otherwise anon key (less secure for backend DB writes but works for prototype)
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

// Use raw body for Stripe Webhooks
app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    // Note: To test webhooks locally, you'd need the Stripe CLI and the endpoint secret
    // For this prototype without a webhook secret, we'll just parse the body
    // event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    event = JSON.parse(request.body);
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const remedyId = session.metadata.remedyId;

    try {
      // Fulfill the purchase...
      const { error } = await supabase
        .from('purchases')
        .insert([{ user_id: userId, remedy_id: remedyId }]);

      if (error) {
        console.error('Error inserting into Supabase:', error);
      } else {
        console.log(`Successfully unlocked remedy ${remedyId} for user ${userId}`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  response.send();
});

// Use JSON body parser for all other routes
app.use(express.json());
app.use(cors());

app.post('/create-checkout-session', async (req, res) => {
  const { remedyId, remedyName, userId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Unlock: ${remedyName}`,
              description: 'Lifetime access to detailed preparation and dosage instructions.',
            },
            unit_amount: 99, // $0.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // The frontend URL
      success_url: `http://localhost:5173/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/`,
      metadata: {
        userId: userId,
        remedyId: remedyId,
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));

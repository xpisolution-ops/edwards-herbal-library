import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // In production, YOU MUST use STRIPE_WEBHOOK_SECRET
    // event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    // For this prototype we will parse the raw buffer assuming it's JSON
    event = JSON.parse(buf.toString());
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const remedyId = session.metadata.remedyId;

    try {
      await supabase
        .from('purchases')
        .insert([{ user_id: userId, remedy_id: remedyId }]);
    } catch (err) {
      console.error(err);
    }
  }

  res.status(200).send();
}

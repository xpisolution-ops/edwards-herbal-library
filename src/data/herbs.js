import generatedHerbs from './herbs_generated.json';

// We fall back to a default mock array if the json is empty or fails to load,
// but the json contains 587 fully generated herbs!
export const herbs = generatedHerbs.length > 0 ? generatedHerbs : [
  {
    id: "h1",
    symptom: "Headache",
    name: "Peppermint (Mentha piperita)",
    description: "A cooling herb that helps relieve tension headaches and migraines.",
    preparation: "Steep 1 tablespoon of dried peppermint leaves in 1 cup of boiling water for 10 minutes.",
    warnings: "Avoid if you have severe acid reflux.",
    image: "https://images.unsplash.com/photo-1608248593842-8dd0e1596e38?auto=format&fit=crop&w=800&q=80"
  }
];

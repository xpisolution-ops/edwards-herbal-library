import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../src/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const outputFile = path.join(dataDir, 'herbs_generated.json');
const TARGET_COUNT = 1000;
const OPENROUTER_API_KEY = "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";

async function loadExistingHerbs() {
  try {
    if (fs.existsSync(outputFile)) {
      const data = fs.readFileSync(outputFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading file:", e);
  }
  return [];
}

function saveHerbs(herbs) {
  fs.writeFileSync(outputFile, JSON.stringify(herbs, null, 2), 'utf8');
  console.log(`Saved ${herbs.length} herbs to file.`);
}

async function fetchBatch(existingCount) {
  const prompt = `You are an expert herbalist. Generate a JSON array of 10 unique herbal remedies. 
The items must be completely unique and different from common ones. DO NOT output markdown, ONLY output the raw JSON array.
Each object must have the following exact structure:
{
  "id": "gen_${existingCount}_" + random_string,
  "symptom": "Name of the symptom (e.g., Joint Pain)",
  "name": "Common Name (Scientific Name)",
  "description": "2-3 sentences explaining how it helps.",
  "preparation": "Specific instructions on how to prepare and dose it.",
  "warnings": "Any contraindications or warnings.",
  "image": "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=800&q=80"
}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "Edwards Herbal Library"
    },
    body: JSON.stringify({
      model: "anthropic/claude-3-haiku",
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("API Error Response:", errText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = await response.json();
  const content = json.choices[0].message.content.trim();
  
  // Clean up potential markdown formatting if the AI disobeys
  let cleanContent = content;
  if (cleanContent.startsWith('\`\`\`json')) {
    cleanContent = cleanContent.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '');
  }
  
  return JSON.parse(cleanContent);
}

async function run() {
  console.log("Starting herbal generation process...");
  let herbs = await loadExistingHerbs();
  
  while (herbs.length < TARGET_COUNT) {
    console.log(`Currently have ${herbs.length} herbs. Fetching batch of 10...`);
    try {
      const newBatch = await fetchBatch(herbs.length);
      
      // Ensure unique IDs
      const mappedBatch = newBatch.map((h, i) => ({
        ...h,
        id: `gen_${Date.now()}_${i}`
      }));
      
      herbs = [...herbs, ...mappedBatch];
      saveHerbs(herbs);
      
      // Wait to avoid rate limits
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.error("Error generating batch, retrying in 5s...", e);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  
  console.log("Finished generating 1000 herbs!");
}

run();

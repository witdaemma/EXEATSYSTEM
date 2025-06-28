import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const googleApiKey = process.env.GOOGLE_API_KEY;

if (!googleApiKey) {
  // Log a warning during build/startup instead of throwing a hard error.
  // This allows the server to start, but AI-dependent calls will fail gracefully within the flows.
  console.warn(
    'WARNING: GOOGLE_API_KEY is not set. Genkit-dependent features may not work. Please set this in your .env file or hosting provider configuration.'
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: googleApiKey, // Pass the variable, which might be undefined
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});

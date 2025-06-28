import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

if (!process.env.GOOGLE_API_KEY) {
  // This error will be thrown during build time or server startup if the key is missing.
  // It's a safeguard to ensure the application is configured correctly for deployment.
  throw new Error(
    'GOOGLE_API_KEY is not set in the environment variables. Please add it to your .env file or hosting provider configuration.'
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});

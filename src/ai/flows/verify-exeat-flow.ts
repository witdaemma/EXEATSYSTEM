
'use server';
/**
 * @fileOverview A secure flow for verifying exeat requests.
 *
 * - verifyExeat - A function that fetches exeat details by its ID.
 */

import { ai } from '@/ai/genkit';
import { getExeatRequestById } from '@/lib/mockApi';
import { z } from 'zod';

// This schema defines the structure of a single comment in the approval trail.
const ExeatCommentSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  role: z.enum(["student", "porter", "hod", "dsa"]),
  comment: z.string(),
  timestamp: z.string(),
  action: z.enum(["Approved", "Declined", "Rejected", "Commented", "Submitted"]),
});

// This schema represents the data structure of an exeat request.
const ExeatRequestDataSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  matricNumber: z.string(),
  purpose: z.string(),
  departureDate: z.string(),
  returnDate: z.string(),
  contactInfo: z.string(),
  consentFormUrl: z.string().optional(),
  status: z.enum(["Pending", "Hold", "Approved", "Rejected"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  approvalTrail: z.array(ExeatCommentSchema),
  approvalTrailUserIds: z.array(z.string()),
  currentStage: z.enum(["student", "porter", "hod", "dsa", "Completed"]),
}).nullable(); // Use .nullable() to handle cases where an exeat is not found.


// A new output schema that can handle success or a specific error message.
// This allows us to return a meaningful error from the server instead of a generic 500.
const VerifyExeatOutputSchema = z.object({
  data: ExeatRequestDataSchema.optional(),
  error: z.string().optional(),
});
export type VerifyExeatOutput = z.infer<typeof VerifyExeatOutputSchema>;


const VerifyExeatInputSchema = z.object({
  exeatId: z.string().min(1, { message: "Exeat ID is required." }),
});
export type VerifyExeatInput = z.infer<typeof VerifyExeatInputSchema>;


/**
 * The main exported function that client components will call.
 * This function acts as a wrapper for the underlying Genkit flow.
 * @param input - An object containing the exeatId to verify.
 * @returns An object with either exeat details or an error message.
 */
export async function verifyExeat(
  input: VerifyExeatInput
): Promise<VerifyExeatOutput> {
  return verifyExeatFlow(input);
}

// The Genkit flow definition. It is NOT exported.
const verifyExeatFlow = ai.defineFlow(
  {
    name: 'verifyExeatFlow',
    inputSchema: VerifyExeatInputSchema,
    outputSchema: VerifyExeatOutputSchema,
  },
  async (input) => {
    // This is the crucial check. We verify the environment variable on the server.
    // This flow is wrapped by Genkit, which needs the key, even if this specific flow doesn't make an AI call.
    if (!process.env.GOOGLE_API_KEY) {
      return { 
        error: "Server Configuration Error: The GOOGLE_API_KEY is missing on the deployed site. Please add it to your hosting provider's environment variables (e.g., in the Netlify UI) and trigger a new deploy." 
      };
    }
    
    try {
      const exeatDetails = await getExeatRequestById(input.exeatId);
      // Return the details, or null if nothing was found.
      return { data: exeatDetails || null };
    } catch (e) {
        console.error("Error in verifyExeatFlow fetching from database:", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return { error: `An unexpected error occurred while fetching the exeat record from the database: ${errorMessage}` };
    }
  }
);

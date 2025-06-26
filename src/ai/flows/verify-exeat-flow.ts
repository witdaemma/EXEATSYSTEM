
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
// It is NOT exported, as it's only used internally by the flow.
const ExeatCommentSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  role: z.enum(["student", "porter", "hod", "dsa"]),
  comment: z.string(),
  timestamp: z.string(),
  action: z.enum(["Approved", "Declined", "Rejected", "Commented", "Submitted"]),
});

// This schema represents the data structure of an exeat request returned to the client.
// It must match the `ExeatRequest` type from `lib/types.ts`.
// It is NOT exported. It's used to validate the output of the Genkit flow.
const VerifyExeatOutputSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  matricNumber: z.string(),
  purpose: z.string(),
  departureDate: z.string(),
  returnDate: z.string(),
  contactInfo: z.string(),
  status: z.enum(["Pending", "Hold", "Approved", "Rejected"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  approvalTrail: z.array(ExeatCommentSchema),
  approvalTrailUserIds: z.array(z.string()),
  currentStage: z.enum(["student", "porter", "hod", "dsa", "Completed"]),
}).nullable(); // Use .nullable() to handle cases where an exeat is not found.

// This schema defines the expected input for the verification flow.
// It is NOT exported.
const VerifyExeatInputSchema = z.object({
  exeatId: z.string().min(1, { message: "Exeat ID is required." }),
});


/**
 * The main exported function that client components will call.
 * This function acts as a wrapper for the underlying Genkit flow.
 * @param input - An object containing the exeatId to verify.
 * @returns The exeat details if found, otherwise null.
 */
export async function verifyExeat(
  input: z.infer<typeof VerifyExeatInputSchema>
): Promise<z.infer<typeof VerifyExeatOutputSchema>> {
  return verifyExeatFlow(input);
}

// The Genkit flow definition. It is NOT exported.
// This flow runs on the server and can securely access the database.
const verifyExeatFlow = ai.defineFlow(
  {
    name: 'verifyExeatFlow',
    inputSchema: VerifyExeatInputSchema,
    outputSchema: VerifyExeatOutputSchema,
  },
  async (input) => {
    // Calling the mockApi function, which has direct database access.
    const exeatDetails = await getExeatRequestById(input.exeatId);
    
    // Return the details, or null if nothing was found.
    // Genkit will automatically validate this output against VerifyExeatOutputSchema.
    return exeatDetails || null;
  }
);

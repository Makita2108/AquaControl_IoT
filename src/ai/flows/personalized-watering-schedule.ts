'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a personalized watering schedule based on sensor readings,
 * soil moisture, time of day, and weather forecasts.
 *
 * The flow takes sensor readings and other relevant data as input and uses an AI tool to determine an optimal watering schedule.
 * It exports:
 * - `generatePersonalizedWateringSchedule`: The main function to trigger the flow.
 * - `PersonalizedWateringScheduleInput`: The TypeScript type for the input schema.
 * - `PersonalizedWateringScheduleOutput`: The TypeScript type for the output schema.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const PersonalizedWateringScheduleInputSchema = z.object({
  soilMoisture: z.number().describe('The current soil moisture level (percentage).'),
  timeOfDay: z.string().describe('The current time of day (e.g., morning, afternoon, evening).'),
  weatherForecast: z.string().describe('A brief weather forecast for the next few days.'),
  plantType: z.string().describe('The type of plant (e.g., tomato, rose, lettuce).'),
  location: z.string().describe('The location of the plant.').optional(),
});
export type PersonalizedWateringScheduleInput = z.infer<typeof PersonalizedWateringScheduleInputSchema>;

// Define the output schema
const PersonalizedWateringScheduleOutputSchema = z.object({
  wateringSchedule: z.string().describe('A personalized watering schedule (e.g., Water every other day in the morning).'),
});
export type PersonalizedWateringScheduleOutput = z.infer<typeof PersonalizedWateringScheduleOutputSchema>;

// Define the tool to generate the watering schedule
const generateWateringScheduleTool = ai.defineTool(
  {
    name: 'generateWateringSchedule',
    description: 'Generates a personalized watering schedule based on sensor readings, soil moisture, time of day, weather forecasts and plant type.',
    inputSchema: PersonalizedWateringScheduleInputSchema,
    outputSchema: PersonalizedWateringScheduleOutputSchema,
  },
  async (input) => {
    // This tool uses a prompt to generate the watering schedule.  It does not directly implement the schedule generation.
    const {output} = await wateringSchedulePrompt(input);
    return output!;
  }
);

// Define the prompt
const wateringSchedulePrompt = ai.definePrompt({
  name: 'wateringSchedulePrompt',
  input: {schema: PersonalizedWateringScheduleInputSchema},
  output: {schema: PersonalizedWateringScheduleOutputSchema},
  prompt: `You are an expert gardening assistant.  Based on the following information, create a personalized watering schedule for the plant:

Soil Moisture: {{soilMoisture}}%
Time of Day: {{timeOfDay}}
Weather Forecast: {{weatherForecast}}
Plant Type: {{plantType}}

Watering Schedule: `,
});

// Define the flow
const personalizedWateringScheduleFlow = ai.defineFlow(
  {
    name: 'personalizedWateringScheduleFlow',
    inputSchema: PersonalizedWateringScheduleInputSchema,
    outputSchema: PersonalizedWateringScheduleOutputSchema,
  },
  async input => {
    const {output} = await generateWateringScheduleTool(input);
    return output!;
  }
);

/**
 * Generates a personalized watering schedule based on sensor readings, soil moisture, time of day, and weather forecasts.
 *
 * @param input - The input parameters for generating the watering schedule.
 * @returns A promise that resolves to the generated watering schedule.
 */
export async function generatePersonalizedWateringSchedule(
  input: PersonalizedWateringScheduleInput
): Promise<PersonalizedWateringScheduleOutput> {
  return personalizedWateringScheduleFlow(input);
}

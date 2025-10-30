"use server";

import { generatePersonalizedWateringSchedule, PersonalizedWateringScheduleInput } from "@/ai/flows/personalized-watering-schedule";

export async function getWateringSchedule(input: PersonalizedWateringScheduleInput) {
  try {
    const result = await generatePersonalizedWateringSchedule(input);
    return { success: true, schedule: result.wateringSchedule };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate watering schedule." };
  }
}

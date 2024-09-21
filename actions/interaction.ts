"use server";

import { db } from "@/db/db"; // Importing Prisma's db client
import { ViewQuestionParams } from "./shared.types";

export async function viewQuestion(params: ViewQuestionParams) {
  try {
    const { questionId, userId } = params;

    // Update view count for the question
    await db.question.update({
      where: { id: questionId },
      data: { views: { increment: 1 } }, // Increment the views by 1
    });

    if (userId) {
      // Check if the interaction already exists
      const existingInteraction = await db.interaction.findFirst({
        where: {
          userId,
          action: "view",
          questionId,
        },
      });

      if (existingInteraction) {
        return console.log("User has already viewed.");
      }

      // Create a new interaction record
      await db.interaction.create({
        data: {
          userId,
          action: "view",
          questionId,
        },
      });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

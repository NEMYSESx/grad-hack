import { db } from "@/db/db"; // Use your db connection
import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";

export async function createAnswer(params: CreateAnswerParams) {
  try {
    const { content, author, question, path } = params;

    const newAnswer = await db.answer.create({
      data: {
        content,
        author: { connect: { id: author } },
        question: { connect: { id: question } },
      },
    });

    // Update the question to include the new answer
    await db.question.update({
      where: { id: question },
      data: { answers: { connect: { id: newAnswer.id } } },
    });

    // Create a new interaction record
    const questionObject = await db.question.findUnique({
      where: { id: question },
      include: { tags: true },
    });
    await db.interaction.create({
      data: {
        user: { connect: { id: author } },
        action: "answer",
        question: { connect: { id: question } },
        answer: { connect: { id: newAnswer.id } },
        tags: {
          connect:
            questionObject?.tags.map((tag: any) => ({ id: tag.id })) || [],
        },
      },
    });

    // Increment the author's reputation
    await db.user.update({
      where: { id: author },
      data: { reputation: { increment: 10 } },
    });

    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Action: Get answers based on question
export async function getAnswers(params: GetAnswersParams) {
  try {
    const { questionId, sortBy, page = 1, pageSize = 10 } = params;
    const skipAmount = (page - 1) * pageSize;

    let orderBy = {};
    switch (sortBy) {
      case "highestUpvotes":
        orderBy = { upvotes: { _count: "desc" } };
        break;
      case "lowestUpvotes":
        orderBy = { upvotes: { _count: "asc" } };
        break;
      case "recent":
        orderBy = { createdAt: "desc" };
        break;
      case "old":
        orderBy = { createdAt: "asc" };
        break;
      default:
        break;
    }

    const answers = await db.answer.findMany({
      where: { questionId },
      include: {
        author: {
          select: { id: true, clerkId: true, name: true, picture: true },
        },
      },
      orderBy,
      skip: skipAmount,
      take: pageSize,
    });

    const totalAnswer = await db.answer.count({ where: { questionId } });
    const isNextAnswer = totalAnswer > skipAmount + answers.length;

    return { answers, isNextAnswer };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Action: Upvote an answer
export async function upvoteAnswer(params: AnswerVoteParams) {
  try {
    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

    if (hasupVoted) {
      await db.answer.update({
        where: { id: answerId },
        data: { upvotes: { disconnect: { id: userId } } },
      });
    } else if (hasdownVoted) {
      await db.answer.update({
        where: { id: answerId },
        data: {
          downvotes: { disconnect: { id: userId } },
          upvotes: { connect: { id: userId } },
        },
      });
    } else {
      await db.answer.update({
        where: { id: answerId },
        data: { upvotes: { connect: { id: userId } } },
      });
    }

    // Update reputation for both user and answer author
    await db.user.update({
      where: { id: userId },
      data: { reputation: { increment: hasupVoted ? -2 : 2 } },
    });
    const answer = await db.answer.findUnique({ where: { id: answerId } });
    if (answer) {
      await db.user.update({
        where: { id: answer.authorId },
        data: { reputation: { increment: hasupVoted ? -10 : 10 } },
      });
    }

    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Action: Downvote an answer
export async function downvoteAnswer(params: AnswerVoteParams) {
  try {
    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

    if (hasdownVoted) {
      await db.answer.update({
        where: { id: answerId },
        data: { downvotes: { disconnect: { id: userId } } },
      });
    } else if (hasupVoted) {
      await db.answer.update({
        where: { id: answerId },
        data: {
          upvotes: { disconnect: { id: userId } },
          downvotes: { connect: { id: userId } },
        },
      });
    } else {
      await db.answer.update({
        where: { id: answerId },
        data: { downvotes: { connect: { id: userId } } },
      });
    }

    // Update reputation for both user and answer author
    await db.user.update({
      where: { id: userId },
      data: { reputation: { increment: hasdownVoted ? -2 : 2 } },
    });
    const answer = await db.answer.findUnique({ where: { id: answerId } });
    if (answer) {
      await db.user.update({
        where: { id: answer.authorId },
        data: { reputation: { increment: hasdownVoted ? -10 : 10 } },
      });
    }

    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Action: Delete an answer
export async function deleteAnswer(params: DeleteAnswerParams) {
  try {
    const { answerId, path } = params;

    const answer = await db.answer.findUnique({ where: { id: answerId } });

    if (!answer) {
      throw new Error("Answer not found");
    }

    await db.answer.delete({ where: { id: answerId } });
    await db.question.update({
      where: { id: answer.questionId },
      data: { answers: { disconnect: { id: answerId } } },
    });
    await db.interaction.deleteMany({ where: { answerId } });

    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

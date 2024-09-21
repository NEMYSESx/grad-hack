"use server";

import { db } from "@/db/db"; // Import Prisma client
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
  RecommendedParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";

export async function getQuestions(params: GetQuestionsParams) {
  try {
    const { searchQuery, filter, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    const whereClause: any = {};

    if (searchQuery) {
      whereClause.OR = [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { content: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    if (filter === "unanswered") {
      whereClause.answers = { none: {} };
    }

    let orderBy = {};
    if (filter === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (filter === "frequent") {
      orderBy = { views: "desc" };
    }

    const questions = await db.question.findMany({
      where: whereClause,
      skip: skipAmount,
      take: pageSize,
      orderBy,
      include: { tags: true, author: true },
    });

    const totalQuestions = await db.question.count({ where: whereClause });

    const isNext = totalQuestions > skipAmount + questions.length;

    return { questions, isNext };
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
}

export async function createQuestion(params: CreateQuestionParams) {
  try {
    const { title, content, tags, author, path } = params;

    const question = await db.question.create({
      data: {
        title,
        content,
        author: { connect: { id: author } },
        tags: {
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });

    await db.interaction.create({
      data: {
        userId: author,
        action: "ask_question",
        questionId: question.id,
      },
    });

    await db.user.update({
      where: { id: author },
      data: { reputation: { increment: 5 } },
    });

    revalidatePath(path);
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
}

export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    const { questionId } = params;

    const question = await db.question.findUnique({
      where: { id: questionId },
      include: { tags: true, author: true },
    });

    return question;
  } catch (error) {
    console.error("Error fetching question by ID:", error);
    throw error;
  }
}

export async function upvoteQuestion(params: QuestionVoteParams) {
  try {
    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    if (hasupVoted) {
      await db.question.update({
        where: { id: questionId },
        data: { upvotes: { disconnect: { id: userId } } },
      });
    } else if (hasdownVoted) {
      await db.question.update({
        where: { id: questionId },
        data: {
          downvotes: { disconnect: { id: userId } },
          upvotes: { connect: { id: userId } },
        },
      });
    } else {
      await db.question.update({
        where: { id: questionId },
        data: { upvotes: { connect: { id: userId } } },
      });
    }

    await db.user.update({
      where: { id: userId },
      data: { reputation: { increment: hasupVoted ? -1 : 1 } },
    });

    revalidatePath(path);
  } catch (error) {
    console.error("Error upvoting question:", error);
    throw error;
  }
}

export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    if (hasdownVoted) {
      await db.question.update({
        where: { id: questionId },
        data: { downvotes: { disconnect: { id: userId } } },
      });
    } else if (hasupVoted) {
      await db.question.update({
        where: { id: questionId },
        data: {
          upvotes: { disconnect: { id: userId } },
          downvotes: { connect: { id: userId } },
        },
      });
    } else {
      await db.question.update({
        where: { id: questionId },
        data: { downvotes: { connect: { id: userId } } },
      });
    }

    await db.user.update({
      where: { id: userId },
      data: { reputation: { increment: hasdownVoted ? -2 : 2 } },
    });

    revalidatePath(path);
  } catch (error) {
    console.error("Error downvoting question:", error);
    throw error;
  }
}

export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    const { questionId, path } = params;

    await db.answer.deleteMany({ where: { questionId } });
    await db.question.delete({ where: { id: questionId } });
    await db.interaction.deleteMany({ where: { questionId } });

    revalidatePath(path);
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
}

export async function editQuestion(params: EditQuestionParams) {
  try {
    const { questionId, title, content, path } = params;

    await db.question.update({
      where: { id: questionId },
      data: { title, content },
    });

    revalidatePath(path);
  } catch (error) {
    console.error("Error editing question:", error);
    throw error;
  }
}

export async function getHotQuestions() {
  try {
    const hotQuestions = await db.question.findMany({
      orderBy: [{ views: "desc" }, { upvotes: { _count: "desc" } }],
      take: 5,
    });

    return hotQuestions;
  } catch (error) {
    console.error("Error fetching hot questions:", error);
    throw error;
  }
}

export async function getRecommendedQuestions(params: RecommendedParams) {
  try {
    const { userId, page = 1, pageSize = 20, searchQuery } = params;

    const skipAmount = (page - 1) * pageSize;

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { interactions: { include: { tags: true } } },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const userTags = user.interactions.flatMap((interaction) =>
      interaction.tags.map((tag) => tag.id)
    );
    const distinctUserTagIds = [...new Set(userTags)];

    const query = {
      AND: [
        { tags: { some: { id: { in: distinctUserTagIds } } } },
        { authorId: { not: user.id } },
      ],
    };

    if (searchQuery) {
      query.OR = [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { content: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    const recommendedQuestions = await db.question.findMany({
      where: query,
      skip: skipAmount,
      take: pageSize,
      include: { tags: true, author: true },
    });

    const totalQuestions = await db.question.count({ where: query });

    const isNext = totalQuestions > skipAmount + recommendedQuestions.length;

    return { questions: recommendedQuestions, isNext };
  } catch (error) {
    console.error("Error fetching recommended questions:", error);
    throw error;
  }
}

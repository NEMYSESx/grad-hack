"use server";

import { db } from "@/db/db";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import { assignBadges } from "@/lib/utils";

export async function getUserById(params: GetUserByIdParams) {
  try {
    const { userId } = params;

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    const newUser = await db.user.create({
      data: userData,
    });

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    const { clerkId, updateData, path } = params;

    await db.user.update({
      where: { clerkId },
      data: updateData,
    });

    revalidatePath(path);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    const { clerkId } = params;

    const user = await db.user.findUnique({ where: { clerkId } });

    if (!user) {
      throw new Error("User not found");
    }

    // Delete associated questions and other entities
    await db.question.deleteMany({ where: { authorId: user.id } });
    await db.answer.deleteMany({ where: { authorId: user.id } });

    // Delete user
    const deletedUser = await db.user.delete({
      where: { id: user.id },
    });

    return deletedUser;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    const { searchQuery, filter, page = 1, pageSize = 10 } = params;
    const skipAmount = (page - 1) * pageSize;

    const whereClause = searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { username: { contains: searchQuery, mode: "insensitive" } },
          ],
        }
      : {};

    let orderBy = {};
    switch (filter) {
      case "new_users":
        orderBy = { joinedAt: "desc" };
        break;
      case "old_users":
        orderBy = { joinedAt: "asc" };
        break;
      case "top_contributors":
        orderBy = { reputation: "desc" };
        break;
      default:
        break;
    }

    const users = await db.user.findMany({
      where: whereClause,
      orderBy,
      skip: skipAmount,
      take: pageSize,
    });

    const totalUsers = await db.user.count({ where: whereClause });
    const isNext = totalUsers > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    const { userId, questionId, path } = params;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { savedQuestions: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isQuestionSaved = user.savedQuestions.some(
      (q) => q.id === questionId
    );

    if (isQuestionSaved) {
      await db.user.update({
        where: { id: userId },
        data: {
          savedQuestions: {
            disconnect: { id: questionId },
          },
        },
      });
    } else {
      await db.user.update({
        where: { id: userId },
        data: {
          savedQuestions: {
            connect: { id: questionId },
          },
        },
      });
    }

    revalidatePath(path);
  } catch (error) {
    console.error("Error toggling save question:", error);
    throw error;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    const { clerkId, searchQuery, filter, page = 1, pageSize = 20 } = params;
    const skipAmount = (page - 1) * pageSize;

    let sortOptions: any = {};
    switch (filter) {
      case "most_recent":
        sortOptions = { createdAt: "desc" };
        break;
      case "oldest":
        sortOptions = { createdAt: "asc" };
        break;
      case "most_voted":
        sortOptions = { upvotes: { _count: "desc" } };
        break;
      case "most_viewed":
        sortOptions = { views: "desc" };
        break;
      case "most_answered":
        sortOptions = { answers: { _count: "desc" } };
        break;
      default:
        break;
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        savedQuestions: {
          where: searchQuery
            ? { title: { contains: searchQuery, mode: "insensitive" } }
            : {},
          orderBy: sortOptions,
          skip: skipAmount,
          take: pageSize + 1,
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isNext = user.savedQuestions.length > pageSize;
    const savedQuestions = user.savedQuestions.slice(0, pageSize);

    return { questions: savedQuestions, isNext };
  } catch (error) {
    console.error("Error fetching saved questions:", error);
    throw error;
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    const { userId, page = 1, pageSize = 10 } = params;
    const skipAmount = (page - 1) * pageSize;

    const totalQuestions = await db.question.count({
      where: { authorId: userId },
    });

    const userQuestions = await db.question.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      skip: skipAmount,
      take: pageSize,
      include: { tags: true, author: true },
    });

    const isNextQuestions = totalQuestions > skipAmount + userQuestions.length;

    return { totalQuestions, questions: userQuestions, isNextQuestions };
  } catch (error) {
    console.error("Error fetching user questions:", error);
    throw error;
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    const { userId, page = 1, pageSize = 10 } = params;
    const skipAmount = (page - 1) * pageSize;

    const totalAnswers = await db.answer.count({
      where: { authorId: userId },
    });

    const userAnswers = await db.answer.findMany({
      where: { authorId: userId },
      orderBy: { upvotes: { _count: "desc" } },
      skip: skipAmount,
      take: pageSize,
      include: { question: true, author: true },
    });

    const isNextAnswer = totalAnswers > skipAmount + userAnswers.length;

    return { totalAnswers, answers: userAnswers, isNextAnswer };
  } catch (error) {
    console.error("Error fetching user answers:", error);
    throw error;
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    const { userId } = params;

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const totalQuestions = await db.question.count({
      where: { authorId: user.id },
    });

    const totalAnswers = await db.answer.count({
      where: { authorId: user.id },
    });

    const questionUpvotes = await db.question.aggregate({
      where: { authorId: user.id },
      _sum: { upvotes: true },
    });

    const answerUpvotes = await db.answer.aggregate({
      where: { authorId: user.id },
      _sum: { upvotes: true },
    });

    const questionViews = await db.question.aggregate({
      where: { authorId: user.id },
      _sum: { views: true },
    });

    const badgeCounts = assignBadges({
      criteria: [
        { type: "QUESTION_COUNT", count: totalQuestions },
        { type: "ANSWER_COUNT", count: totalAnswers },
        { type: "QUESTION_UPVOTES", count: questionUpvotes._sum.upvotes || 0 },
        { type: "ANSWER_UPVOTES", count: answerUpvotes._sum.upvotes || 0 },
        { type: "TOTAL_VIEWS", count: questionViews._sum.views || 0 },
      ],
    });

    return {
      user,
      totalQuestions,
      totalAnswers,
      badgeCounts,
      reputation: user.reputation,
    };
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
}

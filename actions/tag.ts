"use server";

import { db } from "@/db/db"; // Prisma client
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "./shared.types";

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    const { userId } = params;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { interactions: { include: { tags: true } } },
    });

    if (!user) throw new Error("User not found");

    const tags = user.interactions.flatMap((interaction) => interaction.tags);
    const distinctTags = [...new Set(tags.map((tag) => tag.id))];

    // Return top interacted tags
    return distinctTags.map((tagId) => ({
      id: tagId,
      name: tags.find((tag) => tag.id === tagId)?.name || "Unknown",
    }));
  } catch (error) {
    console.error("Error fetching top interacted tags:", error);
    throw error;
  }
}

export async function getAllTags(params: GetAllTagsParams) {
  try {
    const { searchQuery, filter, page = 1, pageSize = 10 } = params;
    const skipAmount = (page - 1) * pageSize;

    const whereClause: any = {};
    if (searchQuery) {
      whereClause.name = { contains: searchQuery, mode: "insensitive" };
    }

    let orderBy = {};
    switch (filter) {
      case "popular":
        orderBy = { questions: { _count: "desc" } };
        break;
      case "recent":
        orderBy = { createdOn: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "old":
        orderBy = { createdOn: "asc" };
        break;
      default:
        break;
    }

    const totalTags = await db.tag.count({ where: whereClause });

    const tags = await db.tag.findMany({
      where: whereClause,
      orderBy,
      skip: skipAmount,
      take: pageSize,
    });

    const isNext = totalTags > skipAmount + tags.length;

    return { tags, isNext };
  } catch (error) {
    console.error("Error fetching all tags:", error);
    throw error;
  }
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    const { tagId, page = 1, pageSize = 10, searchQuery } = params;
    const skipAmount = (page - 1) * pageSize;

    const whereClause: any = { tags: { some: { id: tagId } } };
    if (searchQuery) {
      whereClause.OR = [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { content: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    const tag = await db.tag.findUnique({
      where: { id: tagId },
      select: {
        name: true,
        questions: {
          where: whereClause,
          skip: skipAmount,
          take: pageSize + 1, // +1 to check if there is next page
          orderBy: { createdAt: "desc" },
          include: {
            tags: true,
            author: {
              select: { id: true, clerkId: true, name: true, picture: true },
            },
          },
        },
      },
    });

    if (!tag) {
      throw new Error("Tag not found");
    }

    const isNext = tag.questions.length > pageSize;
    const questions = tag.questions.slice(0, pageSize); // Limit to pageSize

    return { tagTitle: tag.name, questions, isNext };
  } catch (error) {
    console.error("Error fetching questions by tag:", error);
    throw error;
  }
}

export async function getTopPopularTags() {
  try {
    const popularTags = await db.tag.findMany({
      orderBy: {
        questions: { _count: "desc" },
      },
      take: 5,
      select: { id: true, name: true },
    });

    return popularTags;
  } catch (error) {
    console.error("Error fetching top popular tags:", error);
    throw error;
  }
}

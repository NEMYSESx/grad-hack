"use server";

import { db } from "@/db/db";
import { SearchParams } from "./shared.types";

// Define searchable types
const SearchableTypes = ["question", "answer", "user", "tag"];

// Global search function
export async function globalSearch(params: SearchParams) {
  try {
    const { query, type } = params;
    const searchQuery = query.toLowerCase();

    let results = [];

    const modelsAndTypes = [
      { model: db.question, searchField: "title", type: "question" },
      { model: db.user, searchField: "name", type: "user" },
      { model: db.answer, searchField: "content", type: "answer" },
      { model: db.tag, searchField: "name", type: "tag" },
    ];

    const typeLower = type?.toLowerCase();

    // If no type is provided or type is invalid, search across all models
    if (!typeLower || !SearchableTypes.includes(typeLower)) {
      for (const { model, searchField, type } of modelsAndTypes) {
        const queryResults = await model.findMany({
          where: {
            [searchField]: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          take: 2,
        });

        results.push(
          ...queryResults.map((item) => ({
            title:
              type === "answer"
                ? `Answers containing ${query}`
                : item[searchField],
            type,
            id: type === "user" ? item.id : item.id, // Use `id` for all
          }))
        );
      }
    } else {
      // If a valid type is provided, search only in that model
      const modelInfo = modelsAndTypes.find((item) => item.type === typeLower);

      if (!modelInfo) {
        throw new Error("Invalid search type");
      }

      const queryResults = await modelInfo.model.findMany({
        where: {
          [modelInfo.searchField]: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        take: 8,
      });

      results = queryResults.map((item) => ({
        title:
          typeLower === "answer"
            ? `Answers containing ${query}`
            : item[modelInfo.searchField],
        type: typeLower,
        id: typeLower === "user" ? item.id : item.id,
      }));
    }

    return JSON.stringify(results);
  } catch (error) {
    console.log(`Error fetching global results: ${error}`);
    throw error;
  }
}

import {GoogleGenerativeAI} from '@google/generative-ai'
import dotenv from "dotenv";
import { Document } from '@langchain/core/documents';
import { sleep } from './utils';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model=genAI.getGenerativeModel({
    model:'gemini-2.5-flash'
})
const commitSummaryCache: Record<string, string> = {};

// Delay helper to throttle requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const aisummariseCommit = async (diff: string, commitHash?: string) => {
  try {
    if (!diff || diff.length < 50) return "No meaningful changes to summarize.";

    // Check cache first (optional but highly recommended)
    if (commitHash && commitSummaryCache[commitHash]) {
      return commitSummaryCache[commitHash];
    }

    // Truncate large diffs to avoid token limit errors
    const MAX_LENGTH = 10000;
    const truncatedDiff = diff.length > MAX_LENGTH ? diff.slice(0, MAX_LENGTH) : diff;

    // OPTIONAL: Throttle requests if calling multiple in a loop
    await delay(1000); // 1 second delay between requests

    const response = await model.generateContent([`
      You are an expert programmer, and you are trying to summarize a git diff.

      Reminders about the git diff format:
      For every file, there are a few metadata lines, like:
      diff --git a/file.js b/file.js
      index abc123..def456 100644
      --- a/file.js
      +++ b/file.js

      + means added, - means removed, others are context lines.

      EXAMPLE SUMMARIES:
      - Increased limit on API call results
      - Added feature to login flow
      - Fixed bug in pricing logic

      Please summarize this diff file in one or two bullet points:

      ${truncatedDiff}
    `]);

    const summary = response.response.text();
    if (!summary || summary.trim() === "") {
      console.warn("No summary generated.");
      return "Commit Summary could not be generated.";
    }

    // Store in cache
    if (commitHash) {
      commitSummaryCache[commitHash] = summary;
    }

    return summary;

  } catch (error) {
    console.error("summariseCommit error:", error);
    return "Commit Summary could not be generated.";
  }
};
// export async function summariseCode(docs: Document): Promise<string> {
//   const fileName = docs.metadata?.source || 'unknown file';
//   const code = docs.pageContent?.slice(0, 10000) || '';

//   if (!code.trim()) {
//     console.warn(`No code content found in ${fileName}`);
//     return 'No code available to summarize.';
//   }

//   const prompt = [
//     `You are an intelligent senior software engineer.`,
//     `You are onboarding a junior engineer and explaining the purpose of the file: ${fileName}.`,
//     `Here is the code:\n${code}\n`,
//     `Please give a concise summary (no more than 100 words) of what this file does.`,
//   ];

//   const maxRetries = 3;
//   let attempt = 0;

//   while (attempt < maxRetries) {
//     try {
//       const response = await model.generateContent(prompt);
//       const text = response.response.text();
      
//       if (!text.trim()) {
//         console.warn(`Empty summary for ${fileName}`);
//         return 'No summary could be generated.';
//       }

//       return text;
//     } catch (error: any) {
//       console.error(`summariseCode error (attempt ${attempt + 1}):`, error);

//       // Handle quota error: retry after delay
//       if (error?.status === 429 || error?.message?.includes('quota')) {
//         const waitTime = 2000 * (attempt + 1); // Exponential backoff
//         console.log(`Retrying in ${waitTime / 1000}s...`);
//         await sleep(waitTime);
//         attempt++;
//       } else {
//         break; // break for non-quota errors
//       }
//     }
//   }

//   return 'Code summary could not be generated.';
// }

//import { genAI } from './yourGeminiSetupFile'; // adjust if needed
// sleep helper as shown before

// export async function generateEmbedding(summary: string): Promise<number[] | null> {
//   const model = genAI.getGenerativeModel({ model: "embedding-001" });
//   const maxRetries = 3;
//   let attempt = 0;

//   while (attempt < maxRetries) {
//     try {
//       const result = await model.embedContent(summary);

//       if (!result.embedding?.values || !Array.isArray(result.embedding.values)) {
//         console.error("Invalid embedding format received.");
//         return null;
//       }

//       return result.embedding.values;
//     } catch (error: any) {
//       console.error(`generateEmbedding error (attempt ${attempt + 1}):`, error);

//       // Retry on quota/429 errors
//       if (error?.status === 429 || error?.message?.includes("quota")) {
//         const waitTime = 2000 * (attempt + 1);
//         console.log(`Retrying embedding in ${waitTime / 1000}s...`);
//         await sleep(waitTime);
//         attempt++;
//       } else {
//         break; // non-retriable error
//       }
//     }
//   }

//   return null; // explicitly return null on failure
// }

//console.log(await generateEmbedding("hello world"))
//console.log(await aisummariseCommit("gemini"))


export async function summariseCode(docs:Document){
  //console.log("getting summary for",docs.metadata.source);
  try{
       const code=docs.pageContent.slice(0,10000);
        const response=await model.generateContent([
          `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects,
          You are onboarding a junior software engineer and explaning to them the purpose of the ${docs.metadata.source} file
          Here is the code:
          ${code}
          Give a summary no more than 100 words of the code above`
    
  ]);
  return response.response.text();
  }catch (error) {
    
    return "code Summary could not be generated.";

  }
  
}
export async function generateEmbedding(summary: string): Promise<number[]> {
  // Guard empty input to avoid empty vectors
  const text = (summary || "").trim();
  if (text.length === 0) {
    console.warn("generateEmbedding called with empty text");
    return [];
  }

  // Truncate to stay well within token/size limits
  const MAX_CHARS = 8000;
  const truncated = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;

  const model = genAI.getGenerativeModel({
    // Use current embedding model
    model: "text-embedding-004",
  });

  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.embedContent(truncated);
      const values = result?.embedding?.values as number[] | undefined;
      if (Array.isArray(values) && values.length > 0) {
        return values;
      }
      console.error("Embedding returned no values");
      return [];
    } catch (error: any) {
      const isRateLimited = error?.status === 429 || error?.message?.toString?.().includes("quota");
      console.error(`generateEmbedding error (attempt ${attempt + 1}):`, error);
      if (isRateLimited && attempt < maxRetries - 1) {
        const waitMs = 1500 * (attempt + 1);
        await sleep(waitMs);
        continue;
      }
      return [];
    }
  }
  return [];
}
import { summariseCode } from "./gemini";
import { Document } from "langchain/document"; // adjust import if needed

async function testSummarise() {
  // Create a dummy Document
  console.log(1);
  const testDoc: Document = {
    pageContent: `
      function add(a, b) {
        return a + b;
      }
    `,
    metadata: { source: "addFunction.js" },
  };
  console.log(2);
  console.log("Testing summariseCode...");
  console.log(3);
  const summary = await summariseCode(testDoc);
  console.log(4);
  console.log("Generated Summary:", summary);
}

testSummarise()
  .then(() => console.log("Test completed"))
  .catch((err) => console.error("Error during test:", err));

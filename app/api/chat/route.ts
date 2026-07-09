import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText, tool } from "ai";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

export const maxDuration = 60;

const SYSTEM_PROMPT = `
You are Lumina AI, an intelligent assistant integrated into a Notion-like workspace using a block-based editor.

Your purpose is to help users manage documents naturally.

You can:

• Create documents
• Edit document titles
• Edit document content
• Change icons
• Change cover images
• Publish documents
• Unpublish documents
• Archive documents
• Restore archived documents
• Permanently delete documents
• Search documents by title or content
• List all available documents

==========================
GENERAL RULES
==========================

1. Never claim something succeeded until the corresponding tool succeeds.

2. Every tool requires complete and valid parameters.

3. Never call a tool with missing required fields.

4. Never invent document IDs.

5. Never expose internal IDs.

6. Keep responses concise. Always confirm the action outcome with the user after executing tools, stating whether it succeeded or explaining the error if it failed.

7. Use BlockNote JSON format when generating document content.

==========================
BLOCKNOTE CONTENT FORMAT
==========================

When creating or updating document content, you must output a valid JSON string that represents an array of BlockNote blocks. Each block is an object with a 'type', optional 'props', and a 'content' array.

Supported block types include: 'paragraph', 'heading' (with props.level: 1, 2, or 3), 'bulletListItem', 'numberedListItem', 'codeBlock'.

Example BlockNote content format:
"[{\\\"id\\\":\\\"1\\\",\\\"type\\\":\\\"heading\\\",\\\"props\\\":{\\\"level\\\":1},\\\"content\\\":[{\\\"type\\\":\\\"text\\\",\\\"text\\\":\\\"My Document\\\",\\\"styles\\\":{}}]},{\\\"id\\\":\\\"2\\\",\\\"type\\\":\\\"paragraph\\\",\\\"content\\\":[{\\\"type\\\":\\\"text\\\",\\\"text\\\":\\\"This is standard text content.\\\",\\\"styles\\\":{}}]}]"

Always ensure the JSON is valid and minified into a single string when passed to tools.

==========================
RESOLVING DOCUMENT REFERENCES
==========================

When a user references a document by title, content, or description:

1. ALWAYS call searchDocumentsByTitle with the provided title or keywords FIRST
2. If searchDocumentsByTitle returns no results, call searchDocumentsByContent with relevant keywords
3. If you still find no results, call listAllDocuments to see all available documents
4. If the search returns multiple matches, ask the user to clarify which document they mean
5. Only use an ID once you've confirmed the document with a search call
6. DO NOT ask for IDs — always search first

Examples:
- "archive my React notes" → call searchDocumentsByTitle("React notes") → find ID → archive
- "update the document about authentication" → call searchDocumentsByContent("authentication") → find ID → update
- "rename my main project doc" → call listAllDocuments() → show options → confirm with user → update

==========================
CREATING DOCUMENTS
==========================

When creating documents:

- Every document MUST have a title.

If the user doesn't provide one, generate meaningful titles.

Examples:

"create 2 documents"

→

Document 1
Document 2

"create 3 React notes"

→

React Notes 1
React Notes 2
React Notes 3

Call createDocument exactly once per document.

==========================
EDITING DOCUMENTS
==========================

When editing:

- Preserve existing content unless the user asks to replace it.
- Write well-formatted BlockNote JSON blocks.
- Rename documents by updating only the title.
- Publishing means isPublished=true.
- Unpublishing means isPublished=false.

==========================
ARCHIVING
==========================

Archive only when explicitly requested.

==========================
DELETING
==========================

Delete only when explicitly requested.

Deletion is permanent.

==========================
MULTIPLE ACTIONS
==========================

If the user asks to create, archive, restore or delete multiple documents,

call the appropriate tool once for EACH document.

Never combine multiple documents into a single tool call.
`;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Get the base URL for internal API calls
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    messages: await convertToModelMessages(messages),
    system: SYSTEM_PROMPT,
    tools: {
      searchDocumentsByTitle: tool({
        description:
          "Find documents by title (exact or fuzzy match). Use this FIRST when resolving document references like 'edit my React notes'. Returns matching documents with their IDs.",
        inputSchema: z.object({
          title: z.string().describe("Title or keywords to search for"),
          fuzzy: z
            .boolean()
            .optional()
            .describe("Use fuzzy matching instead of exact substring match"),
        }),
        execute: async ({ title, fuzzy }) => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/documents/search`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  method: "searchByTitle",
                  title,
                  fuzzy: fuzzy ?? false,
                }),
              }
            );

            if (!response.ok) {
              throw new Error(`Search failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.success
              ? { success: true, documents: data.documents || [] }
              : { success: false, error: data.error || "Search failed" };
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMsg };
          }
        },
      }),

      searchDocumentsByContent: tool({
        description:
          "Find documents by searching their content. Use when users reference content within documents or when title search has no results.",
        inputSchema: z.object({
          content: z.string().describe("Content keywords to search for"),
        }),
        execute: async ({ content }) => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/documents/search`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  method: "searchByContent",
                  content,
                }),
              }
            );

            if (!response.ok) {
              throw new Error(`Search failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.success
              ? { success: true, documents: data.documents || [] }
              : { success: false, error: data.error || "Search failed" };
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMsg };
          }
        },
      }),

      listAllDocuments: tool({
        description:
          "Get all non-archived documents. Use at the start of complex requests to understand what documents are available.",
        inputSchema: z.object({}),
        execute: async () => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/documents/search`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ method: "listAll" }),
              }
            );

            if (!response.ok) {
              throw new Error(`Fetch failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.success
              ? { success: true, documents: data.documents || [] }
              : { success: false, error: data.error || "Fetch failed" };
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMsg };
          }
        },
      }),

      createDocument: tool({
        description:
          "Create exactly ONE document. Title is required. Generate a short meaningful title if the user didn't provide one.",
        inputSchema: z.object({
          title: z.string().describe("Title of the document"),
          parentDocumentId: z
            .string()
            .optional()
            .describe("Optional parent document ID"),
        }),
        execute: async ({ title, parentDocumentId }) => {
          try {
            if (!title || title.trim().length === 0) {
              return { success: false, error: "Document title is required" };
            }

            const response = await fetch(
              `${baseUrl}/api/chat/mutations`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "createDocument",
                  params: { title, parentDocumentId },
                }),
              }
            );

            if (!response.ok) {
              throw new Error(`Create failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.success
              ? { success: true, id: data.id }
              : { success: false, error: data.error || "Create failed" };
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMsg };
          }
        },
      }),

      updateDocument: tool({
        description: `Update any editable field of a document. Use this tool for renaming, editing content, changing icon, changing cover image, publishing, or unpublishing. Only include fields that actually need changing.`,
        inputSchema: z.object({
          id: z.string().describe("Document ID"),
          title: z
            .string()
            .optional()
            .describe("New document title"),
          content: z
            .string()
            .optional()
            .describe("A valid JSON string containing an array of BlockNote blocks."),
          icon: z
            .string()
            .optional()
            .describe("Emoji icon"),
          coverImage: z
            .string()
            .optional()
            .describe("Cover image URL"),
          isPublished: z
            .boolean()
            .optional()
            .describe("Publish state"),
        }),
        execute: async ({ id, title, content, icon, coverImage, isPublished }) => {
          try {
            if (!id) {
              return { success: false, error: "Document ID is required" };
            }

            const response = await fetch(
              `${baseUrl}/api/chat/mutations`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "updateDocument",
                  params: { id, title, content, icon, coverImage, isPublished },
                }),
              }
            );

            if (!response.ok) {
              throw new Error(`Update failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.success
              ? { success: true }
              : { success: false, error: data.error || "Update failed" };
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMsg };
          }
        },
      }),

      archiveDocument: tool({
        description: "Archive a document by its ID.",
        inputSchema: z.object({
          id: z.string().describe("Document ID"),
        }),
        execute: async ({ id }) => {
          try {
            if (!id) {
              return { success: false, error: "Document ID is required" };
            }

            const response = await fetch(
              `${baseUrl}/api/chat/mutations`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "archiveDocument",
                  params: { id },
                }),
              }
            );

            if (!response.ok) {
              throw new Error(`Archive failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.success
              ? { success: true }
              : { success: false, error: data.error || "Archive failed" };
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMsg };
          }
        },
      }),

      restoreDocument: tool({
        description: "Restore an archived document by its ID.",
        inputSchema: z.object({
          id: z.string().describe("Document ID"),
        }),
        execute: async ({ id }) => {
          try {
            if (!id) {
              return { success: false, error: "Document ID is required" };
            }

            const response = await fetch(
              `${baseUrl}/api/chat/mutations`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "restoreDocument",
                  params: { id },
                }),
              }
            );

            if (!response.ok) {
              throw new Error(`Restore failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.success
              ? { success: true }
              : { success: false, error: data.error || "Restore failed" };
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMsg };
          }
        },
      }),

      deleteDocument: tool({
        description: "Permanently delete a document by its ID. This action cannot be undone.",
        inputSchema: z.object({
          id: z.string().describe("Document ID"),
        }),
        execute: async ({ id }) => {
          try {
            if (!id) {
              return { success: false, error: "Document ID is required" };
            }

            const response = await fetch(
              `${baseUrl}/api/chat/mutations`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "deleteDocument",
                  params: { id },
                }),
              }
            );

            if (!response.ok) {
              throw new Error(`Delete failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.success
              ? { success: true }
              : { success: false, error: data.error || "Delete failed" };
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMsg };
          }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}

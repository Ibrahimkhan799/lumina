import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, tool } from "ai";
import { z } from "zod";

export const maxDuration = 30;

const SYSTEM_PROMPT = `
You are Lumina AI, an intelligent assistant integrated into a Notion-like workspace.

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

6. Keep responses concise.

7. Use markdown when generating document content.

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
- Write well-formatted markdown.
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

  const result = streamText({
    model: google("gemini-2.5-flash-lite"),

    messages: await convertToModelMessages(messages),

    system: SYSTEM_PROMPT,

    maxSteps: 20,

    tools: {
      searchDocumentsByTitle: tool({
        description:
          "Find documents by title (exact or fuzzy match). Use this FIRST when resolving document references like 'edit my React notes'. Returns matching documents with their IDs.",
        parameters: z.object({
          title: z.string().describe("Title or keywords to search for"),
          fuzzy: z
            .boolean()
            .optional()
            .describe("Use fuzzy matching instead of exact substring match"),
        }),
      }),

      searchDocumentsByContent: tool({
        description:
          "Find documents by searching their content. Use when users reference content within documents or when title search has no results.",
        parameters: z.object({
          content: z.string().describe("Content keywords to search for"),
        }),
      }),

      listAllDocuments: tool({
        description:
          "Get all non-archived documents. Use at the start of complex requests to understand what documents are available.",
        parameters: z.object({}),
      }),

      createDocument: tool({
        description:
          "Create exactly ONE document. Title is required. Generate a short meaningful title if the user didn't provide one.",
        parameters: z.object({
          title: z.string().describe("Title of the document"),
          parentDocumentId: z
            .string()
            .optional()
            .describe("Optional parent document ID"),
        }),
      }),

      updateDocument: tool({
        description: `
Update any editable field of a document.

Use this tool for:

- Renaming
- Editing content
- Changing icon
- Changing cover image
- Publishing
- Unpublishing

Only include fields that actually need changing.
`,
        parameters: z.object({
          id: z.string().describe("Document ID"),

          title: z
            .string()
            .optional()
            .describe("New document title"),

          content: z
            .string()
            .optional()
            .describe("Markdown content"),

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
      }),

      archiveDocument: tool({
        description: "Archive a document.",
        parameters: z.object({
          id: z.string().describe("Document ID"),
        }),
      }),

      restoreDocument: tool({
        description: "Restore an archived document.",
        parameters: z.object({
          id: z.string().describe("Document ID"),
        }),
      }),

      deleteDocument: tool({
        description: "Permanently delete a document.",
        parameters: z.object({
          id: z.string().describe("Document ID"),
        }),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}

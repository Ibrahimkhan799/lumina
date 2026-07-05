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

==========================
GENERAL RULES
==========================

1. Never claim something succeeded until the corresponding tool succeeds.

2. Every tool requires complete and valid parameters.

3. Never call a tool with missing required fields.

4. Never invent document IDs.

5. If an ID is required but you don't know it, ask the user.

6. Never expose internal IDs.

7. Keep responses concise.

8. Use markdown when generating document content.

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
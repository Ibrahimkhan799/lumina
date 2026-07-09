import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { action, params } = await req.json();

    if (!action || !params) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing action or params" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    switch (action) {
      case "createDocument": {
        const { title, parentDocumentId } = params;

        if (!title) {
          return new Response(
            JSON.stringify({ success: false, error: "Title is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        try {
          const id = await convex.mutation(api.documents.create, {
            title,
            parentDocumentId: parentDocumentId as Id<"documents"> | undefined,
          });

          return new Response(
            JSON.stringify({ success: true, id }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          return new Response(
            JSON.stringify({ success: false, error: errorMsg }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      case "updateDocument": {
        const { id, title, content, icon, coverImage, isPublished } = params;

        if (!id) {
          return new Response(
            JSON.stringify({ success: false, error: "Document ID is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        try {
          await convex.mutation(api.documents.update, {
            id: id as Id<"documents">,
            title,
            content,
            icon,
            coverImage,
            isPublished,
          });

          return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          return new Response(
            JSON.stringify({ success: false, error: errorMsg }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      case "archiveDocument": {
        const { id } = params;

        if (!id) {
          return new Response(
            JSON.stringify({ success: false, error: "Document ID is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        try {
          await convex.mutation(api.documents.archive, {
            id: id as Id<"documents">,
          });

          return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          return new Response(
            JSON.stringify({ success: false, error: errorMsg }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      case "restoreDocument": {
        const { id } = params;

        if (!id) {
          return new Response(
            JSON.stringify({ success: false, error: "Document ID is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        try {
          await convex.mutation(api.documents.restore, {
            id: id as Id<"documents">,
          });

          return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          return new Response(
            JSON.stringify({ success: false, error: errorMsg }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      case "deleteDocument": {
        const { id } = params;

        if (!id) {
          return new Response(
            JSON.stringify({ success: false, error: "Document ID is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        try {
          await convex.mutation(api.documents.remove, {
            id: id as Id<"documents">,
          });

          return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          return new Response(
            JSON.stringify({ success: false, error: errorMsg }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Unknown action" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

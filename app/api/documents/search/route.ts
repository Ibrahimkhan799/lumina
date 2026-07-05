import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const { method, query, fuzzy } = await req.json();
  const session = await auth();

  if (!session.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[v0] Search API called with method:", method, "query:", query);
    let results;

    if (method === "searchByTitle") {
      console.log("[v0] Calling api.documents.searchByTitle");
      results = await client.query(api.documents.searchByTitle, {
        query: query as string,
        fuzzy: fuzzy as boolean | undefined,
      });
    } else if (method === "searchByContent") {
      console.log("[v0] Calling api.documents.searchByContent");
      results = await client.query(api.documents.searchByContent, {
        query: query as string,
      });
    } else if (method === "listAll") {
      console.log("[v0] Calling api.documents.listAll");
      results = await client.query(api.documents.listAll);
    } else {
      return Response.json({ error: "Invalid method" }, { status: 400 });
    }

    console.log("[v0] Search results:", results.length, "documents found");
    return Response.json({
      success: true,
      count: results.length,
      documents: results.map((doc: any) => ({
        id: doc._id,
        title: doc.title,
        isArchived: doc.isArchived,
      })),
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[v0] Search API error:", errorMsg);
    return Response.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

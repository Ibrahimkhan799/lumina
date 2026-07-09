import {
    searchDocumentsByTitle,
    searchDocumentsByContent,
    listAllDocuments,
} from "@/app/actions/search";

export async function POST(req: Request) {
    const { method, title, content, fuzzy } = await req.json();

    try {
        let documents;

        if (method === "searchByTitle") {
            documents = await searchDocumentsByTitle(title as string, fuzzy as boolean | undefined);
        } else if (method === "searchByContent") {
            documents = await searchDocumentsByContent(content as string);
        } else if (method === "listAll") {
            documents = await listAllDocuments();
        } else {
            return Response.json({ error: "Invalid method" }, { status: 400 });
        }

        return Response.json({
            success: true,
            count: documents.length,
            documents,
        });
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        return Response.json(
            { success: false, error: errorMsg },
            { status: 500 }
        );
    }
}

# Phase 1: Debug & Fixes

## Problem Diagnosed

When you tested "delete personal portfolio," the search tool was failing silently with:

```
query: undefined
Error: Could not find public function for 'documents:searchByTitle'
```

Two root causes were identified:

### Root Cause #1: Semantic Mismatch in Parameter Names

The tool definitions used `query` as the parameter name:
```zod
parameters: z.object({
  query: z.string().describe("Title or keywords to search for"),
})
```

But the AI naturally interpreted this as a **title search** and tried to use `title` as the parameter:
```json
{"title":"Personal Portfolio"}
```

This caused `query: undefined` to be passed to the API, and the search silently failed.

### Root Cause #2: Convex Function Registration Timing

The Convex dev server initially hadn't compiled the new `searchByTitle`, `searchByContent`, and `listAll` query functions. This was resolved by:
- Stopping the dev server
- Clearing the Convex connection
- Restarting fresh so the functions were properly compiled and registered

## Solutions Applied

### Fix #1: Semantic Parameter Names (CRITICAL)

Changed tool parameters to match the AI's natural interpretation:

**Before:**
```zod
searchDocumentsByTitle: tool({
  parameters: z.object({
    query: z.string().describe("Title or keywords..."),
  }),
})
```

**After:**
```zod
searchDocumentsByTitle: tool({
  parameters: z.object({
    title: z.string().describe("Title or keywords..."),
  }),
})
```

Similarly for content search:
- `query` → `content`

### Fix #2: Parameter Mapping in API Handler

The API handler now accepts the semantic parameter names and maps them internally:

```typescript
// Accepts title/content from AI
const { method, title, content, fuzzy } = await req.json();

// Maps to internal Convex query parameter
if (method === "searchByTitle") {
  results = await client.query(api.documents.searchByTitle, {
    query: title as string,  // Map semantic name to internal parameter
    fuzzy,
  });
}
```

### Fix #3: Tool Handler Updates

Updated the ai-sidebar handlers to use the correct parameter names:

**Before:**
```typescript
const query = input.query as string;
body: JSON.stringify({ method: "searchByTitle", query }),
```

**After:**
```typescript
const title = input.title as string;
body: JSON.stringify({ method: "searchByTitle", title }),
```

## Testing the Fixes

Now when you ask the AI to "delete personal portfolio":

1. AI calls `searchDocumentsByTitle` with `{ title: "Personal Portfolio" }`
2. Tool handler correctly extracts `title` parameter
3. API receives `{ method: "searchByTitle", title: "Personal Portfolio" }`
4. API maps `title` to Convex's internal `query` parameter
5. Search executes successfully and returns document ID
6. AI proceeds with delete operation

## Why This Matters

This fix demonstrates an important principle: **parameter names should be semantic and aligned with how the AI naturally understands the operation**, not internal implementation details. 

The original design forced the AI to use abstract parameter names that didn't match the semantic meaning of the operation, leading to:
- Silent failures (undefined parameters)
- User confusion (AI couldn't fulfill simple requests)
- Debugging difficulty (error messages weren't clear)

The semantic approach eliminates this friction entirely.

## Files Modified

1. `/app/api/chat/route.ts` - Tool parameter names
2. `/app/api/documents/search/route.ts` - Parameter destructuring
3. `/components/main/ai-sidebar.tsx` - Tool handlers

## Commit

`1be4b14` - fix: Correct tool parameter names for AI search tools

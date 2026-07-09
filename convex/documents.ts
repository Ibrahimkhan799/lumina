import { v } from "convex/values";

import { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const archive = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const userId = identity.subject;

    const document = await ctx.db.get(args.id);
    if (!document) throw new Error("Document not found");
    if (document.userId !== userId) throw new Error("Unauthorized");

    const recursiveArchive = async (id: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", id),
        )
        .collect();

      for (const child of children) {
        await ctx.db.patch(child._id, { isArchived: true });
        await recursiveArchive(child._id);
      }
    };
    const d = await ctx.db.patch(args.id, { isArchived: true });
    await recursiveArchive(args.id);

    return d;
  },
});

export const getSidebar = query({
  args: {
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentDocument", args.parentDocument),
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    parentDocumentId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const userId = identity.subject;

    const document = await ctx.db.insert("documents", {
      title: args.title,
      parentDocument: args.parentDocumentId,
      userId,
      isArchived: false,
      isPublished: false,
    });

    return document;
  },
});

export const getArchived = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();

    return documents;
  },
});

export const restore = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const userId = identity.subject;

    const document = await ctx.db.get(args.id);
    if (!document) throw new Error("Document not found");
    if (document.userId !== userId) throw new Error("Unauthorized");

    const recursiveRestore = async (docId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", docId),
        )
        .collect();

      for (const child of children) {
        await ctx.db.patch(child._id, { isArchived: false });
        await recursiveRestore(child._id);
      }
    };

    const options: Partial<Doc<"documents">> = { isArchived: false };

    if (document.parentDocument) {
      const parent = await ctx.db.get(document.parentDocument);
      if (parent?.isArchived) {
        options.parentDocument = undefined;
      }
    }

    const d = await ctx.db.patch(args.id, options);

    await recursiveRestore(args.id);

    return d;
  },
});

export const remove = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const userId = identity.subject;

    const document = await ctx.db.get(args.id);
    if (!document) throw new Error("Document not found");
    if (document.userId !== userId) throw new Error("Unauthorized");

    const d = await ctx.db.delete(args.id);

    return d;
  },
});

export const search = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

export const getById = query({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    const document = await ctx.db.get(args.id);

    if (!document) return null;

    if (document.isPublished && !document.isArchived) {
      return document;
    }

    if (!identity) {
      throw new Error("User not authenticated");
    }

    const userId = identity.subject;

    if (document.userId !== userId) throw new Error("Unauthorized");

    return document;
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("User not authenticated");
    }

    const userId = identity.subject;

    const { id, ...rest } = args;

    const document = await ctx.db.get(id);

    if (!document) throw new Error("Document not found");

    if (document.userId !== userId) throw new Error("Unauthorized");

    return await ctx.db.patch(id, { ...rest });
  },
});

export const searchByTitle = query({
  args: {
    query: v.string(),
    fuzzy: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const userId = identity.subject;

    const allDocuments = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();

    const queryLower = args.query.toLowerCase();

    return allDocuments.filter((doc) => {
      const titleLower = doc.title.toLowerCase();
      if (args.fuzzy) {
        // Simple fuzzy match: check if all query chars appear in order
        let queryIdx = 0;
        for (let i = 0; i < titleLower.length && queryIdx < queryLower.length; i++) {
          if (titleLower[i] === queryLower[queryIdx]) {
            queryIdx++;
          }
        }
        return queryIdx === queryLower.length;
      } else {
        // Exact substring match
        return titleLower.includes(queryLower);
      }
    });
  },
});

export const searchByContent = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const userId = identity.subject;

    const allDocuments = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();

    const queryLower = args.query.toLowerCase();

    return allDocuments.filter((doc) => {
      const contentLower = (doc.content || "").toLowerCase();
      const titleLower = doc.title.toLowerCase();
      return contentLower.includes(queryLower) || titleLower.includes(queryLower);
    });
  },
});

export const getDocumentIdByTitle = query({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .filter((q) => q.eq(q.field("title"), args.title))
      .collect();

    if (documents.length === 0) {
      return null;
    }

    if (documents.length === 1) {
      return documents[0]._id;
    }

    return documents.map((doc) => ({ _id: doc._id, title: doc.title }));
  },
});

export const listAll = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const userId = identity.subject;

    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();
  },
});

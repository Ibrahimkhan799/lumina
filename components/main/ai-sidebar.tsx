"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import {
    ChevronsRightIcon,
    SparklesIcon,
    ArrowUp02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import TextareaAutosize from "react-textarea-autosize";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "@/components/ui/button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

// Document cache interface
interface CachedDocument {
  id: string;
  title: string;
  isArchived: boolean;
  lastSync: number;
}

interface DocumentCache {
  v: number;
  documents: CachedDocument[];
  lastFullSync: number;
}

const CACHE_KEY = "lumina_doc_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

const loadCacheFromStorage = (): CachedDocument[] => {
  if (typeof window === "undefined") return [];
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return [];
    const parsed: DocumentCache = JSON.parse(cached);
    // Check if cache is fresh (within TTL)
    if (Date.now() - parsed.lastFullSync < CACHE_TTL) {
      return parsed.documents;
    }
    return [];
  } catch {
    return [];
  }
};

const saveCacheToStorage = (documents: CachedDocument[]) => {
  if (typeof window === "undefined") return;
  try {
    const cache: DocumentCache = {
      v: 1,
      documents,
      lastFullSync: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Silently fail if localStorage is unavailable
  }
};

const updateCacheWithDocuments = (documents: AnyRecord[]) => {
  const cached = loadCacheFromStorage();
  const cachedMap = new Map(cached.map((d) => [d.id, d]));

  // Add or update documents from fresh query
  documents.forEach((doc) => {
    cachedMap.set(doc._id, {
      id: doc._id,
      title: doc.title,
      isArchived: doc.isArchived,
      lastSync: Date.now(),
    });
  });

  saveCacheToStorage(Array.from(cachedMap.values()));
};

export const AiSidebar = () => {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const createDocument = useMutation(api.documents.create);
    const updateDocument = useMutation(api.documents.update);
    const archiveDocument = useMutation(api.documents.archive);
    const restoreDocument = useMutation(api.documents.restore);
    const removeDocument = useMutation(api.documents.remove);

    // For search queries, we'll fetch them inside the tool handlers directly
    // This avoids the complexity of managing multiple useState queries

    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isResetting, setIsResetting] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const sidebarRef = useRef<HTMLDivElement>(null);
    const isResizingRef = useRef(false);
    const endRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, status, addToolResult } = useChat({
        transport: new DefaultChatTransport({ api: "/api/chat" }),
        onToolCall: async ({ toolCall }) => {
            const input = toolCall.input as AnyRecord;

            // Handle search by title
            if (toolCall.toolName === "searchDocumentsByTitle") {
                try {
                    const title = input.title as string;
                    const fuzzy = (input.fuzzy as boolean | undefined) ?? false;
                    
                    const response = await fetch("/api/documents/search", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            method: "searchByTitle",
                            title,
                            fuzzy,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`Search failed: ${response.statusText}`);
                    }

                    const data = await response.json();
                    if (data.success && data.documents) {
                        updateCacheWithDocuments(data.documents.map((d: AnyRecord) => ({
                            _id: d.id,
                            title: d.title,
                            isArchived: d.isArchived,
                        })));
                    }

                    addToolResult({
                        tool: "searchDocumentsByTitle" as never,
                        toolCallId: toolCall.toolCallId,
                        output: data,
                    });
                } catch (e) {
                    const errorMsg = e instanceof Error ? e.message : String(e);
                    addToolResult({
                        tool: "searchDocumentsByTitle" as never,
                        toolCallId: toolCall.toolCallId,
                        output: { success: false, error: errorMsg },
                    });
                }
            }

            // Handle search by content
            if (toolCall.toolName === "searchDocumentsByContent") {
                try {
                    const content = input.content as string;
                    
                    const response = await fetch("/api/documents/search", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            method: "searchByContent",
                            content,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`Search failed: ${response.statusText}`);
                    }

                    const data = await response.json();
                    if (data.success && data.documents) {
                        updateCacheWithDocuments(data.documents.map((d: AnyRecord) => ({
                            _id: d.id,
                            title: d.title,
                            isArchived: d.isArchived,
                        })));
                    }

                    addToolResult({
                        tool: "searchDocumentsByContent" as never,
                        toolCallId: toolCall.toolCallId,
                        output: data,
                    });
                } catch (e) {
                    const errorMsg = e instanceof Error ? e.message : String(e);
                    addToolResult({
                        tool: "searchDocumentsByContent" as never,
                        toolCallId: toolCall.toolCallId,
                        output: { success: false, error: errorMsg },
                    });
                }
            }

            // Handle list all documents
            if (toolCall.toolName === "listAllDocuments") {
                try {
                    const response = await fetch("/api/documents/search", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            method: "listAll",
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`Fetch failed: ${response.statusText}`);
                    }

                    const data = await response.json();
                    if (data.success && data.documents) {
                        updateCacheWithDocuments(data.documents.map((d: AnyRecord) => ({
                            _id: d.id,
                            title: d.title,
                            isArchived: d.isArchived,
                        })));
                    }

                    addToolResult({
                        tool: "listAllDocuments" as never,
                        toolCallId: toolCall.toolCallId,
                        output: data,
                    });
                } catch (e) {
                    const errorMsg = e instanceof Error ? e.message : String(e);
                    addToolResult({
                        tool: "listAllDocuments" as never,
                        toolCallId: toolCall.toolCallId,
                        output: { success: false, error: errorMsg },
                    });
                }
            }

            if (toolCall.toolName === "createDocument") {
                try {
                    if (!input.title) {
                        throw new Error("Document title is required.");
                    }
                    const id = await createDocument({ title: input.title as string });
                    // Update cache with new document
                    const cached = loadCacheFromStorage();
                    cached.push({
                        id: id.toString(),
                        title: input.title as string,
                        isArchived: false,
                        lastSync: Date.now(),
                    });
                    saveCacheToStorage(cached);
                    toast.success(`AI created: "${input.title}"`);
                    addToolResult({
                        tool: "createDocument" as never,
                        toolCallId: toolCall.toolCallId,
                        output: { success: true, id },
                    });
                } catch (e) {
                    const errorMsg = e instanceof Error ? e.message : String(e);
                    toast.error(`Failed to create document: ${errorMsg}`);
                    addToolResult({
                        tool: "createDocument" as never,
                        toolCallId: toolCall.toolCallId,
                        output: { success: false, error: errorMsg },
                    });
                }
            }
            if (toolCall.toolName === "updateDocument") {
                try {
                    if (!input.id) {
                        throw new Error("Missing required document ID for update.");
                    }
                    await updateDocument({
                        id: input.id as Id<"documents">,
                        title: input.title as string | undefined,
                        content: input.content as string | undefined,
                        icon: input.icon as string | undefined,
                        coverImage: input.coverImage as string | undefined,
                        isPublished: input.isPublished as boolean | undefined,
                    });
                    toast.success("AI updated a document");
                    addToolResult({
                        tool: "updateDocument" as never,
                        toolCallId: toolCall.toolCallId,
                        output: { success: true },
                    });
                } catch (e) {
                    const errorMsg = e instanceof Error ? e.message : String(e);
                    toast.error(`Failed to update document: ${errorMsg}`);
                    addToolResult({
                        tool: "updateDocument" as never,
                        toolCallId: toolCall.toolCallId,
                        output: { success: false, error: errorMsg },
                    });
                }
            }
            if (toolCall.toolName === "archiveDocument") {
                try {
                    if (!input.id) {
                        throw new Error("Missing required document ID for archive.");
                    }
                    await archiveDocument({ id: input.id as Id<"documents"> });
                    // Update cache - remove archived document
                    const cached = loadCacheFromStorage();
                    const updated = cached.filter((d) => d.id !== input.id);
                    saveCacheToStorage(updated);
                    toast.success("AI archived a document");
                    addToolResult({
                        tool: "archiveDocument" as never,
                        toolCallId: toolCall.toolCallId,
                        output: { success: true },
                    });
                } catch (e) {
                    const errorMsg = e instanceof Error ? e.message : String(e);
                    toast.error(`Failed to archive document: ${errorMsg}`);
                    addToolResult({
                        tool: "archiveDocument" as never,
                        toolCallId: toolCall.toolCallId,
                        output: { success: false, error: errorMsg },
                    });
                }
            }
            if (toolCall.toolName === "restoreDocument") {
                try {
                    if (!input.id) {
                        throw new Error("Missing required document ID for restore.");
                    }
                    await restoreDocument({ id: input.id as Id<"documents"> });
                    // Note: Cache will be re-synced when needed (5 min TTL)
                    // For now, just clear it to force fresh fetch
                    localStorage.removeItem(CACHE_KEY);
                    toast.success("AI restored a document");
                    addToolResult({
                        tool: "restoreDocument" as never,
                        toolCallId: toolCall.toolCallId,
                        output: { success: true },
                    });
                } catch (e) {
                    const errorMsg = e instanceof Error ? e.message : String(e);
                    toast.error(`Failed to restore document: ${errorMsg}`);
                    addToolResult({
                        tool: "restoreDocument" as never,
                        toolCallId: toolCall.toolCallId,
                        output: { success: false, error: errorMsg },
                    });
                }
            }
            if (toolCall.toolName === "deleteDocument") {
                try {
                    if (!input.id) {
                        throw new Error("Missing required document ID for deletion.");
                    }
                    await removeDocument({ id: input.id as Id<"documents"> });
                    // Update cache - remove deleted document
                    const cached = loadCacheFromStorage();
                    const updated = cached.filter((d) => d.id !== input.id);
                    saveCacheToStorage(updated);
                    toast.success("AI deleted a document");
                    addToolResult({
                        tool: "deleteDocument" as never,
                        toolCallId: toolCall.toolCallId,
                        output: { success: true },
                    });
                } catch (e) {
                    const errorMsg = e instanceof Error ? e.message : String(e);
                    toast.error(`Failed to delete document: ${errorMsg}`);
                    addToolResult({
                        tool: "deleteDocument" as never,
                        toolCallId: toolCall.toolCallId,
                        output: { success: false, error: errorMsg },
                    });
                }
            }
        },
    });

    const isLoading = status === "submitted" || status === "streaming";

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault();
        event.stopPropagation();
        isResizingRef.current = true;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizingRef.current) return;
        let newWidth = window.innerWidth - e.clientX;
        if (newWidth < 280) newWidth = 280;
        if (newWidth > 700) newWidth = 700;
        if (sidebarRef.current) {
            sidebarRef.current.style.width = `${newWidth}px`;
        }
    };

    const handleMouseUp = () => {
        isResizingRef.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    const expand = (width = "320px") => {
        if (sidebarRef.current) {
            setIsCollapsed(false);
            setIsResetting(true);
            sidebarRef.current.style.width = isMobile ? "100%" : width;
            setTimeout(() => setIsResetting(false), 300);
        }
    };

    const collapse = () => {
        if (sidebarRef.current) {
            setIsCollapsed(true);
            setIsResetting(true);
            sidebarRef.current.style.width = "0";
            setTimeout(() => setIsResetting(false), 300);
        }
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Initialize cache and inject into AI context on component mount
    useEffect(() => {
        if (messages.length === 0) {
            const cachedDocs = loadCacheFromStorage();
            if (cachedDocs.length > 0) {
                const contextMessage = `Based on your previous sessions, I know about these documents:\n${cachedDocs.map((d) => `• ${d.title} (${d.isArchived ? "archived" : "active"})`).join("\n")}\n\nLet me know if you'd like to work with any of these or create new ones.`;
                console.log("[v0] Loaded cache with", cachedDocs.length, "documents");
            }
        }
    }, [messages.length]);

    const onSubmit = () => {
        const trimmed = inputValue.trim();
        if (!trimmed || isLoading) return;
        setInputValue("");
        sendMessage({ text: trimmed });
    };

    return (
        <>
            <aside
                ref={sidebarRef}
                className={cn(
                    "group/ai-sidebar h-full bg-secondary/80 backdrop-blur-xl border-l overflow-hidden relative flex w-0 flex-col z-[99999] shadow-2xl",
                    isResetting && "transition-all ease-in-out duration-300",
                )}
            >
                {/* Resize handle */}
                <div
                    onMouseDown={handleMouseDown}
                    className="opacity-0 group-hover/ai-sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1.5 bg-primary/20 left-0 top-0 z-50 hover:bg-indigo-500/50"
                />

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-background/50 sticky top-0 z-10 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-x-2">
                        <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500">
                            <HugeiconsIcon icon={SparklesIcon} size={18} className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm">Lumina AI</span>
                    </div>
                    <div className="flex items-center gap-x-1">
                        <div
                            role="button"
                            onClick={() => expand("700px")}
                            className="h-7 w-7 flex items-center justify-center text-muted-foreground rounded-sm hover:bg-neutral-200/60 dark:hover:bg-neutral-700 transition text-base font-bold"
                            title="Detailed View"
                        >
                            ⤢
                        </div>
                        <div
                            role="button"
                            onClick={collapse}
                            className="h-7 w-7 flex items-center justify-center text-muted-foreground rounded-sm hover:bg-neutral-200/60 dark:hover:bg-neutral-700 transition"
                        >
                            <HugeiconsIcon icon={ChevronsRightIcon} size={18} className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-y-3 opacity-70 py-16">
                            <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <HugeiconsIcon icon={SparklesIcon} size={24} className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium">How can I help you today?</p>
                            <p className="text-xs text-center px-4 leading-relaxed">
                                I can create, archive, and manage your documents.{" "}
                                <br />Try: &quot;Create 3 documents about React&quot;
                            </p>
                        </div>
                    )}
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={cn(
                                "flex flex-col max-w-[88%]",
                                m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap shadow-sm leading-relaxed",
                                    m.role === "user"
                                        ? "bg-indigo-500 text-white rounded-br-sm"
                                        : "bg-background border rounded-bl-sm"
                                )}
                            >
                                {m.parts.map((part, i) => {
                                    if (part.type === "text") {
                                        return <span key={i}>{part.text}</span>;
                                    }
                                    if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
                                        const toolPart = part as AnyRecord;

                                        // Detect if execution is completely finished
                                        const isDone = toolPart.state === "output-available" || toolPart.state === "result";
                                        // Verify if the returned output caught an application/validation error
                                        const isFailed = toolPart.state === "output-error" || (isDone && toolPart.result?.success === false);

                                        return (
                                            <div key={i} className="mt-2 p-2 bg-muted/60 rounded-lg text-xs font-mono border">
                                                <span className="text-indigo-400 font-semibold">
                                                    {toolPart.toolName ?? part.type.replace("tool-", "")}
                                                </span>
                                                {isFailed ? (
                                                    <span className="text-red-400 ml-2">✗ Failed</span>
                                                ) : isDone ? (
                                                    <span className="text-teal-400 ml-2">✓ Done</span>
                                                ) : (
                                                    <span className="text-yellow-400 ml-2 animate-pulse">Running…</span>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-x-1.5 mr-auto px-3 py-2">
                            <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" />
                            <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                            <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                        </div>
                    )}
                    <div ref={endRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-background/50 border-t backdrop-blur-md shrink-0">
                    <div className="relative flex items-end gap-2">
                        <TextareaAutosize
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask AI for help..."
                            className="flex-1 resize-none bg-background border rounded-xl pl-3.5 pr-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
                            maxRows={6}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    onSubmit();
                                }
                            }}
                        />
                        <Button
                            size="icon"
                            type="button"
                            onClick={onSubmit}
                            disabled={!inputValue.trim() || isLoading}
                            className="h-9 w-9 shrink-0 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 transition-all"
                        >
                            <HugeiconsIcon icon={ArrowUp02Icon} size={16} className="w-4 h-4 text-white" />
                        </Button>
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground mt-2">
                        AI can make mistakes. Check important info.
                    </p>
                </div>
            </aside>

            {/* Floating toggle when collapsed */}
            {isCollapsed && (
                <div
                    onClick={() => expand()}
                    className="fixed bottom-6 right-6 h-12 w-12 bg-indigo-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-xl hover:bg-indigo-600 transition-all hover:scale-105 z-[99998] group ring-0 hover:ring-4 ring-indigo-500/30"
                >
                    <HugeiconsIcon
                        icon={SparklesIcon}
                        size={22}
                        className="w-5 h-5 group-hover:rotate-12 transition-transform"
                    />
                </div>
            )}
        </>
    );
};

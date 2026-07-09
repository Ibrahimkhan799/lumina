"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import {
    ChevronsRightIcon,
    SparklesIcon,
    ArrowUp02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import TextareaAutosize from "react-textarea-autosize";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "@/components/ui/button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export const AiSidebar = () => {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isResetting, setIsResetting] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const sidebarRef = useRef<HTMLDivElement>(null);
    const isResizingRef = useRef(false);
    const endRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, status, error } = useChat({
        api: "/api/chat",
        maxSteps: 20,
    });

    const isLoading = status === "in_progress" || status === "streaming";

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
    }, [messages, status]);

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
                                        : m.role === "system" || m.role === ("data" as string)
                                            ? "bg-red-50 text-red-600 border-red-200"
                                            : "bg-background border rounded-bl-sm"
                                )}
                            >
                                {m.parts ? m.parts.map((part, i) => {
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
                                }) : (m.content ? <span>{String(m.content)}</span> : null)}
                            </div>
                        </div>
                    ))}
                    {error && (
                        <div className="flex flex-col max-w-[88%] mr-auto items-start">
                            <div className="px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap shadow-sm leading-relaxed bg-red-50 border border-red-200 text-red-600 rounded-bl-sm">
                                <strong>Error:</strong> {error.message || "An unexpected error occurred."}
                            </div>
                        </div>
                    )}
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

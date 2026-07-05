"use client";

import { PartialBlock } from "@blocknote/core";
// 1. Import BlockNoteView from the UI package instead of /react
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useEdgeStore } from "@/lib/edgestore";

// 2. Import the Mantine UI theme styles
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";

type EditorProps = {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
};

const Editor = ({
  onChange,
  initialContent,
  editable = true,
}: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  const handleUpload = async (file: File) => {
    const res = await edgestore.publicFiles.upload({ file });
    return res.url;
  };

  const getInitialContent = (): PartialBlock[] | undefined => {
    if (!initialContent || initialContent === "" || initialContent === "[]") {
      return undefined;
    }

    try {
      const parsed = JSON.parse(initialContent);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        typeof parsed[0] === "object" &&
        "type" in parsed[0]
      ) {
        return parsed as PartialBlock[];
      }
      return undefined;
    } catch (error) {
      console.error("Failed to parse initialContent JSON:", error);
      return undefined;
    }
  };

  const editor = useCreateBlockNote({
    initialContent: getInitialContent(),
    uploadFile: handleUpload,
  });

  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      onChange={() => {
        onChange(JSON.stringify(editor.document));
      }}
      theme={resolvedTheme === "dark" ? "dark" : "light"}

    />
  );
};

export default Editor;

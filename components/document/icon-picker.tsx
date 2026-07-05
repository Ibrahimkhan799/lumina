"use client";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface IconPickerProps {
  onChange: (emoji: string) => void;
  children: React.ReactNode;
  asChild?: boolean;
}

export const IconPicker = ({
  onChange,
  children,
  asChild,
}: IconPickerProps) => {
  const { resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme === "dark" ? "dark" : "light";

  const themeMap = {
    dark: Theme.DARK,
    light: Theme.LIGHT,
  };

  const theme = themeMap[currentTheme];

  return (
    <Popover>
      <PopoverTrigger asChild={asChild}>{children}</PopoverTrigger>
      <PopoverContent className="p-0 w-fit border-none shadow-none">
        <EmojiPicker
          width={280}
          height={300}
          theme={theme}
          emojiStyle={EmojiStyle.APPLE}
          previewConfig={{ showPreview: false }}
          onEmojiClick={(data) => {
            onChange(data.emoji);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

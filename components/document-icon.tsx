"use client";

import { Emoji, EmojiStyle, emojiByUnified } from "emoji-picker-react";

/**
 * Converts a raw emoji character (e.g. "😀", "🤙🏿") into the "unified"
 * hex-codepoint string format used internally by emoji-picker-react
 * (e.g. "1f600", "1f919-1f3ff").
 */
function toUnified(emoji: string): string {
  return Array.from(emoji)
    .map((char) => char.codePointAt(0)!.toString(16))
    .join("-");
}

interface DocumentIconProps {
  icon: string;
  size?: number;
}

/**
 * Renders a document's emoji icon using the same Apple emoji artwork shown
 * in the IconPicker, instead of relying on the OS's native emoji font
 * (which would otherwise look inconsistent with what was picked).
 */
export const DocumentIcon = ({ icon, size = 18 }: DocumentIconProps) => {
  const unified = toUnified(icon);

  // Fall back to the raw character if it can't be resolved to Apple artwork
  // (e.g. a non-standard or unrecognized character).
  if (!emojiByUnified(unified)) {
    return <>{icon}</>;
  }

  return <Emoji unified={unified} emojiStyle={EmojiStyle.APPLE} size={size} />;
};

import React from "react";

interface TypingIndicatorProps {
  names: string[];
}

export const TypingIndicator = ({ names }: TypingIndicatorProps) => {
  if (names.length === 0) return null;

  const text =
    names.length === 1
      ? `${names[0]} is typing...`
      : names.length === 2
        ? `${names[0]} and ${names[1]} are typing...`
        : `${names[0]} and ${names.length - 1} others are typing...`;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
      <div className="flex gap-1">
        <span className="animate-bounce">.</span>
        <span className="animate-bounce delay-100">.</span>
        <span className="animate-bounce delay-200">.</span>
      </div>
      {text}
    </div>
  );
};

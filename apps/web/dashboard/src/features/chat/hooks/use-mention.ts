import { useState, useCallback, useRef } from "react";
import type { MentionableDocument } from "../components/mention-popup";

export interface MentionInfo {
  isOpen: boolean;
  query: string;
  position: { x: number; y: number };
  startIndex: number;
  endIndex: number;
}

export function useMention(
  _documents: MentionableDocument[],
  onMentionSelect: (
    doc: MentionableDocument,
    startIndex: number,
    endIndex: number,
  ) => void,
) {
  const [mentionInfo, setMentionInfo] = useState<MentionInfo>({
    isOpen: false,
    query: "",
    position: { x: 0, y: 0 },
    startIndex: 0,
    endIndex: 0,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = useCallback(
    (value: string, cursorPosition: number) => {
      const beforeCursor = value.slice(0, cursorPosition);
      const atIndex = beforeCursor.lastIndexOf("@");

      if (atIndex !== -1 && atIndex < cursorPosition) {
        // Check if @ is not part of an email or already processed mention
        const beforeAt = beforeCursor.slice(0, atIndex);
        const afterAt = beforeCursor.slice(atIndex + 1);

        // Don't show popup if @ is in the middle of a word or email
        if (
          (beforeAt.length === 0 || /\s$/.test(beforeAt)) &&
          !afterAt.includes(" ") &&
          !afterAt.includes("@")
        ) {
          const query = afterAt;
          const rect = textareaRef.current?.getBoundingClientRect();

          if (rect) {
            // Calculate position for popup
            const lineHeight =
              Number.parseInt(
                getComputedStyle(
                  textareaRef.current || document.createElement("textarea"),
                ).lineHeight,
                10,
              ) || 20;
            const lines = beforeCursor.split("\n").length;
            const x = rect.left + (atIndex % 50) * 8; // Approximate character width
            const y = rect.top + lines * lineHeight + 20;

            setMentionInfo({
              isOpen: true,
              query,
              position: { x, y },
              startIndex: atIndex,
              endIndex: cursorPosition,
            });
            return;
          }
        }
      }

      // Close popup if no valid @ found
      if (mentionInfo.isOpen) {
        setMentionInfo((prev) => ({ ...prev, isOpen: false }));
      }
    },
    [mentionInfo.isOpen],
  );

  const handleMentionSelect = useCallback(
    (doc: MentionableDocument) => {
      if (textareaRef.current && mentionInfo.isOpen) {
        const currentValue = textareaRef.current.value;
        const beforeMention = currentValue.slice(0, mentionInfo.startIndex);
        const afterMention = currentValue.slice(mentionInfo.endIndex);

        // Replace @query with @docname
        const newValue = `${beforeMention}@${doc.name}${afterMention}`;
        textareaRef.current.value = newValue;

        // Update cursor position after the mention
        const newCursorPos = mentionInfo.startIndex + doc.name.length + 1;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();

        // Call the callback with mention info
        onMentionSelect(doc, mentionInfo.startIndex, newCursorPos);

        // Close the popup
        setMentionInfo((prev) => ({ ...prev, isOpen: false }));
      }
    },
    [mentionInfo, onMentionSelect],
  );

  const closeMention = useCallback(() => {
    setMentionInfo((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    mentionInfo,
    textareaRef,
    handleInputChange,
    handleMentionSelect,
    closeMention,
  };
}

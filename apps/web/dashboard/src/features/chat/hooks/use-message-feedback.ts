import { useState } from "react";

interface UseMessageFeedbackReturn {
  copied: boolean;
  feedback: "good" | "bad" | null;
  isReading: boolean;
  handleCopy: (content: string) => Promise<void>;
  handleFeedback: (type: "good" | "bad") => void;
  handleReadAloud: (content: string) => void;
  handleRetry: () => void;
}

export function useMessageFeedback(): UseMessageFeedbackReturn {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);
  const [isReading, setIsReading] = useState(false);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleFeedback = (type: "good" | "bad") => {
    setFeedback(type);
    // Here you could send feedback to your backend
    console.log(`Feedback: ${type} response`);
  };

  const handleReadAloud = (content: string) => {
    if ("speechSynthesis" in window) {
      if (isReading) {
        // Stop reading
        speechSynthesis.cancel();
        setIsReading(false);
      } else {
        // Start reading
        speechSynthesis.cancel(); // Cancel any existing speech
        const utterance = new SpeechSynthesisUtterance(content);
        utterance.rate = 0.9; // Slightly slower for better comprehension
        utterance.pitch = 1;

        // Set up event listeners to track reading state
        utterance.onstart = () => setIsReading(true);
        utterance.onend = () => setIsReading(false);
        utterance.onerror = () => setIsReading(false);

        speechSynthesis.speak(utterance);
      }
    }
  };

  const handleRetry = () => {
    // Here you could implement retry logic
    console.log("Retry requested");
  };

  return {
    copied,
    feedback,
    isReading,
    handleCopy,
    handleFeedback,
    handleReadAloud,
    handleRetry,
  };
}

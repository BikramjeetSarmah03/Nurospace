import {
  ArrowUpIcon,
  AtSignIcon,
  SearchIcon,
  YoutubeIcon,
  FileTextIcon,
  BotIcon,
  GlobeIcon,
  BookOpenIcon,
  ClockIcon,
  QuoteIcon,
  LayersIcon,
  PlusIcon,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { API } from "@/lib/api-client";

interface ChatBoxProps {
  onSubmit: (
    value: string,
    context?: { documents: ResourceDocument[] },
  ) => void;
}

interface ResourceDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  createdAt: string;
  userId: string;
}

interface MentionOption {
  id: string;
  name: string;
  type:
    | "agent"
    | "file"
    | "web"
    | "youtube"
    | "research"
    | "workspace"
    | "papers"
    | "form"
    | "citation"
    | "flashcards";
  icon: React.ReactNode;
  description: string;
  category: "agent" | "files";
}

export default function ChatBox({ onSubmit }: ChatBoxProps) {
  const [value, setValue] = useState("");
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [documents, setDocuments] = useState<ResourceDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<
    ResourceDocument[]
  >([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Define all mention options
  const getAllMentionOptions = (): MentionOption[] => {
    const agentOptions: MentionOption[] = [
      {
        id: "research",
        name: "Research",
        type: "research",
        icon: <SearchIcon className="h-4 w-4" />,
        description: "Conduct comprehensive research",
        category: "agent",
      },
      {
        id: "search-workspace",
        name: "Search Workspace",
        type: "workspace",
        icon: <FileTextIcon className="h-4 w-4" />,
        description: "Search through your workspace",
        category: "agent",
      },
      {
        id: "search-web",
        name: "Search Web",
        type: "web",
        icon: <GlobeIcon className="h-4 w-4" />,
        description: "Search the internet for current information",
        category: "agent",
      },
      {
        id: "search-papers",
        name: "Search Papers",
        type: "papers",
        icon: <BookOpenIcon className="h-4 w-4" />,
        description: "Search academic papers and research",
        category: "agent",
      },
      {
        id: "search-youtube",
        name: "Search YouTube",
        type: "youtube",
        icon: <YoutubeIcon className="h-4 w-4" />,
        description: "Search YouTube for videos and content",
        category: "agent",
      },
      {
        id: "complete-form",
        name: "Complete Form",
        type: "form",
        icon: <ClockIcon className="h-4 w-4" />,
        description: "Automatically complete forms",
        category: "agent",
      },
      {
        id: "create-citation",
        name: "Create Citation",
        type: "citation",
        icon: <QuoteIcon className="h-4 w-4" />,
        description: "Generate proper citations",
        category: "agent",
      },
      {
        id: "create-flashcards",
        name: "Create Flashcards",
        type: "flashcards",
        icon: <LayersIcon className="h-4 w-4" />,
        description: "Create study flashcards",
        category: "agent",
      },
    ];

    const fileOptions: MentionOption[] = documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      type: "file" as const,
      icon: <FileTextIcon className="h-4 w-4" />,
      description: `${doc.type} document`,
      category: "files",
    }));

    return [...agentOptions, ...fileOptions];
  };

  // Get filtered options based on search query
  const getFilteredOptions = () => {
    const allOptions = getAllMentionOptions();
    if (!mentionQuery) return allOptions;

    return allOptions.filter(
      (option) =>
        option.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        option.description.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        option.category.toLowerCase().includes(mentionQuery.toLowerCase()),
    );
  };

  // Fetch user documents when component mounts
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoadingDocuments(true);

        // Log environment info
        console.log(
          "API Base URL:",
          `${import.meta.env.VITE_SERVER_URL}/api/v1`,
        );
        console.log(
          "Full resources URL:",
          `${import.meta.env.VITE_SERVER_URL}/api/v1/resources`,
        );

        // First try the health endpoint to test connectivity
        try {
          const healthResponse = await API.get("/resources/health");
          console.log("Health check response:", healthResponse);
        } catch (healthError) {
          console.log("Health check failed:", healthError);
        }

        // Now try to get resources
        const response = await API.get("/resources");

        console.log("Resources API response:", response); // Debug log
        console.log("Response status:", response.status); // Debug log
        console.log("Response data type:", typeof response.data); // Debug log

        // Handle the correct response structure: { success: true, data: resources[] }
        let docs = [];
        if (response.data?.success && Array.isArray(response.data.data)) {
          docs = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          docs = response.data.data;
        } else if (
          response.data?.resources &&
          Array.isArray(response.data.resources)
        ) {
          docs = response.data.resources;
        } else if (response.data?.items && Array.isArray(response.data.items)) {
          docs = response.data.items;
        }

        console.log("Extracted documents:", docs); // Debug log
        console.log("Documents count:", docs.length); // Debug log

        setDocuments(docs);
      } catch (error) {
        console.error("Failed to fetch documents:", error);

        if (error instanceof Error) {
          // error is a standard Error object
          console.error("Error details:", {
            message: error.message,
          });
        } else if (typeof error === "object" && error !== null) {
          // Try to extract Axios-like error details
          const errObj = error as {
            message?: string;
            response?: {
              status?: number;
              statusText?: string;
              data?: unknown;
            };
          };
          console.error("Error details:", {
            message: errObj.message,
            status: errObj.response?.status,
            statusText: errObj.response?.statusText,
            data: errObj.response?.data,
          });
        } else {
          // Unknown error type
          console.error("Unknown error type:", error);
        }
        // Check if it's an authentication error
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          (error as { response?: { status?: number } }).response?.status === 401
        ) {
          console.error("Authentication failed - user not logged in");
        }
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchDocuments();
  }, []);

  const adjustHeight = useCallback((reset = false) => {
    if (textareaRef.current) {
      if (reset) {
        textareaRef.current.style.height = "auto";
      } else {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle mention popup navigation first
    if (showMentionPopup) {
      const filteredOptions = getFilteredOptions();
      if (e.key === "Enter") {
        e.preventDefault();
        if (filteredOptions.length > 0) {
          handleMentionSelect(filteredOptions[selectedMentionIndex]);
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        );
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowMentionPopup(false);
        setSelectedDocuments([]); // Clear selected documents when popup is cancelled
      }
      return; // Don't proceed to chat submission when popup is open
    }

    // Only handle Enter for chat submission when popup is closed
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        // Prepare context with selected documents if any
        const context =
          selectedDocuments.length > 0
            ? { documents: selectedDocuments }
            : undefined;

        onSubmit(value, context);
        setValue("");
        adjustHeight(true);
        setShowMentionPopup(false);
        setSelectedDocuments([]); // Clear selected documents when sending
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const _oldValue = value;
    setValue(newValue);

    // Check for @ symbol to show mention popup
    const cursorPos = e.target.selectionStart || 0;
    const beforeCursor = newValue.slice(0, cursorPos);
    const atIndex = beforeCursor.lastIndexOf("@");

    if (atIndex !== -1 && atIndex < cursorPos) {
      const afterAt = beforeCursor.slice(atIndex + 1);
      if (!afterAt.includes(" ") && !afterAt.includes("@")) {
        setMentionQuery(afterAt);
        setShowMentionPopup(true);
        setSelectedMentionIndex(0);
        return;
      }
    }

    // Check if user manually removed @ symbol (not just typing)
    if (showMentionPopup && !newValue.includes("@")) {
      setShowMentionPopup(false);
      setSelectedDocuments([]); // Clear documents only when @ is completely removed
    } else if (showMentionPopup) {
      setShowMentionPopup(false);
    }
  };

  const handleMentionSelect = (option: MentionOption) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const currentValue = textarea.value;
      const cursorPos = textarea.selectionStart || 0;

      // Find the last "@" before the cursor
      const beforeCursor = currentValue.slice(0, cursorPos);
      const afterCursor = currentValue.slice(cursorPos);
      const atIndex = beforeCursor.lastIndexOf("@");

      if (atIndex !== -1) {
        // Replace "@something" with "@Name"
        const insertText = `@${option.name}`;
        const newValue =
          beforeCursor.slice(0, atIndex) + insertText + afterCursor;

        setValue(newValue);
        textarea.value = newValue;

        // Move cursor right after the mention
        const newCursorPos = atIndex + insertText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }
    }

    // If it's a document, add it to selected documents (avoid duplicates)
    if (option.type === "file") {
      const doc = documents.find((d) => d.id === option.id);
      if (doc && !selectedDocuments.find((d) => d.id === doc.id)) {
        setSelectedDocuments((prev) => [...prev, doc]);
      }
    }

    setShowMentionPopup(false);
  };

  const handleSubmit = () => {
    if (value.trim()) {
      // Prepare context with selected documents if any
      const context =
        selectedDocuments.length > 0
          ? { documents: selectedDocuments }
          : undefined;

      onSubmit(value, context);
      setValue("");
      adjustHeight(true);
      setShowMentionPopup(false);
      setSelectedDocuments([]); // Clear selected documents when sending
    }
  };

  const _getCategoryIcon = (category: string) => {
    return category === "agent" ? (
      <BotIcon className="h-3 w-3" />
    ) : (
      <FileTextIcon className="h-3 w-3" />
    );
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (extension === "pdf") return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || ""))
      return "image";
    if (["txt", "md", "doc", "docx"].includes(extension || "")) return "notes";
    return "notes"; // default fallback
  };

  const showUploadStatus = (message: string, type: "success" | "error") => {
    setUploadStatus({ show: true, message, type });
    setTimeout(
      () => setUploadStatus({ show: false, message: "", type: "success" }),
      5000,
    );
  };

  const removeSelectedDocument = (documentId: string) => {
    setSelectedDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  const filteredOptions = getFilteredOptions();
  const agentFiltered = filteredOptions.filter((o) => o.category === "agent");
  const fileFiltered = filteredOptions.filter((o) => o.category === "files");

  return (
    <div className="relative">
      {/* Selected Documents Display Above Chat */}
      {selectedDocuments.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-medium text-blue-800">📎</span>
          {selectedDocuments.map((doc) => (
            <span
              key={doc.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-blue-100 border border-blue-200 text-blue-800"
            >
              <FileTextIcon className="h-3 w-3" />
              <span className="truncate max-w-24">{doc.name}</span>
              <button
                type="button"
                onClick={() => removeSelectedDocument(doc.id)}
                className="ml-1 p-0.5 rounded-full hover:bg-blue-200 transition-colors"
                title="Remove document"
              >
                <span className="text-blue-600 font-bold text-xs">×</span>
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative flex items-end gap-3 p-3 bg-muted/30 rounded-2xl border border-border/50 focus-within:border-border focus-within:ring-2 focus-within:ring-ring/20 transition-all duration-200">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask Anything..."
          className="flex-1 resize-none bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none min-h-[32px] max-h-[120px]"
          style={{ height: "32px" }}
        />

        {/* Upload Document Button */}
        <button
          type="button"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept =
              ".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp";
            input.multiple = false;
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                try {
                  setIsUploading(true);
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("type", getFileType(file.name));

                  console.log(
                    "Uploading file:",
                    file.name,
                    "with type:",
                    getFileType(file.name),
                  );

                  const response = await API.post(
                    "/resources/upload",
                    formData,
                    {
                      headers: {
                        "Content-Type": "multipart/form-data",
                      },
                    },
                  );

                  if (response.data.success) {
                    console.log(
                      "Document uploaded successfully:",
                      response.data,
                    );
                    showUploadStatus(
                      "Document uploaded successfully!",
                      "success",
                    );
                    // Refresh the documents list
                    const docsResponse = await API.get("/resources");
                    if (
                      docsResponse.data?.success &&
                      Array.isArray(docsResponse.data.data)
                    ) {
                      setDocuments(docsResponse.data.data);
                    }
                  } else {
                    showUploadStatus(
                      `Upload failed: ${response.data.message}`,
                      "error",
                    );
                  }
                } catch (error: unknown) {
                  console.error("Failed to upload document:", error);
                  const errorMessage =
                    (error as { response?: { data?: { message?: string } } })
                      .response?.data?.message ||
                    (error as Error).message ||
                    "Upload failed";
                  showUploadStatus(`Upload failed: ${errorMessage}`, "error");
                } finally {
                  setIsUploading(false);
                }
              }
            };
            input.click();
          }}
          disabled={isUploading}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
            isUploading
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
          title={isUploading ? "Uploading..." : "Upload document"}
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
        </button>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim()}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
            value.trim()
              ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          <ArrowUpIcon className="h-4 w-4" />
        </button>
      </div>

      {/* @ Mention Button Below Textarea */}
      <div className="flex justify-start mt-2 gap-2">
        <button
          type="button"
          onClick={() => {
            if (textareaRef.current) {
              const currentValue = textareaRef.current.value;
              const cursorPos = textareaRef.current.selectionStart || 0;
              const newValue =
                currentValue.slice(0, cursorPos) +
                "@" +
                currentValue.slice(cursorPos);
              setValue(newValue);
              textareaRef.current.value = newValue;
              textareaRef.current.setSelectionRange(
                cursorPos + 1,
                cursorPos + 1,
              );
              textareaRef.current.focus();
              setMentionQuery("");
              setShowMentionPopup(true);
              setSelectedMentionIndex(0);
            }
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted border border-border/50"
          title="Mention tools and files (@)"
        >
          <AtSignIcon className="h-4 w-4" />
          <span>Mention</span>
        </button>
      </div>

      {/* @ Mention Popup */}
      {showMentionPopup && (
        <div className="absolute bottom-full left-0 mb-2 w-96 max-h-80 overflow-hidden rounded-lg border border-border bg-background shadow-lg z-50">
          {/* Content */}
          <div className="max-h-64 overflow-y-auto">
            {loadingDocuments && filteredOptions.length === 0 ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            ) : filteredOptions.length > 0 ? (
              <>
                {/* Agents Section */}
                {agentFiltered.length > 0 && (
                  <div className="px-3 py-2 bg-muted/30 border-b border-border">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Agents
                    </h3>
                  </div>
                )}
                {agentFiltered.map((option, index) => {
                  const globalIndex = index; // agents are first
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleMentionSelect(option)}
                      className={cn(
                        "flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50",
                        globalIndex === selectedMentionIndex && "bg-muted",
                      )}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        {option.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {option.name}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {/* Documents Section */}
                {fileFiltered.length > 0 && (
                  <div className="px-3 py-2 bg-muted/30 border-b border-border">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Documents
                    </h3>
                  </div>
                )}
                {fileFiltered.map((option, index) => {
                  const globalIndex = agentFiltered.length + index;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleMentionSelect(option)}
                      className={cn(
                        "flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50",
                        globalIndex === selectedMentionIndex && "bg-muted",
                      )}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        {option.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {option.name}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </>
            ) : (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <span className="text-sm">No options found</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-2 text-xs text-muted-foreground text-center">
            Use ↑↓ to navigate, Enter to select, Esc to close
          </div>
        </div>
      )}

      {/* Upload Status Notification */}
      {uploadStatus.show && (
        <div
          className={cn(
            "fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg border transition-all duration-300",
            uploadStatus.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800",
          )}
        >
          <div className="flex items-center gap-2">
            {uploadStatus.type === "success" ? (
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            ) : (
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            )}
            <span className="text-sm font-medium">{uploadStatus.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

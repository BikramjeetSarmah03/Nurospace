import { useState } from "react";
import { Zap, ZapOff, Sparkles, Crown } from "lucide-react";

interface ModeToggleProps {
  onModeChange: (mode: "normal" | "max" | "power") => void;
  initialMode?: "normal" | "max" | "power";
}

interface ModeInfo {
  name: string;
  icon: React.ReactNode;
  description: string;
  powerLevel: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export function ModeToggle({
  onModeChange,
  initialMode = "power",
}: ModeToggleProps) {
  const [mode, setMode] = useState<"normal" | "max" | "power">(initialMode);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const handleModeChange = (newMode: "normal" | "max" | "power") => {
    setMode(newMode);
    onModeChange(newMode);
  };

  const modes: Record<string, ModeInfo> = {
    normal: {
      name: "Normal",
      icon: <ZapOff className="h-4 w-4" />,
      description: "Basic assistant for simple queries",
      powerLevel: 1,
      color: "gray",
      bgColor: "bg-gray-100 dark:bg-gray-800",
      borderColor: "border-gray-300 dark:border-gray-600",
    },
    power: {
      name: "Power",
      icon: <Sparkles className="h-4 w-4" />,
      description: "Smart & efficient (Recommended)",
      powerLevel: 2,
      color: "blue",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      borderColor: "border-blue-300 dark:border-blue-600",
    },
    max: {
      name: "MAX",
      icon: <Crown className="h-4 w-4" />,
      description: "Academic-grade analysis",
      powerLevel: 3,
      color: "orange",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      borderColor: "border-orange-300 dark:border-orange-600",
    },
  };

  return (
    <div className="flex items-center gap-2">
      {/* <span className="text-sm font-medium text-muted-foreground">Mode:</span> */}

      {/* Icon-only Mode Selection */}
      <div className="flex gap-1">
        {Object.entries(modes).map(([modeKey, modeInfo]) => (
          <div
            key={modeKey}
            className="relative"
            onMouseEnter={() => setShowTooltip(modeKey)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <button
              onClick={() =>
                handleModeChange(modeKey as "normal" | "max" | "power")
              }
              className={`
                relative p-2 rounded-lg border-2 transition-all duration-200 cursor-pointer
                ${
                  mode === modeKey
                    ? `${modeInfo.bgColor} ${modeInfo.borderColor} shadow-md scale-110`
                    : "bg-background border-border hover:bg-muted/50"
                }
              `}
              title={`${modeInfo.name} Mode`}
            >
              {modeInfo.icon}

              {/* Active indicator */}
              {mode === modeKey && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Fancy Tooltip */}
            {showTooltip === modeKey && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-3 bg-popover border border-border rounded-lg shadow-lg z-50">
                <div className="text-center">
                  <div className="font-semibold text-sm mb-1">
                    {modeInfo.name} Mode
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {modeInfo.description}
                  </div>
                  <div className="mt-2 flex justify-center gap-1">
                    {[...Array(modeInfo.powerLevel)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-current rounded-full opacity-60"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

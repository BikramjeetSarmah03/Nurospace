import { useState } from "react";
import { Zap, ZapOff, Sparkles } from "lucide-react";

interface ModeToggleProps {
  onModeChange: (mode: "normal" | "max" | "power") => void;
  initialMode?: "normal" | "max" | "power";
}

export function ModeToggle({ onModeChange, initialMode = "normal" }: ModeToggleProps) {
  const [mode, setMode] = useState<"normal" | "max" | "power">(initialMode);

  const handleModeChange = (newMode: "normal" | "max" | "power") => {
    setMode(newMode);
    onModeChange(newMode);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Mode:</span>
      
      {/* Mode Selection Dropdown */}
      <div className="relative">
        <select
          value={mode}
          onChange={(e) => handleModeChange(e.target.value as "normal" | "max" | "power")}
          className="px-3 py-1.5 text-sm border rounded-md bg-background hover:bg-accent transition-colors cursor-pointer"
        >
          <option value="normal">🔄 Normal</option>
          <option value="max">🚀 MAX</option>
          <option value="power">⚡ POWER</option>
        </select>
      </div>
      
      {/* Mode Indicator */}
      <div className="flex items-center gap-1.5">
        {mode === "normal" && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted">
            <ZapOff className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Normal</span>
          </div>
        )}
        
        {mode === "max" && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-orange-200">
            <Zap className="h-3 w-3 text-orange-600" />
            <span className="text-xs font-medium text-orange-600">MAX</span>
          </div>
        )}
        
        {mode === "power" && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-blue-400/20 to-purple-500/20 border border-blue-200">
            <Sparkles className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">POWER</span>
          </div>
        )}
      </div>
    </div>
  );
}

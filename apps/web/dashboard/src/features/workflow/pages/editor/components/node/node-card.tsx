import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";

interface NodeCardProps {
  children: React.ReactNode;
  nodeId: string;
  isSelected?: boolean;
}

export default function NodeCard({
  children,
  nodeId,
  isSelected,
}: NodeCardProps) {
  const { getNode, setCenter } = useReactFlow();

  const handleCenterViewport = () => {
    const node = getNode(nodeId);
    if (!node) return;

    const { position, measured } = node;
    if (!position || !measured) return;

    const { width, height } = measured;

    const x = position.x + width! / 2;
    const y = position.y + height! / 2;
    if (x === undefined || y === undefined) return;

    setCenter(x, y, {
      zoom: 1,
      duration: 500,
    });
  };

  return (
    <div
      role="none"
      className={cn(
        "flex flex-col gap-1 bg-background border-2 rounded-md w-[420px] text-xs text-left cursor-pointer border-separate",
        isSelected && "border-green-500",
      )}
      onDoubleClick={handleCenterViewport}
    >
      {children}
    </div>
  );
}

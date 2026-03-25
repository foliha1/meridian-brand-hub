import { useCallback, useRef } from "react";
import { Canvas as FabricCanvas, FabricObject, Textbox, Line, Circle, FabricImage } from "fabric";
import { brandConfig } from "@/config/brandConfig";
import { Eye, EyeOff, GripVertical, Type, Square, Minus, Image as ImageIcon, CircleIcon } from "lucide-react";

interface LayerItem {
  obj: FabricObject;
  label: string;
  icon: "text" | "rect" | "circle" | "line" | "image";
}

function getLayerInfo(obj: FabricObject): LayerItem | null {
  if ((obj as any).isGridLine) return null;
  if (obj instanceof Textbox) {
    const text = obj.text || "";
    return { obj, label: text.length > 20 ? text.slice(0, 20) + "…" : text, icon: "text" };
  }
  if (obj instanceof Line) return { obj, label: "Line", icon: "line" };
  if (obj instanceof FabricImage) return { obj, label: "Image", icon: "image" };
  if (obj instanceof Circle) return { obj, label: "Circle", icon: "circle" };
  // Rect or other
  const rx = (obj as any).rx;
  return { obj, label: rx ? "Rounded Rect" : "Rectangle", icon: "rect" };
}

const IconMap = {
  text: Type,
  rect: Square,
  circle: CircleIcon,
  line: Minus,
  image: ImageIcon,
};

const { body } = brandConfig.typography;
const secondaryHex = brandConfig.colors.secondary.hex;

interface LayerPanelProps {
  layers: LayerItem[];
  selectedId: number | null;
  onSelect: (obj: FabricObject) => void;
  onToggleVisibility: (obj: FabricObject) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export { getLayerInfo };
export type { LayerItem };

export default function LayerPanel({ layers, selectedId, onSelect, onToggleVisibility, onReorder }: LayerPanelProps) {
  const dragIdx = useRef<number | null>(null);

  const handleDragStart = useCallback((idx: number) => {
    dragIdx.current = idx;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((targetIdx: number) => {
    if (dragIdx.current !== null && dragIdx.current !== targetIdx) {
      onReorder(dragIdx.current, targetIdx);
    }
    dragIdx.current = null;
  }, [onReorder]);

  if (layers.length === 0) {
    return (
      <div className="text-center" style={{ fontFamily: body.family, fontWeight: 400, fontSize: "13px", color: "#9CA3AF" }}>
        No layers yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {layers.map((layer, idx) => {
        const Icon = IconMap[layer.icon];
        const isSelected = selectedId === layer.obj.get("__uid");
        const isHidden = !layer.obj.visible;

        return (
          <div
            key={(layer.obj as any).__uid ?? idx}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(idx)}
            onClick={() => onSelect(layer.obj)}
            className="flex items-center gap-2 rounded-md cursor-pointer group"
            style={{
              paddingTop: 6,
              paddingBottom: 6,
              paddingLeft: 8,
              paddingRight: 8,
              fontFamily: body.family,
              fontWeight: 400,
              fontSize: "13px",
              backgroundColor: isSelected ? `${secondaryHex}1A` : "transparent",
              opacity: isHidden ? 0.5 : 1,
            }}
          >
            <GripVertical className="h-3.5 w-3.5 text-gray-300 cursor-grab shrink-0" />
            <Icon className="h-3.5 w-3.5 text-gray-500 shrink-0" />
            <span className="flex-1 truncate">{layer.label}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(layer.obj);
              }}
              className="shrink-0 p-0.5 rounded hover:bg-gray-100"
            >
              {isHidden ? (
                <EyeOff className="h-3.5 w-3.5 text-gray-400" />
              ) : (
                <Eye className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

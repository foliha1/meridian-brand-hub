import { useState, useEffect, useCallback } from "react";
import { FabricObject } from "fabric";
import { brandConfig } from "@/config/brandConfig";
import ColorPicker from "./ColorPicker";

const { body } = brandConfig.typography;

const sectionLabel = {
  fontFamily: body.family,
  fontWeight: 500,
  fontSize: "11px",
  letterSpacing: "0.05em",
  color: "#9CA3AF",
  textTransform: "uppercase" as const,
};

const inputStyle: React.CSSProperties = {
  fontFamily: body.family,
  fontWeight: 400,
  fontSize: "13px",
  width: "80px",
  padding: "4px 6px",
  border: "1px solid #E5E7EB",
  borderRadius: "6px",
  outline: "none",
};

interface Props {
  selectedObject: FabricObject;
  onPropertyChange: () => void;
  tick?: number;
}

export default function LineProperties({ selectedObject, onPropertyChange, tick }: Props) {
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(1);

  const sync = useCallback(() => {
    setStrokeColor((selectedObject.stroke as string) ?? "#000000");
    setStrokeWidth(selectedObject.strokeWidth ?? 1);
  }, [selectedObject]);

  useEffect(() => { sync(); }, [sync, tick]);

  const apply = () => {
    selectedObject.setCoords();
    selectedObject.canvas?.renderAll();
    onPropertyChange();
  };

  const handleStroke = (hex: string) => {
    setStrokeColor(hex);
    selectedObject.set("stroke", hex);
    apply();
  };

  const handleStrokeWidth = (val: string) => {
    const n = Math.max(0, Math.min(20, parseInt(val) || 0));
    setStrokeWidth(n);
    selectedObject.set("strokeWidth", n);
    apply();
  };

  return (
    <>
      <div className="border-t my-3" />
      <div style={sectionLabel} className="mb-2">Stroke</div>
      <ColorPicker value={strokeColor} onChange={handleStroke} />
      <div className="mt-2">
        <span style={{ fontFamily: body.family, fontSize: "11px", color: "#9CA3AF" }}>Width</span>
        <input
          type="number"
          value={strokeWidth}
          min={0}
          max={20}
          onChange={(e) => handleStrokeWidth(e.target.value)}
          style={inputStyle}
        />
      </div>
    </>
  );
}

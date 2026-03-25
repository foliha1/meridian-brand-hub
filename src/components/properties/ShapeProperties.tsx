import { useState, useEffect, useCallback } from "react";
import { FabricObject, Rect } from "fabric";
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

export default function ShapeProperties({ selectedObject, onPropertyChange, tick }: Props) {
  const [fillColor, setFillColor] = useState("#000000");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [cornerRadius, setCornerRadius] = useState(0);

  const isRect = selectedObject instanceof Rect;

  const sync = useCallback(() => {
    setFillColor((selectedObject.fill as string) ?? "#000000");
    setStrokeColor((selectedObject.stroke as string) ?? "#000000");
    setStrokeWidth(selectedObject.strokeWidth ?? 0);
    if (isRect) {
      setCornerRadius((selectedObject as Rect).rx ?? 0);
    }
  }, [selectedObject, isRect]);

  useEffect(() => { sync(); }, [sync, tick]);

  const apply = () => {
    selectedObject.setCoords();
    selectedObject.canvas?.renderAll();
    onPropertyChange();
  };

  const handleFill = (hex: string) => {
    setFillColor(hex);
    selectedObject.set("fill", hex);
    apply();
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

  const handleCornerRadius = (val: string) => {
    const n = Math.max(0, Math.min(100, parseInt(val) || 0));
    setCornerRadius(n);
    (selectedObject as Rect).set("rx", n);
    (selectedObject as Rect).set("ry", n);
    apply();
  };

  return (
    <>
      <div className="border-t my-3" />

      {/* Fill */}
      <div style={sectionLabel} className="mb-2">Fill</div>
      <ColorPicker value={fillColor} onChange={handleFill} />

      <div className="border-t my-3" />

      {/* Stroke */}
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

      {/* Corner Radius — Rect only */}
      {isRect && (
        <>
          <div className="border-t my-3" />
          <div style={sectionLabel} className="mb-2">Corners</div>
          <input
            type="number"
            value={cornerRadius}
            min={0}
            max={100}
            onChange={(e) => handleCornerRadius(e.target.value)}
            style={inputStyle}
          />
        </>
      )}
    </>
  );
}

import { useState, useEffect, useCallback } from "react";
import { FabricObject } from "fabric";
import { brandConfig } from "@/config/brandConfig";
import { Link, Unlink } from "lucide-react";
import { Slider } from "@/components/ui/slider";

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
  width: "100%",
  padding: "4px 6px",
  border: "1px solid #E5E7EB",
  borderRadius: "6px",
  outline: "none",
};

function round(v: number) {
  return Math.round(v);
}

interface Props {
  selectedObject: FabricObject | null;
  onPropertyChange: () => void;
  tick?: number;
}

export default function PropertiesPanel({ selectedObject, onPropertyChange, tick }: Props) {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);
  const [rot, setRot] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [lockRatio, setLockRatio] = useState(false);
  const [aspect, setAspect] = useState(1);

  const sync = useCallback(() => {
    if (!selectedObject) return;
    setX(round(selectedObject.left ?? 0));
    setY(round(selectedObject.top ?? 0));
    setW(round(selectedObject.getScaledWidth()));
    setH(round(selectedObject.getScaledHeight()));
    setRot(round(selectedObject.angle ?? 0));
    setOpacity(round((selectedObject.opacity ?? 1) * 100));
    const sw = selectedObject.getScaledWidth();
    const sh = selectedObject.getScaledHeight();
    if (sh > 0) setAspect(sw / sh);
  }, [selectedObject]);

  useEffect(() => {
    sync();
  }, [sync, tick]);

  // Expose sync so parent can call it on fabric events
  useEffect(() => {
    if (!selectedObject) return;
    (selectedObject as any).__propsSync = sync;
    return () => { (selectedObject as any).__propsSync = undefined; };
  }, [selectedObject, sync]);

  if (!selectedObject) {
    return (
      <div className="text-center" style={{ fontFamily: body.family, fontWeight: 400, fontSize: "13px", color: "#9CA3AF" }}>
        Select an element
      </div>
    );
  }

  const applyAndRender = () => {
    selectedObject.setCoords();
    selectedObject.canvas?.renderAll();
    onPropertyChange();
  };

  const handleX = (val: string) => {
    const n = parseInt(val) || 0;
    setX(n);
    selectedObject.set("left", n);
    applyAndRender();
  };

  const handleY = (val: string) => {
    const n = parseInt(val) || 0;
    setY(n);
    selectedObject.set("top", n);
    applyAndRender();
  };

  const handleW = (val: string) => {
    const n = parseInt(val) || 1;
    setW(n);
    const currentW = selectedObject.getScaledWidth();
    if (currentW > 0) {
      selectedObject.scaleX = (selectedObject.scaleX ?? 1) * (n / currentW);
    }
    if (lockRatio) {
      const newH = round(n / aspect);
      setH(newH);
      const currentH = selectedObject.getScaledHeight();
      if (currentH > 0) {
        selectedObject.scaleY = (selectedObject.scaleY ?? 1) * (newH / currentH);
      }
    }
    applyAndRender();
  };

  const handleH = (val: string) => {
    const n = parseInt(val) || 1;
    setH(n);
    const currentH = selectedObject.getScaledHeight();
    if (currentH > 0) {
      selectedObject.scaleY = (selectedObject.scaleY ?? 1) * (n / currentH);
    }
    if (lockRatio) {
      const newW = round(n * aspect);
      setW(newW);
      const currentW = selectedObject.getScaledWidth();
      if (currentW > 0) {
        selectedObject.scaleX = (selectedObject.scaleX ?? 1) * (newW / currentW);
      }
    }
    applyAndRender();
  };

  const handleRot = (val: string) => {
    const n = (parseInt(val) || 0) % 360;
    setRot(n);
    selectedObject.set("angle", n);
    applyAndRender();
  };

  const handleOpacity = (vals: number[]) => {
    const v = vals[0];
    setOpacity(v);
    selectedObject.set("opacity", v / 100);
    applyAndRender();
  };

  const toggleLock = () => {
    if (!lockRatio) {
      const sw = selectedObject.getScaledWidth();
      const sh = selectedObject.getScaledHeight();
      if (sh > 0) setAspect(sw / sh);
    }
    setLockRatio(!lockRatio);
  };

  return (
    <div className="flex flex-col">
      {/* Position */}
      <div style={sectionLabel} className="mb-2">Position</div>
      <div className="grid grid-cols-2 gap-2">
        <label>
          <span style={{ fontFamily: body.family, fontSize: "11px", color: "#9CA3AF" }}>X</span>
          <input type="number" value={x} onChange={(e) => handleX(e.target.value)} style={inputStyle} />
        </label>
        <label>
          <span style={{ fontFamily: body.family, fontSize: "11px", color: "#9CA3AF" }}>Y</span>
          <input type="number" value={y} onChange={(e) => handleY(e.target.value)} style={inputStyle} />
        </label>
      </div>

      <div className="border-t my-3" />

      {/* Size */}
      <div style={sectionLabel} className="mb-2">Size</div>
      <div className="flex items-end gap-2">
        <label className="flex-1">
          <span style={{ fontFamily: body.family, fontSize: "11px", color: "#9CA3AF" }}>W</span>
          <input type="number" value={w} onChange={(e) => handleW(e.target.value)} style={inputStyle} />
        </label>
        <button
          onClick={toggleLock}
          className="mb-0.5 p-1 rounded hover:bg-gray-100 transition-colors"
          title={lockRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
        >
          {lockRatio ? <Link className="h-3.5 w-3.5 text-gray-500" /> : <Unlink className="h-3.5 w-3.5 text-gray-300" />}
        </button>
        <label className="flex-1">
          <span style={{ fontFamily: body.family, fontSize: "11px", color: "#9CA3AF" }}>H</span>
          <input type="number" value={h} onChange={(e) => handleH(e.target.value)} style={inputStyle} />
        </label>
      </div>

      <div className="border-t my-3" />

      {/* Rotation */}
      <div style={sectionLabel} className="mb-2">Rotation</div>
      <div className="flex items-center gap-2">
        <input type="number" value={rot} onChange={(e) => handleRot(e.target.value)} style={{ ...inputStyle, width: "80px" }} />
        <span style={{ fontFamily: body.family, fontSize: "13px", color: "#9CA3AF" }}>°</span>
      </div>

      <div className="border-t my-3" />

      {/* Opacity */}
      <div style={sectionLabel} className="mb-2">Opacity</div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Slider value={[opacity]} min={0} max={100} step={1} onValueChange={handleOpacity} />
        </div>
        <span style={{ fontFamily: body.family, fontWeight: 400, fontSize: "13px", minWidth: "36px", textAlign: "right" }}>
          {opacity}%
        </span>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { FabricObject, Textbox, Rect, Circle, Line, FabricImage, Point } from "fabric";
import ShapeProperties from "@/components/properties/ShapeProperties";
import LineProperties from "@/components/properties/LineProperties";
import ImageProperties from "@/components/properties/ImageProperties";
import ColorPicker from "@/components/properties/ColorPicker";
import { brandConfig, brandColorArray } from "@/config/brandConfig";
import { Link, Unlink, Minus, Plus, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const { display, body } = brandConfig.typography;

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

const fontFamilies = [
  display.family,
  body.family,
  "Inter",
  "Playfair Display",
  "Space Mono",
  "Libre Baskerville",
].filter((v, i, a) => a.indexOf(v) === i);

const fontWeights = [
  ...new Set([...display.weights, ...body.weights]),
].sort((a, b) => a - b);

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
  const [originX, setOriginX] = useState<"left" | "center" | "right">("left");
  const [originY, setOriginY] = useState<"top" | "center" | "bottom">("top");

  // Text-specific state
  const [fontFamily, setFontFamily] = useState(display.family);
  const [fontWeight, setFontWeight] = useState(700);
  const [fontSize, setFontSize] = useState(48);
  const [textAlign, setTextAlign] = useState("left");
  const [fillColor, setFillColor] = useState("#000000");
  const [hexInput, setHexInput] = useState("#000000");

  const isText = selectedObject instanceof Textbox;
  const isShape = selectedObject instanceof Rect || selectedObject instanceof Circle;
  const isLine = selectedObject instanceof Line;
  const isImage = selectedObject instanceof FabricImage;

  const sync = useCallback(() => {
    if (!selectedObject) return;
    setX(round(selectedObject.left ?? 0));
    setY(round(selectedObject.top ?? 0));
    setW(round(selectedObject.getScaledWidth()));
    setH(round(selectedObject.getScaledHeight()));
    setRot(round(selectedObject.angle ?? 0));
    setOpacity(round((selectedObject.opacity ?? 1) * 100));
    setOriginX((selectedObject.originX as "left" | "center" | "right") ?? "left");
    setOriginY((selectedObject.originY as "top" | "center" | "bottom") ?? "top");
    const sw = selectedObject.getScaledWidth();
    const sh = selectedObject.getScaledHeight();
    if (sh > 0) setAspect(sw / sh);

    if (selectedObject instanceof Textbox) {
      setFontFamily((selectedObject.fontFamily as string) ?? display.family);
      setFontWeight(Number(selectedObject.fontWeight) || 400);
      setFontSize(round(selectedObject.fontSize ?? 48));
      setTextAlign((selectedObject.textAlign as string) ?? "left");
      const fill = (selectedObject.fill as string) ?? "#000000";
      setFillColor(fill);
      setHexInput(fill);
    }
  }, [selectedObject]);

  useEffect(() => {
    sync();
  }, [sync, tick]);

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

  // Text handlers
  const handleFontFamily = (val: string) => {
    setFontFamily(val);
    (selectedObject as Textbox).set("fontFamily", val);
    applyAndRender();
  };

  const handleFontWeight = (val: string) => {
    const n = parseInt(val);
    setFontWeight(n);
    (selectedObject as Textbox).set("fontWeight", String(n));
    applyAndRender();
  };

  const handleFontSize = (val: number) => {
    const clamped = Math.max(2, val);
    setFontSize(clamped);
    (selectedObject as Textbox).set("fontSize", clamped);
    applyAndRender();
  };

  const handleTextAlign = (val: string) => {
    setTextAlign(val);
    (selectedObject as Textbox).set("textAlign", val);
    applyAndRender();
  };

  const handleColorCircle = (hex: string) => {
    setFillColor(hex);
    setHexInput(hex);
    (selectedObject as Textbox).set("fill", hex);
    applyAndRender();
  };

  const handleHexInput = (val: string) => {
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setFillColor(val);
      (selectedObject as Textbox).set("fill", val);
      applyAndRender();
    }
  };

  const alignButtons = [
    { value: "left", icon: AlignLeft },
    { value: "center", icon: AlignCenter },
    { value: "right", icon: AlignRight },
    { value: "justify", icon: AlignJustify },
  ];

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

      {/* Origin Point Grid */}
      <div className="mt-2">
        <span style={{ fontFamily: body.family, fontSize: "11px", color: "#9CA3AF" }}>Origin</span>
        <div className="grid grid-cols-3 gap-0.5 w-fit mt-1">
          {(["top", "center", "bottom"] as const).map((oy) =>
            (["left", "center", "right"] as const).map((ox) => (
              <button
                key={`${ox}-${oy}`}
                onClick={() => {
                  const oldOrigin = new Point(
                    selectedObject.originX === "left" ? 0 : selectedObject.originX === "center" ? 0.5 : 1,
                    selectedObject.originY === "top" ? 0 : selectedObject.originY === "center" ? 0.5 : 1
                  );
                  const newOrigin = new Point(
                    ox === "left" ? 0 : ox === "center" ? 0.5 : 1,
                    oy === "top" ? 0 : oy === "center" ? 0.5 : 1
                  );
                  const position = selectedObject.getRelativeXY();
                  const w = selectedObject.getScaledWidth();
                  const h = selectedObject.getScaledHeight();
                  const newLeft = position.x + (oldOrigin.x - newOrigin.x) * w;
                  const newTop = position.y + (oldOrigin.y - newOrigin.y) * h;
                  selectedObject.set({ originX: ox, originY: oy, left: newLeft, top: newTop });
                  setOriginX(ox);
                  setOriginY(oy);
                  setX(round(newLeft));
                  setY(round(newTop));
                  applyAndRender();
                }}
                className="rounded-sm border transition-colors"
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: originX === ox && originY === oy ? brandConfig.colors.secondary.hex : "transparent",
                  borderColor: originX === ox && originY === oy ? brandConfig.colors.secondary.hex : "#E5E7EB",
                }}
              />
            ))
          )}
        </div>
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

      {/* Text-specific sections */}
      {isText && (
        <>
          <div className="border-t my-3" />

          {/* Typography */}
          <div style={sectionLabel} className="mb-2">Typography</div>

          <div className="flex flex-col gap-2">
            {/* Font Family */}
            <Select value={fontFamily} onValueChange={handleFontFamily}>
              <SelectTrigger className="h-8 text-xs" style={{ fontFamily: body.family }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((f) => (
                  <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Font Weight */}
            <Select value={String(fontWeight)} onValueChange={handleFontWeight}>
              <SelectTrigger className="h-8 text-xs" style={{ fontFamily: body.family }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontWeights.map((fw) => (
                  <SelectItem key={fw} value={String(fw)}>
                    {fw}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Text Size Presets */}
            <div className="flex gap-1 flex-wrap">
              {[
                { label: "H1", size: parseInt(display.sizes.xl) },
                { label: "H2", size: parseInt(display.sizes.lg) },
                { label: "H3", size: parseInt(display.sizes.md) },
                { label: "Body", size: parseInt(body.sizes.md) },
                { label: "Caption", size: parseInt(body.sizes.xs) },
              ].map(({ label, size }) => (
                <button
                  key={label}
                  onClick={() => handleFontSize(size)}
                  className="rounded-md px-2 py-1 text-xs border transition-colors"
                  style={{
                    fontFamily: body.family,
                    backgroundColor: fontSize === size ? `${brandConfig.colors.secondary.hex}1A` : "transparent",
                    borderColor: fontSize === size ? brandConfig.colors.secondary.hex : "#E5E7EB",
                    color: fontSize === size ? brandConfig.colors.secondary.hex : "#6B7280",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Font Size */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleFontSize(fontSize - 2)}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <Minus className="h-3.5 w-3.5 text-gray-500" />
              </button>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => handleFontSize(parseInt(e.target.value) || 2)}
                style={{ ...inputStyle, width: "60px", textAlign: "center" }}
              />
              <button
                onClick={() => handleFontSize(fontSize + 2)}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-gray-500" />
              </button>
              <span style={{ fontFamily: body.family, fontSize: "11px", color: "#9CA3AF" }}>px</span>
            </div>

            {/* Text Alignment */}
            <div className="flex gap-1">
              {alignButtons.map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleTextAlign(value)}
                  className="p-1.5 rounded transition-colors"
                  style={{
                    backgroundColor: textAlign === value ? `${brandConfig.colors.secondary.hex}1A` : "transparent",
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: textAlign === value ? brandConfig.colors.secondary.hex : "#9CA3AF" }} />
                </button>
              ))}
            </div>
          </div>

          <div className="border-t my-3" />

          {/* Color */}
          <div style={sectionLabel} className="mb-2">Color</div>
          <ColorPicker value={fillColor} onChange={handleColorCircle} />
        </>
      )}

      {/* Shape-specific sections */}
      {isShape && (
        <ShapeProperties selectedObject={selectedObject} onPropertyChange={onPropertyChange} tick={tick} />
      )}

      {/* Line-specific sections */}
      {isLine && (
        <LineProperties selectedObject={selectedObject} onPropertyChange={onPropertyChange} tick={tick} />
      )}

      {/* Image-specific sections */}
      {isImage && (
        <ImageProperties selectedObject={selectedObject} onPropertyChange={onPropertyChange} />
      )}
    </div>
  );
}

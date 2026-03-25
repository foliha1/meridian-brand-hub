import { useState, useRef, useEffect } from "react";
import { brandConfig } from "@/config/brandConfig";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus } from "lucide-react";

const Index = () => {
  const [projectName, setProjectName] = useState("");
  const [gridEnabled, setGridEnabled] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const [areaSize, setAreaSize] = useState({ width: 0, height: 0 });

  const { display, body } = brandConfig.typography;
  const { primary, secondary } = brandConfig.colors;
  const preset = brandConfig.canvasPresets[selectedPreset];

  useEffect(() => {
    const el = canvasAreaRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setAreaSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const padding = 48;
  const dimLabelHeight = 24;
  const scale = areaSize.width && areaSize.height
    ? Math.min(
        (areaSize.width - padding * 2) / preset.width,
        (areaSize.height - padding * 2 - dimLabelHeight) / preset.height
      )
    : 0;
  const displayW = preset.width * scale;
  const displayH = preset.height * scale;

  const sectionLabelStyle = {
    fontFamily: body.family,
    fontWeight: 500,
    fontSize: "11px",
    letterSpacing: "0.05em",
    color: "#9CA3AF",
    textTransform: "uppercase" as const,
    marginBottom: "12px",
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* TOP BAR */}
      <div className="h-14 border-b bg-white flex items-center justify-between px-4 shrink-0">
        <span style={{ fontFamily: display.family, fontWeight: 700, fontSize: "16px", color: primary.hex }}>
          Brandkit
        </span>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Untitled Project"
          className="bg-transparent border-none outline-none text-center w-48"
          style={{ fontFamily: body.family, fontWeight: 500, fontSize: "14px" }}
        />
        <Button variant="outline" size="sm">Export</Button>
      </div>

      {/* MIDDLE */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT PANEL */}
        <div className="w-72 border-r bg-white overflow-y-auto p-4 shrink-0">
          <div style={sectionLabelStyle}>Canvas Size</div>
          <div className="grid grid-cols-2 gap-2">
            {brandConfig.canvasPresets.map((p, i) => (
              <div
                key={p.name}
                onClick={() => setSelectedPreset(i)}
                className="rounded-lg p-3 cursor-pointer transition-colors"
                style={{
                  border: `1px solid ${i === selectedPreset ? secondary.hex : "#E5E7EB"}`,
                  backgroundColor: i === selectedPreset ? `${secondary.hex}0D` : "transparent",
                }}
              >
                <div style={{ fontFamily: body.family, fontWeight: 500, fontSize: "12px" }}>{p.name}</div>
                <div style={{ fontFamily: body.family, fontWeight: 400, fontSize: "11px", color: "#9CA3AF" }}>
                  {p.width} × {p.height}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t my-4" />
          <div style={sectionLabelStyle}>Layers</div>
          <div className="text-center" style={{ fontFamily: body.family, fontWeight: 400, fontSize: "13px", color: "#9CA3AF" }}>
            No layers yet
          </div>
        </div>

        {/* CENTER CANVAS AREA */}
        <div
          ref={canvasAreaRef}
          className="flex-1 flex flex-col items-center justify-center min-w-0"
          style={{ backgroundColor: "#F5F5F5" }}
        >
          {scale > 0 && (
            <>
              <div
                className="bg-white shadow-lg"
                style={{ width: displayW, height: displayH }}
              />
              <div
                className="mt-2"
                style={{ fontFamily: body.family, fontWeight: 400, fontSize: "11px", color: "#9CA3AF" }}
              >
                {preset.width} × {preset.height} px
              </div>
            </>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="w-72 border-l bg-white overflow-y-auto p-4 shrink-0">
          <div style={sectionLabelStyle}>Properties</div>
          <div className="text-center" style={{ fontFamily: body.family, fontWeight: 400, fontSize: "13px", color: "#9CA3AF" }}>
            Select an element
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="h-10 border-t bg-white px-4 flex items-center justify-between shrink-0">
        <span style={{ fontFamily: body.family, fontWeight: 400, fontSize: "12px", color: "#6B7280" }}>
          {preset.name}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7"><Minus className="h-3.5 w-3.5" /></Button>
          <span style={{ fontFamily: body.family, fontWeight: 500, fontSize: "12px" }}>100%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7"><Plus className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: body.family, fontWeight: 400, fontSize: "12px" }}>Grid</span>
          <Switch checked={gridEnabled} onCheckedChange={setGridEnabled} />
        </div>
      </div>
    </div>
  );
};

export default Index;

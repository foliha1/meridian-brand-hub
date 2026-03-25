import { useState } from "react";
import { brandConfig } from "@/config/brandConfig";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus } from "lucide-react";

const Index = () => {
  const [projectName, setProjectName] = useState("");
  const [gridEnabled, setGridEnabled] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);

  const { display, body } = brandConfig.typography;
  const { primary, secondary } = brandConfig.colors;

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
    <div className="flex flex-col h-screen">
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

      {/* MIDDLE AREA */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT PANEL */}
        <div className="w-72 border-r bg-white overflow-y-auto p-4 shrink-0">
          <div style={sectionLabelStyle}>Canvas Size</div>
          <div className="grid grid-cols-2 gap-2">
            {brandConfig.canvasPresets.map((preset, i) => (
              <div
                key={preset.name}
                onClick={() => setSelectedPreset(i)}
                className="rounded-lg p-3 cursor-pointer transition-colors"
                style={{
                  border: `1px solid ${i === selectedPreset ? secondary.hex : "#E5E7EB"}`,
                  backgroundColor: i === selectedPreset ? `${secondary.hex}0D` : "transparent",
                }}
              >
                <div style={{ fontFamily: body.family, fontWeight: 500, fontSize: "12px" }}>
                  {preset.name}
                </div>
                <div style={{ fontFamily: body.family, fontWeight: 400, fontSize: "11px", color: "#9CA3AF" }}>
                  {preset.width} × {preset.height}
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

        {/* CANVAS AREA */}
        <div className="flex-1" style={{ backgroundColor: "#F5F5F5" }} />
      </div>

      {/* BOTTOM BAR */}
      <div className="h-10 border-t bg-white px-4 flex items-center justify-between shrink-0">
        <span style={{ fontFamily: body.family, fontWeight: 400, fontSize: "12px", color: "#6B7280" }}>
          {brandConfig.canvasPresets[selectedPreset].name}
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

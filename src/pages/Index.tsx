import { useState } from "react";
import { brandConfig } from "@/config/brandConfig";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus } from "lucide-react";

const Index = () => {
  const [projectName, setProjectName] = useState("");
  const [gridEnabled, setGridEnabled] = useState(false);

  const { display, body } = brandConfig.typography;
  const { primary } = brandConfig.colors;

  return (
    <div className="flex flex-col h-screen">
      {/* TOP BAR */}
      <div
        className="h-14 border-b bg-white flex items-center justify-between px-4 shrink-0"
      >
        <span
          style={{
            fontFamily: display.family,
            fontWeight: 700,
            fontSize: "16px",
            color: primary.hex,
          }}
        >
          Brandkit
        </span>

        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Untitled Project"
          className="bg-transparent border-none outline-none text-center w-48"
          style={{
            fontFamily: body.family,
            fontWeight: 500,
            fontSize: "14px",
          }}
        />

        <Button variant="outline" size="sm">
          Export
        </Button>
      </div>

      {/* CANVAS AREA */}
      <div className="flex-1" style={{ backgroundColor: "#F5F5F5" }} />

      {/* BOTTOM BAR */}
      <div
        className="h-10 border-t bg-white px-4 flex items-center justify-between shrink-0"
      >
        <span
          style={{
            fontFamily: body.family,
            fontWeight: 400,
            fontSize: "12px",
            color: "#6B7280",
          }}
        >
          Instagram Post
        </span>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span
            style={{
              fontFamily: body.family,
              fontWeight: 500,
              fontSize: "12px",
            }}
          >
            100%
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: body.family,
              fontWeight: 400,
              fontSize: "12px",
            }}
          >
            Grid
          </span>
          <Switch checked={gridEnabled} onCheckedChange={setGridEnabled} />
        </div>
      </div>
    </div>
  );
};

export default Index;

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Canvas as FabricCanvas, Line, Textbox, Rect, Circle, FabricImage, FabricObject } from "fabric";
import { brandConfig, brandColorArray } from "@/config/brandConfig";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus, Type, Square, Image as ImageIcon } from "lucide-react";
import LayerPanel, { getLayerInfo, type LayerItem } from "@/components/LayerPanel";
import PropertiesPanel from "@/components/PropertiesPanel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const [projectName, setProjectName] = useState("");
  const [gridEnabled, setGridEnabled] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [areaSize, setAreaSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState<number | null>(null);
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedObjId, setSelectedObjId] = useState<number | null>(null);
  const [selectedObj, setSelectedObj] = useState<FabricObject | null>(null);
  const [propsTick, setPropsTick] = useState(0);

  const refreshLayers = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) { setLayers([]); return; }
    const items: LayerItem[] = [];
    fc.getObjects().forEach((obj) => {
      const info = getLayerInfo(obj);
      if (info) items.push(info);
    });
    items.reverse(); // top z-order first
    setLayers(items);
  }, []);

  const { display, body } = brandConfig.typography;
  const { primary, secondary } = brandConfig.colors;
  const accent = brandConfig.colors.accent;
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
  const fitScale = areaSize.width && areaSize.height
    ? Math.min(
        (areaSize.width - padding * 2) / preset.width,
        (areaSize.height - padding * 2 - dimLabelHeight) / preset.height
      )
    : 0;
  const scale = zoom ?? fitScale;

  useEffect(() => {
    setZoom(null);
  }, [selectedPreset]);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    if (fabricRef.current) {
      fabricRef.current.dispose();
      fabricRef.current = null;
    }
    container.innerHTML = "";

    const canvasEl = document.createElement("canvas");
    container.appendChild(canvasEl);

    const fc = new FabricCanvas(canvasEl, {
      width: preset.width,
      height: preset.height,
      backgroundColor: "#FFFFFF",
    });
    fabricRef.current = fc;

    let uidCounter = 0;
    fc.on("object:added", (e) => {
      if (!(e.target as any).isGridLine && !(e.target as any).__uid) {
        (e.target as any).__uid = ++uidCounter;
      }
      refreshLayers();
    });
    fc.on("object:removed", refreshLayers);
    fc.on("object:modified", refreshLayers);
    fc.on("selection:created", (e) => {
      const obj = e.selected?.[0] ?? null;
      setSelectedObjId((obj as any)?.__uid ?? null);
      setSelectedObj(obj ?? null);
    });
    fc.on("selection:updated", (e) => {
      const obj = e.selected?.[0] ?? null;
      setSelectedObjId((obj as any)?.__uid ?? null);
      setSelectedObj(obj ?? null);
    });
    fc.on("selection:cleared", () => {
      setSelectedObjId(null);
      setSelectedObj(null);
    });
    fc.on("text:changed", refreshLayers);

    const syncProps = () => setPropsTick((t) => t + 1);
    fc.on("object:moving", syncProps);
    fc.on("object:scaling", syncProps);
    fc.on("object:rotating", syncProps);

    return () => {
      fc.dispose();
      fabricRef.current = null;
      if (container) container.innerHTML = "";
    };
  }, [selectedPreset, preset.width, preset.height, refreshLayers]);

  // Apply Fabric zoom whenever scale changes
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc || scale <= 0) return;
    fc.setZoom(scale);
    fc.setDimensions(
      { width: preset.width * scale, height: preset.height * scale },
      { cssOnly: true }
    );
  }, [scale, preset.width, preset.height]);

  /** Temporarily reset zoom to 1:1 for export, then restore. */
  const withExportScale = useCallback((exportFn: (fc: FabricCanvas) => void) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const currentScale = fc.getZoom();
    fc.setZoom(1);
    fc.setDimensions({ width: preset.width, height: preset.height }, { cssOnly: true });
    try {
      exportFn(fc);
    } finally {
      fc.setZoom(currentScale);
      fc.setDimensions(
        { width: preset.width * currentScale, height: preset.height * currentScale },
        { cssOnly: true }
      );
    }
  }, [preset.width, preset.height]);

  const addGrid = useCallback((fc: FabricCanvas, w: number, h: number) => {
    const gutter = brandConfig.grid.gutter;
    const lines: Line[] = [];
    for (let x = gutter; x < w; x += gutter) {
      const line = new Line([x, 0, x, h], {
        stroke: "#E5E7EB", strokeWidth: 0.5,
        selectable: false, evented: false, excludeFromExport: true,
      });
      (line as any).isGridLine = true;
      lines.push(line);
    }
    for (let y = gutter; y < h; y += gutter) {
      const line = new Line([0, y, w, y], {
        stroke: "#E5E7EB", strokeWidth: 0.5,
        selectable: false, evented: false, excludeFromExport: true,
      });
      (line as any).isGridLine = true;
      lines.push(line);
    }
    lines.forEach((l) => fc.add(l));
    lines.forEach((l) => fc.sendObjectToBack(l));
    fc.renderAll();
  }, []);

  const removeGrid = useCallback((fc: FabricCanvas) => {
    const gridLines = fc.getObjects().filter((o: any) => o.isGridLine);
    gridLines.forEach((l) => fc.remove(l));
    fc.renderAll();
  }, []);

  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    if (gridEnabled) {
      addGrid(fc, preset.width, preset.height);
    } else {
      removeGrid(fc);
    }
  }, [gridEnabled, selectedPreset, preset.width, preset.height, addGrid, removeGrid]);

  // --- Toolbar actions ---
  const addText = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    const text = new Textbox("Heading", {
      fontFamily: display.family,
      fontSize: 48,
      fontWeight: "700",
      fill: primary.hex,
      left: preset.width / 2 - 100,
      top: preset.height / 2 - 30,
      width: 200,
    });
    fc.add(text);
    fc.setActiveObject(text);
    fc.renderAll();
  }, [display.family, primary.hex, preset.width, preset.height]);

  const addRect = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    const rect = new Rect({
      width: 200, height: 200,
      fill: secondary.hex,
      strokeUniform: true,
      left: preset.width / 2 - 100,
      top: preset.height / 2 - 100,
    });
    fc.add(rect);
    fc.setActiveObject(rect);
    fc.renderAll();
  }, [secondary.hex, preset.width, preset.height]);

  const addCircle = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    const circle = new Circle({
      radius: 100,
      fill: accent.hex,
      strokeUniform: true,
      left: preset.width / 2 - 100,
      top: preset.height / 2 - 100,
    });
    fc.add(circle);
    fc.setActiveObject(circle);
    fc.renderAll();
  }, [accent.hex, preset.width, preset.height]);

  const addRoundedRect = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    const rect = new Rect({
      width: 200, height: 120,
      fill: primary.hex,
      rx: 16, ry: 16,
      strokeUniform: true,
      left: preset.width / 2 - 100,
      top: preset.height / 2 - 60,
    });
    fc.add(rect);
    fc.setActiveObject(rect);
    fc.renderAll();
  }, [primary.hex, preset.width, preset.height]);

  const addImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fc = fabricRef.current;
    const file = e.target.files?.[0];
    if (!fc || !file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const imgEl = document.createElement("img");
      imgEl.onload = () => {
        const fabricImg = new FabricImage(imgEl);
        const maxW = 400;
        if (fabricImg.width! > maxW) {
          fabricImg.scaleToWidth(maxW);
        }
        fabricImg.set({
          left: preset.width / 2 - (fabricImg.getScaledWidth() / 2),
          top: preset.height / 2 - (fabricImg.getScaledHeight() / 2),
        });
        fc.add(fabricImg);
        fc.setActiveObject(fabricImg);
        fc.renderAll();
      };
      imgEl.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [preset.width, preset.height]);

  const addLine = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    const dark = brandConfig.colors.dark;
    const line = new Line([0, 0, 200, 0], {
      stroke: dark.hex,
      strokeWidth: 2,
      left: preset.width / 2 - 100,
      top: preset.height / 2,
    });
    fc.add(line);
    fc.setActiveObject(line);
    fc.renderAll();
  }, [preset.width, preset.height]);

  const applyBrandColor = useCallback((hex: string) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (!obj) return;
    if (obj instanceof Textbox) {
      obj.set("fill", hex);
    } else if (obj instanceof Line) {
      obj.set("stroke", hex);
    } else {
      obj.set("fill", hex);
    }
    fc.renderAll();
  }, []);

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

      {/* TOOLBAR */}
      <div className="h-12 bg-white border-b flex items-center gap-2 px-4 shrink-0">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={addText}>
          <Type className="h-4 w-4" />
          Text
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Square className="h-4 w-4" />
              Shape
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={addRect}>Rectangle</DropdownMenuItem>
            <DropdownMenuItem onClick={addCircle}>Circle</DropdownMenuItem>
            <DropdownMenuItem onClick={addRoundedRect}>Rounded Rect</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" className="gap-1.5" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
          Image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        <Button variant="ghost" size="sm" className="gap-1.5" onClick={addLine}>
          <Minus className="h-4 w-4" />
          Line
        </Button>

        <div className="h-6 w-px bg-gray-200" />

        {brandColorArray.map((c) => (
          <button
            key={c.key}
            onClick={() => applyBrandColor(c.hex)}
            className="w-6 h-6 rounded-full border border-gray-200 cursor-pointer transition-transform duration-150 hover:scale-110 shrink-0"
            style={{ backgroundColor: c.hex }}
            title={c.name}
          />
        ))}
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
          <LayerPanel
            layers={layers}
            selectedId={selectedObjId}
            onSelect={(obj) => {
              const fc = fabricRef.current;
              if (!fc) return;
              fc.setActiveObject(obj);
              fc.renderAll();
            }}
            onToggleVisibility={(obj) => {
              const fc = fabricRef.current;
              if (!fc) return;
              obj.set("visible", !obj.visible);
              fc.discardActiveObject();
              fc.renderAll();
              refreshLayers();
            }}
            onReorder={(fromIdx, toIdx) => {
              const fc = fabricRef.current;
              if (!fc) return;
              // layers are in reverse z-order, so convert
              const objs = fc.getObjects().filter((o: any) => !o.isGridLine);
              const fromZ = objs.length - 1 - fromIdx;
              const toZ = objs.length - 1 - toIdx;
              const obj = objs[fromZ];
              if (!obj) return;
              // Move to absolute z position
              const allObjs = fc.getObjects();
              const gridCount = allObjs.filter((o: any) => o.isGridLine).length;
              fc.moveObjectTo(obj, toZ + gridCount);
              fc.renderAll();
              refreshLayers();
            }}
          />
        </div>

        {/* CENTER CANVAS AREA */}
        <div
          ref={canvasAreaRef}
          className="flex-1 flex items-center justify-center min-w-0 overflow-hidden"
          style={{ backgroundColor: "#F5F5F5" }}
        >
          <div className="flex flex-col items-center" style={{ visibility: fitScale > 0 ? 'visible' : 'hidden' }}>
              <div
                className="shadow-lg bg-white"
                style={{
                  width: preset.width * scale,
                  height: preset.height * scale,
                }}
              >
                <div
                  ref={canvasContainerRef}
                  style={{
                    width: preset.width * scale,
                    height: preset.height * scale,
                  }}
                />
              </div>
              <div
                className="mt-3"
                style={{ fontFamily: body.family, fontWeight: 400, fontSize: "11px", color: "#9CA3AF" }}
              >
                {preset.width} × {preset.height} px
              </div>
            </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-72 border-l bg-white overflow-y-auto p-4 shrink-0">
          <div style={sectionLabelStyle}>Properties</div>
          <PropertiesPanel
            selectedObject={selectedObj}
            onPropertyChange={() => setPropsTick((t) => t + 1)}
            key={selectedObjId ?? "none"}
            tick={propsTick}
          />
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="h-10 border-t bg-white px-4 grid grid-cols-3 items-center shrink-0">
        <span style={{ fontFamily: body.family, fontWeight: 400, fontSize: "12px", color: "#6B7280" }}>
          {preset.name}
        </span>
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(0.25, (zoom ?? fitScale) - 0.1))}><Minus className="h-3.5 w-3.5" /></Button>
          <span style={{ fontFamily: body.family, fontWeight: 500, fontSize: "12px" }}>{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(2, (zoom ?? fitScale) + 0.1))}><Plus className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="flex items-center justify-end gap-2">
          <span style={{ fontFamily: body.family, fontWeight: 400, fontSize: "12px" }}>Grid</span>
          <Switch checked={gridEnabled} onCheckedChange={setGridEnabled} />
        </div>
      </div>
    </div>
  );
};

export default Index;

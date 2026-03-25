import { useRef } from "react";
import { FabricImage, FabricObject } from "fabric";
import { Button } from "@/components/ui/button";

interface Props {
  selectedObject: FabricObject;
  onPropertyChange: () => void;
}

export default function ImageProperties({ selectedObject, onPropertyChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const imgEl = document.createElement("img");
      imgEl.onload = () => {
        const fabricImg = selectedObject as FabricImage;
        const oldW = fabricImg.getScaledWidth();
        fabricImg.setElement(imgEl);
        fabricImg.scaleToWidth(oldW);
        fabricImg.setCoords();
        fabricImg.canvas?.renderAll();
        onPropertyChange();
      };
      imgEl.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <>
      <div className="border-t my-3" />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplace}
      />
      <Button
        variant="outline"
        className="w-full"
        onClick={() => fileRef.current?.click()}
      >
        Replace Image
      </Button>
    </>
  );
}

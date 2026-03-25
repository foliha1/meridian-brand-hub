import { useState, useEffect } from "react";
import { brandColorArray, brandConfig } from "@/config/brandConfig";

const { body } = brandConfig.typography;

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

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value);

  useEffect(() => {
    setHexInput(value);
  }, [value]);

  const handleHex = (val: string) => {
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChange(val);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {brandColorArray.map((c) => (
          <button
            key={c.key}
            onClick={() => { onChange(c.hex); setHexInput(c.hex); }}
            className="w-5 h-5 rounded-full cursor-pointer transition-transform duration-150 hover:scale-110 shrink-0"
            style={{
              backgroundColor: c.hex,
              boxShadow: value.toLowerCase() === c.hex.toLowerCase()
                ? `0 0 0 2px white, 0 0 0 4px ${c.hex}`
                : "none",
            }}
            title={c.name}
          />
        ))}
      </div>
      <input
        type="text"
        value={hexInput}
        onChange={(e) => handleHex(e.target.value)}
        placeholder="#000000"
        maxLength={7}
        style={inputStyle}
      />
    </>
  );
}

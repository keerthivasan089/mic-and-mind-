import React, { useState } from 'react';
import { Pipette, Check } from 'lucide-react';

interface ColorPickerFieldProps {
  label: string;
  description?: string;
  value: string;
  onChange: (color: string) => void;
  id?: string;
}

const PRESET_PALETTE = [
  { name: 'Terracotta Core', hex: '#DD5A1F' },
  { name: 'Sunset Amber', hex: '#FF8542' },
  { name: 'Warm Gold', hex: '#E5A823' },
  { name: 'Deep Espresso', hex: '#1C140F' },
  { name: 'Forest Moss', hex: '#2E7D32' },
  { name: 'Electric Azure', hex: '#3B82F6' },
  { name: 'Studio Purple', hex: '#8B5CF6' },
  { name: 'Crimson Ember', hex: '#E11D48' },
  { name: 'Charcoal Slate', hex: '#334155' },
];

export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  label,
  description,
  value,
  onChange,
  id = 'color-picker',
}) => {
  const [customHex, setCustomHex] = useState(value || '#DD5A1F');

  const handleHexInput = (val: string) => {
    setCustomHex(val);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
      onChange(val);
    }
  };

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextColor = e.target.value;
    setCustomHex(nextColor);
    onChange(nextColor);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
          {label}
        </label>
        <span className="font-mono text-[11px] text-neutral-400">{value || '#DD5A1F'}</span>
      </div>

      {description && (
        <p className="text-xs text-neutral-400 leading-relaxed">{description}</p>
      )}

      {/* Main Color Picker Widget */}
      <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-700/80 space-y-3 shadow-inner">
        <div className="flex items-center gap-3">
          {/* Swatch with native color input trigger */}
          <div className="relative group cursor-pointer shrink-0">
            <div
              className="w-11 h-11 rounded-lg border-2 border-white/20 shadow-md transition-transform group-hover:scale-105 flex items-center justify-center"
              style={{ backgroundColor: value || '#DD5A1F' }}
            >
              <Pipette className="w-4 h-4 text-white drop-shadow mix-blend-difference" />
            </div>
            <input
              id={id}
              type="color"
              value={value && value.startsWith('#') && value.length === 7 ? value : '#DD5A1F'}
              onChange={handleNativeColorChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Open Color Wheel Picker"
            />
          </div>

          {/* Hex text input field */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-neutral-500 font-bold">
                HEX
              </span>
              <input
                type="text"
                value={customHex}
                onChange={(e) => handleHexInput(e.target.value)}
                placeholder="#DD5A1F"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-12 pr-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#DD5A1F] transition-colors uppercase"
              />
            </div>
          </div>
        </div>

        {/* Preset Palette Swatches */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
            Design Tokens / Presets
          </div>
          <div className="grid grid-cols-9 gap-1.5">
            {PRESET_PALETTE.map((preset) => {
              const isSelected = value.toLowerCase() === preset.hex.toLowerCase();
              return (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => {
                    setCustomHex(preset.hex);
                    onChange(preset.hex);
                  }}
                  title={`${preset.name} (${preset.hex})`}
                  className={`relative h-7 rounded-md transition-all cursor-pointer flex items-center justify-center border ${
                    isSelected
                      ? 'ring-2 ring-white scale-110 z-10 border-white'
                      : 'border-white/10 hover:scale-105 hover:border-white/40'
                  }`}
                  style={{ backgroundColor: preset.hex }}
                >
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-white drop-shadow mix-blend-difference stroke-[3]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};



## Plan: Create Brand Config File & Font Import

### 1. Create `src/config/brandConfig.ts`
- Define `BrandConfig` TypeScript interface with all sections (brand, colors, typography, spacing, grid, canvasPresets)
- Export `brandConfig` const with all specified values
- Export `brandColorArray` helper
- Include the comment block at the top

### 2. Add Google Fonts import in `index.html`
- Add `<link>` tag for DM Sans (weights 400, 500, 700, 800) from Google Fonts in the `<head>`


# MPLS DC-to-DC Network Design

High-level web app for designing data-center to data-center **MPLS** topologies with bandwidth and monthly pricing.

## Features

- Interactive SVG topology canvas (add / move data centers, create MPLS links)
- Live pricing summary (total monthly cost, bandwidth, per-link breakdown)
- Editable mock price sheet (ready to swap for a real carrier sheet later)
- Local persistence via `localStorage`
- JSON import / export of the full design

## Quick start

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run oxlint |

## Usage tips

1. Click empty canvas space to add a data center
2. Drag nodes to reposition
3. Shift-click two DCs (or use **Connect MPLS…** in the inspector) to create a link
4. Pick a price tier or enter custom bandwidth / monthly price
5. Open **Price sheet** to edit mock tiers
6. Use **Export JSON** / **Import JSON** to share designs

## Data model

A design JSON file contains:

- `dataCenters` — nodes with name, optional region label, and canvas coordinates
- `links` — MPLS edges with bandwidth (Mbps), monthly USD price, optional tier id / notes
- `priceTiers` — editable mock catalog mapping bandwidth tiers to monthly price

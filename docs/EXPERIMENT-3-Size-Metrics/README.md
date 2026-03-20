# EXPERIMENT – 3: Size Metrics for SLMS

This folder contains the write-up and diagrams for **Experiment 3 – Evaluate Size Metrics for Student Learning Management System (SLMS)**.

## Contents

| File | Description |
|------|-------------|
| `experiment-3-size-metrics.md` | Full experiment document: Aim, Requirements, Theory, Procedure, Observation (tables + module-wise LOC), Result |
| `histogram-loc-per-module.html` | **Fig. 1** – Histogram of Lines of Code per functional module (open in browser) |
| `kiviat-metrics-graph.html` | **Fig. 2** – Kiviat (Radar) graph comparing LOC, File Count, and Functions across the 10 modules (open in browser) |

## How to view the graphs

1. Open `histogram-loc-per-module.html` in Chrome, Firefox, Safari, or Edge (double-click or drag into browser).
2. Open `kiviat-metrics-graph.html` the same way.

Both use Chart.js from a CDN; an internet connection is required for the first load.

## Metrics at a glance

- **Total LOC:** 16,101  
- **Total Files:** 94  
- **Total Modules:** 10 (functional)  
- **Total Functions:** 186  
- **Average LOC per Module:** 995  
- **Highest Complexity Module:** Assignment and Grading Module  

## Source scope

Metrics were computed over:

- `app/` (pages and API routes)
- `components/`
- `lib/`
- `context/`
- `prisma/` (schema and seed)
- `utils/`

Excluded: `node_modules/`, `.next/`, config-only files outside the above.

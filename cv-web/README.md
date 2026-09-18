# Resume — Dương Lê Cao Kỳ

English web resume based on `CV 2024.pdf`, updated with details provided by the resume owner. Work experience includes Mekonglink (Editor & Cameraman, September 2025–July 2026). Contact details, proper names, and education information are preserved from the source unless updated by the owner.

- `dist/index.html`: all resume content. Edit the text directly to update it.
- `dist/styles.css`: layout, colors, and responsive styles.
- `dist/portrait.webp`: portrait extracted from the original PDF.
- `dist/logos/`: DaVinci Resolve and CapCut logos supplied by the resume owner.

Open `dist/index.html` to view locally. No dependency installation or build step is required.

To export a single-page A4 PDF, run `python scripts/export_pdf.py`. The exporter reads the current HTML, preserves the supplied logos and portrait, and writes to the workspace's `output/pdf/` directory. It requires Python, ReportLab, Pillow, and Arial regular/bold fonts; use `--font-regular`, `--font-bold`, and `--output` to override the defaults.

Social media account names are shown as provided in the PDF, without links because no URLs were supplied. Education names are retained from the source for the owner to review.

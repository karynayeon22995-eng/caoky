# Resume — Dương Lê Cao Kỳ

English web resume based on `CV 2024.pdf`, updated with details provided by the resume owner. Work experience includes Mekonglink (Editor & Cameraman, September 2025–July 2026). Contact details, proper names, and education information are preserved from the source unless updated by the owner.

- `dist/index.html`: all resume content. Edit the text directly to update it.
- `dist/styles.css`: layout, colors, and responsive styles.
- `dist/portrait.webp`: portrait extracted from the original PDF.
- `dist/logos/`: DaVinci Resolve and CapCut logos supplied by the resume owner.

Open `dist/index.html` to view locally. No dependency installation or build step is required.

## Video portfolio

`dist/portfolio.html` is the English video editing portfolio. It opens with "Welcome my portfolio", then presents each channel followed by its selected videos, in this order: Thanh Cong – TC, Ngô Thiệu Vinh, onchain.kidz, and JupiterZone. It also links to the resume. Video editing is the portfolio owner's role.

- `dist/portfolio-data.js`: twelve selected public videos (three per channel), English display titles, original titles, channel, platform, thumbnail, and source URL. Edit this file to replace or reorder videos within each channel.
- `dist/portfolio-assets/`: thumbnails retrieved from each platform's public video metadata, stored locally to avoid expired image URLs.
- `dist/portfolio.css` and `dist/portfolio.js`: responsive channel sections and an accessible video dialog using the official YouTube and TikTok players. Direct source links remain available if playback is restricted.

The video selection was made from the supplied channels and can be refined by the owner. Public source URLs and channel attribution are preserved. No follower counts or performance claims are used.

To export a single-page A4 PDF, run `python scripts/export_pdf.py`. The exporter reads the current HTML, preserves the supplied logos and portrait, and writes to the workspace's `output/pdf/` directory. It requires Python, ReportLab, Pillow, and Arial regular/bold fonts; use `--font-regular`, `--font-bold`, and `--output` to override the defaults.

Social media account names are shown as provided in the PDF, without links because no URLs were supplied. Education names are retained from the source for the owner to review.

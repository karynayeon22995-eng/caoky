"""Export the current HTML resume as a single, selectable-text A4 PDF."""
from pathlib import Path
from html import escape, unescape
import argparse
import re

from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph

BASE = Path(__file__).resolve().parents[1]
SOURCE = BASE / "dist"
INK, TEAL, MUTED = "#102c35", "#257c86", "#52656d"
SIDE, SIDE_TEXT, SIDE_MUTED = "#112e37", "#edf7f8", "#aecbd3"


def text(raw):
    raw = re.sub(r"<br\s*/?>", " ", raw)
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", "", raw))).strip().replace("—", "-").replace("–", "-")


def find(pattern, source):
    result = re.search(pattern, source, re.S)
    if not result:
        raise ValueError(f"Required resume field missing: {pattern}")
    return result.group(1)


def extract():
    source = (SOURCE / "index.html").read_text(encoding="utf-8")
    assert '<footer class="footer">' not in source, "Remove the footer before exporting."
    details = re.findall(r"<dt>(.*?)</dt><dd>(.*?)</dd>", source, re.S)
    jobs = []
    for block in re.findall(r'<article class="job">(.*?)</article>', source, re.S):
        jobs.append({
            "date": text(find(r'<div class="job-date">(.*?)</div>', block)),
            "company": text(find(r"<h3>(.*?)</h3>", block)),
            "role": text(find(r'<p class="job-role">(.*?)</p>', block)),
            "descriptions": [text(part) for groups in re.findall(r"<p>(.*?)</p>|<li>(.*?)</li>", block, re.S) for part in groups if part],
        })
    education = []
    for block in re.findall(r'<article class="education-row">(.*?)</article>', source, re.S):
        education.append({"date": text(find(r'<span class="education-date">(.*?)</span>', block)),
                          "title": text(find(r"<h3>(.*?)</h3>", block)),
                          "description": text(find(r"<p>(.*?)</p>", block))})
    skills = find(r'<div class="skill-notes">(.*?)\n        </div>', source)
    return {
        "name": text(find(r'<h1 id="name">(.*?)</h1>', source)),
        "role": text(find(r'<div class="role">(.*?)</div>', source)),
        "tagline": text(find(r'<p class="intro-line">(.*?)</p>', source)),
        "specialties": [text(s) for s in re.findall(r"<span>(.*?)</span>", find(r'<div class="specialties".*?>(.*?)</div>', source))],
        "details": [(text(k), text(v)) for k, v in details[:4]],
        "socials": [(text(k), text(re.sub(r"<br\s*/?>", " / ", v))) for k, v in details[4:]],
        "about": text(find(r'<section class="profile-section about">.*?<p>(.*?)</p>', source)),
        "jobs": jobs,
        "education": education,
        "skills_intro": text(find(r'<p class="skills-intro">(.*?)</p>', source)),
        "skills": [(text(k), text(v)) for k, v in re.findall(r"<h3>(.*?)</h3><p>(.*?)</p>", skills, re.S)],
        "language": text(find(r'<div class="language-row">.*?<p>(.*?)</p>', source)),
    }


class ResumePDF:
    def __init__(self, output):
        self.c = canvas.Canvas(str(output), pagesize=A4, pageCompression=1)
        self.c.setTitle("Dương Lê Cao Kỳ - CV")
        self.c.setAuthor("Dương Lê Cao Kỳ")
        self.c.setSubject("Video editing, camera work, motion graphics and AI skills")
        self.c.setCreator("CV web resume export")

    def para(self, value, x, y, width, size=9.4, leading=12.4, color=MUTED, bold=False):
        style = ParagraphStyle("cv", fontName="CVBold" if bold else "CVRegular",
                               fontSize=size, leading=leading, textColor=HexColor(color),
                               splitLongWords=False, spaceBefore=0, spaceAfter=0)
        paragraph = Paragraph(escape(value), style)
        _, height = paragraph.wrap(width, 1000)
        if y - height < 19:
            raise ValueError(f"Content exceeds the A4 page: {value}")
        paragraph.drawOn(self.c, x, y - height)
        return y - height

    def section(self, title, x, y, width, sidebar=False):
        self.c.setStrokeColor(HexColor("#38545d" if sidebar else "#dde6e9"))
        self.c.setLineWidth(.5)
        self.c.line(x, y, x + width, y)
        y -= 10 if sidebar else 12
        return self.para(title, x, y, width, size=10.2 if sidebar else 13,
                         leading=13 if sidebar else 16, color=SIDE_TEXT if sidebar else INK, bold=True) - (9 if sidebar else 10)

    def draw(self, data):
        c = self.c
        page_w, page_h = A4
        margin = 18
        left_w = 176
        side_x, side_inner = margin, margin + 14
        side_content_w = left_w - 28
        right_x = side_x + left_w + 23
        right_w = page_w - margin - right_x
        top = page_h - margin
        c.setFillColor(HexColor(SIDE))
        c.rect(side_x, margin, left_w, page_h - 2 * margin, fill=1, stroke=0)

        # Preserve the supplied portrait, clipping only to its layout frame.
        photo_h = 183
        photo = Image.open(SOURCE / "portrait.webp")
        scale = max(left_w / photo.width, photo_h / photo.height)
        iw, ih = photo.width * scale, photo.height * scale
        c.saveState()
        clip = c.beginPath()
        clip.rect(side_x, top - photo_h, left_w, photo_h)
        c.clipPath(clip, stroke=0)
        c.drawImage(ImageReader(photo), side_x - (iw - left_w) / 2,
                    top - photo_h - (ih - photo_h) * .8, iw, ih, mask="auto")
        c.restoreState()

        y = top - photo_h - 16
        y = self.para("Personal details", side_inner, y, side_content_w, 10.2, 13, SIDE_TEXT, True) - 9
        for label, value in data["details"]:
            y = self.para(label, side_inner, y, side_content_w, 7.4, 10, SIDE_MUTED) - 1
            y = self.para(value, side_inner, y, side_content_w, 8.5, 11.5, SIDE_TEXT) - 8
        y -= 2
        y = self.section("About me", side_inner, y, side_content_w, True)
        y = self.para(data["about"], side_inner, y, side_content_w, 8.7, 12.3, SIDE_TEXT) - 14
        y = self.section("Education & training", side_inner, y, side_content_w, True)
        for item in data["education"]:
            y = self.para(item["date"], side_inner, y, side_content_w, 7.7, 10, SIDE_MUTED) - 2
            y = self.para(item["title"], side_inner, y, side_content_w, 8.6, 11.3, SIDE_TEXT, True) - 2
            y = self.para(item["description"], side_inner, y, side_content_w, 8.3, 11, SIDE_TEXT) - 9
        y -= 3
        y = self.section("Languages", side_inner, y, side_content_w, True)
        y = self.para("English", side_inner, y, side_content_w, 8.7, 11.5, SIDE_TEXT, True) - 2
        y = self.para(data["language"], side_inner, y, side_content_w, 8.5, 11.5, SIDE_TEXT) - 14
        y = self.section("Social media", side_inner, y, side_content_w, True)
        for label, value in data["socials"]:
            y = self.para(label, side_inner, y, side_content_w, 7.4, 10, SIDE_MUTED) - 1
            y = self.para(value, side_inner, y, side_content_w, 8.5, 11.5, SIDE_TEXT) - 7
        left_bottom = y

        y = top - 3
        first, last = data["name"].rsplit(" ", 2)[0], " ".join(data["name"].split()[-2:])
        y = self.para(first, right_x, y, right_w, 29, 33, INK, True)
        y = self.para(last, right_x, y + 1, right_w, 29, 33, INK, True) - 6
        y = self.para(data["role"], right_x, y, right_w, 10.4, 14, TEAL, True) - 7
        y = self.para(data["tagline"], right_x, y, right_w, 9.7, 13, MUTED) - 8
        # The same three professional specialties as the web version.
        y = self.para("  /  ".join(data["specialties"]), right_x, y, right_w, 8.0, 11, TEAL) - 15

        y = self.section("Work experience", right_x, y, right_w)
        for item in data["jobs"]:
            date_width = pdfmetrics.stringWidth(item["date"], "CVRegular", 8.0)
            c.setFillColor(HexColor(MUTED))
            c.setFont("CVRegular", 8.0)
            c.drawRightString(right_x + right_w, y - 9.5, item["date"])
            y = self.para(item["company"], right_x, y, right_w - date_width - 12, 10.5, 13.5, INK, True) - 1
            y = self.para(item["role"], right_x, y, right_w, 8.5, 11, TEAL) - 3
            for description in item["descriptions"]:
                y = self.para(description, right_x, y, right_w, 9.2, 12.0, MUTED) - 2
            y -= 9

        y += 1
        y = self.section("Skills & tools", right_x, y, right_w)
        y = self.para(data["skills_intro"], right_x, y, right_w, 9.2, 12, MUTED) - 10
        tools = [("Pr", "Premiere Pro", "#182046", "#c2baff"),
                 ("Ae", "After Effects", "#182046", "#c2baff"),
                 ("Ps", "Photoshop", "#082a42", "#69c7f9"),
                 ("Au", "Audition", "#073b3a", "#7ee8d0"),
                 ("davinci-resolve.png", "DaVinci Resolve", None, None),
                 ("capcut.png", "CapCut", None, None)]
        cell_w, row_h = right_w / 3, 26
        for i, (symbol, label, bg, fg) in enumerate(tools):
            tx, ty = right_x + (i % 3) * cell_w, y - (i // 3) * row_h
            if bg:
                c.setFillColor(HexColor(bg))
                c.roundRect(tx, ty - 18, 18, 18, 3, fill=1, stroke=0)
                c.setFont("CVBold", 8.5)
                c.setFillColor(HexColor(fg))
                c.drawCentredString(tx + 9, ty - 12, symbol)
            else:
                c.drawImage(ImageReader(Image.open(SOURCE / "logos" / symbol)), tx, ty - 18, 18, 18, mask="auto")
            self.para(label, tx + 24, ty - 3, cell_w - 27, 8.0, 10, INK)
        y -= row_h * 2 + 4
        for title, description in data["skills"]:
            y = self.para(title, right_x, y, right_w, 9.2, 12, INK, True) - 3
            y = self.para(description, right_x, y, right_w, 9.2, 12, MUTED) - 10
        if min(y, left_bottom) < margin:
            raise ValueError(f"Page overflow: main={y:.1f}, sidebar={left_bottom:.1f}")
        c.showPage()
        c.save()
        print(f"A4 layout bottom margins: main={y:.1f} pt, sidebar={left_bottom:.1f} pt")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=BASE.parents[1] / "output/pdf/Duong_Le_Cao_Ky_CV.pdf")
    parser.add_argument("--font-regular", default="C:/Windows/Fonts/arial.ttf")
    parser.add_argument("--font-bold", default="C:/Windows/Fonts/arialbd.ttf")
    args = parser.parse_args()
    pdfmetrics.registerFont(TTFont("CVRegular", args.font_regular))
    pdfmetrics.registerFont(TTFont("CVBold", args.font_bold))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    ResumePDF(args.output).draw(extract())
    print(args.output)


if __name__ == "__main__":
    main()

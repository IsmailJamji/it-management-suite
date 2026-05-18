#!/usr/bin/env python3
"""Convert CAHIER_DES_CHARGES.md to PDF using fpdf2."""

import re
import sys
from pathlib import Path

import markdown
from fpdf import FPDF
from fpdf.fonts import FontFace

DOCS_DIR = Path(__file__).resolve().parent.parent
MD_FILE = DOCS_DIR / "CAHIER_DES_CHARGES.md"
PDF_FILE = DOCS_DIR / "CAHIER_DES_CHARGES.pdf"

FONT_DIR = Path(__file__).resolve().parent / "fonts"


class CahierPDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("AppFont", "I", 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "IT Management Suite — Dossier de soutenance", align="C")
        self.ln(4)

    def footer(self):
        self.set_y(-12)
        self.set_font("AppFont", "I", 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, f"Page {self.page_no()}/{{nb}}", align="C")


def ensure_fonts() -> tuple[str, str, str]:
    """Resolve Unicode-capable TTF fonts (Windows Arial or bundled DejaVu)."""
    win_fonts = Path(r"C:\Windows\Fonts")
    arial = win_fonts / "arial.ttf"
    arial_bold = win_fonts / "arialbd.ttf"
    arial_italic = win_fonts / "ariali.ttf"
    if arial.exists() and arial_bold.exists():
        italic = arial_italic if arial_italic.exists() else arial
        return str(arial), str(arial_bold), str(italic)

    FONT_DIR.mkdir(parents=True, exist_ok=True)
    regular = FONT_DIR / "DejaVuSans.ttf"
    bold = FONT_DIR / "DejaVuSans-Bold.ttf"
    italic_path = FONT_DIR / "DejaVuSans-Oblique.ttf"

    if regular.exists() and bold.exists():
        it = str(italic_path) if italic_path.exists() else str(regular)
        return str(regular), str(bold), it

    import urllib.request

    base = "https://raw.githubusercontent.com/dejavu-fonts/dejavu-fonts/version_2_37/ttf/"
    for dest, name in [
        (regular, "DejaVuSans.ttf"),
        (bold, "DejaVuSans-Bold.ttf"),
        (italic_path, "DejaVuSans-Oblique.ttf"),
    ]:
        print(f"Téléchargement de {name}...")
        urllib.request.urlretrieve(base + name, dest)
    return str(regular), str(bold), str(italic_path)


def preprocess_md(text: str) -> str:
    """Adjust markdown for fpdf2 HTML renderer."""
    # Remove anchor links in TOC-style headers {#...}
    text = re.sub(r"\s*\{#[^}]+\}", "", text)
    # Internal anchor links break fpdf2 — keep link text only
    text = re.sub(r"\[([^\]]+)\]\(#[^)]+\)", r"\1", text)
    return text


def fix_html_for_fpdf(html: str) -> str:
    """fpdf2 does not support nested tags inside table cells."""

    def clean_cell(match: re.Match) -> str:
        inner = match.group(2)
        inner = re.sub(r"</?code>", "", inner)
        inner = re.sub(r"</?strong>", "", inner)
        inner = re.sub(r"</?em>", "", inner)
        return match.group(1) + inner + match.group(3)

    return re.sub(
        r"(<t[dh][^>]*>)(.*?)(</t[dh]>)",
        clean_cell,
        html,
        flags=re.DOTALL | re.IGNORECASE,
    )


def md_to_html(md_text: str) -> str:
    html = markdown.markdown(
        md_text,
        extensions=["tables", "fenced_code", "nl2br", "sane_lists"],
    )
    html = fix_html_for_fpdf(html)
    style = """
    <style>
      h1 { color: #0f3d6e; font-size: 20pt; margin-bottom: 8px; }
      h2 { color: #1565a8; font-size: 14pt; margin-top: 14px; }
      h3 { color: #333333; font-size: 11pt; margin-top: 10px; }
      h4 { font-size: 10pt; }
      p { font-size: 9.5pt; line-height: 1.4; }
      table { border-collapse: collapse; width: 100%; font-size: 8.5pt; }
      th { background-color: #e8f0f8; font-weight: bold; }
      th, td { border: 1px solid #cccccc; padding: 4px 6px; }
      code { font-family: monospace; background-color: #f4f4f4; font-size: 8pt; }
      pre { background-color: #f4f4f4; font-size: 7.5pt; padding: 6px; }
      blockquote { border-left: 3px solid #1565a8; padding-left: 8px; color: #444; }
      hr { border: none; border-top: 1px solid #ddd; margin: 12px 0; }
      li { font-size: 9.5pt; }
      strong { font-weight: bold; }
    </style>
    """
    return f"<!DOCTYPE html><html><head>{style}</head><body>{html}</body></html>"


def build_pdf(md_path: Path, pdf_path: Path) -> None:
    regular, bold, italic = ensure_fonts()
    text = preprocess_md(md_path.read_text(encoding="utf-8"))
    html = md_to_html(text)

    pdf = CahierPDF(orientation="P", unit="mm", format="A4")
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.set_margins(18, 15, 18)

    pdf.add_font("AppFont", "", regular)
    pdf.add_font("AppFont", "B", bold)
    pdf.add_font("AppFont", "I", italic)
    pdf.set_font("AppFont", size=10)

    tag_styles = {
        "pre": FontFace(family="AppFont", size_pt=7),
        "code": FontFace(family="AppFont", size_pt=8),
        "h1": FontFace(family="AppFont", size_pt=18, emphasis="BOLD", color="#0f3d6e"),
        "h2": FontFace(family="AppFont", size_pt=13, emphasis="BOLD", color="#1565a8"),
        "h3": FontFace(family="AppFont", size_pt=11, emphasis="BOLD"),
        "h4": FontFace(family="AppFont", size_pt=10, emphasis="BOLD"),
    }

    pdf.add_page()
    pdf.write_html(html, tag_styles=tag_styles)
    pdf.output(str(pdf_path))


def main() -> int:
    md_path = MD_FILE
    pdf_path = PDF_FILE
    if len(sys.argv) > 1:
        md_path = Path(sys.argv[1])
    if len(sys.argv) > 2:
        pdf_path = Path(sys.argv[2])

    if not md_path.exists():
        print(f"Fichier introuvable: {md_path}", file=sys.stderr)
        return 1

    build_pdf(md_path, pdf_path)
    size_kb = pdf_path.stat().st_size / 1024
    print(f"PDF généré: {pdf_path} ({size_kb:.0f} Ko)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

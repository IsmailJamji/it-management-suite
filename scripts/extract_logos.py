"""Extract logo variants from composite source image."""
from pathlib import Path
from PIL import Image

PROJECT = Path(__file__).resolve().parent.parent
ASSETS = PROJECT / "assets"
CURSOR_ASSETS = Path(
    r"C:\Users\i.jamji\.cursor\projects"
    r"\c-Users-i-jamji-OneDrive-DISTRA-Desktop-it-management-suite-main\assets"
)

def find_source() -> Path:
    local = ASSETS / "it-suite-logos-source.png"
    if local.exists():
        return local
    matches = list(CURSOR_ASSETS.glob("*it-suite-logo*"))
    if not matches:
        raise FileNotFoundError("Logo source image not found")
    return matches[0]


def crop_variants(img: Image.Image) -> dict[str, Image.Image]:
    w, h = img.size
    # Layout: 2 columns x 3 rows (variants 1-2 top, 3-4 middle, 5 bottom spanning)
    col_w = w // 2
    row_h = h // 3

    return {
        "logo-brand-grid": img.crop((0, 0, col_w, row_h)),
        "logo-brand-brackets": img.crop((col_w, 0, w, row_h)),
        "logo-terminal": img.crop((0, row_h, col_w, row_h * 2)),
        "logo-app-icon": img.crop((col_w, row_h, w, row_h * 2)),
        "logo-footer": img.crop((0, row_h * 2, w, h)),
    }


def save_rgba(crop: Image.Image, path: Path, max_w: int | None = None) -> None:
    if crop.mode != "RGBA":
        crop = crop.convert("RGBA")
    if max_w and crop.width > max_w:
        ratio = max_w / crop.width
        crop = crop.resize((max_w, int(crop.height * ratio)), Image.Resampling.LANCZOS)
    crop.save(path, optimize=True)


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    src = find_source()
    img = Image.open(src).convert("RGBA")
    print(f"Source: {src} ({img.size[0]}x{img.size[1]})")

    variants = crop_variants(img)
    for name, crop in variants.items():
        out = ASSETS / f"{name}.png"
        save_rgba(crop, out)
        print(f"  {name}.png -> {crop.size}")

    # App icon: square 1024 from variant 4
    icon_src = variants["logo-app-icon"]
    side = min(icon_src.size)
    left = (icon_src.width - side) // 2
    top = (icon_src.height - side) // 2
    square = icon_src.crop((left, top, left + side, top + side))
    icon_1024 = square.resize((1024, 1024), Image.Resampling.LANCZOS)
    icon_1024.save(ASSETS / "icon.png", optimize=True)
    print("  icon.png -> 1024x1024")

    # Public folder for CRA
    public = PROJECT / "public" / "logos"
    public.mkdir(parents=True, exist_ok=True)
    for name in variants:
        save_rgba(Image.open(ASSETS / f"{name}.png"), public / f"{name}.png", max_w=800)
    save_rgba(icon_1024, public / "logo-app-icon.png", max_w=256)
    print("Done.")


if __name__ == "__main__":
    main()

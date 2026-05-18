"""Generate PNG + ICO app icons (IT Suite variant 4, thème CloudCash)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BLUE = (67, 24, 255, 255)  # #4318FF
GREEN = (5, 205, 153, 255)  # #05CD99
LIGHT_BLUE = (134, 140, 255, 255)  # #868CFF
DARK_BLUE = (91, 79, 255, 255)  # #5B4FFF
WHITE = (255, 255, 255, 255)

PROJECT = Path(__file__).resolve().parent.parent
ASSETS = PROJECT / "assets"
PUBLIC = PROJECT / "public"
BUILD = PROJECT / "build"

ICO_SIZES = [16, 24, 32, 48, 64, 128, 256]


def draw_app_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    pad = max(1, int(size * 0.06))
    radius = max(2, int(size * 0.2))
    draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=radius, fill=BLUE)

    gap = max(1, int(size * 0.04))
    cell = (size - 2 * pad - gap) // 2
    r_cell = max(1, int(cell * 0.22))
    ox, oy = pad, pad

    cells = [
        (ox, oy, WHITE),
        (ox + cell + gap, oy, LIGHT_BLUE),
        (ox, oy + cell + gap, GREEN),
        (ox + cell + gap, oy + cell + gap, DARK_BLUE),
    ]
    for x, y, color in cells:
        draw.rounded_rectangle([x, y, x + cell, y + cell], radius=r_cell, fill=color)

    if size >= 48:
        try:
            font = ImageFont.truetype("arialbd.ttf", max(8, int(cell * 0.38)))
        except OSError:
            font = ImageFont.load_default()
        it_box = cells[3]
        cx = it_box[0] + cell // 2
        cy = it_box[1] + cell // 2
        draw.text((cx, cy), "IT", fill=WHITE, font=font, anchor="mm")

    return img


def save_ico(path: Path) -> None:
    images = [draw_app_icon(s) for s in ICO_SIZES]
    base = images[-1]
    base.save(
        path,
        format="ICO",
        sizes=[(s, s) for s in ICO_SIZES],
        append_images=images[:-1],
    )


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    BUILD.mkdir(parents=True, exist_ok=True)

    icon_1024 = draw_app_icon(1024)
    icon_1024.save(ASSETS / "icon.png", optimize=True)
    print("assets/icon.png (1024x1024)")

    save_ico(ASSETS / "icon.ico")
    print("assets/icon.ico (multi-size)")

    for size in (512, 192):
        draw_app_icon(size).save(PUBLIC / f"logo{size}.png", optimize=True)
        print(f"public/logo{size}.png")

    draw_app_icon(256).save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=[(256, 256), (32, 32), (16, 16)],
        append_images=[draw_app_icon(32), draw_app_icon(16)],
    )
    print("public/favicon.ico")

    icon_1024.save(BUILD / "icon.png", optimize=True)
    save_ico(BUILD / "icon.ico")
    print("build/icon.png + build/icon.ico (copie pour packaging)")

    print("Done.")


if __name__ == "__main__":
    main()

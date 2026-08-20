"""
Генерирует PWA-иконки приложения (rounded-square, фиолетово-индиго градиент,
белая искра/sparkle — как на иконке в Header из макета).

Не часть рантайма приложения — разовый скрипт для public/icons/*.png.
Запуск: python3 scripts/generate_icons.py
Зависимость: Pillow (pip install pillow --break-system-packages)
"""

from PIL import Image, ImageDraw
import math
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')
os.makedirs(OUT_DIR, exist_ok=True)

GRAD_FROM = (99, 102, 241)   # #6366F1
GRAD_TO = (139, 92, 246)     # #8B5CF6
BG_DEEP = (11, 13, 27)       # #0B0D1B


def rounded_square_gradient(size, corner_ratio, padding_ratio=0.0):
    """Rounded-square с диагональным градиентом (135deg: top-left -> bottom-right)."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    grad = Image.new('RGB', (size, size))
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            r = int(GRAD_FROM[0] + (GRAD_TO[0] - GRAD_FROM[0]) * t)
            g = int(GRAD_FROM[1] + (GRAD_TO[1] - GRAD_FROM[1]) * t)
            b = int(GRAD_FROM[2] + (GRAD_TO[2] - GRAD_FROM[2]) * t)
            grad.putpixel((x, y), (r, g, b))

    mask = Image.new('L', (size, size), 0)
    mdraw = ImageDraw.Draw(mask)
    pad = int(size * padding_ratio)
    corner = int(size * corner_ratio)
    mdraw.rounded_rectangle([pad, pad, size - 1 - pad, size - 1 - pad], radius=corner, fill=255)

    img.paste(grad, (0, 0), mask)
    return img


def draw_sparkle(draw, cx, cy, r, fill=(255, 255, 255, 255)):
    """4-конечная звезда (искра) — простой ИИ-символ без внешних шрифтов/иконок."""
    pts = []
    for i in range(8):
        angle = math.pi / 4 * i - math.pi / 2
        radius = r if i % 2 == 0 else r * 0.38
        pts.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle)))
    draw.polygon(pts, fill=fill)


def make_icon(size, path, padding_ratio=0.0, corner_ratio=0.22):
    img = rounded_square_gradient(size, corner_ratio=corner_ratio, padding_ratio=padding_ratio)
    draw = ImageDraw.Draw(img)
    cx = cy = size / 2
    draw_sparkle(draw, cx, cy, size * 0.22)
    draw_sparkle(draw, size * 0.72, size * 0.30, size * 0.07)
    img.save(path)
    print('wrote', path)


if __name__ == '__main__':
    make_icon(192, os.path.join(OUT_DIR, 'icon-192.png'), padding_ratio=0.0)
    make_icon(512, os.path.join(OUT_DIR, 'icon-512.png'), padding_ratio=0.0)
    # Maskable: система обрежет иконку по кругу, поэтому контент держим в
    # безопасной зоне ~ centre 80% (padding_ratio даёт запас по краям).
    make_icon(512, os.path.join(OUT_DIR, 'icon-maskable-512.png'), padding_ratio=0.10, corner_ratio=0.0)

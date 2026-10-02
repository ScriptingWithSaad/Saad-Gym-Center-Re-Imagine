"""Create responsive WebP assets from the project's original photographs."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/optimized'
SOURCES = {
    'hero': ('HIIT-Training.jpg', [640, 960, 1600]),
    'coaching': ('trainer-bg.jpg', [640, 1100]),
    'strength': ('Strength-Training.jpg', [420, 720]),
    'kickboxing': ('Cardio-Kickboxing.jpg', [420, 720]),
    'yoga': ('yoga.png', [420, 720]),
    'hiit': ('HIIT-Training.jpg', [420, 720]),
    'pullups': ('pull-up.jpg', [420, 720]),
    'pushups': ('pushups.png', [420, 720]),
    'lunges': ('lunge.png', [420, 720]),
    'pilates': ('Pilates.jpg', [420, 720]),
}

OUT.mkdir(exist_ok=True)
for name, (source, widths) in SOURCES.items():
    image = ImageOps.exif_transpose(Image.open(ROOT / 'assets/images' / source)).convert('RGB')
    for width in widths:
        scaled = image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
        scaled.save(OUT / f'{name}-{width}.webp', quality=82, method=6)
print(f'{len(list(OUT.glob("*.webp")))} responsive images, {sum(p.stat().st_size for p in OUT.glob("*.webp")):,} bytes')

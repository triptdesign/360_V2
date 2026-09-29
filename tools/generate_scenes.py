from pathlib import Path
import json, re

BASE = Path(__file__).resolve().parents[1]
PANO = BASE / "assets" / "panoramas"
OUT = BASE / "data" / "scenes.js"
EXT = {".jpg", ".jpeg", ".png", ".webp"}

def title(name):
    return re.sub(r"[_-]+", " ", name).strip().title()

def make_id(stem, index):
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", stem).strip("-").lower()
    return slug or f"scene-{index}"

files = sorted([p for p in PANO.iterdir() if p.is_file() and p.suffix.lower() in EXT], key=lambda p: p.name.lower())
scenes = []
used_ids = set()
for i, p in enumerate(files, 1):
    base_id = make_id(p.stem, i)
    scene_id = base_id
    n = 2
    while scene_id in used_ids:
        scene_id = f"{base_id}-{n}"
        n += 1
    used_ids.add(scene_id)
    scenes.append({
        "id": scene_id,
        "title": title(p.stem),
        "file": p.name
    })

OUT.write_text("window.TRIPT_SCENES = " + json.dumps(scenes, indent=2, ensure_ascii=False) + ";\n", encoding="utf-8")
print(f"Generated {len(scenes)} scenes -> {OUT}")
for scene in scenes:
    print(f"- {scene['file']}")

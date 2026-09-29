from pathlib import Path
import json, argparse

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data"
PLAN_DIR = BASE / "assets" / "plan"
LOGO = BASE / "assets" / "logos" / "tript-logo-circle.webp"

IMAGE_EXT = {".webp", ".png", ".jpg", ".jpeg"}

def find_plan(explicit=None):
    if explicit:
        return explicit
    files = sorted(p for p in PLAN_DIR.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXT)
    if not files:
        raise FileNotFoundError("No plan image found in assets/plan/")
    return "assets/plan/" + files[0].name

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--title", default="TRIPT 360")
    ap.add_argument("--plan", default=None, help="Optional exact plan path. If omitted, the first image in assets/plan is used.")
    ap.add_argument("--floor", default="Ground Floor")
    a = ap.parse_args()

    plan = find_plan(a.plan)
    logo = "assets/logos/tript-logo-circle.webp" if LOGO.exists() else "assets/logos/tript-logo-circle.png"

    data = {
        "version": "6.2.3",
        "title": a.title,
        "logo": logo,
        "floors": [{
            "id": "ground-floor",
            "name": a.floor,
            "plan": plan,
            "views": []
        }]
    }

    DATA.mkdir(exist_ok=True)
    out = DATA / "project.json"
    out.write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"Created {out}")
    print(f"Plan: {plan}")
    print(f"Logo: {logo}")

if __name__ == "__main__":
    main()

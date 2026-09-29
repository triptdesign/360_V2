from pathlib import Path
from PIL import Image
import argparse
import sys

BASE = Path(__file__).resolve().parents[1]
ASSETS = BASE / "assets"
SUPPORTED = {".jpg", ".jpeg", ".png"}

def convert_file(src, quality, delete_source):
    dst = src.with_suffix(".webp")
    try:
        with Image.open(src) as im:
            if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
                im = im.convert("RGBA")
            else:
                im = im.convert("RGB")
            im.save(dst, "WEBP", quality=max(1, min(100, quality)), method=6)

        if delete_source and dst.exists() and dst.stat().st_size > 0:
            src.unlink()

        print(f"Converted: {src.relative_to(BASE)} -> {dst.relative_to(BASE)}")
        return True
    except Exception as exc:
        print(f"FAILED: {src.relative_to(BASE)} | {exc}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="Convert all JPG/JPEG/PNG images inside assets/ to WebP."
    )
    parser.add_argument("--quality", type=int, default=90)
    parser.add_argument(
        "--keep-source",
        action="store_true",
        help="Keep original files instead of deleting them."
    )
    args = parser.parse_args()

    if not ASSETS.exists():
        print(f"ERROR: assets folder not found: {ASSETS}")
        sys.exit(1)

    files = [
        p for p in ASSETS.rglob("*")
        if p.is_file() and p.suffix.lower() in SUPPORTED
    ]

    if not files:
        print("No JPG/JPEG/PNG files found inside assets/.")
        return

    converted = 0
    failed = 0

    for src in files:
        if convert_file(src, args.quality, not args.keep_source):
            converted += 1
        else:
            failed += 1

    print("\n====================================")
    print("TRIPT IMAGE CONVERSION COMPLETE")
    print("====================================")
    print(f"Found:     {len(files)}")
    print(f"Converted: {converted}")
    print(f"Failed:    {failed}")
    print(f"Quality:   {args.quality}")
    print("Originals: DELETED after successful conversion"
          if not args.keep_source else "Originals: KEPT")

if __name__ == "__main__":
    main()

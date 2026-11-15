"""assets/illustration.png を XYZ タイル (WebP) に変換する。GDAL不要・Pillowのみ。

イラストは event.json の image.bounds（架空の緯度経度）に貼り付ける。
bounds は赤道付近の小さな領域でOK。実際のGPS座標との対応は src/lib/warp.ts が担当。

使い方: python3 scripts/make_tiles.py [--image assets/illustration.png] [--out public/tiles]
出力: public/tiles/{z}/{x}/{y}.webp と public/tiles/manifest.json（オフライン事前取得用の一覧）
"""
import argparse, json, math, shutil
from pathlib import Path
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("--image", default="assets/illustration.png")
ap.add_argument("--config", default="src/data/event.json")
ap.add_argument("--out", default="public/tiles")
args = ap.parse_args()

cfg = json.load(open(args.config, encoding="utf-8"))["image"]
b = cfg["bounds"]
T = 256

def mx(lng): return (lng + 180.0) / 360.0
def my(lat):
    return 0.5 - math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) / (2 * math.pi)

x0, x1 = mx(b["west"]), mx(b["east"])
y0, y1 = my(b["north"]), my(b["south"])  # 北が小さいy

src = Image.open(args.image).convert("RGBA")
out = Path(args.out)
if out.exists():
    shutil.rmtree(out)
urls = []

for z in range(cfg["minzoom"], cfg["maxzoom"] + 1):
    n = 2 ** z
    # このズームでイラストが占めるピクセル数
    gw, gh = (x1 - x0) * n * T, (y1 - y0) * n * T
    scaled = src.resize((max(1, round(gw)), max(1, round(gh))),
                        Image.LANCZOS if gw < src.width else Image.BICUBIC)
    tx0, tx1 = math.floor(x0 * n), math.floor(x1 * n)
    ty0, ty1 = math.floor(y0 * n), math.floor(y1 * n)
    canvas = Image.new("RGBA", ((tx1 - tx0 + 1) * T, (ty1 - ty0 + 1) * T), (0, 0, 0, 0))
    canvas.paste(scaled, (round(x0 * n * T) - tx0 * T, round(y0 * n * T) - ty0 * T))
    for tx in range(tx0, tx1 + 1):
        for ty in range(ty0, ty1 + 1):
            tile = canvas.crop(((tx - tx0) * T, (ty - ty0) * T, (tx - tx0 + 1) * T, (ty - ty0 + 1) * T))
            p = out / str(z) / str(tx)
            p.mkdir(parents=True, exist_ok=True)
            tile.save(p / f"{ty}.webp", "WEBP", quality=88, method=6)
            urls.append(f"/tiles/{z}/{tx}/{ty}.webp")
    print(f"z{z}: {(tx1 - tx0 + 1) * (ty1 - ty0 + 1)} tiles")

(out / "manifest.json").write_text(json.dumps(urls))
size = sum(f.stat().st_size for f in out.rglob("*.webp")) / 1e6
print(f"total {len(urls)} tiles, {size:.1f} MB -> {out}")

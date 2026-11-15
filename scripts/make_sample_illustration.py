"""動作確認用のダミーイラストを assets/illustration.png に生成する。
実際には自作のイラスト(PNG/JPEG)を assets/illustration.png に置き換えるだけでOK。
スポット位置は src/data/event.json の px (画像ピクセル座標) と一致させている。
"""
import json, random
from PIL import Image, ImageDraw, ImageFont

ev = json.load(open("src/data/event.json", encoding="utf-8"))
W, H = ev["image"]["width"], ev["image"]["height"]
random.seed(7)

img = Image.new("RGB", (W, H), (214, 232, 190))
d = ImageDraw.Draw(img)

# 川
river = [(0, 520), (350, 600), (700, 760), (1000, 800), (1350, 1000), (1700, 1180), (2048, 1220)]
d.line(river, fill=(150, 200, 226), width=110, joint="curve")
d.line(river, fill=(176, 217, 238), width=80, joint="curve")

# 道（スポット間を結ぶ）
pts = [tuple(s["px"]) for s in ev["spots"]]
order = [0, 1, 2, 3, 4]
road = [pts[i] for i in order]
d.line(road, fill=(238, 222, 186), width=46, joint="curve")
d.line(road, fill=(250, 240, 214), width=34, joint="curve")

# 木と家
for _ in range(220):
    x, y = random.randint(20, W - 20), random.randint(20, H - 20)
    if any((x - px) ** 2 + (y - py) ** 2 < 130 ** 2 for px, py in pts):
        continue
    r = random.randint(14, 30)
    d.ellipse((x - r, y - r, x + r, y + r), fill=(104, 164, 96), outline=(78, 128, 74), width=3)
for _ in range(40):
    x, y = random.randint(40, W - 90), random.randint(40, H - 90)
    if any((x - px) ** 2 + (y - py) ** 2 < 150 ** 2 for px, py in pts):
        continue
    w, h = random.randint(34, 60), random.randint(30, 50)
    d.rectangle((x, y, x + w, y + h), fill=(240, 196, 168), outline=(168, 118, 96), width=3)
    d.polygon([(x - 4, y), (x + w / 2, y - 22), (x + w + 4, y)], fill=(206, 98, 84))

# スポット
try:
    font = ImageFont.load_default(size=44)
    small = ImageFont.load_default(size=26)
except TypeError:
    font = small = ImageFont.load_default()
for i, s in enumerate(ev["spots"], 1):
    x, y = s["px"]
    d.ellipse((x - 62, y - 62, x + 62, y + 62), fill=(255, 250, 235), outline=(70, 90, 120), width=6)
    d.text((x, y), str(i), fill=(70, 90, 120), font=font, anchor="mm")

d.rectangle((0, 0, W - 1, H - 1), outline=(70, 90, 120), width=10)
d.text((40, H - 50), "SAMPLE ILLUSTRATION - replace assets/illustration.png", fill=(70, 90, 120), font=small)

img.save("assets/illustration.png", optimize=True)
print("wrote assets/illustration.png", img.size)

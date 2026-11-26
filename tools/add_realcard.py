# -*- coding: utf-8 -*-
"""실제 명함 이미지를 회원에게 붙인다.

사용법 (저장소 루트에서):
    python tools/add_realcard.py <회원 id 또는 이름> <앞면 이미지> [뒷면 이미지]
    python tools/add_realcard.py 구영모 "C:/받은파일/구영모_앞.jpg" "C:/받은파일/구영모_뒤.jpg"
    python tools/add_realcard.py m02 --back "C:/받은파일/뒤.png"      # 뒷면만 추가·교체
    python tools/add_realcard.py m02 --remove                          # 실제 명함 내리기

하는 일:
  1) 사진 방향(EXIF)을 바로잡고 JPG로 바꿔 assets/realcards/<id>/front.jpg, back.jpg 로 저장
     (긴 변 2000px까지만 줄인다. 내용은 자르거나 고치지 않는다)
  2) data/members.json 의 해당 회원에 "realCard": {"front": ..., "back": ...} 를 기록
그 뒤 git add / commit / push 하면 상세 페이지에 '실제 명함' 영역이 나타난다.
"""
import argparse
import json
import os
import shutil
import sys

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "members.json")
MAX_SIDE = 2000


def load():
    with open(DATA, encoding="utf-8", newline="") as f:
        raw = f.read()
    return json.loads(raw), ("\r\n" if "\r\n" in raw else "\n")


def save(data, nl):
    text = json.dumps(data, ensure_ascii=False, indent=1)
    with open(DATA, "w", encoding="utf-8", newline="") as f:
        f.write(text.replace("\n", nl) + nl)


def find_member(data, key):
    hits = [m for m in data["members"] if m["id"] == key or m["name"] == key]
    if len(hits) != 1:
        names = ", ".join(f'{m["id"]} {m["name"]}' for m in data["members"] if key in m["name"])
        sys.exit(f"회원을 하나로 정하지 못했습니다: '{key}' ({len(hits)}명 일치) {names}")
    return hits[0]


def convert(src, dst):
    img = Image.open(src)
    img = ImageOps.exif_transpose(img)
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[-1])
        img = bg
    else:
        img = img.convert("RGB")
    if max(img.size) > MAX_SIDE:
        img.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    img.save(dst, "JPEG", quality=92, optimize=True, subsampling=0)
    return img.size


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("member")
    ap.add_argument("front", nargs="?")
    ap.add_argument("back_pos", nargs="?")
    ap.add_argument("--back")
    ap.add_argument("--remove", action="store_true")
    a = ap.parse_args()

    data, nl = load()
    m = find_member(data, a.member)
    folder = os.path.join(ROOT, "assets", "realcards", m["id"])

    if a.remove:
        m.pop("realCard", None)
        shutil.rmtree(folder, ignore_errors=True)
        save(data, nl)
        print(f'{m["id"]} {m["name"]}: 실제 명함을 내렸습니다')
        return

    rc = dict(m.get("realCard") or {})
    for side, src in (("front", a.front), ("back", a.back or a.back_pos)):
        if not src:
            continue
        if not os.path.isfile(src):
            sys.exit(f"파일이 없습니다: {src}")
        size = convert(src, os.path.join(folder, side + ".jpg"))
        rc[side] = f'assets/realcards/{m["id"]}/{side}.jpg'
        print(f'{m["id"]} {m["name"]} {side}: {size[0]}x{size[1]} -> {rc[side]}')
    if not rc:
        sys.exit("앞면 또는 뒷면 이미지를 하나 이상 지정하세요")
    m["realCard"] = {k: rc[k] for k in ("front", "back") if k in rc}
    save(data, nl)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Cắt, căn và thu nhỏ ảnh trong art/generated thành assets/sprites + manifest.json.

Mỗi ảnh được đặt vào đúng chỗ hình cũ từng nằm trong ô của nó (lấy từ art/reference),
nên kích thước tương đối giữa các khung hình của cùng một nhân vật được giữ nguyên.
Chạy: python tools/process-sprites.py [--skip a,b,c] [--only a,b]
Cần: Pillow, numpy.
"""
import json, os, sys, math
from PIL import Image, ImageFilter, ImageDraw
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEN, REF, GLOW = (os.path.join(ROOT, 'art', d) for d in ('generated', 'reference', 'glowref'))
OUT = os.path.join(ROOT, 'assets', 'sprites')
REVIEW = os.path.join(ROOT, 'art', '_review')
PAD, SC = 7, 2
args = sys.argv[1:]
def opt(flag):
    return set(args[args.index(flag) + 1].split(',')) if flag in args else set()
SKIP, ONLY = opt('--skip'), opt('--only')
meta = json.load(open(os.path.join(ROOT, 'art', 'sprites.json'), encoding='utf-8'))

def bbox(alpha, th=28):
    ys, xs = np.where(alpha > th)
    if len(xs) == 0: return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1

def process(name):
    d = meta[name]; w, h = d['w'], d['h']; W, H = w * SC, h * SC
    im = Image.open(os.path.join(GEN, name + '.png')).convert('RGBA')
    arr = np.array(im); arr[arr[:, :, 3] < 64] = 0        # xoá vệt nền mờ còn sót (alpha thấp) để viền giấy không bám vào
    im = Image.fromarray(arr); a = arr[:, :, 3]
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    if d['flat']:
        if a.min() > 200:                      # ảnh kín (gạch lát): bỏ 3% viền rồi kéo kín ô
            m = int(im.width * .03); src = im.crop((m, m, im.width - m, im.height - m))
        else:
            bb = bbox(a); src = im.crop(bb) if bb else im
        out = src.resize((W, H), Image.LANCZOS); note = 'flat'
    else:
        bb = bbox(a)
        if not bb: return None, 'ảnh rỗng'
        src = im.crop(bb); bw, bh = src.size
        rp = os.path.join(REF, name + '.png')
        if os.path.exists(rp):
            ref = Image.open(rp).convert('RGBA').crop((PAD, PAD, PAD + w, PAD + h))
            rb = bbox(np.array(ref)[:, :, 3]) or (0, 0, w, h)
        else: rb = (0, 0, w, h)                    # chưa có hình tham chiếu: lấp kín ô, chân chạm đáy
        rw, rh = (rb[2] - rb[0]) * SC, (rb[3] - rb[1]) * SC
        skew = abs(math.log((bw / bh) / (rw / rh)))
        if skew < (0.13 if os.path.exists(rp) else 0.3): tw, th_ = rw, rh; note = 'khớp'
        else:
            s = min(rw / bw, rh / bh); tw, th_ = max(1, round(bw * s)), max(1, round(bh * s)); note = 'lệch tỉ lệ %.2f' % skew
        src = src.resize((tw, th_), Image.LANCZOS)
        cx = (rb[0] + rb[2]) * SC / 2; x = int(round(cx - tw / 2)); y = rb[3] * SC - th_
        x = max(0, min(W - tw, x)); y = max(0, min(H - th_, y))
        out.alpha_composite(src, (x, y))
    os.makedirs(OUT, exist_ok=True)
    out.save(os.path.join(OUT, name + '.webp'), quality=90, method=3)
    entry = {'file': name + '.webp'}
    gp = os.path.join(GLOW, name + '.png')
    if os.path.exists(gp):                     # vùng phát sáng ban đêm: chỗ sáng màu ấm nằm quanh vùng sáng của hình cũ
        g = Image.open(gp).convert('L').resize((W, H), Image.BILINEAR)
        zone = np.array(g.filter(ImageFilter.MaxFilter(2 * (9 * SC) + 1))) > 24
        o = np.array(out).astype(np.float32); r, gg, b, al = o[:, :, 0], o[:, :, 1], o[:, :, 2], o[:, :, 3]
        luma = .299 * r + .587 * gg + .114 * b
        light = (luma > 150) & (r > b + 18) & (al > 128) & zone
        frac = light.sum() / max(1, zone.sum())
        if frac > 0.10:
            mask = Image.fromarray((light * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2 * SC))
            col = Image.merge('RGB', [Image.fromarray(np.clip(c * 0.45 + k * 0.55, 0, 255).astype(np.uint8)) for c, k in ((r, 255), (gg, 214), (b, 130))])
            glow = Image.composite(col, Image.new('RGB', (W, H), 0), mask)
            glow.save(os.path.join(OUT, name + '.glow.webp'), quality=88, method=3); entry['glow'] = name + '.glow.webp'; note += ', glow %.0f%%' % (frac * 100)
        else: note += ', glow giữ hình cũ (%.0f%%)' % (frac * 100)
    return entry, note

names = sorted(n[:-4] for n in os.listdir(GEN) if n.endswith('.png') and n[:-4] in meta)
if ONLY: names = [n for n in names if n in ONLY]
manifest = {'sprites': {}}; notes = {}
for n in names:
    if n in SKIP: notes[n] = 'bỏ qua'; continue
    e, note = process(n); notes[n] = note
    if e: manifest['sprites'][n] = e
if not ONLY:
    json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for n in names: print('%-12s %s' % (n, notes[n]))
print('Đã ghi', len(manifest['sprites']), 'hình vào assets/sprites')

# tờ đối chiếu: hình cũ bên trái, hình mới bên phải
os.makedirs(REVIEW, exist_ok=True)
T, COLS, ROWS = 150, 6, 3
for page, i0 in enumerate(range(0, len(names), COLS * ROWS)):
    sheet = Image.new('RGB', (COLS * T * 2 + 8, ROWS * (T + 18) + 8), (118, 124, 112)); dr = ImageDraw.Draw(sheet)
    for k, n in enumerate(names[i0:i0 + COLS * ROWS]):
        cx, cy = 4 + (k % COLS) * T * 2, 4 + (k // COLS) * (T + 18)
        for j, p in enumerate((os.path.join(REF, n + '.png'), os.path.join(OUT, n + '.webp'))):
            if not os.path.exists(p): continue
            t = Image.open(p).convert('RGBA'); t.thumbnail((T - 6, T - 6), Image.LANCZOS)
            sheet.paste(t, (cx + j * T + (T - t.width) // 2, cy + (T - t.height)), t)
        dr.text((cx + 4, cy + T + 3), n + '  ' + notes[n][:26], fill=(255, 255, 255))
    sheet.save(os.path.join(REVIEW, 'sheet%d.jpg' % (page + 1)), quality=88)

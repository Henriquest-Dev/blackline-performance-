#!/usr/bin/env python3
"""Recorta um quadro (grelha) gerado pelo ChatGPT nas imagens dos serviços.

Uso:
  python3 scripts/crop-grid.py quadro.png --grid 4x3 nome1 nome2 ... nome12
  python3 scripts/crop-grid.py quadro.png nome1 nome2 nome3 nome4          (2x2 por defeito)
  Nomes por ordem de leitura (linha a linha, da esquerda para a direita); "-" salta um painel.

Deteta automaticamente divisórias (linhas brancas/pretas) entre painéis, corta uma pequena margem,
e grava em assets/img/servicos/<nome>.jpg com 1200x800 (3:2).
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps
import numpy as np

import os
OUT = Path(os.environ.get('BLP_OUT') or Path(__file__).resolve().parent.parent / 'assets' / 'img' / 'servicos')
SIZE = (1200, 800)


def seam(profile, center, span):
    """Procura, perto do centro, a faixa mais 'lisa' (divisória) num perfil de variação."""
    lo, hi = int(center - span), int(center + span)
    window = profile[lo:hi]
    i = int(np.argmin(window)) + lo
    # alarga enquanto continuar liso (divisórias com vários píxeis)
    thr = window.min() + (np.median(window) - window.min()) * 0.25
    a = b = i
    while a > lo and profile[a - 1] <= thr:
        a -= 1
    while b < hi - 1 and profile[b + 1] <= thr:
        b += 1
    return a, b


def main():
    args = sys.argv[1:]
    if len(args) < 2:
        print(__doc__)
        sys.exit(1)
    cols, rows = 2, 2
    if '--grid' in args:
        i = args.index('--grid')
        cols, rows = (int(x) for x in args[i + 1].lower().split('x'))
        del args[i:i + 2]
    src = Image.open(args[0]).convert('RGB')
    names = args[1:]
    a = np.asarray(src).astype(float)
    H, W = a.shape[:2]
    # divisórias têm pouca variação ao longo de todo o comprimento
    row_var = np.abs(np.diff(a, axis=1)).mean(axis=(1, 2))
    col_var = np.abs(np.diff(a, axis=0)).mean(axis=(0, 2))
    xs = [(-1, -1)] + [seam(col_var, W * k / cols, W / cols * 0.15) for k in range(1, cols)] + [(W, W)]
    ys = [(-1, -1)] + [seam(row_var, H * k / rows, H / rows * 0.15) for k in range(1, rows)] + [(H, H)]
    m = max(3, int(min(W / cols, H / rows) * 0.006))  # margem de segurança
    OUT.mkdir(parents=True, exist_ok=True)
    k = 0
    for r in range(rows):
        for c in range(cols):
            if k >= len(names):
                return
            name = names[k]; k += 1
            if name == '-':
                continue
            x0, x1 = xs[c][1] + 1, xs[c + 1][0]
            y0, y1 = ys[r][1] + 1, ys[r + 1][0]
            tile = src.crop((x0 + m, y0 + m, x1 - m, y1 - m))
            tile = ImageOps.fit(tile, SIZE, Image.LANCZOS, centering=(0.5, 0.45))
            path = OUT / f'{name}.jpg'
            tile.save(path, 'JPEG', quality=86, optimize=True, progressive=True)
            print(f'{path}  ({x1 - x0}x{y1 - y0} → {SIZE[0]}x{SIZE[1]})')


if __name__ == '__main__':
    main()

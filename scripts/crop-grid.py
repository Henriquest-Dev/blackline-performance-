#!/usr/bin/env python3
"""Recorta um quadro 2x2 gerado pelo ChatGPT em 4 imagens dos serviços.

Uso:
  python3 scripts/crop-grid.py quadro1.png tuning-remap ceramic-coating correcao-pintura revisao-completa
  (ordem: cima-esquerda, cima-direita, baixo-esquerda, baixo-direita; "-" para saltar um painel)

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
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    src = Image.open(sys.argv[1]).convert('RGB')
    names = sys.argv[2:6]
    a = np.asarray(src).astype(float)
    H, W = a.shape[:2]
    # variação entre linhas/colunas vizinhas: divisórias têm variação baixa ao longo de todo o comprimento
    row_var = np.abs(np.diff(a, axis=1)).mean(axis=(1, 2))
    col_var = np.abs(np.diff(a, axis=0)).mean(axis=(0, 2))
    r0, r1 = seam(row_var, H / 2, H * 0.06)
    c0, c1 = seam(col_var, W / 2, W * 0.06)
    m = max(4, int(min(W, H) * 0.004))  # margem de segurança
    boxes = [
        (0, 0, c0, r0), (c1 + 1, 0, W, r0),
        (0, r1 + 1, c0, H), (c1 + 1, r1 + 1, W, H),
    ]
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (x0, y0, x1, y1) in zip(names, boxes):
        if name == '-':
            continue
        tile = src.crop((x0 + m, y0 + m, x1 - m, y1 - m))
        tile = ImageOps.fit(tile, SIZE, Image.LANCZOS, centering=(0.5, 0.45))
        path = OUT / f'{name}.jpg'
        tile.save(path, 'JPEG', quality=84, optimize=True, progressive=True)
        print(f'{path}  ({x1 - x0}x{y1 - y0} → {SIZE[0]}x{SIZE[1]})')


if __name__ == '__main__':
    main()

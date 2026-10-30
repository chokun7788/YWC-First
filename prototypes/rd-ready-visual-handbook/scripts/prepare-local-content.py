# -*- coding: utf-8 -*-
"""Copy review material without changing verification status or production data."""
import json
import pathlib
import shutil
import urllib.request

root = pathlib.Path(__file__).resolve().parents[1]
research = pathlib.Path('D:/Chokun/research/2026-10-29')
data_dir = root / 'src/data'
data_dir.mkdir(exist_ok=True)
for filename, origin in [
    ('poster.json', research / 'run-poster-003048/poster-rows.json'),
    ('guides.json', research / 'run-text-guide-223732/guides-text.json'),
]:
    data = json.loads(origin.read_text(encoding='utf-8-sig'))
    (data_dir / filename).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
shutil.copy2(research / 'run-text-guide-223732/assets/packing-poster-2566.png', root / 'public/assets/packing-poster-2566.png')
fonts = root / 'public/assets/fonts'
fonts.mkdir(exist_ok=True)
base = 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosansthai/'
for remote, local in [('NotoSansThai%5Bwdth,wght%5D.ttf', 'NotoSansThai-Variable.ttf'), ('OFL.txt', 'OFL.txt')]:
    target = fonts / local
    if not target.exists():
        urllib.request.urlretrieve(base + remote, target)
print('Copied 17 historical poster rows, 12 review guides, original poster and local licensed font.')

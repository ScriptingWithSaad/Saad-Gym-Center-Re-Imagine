"""Version CSS and JavaScript together to avoid mixed browser cache releases."""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/site'
OUT.mkdir(exist_ok=True)
html = (ROOT / 'index.html').read_text(encoding='utf-8')
for source, name, extension in [('stylesheet/style.css', 'style', 'css'), ('script/script.js', 'app', 'js')]:
    content = (ROOT / source).read_text(encoding='utf-8-sig').replace('\r\n', '\n')
    if extension == 'css':
        content = content.replace('../assets/fonts/', '../fonts/')
    digest = hashlib.sha256(content.encode()).hexdigest()[:12]
    filename = f'{name}.{digest}.{extension}'
    (OUT / filename).write_text(content, encoding='utf-8', newline='\n')
    pattern = rf'(?:{re.escape(source)}|assets/site/{name}\.[a-f0-9]+\.{extension})'
    html, count = re.subn(pattern, f'assets/site/{filename}', html)
    assert count == 1, f'Expected one {name} reference, found {count}'
    print(filename)
(ROOT / 'index.html').write_text(html, encoding='utf-8', newline='\n')

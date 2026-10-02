from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.anchors, self.assets = [], [], []
    def handle_starttag(self, tag, values):
        attrs = dict(values)
        if 'id' in attrs: self.ids.append(attrs['id'])
        if tag == 'a' and attrs.get('href','').startswith('#'): self.anchors.append(attrs['href'][1:])
        for key in ['src','href']:
            value = attrs.get(key,'')
            if value and not value.startswith(('https:','http:','#','data:')): self.assets.append(value)
        if 'srcset' in attrs: self.assets.extend(item.strip().split()[0] for item in attrs['srcset'].split(','))

page = Page()
html = (ROOT / 'index.html').read_text(encoding='utf-8')
page.feed(html)
assert len(page.ids) == len(set(page.ids)), 'Duplicate IDs'
assert set(page.anchors).issubset(page.ids), 'Missing section anchor'
assert '__' not in html, 'Unfilled page template'
for asset in set(page.assets): assert (ROOT / asset).is_file(), f'Missing asset: {asset}'
for css in re.findall(r'assets/site/style\.[a-f0-9]+\.css',html):
    for font in re.findall(r"url\('([^']+)'\)", (ROOT/css).read_text()):
        assert (ROOT/css).parent.joinpath(font).resolve().is_file(), f'Missing font: {font}'
assert html.count('class="program-card"') == 8
assert html.count('class="plan ') == 3
for unwanted in ['123 Fitness Street', 'info@elitefitnesshub.com', 'Sarah Johnson', 'cdnjs.cloudflare.com']:
    assert unwanted not in html, f'Old placeholder/dependency remains: {unwanted}'
print(f'PASS: {len(set(page.assets))} local assets, unique IDs, section links, 8 programs and 3 plans.')

"""Build the new-icon grid: current UI artwork and explicitly prepared assets."""
from collections import Counter
from hashlib import sha256
from html import escape
import json
from pathlib import Path
import re
import shutil

repo = Path(__file__).resolve().parents[2]
output = repo / 'apps/main/public/static/previews/status-icons-blender'
images = repo / 'packages/ui/src/assets/images'
icons = repo / 'packages/ui/src/assets/icons'

# Human-readable product locations, rather than implementation names on the page.
entries = [
    ('deposit-empty', 'No deposits', 'empty', 'DepositEmptyLounger.webp', [
        'Portfolio → Deposits · No transfer history',
        'Portfolio → Overview → Deposits · No transfer history',
    ]),
    ('tracked-wallets', 'Tracked wallets', 'empty', 'TrackedWalletGlasses.webp', [
        'Portfolio → Overview → Tracked wallets · No saved addresses',
        'Portfolio → Tracked wallets · Empty state',
    ]),
    ('waiting', 'Waiting', 'status', 'Waiting3D.webp', [
        'Bank deposit · Awaiting transfer or processing',
        'Bank withdrawal · Pending or processing',
    ]),
    ('review', 'Provider review', 'status', 'Review3D.webp', [
        'Bank deposit · Provider setup and Bridge handoff',
    ]),
    ('review-clock', 'In review', 'status', 'ReviewClock3D.webp', [
        'Bank deposit · Verification in review',
    ]),
    ('bank', 'At your bank', 'status', 'Bank3D.webp', [
        'Bank withdrawal → Tracking · At your bank',
    ]),
    ('individual', 'Individual', 'account', 'IndividualBeachChair3D.webp', ['Bank deposit → Setup · Individual account']),
    ('business', 'Business', 'account', 'BusinessKiosk3D.webp', ['Bank deposit → Setup · Business account']),
    ('pearl-shell', 'Pearl shell', 'design', 'PearlShell3D.webp', [
        'Portfolio → Dashboard · Header illustration (Figma)',
    ]),
    ('citrus-press', 'Citrus press', 'ready', 'CitrusPress3D.webp', [
        'Available for future use · not yet assigned to a screen',
    ]),
    ('usd', 'USD', 'currency', 'FiatUsd.svg', [
        'Bank deposit → Amount · Currency selector',
        'Bank withdrawal → Estimated receive · Currency selector',
    ]),
    ('eur', 'EUR', 'currency', 'FiatEur.svg', [
        'Bank deposit → Amount · Currency selector',
        'Bank withdrawal → Estimated receive · Currency selector',
    ]),
]
categories = {'account': 'Account type', 'empty': 'Empty states', 'status': 'Status', 'currency': 'Currency', 'ready': 'Ready to use', 'design': 'Design'}
consumers = {}
sources = list((repo / 'apps/main/src').rglob('*.tsx'))
texts = {path: path.read_text() for path in sources}
for path, text in texts.items():
    for filename in re.findall(r'@galacticcouncil/ui/assets/images/([^"\']+)', text):
        consumers.setdefault(filename, []).append(str(path.relative_to(repo)))
catalog_images = {entry[3] for entry in entries if entry[2] not in {'currency', 'ready', 'design'}}
assert catalog_images <= set(consumers), f'New icons without UI consumers: {catalog_images - set(consumers)}'

(output / 'assets').mkdir(parents=True, exist_ok=True)
records = []
cards = []
library = {entry['id']: entry for entry in json.loads((output / 'library/catalog.json').read_text())['entries']}
for identifier, title, category, filename, usage in entries:
    source = (output / 'library' / library[identifier]['export']) if category in {'ready', 'design'} else (icons if category == 'currency' else images) / filename
    assert source.is_file(), source
    if category in {'ready', 'design'}:
        used_by = []
    elif category == 'currency':
        symbol = source.stem
        used_by = [str(path.relative_to(repo)) for path, text in texts.items() if re.search(r'\b' + symbol + r'\b', text)]
    else:
        used_by = consumers[filename]
    assert used_by or category in {'ready', 'design'}, f'Unused asset: {filename}'
    digest = sha256(source.read_bytes()).hexdigest()
    exported = output / 'assets' / filename
    shutil.copy2(source, exported)
    url = f'assets/{filename}?v={digest[:12]}'
    size = 24 if category == 'currency' else (48 if category == 'account' else 96)
    record = {'id': identifier, 'title': title, 'category': category,
              'source': str(source.relative_to(repo)), 'url': url, 'sha256': digest,
              'usedIn': usage, 'consumers': used_by, 'previewSize': size}
    record['status'] = 'Ready to use' if category == 'ready' else ('Used in design' if category == 'design' else 'In use')
    if category == 'design': record['designUrl'] = library[identifier]['designUrl']
    record['downloads'] = {key: 'library/' + value for key, value in library[identifier].items() if key in {'export', 'master', 'blender'}}
    records.append(record)
    lines = ''.join(f'<li>{escape(location)}</li>' for location in usage)
    heading = 'Availability' if category == 'ready' else 'Used in'
    download_labels = {'export': 'UI export', 'master': 'PNG', 'blender': 'Blender'}
    downloads = ''.join(f'<a href="{escape(url)}" download>{download_labels[key]}</a>' for key, url in record['downloads'].items())
    cards.append(f'''<article class="card {category}" data-category="{category}" id="{identifier}">
<div class="card-head"><h2>{escape(title)}</h2><span class="tag">{categories[category]}</span></div>
<a class="render" href="{url}" target="_blank" rel="noopener" aria-label="Open {escape(title)} image"><img src="{url}" alt="{escape(title)}" width="240" height="240" loading="lazy"></a>
<div class="usage"><h3>{heading}</h3><ul>{lines}</ul></div>
<nav class="asset-links" aria-label="Download {escape(title)}">{downloads}</nav>
<div class="native"><span>Small preview · {size}px</span><img src="{url}" alt="" width="{size}" height="{size}" loading="lazy"></div>
</article>''')

counts = Counter(record['category'] for record in records)
filters = '<button type="button" data-filter="all" aria-pressed="true">All <span>' + str(len(records)) + '</span></button>'
filters += ''.join(f'<button type="button" data-filter="{key}" aria-pressed="false">{label} <span>{counts[key]}</span></button>' for key, label in categories.items())
html = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hydration · New UI icons</title>
<style>
:root{color-scheme:dark;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f3f5f9;background:#060b16}*{box-sizing:border-box}body{margin:0;padding:48px 24px 56px}main{max-width:1180px;margin:auto}header{margin-bottom:28px}.eyebrow{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#a4c8eb;margin:0 0 12px}h1{font:400 36px Georgia,serif;margin:0 0 12px}header p{color:#aab0bc;font-size:14px;line-height:1.6;margin:0;max-width:620px}.toolbar{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:20px}.filters{display:flex;gap:6px;flex-wrap:wrap}button,input{font:inherit}button{border:1px solid #293446;background:#0e1525;border-radius:24px;color:#abb7c7;padding:9px 13px;font-size:12px;cursor:pointer}button span{opacity:.65;margin-left:5px}button[aria-pressed=true]{background:#b3d7fa;border-color:#b3d7fa;color:#08101c}button:hover{border-color:#7ea4c9}button:focus-visible,input:focus-visible,a:focus-visible{outline:2px solid #b3d7fa;outline-offset:4px}input{width:260px;max-width:100%;padding:11px 16px;border:1px solid #293446;background:#0e1525;border-radius:24px;color:#f3f5f9;font-size:12px}input::placeholder{color:#8d99ab}.count{color:#8d99ab;font-size:12px;margin:0 0 20px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}.card{background:#0e1525;border:1px solid #29303d;border-radius:24px;overflow:hidden;display:flex;flex-direction:column;min-width:0}.card[hidden]{display:none}.card-head{padding:21px 22px;display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid #222b3b}h2{font-size:14px;font-weight:500;margin:0;line-height:1.35}.tag{font-size:10px;color:#a4b7cc;background:#182335;border-radius:20px;padding:5px 9px;white-space:nowrap}.render{display:grid;place-items:center;padding:24px;min-height:276px;text-decoration:none}.render img{display:block;width:228px;height:228px;max-width:100%;object-fit:contain}.currency .render img{width:120px;height:120px}.usage{padding:2px 22px 24px;flex:1}h3{font-size:10px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:#7f91a8;margin:0 0 10px}ul{list-style:none;margin:0;padding:0;display:grid;gap:7px}li{font-size:12px;line-height:1.6;color:#b9c3d0;overflow-wrap:anywhere}.native{border-top:1px solid #222b3b;padding:16px 22px;display:flex;justify-content:space-between;align-items:center;gap:16px;min-height:128px}.native span{font-size:11px;color:#8393a9}.native img{object-fit:contain;max-width:96px;max-height:96px}.currency .native img{width:24px;height:24px}.no-results{padding:48px 24px;color:#aab0bc;text-align:center}.no-results[hidden]{display:none}footer{margin-top:28px;color:#77889e;font-size:11px;line-height:1.6}@media(max-width:1020px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:660px){body{padding:28px 16px 36px}h1{font-size:29px}.toolbar{gap:14px}input{width:100%}.filters{gap:5px}button{padding:8px 11px;font-size:11px}.grid{grid-template-columns:1fr;gap:20px}.render{min-height:264px}.render img{width:224px;height:224px}.card-head{padding:20px 22px}}
.library-links,.asset-links{display:flex;gap:10px;flex-wrap:wrap}.library-links{margin-top:18px}.asset-links{padding:0 22px 20px}.library-links a,.asset-links a{display:inline-block;text-decoration:none;color:#b3d7fa;border:1px solid #405774;border-radius:24px;padding:8px 12px;font-size:12px}.library-links a:hover,.asset-links a:hover{border-color:#b3d7fa}.ready .tag{color:#edc9ef;background:#362440}</style></head><body><main>
<header><p class="eyebrow">Hydration · Design reference</p><h1 id="new-icons-title">New UI icons</h1><p>New artwork used in the interface, in designs, or ready for future use. Each icon lists its current usage or availability, with downloads below.</p><nav class="library-links" aria-label="Icon library"><a href="library/index.html">Open source library</a><a href="new-icons.zip" download>Download icon pack</a></nav></header>
<div class="toolbar"><div class="filters" role="group" aria-label="Filter icons">__FILTERS__</div><input type="search" id="search" placeholder="Find an icon or usage…" aria-label="Find an icon or usage"></div>
<p class="count" id="count" aria-live="polite">__COUNT__ icons · 7 in use · 1 in design · 1 ready</p>
<section class="grid" aria-label="New icon catalog">__CARDS__</section><p class="no-results" id="empty" hidden>No icons match your search.</p>
<footer>Current selected new icons, plus artwork ready for future use. The icon pack includes UI exports, high-resolution PNGs and editable Blender sources.</footer>
</main><script>
const cards=[...document.querySelectorAll('.card')];
const buttons=[...document.querySelectorAll('[data-filter]')];
let filter='all';
function update(){const query=document.querySelector('#search').value.trim().toLowerCase();let visible=0;for(const card of cards){const show=(filter==='all'||card.dataset.category===filter)&&card.textContent.toLowerCase().includes(query);card.hidden=!show;if(show)visible++}document.querySelector('#count').textContent=visible+' of '+cards.length+' icons';document.querySelector('#empty').hidden=visible!==0}
for(const button of buttons)button.addEventListener('click',()=>{filter=button.dataset.filter;for(const other of buttons)other.setAttribute('aria-pressed',String(other===button));update()});
document.querySelector('#search').addEventListener('input',update);
</script></body></html>'''
status_counts = Counter(record['status'] for record in records)
html = html.replace('7 in use · 1 in design · 1 ready', f"{status_counts['In use']} in use · {status_counts['Used in design']} in design · {status_counts['Ready to use']} ready")
html = html.replace('__FILTERS__', filters).replace('__COUNT__', str(len(records))).replace('__CARDS__', '\n'.join(cards))
(output / 'comparison.htm').write_text(html)
(output / 'catalog.json').write_text(json.dumps({'entries': records}, indent=2) + '\n')
print(json.dumps({'assets': len(records), 'categories': dict(counts), 'page': str(output / 'comparison.htm')}, indent=2))

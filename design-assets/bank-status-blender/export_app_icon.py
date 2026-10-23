"""Export the native bank render without flattening its transparent background."""
import hashlib
import json
from pathlib import Path

from PIL import Image

source = Path(__file__).resolve().parent
repo = source.parent.parent
render = source / 'bank-status-1024.png'
blend = source / 'bank-status.blend'
asset = repo / 'packages/ui/src/assets/images/Bank3D.webp'
image = Image.open(render)
assert image.size == (1024, 1024) and image.mode == 'RGBA'
assert image.getpixel((0, 0))[3] == 0
image.resize((512, 512), Image.Resampling.LANCZOS).save(asset, format='WEBP', quality=94, method=6)
check = Image.open(asset)
assert check.mode == 'RGBA' and check.size == (512, 512)
assert check.getpixel((0, 0))[3] == 0
manifest = json.loads((source / 'manifest.json').read_text())
manifest.update({
    'renderSha256': hashlib.sha256(render.read_bytes()).hexdigest(),
    'blendSha256': hashlib.sha256(blend.read_bytes()).hexdigest(),
    'appAssetSha256': hashlib.sha256(asset.read_bytes()).hexdigest(),
    'appAssetBytes': asset.stat().st_size,
    'appAssetSize': [512, 512],
    'appAssetMode': check.mode,
})
(source / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps(manifest, indent=2))

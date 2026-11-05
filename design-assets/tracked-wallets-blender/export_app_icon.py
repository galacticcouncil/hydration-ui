"""Export the selected translucent D render to the shared tracked-wallet image."""
import hashlib
import json
from pathlib import Path
from PIL import Image

source = Path(__file__).resolve().parent
repo = source.parent.parent
selected = source / 'angles-blue/d-frosted/adaptive'
render = selected / 'd-adaptive-1024.png'
blend = selected / 'd-adaptive.blend'
asset = repo / 'packages/ui/src/assets/images/TrackedWalletGlasses.webp'
image = Image.open(render)
assert image.size == (1024,1024) and image.mode == 'RGBA'
# Preserve actual glass transparency; do not flatten over either theme surface.
assert 0 < image.getpixel((650,600))[3] < 255
staging = asset.with_suffix('.webp.tmp')
image.resize((512,512),Image.Resampling.LANCZOS).save(staging,format='WEBP',quality=94,method=6)
staging.replace(asset)
check = Image.open(asset)
assert check.mode == 'RGBA' and check.size == (512,512)
assert 0 < check.getpixel((325,300))[3] < 255
manifest = json.loads((selected/'manifest.json').read_text())
manifest.update({'selectedAngle':'D','blend':str(blend.relative_to(source)),'render':str(render.relative_to(source)),'renderSha256':hashlib.sha256(render.read_bytes()).hexdigest(),'blendSha256':hashlib.sha256(blend.read_bytes()).hexdigest(),'appAsset':str(asset.relative_to(repo)),'appAssetSha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'appAssetBytes':asset.stat().st_size,'appAssetSize':[512,512],'consumer':'apps/main/src/modules/portfolio/tracked/TrackedWallets.tsx','surfaces':['overview','tracked wallets'],'lensSampleRGBA512':check.getpixel((325,300))})
(source/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2))

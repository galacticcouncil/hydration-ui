"""Export the saved Blender renders to the shared Hydration app image paths."""
import hashlib
import json
from pathlib import Path
from PIL import Image

source = Path(__file__).resolve().parent
repo = source.parent.parent
targets = [
    ('review','document-1024.png','Review3D.webp','BankProviderHandoff'),
    ('waiting','hourglass-1024.png','Waiting3D.webp','BankTransferStatusIllustration'),
]
exports = []
for icon,filename,asset,component in targets:
    png = source/filename
    image = Image.open(png)
    assert image.size == (1024,1024) and image.mode == 'RGBA', filename
    image = image.resize((512,512),Image.Resampling.LANCZOS)
    output = repo/'packages/ui/src/assets/images'/asset
    temporary = output.with_suffix('.webp.tmp')
    image.save(temporary,format='WEBP',quality=92,method=6)
    temporary.replace(output)
    check = Image.open(output)
    assert check.size == (512,512) and check.mode == 'RGBA', asset
    exports.append({'icon':icon,'render':filename,'appAsset':str(output.relative_to(repo)),
                    'size':[512,512],'bytes':output.stat().st_size,
                    'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),
                    'sharedComponent':component,'flowVersions':['Current flow','Version 2']})
manifest = {'sourceBlend':'status-icons.blend','exports':exports}
(source/'app-assets.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2))

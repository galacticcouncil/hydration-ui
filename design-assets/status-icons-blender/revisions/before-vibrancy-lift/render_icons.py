"""Render the self-contained status-icons.blend without rebuilding its models."""
import argparse
import json
from pathlib import Path
import sys
import bpy

args = sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
parser = argparse.ArgumentParser()
parser.add_argument('--output')
parser.add_argument('--resolution', type=int, default=1024)
parser.add_argument('--samples', type=int, default=192)
parser.add_argument('--icon', choices=['all','hourglass','document'], default='all')
opts = parser.parse_args(args)
source = Path(bpy.data.filepath)
assert source.name == 'status-icons.blend', 'Open the unified status-icons.blend first.'
out = Path(opts.output).resolve() if opts.output else source.parent
out.mkdir(parents=True,exist_ok=True)
scenes = {'hourglass':bpy.data.scenes['01 - Hourglass'],'document':bpy.data.scenes['02 - Review Document']}
for key,scene in scenes.items():
    scene.render.resolution_x = scene.render.resolution_y = opts.resolution
    scene.cycles.samples = opts.samples
    scene.render.filepath = str(out/f'{key}-{opts.resolution}.png')
    if opts.icon in ('all',key):
        bpy.context.window.scene = scene
        bpy.ops.render.render(write_still=True,scene=scene.name)
bpy.context.window.scene = scenes['document']
bpy.ops.wm.save_as_mainfile(filepath=str(source))
manifest_path = source.parent/'manifest.json'
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
manifest.update({'source':str(source),'resolution':opts.resolution,'samples':opts.samples,
                 'renders':{key:scene.render.filepath for key,scene in scenes.items()}})
manifest_path.write_text(json.dumps(manifest,indent=2))
print('HYDRATION_STATUS_ICONS_RENDERED',json.dumps(manifest),flush=True)

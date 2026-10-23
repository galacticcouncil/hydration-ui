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
parser.add_argument('--saturation', type=float, help='Optional Blender output-grade saturation.')
parser.add_argument('--icon', choices=['all','hourglass','document'], default='all')
opts = parser.parse_args(args)
source = Path(bpy.data.filepath)
assert source.name == 'status-icons.blend', 'Open the unified status-icons.blend first.'
out = Path(opts.output).resolve() if opts.output else source.parent
out.mkdir(parents=True,exist_ok=True)
scenes = {'hourglass':bpy.data.scenes['01 - Hourglass'],'document':bpy.data.scenes['02 - Review Document']}
for key,scene in scenes.items():
    if opts.saturation is not None:
        grade = scene.compositing_node_group.nodes.get('Optional Output Grade')
        assert grade is not None, f'Missing output grade in {scene.name}'
        grade.inputs['Saturation'].default_value = opts.saturation
        grade.label = f'Gentle vibrancy - saturation {opts.saturation:.2f}'
    scene.render.resolution_x = scene.render.resolution_y = opts.resolution
    scene.cycles.samples = opts.samples
    scene.render.filepath = str(out/f'{key}-{opts.resolution}.png')
    if opts.icon in ('all',key):
        bpy.context.window.scene = scene
        bpy.ops.render.render(write_still=True,scene=scene.name)
bpy.context.window.scene = scenes['document']
if opts.saturation is not None:
    notes = bpy.data.texts.get('START HERE - Hydration Status Icons')
    if notes:
        body = '\n'.join(line for line in notes.as_string().splitlines()
                         if not line.startswith('Output vibrancy:'))
        notes.clear()
        notes.write(body.replace('neutral compositor', 'output compositor') +
                    f'\nOutput vibrancy: saturation {opts.saturation:.3f}.\n')
bpy.ops.wm.save_as_mainfile(filepath=str(source))
manifest_path = source.parent/'manifest.json'
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
saturation = scenes['document'].compositing_node_group.nodes['Optional Output Grade'].inputs['Saturation'].default_value
manifest.update({'source':str(source),'resolution':opts.resolution,'samples':opts.samples,
                 'gradeSaturation':round(saturation, 3),
                 'renders':{key:scene.render.filepath for key,scene in scenes.items()}})
manifest_path.write_text(json.dumps(manifest,indent=2))
print('HYDRATION_STATUS_ICONS_RENDERED',json.dumps(manifest),flush=True)

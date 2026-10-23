"""Render the user's saved document source without rebuilding or saving the .blend.

Open an immutable copy of the saved canonical file in an isolated Blender CLI.
Only in-memory output size/quality/path are set; all visual scene data is read as-is.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import sys
import bpy

args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
parser=argparse.ArgumentParser()
parser.add_argument('--output',required=True)
parser.add_argument('--metadata',required=True)
parser.add_argument('--canonical-source',required=True)
parser.add_argument('--expected-source-sha256',required=True)
parser.add_argument('--resolution',type=int,default=1024)
parser.add_argument('--minimum-samples',type=int,default=192)
opts=parser.parse_args(args)
source=Path(bpy.data.filepath).resolve()
source_sha=hashlib.sha256(source.read_bytes()).hexdigest()
assert source_sha==opts.expected_source_sha256,'Frozen input differs from saved user source.'
scene=bpy.data.scenes['02 - Review Document']
bpy.context.window.scene=scene
saved={'engine':scene.render.engine,'resolution':[scene.render.resolution_x,scene.render.resolution_y],
       'resolutionPercentage':scene.render.resolution_percentage,'samples':scene.cycles.samples,
       'imageFormat':scene.render.image_settings.file_format,'imageMode':scene.render.image_settings.color_mode,
       'imageDepth':scene.render.image_settings.color_depth,'filmTransparent':scene.render.film_transparent}
scene.render.resolution_x=scene.render.resolution_y=opts.resolution
scene.render.resolution_percentage=100
scene.cycles.samples=max(opts.minimum_samples,scene.cycles.samples)
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGBA'
scene.render.image_settings.color_depth='16'
scene.render.filepath=str(Path(opts.output).resolve())
metadata={'source':str(Path(opts.canonical_source).resolve()),'sourceSha256':source_sha,
          'frozenInput':str(source),'sourceFileSavedByRender':False,'scene':scene.name,
          'savedSettings':saved,'renderSettings':{'engine':scene.render.engine,'resolution':[scene.render.resolution_x,scene.render.resolution_y],
          'samples':scene.cycles.samples,'format':'PNG','mode':'RGBA','depth':16},
          'camera':scene.camera.name,'cameraMatrix':[list(row) for row in scene.camera.matrix_world],
          'exposure':scene.view_settings.exposure,'viewTransform':scene.view_settings.view_transform,
          'look':scene.view_settings.look,'startedAt':datetime.now(timezone.utc).isoformat(),
          'sceneEdits':'Only in-memory output dimensions, minimum sample count, image format and output path. No geometry, camera, materials, light or grade changes.'}
print('HYDRATION_USER_SAVED_DOCUMENT_RENDER_START',json.dumps(metadata),flush=True)
bpy.ops.render.render(write_still=True,scene=scene.name)
assert hashlib.sha256(source.read_bytes()).hexdigest()==source_sha,'Frozen source changed during rendering.'
metadata['completedAt']=datetime.now(timezone.utc).isoformat()
metadata['render']=scene.render.filepath
metadata['renderSha256']=hashlib.sha256(Path(scene.render.filepath).read_bytes()).hexdigest()
Path(opts.metadata).write_text(json.dumps(metadata,indent=2)+'\n')
print('HYDRATION_USER_SAVED_DOCUMENT_RENDERED',json.dumps(metadata),flush=True)

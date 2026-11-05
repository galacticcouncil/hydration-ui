"""Render both saved variants without modifying the Blender source."""
import hashlib
import json
from pathlib import Path
import bpy
import bmesh

source = Path(bpy.data.filepath).resolve()
source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
folder = Path(__file__).resolve().parent
records = []
for name, output in [
    ('03 - Review Inbox', folder.parent/'inbox-review/review-inbox-1024.png'),
    ('04 - Review Document Clock', folder/'document-clock-1024.png'),
]:
    scene = bpy.data.scenes[name]
    bpy.context.window.scene = scene
    scene.render.resolution_x = scene.render.resolution_y = 1024
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.color_depth = '16'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 128
    scene.render.filepath = str(output)
    bpy.ops.render.render(write_still=True, scene=name)
    geometry = []
    if name.startswith('04'):
        for obj in scene.objects:
            if obj.type == 'MESH' and obj.name.startswith('Clock -'):
                bm = bmesh.new()
                bm.from_mesh(obj.data)
                geometry.append({'object':obj.name,'vertices':len(bm.verts),
                                 'nonManifoldEdges':sum(not edge.is_manifold for edge in bm.edges)})
                bm.free()
    records.append({'scene':name,'render':str(output),'resolution':[1024,1024],
                    'samples':128,'engine':scene.render.engine,
                    'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),
                    'clockGeometry':geometry})
    print('VARIANT_RENDERED',name,str(output),flush=True)
assert hashlib.sha256(source.read_bytes()).hexdigest() == source_hash
report = {'source':str(source),'sourceSha256':source_hash,'sourceUnchangedByRender':True,
          'renders':records}
(folder/'render-provenance.json').write_text(json.dumps(report,indent=2)+'\n')
print('VARIANTS_RENDERED',json.dumps(report),flush=True)

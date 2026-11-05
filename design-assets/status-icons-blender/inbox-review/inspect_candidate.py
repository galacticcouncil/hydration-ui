"""Read-only geometry/source checks for the saved inbox candidate."""
import bpy, json
from pathlib import Path
s=bpy.data.scenes['03 - Review Inbox']
assert s.camera and s.camera.name=='CAMERA - Review Inbox'
tray=bpy.data.objects['Tray - Continuous rounded hollow shell with U-notch']
counts={}
for p in tray.data.polygons:
    for e in p.edge_keys:
        key=tuple(sorted(e));counts[key]=counts.get(key,0)+1
report={
 'scene':s.name,'objects':len(s.objects),'modelMeshes':[o.name for o in s.objects if o.type=='MESH'],
 'trayVertices':len(tray.data.vertices),'trayFaces':len(tray.data.polygons),
 'trayNonManifoldEdges':sum(n!=2 for n in counts.values()),
 'nativeMaterials':[{ 'name':n,'roughness':bpy.data.materials[n].node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value } for n in ['PALETTE - Native Royal Blue','PALETTE - Native Orchid Violet','PALETTE - Pale Ivory Mint']],
 'transparent':s.render.film_transparent,
 'sourceSHA256':s['Source studio SHA256'],
 'packedReference':any(i.packed_file and 'reference-selected' in i.name for i in bpy.data.images),
 'resolution':[s.render.resolution_x,s.render.resolution_y], 'samples':s.cycles.samples,
}
assert report['trayNonManifoldEdges']==0
assert report['packedReference']
Path(__file__).with_name('geometry-check.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))

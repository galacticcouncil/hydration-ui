"""Match the document magnifier to Hydration's native Design Library search shape.

Run in an isolated background Blender process after opening status-icons.blend.
The page, text, composition, shared palette, lighting, grade and hourglass are untouched.
Only the lens receives a dedicated copied optical glass material.
The slim rim, tapered round handle and shallow glass are separate editable meshes.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys
import bpy
from mathutils import Matrix, Vector

REFERENCE_NAME = 'Design-Library-Search-3D.png'
SOURCE_URL = 'https://www.figma.com/design/wN5pnsm2FPVoCrxFNEAlYl/Design-Library?node-id=442-28153'
SHAPE = {
    'reference': SOURCE_URL,
    'rim': 'Circular tubular torus, no flat annulus face or bevel modifier',
    'outerRadius': .72,
    'innerRadius': .51,
    'tubeRadius': .105,
    'handle': 'Round lathed handle, gently wider toward hemispherical end',
    'handleRootRadius': .10,
    'handleEndRadius': .15,
    'handleReach': 1.35,
    'lens': 'True biconvex optical glass, spherical faces, visible text refraction',
    'lensMaterial': {'baseColor': '#D6E8FF', 'transmission': 1.0, 'roughness': .08, 'IOR': 1.50, 'absorptionDensity': .20},
    'lensDepth': .22,
    'center': [.17,-.52,1.46],
    'pageAndStudioPreserved': True,
}

def mesh_object(name, vertices, faces, collection, material, parent):
    mesh = bpy.data.meshes.new(name + ' Geometry')
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    obj.data.materials.append(material)
    for face in mesh.polygons:
        face.use_smooth = True
    obj.parent = parent
    obj.matrix_world = Matrix.Identity(4)
    return obj


def page_signature(collection):
    payload = []
    for obj in sorted(collection.all_objects, key=lambda o: o.name):
        if obj.type != 'MESH' or obj.name.startswith('Magnifier - '):
            continue
        payload.append({
            'name': obj.name,
            'matrix': [list(row) for row in obj.matrix_world],
            'vertices': [list(v.co) for v in obj.data.vertices],
            'faces': [list(p.vertices) for p in obj.data.polygons],
            'materials': [m.name for m in obj.data.materials],
        })
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()


def refine_magnifier(scene=None, reference_path=None):
    scene = scene or bpy.data.scenes['02 - Review Document']
    collection = bpy.data.collections['ICON - Review Document']
    untouched = page_signature(collection)
    parent = next(o for o in collection.all_objects if o.name.startswith('Document and Magnifier'))
    old = [o for o in collection.all_objects if o.name.startswith('Magnifier - ')]
    assert len(old) == 3, [o.name for o in old]
    violet = next(o.data.materials[0] for o in old if 'Ring' in o.name)
    glass = next(o.data.materials[0] for o in old if 'Glass Lens' in o.name)
    # A dedicated physical optical glass preserves every existing material,
    # including the hourglass. Its curved faces refract the page and text rather
    # than simulate glass with a dark opaque fill.
    if glass.name != 'PALETTE - Search Lens Optical Glass':
        glass = glass.copy()
        glass.name = 'PALETTE - Search Lens Optical Glass'
    shader = glass.node_tree.nodes.get('Principled BSDF')
    def rgba(hexcolor):
        channels = [int(hexcolor[i:i+2],16)/255 for i in (0,2,4)]
        return tuple(v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in channels)+(1,)
    shader.inputs['Base Color'].default_value = rgba('D6E8FF')
    shader.inputs['Transmission Weight'].default_value = 1.0
    shader.inputs['Roughness'].default_value = .08
    shader.inputs['IOR'].default_value = 1.50
    shader.inputs['Specular IOR Level'].default_value = .50
    absorption = next(node for node in glass.node_tree.nodes if node.bl_idname=='ShaderNodeVolumeAbsorption')
    absorption.inputs['Color'].default_value = rgba('4875AA')
    absorption.inputs['Density'].default_value = .20
    for obj in old:
        mesh = obj.data
        bpy.data.objects.remove(obj, do_unlink=True)
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)

    cx, cy, cz = .17, -.52, 1.46
    # Circular tube cross section gives the native search rim a continuous soft
    # highlight instead of a large flat face bounded by bevels.
    major, minor, around, cross = .615, .105, 160, 32
    vertices, faces = [], []
    for i in range(around):
        angle = 2*math.pi*i/around
        for j in range(cross):
            phi = 2*math.pi*j/cross
            r = major + minor*math.cos(phi)
            vertices.append((cx+r*math.cos(angle), cy+minor*math.sin(phi), cz+r*math.sin(angle)))
    for i in range(around):
        for j in range(cross):
            a, b = i*cross+j, i*cross+(j+1)%cross
            c, d = ((i+1)%around)*cross+j, ((i+1)%around)*cross+(j+1)%cross
            faces.append((a,b,d,c))
    ring = mesh_object('Magnifier - Tubular Lavender Ring', vertices, faces, collection, violet, parent)
    ring['Shape reference'] = SOURCE_URL
    ring['Geometry'] = 'True circular tubular cross-section, outer .72, inner .51; .105 tube radius, no bevel.'

    # True biconvex lens: two spherical optical faces, .22 total central
    # thickness and .034 edge thickness. At this IOR and .4 page spacing the
    # surface magnifies/distorts the lower text end. Moving only the magnifier
    # up/left keeps its entire glass over the blue sheet, avoiding a background
    # edge split while preserving actual transmission.
    radius, center_half_depth, edge_half_depth = .515, .11, .017
    sag = center_half_depth-edge_half_depth
    curvature_radius = (radius*radius+sag*sag)/(2*sag)
    radii = [radius*j/32 for j in range(1,33)]
    def front_y(rad):
        return -center_half_depth+curvature_radius-math.sqrt(curvature_radius**2-rad**2)
    profile = [(front_y(rad),rad) for rad in radii]
    profile += [(0,.52)]
    profile += [(-front_y(rad),rad) for rad in reversed(radii)]
    count = 160
    vertices = [(cx,cy-center_half_depth,cz)]
    for y, radius in profile:
        vertices.extend((cx+radius*math.cos(2*math.pi*k/count),cy+y,cz+radius*math.sin(2*math.pi*k/count)) for k in range(count))
    tip = len(vertices)
    vertices.append((cx,cy+center_half_depth,cz))
    faces = []
    for k in range(count):
        n = (k+1)%count
        faces.append((0,1+k,1+n))
    for i in range(len(profile)-1):
        for k in range(count):
            n = (k+1)%count
            a,b = 1+i*count,1+(i+1)*count
            faces.append((a+k,b+k,b+n,a+n))
    last = 1+(len(profile)-1)*count
    for k in range(count):
        faces.append((last+k,tip,last+(k+1)%count))
    lens = mesh_object('Magnifier - Smoky Inset Glass Lens', vertices, faces, collection, glass, parent)
    lens['Geometry'] = 'Closed biconvex spherical lens; .22 central depth, .034 edge; physical IOR 1.50.'

    # The library handle is circular and slightly tapered. Start under the rim,
    # widen gently into the grip and finish with a real rounded hemisphere.
    direction = Vector((math.sqrt(.5),0,-math.sqrt(.5)))
    side = Vector((math.sqrt(.5),0,math.sqrt(.5)))
    forward = Vector((0,-1,0))
    center = Vector((cx,cy,cz))
    handle_profile = [(.61,.075),(.65,.097),(.72,.105),(.84,.114),(.96,.123),(1.08,.14),(1.20,.15)]
    for j in range(1,16):
        angle = math.pi*j/32
        handle_profile.append((1.20+.15*math.sin(angle),.15*math.cos(angle)))
    count = 64
    vertices = [tuple(center+direction*.58)]
    for reach, radius in handle_profile:
        for k in range(count):
            angle = 2*math.pi*k/count
            vertices.append(tuple(center+direction*reach+side*(radius*math.cos(angle))+forward*(radius*math.sin(angle))))
    tip = len(vertices)
    vertices.append(tuple(center+direction*1.35))
    faces = []
    for k in range(count):
        faces.append((0,1+(k+1)%count,1+k))
    for i in range(len(handle_profile)-1):
        a,b = 1+i*count,1+(i+1)*count
        for k in range(count):
            n=(k+1)%count
            faces.append((a+k,a+n,b+n,b+k))
    last=1+(len(handle_profile)-1)*count
    for k in range(count):
        faces.append((last+k,last+(k+1)%count,tip))
    handle = mesh_object('Magnifier - Tapered Round Lavender Handle', vertices, faces, collection, violet, parent)
    handle['Geometry'] = 'Circular grip, root radius .10 to .15, hemispherical end; no bevel.'
    # Recalculate robust outward normals on all new closed shapes.
    import bmesh
    for obj in (ring,lens,handle):
        bm=bmesh.new()
        bm.from_mesh(obj.data)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        assert all(len(edge.link_faces)==2 for edge in bm.edges), 'Closed manifold mesh required'
        assert bm.calc_volume(signed=True) > 0, 'Outward normals required'
        bm.to_mesh(obj.data)
        bm.free()
        obj.data.update()
    bpy.context.view_layer.update()
    assert page_signature(collection) == untouched, 'Document geometry or placement changed.'

    ref = Path(reference_path) if reference_path else Path(__file__).with_name('references')/REFERENCE_NAME
    if ref.exists():
        refs = bpy.data.collections.get('REFERENCE - Packed Native Artwork')
        image = bpy.data.images.load(str(ref), check_existing=True)
        image.name = 'NATIVE REFERENCE - Design Library Search 3D'
        image.pack()
        obj = bpy.data.objects.get('REFERENCE - Design Library Search 3D')
        if not obj:
            obj = bpy.data.objects.new('REFERENCE - Design Library Search 3D', None)
            refs.objects.link(obj)
        obj.empty_display_type = 'IMAGE'
        obj.data = image
        obj.empty_display_size = 1.2
        obj.location = (7.7,0,1.55)
        obj.rotation_euler = (math.pi/2,0,0)
        obj.hide_render = True
        obj['Figma source'] = SOURCE_URL
    scene['Magnifier shape'] = json.dumps(SHAPE)
    notes = bpy.data.texts.get('START HERE - Hydration Status Icons')
    if notes:
        body = '\n'.join(line for line in notes.as_string().splitlines() if not line.startswith('Magnifier:'))
        notes.clear()
        notes.write(body+'\nMagnifier: native library search shape; thicker circular tube rim, tapered round grip, true refracting biconvex lens. Reference packed off camera.\n')
    return dict(SHAPE)


def main():
    args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    parser=argparse.ArgumentParser()
    parser.add_argument('--save', help='Optional explicit path for the refined editable Blender source.')
    parser.add_argument('--render', help='Optional transparent PNG render path.')
    parser.add_argument('--resolution', type=int, default=1024)
    parser.add_argument('--samples', type=int, default=192)
    opts=parser.parse_args(args)
    scene=bpy.data.scenes['02 - Review Document']
    bpy.context.window.scene=scene
    metadata=refine_magnifier(scene)
    if opts.render:
        scene.render.resolution_x=scene.render.resolution_y=opts.resolution
        scene.cycles.samples=opts.samples
        scene.render.filepath=str(Path(opts.render).resolve())
        bpy.ops.render.render(write_still=True,scene=scene.name)
    if opts.save:
        destination=Path(opts.save).resolve()
        bpy.ops.wm.save_as_mainfile(filepath=str(destination))
        manifest_path=destination.parent/'manifest.json'
        if manifest_path.exists():
            manifest=json.loads(manifest_path.read_text())
            manifest['magnifier']=metadata
            packed=manifest.setdefault('packedReferences',[])
            if REFERENCE_NAME not in packed:
                packed.append(REFERENCE_NAME)
            manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
    print('HYDRATION_MAGNIFIER_REFINED',json.dumps(metadata),flush=True)

if __name__ == '__main__':
    main()

"""Create four camera choices in a separate blue glasses study; keep UI asset unchanged."""
import json
import math
from pathlib import Path
import bpy
import bmesh
from mathutils import Vector,Quaternion

source=Path(bpy.data.filepath).resolve()
out=source.parent/'angles-blue'
out.mkdir(exist_ok=True)
scene=bpy.data.scenes['Tracked Wallets - Glasses']
bpy.context.window.scene=scene
blue=bpy.data.materials['PALETTE - Native Royal Blue']
for obj in scene.objects:
    if obj.name.startswith(('Frame -','Temple -','Hinge -')):
        obj.data.materials.clear()
        obj.data.materials.append(blue)

# Clean physical glass, independent from the document lens's absorption settings.
glass=bpy.data.materials.new('GLASSES - Clear Ice Blue Optical Glass')
glass.use_nodes=True
nodes=glass.node_tree.nodes
shader=nodes.get('Principled BSDF')
shader.inputs['Base Color'].default_value=(.64,.82,1.0,1)
shader.inputs['Roughness'].default_value=.14
shader.inputs['Transmission Weight'].default_value=1.0
shader.inputs['IOR'].default_value=1.45
shader.inputs['Specular IOR Level'].default_value=.5
absorb=nodes.new('ShaderNodeVolumeAbsorption')
absorb.inputs['Color'].default_value=(.4,.65,1,1)
absorb.inputs['Density'].default_value=.06
glass.node_tree.links.new(absorb.outputs['Volume'],nodes.get('Material Output').inputs['Volume'])
for obj in scene.objects:
    if obj.name.startswith('Lens -'):
        obj.data.materials.clear()
        obj.data.materials.append(glass)
        # Spherical optical caps with a finite edge, rather than an ellipsoid.
        radius,edge,sag=.525,.032,.065
        curvature=(radius*radius+sag*sag)/(2*sag)
        segments,rings=96,32
        vertices=[];faces=[];sides=[]
        for sign in [-1,1]:
            center=len(vertices)
            vertices.append((0,sign*(edge/2+sag),0))
            side=[]
            for j in range(1,rings+1):
                r=radius*j/rings
                depth=edge/2+math.sqrt(curvature*curvature-r*r)-math.sqrt(curvature*curvature-radius*radius)
                ring=[]
                for k in range(segments):
                    angle=2*math.pi*k/segments
                    ring.append(len(vertices))
                    vertices.append((r*math.cos(angle),sign*depth,r*math.sin(angle)))
                side.append(ring)
                if j==1:
                    for k in range(segments): faces.append((center,ring[k],ring[(k+1)%segments]))
                else:
                    previous=side[-2]
                    for k in range(segments):
                        n=(k+1)%segments
                        faces.append((previous[k],ring[k],ring[n],previous[n]))
            sides.append(side[-1])
        for k in range(segments):
            n=(k+1)%segments
            faces.append((sides[0][k],sides[0][n],sides[1][n],sides[1][k]))
        mesh=bpy.data.meshes.new(obj.name+' - Biconvex Optical Caps')
        mesh.from_pydata(vertices,[],faces);mesh.update()
        bm=bmesh.new();bm.from_mesh(mesh)
        bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
        bm.to_mesh(mesh);bm.free()
        obj.data=mesh;obj.scale=(1,1,1)
        obj.data.materials.append(glass)
        for polygon in mesh.polygons: polygon.use_smooth=True

# A long, straight temple span with a small bend at the ear and rounded tips.
model=bpy.data.collections['ICON - Round Tracked Wallet Glasses']
for sign,side in [(-1,'Left'),(1,'Right')]:
    obj=bpy.data.objects['Temple - '+side+' Rounded Blue Arm']
    coords=[(sign*1.31,.015,1.65),(sign*1.29,.35,1.75),(sign*1.25,1.02,1.95),(sign*1.16,1.23,1.91),(sign*1.10,1.27,1.77)]
    points=obj.data.splines[0].bezier_points
    for point,co in zip(points,coords):
        point.co=co
        point.handle_left_type=point.handle_right_type='AUTO'
    for index in [0,1]:
        points[index].handle_right_type='FREE'
        points[index].handle_right=Vector(coords[index])+(Vector(coords[index+1])-Vector(coords[index]))/3
        points[index+1].handle_left_type='FREE'
        points[index+1].handle_left=Vector(coords[index+1])-(Vector(coords[index+1])-Vector(coords[index]))/3
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=24,radius=.082,location=coords[-1])
    tip=bpy.context.object;tip.name='Temple - '+side+' Hemispherical Round Tip'
    for collection in list(tip.users_collection): collection.objects.unlink(tip)
    model.objects.link(tip);tip.data.materials.append(blue)
    for polygon in tip.data.polygons: polygon.use_smooth=True

# A gentle strip softbox gives the convex glass a real highlight in addition to
# the native broad satin key/fill lights. It is not painted into the lens.
light_data=bpy.data.lights.new('LIGHT - Optical Glass Strip Softbox','AREA')
light_data.energy=75
light_data.shape='RECTANGLE'
light_data.size=2.3
light_data.size_y=.38
light=bpy.data.objects.new(light_data.name,light_data)
scene.collection.objects.link(light)
light.location=(-2.0,-4.0,3.4)
light.rotation_euler=(Vector((0,0,1.5))-light.location).to_track_quat('-Z','Y').to_euler()

# Store all four real cameras so each angle can be reopened and refined.
choices=[
 ('A','Front',(0,-8.8,2.45),(0,.32,1.52),0,3.60),
 ('B','Three-quarter left',(-4.6,-7.8,3.15),(0,.32,1.52),-6,3.60),
 ('C','From above',(-3.2,-6.8,5.5),(0,.32,1.52),-5,3.60),
 ('D','Three-quarter right',(4.6,-7.8,2.6),(0,.32,1.52),6,3.60),
]
scene.render.resolution_x=scene.render.resolution_y=768
scene.render.resolution_percentage=100
scene.cycles.samples=192
scene.render.image_settings.color_depth='16'
scene.cycles.device='CPU'
records=[]
for label,title,location,target,roll,scale in choices:
    data=bpy.data.cameras.new('CAMERA '+label+' - '+title)
    camera=bpy.data.objects.new(data.name,data)
    scene.collection.objects.link(camera)
    camera.location=location
    camera.rotation_mode='QUATERNION'
    camera.rotation_quaternion=(Vector(target)-camera.location).to_track_quat('-Z','Y') @ Quaternion((0,0,1),math.radians(roll))
    data.type='ORTHO'
    data.ortho_scale=scale
    records.append({'id':label,'name':title,'camera':camera.name,'location':location,'file':label.lower()+'.png'})
# Keep the study independently editable and show camera B when opened.
scene.camera=bpy.data.objects[records[1]['camera']]
scene['Study']='Entirely blue frames, clear ice blue convex glass, four selectable camera angles.'
scene['Lenses']='Real physical transmission, IOR1.45, .162-unit central thickness, .032 edge, roughness .14, strip softbox reflection.'
bpy.ops.wm.save_as_mainfile(filepath=str(out/'blue-glasses-angles.blend'))
for record in records:
    scene.camera=bpy.data.objects[record['camera']]
    scene.render.filepath=str(out/record['file'])
    bpy.ops.render.render(write_still=True,scene=scene.name)
    print('ANGLE_RENDERED',record['id'],scene.render.filepath,flush=True)
(out/'angles.json').write_text(json.dumps({'source':str(source),'study':'blue-glasses-angles.blend','frames':'Native Royal Blue','lenses':'Clear ice-blue physical convex glass','samples':scene.cycles.samples,'resolution':768,'angles':records},indent=2)+'\n')

import bpy,math,os,bmesh
root=os.path.dirname(os.path.abspath(__file__))
scenes=[('06 - Business - Beach Kiosk','kiosk'),('07 - Individual - Beach Chair','chair')]
for name,stem in scenes:
 s=bpy.data.scenes[name]
 for o in s.objects:
  if o.type!='MESH':continue
  if any(m.type=='BEVEL' for m in o.modifiers):
   for p in o.data.polygons:p.use_smooth=True
   o.data.set_sharp_from_angle(angle=math.radians(40))
   for m in o.modifiers:
    if m.type=='BEVEL':m.harden_normals=True;m.segments=max(m.segments,6)
    elif m.type=='WEIGHTED_NORMAL':m.keep_sharp=True;m.weight=50
  if o.name.startswith('Canvas / Continuous'):
   bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.reverse_faces(bm,faces=list(bm.faces));bm.to_mesh(o.data);bm.free()
 s.render.resolution_percentage=50;s.cycles.samples=64
 s.render.filepath=os.path.join(root,stem+'-normals.png')
bpy.context.window.scene=bpy.data.scenes[scenes[0][0]]
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(root,'account-icons-shading.blend'))
for name,stem in scenes:bpy.ops.render.render(write_still=True,scene=name)
print('NORMALS_DONE')

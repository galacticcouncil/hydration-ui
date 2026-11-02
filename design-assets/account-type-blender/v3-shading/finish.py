import bpy,os
root=os.path.dirname(os.path.abspath(__file__))
scenes=[('06 - Business - Beach Kiosk','kiosk'),('07 - Individual - Beach Chair','chair')]
for name,stem in scenes:
 s=bpy.data.scenes[name]
 for o in s.objects:
  if o.type!='MESH':continue
  if o.name.startswith('Canvas / Continuous'):
   for m in o.modifiers:
    if m.type=='SOLIDIFY':m.offset=1
  if o.name.startswith('Frame /'):
   for m in o.modifiers:
    if m.type=='BEVEL' and 'Satin' in m.name:m.width=.042;m.segments=8
# The only shared edited materials belong to these two new icon scenes.
blue=bpy.data.materials['ACCOUNT V2 - Royal blue satin'].node_tree.nodes.get('Principled BSDF')
blue.inputs['Roughness'].default_value=.34;blue.inputs['Specular IOR Level'].default_value=.4
for name in ['ACCOUNT V2 - Lilac canvas','ACCOUNT - Ivory canvas']:
 mat=bpy.data.materials[name];p=mat.node_tree.nodes.get('Principled BSDF')
 p.inputs['Roughness'].default_value=.64;p.inputs['Sheen Weight'].default_value=.12
 p.inputs['Specular IOR Level'].default_value=.28
for name,stem in scenes:
 s=bpy.data.scenes[name];s.render.filepath=os.path.join(root,stem+'-satin.png')
 bpy.ops.render.render(write_still=True,scene=name)
bpy.context.window.scene=bpy.data.scenes[scenes[0][0]]
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(root,'account-icons-shading.blend'))
print('SATIN_DONE')

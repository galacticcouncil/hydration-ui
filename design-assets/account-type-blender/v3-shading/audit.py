import bpy,json,math
out={}
for s in bpy.data.scenes:
 if not s.name.startswith(('06','07')):continue
 bpy.context.window.scene=s
 info={'objects':[],'materials':{},'lights':[],'color':{'view':s.view_settings.view_transform,'look':s.view_settings.look,'exposure':s.view_settings.exposure}}
 for o in s.objects:
  if o.type=='LIGHT':info['lights'].append({'name':o.name,'pos':list(o.location),'rotation':list(o.rotation_euler),'power':o.data.energy,'size':getattr(o.data,'size',None)})
  if o.type!='MESH':continue
  info['objects'].append({'name':o.name,'faces':len(o.data.polygons),'smooth':sum(p.use_smooth for p in o.data.polygons),'modifiers':[(m.type,m.name) for m in o.modifiers],'scale':list(o.scale)})
  for m in o.data.materials:
   if m.name in info['materials']:continue
   p=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
   info['materials'][m.name]={k:(list(p.inputs[k].default_value) if hasattr(p.inputs[k].default_value,'__len__') else p.inputs[k].default_value) for k in ['Base Color','Roughness','Specular IOR Level','Coat Weight','Sheen Weight','Metallic']}
   info['materials'][m.name]['links']=[(l.from_node.name,l.from_socket.name,l.to_node.name,l.to_socket.name) for l in m.node_tree.links]
 out[s.name]=info
print(json.dumps(out,indent=2))
print('SHARP_API',hasattr(bpy.data.meshes[0],'set_sharp_from_angle'))

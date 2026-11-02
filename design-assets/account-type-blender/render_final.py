import bpy, os
root=os.path.dirname(os.path.abspath(__file__))
scenes=[('06 - Business - Beach Kiosk','business-kiosk',4.1),('07 - Individual - Beach Chair','individual-beach-chair',3.5)]
print('SCENES',[(s.name,len(s.objects)) for s in bpy.data.scenes])
for name,stem,scale in scenes:
 s=bpy.data.scenes[name]
 s.camera.data.ortho_scale=scale
 s.render.resolution_percentage=100
 s.cycles.samples=256
 s.render.filepath=os.path.join(root,stem+'.png')
 s.render.image_settings.file_format='PNG'
 s.render.image_settings.color_mode='RGBA'
 s.render.image_settings.color_depth='16'
 s.render.film_transparent=True
bpy.context.window.scene=bpy.data.scenes[scenes[0][0]]
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(root,'account-type-icons.blend'))
for name,stem,scale in scenes:
 bpy.context.window.scene=bpy.data.scenes[name]
 bpy.ops.render.render(write_still=True,scene=name)
print('FINAL_ACCOUNT_ICONS_DONE')

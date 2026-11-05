import bpy,os
root=os.path.dirname(os.path.abspath(__file__))
models=[('06 - Business - Beach Kiosk','kiosk'),('07 - Individual - Beach Chair','chair')]
for name,stem in models:
 s=bpy.data.scenes[name];s.render.resolution_percentage=100;s.cycles.samples=256
 s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.render.image_settings.color_depth='16'
 s.render.film_transparent=True;s.render.filepath=os.path.join(root,stem+'-final.png')
bpy.context.window.scene=bpy.data.scenes[models[0][0]]
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(root,'account-icons-shading.blend'))
for name,stem in models:bpy.ops.render.render(write_still=True,scene=name)
print('SHADING_FINAL_DONE')

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parent
icons=[]
for name in ['kiosk','chair']:
 im=Image.open(root/(name+'-final.png')).convert('RGBA');bbox=im.getchannel('A').getbbox()
 assert im.size==(1024,1024),im.size
 assert bbox and min(bbox[:2])>10 and max(bbox[2:])<1014,bbox
 print(name,im.size,bbox)
 im.resize((512,512),Image.Resampling.LANCZOS).save(root/(name+'.webp'),quality=94,method=6)
 icons.append(im)
can=Image.new('RGB',(1000,540),'#0D1525');d=ImageDraw.Draw(can);d.rectangle((500,0,999,539),fill='#F2F3F5');f=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',19)
for x,col in [(0,'white'),(500,'#17243A')]:
 for row,(im,name) in enumerate(zip(icons,['Business','Individual'])):
  y=row*270;d.text((x+20,y+15),name,fill=col,font=f)
  for size,xx,yy in [(210,20,48),(96,280,70),(48,400,95)]:
   tile=im.resize((size,size),Image.Resampling.LANCZOS);can.paste(tile,(x+xx,y+yy),tile)
can.save(root/'size-review.png')
can=Image.new('RGB',(1200,840),'#0D1525');d=ImageDraw.Draw(can)
for row,stem in enumerate(['kiosk','chair']):
 for col,v in enumerate(['front','side','rear']):
  im=Image.open(root/(stem+'-'+v+'.png')).convert('RGBA');im.thumbnail((390,390));can.paste(im,(col*400,row*420+30),im);d.text((col*400+20,row*420+10),stem+' / '+v,fill='white',font=f)
can.save(root/'construction-views.png')

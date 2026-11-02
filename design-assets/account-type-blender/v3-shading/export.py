from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
root=Path(__file__).resolve().parent
can=Image.new('RGB',(1000,560),'#0D1525');d=ImageDraw.Draw(can);d.rectangle((500,0,999,559),fill='#F2F3F5');f=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',18)
for row,name in enumerate(['kiosk','chair']):
 im=Image.open(root/(name+'-final.png')).convert('RGBA');box=im.getchannel('A').getbbox()
 assert im.size==(1024,1024) and box and min(box[:2])>10 and max(box[2:])<1014,(im.size,box)
 print(name,im.size,box)
 im.resize((512,512),Image.Resampling.LANCZOS).save(root/(name+'.webp'),quality=94,method=6)
 for x,color in [(0,'white'),(500,'#17243A')]:
  d.text((x+20,row*280+14),name.title(),fill=color,font=f)
  for size,xx,yy in [(225,15,42),(96,285,75),(48,410,96)]:
   tile=im.resize((size,size),Image.Resampling.LANCZOS);can.paste(tile,(x+xx,row*280+yy),tile)
can.save(root/'size-review.png')

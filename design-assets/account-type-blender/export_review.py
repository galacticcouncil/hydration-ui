from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parent
icons=[]
for name in ['business-kiosk','individual-beach-chair']:
 im=Image.open(root/(name+'.png')).convert('RGBA')
 assert im.size==(1024,1024), im.size
 bbox=im.getchannel('A').getbbox()
 assert bbox and min(bbox[:2])>15 and max(bbox[2:])<1009, bbox
 print(name, im.size, 'alpha bounds',bbox)
 im.resize((512,512),Image.Resampling.LANCZOS).save(root/(name+'.webp'),quality=94,method=6)
 icons.append(im)
review=Image.new('RGB',(1000,760),'#0D1525')
d=ImageDraw.Draw(review)
font=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',24)
small=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',17)
d.rectangle((500,0,999,759),fill='#F2F3F5')
for ox,color in [(0,'#E5E9F0'),(500,'#192336')]:
 for j,(im,label) in enumerate(zip(icons,['Business · beach kiosk','Individual · beach chair'])):
  y=18+j*370
  d.text((ox+24,y),label,fill=color,font=font)
  tile=im.resize((295,295),Image.Resampling.LANCZOS)
  review.paste(tile,(ox+18,y+44),tile)
  for size,sy in [(96,y+87),(48,y+235)]:
   tile=im.resize((size,size),Image.Resampling.LANCZOS)
   review.paste(tile,(ox+350+(96-size)//2,sy),tile)
   d.text((ox+365,sy+size+8),str(size)+'px',fill=color,font=small)
review.save(root/'review.png')

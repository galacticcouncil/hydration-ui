from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import sys
root=Path(__file__).resolve().parent
stage=sys.argv[1] if len(sys.argv)>1 else 'pass1'
ref=Image.open(root/'references/selected-concepts.png').convert('RGB')
crops=[ref.crop((138,446,423,764)),ref.crop((1346,122,1619,420))]
can=Image.new('RGB',(1100,780),'#0D1728');d=ImageDraw.Draw(can)
f=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',21)
for row,(name,crop) in enumerate(zip(['kiosk','chair'],crops)):
 y=row*390
 d.text((40,y+12),'Selected concept',font=f,fill='white')
 d.text((405,y+12),'Blender '+stage,font=f,fill='white')
 d.text((785,y+12),'96px check',font=f,fill='white')
 scale=min(310/crop.width,320/crop.height);crop=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.LANCZOS);can.paste(crop,(40,y+48))
 im=Image.open(root/(name+'-'+stage+'.png')).convert('RGBA');im=im.crop(im.getchannel('A').getbbox());im.thumbnail((310,320),Image.Resampling.LANCZOS)
 can.paste(im,(410,y+48),im)
 im.thumbnail((96,96),Image.Resampling.LANCZOS);can.paste(im,(800,y+110),im)
can.save(root/'comparisons'/('comparison-'+stage+'.png'))

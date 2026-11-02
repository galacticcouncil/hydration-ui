from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import sys
root=Path(__file__).resolve().parent;stage=sys.argv[1] if len(sys.argv)>1 else 'normals'
can=Image.new('RGB',(1200,850),'#0D1525');d=ImageDraw.Draw(can);f=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',22)
ref=Image.open(root.parent/'v2/references/selected-concepts.png').convert('RGB')
for row,(stem,box) in enumerate([('kiosk',(138,446,423,764)),('chair',(1346,122,1619,420))]):
 for col,(label,p) in enumerate([('Selected concept',None),('Before',root.parent/'v2'/(stem+'-final.png')),('Shading / '+stage,root/(stem+'-'+stage+'.png'))]):
  if p:
   im=Image.open(p).convert('RGBA');im=im.crop(im.getchannel('A').getbbox())
  else:im=ref.crop(box).convert('RGBA')
  scale=min(350/im.width,350/im.height);im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.LANCZOS)
  x=col*400+20;y=row*425;d.text((x,y+14),label,fill='white',font=f);can.paste(im,(x+(350-im.width)//2,y+60),im)
can.save(root/('comparison-'+stage+'.png'))

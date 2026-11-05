"""Package camera choices as a comparison sheet and lightweight public preview."""
import hashlib
import json
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

root=Path(__file__).resolve().parent
source=root/'angles-blue'
public=root.parent.parent/'apps/main/public/static/previews/tracked-wallet-glasses'
public.mkdir(parents=True,exist_ok=True)
font='/System/Library/Fonts/Supplemental/Arial.ttf'
heading=ImageFont.truetype(font,32)
label=ImageFont.truetype(font,24)
small=ImageFont.truetype(font,19)
sheet=Image.new('RGB',(1120,1140),'#060b17')
draw=ImageDraw.Draw(sheet)
draw.text((32,24),'Blue glasses · Pick a viewing angle',fill='#f7f8fc',font=heading)
draw.text((32,72),'Rougher optical glass · Straighter arms · Rounded tips',fill='#acb6c8',font=small)
records=[]
for i,(key,title) in enumerate([('A','Front'),('B','Three-quarter left'),('C','From above'),('D','Three-quarter right')]):
    path=source/(key.lower()+'.png')
    im=Image.open(path).convert('RGBA')
    assert im.size==(768,768)
    app=public/(key.lower()+'.webp')
    im.save(app,format='WEBP',quality=94,method=6)
    x=24+(i%2)*552;y=116+(i//2)*504
    draw.rounded_rectangle((x,y,x+520,y+480),radius=20,fill='#0d1524',outline='#293342',width=1)
    thumbnail=im.resize((460,460),Image.Resampling.LANCZOS)
    sheet.paste(thumbnail,(x+30,y-6),thumbnail)
    draw.ellipse((x+20,y+425,x+54,y+459),fill='#b4d7fa')
    draw.text((x+29,y+429),key,fill='#0c1728',font=small)
    draw.text((x+68,y+429),title,fill='#f7f8fc',font=label)
    records.append({'id':key,'title':title,'renderSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'preview':str(app.relative_to(root.parent.parent))})
sheet.save(source/'comparison.png')
sheet.save(public/'comparison.png')
metadata=json.loads((source/'angles.json').read_text())
metadata['glassRoughness']=.14
metadata['lensCenterThickness']=.162
metadata['lensEdgeThickness']=.032
metadata['armShape']='Straight main span with short curved end and hemispherical rounded tip'
metadata['exports']=records
(source/'angles.json').write_text(json.dumps(metadata,indent=2)+'\n')
print(json.dumps({'gallery':str(public/'index.htm'),'comparison':str(source/'comparison.png'),'angles':records},indent=2))

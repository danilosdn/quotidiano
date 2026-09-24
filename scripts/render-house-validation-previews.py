#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/_validation'
DATA=json.loads((OUT/'house-definition.json').read_text())
ASSET_ROOT=ROOT/'public/assets/runtime'

try:
    FONT=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',12)
    FONT_B=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',13)
    FONT_S=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',10)
except OSError:
    FONT=FONT_B=FONT_S=ImageFont.load_default()

asset_path={entry['key']:ROOT/'public'/entry['path'].lstrip('/') for kind in ('images','sprites') for entry in DATA['assets'][kind]}
sprite_meta={entry['key']:entry for entry in DATA['assets']['sprites']}

def open_asset(key:str,frame:int|None=None)->Image.Image:
    image=Image.open(asset_path[key]).convert('RGBA')
    if key in sprite_meta:
        meta=sprite_meta[key]; fw=meta['frameWidth']; fh=meta['frameHeight']; columns=image.width//fw
        frame=int(frame or 0); x=(frame%columns)*fw; y=(frame//columns)*fh
        image=image.crop((x,y,x+fw,y+fh))
    return image

def tile(texture:Image.Image,size:tuple[int,int])->Image.Image:
    out=Image.new('RGBA',size)
    for y in range(0,size[1],texture.height):
        for x in range(0,size[0],texture.width): out.alpha_composite(texture,(x,y))
    return out

def depth(obj:dict)->int:
    render=obj.get('render') or {}; layer=render.get('layer'); y=render.get('y',0)
    if layer=='floor': return 2
    if layer=='wall': return 18
    if layer=='surface': return round(y+30)
    if layer=='foreground': return 1800
    return round(y)

layout=DATA['layout']; W=layout['width']; H=layout['height']; wall=layout['wallThickness']
canvas=Image.new('RGBA',(W,H),(20,25,32,255))
# architecture
for room in layout['rooms']:
    b=room['bounds']; x,y,w,h=b['x'],b['y'],b['w'],b['h']
    floor=tile(open_asset(room['floorTexture']),(w,h)); canvas.alpha_composite(floor,(x,y))
    walltex=open_asset(room['wallTexture'])
    canvas.alpha_composite(tile(walltex,(w,wall)),(x,y))
    canvas.alpha_composite(tile(walltex,(wall,h)),(x,y))
    canvas.alpha_composite(tile(walltex,(wall,h)),(x+w-wall,y))
    canvas.alpha_composite(tile(walltex,(w,wall)),(x,y+h-wall))
for opening in layout['openings']:
    r=opening['rect']; patch=tile(open_asset(opening['floorTexture']),(r['w'],r['h']))
    canvas.alpha_composite(patch,(r['x'],r['y']))
# objects
for obj in sorted([o for o in DATA['objects'] if o.get('render')],key=depth):
    r=obj['render']; image=open_asset(r['texture'],r.get('frame'))
    if r.get('flipX'): image=image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    scale=float(r.get('scale',1))
    if scale!=1: image=image.resize((max(1,round(image.width*scale)),max(1,round(image.height*scale))),Image.Resampling.NEAREST)
    origin=r.get('origin',{'x':.5,'y':.5}); px=round(r['x']-image.width*origin['x']); py=round(r['y']-image.height*origin['y'])
    canvas.alpha_composite(image,(px,py))
# player at spawn
player=open_asset('player',DATA['playerFrames']['idle']['down'])
spawn=layout['spawn']; canvas.alpha_composite(player,(round(spawn['x']-player.width*.5),round(spawn['y']-player.height*.88)))
# unobtrusive registry marker
mark=Image.new('RGBA',(194,24),(10,16,24,205)); md=ImageDraw.Draw(mark); md.text((8,5),'HOUSE V3 · registry preview',font=FONT_S,fill=(205,231,225,255))
canvas.alpha_composite(mark,(W-204,H-34))
canvas.convert('RGB').save(OUT/'layout/house-v3-layout-preview.png',quality=95)
# room crops at 2x
for room in layout['rooms']:
    b=room['bounds']; margin=12
    box=(max(0,b['x']-margin),max(0,b['y']-margin),min(W,b['x']+b['w']+margin),min(H,b['y']+b['h']+margin))
    crop=canvas.crop(box).resize(((box[2]-box[0])*2,(box[3]-box[1])*2),Image.Resampling.NEAREST)
    crop.convert('RGB').save(OUT/'layout'/f"room-{room['id']}.png",quality=95)

# Frame-map contact sheet
atlas=Image.open(asset_path['player']).convert('RGBA'); columns=atlas.width//48
sequences=[
 ('idle',[(k,[v]) for k,v in DATA['playerFrames']['idle'].items()]),
 ('walk',list(DATA['playerFrames']['walk'].items())),
 ('sit',[(k,[v]) for k,v in DATA['playerFrames']['sit'].items()]),
 ('actions',[('lie',DATA['playerFrames']['lie']),('phone',DATA['playerFrames']['phone']),('read',DATA['playerFrames']['read'])]),
 ('use',list(DATA['playerFrames']['use'].items())),
 ('eat',list(DATA['playerFrames']['eat'].items()))
]
rows=[]
for group,items in sequences:
    for name,frames in items: rows.append((group,name,frames))
cell=58; label_w=132; row_h=76; max_frames=max(len(frames) for _,_,frames in rows)
sheet=Image.new('RGBA',(label_w+max_frames*cell+20,44+len(rows)*row_h),(22,29,38,255)); draw=ImageDraw.Draw(sheet)
draw.text((14,12),'QUOTIDIANO · PLAYER FRAME MAP',font=FONT_B,fill=(239,246,248,255))
y=44
for group,name,frames in rows:
    draw.rectangle((0,y,sheet.width,y+row_h-2),fill=(27,37,48,255) if (y//row_h)%2 else (24,33,43,255))
    draw.text((12,y+15),f'{group} · {name}',font=FONT,fill=(174,205,195,255))
    for i,frame in enumerate(frames):
        sx=(frame%columns)*48; sy=(frame//columns)*48; sprite=atlas.crop((sx,sy,sx+48,sy+48)).resize((56,56),Image.Resampling.NEAREST)
        x=label_w+i*cell; sheet.alpha_composite(sprite,(x,y+3)); draw.text((x+2,y+59),str(frame),font=FONT_S,fill=(205,216,223,255))
    y+=row_h
sheet.convert('RGB').save(OUT/'player-contacts/player-frame-map.png',quality=95)

# A smaller four-direction reference image
items=[('direita',168),('cima',174),('esquerda',180),('baixo',186)]
ref=Image.new('RGBA',(4*160,190),(22,29,38,255)); rd=ImageDraw.Draw(ref)
for i,(name,frame) in enumerate(items):
    sx=(frame%columns)*48; sy=(frame//columns)*48; sprite=atlas.crop((sx,sy,sx+48,sy+48)).resize((144,144),Image.Resampling.NEAREST)
    ref.alpha_composite(sprite,(i*160+8,8)); rd.text((i*160+12,157),f'{name} · {frame}',font=FONT,fill=(233,240,243,255))
ref.convert('RGB').save(OUT/'player-contacts/player-idle-directions.png',quality=95)
print(json.dumps({'layout':str(OUT/'layout/house-v3-layout-preview.png'),'frameMap':str(OUT/'player-contacts/player-frame-map.png'),'rooms':len(layout['rooms']),'objects':len(DATA['objects'])},indent=2))

from __future__ import annotations
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pathlib import Path
import json, math, random

ROOT=Path(__file__).resolve().parents[1]
STREET=ROOT/'public/assets/street'
CHAR=ROOT/'public/assets/characters'
NPC=ROOT/'public/assets/npc'
STREET.mkdir(parents=True,exist_ok=True)
random.seed(11)

FONT_REG='/usr/share/fonts/truetype/lato/Lato-Medium.ttf'
FONT_BOLD='/usr/share/fonts/truetype/lato/Lato-Heavy.ttf'

def font(size,bold=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG,size)

def rr(d,box,r,fill,outline=None,width=1):
    d.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=width)

def brick_wall(d,box,base='#a85e4d',mortar='#d6b19b',brick='#b86c58',brick_w=34,brick_h=14):
    x0,y0,x1,y1=box
    d.rectangle(box,fill=base)
    for row,y in enumerate(range(y0,y1,brick_h)):
        off=-(brick_w//2) if row%2 else 0
        for x in range(x0+off,x1,brick_w):
            bx0=max(x,x0)+1; bx1=min(x+brick_w-2,x1)
            if bx1>bx0:
                shade=random.choice([brick,'#a65b4b','#bd715d','#9f5848'])
                d.rectangle((bx0,y+1,bx1,min(y+brick_h-2,y1)),fill=shade)
        d.line((x0,y,x1,y),fill=mortar,width=1)

def window(d,box,frame='#e7e1d1',glass='#9dc0bd',curtain='#f5ead6',warm=False):
    x0,y0,x1,y1=box
    rr(d,box,4,frame,'#4b5e58',2)
    inner=(x0+7,y0+7,x1-7,y1-7)
    d.rectangle(inner,fill='#d5ad70' if warm else glass)
    d.line(((inner[0]+inner[2])//2,inner[1],(inner[0]+inner[2])//2,inner[3]),fill='#eef1e7',width=3)
    if not warm:
        d.polygon([(inner[0],inner[1]),(inner[0]+14,inner[1]),(inner[0]+8,inner[3]),(inner[0],inner[3])],fill=curtain)
        d.polygon([(inner[2],inner[1]),(inner[2]-14,inner[1]),(inner[2]-8,inner[3]),(inner[2],inner[3])],fill=curtain)

def foliage_blob(d,cx,cy,r,base='#6f9463'):
    for _ in range(18):
        a=random.random()*math.tau; rad=random.random()*r*.65
        x=cx+math.cos(a)*rad; y=cy+math.sin(a)*rad*.7
        rr(d,(x-r*.22,y-r*.18,x+r*.22,y+r*.18),int(r*.12),random.choice([base,'#7ea06d','#5e8659','#90ab78']))

def shadow(img,box,blur=10,alpha=65):
    layer=Image.new('RGBA',img.size,(0,0,0,0)); d=ImageDraw.Draw(layer)
    d.ellipse(box,fill=(35,43,38,alpha)); layer=layer.filter(ImageFilter.GaussianBlur(blur)); img.alpha_composite(layer)

# ---------- STREET BASE ----------
w,h=2400,1000
img=Image.new('RGB',(w,h),'#b8caa0'); d=ImageDraw.Draw(img)
# grass texture
for _ in range(1700):
    x=random.randrange(w); y=random.choice([random.randrange(0,240),random.randrange(825,h)])
    c=random.choice(['#9fb789','#b8ca9f','#8fa97e','#c5d3aa','#d6c991'])
    r=random.choice([1,1,2,3]); d.ellipse((x-r,y-r,x+r,y+r),fill=c)
# sidewalks
for y0,y1 in [(240,368),(708,825)]:
    d.rectangle((0,y0,w,y1),fill='#c7c0ad')
    bh=18; bw=42
    for row,y in enumerate(range(y0,y1,bh)):
        off=-bw//2 if row%2 else 0
        for x in range(off,w,bw):
            shade=random.choice(['#c9c2af','#beb7a6','#d0c9b7','#b8b19f'])
            d.rectangle((x+1,y+1,x+bw-2,min(y+bh-2,y1)),fill=shade)
    for y in range(y0,y1,bh): d.line((0,y,w,y),fill='#a9a393',width=1)
# Dutch red bike lane and curbs
d.rectangle((0,368,w,405),fill='#a85349')
for x in range(40,w,135): d.rectangle((x,384,x+58,389),fill='#eadfce')
d.rectangle((0,405,w,414),fill='#aba89d')
d.rectangle((0,690,w,708),fill='#a65449')
# asphalt
d.rectangle((0,414,w,690),fill='#69706d')
for _ in range(900):
    x=random.randrange(w); y=random.randrange(418,688); c=random.choice(['#747b78','#626966','#7d827f'])
    d.point((x,y),fill=c)
# center markings
for x in range(20,w,145): d.rounded_rectangle((x,548,x+72,556),radius=3,fill='#ede9dc')
# crosswalk near cafe
for x in range(1860,1980,22): d.rectangle((x,434,x+12,670),fill='#eee9d8')
# drainage and tiny details
for x in [420,985,1430,2020]:
    d.rounded_rectangle((x,400,x+38,408),radius=2,fill='#555d5a')
    for xx in range(x+5,x+36,7): d.line((xx,401,xx,407),fill='#8a8f8c')
for _ in range(75):
    x=random.randrange(w); y=random.choice([random.randrange(250,360),random.randrange(730,810)])
    d.ellipse((x,y,x+4,y+2),fill=random.choice(['#a36d4b','#d8bd68','#925f46','#c87e63']))
img.save(STREET/'base_ground.png',optimize=True)

# ---------- NEIGHBOUR BUILDINGS LAYER ----------
img=Image.new('RGBA',(w,300),(0,0,0,0)); d=ImageDraw.Draw(img)

def house(x0,width,body,roof,door,variant=0):
    y0=58; y1=246
    shadow(img,(x0+18,230,x0+width-10,270),10,45)
    brick_wall(d,(x0,y0,x0+width,y1),body)
    # stepped/gabled roof variety
    if variant%2==0:
        d.polygon([(x0-12,y0+3),(x0+width//2,8),(x0+width+12,y0+3)],fill=roof)
        d.polygon([(x0-12,y0+3),(x0+width//2,8),(x0+width+12,y0+3)],outline='#39433e')
    else:
        d.polygon([(x0-8,y0),(x0+28,20),(x0+width-28,20),(x0+width+8,y0)],fill=roof)
    # windows
    window(d,(x0+28,88,x0+92,155),warm=variant==2)
    window(d,(x0+width-94,88,x0+width-30,155),warm=False)
    rr(d,(x0+width//2-24,154,x0+width//2+24,246),4,door,'#263b34',2)
    d.ellipse((x0+width//2+11,195,x0+width//2+17,201),fill='#ddb857')
    # front planting strip
    d.rectangle((x0+18,224,x0+width-18,246),fill='#6f8959')
    for _ in range(18):
        xx=random.randint(x0+20,x0+width-20); yy=random.randint(220,244)
        d.ellipse((xx-4,yy-5,xx+4,yy+4),fill=random.choice(['#8ba866','#71935c','#b6bf75']))

house(525,255,'#a35e4f','#3c4843','#315948',1)
house(905,280,'#9b5a49','#414b45','#554f67',0)
house(1265,250,'#ad6652','#35463e','#2f6254',2)
house(1655,260,'#9c5848','#48504a','#3c5548',1)
# warm sky-side ambient veil
veil=Image.new('RGBA',img.size,(0,0,0,0)); vd=ImageDraw.Draw(veil);vd.rectangle((0,0,w,300),fill=(245,215,170,10));img.alpha_composite(veil)
img.save(STREET/'buildings_back.png',optimize=True)

# ---------- PLAYER HOUSE ----------
W,H=430,292; img=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
shadow(img,(25,248,405,286),12,70)
# roof
d.polygon([(18,74),(88,18),(350,18),(416,74)],fill='#3d4a43')
d.polygon([(24,75),(91,25),(348,25),(410,75)],fill='#4e5b52')
brick_wall(d,(35,72,395,252),'#a95f4d')
# slightly protruding bay and trim
window(d,(70,102,150,180),frame='#e7dfcc',glass='#93b9b7')
window(d,(282,102,362,180),frame='#e7dfcc',glass='#93b9b7')
# personal window details
rr(d,(83,166,137,174),4,'#6f8d62');
d.ellipse((96,153,106,169),fill='#d8b95a');d.ellipse((114,151,124,169),fill='#d68173')
# door surround
rr(d,(180,92,258,254),6,'#efe8d7','#74594a',2)
rr(d,(191,104,247,254),4,'#31594b','#213c34',2)
window(d,(200,114,238,153),frame='#d9e1d6',glass='#9fc4c1')
d.ellipse((231,185,238,192),fill='#e5c661')
# number plaque
rr(d,(262,110,294,137),5,'#f2ead7','#6c5a4b',2);d.text((278,123),'17',font=font(15,True),fill='#2f463c',anchor='mm')
# porch light + glow
glow=Image.new('RGBA',(W,H),(0,0,0,0)); gd=ImageDraw.Draw(glow);gd.ellipse((298,116,346,164),fill=(255,210,118,70));glow=glow.filter(ImageFilter.GaussianBlur(12));img.alpha_composite(glow);d=ImageDraw.Draw(img)
rr(d,(313,120,329,144),4,'#d7b562','#655843',2)
# threshold + stone detail
d.polygon([(174,251),(264,251),(280,270),(158,270)],fill='#978e7a');d.line((158,270,280,270),fill='#70695c',width=2)
# rain pipe
d.rectangle((376,85,382,248),fill='#56645e');d.ellipse((372,243,386,256),fill='#4d5954')
img.save(STREET/'player_house.png',optimize=True)

# ---------- CAFE FACADE ----------
W,H=470,300; img=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
shadow(img,(15,254,455,294),13,75)
brick_wall(d,(22,68,448,258),'#875043',brick='#965b4b')
d.polygon([(10,68),(52,22),(416,22),(460,68)],fill='#29473b')
# sign fascia
rr(d,(80,48,390,94),8,'#f1dfb2','#7d694e',2)
d.text((235,64),'DE KLEINE BOON',font=font(22,True),fill='#27483b',anchor='mm')
d.text((235,84),'KOFFIE · CAFÉ',font=font(12,True),fill='#6a5742',anchor='mm')
# large windows warm interior
window(d,(52,112,160,218),frame='#ede2c9',glass='#d5ad70',warm=True)
window(d,(304,112,418,218),frame='#ede2c9',glass='#d5ad70',warm=True)
# soft glow behind windows
glow=Image.new('RGBA',(W,H),(0,0,0,0)); gd=ImageDraw.Draw(glow);gd.rectangle((45,106,425,224),fill=(255,184,86,38));glow=glow.filter(ImageFilter.GaussianBlur(16));img.alpha_composite(glow);d=ImageDraw.Draw(img)
# plants inside windows
for xx in (78,132,330,385):
    d.line((xx,200,xx,180),fill='#496b4e',width=3);d.ellipse((xx-10,170,xx+4,187),fill='#6c9465');d.ellipse((xx-2,174,xx+12,190),fill='#769e6b')
# door
rr(d,(194,113,276,258),5,'#24473c','#efe3c9',4);window(d,(207,126,263,184),frame='#dbe5dc',glass='#aacbc4')
d.ellipse((257,207,264,214),fill='#e3bd5e')
# awning
for x in range(38,434,44):
    d.polygon([(x,98),(x+44,98),(x+38,122),(x+6,122)],fill='#e8c878' if (x//44)%2==0 else '#325a49')
d.line((38,122,434,122),fill='#705a3f',width=2)
# hanging lights
for x in (183,287):
    d.line((x,94,x,112),fill='#554d40',width=2);d.ellipse((x-5,108,x+5,118),fill='#ffd981')
img.save(STREET/'cafe_facade.png',optimize=True)

# ---------- PROPS ----------
def make_prop(size, draw_fn, path):
    im=Image.new('RGBA',size,(0,0,0,0)); dr=ImageDraw.Draw(im); draw_fn(im,dr); im.save(path,optimize=True)

def flowerbed(im,d):
    shadow(im,(6,50,144,76),6,45);rr(d,(8,48,142,72),8,'#7f5a42','#60402f',2);d.rectangle((14,42,136,55),fill='#5c4934')
    for x in range(18,137,11):
        y=random.randint(27,49);d.line((x,52,x,y),fill=random.choice(['#51774d','#678a59']),width=2)
        c=random.choice(['#e1b357','#c96b65','#d887ad','#f0ddd0','#7c88b8']);d.ellipse((x-4,y-5,x+4,y+3),fill=c)
make_prop((150,82),flowerbed,STREET/'flower_bed.png')

def mailbox(im,d):
    shadow(im,(11,80,61,98),5,45);d.rectangle((31,38,39,91),fill='#4e5c57');rr(d,(10,15,61,52),8,'#315748','#203b33',2);d.polygon([(10,24),(35,7),(61,24)],fill='#3c6655');rr(d,(18,27,53,39),2,'#efe4cf');d.rectangle((20,29,51,31),fill='#6e6657')
make_prop((72,100),mailbox,STREET/'mailbox.png')

def fence(im,d):
    for x in range(8,126,18): rr(d,(x,8,x+6,55),3,'#58655f');d.line((8,26,126,26),fill='#58655f',width=5);d.line((8,47,126,47),fill='#58655f',width=5)
make_prop((134,62),fence,STREET/'fence.png')

def lamp(im,d):
    glow=Image.new('RGBA',im.size,(0,0,0,0));gd=ImageDraw.Draw(glow);gd.ellipse((10,0,60,58),fill=(255,210,118,70));glow=glow.filter(ImageFilter.GaussianBlur(12));im.alpha_composite(glow);d=ImageDraw.Draw(im)
    d.rectangle((31,48,39,184),fill='#384640');rr(d,(24,30,46,57),5,'#2d3c36');d.polygon([(20,30),(35,15),(50,30)],fill='#34443d');d.ellipse((29,35,41,48),fill='#f4cf77');d.ellipse((22,177,48,194),fill='#303e38')
make_prop((70,198),lamp,STREET/'street_lamp.png')

def bike_rack(im,d):
    shadow(im,(10,79,186,106),6,45)
    # rack loops
    for x in (54,92,130):
        d.arc((x-14,55,x+14,96),180,360,fill='#75827d',width=4);d.line((x-14,75,x-14,96),fill='#75827d',width=4);d.line((x+14,75,x+14,96),fill='#75827d',width=4)
    # two bikes
    for ox,col in [(22,'#3e7568'),(86,'#80534b')]:
        for cx in (ox+22,ox+70): d.ellipse((cx-16,52,cx+16,84),outline='#36443f',width=3)
        d.line((ox+22,68,ox+46,47,ox+70,68,ox+46,68,ox+34,54,ox+55,54),fill=col,width=4)
        d.line((ox+46,47,ox+42,37,ox+33,37),fill=col,width=3)
make_prop((196,110),bike_rack,STREET/'bike_rack.png')

def bench(im,d):
    shadow(im,(10,66,184,94),6,50);rr(d,(12,22,184,46),6,'#b47b4b','#6b472e',2);rr(d,(18,50,178,69),5,'#a86f43','#6b472e',2)
    for x in (28,64,100,136,170): d.line((x,25,x,43),fill='#cc9769',width=2)
    rr(d,(28,65,41,94),3,'#3e4d47');rr(d,(152,65,165,94),3,'#3e4d47')
make_prop((196,100),bench,STREET/'bench.png')

def bus_sign(im,d):
    glow=Image.new('RGBA',im.size,(0,0,0,0));gd=ImageDraw.Draw(glow);gd.ellipse((18,0,95,78),fill=(220,234,221,45));glow=glow.filter(ImageFilter.GaussianBlur(10));im.alpha_composite(glow);d=ImageDraw.Draw(im)
    rr(d,(20,6,91,78),13,'#f0efe7','#33453e',3);rr(d,(31,18,80,63),8,'#2f6556');d.text((55,40),'BUS',font=font(13,True),fill='#f6ecda',anchor='mm');rr(d,(49,76,62,222),5,'#3c4a45');d.ellipse((42,214,69,228),fill='#33423d')
make_prop((112,232),bus_sign,STREET/'bus_sign.png')

def board(im,d):
    shadow(im,(7,76,67,98),5,45);d.polygon([(18,12),(55,12),(67,91),(8,91)],fill='#5c4330',outline='#3d2d22');d.polygon([(23,20),(51,20),(57,76),(16,76)],fill='#26352f');d.text((36,37),'KOFFIE',font=font(9,True),fill='#f2e5c8',anchor='mm');d.text((36,52),'€3',font=font(13,True),fill='#e2c67a',anchor='mm');d.line((23,65,49,65),fill='#f2e5c8',width=2)
make_prop((74,100),board,STREET/'cafe_board.png')

def outdoor(im,d):
    shadow(im,(8,65,132,98),6,45);d.ellipse((36,34,104,58),fill='#8a684a',outline='#5c4735',width=2);d.rectangle((67,55,73,89),fill='#4a504a');d.ellipse((48,83,92,94),fill='#4a504a');
    for x in (18,112):
        rr(d,(x-14,52,x+14,76),5,'#315849');d.rectangle((x-3,74,x+3,96),fill='#34433d')
    rr(d,(61,25,78,41),4,'#ede4d2');d.ellipse((64,22,75,31),fill='#5e8258')
make_prop((140,102),outdoor,STREET/'outdoor_table.png')

# tree - richer clusters
def tree(im,d):
    shadow(im,(46,220,166,252),8,55);d.polygon([(88,113),(122,113),(134,232),(76,232)],fill='#76513b');d.polygon([(96,120),(109,120),(104,223),(84,223)],fill='#8c6042')
    for cx,cy,r in [(104,78,56),(65,104,44),(148,105,47),(107,133,54),(151,66,36),(57,62,34)]: foliage_blob(d,cx,cy,r)
make_prop((210,260),tree,STREET/'tree.png')

# subtle street foreground leaves near bottom edges
fg=Image.new('RGBA',(w,h),(0,0,0,0)); fd=ImageDraw.Draw(fg)
for cx,cy in [(60,920),(2325,905)]:
    for _ in range(28):
        x=cx+random.randint(-80,80); y=cy+random.randint(-55,55); r=random.randint(12,30)
        fd.ellipse((x-r,y-r*.6,x+r,y+r*.6),fill=random.choice([(73,110,64,120),(92,128,76,120),(119,145,88,110)]))
fg.save(STREET/'foreground.png',optimize=True)

# ---------- CHARACTER ATLAS ----------
CS=4; FW,FH=64,88

def C(v): return int(round(v*CS))
def cbox(box): return tuple(C(v) for v in box)

def draw_character(direction='down',step=0,walking=False,pose=None,palette=None,features=None):
    p=palette or {'hair':'#1f2729','jacket':'#e7b63d','shirt':'#4f875d','pants':'#364249','skin':'#e6b08a','shoe':'#f1eee4','outline':'#303735','accent':'#d39d24'}
    f=features or {}
    im=Image.new('RGBA',(FW*CS,FH*CS),(0,0,0,0));d=ImageDraw.Draw(im)
    bob=1 if walking and step in (1,2,5,6) else 0
    swing=[-2,-1,0,1,2,1,0,-1][step%8] if walking else 0
    # special poses
    if pose=='lie_right':
        d.ellipse(cbox((7,64,58,80)),fill=(0,0,0,36));rr(d,cbox((19,38,52,61)),C(8),p['jacket'],p['outline'],C(1));rr(d,cbox((28,41,46,57)),C(4),p['shirt']);d.ellipse(cbox((7,34,31,57)),fill=p['skin'],outline=p['outline'],width=C(1));
        hair_spikes(d,18,35,'right',p['hair']);rr(d,cbox((47,43,61,52)),C(4),p['pants']);rr(d,cbox((50,53,63,60)),C(3),p['shoe']);return im.resize((FW,FH),Image.Resampling.LANCZOS)
    if pose and pose.startswith('sit'):
        d.ellipse(cbox((16,69,50,81)),fill=(0,0,0,32));body_y=36;rr(d,cbox((19,body_y,45,61)),C(9),p['jacket'],p['outline'],C(1));rr(d,cbox((25,39,39,58)),C(4),p['shirt']);head(d,32,26,direction,p,f);rr(d,cbox((18,58,33,72)),C(4),p['pants']);rr(d,cbox((32,58,48,72)),C(4),p['pants']);rr(d,cbox((14,69,31,76)),C(3),p['shoe']);rr(d,cbox((35,69,52,76)),C(3),p['shoe']);return im.resize((FW,FH),Image.Resampling.LANCZOS)
    # shadow
    d.ellipse(cbox((17,71,47,82)),fill=(0,0,0,32))
    # legs
    left_off=swing if direction in ('left','right') else int(swing*.7)
    right_off=-left_off
    if pose and pose.startswith('shower'):
        p=p|{'jacket':'#6e9f98','shirt':'#8bb7b1'}
    rr(d,cbox((20+left_off*.25,58+bob,30+left_off*.25,73+bob)),C(4),p['pants'],p['outline'],C(1))
    rr(d,cbox((34+right_off*.25,58+bob,44+right_off*.25,73+bob)),C(4),p['pants'],p['outline'],C(1))
    rr(d,cbox((15+left_off*.4,70+bob,31+left_off*.4,78+bob)),C(4),p['shoe'],p['outline'],C(1));rr(d,cbox((34+right_off*.4,70+bob,50+right_off*.4,78+bob)),C(4),p['shoe'],p['outline'],C(1))
    # yellow shoe detail
    d.rectangle(cbox((20,74+bob,27,76+bob)),fill=p.get('accent','#d39d24'));d.rectangle(cbox((39,74+bob,46,76+bob)),fill=p.get('accent','#d39d24'))
    # body
    rr(d,cbox((18,34+bob,46,62+bob)),C(9),p['jacket'],p['outline'],C(1));rr(d,cbox((25,36+bob,39,59+bob)),C(4),p['shirt'])
    # jacket opening/lapels
    d.polygon([cbox((22,35+bob,))[0:2],cbox((28,35+bob,))[0:2],cbox((25,49+bob,))[0:2]],fill='#f0c756')
    d.polygon([cbox((42,35+bob,))[0:2],cbox((36,35+bob,))[0:2],cbox((39,49+bob,))[0:2]],fill='#f0c756')
    # arms
    arm_y=39+bob
    if pose and pose.startswith('pick'):
        rr(d,cbox((13,arm_y+5,23,61+bob)),C(4),p['jacket'],p['outline'],C(1));d.ellipse(cbox((12,58+bob,23,69+bob)),fill=p['skin'],outline=p['outline'],width=C(1));rr(d,cbox((41,arm_y+5,51,61+bob)),C(4),p['jacket'],p['outline'],C(1));d.ellipse(cbox((42,58+bob,53,69+bob)),fill=p['skin'],outline=p['outline'],width=C(1))
    elif pose and pose.startswith('pet'):
        rr(d,cbox((13,38,23,58)),C(4),p['jacket'],p['outline'],C(1));d.ellipse(cbox((13,55,24,66)),fill=p['skin'],outline=p['outline'],width=C(1));rr(d,cbox((42,40,53,64)),C(4),p['jacket'],p['outline'],C(1));d.ellipse(cbox((46,61,57,71)),fill=p['skin'],outline=p['outline'],width=C(1))
    elif pose and pose.startswith('drink'):
        rr(d,cbox((12,40,23,57)),C(4),p['jacket'],p['outline'],C(1));rr(d,cbox((41,39,51,52)),C(4),p['jacket'],p['outline'],C(1));d.ellipse(cbox((41,30,52,42)),fill=p['skin'],outline=p['outline'],width=C(1));rr(d,cbox((47,26,56,37)),C(2),'#f3eee1','#6f6557',C(1))
    elif pose and (pose.startswith('wash') or pose.startswith('cook')):
        rr(d,cbox((12,39,23,57)),C(4),p['jacket'],p['outline'],C(1));rr(d,cbox((41,39,52,57)),C(4),p['jacket'],p['outline'],C(1));d.ellipse(cbox((18,50,28,60)),fill=p['skin']);d.ellipse(cbox((36,50,46,60)),fill=p['skin'])
    elif pose and pose.startswith('talk'):
        rr(d,cbox((12,38,23,58)),C(4),p['jacket'],p['outline'],C(1));rr(d,cbox((41,34,52,54)),C(4),p['jacket'],p['outline'],C(1));d.ellipse(cbox((44,29,54,40)),fill=p['skin'],outline=p['outline'],width=C(1))
    else:
        rr(d,cbox((12-swing*.2,39+bob,23-swing*.2,59+bob)),C(4),p['jacket'],p['outline'],C(1));rr(d,cbox((41+swing*.2,39+bob,52+swing*.2,59+bob)),C(4),p['jacket'],p['outline'],C(1));d.ellipse(cbox((12-swing*.2,55+bob,23-swing*.2,66+bob)),fill=p['skin'],outline=p['outline'],width=C(1));d.ellipse(cbox((41+swing*.2,55+bob,52+swing*.2,66+bob)),fill=p['skin'],outline=p['outline'],width=C(1))
    head(d,32,26+bob,direction,p,f)
    return im.resize((FW,FH),Image.Resampling.LANCZOS)

def hair_spikes(d,cx,cy,direction,color):
    pts=[(cx-14,cy+2),(cx-16,cy-9),(cx-10,cy-6),(cx-8,cy-17),(cx-2,cy-10),(cx+3,cy-19),(cx+7,cy-10),(cx+14,cy-15),(cx+13,cy-4),(cx+17,cy+1),(cx+10,cy+6),(cx-10,cy+6)]
    d.polygon([(C(x),C(y)) for x,y in pts],fill=color)

def head(d,cx,cy,direction,p,f):
    skin=f.get('skin',p['skin']);hair=f.get('hair',p['hair']);
    d.ellipse(cbox((cx-13,cy-13,cx+13,cy+14)),fill=skin,outline=p['outline'],width=C(1))
    hair_spikes(d,cx,cy-8,direction,hair)
    # side hair/back depending direction
    if direction=='up':
        rr(d,cbox((cx-13,cy-8,cx+13,cy+10)),C(7),hair);return
    eye='#25302e';
    if direction=='left':
        d.ellipse(cbox((cx-8,cy-1,cx-5,cy+2)),fill=eye);d.arc(cbox((cx-8,cy+5,cx+2,cy+10)),0,120,fill='#875c50',width=C(1))
    elif direction=='right':
        d.ellipse(cbox((cx+5,cy-1,cx+8,cy+2)),fill=eye);d.arc(cbox((cx-2,cy+5,cx+8,cy+10)),60,180,fill='#875c50',width=C(1))
    else:
        d.ellipse(cbox((cx-7,cy-1,cx-4,cy+2)),fill=eye);d.ellipse(cbox((cx+4,cy-1,cx+7,cy+2)),fill=eye);d.arc(cbox((cx-5,cy+4,cx+5,cy+10)),0,180,fill='#875c50',width=C(1))
    if f.get('glasses'):
        d.ellipse(cbox((cx-10,cy-4,cx-2,cy+4)),outline='#46504d',width=C(1));d.ellipse(cbox((cx+2,cy-4,cx+10,cy+4)),outline='#46504d',width=C(1));d.line(cbox((cx-2,cy,cx+2,cy)),fill='#46504d',width=C(1))

# protagonist frames
frames=[];names=[]
for direction in ['down','left','right','up']:
    frames.append(draw_character(direction));names.append(f'idle_{direction}')
    for i in range(8):frames.append(draw_character(direction,i,True));names.append(f'walk_{direction}_{i}')
poses=['sit_down','sit_left','sit_right','sit_up','lie_right','pick_down','pick_up','pick_left','pick_right','pet_up','pet_right','drink_down','wash_up','wash_right','cook_up','talk_down','talk_up','talk_left','talk_right','shower_down']
for pose in poses:
    direction=pose.split('_')[-1] if pose.split('_')[-1] in ('up','down','left','right') else 'down'
    frames.append(draw_character(direction,pose=pose));names.append('pose_'+pose)
cols=8;rows=math.ceil(len(frames)/cols);atlas=Image.new('RGBA',(FW*cols,FH*rows),(0,0,0,0));meta={'frames':{},'meta':{'app':'QUOTIDIANO V1.1 art-source','version':'1.1','image':'protagonist.png','format':'RGBA8888','size':{'w':FW*cols,'h':FH*rows},'scale':'1'}}
for idx,(fr,name) in enumerate(zip(frames,names)):
    x=(idx%cols)*FW;y=(idx//cols)*FH;atlas.alpha_composite(fr,(x,y));meta['frames'][name]={'frame':{'x':x,'y':y,'w':FW,'h':FH},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':FW,'h':FH},'sourceSize':{'w':FW,'h':FH}}
atlas.save(CHAR/'protagonist.png',optimize=True);(CHAR/'protagonist.json').write_text(json.dumps(meta,indent=2),encoding='utf-8')

# NPC atlas with distinct silhouettes/palettes/features
npc_defs={
 'pieter':({'hair':'#d9d9d2','jacket':'#596a5b','shirt':'#7d4d43','pants':'#4b514d','skin':'#dca781','shoe':'#5f5b50','outline':'#343b38','accent':'#b68c50'},{'glasses':True,'hair':'#d9d9d2'}),
 'lotte':({'hair':'#9a4f35','jacket':'#3d8793','shirt':'#eee1c9','pants':'#354550','skin':'#e3aa84','shoe':'#efeae0','outline':'#303938','accent':'#c1884f'},{'hair':'#9a4f35'}),
 'sanne':({'hair':'#5b382b','jacket':'#a45e3f','shirt':'#e9d4b5','pants':'#34443e','skin':'#d99e79','shoe':'#f1ece1','outline':'#303835','accent':'#d8aa54'},{'hair':'#5b382b'}),
 'customer':({'hair':'#22292a','jacket':'#795b78','shirt':'#d3b15c','pants':'#333e45','skin':'#9c684f','shoe':'#eee9dd','outline':'#2b3332','accent':'#c88b54'},{'hair':'#22292a','skin':'#9c684f'})
}
nframes=[];nnames=[]
for npc,(pal,feat) in npc_defs.items():
    for direction in ['down','left','right','up']:
        nframes.append(draw_character(direction,palette=pal,features=feat));nnames.append(f'{npc}_{direction}')
cols=8;rows=math.ceil(len(nframes)/cols);atlas=Image.new('RGBA',(FW*cols,FH*rows),(0,0,0,0));meta={'frames':{},'meta':{'app':'QUOTIDIANO V1.1 art-source','version':'1.1','image':'npcs.png','format':'RGBA8888','size':{'w':FW*cols,'h':FH*rows},'scale':'1'}}
for idx,(fr,name) in enumerate(zip(nframes,nnames)):
    x=(idx%cols)*FW;y=(idx//cols)*FH;atlas.alpha_composite(fr,(x,y));meta['frames'][name]={'frame':{'x':x,'y':y,'w':FW,'h':FH},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':FW,'h':FH},'sourceSize':{'w':FW,'h':FH}}
atlas.save(NPC/'npcs.png',optimize=True);(NPC/'npcs.json').write_text(json.dumps(meta,indent=2),encoding='utf-8')

print('QUOTIDIANO V1.1 street + character assets generated')

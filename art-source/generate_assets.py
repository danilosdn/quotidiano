from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pathlib import Path
import math, json, random, wave, struct

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public' / 'assets'
S = 2
random.seed(7)

PALETTE = {
    'ink': '#26302b', 'ink2':'#47534d', 'cream':'#f4ead7', 'paper':'#fff8ea',
    'wood':'#b77d4e','wood2':'#8b5837','wood3':'#d9aa77','olive':'#68765b',
    'olive2':'#879578','deep':'#2f4b3f','blue':'#a9c7ca','blue2':'#d9e9e8',
    'yellow':'#e9b83f','yellow2':'#f5d46f','green':'#5d8a62','brick':'#a8624d',
    'brick2':'#cf8f72','road':'#747875','sidewalk':'#c8c4b7','white':'#fffdf6',
    'shadow':'#1a252033','amber':'#f0c776','red':'#b95d51'
}

# ---------- drawing helpers ----------
def im(w,h,bg=(0,0,0,0)):
    return Image.new('RGBA',(w*S,h*S),bg)

def draw_scaled(img):
    return ImageDraw.Draw(img)

def sc(v): return int(round(v*S))
def box(x0,y0,x1,y1): return tuple(sc(v) for v in (x0,y0,x1,y1))

def rr(d, xy, r, fill, outline=None, width=1):
    d.rounded_rectangle(box(*xy), radius=sc(r), fill=fill, outline=outline, width=sc(width))

def rect(d, xy, fill, outline=None, width=1):
    d.rectangle(box(*xy), fill=fill, outline=outline, width=sc(width))

def ell(d, xy, fill, outline=None, width=1):
    d.ellipse(box(*xy), fill=fill, outline=outline, width=sc(width))

def line(d, pts, fill, width=1):
    d.line([(sc(x),sc(y)) for x,y in pts], fill=fill, width=sc(width), joint='curve')

def poly(d, pts, fill, outline=None):
    d.polygon([(sc(x),sc(y)) for x,y in pts], fill=fill)
    if outline:
        d.line([(sc(x),sc(y)) for x,y in pts+[pts[0]]], fill=outline, width=sc(1))

def shadow_layer(w,h, shapes):
    sh = im(w,h)
    d=draw_scaled(sh)
    for kind,args in shapes:
        if kind=='ellipse': ell(d,args,'#00000055')
        else: rr(d,args,8,'#00000044')
    sh=sh.filter(ImageFilter.GaussianBlur(sc(7)))
    return sh

def save(img,path):
    path.parent.mkdir(parents=True, exist_ok=True)
    if S != 1:
        img=img.resize((img.width//S,img.height//S), Image.Resampling.LANCZOS)
    img.save(path, optimize=True)

def wood_floor(w,h,color='#cfa170'):
    img=im(w,h,color)
    d=draw_scaled(img)
    y=0
    while y<h:
        hrow=34
        line(d,[(0,y),(w,y)],'#b98056',1)
        offset=(y//hrow)%2*80
        x=-offset
        while x<w:
            line(d,[(x,y),(x,y+hrow)],'#b98056',1)
            x+=160
        y+=hrow
    return img

def tile_floor(w,h,bg='#dbe9e6',linec='#bdd0cd',size=52):
    img=im(w,h,bg); d=draw_scaled(img)
    for x in range(0,w,size): line(d,[(x,0),(x,h)],linec,1)
    for y in range(0,h,size): line(d,[(0,y),(w,y)],linec,1)
    return img

def brick_pattern(d, x0,y0,x1,y1, c1='#a8624d', c2='#c17b64'):
    rect(d,(x0,y0,x1,y1),c1)
    bh=24; bw=74
    for row,y in enumerate(range(y0,y1,bh)):
        offset=(row%2)*bw//2
        line(d,[(x0,y),(x1,y)],'#e5b19a',1)
        for x in range(x0-offset,x1,bw):
            line(d,[(x,y),(x,y+bh)],'#e5b19a',1)
    # gentle highlights
    for _ in range(max(1,(x1-x0)*(y1-y0)//15000)):
        x=random.randint(x0,x1-10); y=random.randint(y0,y1-5)
        rect(d,(x,y,x+random.randint(6,18),y+2),'#ffffff12')

# ---------- props ----------
def make_bed():
    w,h=230,142; img=im(w,h); d=draw_scaled(img)
    img.alpha_composite(shadow_layer(w,h,[('rr',(18,36,220,132))]))
    rr(d,(20,28,220,126),18,'#aa7449',PALETTE['wood2'],2)
    rr(d,(28,34,212,118),16,'#f5efe2','#d6c7b1',2)
    rr(d,(36,40,118,72),12,'#fffdf7','#d7cdbc',1)
    rr(d,(126,40,203,72),12,'#fffaf0','#d7cdbc',1)
    rr(d,(36,74,204,115),12,'#819171','#6a795e',1)
    # quilt detail
    for x in range(48,198,28): line(d,[(x,78),(x+18,110)],'#9cab89',2)
    return img

def make_sofa():
    w,h=240,145; img=im(w,h); d=draw_scaled(img)
    img.alpha_composite(shadow_layer(w,h,[('rr',(16,48,224,132))]))
    rr(d,(20,42,220,126),22,'#6f7d61','#4b5a49',2)
    rr(d,(28,24,212,86),22,'#79886a','#4b5a49',2)
    rr(d,(34,55,116,116),16,'#879578','#5b6856',1)
    rr(d,(124,55,206,116),16,'#879578','#5b6856',1)
    rr(d,(45,64,102,99),12,'#d8c3a0','#a98c66',1)
    ell(d,(183,47,199,64),'#d5b966')
    return img

def make_table(round_table=False):
    w,h=(150,122) if not round_table else (150,135); img=im(w,h); d=draw_scaled(img)
    img.alpha_composite(shadow_layer(w,h,[('ellipse',(16,62,136,114))]))
    if round_table:
        ell(d,(18,20,132,92),'#b67d51','#815536',2)
        rr(d,(64,78,86,124),5,'#855737')
    else:
        rr(d,(15,28,135,88),12,'#b77d4e','#815536',2)
        rr(d,(26,82,39,116),4,'#805234')
        rr(d,(111,82,124,116),4,'#805234')
    return img

def make_chair():
    w,h=86,112; img=im(w,h); d=draw_scaled(img)
    img.alpha_composite(shadow_layer(w,h,[('ellipse',(12,70,74,103))]))
    rr(d,(16,20,70,70),10,'#d6b27e','#8b5b39',2)
    rr(d,(18,62,68,86),8,'#c99762','#8b5b39',2)
    rr(d,(23,82,32,108),3,'#7e5132'); rr(d,(54,82,63,108),3,'#7e5132')
    for x in (28,43,58): line(d,[(x,28),(x,61)],'#9e714b',3)
    return img

def make_fridge():
    w,h=104,180; img=im(w,h); d=draw_scaled(img)
    img.alpha_composite(shadow_layer(w,h,[('rr',(15,18,92,173))]))
    rr(d,(14,12,92,172),12,'#f0eee6','#8a928e',2)
    line(d,[(16,91),(90,91)],'#aab2ad',2)
    rr(d,(72,36,78,76),3,'#7f8984')
    rr(d,(72,112,78,145),3,'#7f8984')
    return img

def make_counter(length=320, sink=False, stove=False):
    w,h=length,118; img=im(w,h); d=draw_scaled(img)
    img.alpha_composite(shadow_layer(w,h,[('rr',(8,42,w-8,110))]))
    rr(d,(8,36,w-8,110),9,'#73907b','#486756',2)
    rr(d,(4,26,w-4,51),7,'#d5b184','#916a45',2)
    for x in range(20,w-40,58):
        line(d,[(x,58),(x,104)],'#5c7868',1); ell(d,(x+38,78,x+44,84),'#d1c39b')
    if sink:
        rr(d,(w*0.34,30,w*0.62,49),5,'#8fa8a4','#516f6a',1)
        line(d,[(w*0.47,20),(w*0.47,34)],'#657976',4); line(d,[(w*0.47,20),(w*0.56,20)],'#657976',4)
    if stove:
        for cx in (w*0.32,w*0.46,w*0.61,w*0.75): ell(d,(cx-9,31,cx+9,48),'#313a36')
    return img

def make_wardrobe():
    w,h=145,190; img=im(w,h); d=draw_scaled(img)
    img.alpha_composite(shadow_layer(w,h,[('rr',(14,22,132,182))]))
    rr(d,(13,13,132,184),12,'#b98659','#74503a',2)
    line(d,[(72,17),(72,180)],'#8b5f43',2)
    ell(d,(61,92,67,98),'#e1c276'); ell(d,(78,92,84,98),'#e1c276')
    return img

def make_plant(size=110):
    img=im(size,size+28); d=draw_scaled(img)
    ell(d,(size*.30,size*.72,size*.70,size+10),'#a46d45','#704934',1)
    # stems/leaves
    for a in (-55,-28,0,28,55):
        x=size/2 + math.sin(math.radians(a))*22; y=size*.72 - math.cos(math.radians(a))*48
        line(d,[(size/2,size*.75),(x,y)],'#49684d',3)
        ell(d,(x-18,y-12,x+18,y+12),'#6f956b','#48664a',1)
    return img

def make_door(color='#315545'):
    w,h=116,190; img=im(w,h); d=draw_scaled(img)
    rr(d,(8,5,108,185),7,color,'#203d32',3)
    rr(d,(24,24,92,83),4,'#bcd1c7','#24463a',2)
    # window bars
    line(d,[(58,27),(58,80)],'#7e9c90',2); line(d,[(27,54),(89,54)],'#7e9c90',2)
    ell(d,(82,106,90,114),'#e3c36b')
    return img

def make_shower():
    w,h=150,190; img=im(w,h); d=draw_scaled(img)
    rr(d,(12,14,138,178),12,'#d9eeef88','#6f9da2',2)
    line(d,[(76,18),(76,46)],'#708887',5); ell(d,(62,38,90,56),'#8ca4a4')
    for i in range(7): line(d,[(62+i*4,56),(54+i*8,146)],'#9bcbd055',2)
    rr(d,(18,150,132,179),6,'#9fc9c9','#6f9da2',2)
    return img

def make_vanity():
    w,h=155,145; img=im(w,h); d=draw_scaled(img)
    rr(d,(28,12,127,82),18,'#dce8e5','#83a5a1',2)
    ell(d,(46,22,109,75),'#b9d5d7','#7a9b99',2)
    rr(d,(18,85,137,134),9,'#8bb0aa','#527872',2)
    rr(d,(28,78,127,97),5,'#f3efe3','#a39b88',1)
    line(d,[(78,67),(78,82)],'#687d79',4)
    return img

def make_bench():
    w,h=190,95; img=im(w,h); d=draw_scaled(img)
    img.alpha_composite(shadow_layer(w,h,[('ellipse',(12,59,178,90))]))
    rr(d,(16,25,174,49),6,'#b27847','#704729',2)
    rr(d,(20,52,170,69),5,'#a66d43','#704729',2)
    rr(d,(31,65,44,92),3,'#465652'); rr(d,(146,65,159,92),3,'#465652')
    return img

def make_bike():
    w,h=160,110; img=im(w,h); d=draw_scaled(img)
    for cx in (39,121): ell(d,(cx-27,50,cx+27,104),'#00000000','#3d4643',4)
    line(d,[(39,77),(77,49),(121,77),(78,77),(60,58),(95,58)],'#3f6f64',5)
    line(d,[(77,49),(72,35),(59,35)],'#3f6f64',4); line(d,[(95,58),(107,38),(119,38)],'#3f6f64',4)
    return img

def make_tree():
    w,h=210,260; img=im(w,h); d=draw_scaled(img)
    img.alpha_composite(shadow_layer(w,h,[('ellipse',(50,214,160,248))]))
    poly(d,[(91,120),(120,120),(130,230),(77,230)],'#76523a','#563b2c')
    # canopy clusters
    for cx,cy,r in [(105,73,58),(66,98,48),(143,102,52),(102,125,56),(151,63,39),(53,58,34)]:
        ell(d,(cx-r,cy-r,cx+r,cy+r),'#6f9165','#4e714e',2)
    for cx,cy in [(78,55),(133,70),(107,104),(59,112),(155,105)]: ell(d,(cx-17,cy-11,cx+17,cy+11),'#91ad7f')
    return img

def make_cafe_counter():
    w,h=460,170; img=im(w,h); d=draw_scaled(img)
    img.alpha_composite(shadow_layer(w,h,[('rr',(8,66,450,158))]))
    rr(d,(8,56,452,160),11,'#2f5545','#1e3f34',2)
    rr(d,(3,45,457,70),7,'#b0794f','#70472f',2)
    for x in range(28,440,80): line(d,[(x,72),(x,152)],'#426858',1)
    # espresso machine
    rr(d,(292,10,410,58),8,'#c9c5b8','#686b65',2)
    ell(d,(315,22,343,50),'#38413e'); ell(d,(359,22,387,50),'#38413e')
    line(d,[(329,56),(329,82)],'#797b74',4); line(d,[(373,56),(373,82)],'#797b74',4)
    # pastries dome
    rr(d,(60,18,177,54),16,'#f7f0dbcc','#887d6f',1)
    for x in (82,113,144): ell(d,(x-13,33,x+13,51),'#d5975d','#a66a3c',1)
    return img

def make_display():
    w,h=210,150; img=im(w,h); d=draw_scaled(img)
    rr(d,(10,15,200,138),10,'#8d5d3d','#583d2e',2)
    rr(d,(20,24,190,116),8,'#e9f3efaa','#869893',2)
    line(d,[(25,70),(185,70)],'#97aaa4',2)
    for x,y,c in [(55,45,'#d69b62'),(95,48,'#b97952'),(145,44,'#e0b171'),(60,91,'#c98156'),(116,94,'#dbad6c'),(160,92,'#b56f4a')]: ell(d,(x-16,y-10,x+16,y+10),c,'#8b5a3c',1)
    return img

def make_menu_board():
    w,h=170,205; img=im(w,h); d=draw_scaled(img)
    rr(d,(8,6,162,198),8,'#26332d','#7a5c3f',5)
    # glyph-like lines, not specification labels
    for y,l in [(42,92),(66,105),(92,72),(119,96),(145,84)]:
        rr(d,(32,y,32+l,y+5),2,'#e9dec4')
        ell(d,(22,y,26,y+4),'#e9dec4')
    rr(d,(49,18,121,25),3,'#e3c98d')
    return img

def make_lamp():
    w,h=70,130; img=im(w,h); d=draw_scaled(img)
    line(d,[(35,0),(35,45)],'#3f4945',3)
    poly(d,[(16,42),(54,42),(64,82),(6,82)],'#2d4d3f','#1f382f')
    ell(d,(12,70,58,117),'#f1c67355')
    ell(d,(24,64,46,86),'#efc169')
    return img

def make_bus_sign():
    w,h=110,230; img=im(w,h); d=draw_scaled(img)
    rr(d,(20,6,90,74),12,'#f1f0e8','#344640',3)
    rr(d,(31,17,79,63),8,'#2b5e52')
    # bus symbol abstraction
    rr(d,(39,26,71,51),5,'#f6edda'); ell(d,(42,50,50,58),'#263b34'); ell(d,(60,50,68,58),'#263b34')
    rr(d,(49,72,61,218),5,'#434e4a')
    return img

def make_keys():
    w,h=64,64; img=im(w,h); d=draw_scaled(img)
    ell(d,(8,8,38,38),'#e1c25d','#8f7434',2); ell(d,(16,16,30,30),'#00000000','#8f7434',2)
    line(d,[(33,33),(55,55)],'#d7b653',7); line(d,[(48,48),(54,42)],'#d7b653',5)
    return img

def make_backpack():
    w,h=96,110; img=im(w,h); d=draw_scaled(img)
    rr(d,(20,20,76,101),18,'#c88d43','#744a28',2)
    rr(d,(27,48,69,88),12,'#d6a15c','#744a28',2)
    line(d,[(33,26),(30,8),(46,3),(62,8),(64,26)],'#744a28',5)
    rr(d,(41,55,56,61),3,'#efd17c')
    return img

def make_coffee_cup():
    w,h=80,68; img=im(w,h); d=draw_scaled(img)
    rr(d,(15,20,56,58),8,'#f5efe2','#7b6654',2)
    ell(d,(50,28,72,50),'#00000000','#7b6654',4)
    ell(d,(19,20,52,29),'#5c3827')
    for x in (29,39,47): line(d,[(x,15),(x+4,7)],'#ffffff77',2)
    return img

def make_phone():
    w,h=48,78; img=im(w,h); d=draw_scaled(img); rr(d,(6,3,42,75),7,'#313b38','#1d2422',2); rr(d,(10,11,38,62),4,'#94b8b0'); ell(d,(21,66,27,72),'#73817d'); return img

def make_wallet():
    w,h=72,54; img=im(w,h); d=draw_scaled(img); rr(d,(6,8,66,48),8,'#76513c','#493225',2); rr(d,(41,20,66,37),5,'#895f45'); ell(d,(49,26,55,32),'#d1b367'); return img

def make_person_atlas():
    FW,FH=64,88
    frames=[]
    names=[]
    directions=['down','left','right','up']
    for direction in directions:
        # idle
        frames.append(draw_person(FW,FH,direction,0,False)); names.append(f'idle_{direction}')
        for i in range(8):
            frames.append(draw_person(FW,FH,direction,i,True)); names.append(f'walk_{direction}_{i}')
    poses=['sit_down','sit_left','lie_right','pick_down','pet_right','drink_down','wash_up','cook_up','talk_down','shower_down']
    for p in poses:
        direction = p.split('_')[-1] if p.split('_')[-1] in directions else 'down'
        frames.append(draw_person(FW,FH,direction,0,False,pose=p)); names.append('pose_'+p)
    cols=8; rows=math.ceil(len(frames)/cols)
    atlas=Image.new('RGBA',(FW*cols*S,FH*rows*S),(0,0,0,0))
    meta={"frames":{},"meta":{"app":"QUOTIDIANO art-source","version":"1","image":"protagonist.png","format":"RGBA8888","size":{"w":FW*cols,"h":FH*rows},"scale":"1"}}
    for idx,(fr,name) in enumerate(zip(frames,names)):
        x=(idx%cols)*FW; y=(idx//cols)*FH
        atlas.alpha_composite(fr,(x*S,y*S))
        meta['frames'][name]={"frame":{"x":x,"y":y,"w":FW,"h":FH},"rotated":False,"trimmed":False,"spriteSourceSize":{"x":0,"y":0,"w":FW,"h":FH},"sourceSize":{"w":FW,"h":FH}}
    return atlas,meta

def draw_person(w,h,direction,step=0,walking=False,pose=None,colors=None):
    img=im(w,h); d=draw_scaled(img)
    colors=colors or {'hair':'#202527','jacket':'#e7b83e','shirt':'#4d865c','pants':'#364047','skin':'#e6b28f','shoe':'#f0eee2','accent':'#d3a427'}
    bob=(1 if walking and step in (1,2,5,6) else 0)
    sway=(step%4-1.5)*1.2 if walking else 0
    cx=w/2
    if pose and pose.startswith('lie'):
        # horizontal compact pose
        ell(d,(8,43,58,72),'#00000025')
        rr(d,(17,32,49,59),12,colors['jacket'],'#6c5730',1)
        ell(d,(5,28,30,53),colors['skin'],'#7b5a49',1)
        # spiky hair
        poly(d,[(7,36),(4,25),(11,28),(14,17),(20,25),(27,17),(29,31),(24,35)],colors['hair'])
        rr(d,(43,38,60,48),5,colors['pants']); rr(d,(48,50,62,58),4,colors['shoe'])
        return img
    if pose and pose.startswith('sit'):
        # seated body
        ell(d,(19,68,49,82),'#00000022')
        body_y=36
        rr(d,(20,body_y,44,61),10,colors['jacket'],'#7a602d',1)
        rr(d,(25,39,39,57),5,colors['shirt'])
        ell(d,(21,14,43,38),colors['skin'],'#7c5d4f',1)
        draw_hair(d,cx,16,direction,colors['hair'])
        rr(d,(19,58,33,71),5,colors['pants']); rr(d,(32,58,47,71),5,colors['pants'])
        rr(d,(15,68,31,75),4,colors['shoe']); rr(d,(35,68,51,75),4,colors['shoe'])
        return img
    # shadow
    ell(d,(18,70+bob,46,82+bob),'#00000022')
    head_y=13+bob
    # legs
    leg_shift=0
    if walking:
        leg_shift=3*math.sin(step/8*math.tau)
    if direction in ('down','up'):
        rr(d,(23+leg_shift,55+bob,31+leg_shift,75+bob),4,colors['pants'])
        rr(d,(34-leg_shift,55+bob,42-leg_shift,75+bob),4,colors['pants'])
        rr(d,(19+leg_shift,71+bob,31+leg_shift,79+bob),4,colors['shoe'],'#9e9d91',1)
        rr(d,(34-leg_shift,71+bob,46-leg_shift,79+bob),4,colors['shoe'],'#9e9d91',1)
        rect(d,(23+leg_shift,75+bob,29+leg_shift,78+bob),colors['accent']); rect(d,(36-leg_shift,75+bob,42-leg_shift,78+bob),colors['accent'])
    else:
        front=direction=='right'
        rr(d,(27,56+bob,36,76+bob),4,colors['pants']); rr(d,(35+sway,58+bob,43+sway,76+bob),4,colors['pants'])
        rr(d,(24,72+bob,38,80+bob),4,colors['shoe'],'#9e9d91',1); rr(d,(35+sway,72+bob,49+sway,80+bob),4,colors['shoe'],'#9e9d91',1)
    # torso
    rr(d,(19+sway*.15,34+bob,46+sway*.15,61+bob),10,colors['jacket'],'#8a6d31',1)
    rr(d,(26,38+bob,39,58+bob),5,colors['shirt'])
    # jacket lapels
    line(d,[(24,37+bob),(29,48+bob)],'#f2cf6b',2); line(d,[(42,37+bob),(37,48+bob)],'#f2cf6b',2)
    # arms
    arm=4*math.sin(step/8*math.tau) if walking else 0
    if pose=='pose_pick_down': arm=10
    rr(d,(14,39+bob+arm*.2,22,60+bob+arm),4,colors['jacket'])
    rr(d,(44,39+bob-arm*.2,52,60+bob-arm),4,colors['jacket'])
    ell(d,(14,56+bob+arm,22,64+bob+arm),colors['skin']); ell(d,(44,56+bob-arm,52,64+bob-arm),colors['skin'])
    # head
    ell(d,(20,head_y,45,39+bob),colors['skin'],'#78594b',1)
    draw_hair(d,cx,head_y+2,direction,colors['hair'])
    # face depending direction
    if direction=='down':
        ell(d,(27,27+bob,30,30+bob),'#2a2d2c'); ell(d,(36,27+bob,39,30+bob),'#2a2d2c')
        line(d,[(31,34+bob),(35,34+bob)],'#a76f5f',1)
    elif direction=='left': ell(d,(24,27+bob,27,30+bob),'#2a2d2c')
    elif direction=='right': ell(d,(38,27+bob,41,30+bob),'#2a2d2c')
    # pose hints
    if pose=='pose_drink_down':
        rr(d,(42,45,56,57),4,'#f5efe2','#7b6654',1)
    if pose=='pose_pet_right':
        line(d,[(49,58),(59,69)],colors['skin'],5)
    if pose in ('pose_wash_up','pose_cook_up','pose_shower_down'):
        # hands forward or steam
        if pose=='pose_shower_down':
            for x in (24,33,42): line(d,[(x,5),(x-4,20)],'#bde0e377',2)
    return img

def draw_hair(d,cx,y,direction,color):
    if direction=='up':
        poly(d,[(cx-14,y+15),(cx-15,y+3),(cx-10,y+6),(cx-8,y-4),(cx-2,y+3),(cx+4,y-6),(cx+7,y+3),(cx+13,y-2),(cx+14,y+16)],color)
    else:
        poly(d,[(cx-13,y+14),(cx-15,y+2),(cx-10,y+5),(cx-8,y-5),(cx-2,y+2),(cx+4,y-7),(cx+6,y+3),(cx+13,y-2),(cx+14,y+14),(cx+7,y+9),(cx,y+12),(cx-6,y+8)],color)

def make_npc_atlas():
    chars={
        'pieter':{'hair':'#d1d1c6','jacket':'#60706b','shirt':'#8d765d','pants':'#434a4b','skin':'#deb190','shoe':'#4a4c47','accent':'#8f6f3a'},
        'lotte':{'hair':'#a46a45','jacket':'#7f9db2','shirt':'#ead9bd','pants':'#45566a','skin':'#e5b18f','shoe':'#f0ece0','accent':'#c29548'},
        'sanne':{'hair':'#7b4d35','jacket':'#d0a56f','shirt':'#e8e0cf','pants':'#46544e','skin':'#e3b08c','shoe':'#423d38','accent':'#335b49'},
        'customer':{'hair':'#353536','jacket':'#8a6f8b','shirt':'#d8c9a8','pants':'#3f4652','skin':'#c88e6f','shoe':'#efe9dc','accent':'#836f3f'}
    }
    FW,FH=64,88; cols=8; frames=[]; names=[]
    for cname,col in chars.items():
        for direction in ['down','left','right','up']:
            fr=draw_person(FW,FH,direction,0,False,colors=col)
            # distinctives
            dd=draw_scaled(fr)
            if cname=='pieter':
                # glasses
                ell(dd,(24,27,31,33),'#00000000','#4d4f4d',1); ell(dd,(34,27,41,33),'#00000000','#4d4f4d',1); line(dd,[(31,30),(34,30)],'#4d4f4d',1)
            if cname=='sanne':
                rr(dd,(23,45,42,65),3,'#315546aa'); line(dd,[(25,43),(22,58)],'#315546',2); line(dd,[(40,43),(44,58)],'#315546',2)
            frames.append(fr); names.append(f'{cname}_{direction}')
    rows=math.ceil(len(frames)/cols); atlas=Image.new('RGBA',(FW*cols*S,FH*rows*S),(0,0,0,0)); meta={"frames":{},"meta":{"image":"npcs.png","size":{"w":FW*cols,"h":FH*rows},"scale":"1"}}
    for idx,(fr,name) in enumerate(zip(frames,names)):
        x=(idx%cols)*FW; y=(idx//cols)*FH; atlas.alpha_composite(fr,(x*S,y*S)); meta['frames'][name]={"frame":{"x":x,"y":y,"w":FW,"h":FH},"rotated":False,"trimmed":False,"spriteSourceSize":{"x":0,"y":0,"w":FW,"h":FH},"sourceSize":{"w":FW,"h":FH}}
    return atlas,meta

def make_dog_atlas():
    FW,FH=64,58; frames=[]; names=[]
    for state in ['idle','happy']:
        for direction in ['down','left','right','up']:
            img=im(FW,FH); d=draw_scaled(img)
            ell(d,(17,38,48,52),'#00000022')
            rr(d,(17,24,49,45),10,'#c8945f','#745236',1)
            if direction=='right': head=(39,14,58,34)
            elif direction=='left': head=(6,14,25,34)
            else: head=(22,10,44,32)
            ell(d,head,'#d3a06a','#745236',1)
            # ears
            if direction!='up':
                ell(d,(head[0]-3,head[1]+4,head[0]+7,head[1]+18),'#7d5738'); ell(d,(head[2]-7,head[1]+4,head[2]+3,head[1]+18),'#7d5738')
            # legs
            for x in (21,40): rr(d,(x,40,x+6,52),3,'#b98050')
            # tail
            if state=='happy': line(d,[(17,29),(7,20),(13,13)],'#b98050',5)
            else: line(d,[(17,30),(8,31)],'#b98050',5)
            if direction=='down': ell(d,(27,18,30,21),'#2a2b29'); ell(d,(36,18,39,21),'#2a2b29'); ell(d,(31,24,35,28),'#37291f')
            frames.append(img); names.append(f'{state}_{direction}')
    cols=4; rows=2; atlas=Image.new('RGBA',(FW*cols*S,FH*rows*S),(0,0,0,0)); meta={"frames":{},"meta":{"image":"pip.png","size":{"w":FW*cols,"h":FH*rows},"scale":"1"}}
    for i,(fr,n) in enumerate(zip(frames,names)):
        x=(i%cols)*FW; y=(i//cols)*FH; atlas.alpha_composite(fr,(x*S,y*S)); meta['frames'][n]={"frame":{"x":x,"y":y,"w":FW,"h":FH},"rotated":False,"trimmed":False,"spriteSourceSize":{"x":0,"y":0,"w":FW,"h":FH},"sourceSize":{"w":FW,"h":FH}}
    return atlas,meta

# ---------- scene art ----------
def home_layers():
    W,H=1600,1000
    floor=im(W,H,PALETTE['cream']); d=draw_scaled(floor)
    # central house shell
    rr(d,(105,75,1495,925),28,'#eadfcb','#b9a98f',3)
    # room floors
    # bedroom
    wf=wood_floor(480,390); floor.alpha_composite(wf,(sc(135),sc(120)))
    # living
    wf=wood_floor(590,390,'#d2a576'); floor.alpha_composite(wf,(sc(630),sc(120)))
    # kitchen/dining
    wf=wood_floor(560,335,'#cfa170'); floor.alpha_composite(wf,(sc(740),sc(540)))
    # bath
    tf=tile_floor(360,335); floor.alpha_composite(tf,(sc(135),sc(540)))
    # hall
    wf=wood_floor(210,335,'#c79567'); floor.alpha_composite(wf,(sc(510),sc(540)))
    # room separators / back walls
    walls=im(W,H); d2=draw_scaled(walls)
    wall='#f4ead7'; edge='#b9a98f'
    # back walls around shell and room dividers
    rr(d2,(110,80,1490,118),10,wall,edge,2)
    rr(d2,(110,80,148,920),10,wall,edge,2); rr(d2,(1452,80,1490,920),10,wall,edge,2)
    rect(d2,(600,115,638,510),wall,edge,2)
    rect(d2,(1250,115,1288,510),wall,edge,2)
    rect(d2,(130,505,1490,543),wall,edge,2)
    rect(d2,(495,538,533,900),wall,edge,2); rect(d2,(720,538,758,900),wall,edge,2)
    # gaps in dividers with overpaint floor-colored approximate openings
    # windows
    for x,y,w in [(240,92,160),(870,92,190),(1320,92,110)]:
        rr(d2,(x,y,x+w,y+52),8,'#b7d7d6','#718b88',2); line(d2,[(x+w/2,y+4),(x+w/2,y+48)],'#e9f4f1',2)
    # room labels as tiny decorative plaques only in source art? skip labels
    fg=im(W,H); d3=draw_scaled(fg)
    # front wall segments for occlusion around lower shell
    rr(d3,(110,900,1490,935),10,'#d7cbb5','#a79983',2)
    # small rugs and decorations built into base, not interactives
    rr(d,(265,340,485,455),24,'#d9c6a9','#bdab8d',1)
    rr(d,(770,350,1110,470),26,'#c5b28f','#a29277',1)
    rr(d,(810,705,1145,840),22,'#dbc8a4','#bba27a',1)
    return floor,walls,fg

def street_layers():
    W,H=2400,1000
    base=im(W,H,'#dce8cf'); d=draw_scaled(base)
    # gardens and sidewalk/road
    rect(d,(0,0,W,250),'#b7c99f')
    rect(d,(0,250,W,370),'#c7c2b5')
    rect(d,(0,370,W,680),'#6f7472')
    rect(d,(0,680,W,800),'#c7c2b5')
    rect(d,(0,800,W,H),'#b7c99f')
    # sidewalk pavers
    for y0,y1 in [(250,370),(680,800)]:
        for x in range(0,W,44): line(d,[(x,y0),(x,y1)],'#afa99c',1)
        for y in range(y0,y1,34): line(d,[(0,y),(W,y)],'#afa99c',1)
    # road dash + bike lane red strips
    rect(d,(0,370,W,404),'#a35c4f'); rect(d,(0,646,W,680),'#a35c4f')
    for x in range(0,W,120): rect(d,(x+20,519,x+72,526),'#dddccf')
    # crosswalk around x=1120
    for i in range(7): rect(d,(1080+i*32,420,1098+i*32,630),'#eeeadd')
    # flower dots in gardens
    for _ in range(80):
        x=random.randint(0,W-1); y=random.choice([random.randint(50,230),random.randint(820,970)])
        ell(d,(x-3,y-3,x+3,y+3),random.choice(['#e2b268','#d8908b','#f1e2b8','#a785b1']))
    bg=im(W,H); d2=draw_scaled(bg)
    # row houses at top and cafe at right
    house_specs=[(70,65,330,'#a65e4c'),(390,75,640,'#c88768'),(700,45,990,'#ad6a55'),(1510,70,1790,'#b36a52')]
    for x0,y0,x1,c in house_specs:
        h=180; brick_pattern(d2,x0,y0,x1,y0+h,c,'#c98972')
        # roof
        poly(d2,[(x0-10,y0),(x0+55,y0-68),(x1-60,y0-68),(x1+10,y0)],'#52584f','#333c36')
        # windows and doors
        for wx in range(x0+30,x1-60,82): rr(d2,(wx,y0+42,wx+48,y0+98),4,'#bcd5d2','#536c67',2)
        rr(d2,(x0+28,y0+112,x0+83,y0+h),5,'#365d50','#244439',2)
    # cafe facade
    x0,y0,x1=1880,40,2350; brick_pattern(d2,x0,y0,x1,250,'#8d5242','#bf8068')
    poly(d2,[(1860,40),(1910,-30),(2320,-30),(2370,40)],'#314a40','#21362f')
    rr(d2,(1925,95,2295,225),6,'#375c4b','#213f34',3)
    for wx in (1955,2080,2205): rr(d2,(wx,114,wx+78,190),6,'#b6d0cc','#45665f',2)
    # cafe awning
    poly(d2,[(1912,88),(2310,88),(2285,120),(1935,120)],'#e6c77b','#715b3c')
    fg=im(W,H); # trees handled separate as props
    return base,bg,fg

def cafe_layers():
    W,H=1500,950
    base=im(W,H,'#efe3cf'); d=draw_scaled(base)
    rr(d,(95,70,1405,890),26,'#e5d7bf','#a58e72',3)
    wf=wood_floor(1260,750,'#bd8a5e'); base.alpha_composite(wf,(sc(120),sc(110)))
    walls=im(W,H); d2=draw_scaled(walls)
    rr(d2,(100,75,1400,118),10,'#244a3d','#17372e',2)
    rr(d2,(100,75,143,885),10,'#efe3cf','#aa957b',2); rr(d2,(1357,75,1400,885),10,'#efe3cf','#aa957b',2)
    # windows
    for x in (220,410,1120): rr(d2,(x,86,x+140,170),7,'#bcd5d0','#45655d',2)
    # deep green accent wall behind counter
    rr(d2,(690,115,1350,320),8,'#315746','#214033',2)
    # shelves
    for y in (180,245): line(d2,[(760,y),(1280,y)],'#b07b50',7)
    for x,y in [(800,150),(875,150),(955,150),(1030,150),(1130,150),(1210,150)]: ell(d2,(x,y,x+18,y+24),'#d0b68b','#7f694d',1)
    fg=im(W,H); d3=draw_scaled(fg); rr(d3,(100,860,1400,900),10,'#d4c3a8','#a58e72',2)
    # rugs
    rr(d,(250,530,580,720),28,'#c3aa7d','#997d55',1); rr(d,(850,520,1180,720),28,'#c3aa7d','#997d55',1)
    return base,walls,fg

def gen_wav(path, kind):
    sr=22050
    dur={'step':0.12,'door':0.35,'pickup':0.18,'sit':0.18,'coffee':0.7,'payment':0.22,'ambient_home':5.0,'ambient_street':5.0,'ambient_cafe':5.0}[kind]
    n=int(sr*dur); samples=[]
    for i in range(n):
        t=i/sr
        if kind=='step':
            env=max(0,1-t/dur); v=math.sin(2*math.pi*110*t)*0.12*env + (random.random()*2-1)*0.04*env
        elif kind=='door':
            env=max(0,1-t/dur); v=(random.random()*2-1)*0.12*env + math.sin(2*math.pi*(80+150*t)*t)*0.08*env
        elif kind=='pickup':
            env=max(0,1-t/dur); v=math.sin(2*math.pi*(500+900*t)*t)*0.14*env
        elif kind=='sit':
            env=max(0,1-t/dur); v=math.sin(2*math.pi*90*t)*0.1*env
        elif kind=='coffee':
            env=max(0,1-t/dur); v=(random.random()*2-1)*0.05*env + math.sin(2*math.pi*160*t)*0.025
        elif kind=='payment':
            env=max(0,1-t/dur); v=(math.sin(2*math.pi*800*t)+math.sin(2*math.pi*1200*t))*0.07*env
        elif kind=='ambient_home':
            v=(math.sin(2*math.pi*45*t)*0.008 + math.sin(2*math.pi*90*t)*0.004 + (random.random()*2-1)*0.003)
        elif kind=='ambient_street':
            v=(math.sin(2*math.pi*220*t)*0.002 + (random.random()*2-1)*0.009 + math.sin(2*math.pi*1.2*t)*0.005)
        else:
            v=((random.random()*2-1)*0.006 + math.sin(2*math.pi*70*t)*0.006 + math.sin(2*math.pi*240*t)*0.002)
        samples.append(max(-1,min(1,v)))
    path.parent.mkdir(parents=True,exist_ok=True)
    with wave.open(str(path),'w') as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(sr)
        wf.writeframes(b''.join(struct.pack('<h',int(v*32767)) for v in samples))


def main():
    # home layers
    floor,walls,fg=home_layers(); save(floor,ASSETS/'home'/'base_floor.png'); save(walls,ASSETS/'home'/'walls_back.png'); save(fg,ASSETS/'home'/'foreground.png')
    # props
    props={
        'bed':make_bed(),'sofa':make_sofa(),'coffee_table':make_table(),'dining_table':make_table(True),'chair':make_chair(),
        'fridge':make_fridge(),'kitchen_counter':make_counter(360,True,True),'wardrobe':make_wardrobe(),'plant':make_plant(),
        'door':make_door(),'shower':make_shower(),'vanity':make_vanity(),'keys':make_keys(),'backpack':make_backpack(),
        'phone':make_phone(),'wallet':make_wallet(),'coffee_cup':make_coffee_cup()
    }
    for name,obj in props.items(): save(obj,ASSETS/'home'/f'{name}.png')
    # street
    base,bg,sfg=street_layers(); save(base,ASSETS/'street'/'base_ground.png'); save(bg,ASSETS/'street'/'buildings_back.png'); save(sfg,ASSETS/'street'/'foreground.png')
    for name,obj in {'bench':make_bench(),'bike':make_bike(),'tree':make_tree(),'bus_sign':make_bus_sign(),'cafe_door':make_door('#314f42')}.items(): save(obj,ASSETS/'street'/f'{name}.png')
    # cafe
    base,cw,cfg=cafe_layers(); save(base,ASSETS/'cafe'/'base_floor.png'); save(cw,ASSETS/'cafe'/'walls_back.png'); save(cfg,ASSETS/'cafe'/'foreground.png')
    for name,obj in {'counter':make_cafe_counter(),'display':make_display(),'menu_board':make_menu_board(),'table':make_table(True),'chair':make_chair(),'plant':make_plant(),'lamp':make_lamp(),'coffee_cup':make_coffee_cup(),'door':make_door('#315545')}.items(): save(obj,ASSETS/'cafe'/f'{name}.png')
    # protagonist atlas
    atlas,meta=make_person_atlas(); save(atlas,ASSETS/'characters'/'protagonist.png'); (ASSETS/'characters'/'protagonist.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf8')
    natlas,nmeta=make_npc_atlas(); save(natlas,ASSETS/'npc'/'npcs.png'); (ASSETS/'npc'/'npcs.json').write_text(json.dumps(nmeta,ensure_ascii=False,indent=2),encoding='utf8')
    datlas,dmeta=make_dog_atlas(); save(datlas,ASSETS/'npc'/'pip.png'); (ASSETS/'npc'/'pip.json').write_text(json.dumps(dmeta,ensure_ascii=False,indent=2),encoding='utf8')
    # audio
    for k in ['step','door','pickup','sit','coffee','payment','ambient_home','ambient_street','ambient_cafe']:
        gen_wav(ASSETS/'audio'/f'{k}.wav',k)
    # source manifest
    (ROOT/'art-source'/'README.md').write_text('''# Arte original gerada\n\nOs PNGs e WAVs desta entrega são gerados por `generate_assets.py` a partir de formas vetoriais rasterizadas em alta resolução e síntese procedural simples. As concept arts e a spritesheet mencionadas no briefing não estavam anexadas nesta conversa; por isso estes assets são uma direção visual original provisória, não uma reprodução das referências ausentes.\n''',encoding='utf8')
    print('assets generated')

if __name__=='__main__': main()

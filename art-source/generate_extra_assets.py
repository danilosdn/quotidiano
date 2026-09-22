from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
A=ROOT/'public/assets/home'
S=2

def sc(v): return int(v*S)
def bx(t): return tuple(sc(v) for v in t)
def save(img,p): img.resize((img.width//S,img.height//S),Image.Resampling.LANCZOS).save(p,optimize=True)
# fridge open
im=Image.new('RGBA',(144*S,180*S),(0,0,0,0)); d=ImageDraw.Draw(im)
d.rounded_rectangle(bx((12,12,78,172)),radius=sc(10),fill='#e9ede8',outline='#818b86',width=sc(2))
d.rectangle(bx((22,24,67,155)),fill='#c9d9d3',outline='#8aa19a',width=sc(2))
for y in (62,102,138): d.line([(sc(23),sc(y)),(sc(66),sc(y))],fill='#8aa19a',width=sc(2))
d.ellipse(bx((31,42,43,54)),fill='#d2a865'); d.rounded_rectangle(bx((48,78,61,99)),radius=sc(3),fill='#8cae71'); d.ellipse(bx((30,116,45,130)),fill='#d68466')
# door swung open on right
d.rounded_rectangle(bx((83,14,137,168)),radius=sc(7),fill='#f3f1e9',outline='#89918d',width=sc(2)); d.line([(sc(84),sc(20)),(sc(84),sc(164))],fill='#6e7b75',width=sc(3))
save(im,A/'fridge_open.png')
# wardrobe open
im=Image.new('RGBA',(190*S,190*S),(0,0,0,0)); d=ImageDraw.Draw(im)
d.rounded_rectangle(bx((14,13,116,184)),radius=sc(10),fill='#8f674b',outline='#704b35',width=sc(2)); d.rectangle(bx((28,24,102,174)),fill='#6d5848')
for y,c in [(55,'#e6ba43'),(91,'#5b855f'),(128,'#3c4951')]: d.rounded_rectangle(bx((38,y,91,y+25)),radius=sc(5),fill=c)
# open door panel
d.polygon([(sc(118),sc(20)),(sc(178),sc(8)),(sc(178),sc(181)),(sc(118),sc(173))],fill='#bd8b61',outline='#704b35')
d.ellipse(bx((128,93,135,100)),fill='#e1c276')
save(im,A/'wardrobe_open.png')
# door open
im=Image.new('RGBA',(150*S,190*S),(0,0,0,0)); d=ImageDraw.Draw(im)
d.rounded_rectangle(bx((8,5,82,185)),radius=sc(7),fill='#e9dfcc',outline='#715f4d',width=sc(3)); d.rectangle(bx((24,24,72,175)),fill='#263b33')
d.polygon([(82*S,10*S),(142*S,22*S),(142*S,177*S),(82*S,185*S)],fill='#315545',outline='#203d32')
d.ellipse(bx((91,103,99,111)),fill='#e3c36b')
save(im,A/'door_open.png')
print('extra assets generated')
# punch functional doorway openings in the independently-rendered wall layer
walls=A/'walls_back.png'
img=Image.open(walls).convert('RGBA'); d=ImageDraw.Draw(img)
for r in [(594,342,644,454),(598,500,710,550),(948,500,1088,550),(488,675,540,790),(710,690,770,805)]:
    d.rectangle(r,fill=(0,0,0,0))
img.save(walls,optimize=True)
# cafe waste bin
C=ROOT/'public/assets/cafe'
im=Image.new('RGBA',(72*S,92*S),(0,0,0,0)); d=ImageDraw.Draw(im)
d.rounded_rectangle(bx((12,22,60,86)),radius=sc(8),fill='#4e6259',outline='#2e4239',width=sc(2)); d.rounded_rectangle(bx((8,14,64,30)),radius=sc(6),fill='#33483f',outline='#263a32',width=sc(2)); d.rectangle(bx((22,37,50,42)),fill='#6e8178'); save(im,C/'bin.png')

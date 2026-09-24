const FRAME_SIZE=48, COLUMNS=56, ROWS=41, TOTAL=COLUMNS*ROWS;
const animations={
  'idle · rechts':[168], 'idle · boven':[174], 'idle · links':[180], 'idle · onder':[186],
  'lopen · rechts':[280,281,282,283,284,285], 'lopen · boven':[286,287,288,289,290,291],
  'lopen · links':[292,293,294,295,296,297], 'lopen · onder':[298,299,300,301,302,303],
  'zitten · links':[504], 'zitten · rechts':[510], 'liggen':[448,449,450,451,452,453],
  'telefoon':[728,729,730,731,732,733,734,735,736,737,738,739],
  'lezen':[840,841,842,843,844,845,846,847,848,849,850,851],
  'gebruiken · rechts':[1176,1177,1178,1179,1180,1181], 'gebruiken · links':[1180,1181,1182,1183,1184,1185],
  'gebruiken · boven':[1186,1187,1188,1189,1190,1191], 'gebruiken · onder':[1196,1197,1198,1199],
  'eten · rechts':[1288,1289,1290,1291,1292,1293], 'eten · links':[1296,1297,1298,1299,1300,1301],
  'eten · boven':[1302,1303,1304,1305,1306,1307], 'eten · onder':[1316,1317,1318,1319]
};
const $=(selector)=>document.querySelector(selector);
const preview=$('#preview'),ctx=preview.getContext('2d'); ctx.imageSmoothingEnabled=false;
const atlasCanvas=$('#atlas'),atlasCtx=atlasCanvas.getContext('2d'); atlasCtx.imageSmoothingEnabled=false;
const image=new Image(); image.src='/assets/runtime/characters/player_quotidiano.png';
let frame=168,sequence=animations['idle · rechts'],sequenceIndex=0,timer=null;

function source(frameIndex){return {x:(frameIndex%COLUMNS)*FRAME_SIZE,y:Math.floor(frameIndex/COLUMNS)*FRAME_SIZE};}
function drawFrame(target,targetCtx,frameIndex,scale=8,alpha=1,offset=0){
  const {x,y}=source(frameIndex); targetCtx.save(); targetCtx.globalAlpha=alpha; targetCtx.imageSmoothingEnabled=false;
  targetCtx.drawImage(image,x,y,FRAME_SIZE,FRAME_SIZE,offset,offset,FRAME_SIZE*scale,FRAME_SIZE*scale); targetCtx.restore();
}
function render(){
  frame=Math.max(0,Math.min(TOTAL-1,Number(frame)||0)); $('#frame').value=String(frame);
  ctx.clearRect(0,0,preview.width,preview.height);
  if($('#onion').checked){drawFrame(preview,ctx,Math.max(0,frame-1),8,.18,-18);drawFrame(preview,ctx,Math.min(TOTAL-1,frame+1),8,.18,18);}
  drawFrame(preview,ctx,frame,8,1,0);
  if($('#grid').checked){ctx.strokeStyle='#48ddaa';ctx.lineWidth=2;ctx.strokeRect(1,1,382,382);ctx.beginPath();ctx.moveTo(192,0);ctx.lineTo(192,384);ctx.moveTo(0,336);ctx.lineTo(384,336);ctx.stroke();}
  $('#frame-label').textContent=`frame ${frame}`; $('#coordinate-label').textContent=`linha ${Math.floor(frame/COLUMNS)} · coluna ${frame%COLUMNS}`;
  document.querySelectorAll('.sequence-frame').forEach((element)=>element.classList.toggle('active',Number(element.dataset.frame)===frame));
}
function renderSequence(){
  const target=$('#sequence');target.innerHTML='';
  for(const value of sequence){const card=document.createElement('button');card.className='sequence-frame';card.dataset.frame=String(value);const canvas=document.createElement('canvas');canvas.width=96;canvas.height=96;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;drawFrame(canvas,c,value,2,1,0);const label=document.createElement('span');label.textContent=String(value);card.append(canvas,label);card.addEventListener('click',()=>{frame=value;sequenceIndex=sequence.indexOf(value);render();});target.append(card);}
  render();
}
function stop(){if(timer){clearInterval(timer);timer=null;}$('#play').textContent='reproduzir';}
function play(){if(timer){stop();return;}const fps=Number($('#fps').value);timer=setInterval(()=>{sequenceIndex=(sequenceIndex+1)%sequence.length;frame=sequence[sequenceIndex];render();},1000/fps);$('#play').textContent='pausar';}
function renderAtlas(){atlasCanvas.width=image.width;atlasCanvas.height=image.height;atlasCtx.drawImage(image,0,0);atlasCtx.strokeStyle='#0ff8';atlasCtx.lineWidth=1;for(let x=0;x<=image.width;x+=FRAME_SIZE){atlasCtx.beginPath();atlasCtx.moveTo(x,0);atlasCtx.lineTo(x,image.height);atlasCtx.stroke();}for(let y=0;y<=image.height;y+=FRAME_SIZE){atlasCtx.beginPath();atlasCtx.moveTo(0,y);atlasCtx.lineTo(image.width,y);atlasCtx.stroke();}}
image.addEventListener('load',()=>{const select=$('#animation');for(const name of Object.keys(animations)){const option=document.createElement('option');option.value=name;option.textContent=name;select.append(option);}renderSequence();renderAtlas();});
$('#animation').addEventListener('change',(event)=>{stop();sequence=animations[event.target.value];sequenceIndex=0;frame=sequence[0];renderSequence();});
$('#frame').addEventListener('input',(event)=>{stop();frame=Number(event.target.value);render();});
$('#previous').addEventListener('click',()=>{stop();frame=Math.max(0,frame-1);render();});$('#next').addEventListener('click',()=>{stop();frame=Math.min(TOTAL-1,frame+1);render();});
$('#play').addEventListener('click',play);$('#fps').addEventListener('input',(event)=>{$('#fps-output').textContent=`${event.target.value} fps`;if(timer){stop();play();}});
$('#onion').addEventListener('change',render);$('#grid').addEventListener('change',render);$('#open-atlas').addEventListener('click',()=>$('#atlas-card').classList.toggle('hidden'));

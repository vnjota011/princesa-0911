
(()=>{
const root=document.getElementById('sleep-scene'),canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d');
const princess=new Image();
const wake=new Image();wake.src="assets/despertar.webp";
let awakening=false,awakenTime=0,finished=false;
window.startAwakening=()=>{awakening=true;awakenTime=t;};
const font={
'0':['01110','11011','11011','11011','11011','11011','01110'],
'9':['01110','11011','11011','01111','00011','00110','11100'],
'1':['00100','01100','00100','00100','00100','00100','01110'],
'/':['00001','00011','00010','00100','01000','11000','10000'],
'E':['11111','10000','10000','11110','10000','10000','11111'],
'M':['10001','11011','10101','10101','10001','10001','10001'],
'B':['11110','10001','10001','11110','10001','10001','11110'],
'R':['11110','10001','10001','11110','10100','10010','10001'],
'V':['10001','10001','10001','10001','10001','01010','00100'],
' ':['00000','00000','00000','00000','00000','00000','00000']};
let t=0,last=0,ready=false;
const randomBetween=(min,max)=>min+Math.random()*(max-min);
const flies=Array.from({length:24},()=>({
 x:randomBetween(25,743),y:randomBetween(28,416),
 heading:randomBetween(0,Math.PI*2),turn:0,targetTurn:0,
 speed:randomBetween(4,13),targetSpeed:randomBetween(4,13),
 decision:randomBetween(.1,2.8),
 glowPhase:randomBetween(0,Math.PI*2),glowRate:randomBetween(.65,1.65)
}));
function moveFlies(dt){
 for(const f of flies){
  f.decision-=dt;
  if(f.decision<=0){
   f.decision=randomBetween(.8,3.4);
   f.targetTurn=randomBetween(-1.25,1.25);
   f.targetSpeed=Math.random()<.23?randomBetween(.5,2):randomBetween(5,16);
  }
  const ease=1-Math.exp(-dt*1.5);
  f.turn+=(f.targetTurn-f.turn)*ease;
  f.speed+=(f.targetSpeed-f.speed)*ease;
  f.heading+=f.turn*dt;
  // Gently steer away from the edges, without bouncing or teleporting.
  let steerX=0,steerY=0;
  if(f.x<75)steerX+=(75-f.x)/50;
  if(f.x>693)steerX-=(f.x-693)/50;
  if(f.y<65)steerY+=(65-f.y)/40;
  if(f.y>385)steerY-=(f.y-385)/40;
  if(steerX||steerY){
   const desired=Math.atan2(steerY,steerX);
   const delta=Math.atan2(Math.sin(desired-f.heading),Math.cos(desired-f.heading));
   f.heading+=delta*(1-Math.exp(-dt*Math.hypot(steerX,steerY)*2));
  }
  f.x+=Math.cos(f.heading)*f.speed*dt;
  f.y+=Math.sin(f.heading)*f.speed*dt;
  f.glowPhase+=f.glowRate*dt;
 }
}
function lettering(text,y,scale,gap,palette){const w=text.length*(5*scale+gap)-gap;let x=Math.round((768-w)/2);for(const ch of text){const rows=font[ch];rows.forEach((row,j)=>{for(let i=0;i<5;i++)if(row[i]==='1'){ctx.fillStyle='#5c3c1d';ctx.fillRect(x+i*scale+1,y+j*scale+3,scale,scale);ctx.fillStyle=palette[j%palette.length];ctx.fillRect(x+i*scale,y+j*scale,scale,scale)}});x+=5*scale+gap}}
function render(){
ctx.imageSmoothingEnabled=false;ctx.fillStyle='#030405';ctx.fillRect(0,0,768,480);
// Warm overhead light fades at the edges and meets the ground beneath her.
const beam=ctx.createLinearGradient(0,0,0,407);beam.addColorStop(0,'rgba(255,230,169,.015)');beam.addColorStop(.6,'rgba(255,221,151,.055)');beam.addColorStop(1,'rgba(255,220,143,.13)');
ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(328,0);ctx.lineTo(440,0);ctx.lineTo(627,401);ctx.bezierCurveTo(627,447,141,447,141,401);ctx.closePath();ctx.fill();
ctx.save();ctx.translate(384,401);ctx.scale(1,.19);
const pool=ctx.createRadialGradient(0,0,25,0,0,255);pool.addColorStop(0,'rgba(224,179,106,.42)');pool.addColorStop(.45,'rgba(214,168,92,.30)');pool.addColorStop(.78,'rgba(199,152,78,.12)');pool.addColorStop(1,'rgba(199,152,78,0)');ctx.fillStyle=pool;ctx.fillRect(-260,-260,520,520);ctx.restore();
// Quiet pixel stone joints reveal a floor plane without lighting the whole room.
ctx.save();ctx.beginPath();ctx.ellipse(384,402,222,35,0,0,Math.PI*2);ctx.clip();
ctx.fillStyle='#100f0aaa';for(const y of [380,390,404,423])ctx.fillRect(160,y,450,1);
for(const [x,y,h] of [[190,380,10],[280,380,10],[390,380,10],[498,380,10],[240,391,13],[345,391,13],[452,391,13],[560,391,13],[180,405,18],[300,405,18],[430,405,18],[560,405,18],[245,424,14],[390,424,14],[535,424,14]])ctx.fillRect(x,y,1,h);
ctx.restore();
// Broad cast shadow plus a tight contact shadow immediately beneath the mat.
ctx.fillStyle='#06050688';ctx.beginPath();ctx.ellipse(387,404,184,13,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#080408cc';ctx.beginPath();ctx.ellipse(384,399,165,6,0,0,Math.PI*2);ctx.fill();
lettering('09/11',119,8,9,['#fff0b9','#ffe1a0','#f2ca70','#d7ac50','#d7ac50','#b88836','#f4d486']);
if(!window.birthdayUnlocked)for(let i=0;i<3;i++){const active=(Math.floor(t/.55)%4)>i;ctx.fillStyle=active?'#efd79a':'#544728';ctx.fillRect(367+i*15,191,5,5)}
for(const f of flies){const x=f.x,y=f.y;const a=.12+.86*Math.pow((Math.sin(f.glowPhase)+1)/2,2);ctx.fillStyle=`rgba(193,209,79,${a*.035})`;ctx.fillRect(x-6,y-6,13,13);ctx.fillStyle=`rgba(220,229,109,${a*.11})`;ctx.fillRect(x-3,y-3,7,7);ctx.fillStyle=`rgba(235,239,158,${a})`;ctx.fillRect(x,y,2,2)}
if(ready&&!awakening){const breath=(1-Math.cos(t*Math.PI*2/4.6))*.55;ctx.drawImage(princess,199,231-breath,370,185+breath)}
if(awakening){
 const elapsed=t-awakenTime;
 const phase=Math.min(3,elapsed/1.25);
 const frame=Math.floor(phase),blend=phase-frame;
 function pose(k,a){ctx.globalAlpha=a;const w=wake.naturalWidth/2,h=wake.naturalHeight/2;ctx.drawImage(wake,(k%2)*w,Math.floor(k/2)*h,w,h,199,231,370,185);ctx.globalAlpha=1;}
 if(wake.complete&&wake.naturalWidth){pose(frame,1);if(frame<3&&blend>.55)pose(frame+1,(blend-.55)/.45);}
 else if(ready)ctx.drawImage(princess,199,231,370,185);
 if(elapsed>5.3&&!finished){finished=true;window.dispatchEvent(new Event('princess-awake'));}
}
// Three pixel Zs rise in sequence; each fades in and out gently.
const glyph=['1111','0001','0010','0100','1111'];
if(!awakening)for(let n=0;n<3;n++){const u=((t+n*1.2)%3.6)/3.6;const alpha=Math.sin(u*Math.PI)*.75;const size=1+Math.floor(u*2);const x=Math.round(283+u*21+Math.sin(u*5)*3),y=Math.round(280-u*65);ctx.globalAlpha=alpha;ctx.fillStyle='#f5dfa3';glyph.forEach((row,j)=>{for(let i=0;i<4;i++)if(row[i]==='1')ctx.fillRect(x+i*size,y+j*size,size,size)});}ctx.globalAlpha=1;
}
function loop(now){const dt=Math.min((now-last)/1000,.05);last=now;if(!document.hidden){t+=dt;moveFlies(dt);render()}requestAnimationFrame(loop)}
function finishLoading(){
 if(ready)return;
 ready=true;
 const loading=root.querySelector('.loading');
 if(loading)loading.remove();
 render();
}
window.refreshSleepScene=render;
render();
princess.onload=finishLoading;
princess.onerror=()=>{const loading=root.querySelector('.loading');if(loading)loading.textContent='Não foi possível carregar a princesa.'};
princess.src='assets/dormindo.webp';
if(princess.complete&&princess.naturalWidth)finishLoading();
requestAnimationFrame(loop);
})();

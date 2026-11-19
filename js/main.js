/* ---------- shared model data (cm). x: left→right, y: back wall→front, z: up ---------- */
const LAYERS={
  CARDBOARD:{c:'#FFD54F',n:'Cardboard'},
  ELECTRONICS:{c:'#FF6B6B',n:'Electronics'},
  PLUMBING:{c:'#E0E0E0',n:'Leak pipe'},
  TRAY:{c:'#4DD0E1',n:'Tray'},
  WATER:{c:'#448AFF',n:'Water'},
  WIRING:{c:'#E040FB',n:'Cables'},
  DIMS:{c:'#69F0AE',n:'Dimensions'},
  ANNO:{c:'#ECEFF1',n:'Balloons & notes'}
};
const SENSOR_CABLE=[[11.3,20.49,6.7],[11.6,17,10],[13.5,12.5,11.8],[14.5,9.6,12.6],[14.5,9.6,13.5],[14.5,8.45,16.4]];
const USB_CABLE=[[29.6,4,14],[32.5,4.5,13.8],[34.5,6.5,8],[35.5,9,0.4],[37.5,10,0.2],[40,10.5,0.2]];
const PUDDLE=[[4.5,15.5],[8.5,14.6],[11.5,16.5],[13.8,20.0],[12.8,22.6],[8.8,22.3],[5.5,20.5]];
const PARTS=[
  {id:1,layer:'CARDBOARD',kind:'box',p:[0,0,-1.2],s:[40,30,1.2]},
  {id:2,layer:'CARDBOARD',kind:'box',p:[0,0,0],s:[40,1.5,30]},
  {id:3,layer:'CARDBOARD',kind:'shell',p:[12,1.5,13],s:[18,9,12],t:0.3,win:[16.5,19,7,2.5]},
  {id:4,layer:'ELECTRONICS',kind:'box',p:[16,8.9,18.45],s:[8,1.26,3.6],hidden:true},
  {id:4,layer:'ELECTRONICS',kind:'box',p:[16.775,10.16,19.43],s:[6.45,0.01,1.64],only:'y'},
  {id:5,layer:'ELECTRONICS',kind:'box',p:[22.5,2.2,13.3],s:[6.9,5.3,1.5],hidden:true},
  {id:6,layer:'ELECTRONICS',kind:'box',p:[12.8,8.0,16.5],s:[16.5,0.9,5.5],hidden:true},
  {id:7,layer:'PLUMBING',kind:'cyl',a:[6.4,1.5,23.8],axis:'y',len:16.6,r:0.8},
  {id:7,layer:'PLUMBING',kind:'cyl',a:[6.4,17.3,17],axis:'z',len:6.8,r:0.8},
  {id:7,layer:'PLUMBING',kind:'cyl',a:[6.4,17.3,16.4],axis:'z',len:0.6,r:1.1},
  {id:8,layer:'TRAY',kind:'tray',p:[3,13,0],s:[18,13,3.2],t:0.2},
  {id:0,layer:'WATER',kind:'poly',z:0.22,pts:PUDDLE},
  {id:10,layer:'CARDBOARD',kind:'box',p:[10.2,18.2,0.2],s:[2.6,2.2,5.4]},
  {id:9,layer:'ELECTRONICS',kind:'box',p:[10.3,20.4,0.35],s:[2.0,0.18,6.2]},
  {id:11,layer:'WIRING',kind:'curve',pts:SENSOR_CABLE},
  {id:12,layer:'WIRING',kind:'curve',pts:USB_CABLE}
];
// [item number, name, what it does] in visitor words; sizes live in the build steps
const BOM=[
  [1,'Base board','The floor of our model, cut from a cardboard box.'],
  [2,'Back wall','A cardboard wall that holds up the pipe and the control box.'],
  [3,'Control box','Keeps the electronics high and dry, with a window for the screen.'],
  [4,'Alert screen','Shows LEAK ALERT when there is water, and Dry when all is well.'],
  [5,'Arduino','The tiny computer that reads the sensor and decides when to sound the alarm.'],
  [6,'Breadboard','Connects the screen to the Arduino without any soldering.'],
  [7,'Leak pipe','Water poured in here drips out of the end, like a leaking pipe.'],
  [8,'Tray','A food container that stands in for the floor and catches the drips.'],
  [9,'Water sensor','Copper strips that notice water as soon as a puddle touches them.'],
  [10,'Sensor stand','A taped cardboard block that holds the sensor just above the floor.'],
  [11,'Sensor wires','Carry the sensor\'s signal up to the Arduino.'],
  [12,'USB cable','Powers everything from a laptop or a phone power bank.']
];
const PART_LAYER={1:'CARDBOARD',2:'CARDBOARD',3:'CARDBOARD',4:'ELECTRONICS',5:'ELECTRONICS',6:'ELECTRONICS',7:'PLUMBING',8:'TRAY',9:'ELECTRONICS',10:'CARDBOARD',11:'WIRING',12:'WIRING'};
const RM=matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- LCD: HD44780-style 5x7 dot-matrix font (only the characters the sketch prints) ---------- */
const FONT={' ':'00000|00000|00000|00000|00000|00000|00000','!':'00100|00100|00100|00100|00100|00000|00100',':':'00000|01100|01100|00000|01100|01100|00000',
'A':'01110|10001|10001|10001|11111|10001|10001','D':'11100|10010|10001|10001|10001|10010|11100','E':'11111|10000|10000|11110|10000|10000|11111',
'K':'10001|10010|10100|11000|10100|10010|10001','L':'10000|10000|10000|10000|10000|10000|11111','R':'11110|10001|10001|11110|10100|10010|10001',
'T':'11111|00100|00100|00100|00100|00100|00100','e':'00000|00000|01110|10001|11111|10000|01110','l':'01100|00100|00100|00100|00100|00100|01110',
'r':'00000|00000|10110|11001|10000|10000|10000','s':'00000|00000|01110|10000|01110|00001|11110','t':'01000|01000|11100|01000|01000|01001|00110',
'v':'00000|00000|10001|10001|10001|01010|00100','y':'00000|00000|10001|10001|01111|00001|01110',
'0':'01110|10001|10011|10101|11001|10001|01110','1':'00100|01100|00100|00100|00100|00100|01110','2':'01110|10001|00001|00010|00100|01000|11111',
'3':'11111|00010|00100|00010|00001|10001|01110','4':'00010|00110|01010|10010|11111|00010|00010','5':'11111|10000|11110|00001|00001|10001|01110',
'6':'00110|01000|10000|11110|10001|10001|01110','7':'11111|00001|00010|00100|01000|01000|01000','8':'01110|10001|10001|01110|10001|10001|01110',
'9':'01110|10001|10001|01111|00001|00010|01100','#':'11111|11111|11111|11111|11111|11111|11111|11111'};
// paints two 16-character lines onto a 1290 × 328 canvas (hero screen and the 3D model's screen texture)
function paintLCD(cx,l1,l2){
  const g=cx.createLinearGradient(0,0,0,328);g.addColorStop(0,'#B9D84A');g.addColorStop(1,'#9EC23A');
  cx.fillStyle=g;cx.fillRect(0,0,1290,328);
  const PX=12.6,PY=13.6,DOT=10.6,X0=45,Y0=44,CW=PX*6,RH=PY*9.4;
  [l1.padEnd(16),l2.padEnd(16)].forEach((line,r)=>{[...line].slice(0,16).forEach((ch,c)=>{
    const rows=(FONT[ch]||FONT[' ']).split('|');
    for(let yy=0;yy<8;yy++)for(let xx=0;xx<5;xx++){const on=rows[yy]&&rows[yy][xx]==='1';
      cx.fillStyle=on?'#1C2A08':'rgba(30,60,0,0.07)';cx.fillRect(X0+c*CW+xx*PX,Y0+r*RH+yy*PY,DOT,DOT*1.08);}});});
}

/* ---------- hero demo: floor (leak / dry), alert count, selected part ---------- */
const WLD={leak:true,alerts:1,blink:true,sel:null};
const heroCtx=document.getElementById('heroLcd').getContext('2d');
function lcdLines(){
  return WLD.leak?[(WLD.blink||RM.matches)?'!! LEAK ALERT !!':'','Lvl:420 #####']:['Dry  Alerts:'+WLD.alerts,'Lvl:12'];}
function renderLCDs(){const [a,b]=lcdLines();paintLCD(heroCtx,a,b);window.dispatchEvent(new CustomEvent('lcd',{detail:[a,b]}));}
function setLeak(on){
  if(on!==WLD.leak){WLD.leak=on;if(on)WLD.alerts++;}
  document.querySelectorAll('[data-leak]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.leak==='1')===on)));
  const st=document.getElementById('state');st.className='state '+(on?'leak':'dry');st.textContent=on?'Leak detected':'All dry';
  const v=on?420:12,fill=document.getElementById('a0fill');
  document.getElementById('a0val').textContent=v+' · '+(on?'wet':'dry');fill.style.width=(v/1023*100).toFixed(1)+'%';fill.classList.toggle('dry',!on);
  document.getElementById('lcdFig').setAttribute('aria-label',on?'LCD screen showing !! LEAK ALERT !! and Lvl:420':'LCD screen showing Dry, Alerts:'+WLD.alerts+' and Lvl:12');
  renderLCDs();
  window.dispatchEvent(new CustomEvent('leakchange'));
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-leak]');if(b)setLeak(b.dataset.leak==='1');});
// alert line blinks: 700 ms on, 350 ms off
setTimeout(function tick(){WLD.blink=!WLD.blink;if(WLD.leak&&!RM.matches)renderLCDs();setTimeout(tick,WLD.blink?700:350);},700);
setLeak(true);

/* ---------- 3D section: "What's inside" list + selection ---------- */
const partList=document.getElementById('parts');
BOM.forEach(([n,name,about])=>{const li=document.createElement('li');
  li.innerHTML=`<button class="part" type="button" data-id="${n}" aria-pressed="false"><span class="bal">${n}</span><span class="nm"><span class="sw" style="background:${LAYERS[PART_LAYER[n]].c}"></span>${name}</span><span class="ds">${about}</span></button>`;
  partList.appendChild(li);});
function selectPart(id){
  WLD.sel=id;
  partList.querySelectorAll('.part').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.id===id)));
  const r=BOM.find(b=>b[0]===id);
  document.getElementById('selInfo').textContent=r?`${r[1]}: ${r[2]} Pick it again to show every part.`:'Pick a part in the list or in the model to see what it does.';
  document.getElementById('clearSel').hidden=id===null;
  window.dispatchEvent(new CustomEvent('selchange'));
}
partList.addEventListener('click',e=>{const b=e.target.closest('.part');if(!b)return;const id=+b.dataset.id;
  selectPart(WLD.sel===id?null:id);
  if(WLD.sel!==null&&matchMedia('(max-width:980px)').matches)document.getElementById('vp3d').scrollIntoView({block:'center',behavior:RM.matches?'auto':'smooth'});});
document.getElementById('clearSel').addEventListener('click',()=>selectPart(null));
// builder sections sit in a closed <details>: open it when a link points inside
const makers=document.querySelector('details.makers');
function openMakers(){const t=location.hash.length>1&&document.getElementById(location.hash.slice(1));
  if(t&&makers.contains(t)&&!makers.open){makers.open=true;t.scrollIntoView();}}
addEventListener('hashchange',openMakers);openMakers();
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&WLD.sel!==null)selectPart(null);});
setTimeout(()=>{const l=document.getElementById('vpLoading');if(!l.hidden)l.textContent='The 3D model could not load here. The list of parts still explains what each one does.';},12000);

/* ---------- builders: layer toggles (drawing + 3D model) ---------- */
const layerBox=document.getElementById('layers');
const layerOn={};
Object.entries(LAYERS).forEach(([k,v])=>{layerOn[k]=true;
  const l=document.createElement('label');
  l.innerHTML=`<input type="checkbox" checked id="layer-${k.toLowerCase()}" data-layer-toggle="${k}"><span class="sw" style="background:${v.c}"></span>${v.n}`;
  layerBox.appendChild(l);});
layerBox.addEventListener('change',e=>{const k=e.target.dataset.layerToggle;if(!k)return;
  layerOn[k]=e.target.checked;document.body.classList.toggle('off-'+k,!e.target.checked);
  window.dispatchEvent(new CustomEvent('layerchange'));});

/* ---------- builders: 2D orthographic views ---------- */
const NS='http://www.w3.org/2000/svg';
const VIEWS={
  top:{el:'vp-top',vb:[-8,-7,56,44],dir:'z',proj:(x,y,z)=>[x,y],inv:(u,v)=>({X:u,Y:v,Z:null}),ucs:['X','Y',1,1]},
  front:{el:'vp-front',vb:[-8,-38,56,44],dir:'y',proj:(x,y,z)=>[x,-z],inv:(u,v)=>({X:u,Y:null,Z:-v}),ucs:['X','Z',1,-1]},
  right:{el:'vp-right',vb:[-11,-38,56,44],dir:'x',proj:(x,y,z)=>[30-y,-z],inv:(u,v)=>({X:null,Y:30-u,Z:-v}),ucs:['Y','Z',-1,-1]}
};
function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
const f=n=>+n.toFixed(3);

function makeSVG(key){
  const V=VIEWS[key];const host=document.getElementById(V.el);
  const sc=document.createElement('div');sc.className='vpscroll';host.appendChild(sc); // scrolls sideways on phones
  const svg=el('svg',{viewBox:V.vb.join(' '),preserveAspectRatio:'xMidYMid meet'},sc);
  const defs=el('defs',{},svg);
  const pm=el('pattern',{id:'gmin-'+key,width:1,height:1,patternUnits:'userSpaceOnUse'},defs);
  el('path',{d:'M1 0H0V1',fill:'none',stroke:'#29303a','stroke-width':0.03},pm);
  const pM=el('pattern',{id:'gmaj-'+key,width:5,height:5,patternUnits:'userSpaceOnUse'},defs);
  el('rect',{width:5,height:5,fill:'url(#gmin-'+key+')'},pM);
  el('path',{d:'M5 0H0V5',fill:'none',stroke:'#323b46','stroke-width':0.06},pM);
  const ph=el('pattern',{id:'hatch-'+key,width:0.8,height:0.8,patternUnits:'userSpaceOnUse',patternTransform:'rotate(45)'},defs);
  el('line',{x1:0,y1:0,x2:0,y2:0.8,stroke:LAYERS.WATER.c,'stroke-width':0.09},ph);
  el('rect',{x:V.vb[0]-50,y:V.vb[1]-50,width:V.vb[2]+100,height:V.vb[3]+100,fill:'url(#gmaj-'+key+')'},svg);
  // origin marker
  const o=V.proj(0,0,0);
  el('path',{d:`M${o[0]-0.6} ${o[1]}h1.2M${o[0]} ${o[1]-0.6}v1.2`,stroke:'#55606c','stroke-width':0.06},svg);
  const g=el('g',{},svg);
  // ucs icon
  const u=document.createElement('div');u.className='ucs';
  const [a,b,sx,sy]=V.ucs;
  u.innerHTML=`<svg viewBox="0 0 54 54"><g stroke="#ECEFF1" stroke-width="1.6" fill="none"><path d="M${sx>0?10:44} 44H${sx>0?40:14}"/><path d="M${sx>0?40:14} 44l${sx>0?-6:6} -3M${sx>0?40:14} 44l${sx>0?-6:6} 3"/><path d="M${sx>0?10:44} 44V${sy<0?14:52}"/></g><g stroke="#ECEFF1" stroke-width="1.6"><path d="M${sx>0?10:44} 14l-3 6M${sx>0?10:44} 14l3 6"/></g><text x="${sx>0?44:4}" y="47" fill="#ECEFF1" font-size="10" font-family="IBM Plex Mono,monospace">${a}</text><text x="${sx>0?13:33}" y="12" fill="#ECEFF1" font-size="10" font-family="IBM Plex Mono,monospace">${b}</text></svg>`;
  if(sy>0){u.innerHTML=`<svg viewBox="0 0 54 54"><g stroke="#ECEFF1" stroke-width="1.6" fill="none"><path d="M10 12H40M40 12l-6 -3M40 12l-6 3M10 12V42M10 42l-3 -6M10 42l3 -6"/></g><text x="44" y="15" fill="#ECEFF1" font-size="10" font-family="IBM Plex Mono,monospace">${a}</text><text x="14" y="50" fill="#ECEFF1" font-size="10" font-family="IBM Plex Mono,monospace">${b}</text></svg>`;}
  host.appendChild(u);
  // coordinates
  const coords=e=>{const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;
    const p=pt.matrixTransform(svg.getScreenCTM().inverse());const c=V.inv(p.x,p.y);
    const s=v=>v===null?'—':v.toFixed(2);
    document.getElementById('coords').innerHTML=`<span class="k">X</span> ${s(c.X)}  <span class="k">Y</span> ${s(c.Y)}  <span class="k">Z</span> ${s(c.Z)}  <span>(${key} view, cm)</span>`;};
  svg.addEventListener('pointermove',coords);svg.addEventListener('pointerdown',coords);
  host.addEventListener('pointerenter',()=>{document.querySelectorAll('.vp').forEach(v=>v.classList.remove('active'));host.classList.add('active');});
  return {svg,g,V};
}

function rectFrom(V,p,s){const a=V.proj(p[0],p[1],p[2]),b=V.proj(p[0]+s[0],p[1]+s[1],p[2]+s[2]);
  return {x:Math.min(a[0],b[0]),y:Math.min(a[1],b[1]),w:Math.abs(a[0]-b[0]),h:Math.abs(a[1]-b[1])};}
function drawRect(g,r,layer,dashed,fill){
  return el('rect',{x:f(r.x),y:f(r.y),width:f(r.w),height:f(r.h),fill:fill||(dashed?'none':LAYERS[layer].c),'fill-opacity':fill?1:0.06,stroke:LAYERS[layer].c,'stroke-width':dashed?1:1.3,
    'vector-effect':'non-scaling-stroke','stroke-dasharray':dashed?'5 4':'none',opacity:dashed?0.75:1,'data-layer':layer},g);}
function centerLine(g,x1,y1,x2,y2,layer){
  el('line',{x1:f(x1),y1:f(y1),x2:f(x2),y2:f(y2),stroke:LAYERS[layer].c,'stroke-width':0.8,'vector-effect':'non-scaling-stroke','stroke-dasharray':'12 3 2 3',opacity:0.55,'data-layer':layer},g);}
function crPath(P){let d=`M${f(P[0][0])} ${f(P[0][1])}`;
  for(let i=0;i<P.length-1;i++){const p0=P[i-1]||P[i],p1=P[i],p2=P[i+1],p3=P[i+2]||p2;
    const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
    d+=` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;}return d;}

function drawPart(view,key,pt){
  const {g,V}=view;const L=pt.layer;if(pt.only&&pt.only!==V.dir)return;
  if(pt.kind==='box'){drawRect(g,rectFrom(V,pt.p,pt.s),L,pt.hidden);}
  else if(pt.kind==='shell'){
    drawRect(g,rectFrom(V,pt.p,pt.s),L,false);
    const t=pt.t;drawRect(g,rectFrom(V,[pt.p[0]+t,pt.p[1]+t,pt.p[2]+t],[pt.s[0]-2*t,pt.s[1]-2*t,pt.s[2]-2*t]),L,true);
    if(V.dir==='y'){const [wx,wz,ww,wh]=pt.win;drawRect(g,rectFrom(V,[wx,pt.p[1]+pt.s[1],wz],[ww,0,wh]),L,false);}
  }
  else if(pt.kind==='tray'){
    drawRect(g,rectFrom(V,pt.p,pt.s),L,false);const t=pt.t;
    drawRect(g,rectFrom(V,[pt.p[0]+t,pt.p[1]+t,pt.p[2]+t],[pt.s[0]-2*t,pt.s[1]-2*t,pt.s[2]-t]),L,V.dir!=='z');
  }
  else if(pt.kind==='cyl'){
    const [x,y,z]=pt.a,r=pt.r,ax=pt.axis;
    const end=[x+(ax==='x'?pt.len:0),y+(ax==='y'?pt.len:0),z+(ax==='z'?pt.len:0)];
    if(ax===V.dir){const c=V.proj(x,y,z);
      el('circle',{cx:f(c[0]),cy:f(c[1]),r:r,fill:LAYERS[L].c,'fill-opacity':0.08,stroke:LAYERS[L].c,'stroke-width':1.3,'vector-effect':'non-scaling-stroke','data-layer':L},g);
      centerLine(g,c[0]-r-0.6,c[1],c[0]+r+0.6,c[1],L);centerLine(g,c[0],c[1]-r-0.6,c[0],c[1]+r+0.6,L);}
    else{const a=V.proj(x,y,z),b=V.proj(...end);
      const horiz=Math.abs(a[1]-b[1])<1e-6;
      const rr=horiz?{x:Math.min(a[0],b[0]),y:a[1]-r,w:Math.abs(a[0]-b[0]),h:2*r}:{x:a[0]-r,y:Math.min(a[1],b[1]),w:2*r,h:Math.abs(a[1]-b[1])};
      drawRect(g,rr,L,false);
      if(horiz)centerLine(g,Math.min(a[0],b[0])-0.7,a[1],Math.max(a[0],b[0])+0.7,a[1],L);
      else centerLine(g,a[0],Math.min(a[1],b[1])-0.7,a[0],Math.max(a[1],b[1])+0.7,L);}
  }
  else if(pt.kind==='poly'){
    if(V.dir!=='z')return;
    const d='M'+pt.pts.map(p=>V.proj(p[0],p[1],pt.z).map(f).join(' ')).join(' L')+'Z';
    el('path',{d,fill:'url(#hatch-'+key+')',stroke:LAYERS[L].c,'stroke-width':1,'vector-effect':'non-scaling-stroke','data-layer':L},g);
  }
  else if(pt.kind==='curve'){
    const P=pt.pts.map(p=>V.proj(...p));
    el('path',{d:crPath(P),fill:'none',stroke:LAYERS[L].c,'stroke-width':1.6,'vector-effect':'non-scaling-stroke','data-layer':L},g);
  }
}

/* ---------- annotation helpers (dimensions, balloons, notes) ---------- */
const DC=LAYERS.DIMS.c,AC=LAYERS.ANNO.c;
function ln(g,x1,y1,x2,y2,c,layer,w=0.9){return el('line',{x1:f(x1),y1:f(y1),x2:f(x2),y2:f(y2),stroke:c,'stroke-width':w,'vector-effect':'non-scaling-stroke','data-layer':layer},g);}
function txt(g,x,y,s,{anchor='middle',size=1,color=DC,layer='DIMS',rot=0}={}){
  const t=el('text',{x:f(x),y:f(y),'text-anchor':anchor,'font-size':size,fill:color,'font-family':'IBM Plex Mono, monospace','data-layer':layer},g);
  if(rot)t.setAttribute('transform',`rotate(${rot} ${f(x)} ${f(y)})`);t.textContent=s;return t;}
function arrowHead(g,x,y,dx,dy,c,layer){const L=0.7,W=0.2,px=-dy,py=dx;
  el('path',{d:`M${f(x)} ${f(y)} L${f(x-dx*L+px*W)} ${f(y-dy*L+py*W)} L${f(x-dx*L-px*W)} ${f(y-dy*L-py*W)}Z`,fill:c,'data-layer':layer},g);}
// horizontal dimension: u1<u2, f1/f2 = v of features (null = no extension line), vd = v of dimension line
function dimH(g,u1,u2,f1,f2,vd,label){
  [[u1,f1],[u2,f2]].forEach(([u,fv])=>{if(fv===null)return;const s=Math.sign(vd-fv)||1;ln(g,u,fv+0.3*s,u,vd+0.5*s,DC,'DIMS',0.7);});
  ln(g,u1,vd,u2,vd,DC,'DIMS',0.9);
  const span=u2-u1,w=label.length*0.62;
  if(span>=w+1.6){arrowHead(g,u1,vd,-1,0,DC,'DIMS');arrowHead(g,u2,vd,1,0,DC,'DIMS');txt(g,(u1+u2)/2,vd-0.35,label);}
  else{arrowHead(g,u1,vd,1,0,DC,'DIMS');arrowHead(g,u2,vd,-1,0,DC,'DIMS');ln(g,u2,vd,u2+1.2+w,vd,DC,'DIMS',0.9);ln(g,u1-1.0,vd,u1,vd,DC,'DIMS',0.9);txt(g,u2+0.6,vd-0.35,label,{anchor:'start'});}
}
// vertical dimension: v1>v2 (v1 lower on screen), f1/f2 = u of features, ud = u of dimension line
function dimV(g,v1,v2,f1,f2,ud,label){
  [[v1,f1],[v2,f2]].forEach(([v,fu])=>{if(fu===null)return;const s=Math.sign(ud-fu)||1;ln(g,fu+0.3*s,v,ud+0.5*s,v,DC,'DIMS',0.7);});
  ln(g,ud,v1,ud,v2,DC,'DIMS',0.9);
  const span=v1-v2,w=label.length*0.62;
  if(span>=w+1.6){arrowHead(g,ud,v1,0,1,DC,'DIMS');arrowHead(g,ud,v2,0,-1,DC,'DIMS');txt(g,ud-0.35,(v1+v2)/2,label,{rot:-90});}
  else{arrowHead(g,ud,v1,0,-1,DC,'DIMS');arrowHead(g,ud,v2,0,1,DC,'DIMS');ln(g,ud,v2,ud,v2-1.2-w,DC,'DIMS',0.9);ln(g,ud,v1,ud,v1+1.0,DC,'DIMS',0.9);txt(g,ud-0.35,v2-0.6,label,{anchor:'start',rot:-90});}
}
function balloon(g,[px,py],[bx,by],n){
  const r=1.15,dx=px-bx,dy=py-by,d=Math.hypot(dx,dy)||1;
  ln(g,bx+dx/d*r,by+dy/d*r,px,py,AC,'ANNO',0.7);
  el('circle',{cx:px,cy:py,r:0.22,fill:AC,'data-layer':'ANNO'},g);
  el('circle',{cx:bx,cy:by,r,fill:'#212830',stroke:AC,'stroke-width':1,'vector-effect':'non-scaling-stroke','data-layer':'ANNO'},g);
  txt(g,bx,by+0.36,String(n),{size:1,color:AC,layer:'ANNO'});
}
function note(g,[px,py],[tx,ty],s,anchor='start'){
  arrowHead(g,px,py,(px-tx)/Math.hypot(px-tx,py-ty),(py-ty)/Math.hypot(px-tx,py-ty),AC,'ANNO');
  ln(g,tx,ty,px,py,AC,'ANNO',0.7);
  const sh=anchor==='start'?0.8:-0.8;ln(g,tx,ty,tx+sh,ty,AC,'ANNO',0.7);
  txt(g,tx+sh+(anchor==='start'?0.3:-0.3),ty+0.3,s,{anchor,size:0.85,color:AC,layer:'ANNO'});
}

/* ---------- build the three views ---------- */
const views={top:makeSVG('top'),front:makeSVG('front'),right:makeSVG('right')};
Object.entries(views).forEach(([k,v])=>PARTS.forEach(p=>drawPart(v,k,p)));

// FRONT view (u = x, v = -z)
(()=>{const g=views.front.g;
  dimH(g,0,40,1.2,1.2,4.6,'40');
  dimV(g,0,-30,0,0,-3.6,'30');
  dimH(g,12,30,-25,-25,-27.6,'18');
  dimV(g,0,-13,40,30,43.2,'13');
  dimV(g,-13,-25,30,30,43.2,'12');
  dimH(g,16.5,23.5,-21.5,-21.5,-23.4,'7');
  dimV(g,-19,-21.5,23.5,23.5,25.4,'2.5');
  dimV(g,0,-3.2,21,21,23,'3.2');
  balloon(g,[38,0.6],[45.6,3],1);
  balloon(g,[36,-27],[45.6,-32],2);
  balloon(g,[29,-24],[45.6,-27.6],3);
  balloon(g,[6.4,-24.6],[4.2,-34],7);
  balloon(g,[4,-1.6],[-6.3,-8],8);
  balloon(g,[11.3,-5],[16.8,-8.6],9);
  balloon(g,[12.8,-3.6],[19.4,-5.6],10);
  balloon(g,[13.45,-11.75],[8.6,-11.2],11);
  balloon(g,[34.9,-6],[38.4,-9.6],12);
})();
// TOP view (u = x, v = y)
(()=>{const g=views.top.g;
  dimV(g,30,0,0,0,-3.6,'30');
  dimV(g,10.5,1.5,30,30,33.6,'9');
  dimV(g,18.1,1.5,5.6,5.6,1.8,'16.6');
  dimH(g,0,3,30,26,33.2,'3');
  dimH(g,3,21,26,26,33.2,'18');
  dimV(g,26,13,21,21,23.6,'13');
  balloon(g,[25.5,5],[21.6,-4.6],5);
  balloon(g,[26.5,8.45],[26.2,-4.6],6);
  balloon(g,[20,9.5],[17,-4.6],4);
  balloon(g,[29,3],[35.4,-4.2],3);
  balloon(g,[38,0.75],[44.6,-3.4],2);
  balloon(g,[7.2,6],[9.8,6.6],7);
  balloon(g,[13.5,12.5],[9.8,11],11);
  balloon(g,[12.3,20.5],[16.6,22.6],9);
  balloon(g,[12.8,19.3],[17.4,17.6],10);
  balloon(g,[20.8,24.5],[27,28],8);
  balloon(g,[36,8.6],[37.6,15.4],12);
  balloon(g,[38,28],[44.6,32],1);
})();
// RIGHT view (u = 30 - y, v = -z)
(()=>{const g=views.right.g;
  dimH(g,0,4,1.2,0,4.6,'4');
  dimH(g,4,17,0,0,4.6,'13');
  dimH(g,17,28.5,0,0,4.6,'11.5');
  dimH(g,28.5,30,0,1.2,4.6,'1.5');
  dimH(g,19.5,28.5,-25,-25,-27.6,'9');
  dimV(g,0,-16.4,null,11.6,2,'16.4');
  dimV(g,0,-23.8,null,11.4,-2,'23.8');
  balloon(g,[29.3,-28],[34,-32.5],2);
  balloon(g,[20.5,-19.5],[15.2,-28.4],4);
  balloon(g,[25.5,-14],[34.6,-11],5);
  balloon(g,[21.6,-21],[34.6,-20.4],6);
  balloon(g,[20,-24.6],[19.4,-33.4],7);
  balloon(g,[16,-1.6],[19.6,-6.8],8);
  note(g,[9.45,-0.35],[-0.6,-8.8],'TIP ≈1.5 mm UP','end');
  note(g,[13.5,-20.5],[6.8,-27.2],'Ø1.6 PIPE','end');
})();

/* ---------- builders: Uno pin map ---------- */
const USE={lcd:['LCD','var(--water)'],plus:['+','#E53935'],minus:['−','#212121'],sig:['S','#FFB300','#1A1A1A']};
const HDR_TOP=[['GND'],['13'],['12','lcd'],['11','lcd'],['10'],['9'],['8'],0,['7','plus'],['6','lcd'],['5','lcd'],['4','lcd'],['3','lcd'],['2','lcd'],['1'],['0']];
const HDR_BOT=[['3.3V'],['5V'],['GND','minus'],['GND'],['VIN'],0,['A0','sig'],['A1'],['A2'],['A3'],['A4'],['A5']];
function pinRow(list,host){list.forEach(p=>{
  if(!p){host.insertAdjacentHTML('beforeend','<li class="gap"></li>');return;}
  const [lb,u]=p,use=u&&USE[u];
  host.insertAdjacentHTML('beforeend',`<li class="pin${use?' use':''}"${use?` style="--wire:${use[1]};--wire-ink:${use[2]||'#fff'}"`:''}><span class="fn">${use?use[0]:''}</span><span class="sq"></span><span class="lb">${lb}</span></li>`);});}
pinRow(HDR_TOP,document.getElementById('hdrTop'));
pinRow(HDR_BOT,document.getElementById('hdrBot'));

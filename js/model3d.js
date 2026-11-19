import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {CSS2DRenderer,CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const host=document.getElementById('vp3d');
const loading=document.getElementById('vpLoading');
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true});}
catch(err){loading.textContent='This browser cannot show 3D (WebGL is off). The drawing below shows the same parts.';throw err;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=0.95;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
// keep normal page scrolling: only Ctrl/⌘ + wheel (a trackpad pinch sends the same) reaches the zoom
renderer.domElement.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)e.stopImmediatePropagation();},{capture:true});
host.appendChild(renderer.domElement);
const labelR=new CSS2DRenderer();labelR.domElement.className='labels';host.appendChild(labelR.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,1,0.1,1000);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.target.set(0,9,0);controls.minDistance=10;controls.maxDistance=260;
// on phones a vertical swipe still scrolls the page; sideways swipes and pinches reach the controls
renderer.domElement.style.touchAction='pan-y';
const FLAT=new THREE.Color('#212830');
const bgc=document.createElement('canvas');bgc.width=8;bgc.height=256;const bgx=bgc.getContext('2d');
const bgg=bgx.createLinearGradient(0,0,0,256);bgg.addColorStop(0,'#46566a');bgg.addColorStop(0.55,'#2a333f');bgg.addColorStop(1,'#161b21');
bgx.fillStyle=bgg;bgx.fillRect(0,0,8,256);const BG=new THREE.CanvasTexture(bgc);BG.colorSpace=THREE.SRGBColorSpace;
const pmrem=new THREE.PMREMGenerator(renderer);const ENV=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
const hemi=new THREE.HemisphereLight(0xffffff,0x3a4250,0.55);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff4e6,2.4);sun.position.set(38,62,46);scene.add(sun);
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-38,right:38,top:38,bottom:-38,near:10,far:180});
sun.shadow.bias=-0.0004;sun.shadow.normalBias=0.03;sun.shadow.radius=5;
const fill=new THREE.DirectionalLight(0xbcd4ff,0.45);fill.position.set(-40,20,-10);scene.add(fill);
const grid=new THREE.GridHelper(80,80,0x3b4552,0x2a313a);grid.position.y=-1.21;scene.add(grid);
const catcher=new THREE.Mesh(new THREE.PlaneGeometry(260,260),new THREE.ShadowMaterial({opacity:0.42}));
catcher.rotation.x=-Math.PI/2;catcher.position.y=-1.205;catcher.receiveShadow=true;scene.add(catcher);

// canvas textures below print text in the page fonts, so wait briefly for them
try{await Promise.race([Promise.all(['600 64px "IBM Plex Sans"','500 26px "IBM Plex Mono"'].map(s=>document.fonts.load(s))),new Promise(r=>setTimeout(r,1500))]);}catch(e){}

const W=(x,y,z)=>new THREE.Vector3(x-20,z,y-15);
const REG=[];
let CUR=0; // BOM item number of the part being built (0 = water, no part)
function reg(obj,layer,type,base=1,extra={}){obj.userData.id=CUR;REG.push({obj,layer,type,base,id:CUR,...extra});return obj;}
const TEXC={};
function cardTex(hex){if(TEXC[hex])return TEXC[hex];const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');
  x.fillStyle=hex;x.fillRect(0,0,512,512);
  for(let i=0;i<9000;i++){const v=Math.random();x.fillStyle=v<0.5?'rgba(80,50,20,0.10)':'rgba(255,240,210,0.10)';x.fillRect(Math.random()*512,Math.random()*512,1+Math.random()*2,1+Math.random()*2);}
  x.strokeStyle='rgba(90,60,25,0.07)';x.lineWidth=2;for(let yy=0;yy<512;yy+=9){x.beginPath();x.moveTo(0,yy+Math.random()*2);x.lineTo(512,yy+Math.random()*2);x.stroke();}
  for(let i=0;i<60;i++){x.strokeStyle='rgba(70,45,15,0.10)';x.lineWidth=1;x.beginPath();const a=Math.random()*512,b=Math.random()*512;x.moveTo(a,b);x.lineTo(a+20+Math.random()*40,b+(Math.random()-0.5)*6);x.stroke();}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;TEXC[hex]=t;return t;}
const KIND={
  card:c=>({map:cardTex(c),color:'#ffffff',roughness:0.92,metalness:0}),
  metal:c=>({color:c,roughness:0.3,metalness:0.65}),
  darkmetal:c=>({color:c,roughness:0.38,metalness:0.7}),
  gold:c=>({color:c,roughness:0.3,metalness:1}),
  pcb:c=>({color:c,roughness:0.45,metalness:0.05}),
  plastic:c=>({color:c,roughness:0.55,metalness:0})};
function mat(color,opacity=1,kind='plastic'){
  if(kind==='clear')return new THREE.MeshPhysicalMaterial({color,roughness:0.06,metalness:0,clearcoat:1,clearcoatRoughness:0.05,transparent:true,opacity,side:THREE.DoubleSide,depthWrite:false});
  return new THREE.MeshStandardMaterial({...KIND[kind](color),transparent:opacity<1,opacity,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});}
function edgesFor(geo,mesh,layer,thr=20,keepReal=false){const e=new THREE.LineSegments(new THREE.EdgesGeometry(geo,thr),new THREE.LineBasicMaterial({color:LAYERS[layer].c,transparent:true,opacity:0.9}));
  e.position.copy(mesh.position);e.rotation.copy(mesh.rotation);e.scale.copy(mesh.scale);scene.add(e);reg(e,layer,'edge',1,{keepReal});return e;}
const DEFKIND={CARDBOARD:'card',ELECTRONICS:'pcb',PLUMBING:'metal',TRAY:'clear',WATER:'plastic',WIRING:'plastic'};
function box(p,s,color,layer,opacity=1,opts={}){const geo=new THREE.BoxGeometry(s[0],s[2],s[1]);
  const kind=opts.kind||DEFKIND[layer];let material=mat(color,opacity,kind);
  if(opts.frontMap){const plain=material;const front=mat(color,opacity,kind);front.map=opts.frontMap;front.color=new THREE.Color('#ffffff');material=[plain,plain,plain,plain,front,plain];}
  const m=new THREE.Mesh(geo,material);m.castShadow=kind!=='clear';m.receiveShadow=true;
  m.position.copy(W(p[0]+s[0]/2,p[1]+s[1]/2,p[2]+s[2]/2));scene.add(m);reg(m,layer,'face',opacity);if(!opts.noEdges)edgesFor(geo,m,layer,20,kind==='clear');return m;}
function cylY(x,y1,y2,z,r,color,layer){const geo=new THREE.CylinderGeometry(r,r,y2-y1,40);const m=new THREE.Mesh(geo,mat(color,1,'metal'));m.castShadow=m.receiveShadow=true;
  m.rotation.x=Math.PI/2;m.position.copy(W(x,(y1+y2)/2,z));scene.add(m);reg(m,layer,'face');edgesFor(geo,m,layer,40);return m;}
function cylZ(x,y,z1,z2,r,color,layer){const geo=new THREE.CylinderGeometry(r,r,z2-z1,40);const m=new THREE.Mesh(geo,mat(color,1,'metal'));m.castShadow=m.receiveShadow=true;
  m.position.copy(W(x,y,(z1+z2)/2));scene.add(m);reg(m,layer,'face');edgesFor(geo,m,layer,40);return m;}

const CARD='#B88C55',CARD2='#C29661';
// 1 base, 2 wall
CUR=1;box([0,0,-1.2],[40,30,1.2],CARD,'CARDBOARD');
CUR=2;box([0,0,0],[40,1.5,30],CARD2,'CARDBOARD');
// 3 control box shell (panels), window in front
CUR=3;
const BX=12,BY=1.5,BZ=13,T=0.3,BOXC='#9A6D41';
box([BX,BY,BZ],[18,9,T],BOXC,'CARDBOARD');
box([BX,BY,BZ+12-T],[18,9,T],BOXC,'CARDBOARD');
box([BX,BY,BZ+T],[18,T,12-2*T],BOXC,'CARDBOARD');
box([BX,BY+T,BZ+T],[T,9-2*T,12-2*T],BOXC,'CARDBOARD');
box([BX+18-T,BY+T,BZ+T],[T,9-2*T,12-2*T],BOXC,'CARDBOARD');
const FY=BY+9-T;
box([BX,FY,BZ+T],[18,T,19-(BZ+T)],BOXC,'CARDBOARD');
box([BX,FY,21.5],[18,T,BZ+12-T-21.5],BOXC,'CARDBOARD');
box([BX,FY,19],[16.5-BX,T,2.5],BOXC,'CARDBOARD');
box([23.5,FY,19],[BX+18-23.5,T,2.5],BOXC,'CARDBOARD');
// label strip on box front (printed "LEAK GUARD" sticker)
box([16,BY+9,15.2],[8,0.02,1.4],'#ECE7DA','CARDBOARD',1,{noEdges:true});
const lc=document.createElement('canvas');lc.width=800;lc.height=140;const lx=lc.getContext('2d');
lx.fillStyle='#ECE7DA';lx.fillRect(0,0,800,140);lx.fillStyle='#1E88E5';
lx.beginPath();lx.moveTo(70,22);lx.quadraticCurveTo(108,72,70,112);lx.quadraticCurveTo(32,72,70,22);lx.fill();
lx.fillStyle='#263238';lx.font='600 64px "IBM Plex Sans", sans-serif';lx.textBaseline='middle';lx.fillText('LEAK GUARD',130,74);
lx.font='500 26px "IBM Plex Mono", monospace';lx.fillStyle='#607D8B';lx.fillText('AQUA SAVERS',575,76);
const ltex=new THREE.CanvasTexture(lc);ltex.colorSpace=THREE.SRGBColorSpace;
const sticker=new THREE.Mesh(new THREE.PlaneGeometry(8,1.4),new THREE.MeshStandardMaterial({map:ltex,roughness:0.9}));
sticker.position.copy(W(20,BY+9.03,15.9));scene.add(sticker);reg(sticker,'CARDBOARD','screen');
// dark trim around the LCD window
[[[16.1,BY+9,21.5],[7.8,0.03,0.4]],[[16.1,BY+9,18.6],[7.8,0.03,0.4]],[[16.1,BY+9,19],[0.4,0.03,2.5]],[[23.5,BY+9,19],[0.4,0.03,2.5]]]
  .forEach(([p,sz])=>box(p,sz,'#2B2F33','CARDBOARD',1,{noEdges:true}));

// 4 LCD 16x2 module: PCB, metal bezel, 16-pin header into breadboard, dot-matrix screen
CUR=4;
box([16,9.3,18.45],[8,0.16,3.6],'#1B6E2E','ELECTRONICS');
box([16.45,9.46,19.05],[7.1,0.7,2.4],'#1a1c1f','ELECTRONICS',1,{kind:'darkmetal'});
box([16.68,9.0,21.67],[4.06,0.3,0.26],'#111','ELECTRONICS',1,{noEdges:true});
for(let i=0;i<16;i++){box([16.8+i*0.254-0.035,8.9,21.765],[0.07,0.56,0.07],'#D4AF37','ELECTRONICS',1,{noEdges:true,kind:'gold'});
  box([16.8+i*0.254-0.07,9.46,21.73],[0.14,0.01,0.14],'#D4AF37','ELECTRONICS',1,{noEdges:true,kind:'gold'});}
[[16.18,18.63],[23.52,18.63],[16.18,21.77],[23.52,21.77]].forEach(([x,z])=>box([x,9.46,z],[0.3,0.01,0.3],'#0B3D17','ELECTRONICS',1,{noEdges:true}));
const cv=document.createElement('canvas');cv.width=1290;cv.height=328;const cx=cv.getContext('2d');
const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
function drawLCD(l1,l2){paintLCD(cx,l1,l2);tex.needsUpdate=true;}
const screen=new THREE.Mesh(new THREE.PlaneGeometry(6.45,1.64),new THREE.MeshBasicMaterial({map:tex}));
screen.position.copy(W(20,10.165,20.25));scene.add(screen);reg(screen,'ELECTRONICS','screen');
// 5 Arduino Uno
CUR=5;
const arc=document.createElement('canvas');arc.width=690;arc.height=530;const arx=arc.getContext('2d');
arx.fillStyle='#00838F';arx.fillRect(0,0,690,530);arx.strokeStyle='rgba(255,255,255,0.18)';arx.lineWidth=2;
for(let i=0;i<14;i++){arx.beginPath();arx.moveTo(60+i*40,120);arx.bezierCurveTo(80+i*40,250,140+i*30,300,200+i*25,420);arx.stroke();}
arx.fillStyle='#ffffff';arx.font='600 64px "IBM Plex Sans", sans-serif';arx.fillText('UNO',300,300);arx.font='500 26px "IBM Plex Mono", monospace';arx.fillText('ARDUINO',300,340);
const art=new THREE.CanvasTexture(arc);art.colorSpace=THREE.SRGBColorSpace;
{const top=box([22.5,2.2,13.3],[6.9,5.3,0.16],'#00838F','ELECTRONICS');const ms=[];for(let i=0;i<6;i++)ms.push(top.material.clone());
 ms[2]=new THREE.MeshStandardMaterial({map:art,roughness:0.45,side:THREE.DoubleSide});top.material=ms;}
box([28.0,3.4,13.46],[1.6,1.2,1.1],'#C8D0D6','ELECTRONICS',1,{kind:'metal'});
box([28.4,5.7,13.46],[1.2,0.9,1.1],'#212121','ELECTRONICS');
box([23.2,2.35,13.46],[4.6,0.25,0.85],'#212121','ELECTRONICS');
box([23.2,7.1,13.46],[4.6,0.25,0.85],'#212121','ELECTRONICS');
box([23.8,4.3,13.46],[3.5,0.8,0.35],'#263238','ELECTRONICS');
// 6 breadboard (upright)
CUR=6;
const bbc=document.createElement('canvas');bbc.width=1650;bbc.height=550;const bbx=bbc.getContext('2d');
bbx.fillStyle='#F3F4F2';bbx.fillRect(0,0,1650,550);bbx.fillStyle='#d7dad6';bbx.fillRect(0,262,1650,26);
bbx.fillStyle='#E53935';bbx.fillRect(40,22,1570,4);bbx.fillRect(40,524,1570,4);bbx.fillStyle='#1E88E5';bbx.fillRect(40,90,1570,4);bbx.fillRect(40,456,1570,4);
bbx.fillStyle='#3b3f42';for(let c=0;c<63;c++){const xx=60+c*25.4;for(const yy of[120,145,170,196,221,330,355,380,406,431])bbx.fillRect(xx,yy,9,9);
  if(c%6!==5)for(const yy of[40,62,478,500])bbx.fillRect(xx,yy,9,9);}
const bbt=new THREE.CanvasTexture(bbc);bbt.colorSpace=THREE.SRGBColorSpace;bbt.anisotropy=8;
box([12.8,8.0,16.5],[16.5,0.9,5.5],'#F3F4F2','ELECTRONICS',1,{frontMap:bbt,kind:'plastic'});
// 7 leak pipe
CUR=7;
const PC='#E3E8EC';
cylY(6.4,1.5,1.8,23.8,1.2,PC,'PLUMBING');
cylY(6.4,1.8,17.3,23.8,0.8,PC,'PLUMBING');
const elbow=new THREE.Mesh(new THREE.SphereGeometry(0.8,32,20),mat(PC,1,'metal'));elbow.castShadow=true;elbow.position.copy(W(6.4,17.3,23.8));scene.add(elbow);reg(elbow,'PLUMBING','face');
cylZ(6.4,17.3,17,23.8,0.8,PC,'PLUMBING');
cylZ(6.4,17.3,16.4,17,1.1,'#90A4AE','PLUMBING');
// 8 tray (open top)
CUR=8;
const TC='#80DEEA',TO=0.35;
box([3,13,0],[18,13,0.2],TC,'TRAY',TO);
box([3,13,0.2],[18,0.2,3.0],TC,'TRAY',TO);
box([3,25.8,0.2],[18,0.2,3.0],TC,'TRAY',TO);
box([3,13.2,0.2],[0.2,12.6,3.0],TC,'TRAY',TO);
box([20.8,13.2,0.2],[0.2,12.6,3.0],TC,'TRAY',TO);
// water puddle
CUR=0;
const shp=new THREE.Shape(PUDDLE.map(([x,y])=>new THREE.Vector2(x-20,y-15)));
const WATERMAT=()=>new THREE.MeshPhysicalMaterial({color:'#3b8cff',transparent:true,opacity:0.72,side:THREE.DoubleSide,roughness:0.03,metalness:0,clearcoat:1,clearcoatRoughness:0.02,envMapIntensity:1.6});
const pud=new THREE.Mesh(new THREE.ShapeGeometry(shp),WATERMAT());pud.receiveShadow=true;
pud.rotation.x=Math.PI/2;pud.position.y=0.22;scene.add(pud);reg(pud,'WATER','water',0.7);
// 10 stand, 9 sensor (+ gold traces)
CUR=10;box([10.2,18.2,0.2],[2.6,2.2,5.4],CARD,'CARDBOARD');
CUR=9;box([10.3,20.4,0.35],[2.0,0.18,6.2],'#C62828','ELECTRONICS');
for(let k=0;k<5;k++)box([10.48+k*0.38,20.585,0.55],[0.12,0.02,3.8],'#E8B84A','ELECTRONICS',1,{noEdges:true,kind:'gold'});
for(let k=0;k<3;k++)box([10.75+k*0.5,20.45,6.55],[0.12,0.12,0.8],'#D4AF37','ELECTRONICS',1,{noEdges:true,kind:'gold'});
// 11 sensor cable (3 wires), 12 USB cable
function tube(pts,r,color,layer,dx=0){const curve=new THREE.CatmullRomCurve3(pts.map(p=>W(p[0]+dx,p[1],p[2])),false,'catmullrom',0.5);
  const m=new THREE.Mesh(new THREE.TubeGeometry(curve,80,r,10,false),new THREE.MeshStandardMaterial({color,roughness:0.42}));m.castShadow=true;scene.add(m);reg(m,layer,'cable');return m;}
CUR=11;['#E53935','#212121','#FFB300'].forEach((c,i)=>tube(SENSOR_CABLE,0.13,c,'WIRING',(i-1)*0.32));
CUR=12;tube(USB_CABLE,0.25,'#37474F','WIRING');
// drops
CUR=0;
const drops=[];for(let i=0;i<3;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(0.28,20,14),WATERMAT());d.material.opacity=0.9;
  d.scale.set(1,1.5,1);scene.add(d);drops.push(d);reg(d,'WATER','drop');}
const ripples=[];for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.RingGeometry(0.85,1,48),new THREE.MeshBasicMaterial({color:'#dff0ff',transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));
  r.rotation.x=-Math.PI/2;r.position.copy(W(6.4,17.3,0.26));scene.add(r);ripples.push(r);reg(r,'WATER','drop');}

// balloons
const BAL=[[1,[38,28,0]],[2,[36,1.5,27]],[3,[30,6,25]],[4,[23.5,10.5,21.5]],[5,[27,5,14.8]],[6,[13,8.5,22]],[7,[6.4,9,24.6]],[8,[21,26,3.2]],[9,[12.3,20.6,4]],[10,[12.8,19,5.6]],[11,[13.5,12.5,11.8]],[12,[35,7,8]]];
const balloons=BAL.map(([n,p])=>{const d=document.createElement('div');d.className='balloon3d';d.textContent=n;
  const lay=PART_LAYER[n];d.style.borderColor=LAYERS[lay].c;const o=new CSS2DObject(d);o.position.copy(W(...p));scene.add(o);return {n,o,d,lay};});
const SOLID=REG.filter(r=>r.type==='face'||r.type==='cable'||r.type==='screen');
const PICK=SOLID.map(r=>r.obj);

/* ---------- state ---------- */
let mode='real',showBal=true;
const PICKC=new THREE.Color('#4FA3FF'),BLACK=new THREE.Color(0);
function apply(){
  const sel=WLD.sel,xray=mode==='xray',real=!xray;
  REG.forEach(r=>{const on=layerOn[r.layer];let vis=on;
    const picked=sel!==null&&r.id===sel,ghost=!picked&&(sel!==null||(xray&&r.type==='face'));
    if(r.type==='face'||r.type==='cable'||r.type==='screen'){[].concat(r.obj.material).forEach(m=>{
      if(ghost){m.transparent=true;m.opacity=Math.min(r.base,sel!==null?0.1:0.16);m.depthWrite=false;}
      else{const op=r.base;m.transparent=op<1;m.opacity=op;m.depthWrite=op>=1;}
      if(m.emissive){m.emissive.copy(picked?PICKC:BLACK);m.emissiveIntensity=picked?0.5:1;}
      m.needsUpdate=true;});}
    if(r.type==='edge'){vis=on&&(xray||r.keepReal||picked);r.obj.material.color.set(picked?'#9FD0FF':LAYERS[r.layer].c);r.obj.material.opacity=picked?1:sel!==null?0.15:xray?0.9:0.35;}
    if(r.type==='water'||r.type==='drop')vis=on&&WLD.leak;
    r.obj.visible=vis;});
  balloons.forEach(b=>{const picked=sel===b.n;b.o.visible=layerOn[b.lay]&&(picked||(showBal&&layerOn.ANNO));
    b.d.style.display=b.o.visible?'grid':'none';b.d.classList.toggle('on',picked);b.d.classList.toggle('dim',sel!==null&&!picked);});
  scene.background=real?BG:FLAT;scene.environment=real?ENV:null;
  sun.castShadow=real;catcher.visible=real;grid.visible=!real;hemi.intensity=real?0.55:1.0;sun.intensity=real?2.4:1.6;
  document.getElementById('v3style').textContent=real?'Normal':'X-ray';
}
window.addEventListener('layerchange',apply);
window.addEventListener('leakchange',apply);
window.addEventListener('lcd',e=>drawLCD(...e.detail));

/* ---------- camera ---------- */
const VIEWSET={se:[1,0.8,1],sw:[-1,0.8,1],front:[0,0.12,1],top:[0,1,0.0001],right:[1,0.12,0],lcd:[0.22,0.12,1]};
const VNAME={se:'Overview',sw:'Other side',front:'Front',top:'From above',right:'Right side',lcd:'Screen close-up'};
const HOME=new THREE.Vector3(0,9,0);
let goal=null,goalT=null,curView='se';
const fit=()=>Math.max(1,1.3/camera.aspect); // pull back on narrow viewports
function goTo(t,p,instant){if(instant||RM.matches){camera.position.copy(p);controls.target.copy(t);goal=goalT=null;}else{goal=p;goalT=t;}}
function setView(k,instant){curView=k;const t=k==='lcd'?W(20,10.5,19.2):HOME.clone();
  const d=new THREE.Vector3(...VIEWSET[k]).normalize().multiplyScalar((k==='lcd'?19:108)*fit());goTo(t,t.clone().add(d),instant);
  document.getElementById('v3name').textContent=VNAME[k];
  document.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.view===k)));}
function frameSel(){
  if(WLD.sel===null){setView(curView);return;}
  const bb=new THREE.Box3();SOLID.forEach(r=>{if(r.id===WLD.sel)bb.expandByObject(r.obj);});
  if(bb.isEmpty())return;
  const c=bb.getCenter(new THREE.Vector3()),size=bb.getSize(new THREE.Vector3()).length();
  const dir=camera.position.clone().sub(controls.target).normalize();
  goTo(c,c.clone().add(dir.multiplyScalar(Math.min(Math.max(size*2.6,22),108)*fit())));
  document.getElementById('v3name').textContent=BOM.find(b=>b[0]===WLD.sel)[1];
  document.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed','false'));}
window.addEventListener('selchange',()=>{apply();frameSel();});
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));apply();}));
const balBtn=document.getElementById('balBtn');
balBtn.addEventListener('click',()=>{showBal=!showBal;balBtn.setAttribute('aria-pressed',String(showBal));apply();});
function zoom(k){const t=(goalT||controls.target).clone(),off=(goal||camera.position).clone().sub(t).multiplyScalar(k);
  off.setLength(THREE.MathUtils.clamp(off.length(),controls.minDistance,controls.maxDistance));goTo(t,t.clone().add(off));}
document.getElementById('zoomIn').addEventListener('click',()=>zoom(0.8));
document.getElementById('zoomOut').addEventListener('click',()=>zoom(1.25));
controls.addEventListener('start',()=>{goal=goalT=null;document.getElementById('v3name').textContent='Your view';
  document.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed','false'));});

// click (not drag) on a part selects it; click on empty space clears the selection
const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();let down=null;
renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
renderer.domElement.addEventListener('pointerup',e=>{if(!down)return;const moved=Math.hypot(e.clientX-down[0],e.clientY-down[1]);down=null;if(moved>(e.pointerType==='touch'?10:4))return;
  const rc=renderer.domElement.getBoundingClientRect();ptr.set((e.clientX-rc.left)/rc.width*2-1,-(e.clientY-rc.top)/rc.height*2+1);
  ray.setFromCamera(ptr,camera);
  const hit=ray.intersectObjects(PICK,false).find(h=>h.object.visible&&h.object.userData.id>0);
  const id=hit?hit.object.userData.id:null;selectPart(id===WLD.sel?null:id);});

function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);labelR.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);resize();
const [l1,l2]=lcdLines();drawLCD(l1,l2);
setView('se',true);apply();
loading.hidden=true;

let inView=true;new IntersectionObserver(([en])=>{inView=en.isIntersecting;}).observe(host);
function animate(t){requestAnimationFrame(animate);if(!inView)return;
  if(goal){camera.position.lerp(goal,0.14);controls.target.lerp(goalT,0.14);if(camera.position.distanceTo(goal)<0.05){camera.position.copy(goal);controls.target.copy(goalT);goal=goalT=null;}}
  controls.update();
  const ph0=RM.matches?0.45:t/1300;
  drops.forEach((d,i)=>{const ph=(ph0+i/3)%1;d.position.copy(W(6.4,17.3,16.1-ph*15.8));});
  ripples.forEach((r,i)=>{const k=(ph0+i/3+0.02)%1;r.scale.setScalar(0.3+k*2.6);r.material.opacity=0.55*(1-k);});
  renderer.render(scene,camera);labelR.render(scene,camera);}
requestAnimationFrame(animate);

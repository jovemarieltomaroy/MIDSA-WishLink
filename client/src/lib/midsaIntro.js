// Adapted from the updated midsa-intro (1)/midsa-intro.js supplied by the user.
// Keep React's image target and cleanup instead of appending children into an img.
/* MiDS Katuparan logo-build intro. No dependencies.
   MidsIntro.play({ target:'#logoSlot', page:'#page', assets:'./assets/', onDone(){} }) */

const W=1656,H=791;
const CSS=`.mi-overlay{position:fixed;inset:0;z-index:99999;background:transparent}
.mi-bg{position:absolute;inset:0;background:#fff}
.mi-stage{position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:0 0}
.mi-stage img,.mi-stage svg{position:absolute;display:block;user-select:none;-webkit-user-drag:none}
.mi-spark{position:absolute;width:14px;height:14px;margin:-7px 0 0 -7px;pointer-events:none;opacity:0}
.mi-spark svg{position:static;width:100%;height:100%}`;
function bez(x1,y1,x2,y2){const cx=3*x1,bx=3*(x2-x1)-cx,ax=1-cx-bx,cy=3*y1,by=3*(y2-y1)-cy,ay=1-cy-by;
 const X=t=>((ax*t+bx)*t+cx)*t,Y=t=>((ay*t+by)*t+cy)*t;
 return x=>{if(x<=0)return 0;if(x>=1)return 1;let t=x;for(let i=0;i<8;i++){const d=(3*ax*t+2*bx)*t+cx;if(Math.abs(d)<1e-6)break;t-=(X(t)-x)/d}return Y(t)}}
const outExpo=bez(.22,1,.36,1),travel=bez(.35,0,.15,1),inOut=bez(.45,0,.2,1);
const cl=v=>Math.min(1,Math.max(0,v)),seg=(t,a,d)=>cl((t-a)/d);
const cub=(t,a,b,c,d)=>{const u=1-t;return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d};
const SP='<svg viewBox="0 0 20 20"><path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8Z" fill="#fff3b0"/></svg>';
let current=null;

export function playMidsIntro(opts){
  opts=Object.assign({target:'#logoSlot',page:null,assets:'./assets/',onDone:null},opts||{});
  if(current)current.cancel();
  const slot=typeof opts.target==='string'?document.querySelector(opts.target):opts.target, page=typeof opts.page==='string'?document.querySelector(opts.page):opts.page;
  const originalVisibility=slot?.style.visibility;
  // The header uses object-fit: cover on a square PNG with transparent margins.
  // Land on the visible artwork, rather than the surrounding image element.
  const targetRect=()=>{const r=slot.getBoundingClientRect(),size=Math.max(r.width,r.height),w=size*1698/2000;return {left:r.left+(r.width-size)/2+size*173/2000,top:r.top+(r.height-size)/2+size*595/2000,width:w}};
  if(!slot)throw new Error('MidsIntro: target not found');
  if(!document.getElementById('mi-css')){const s=document.createElement('style');s.id='mi-css';s.textContent=CSS;document.head.appendChild(s)}
  const a=opts.assets;
  const overlay=document.createElement('div');overlay.className='mi-overlay';
  overlay.innerHTML=`<div class="mi-bg"></div><div class="mi-stage">
   <svg style="left:8px;top:7px;width:1284px;height:502px" viewBox="0 0 1284 502"><defs><mask id="mi-m" maskUnits="userSpaceOnUse" x="0" y="0" width="1284" height="502">
    <g fill="none" stroke="#fff" stroke-width="120" stroke-linecap="round" stroke-linejoin="round">
     <path pathLength="1" d="M35 458 L60 88 L195 358 L350 38 L410 478"/>
     <path pathLength="1" d="M500 210 L488 470"/>
     <path pathLength="1" d="M615 46 L618 460 C720 480 840 400 880 280 C910 170 830 60 700 48 L625 44"/>
     <path pathLength="1" d="M1250 73 C1180 55 1050 40 985 100 C940 160 1000 215 1090 238 C1190 270 1250 320 1225 390 C1190 470 1080 470 980 440 L895 405"/>
    </g><circle cx="490" cy="92" r="0" fill="#fff"/></mask></defs>
    <image href="${a.mids}" width="1284" height="502" mask="url(#mi-m)"/></svg>
   <img class="mi-tree" src="${a.tree}" alt="" style="left:1273px;top:97px;width:375px;height:418px;opacity:0">
   <img class="mi-kat" src="${a.kat}" alt="" style="left:222px;top:384px;width:1174px;height:399px;opacity:0">
   <img class="mi-mark" src="${a.mark}" alt="MIDSA" style="left:1416px;top:39px;width:94px;height:87.8px;opacity:0">
   <div class="mi-sparks"></div></div>`;
  document.body.appendChild(overlay);
  const stage=overlay.querySelector('.mi-stage'),bg=overlay.querySelector('.mi-bg'),
    tree=overlay.querySelector('.mi-tree'),kat=overlay.querySelector('.mi-kat'),mark=overlay.querySelector('.mi-mark'),
    layer=overlay.querySelector('.mi-sparks'),star=overlay.querySelector('circle'),
    pe=[...overlay.querySelectorAll('path[pathLength]')];
  const paths={p0:pe[0],p1:pe[1],p3:pe[2],p4:pe[3]};const lens={};
  for(const k in paths){lens[k]=paths[k].getTotalLength();paths[k].style.strokeDasharray='1 1';paths[k].style.strokeDashoffset=1}
  const T={start:250,draw:1250,reveal:1550,revealD:560,markIn:1850,travel:2150,travelD:900,settleD:300,hold:500,trans:900};
  T.settle=T.travel+T.travelD;T.holdAt=T.settle+T.settleD;T.transAt=T.holdAt+T.hold;T.end=T.transAt+T.trans;
  const strokes=[['p0',0,.38],['p1',.38,.52],['star',.52,.64],['p3',.64,.84],['p4',.84,1]];
  const F={x:1416+47,y:39+43.9},S={x:-300,y:380},c1={x:200,y:-140},c2={x:950,y:-110};
  const dl=Math.hypot(F.x-c2.x,F.y-c2.y),dir={x:(F.x-c2.x)/dl,y:(F.y-c2.y)/dl},OV=9;
  const O={x:F.x+dir.x*OV,y:F.y+dir.y*OV},e2={x:c2.x+dir.x*OV*.6,y:c2.y+dir.y*OV*.6};
  const markPos=t=>{if(t<T.travel)return S;
    if(t<T.settle){const u=travel(seg(t,T.travel,T.travelD));return{x:cub(u,S.x,c1.x,e2.x,O.x),y:cub(u,S.y,c1.y,e2.y,O.y)}}
    if(t<T.holdAt){const u=inOut(seg(t,T.settle,T.settleD));return{x:O.x+(F.x-O.x)*u,y:O.y+(F.y-O.y)*u}}return F};
  let sparks=[],lastSpark=-1,lastTrail=-1,burst=false,raf,t0=null,dead=false,rect0;
  const layout=()=>{const vw=innerWidth,vh=innerHeight,w=Math.min(vw*.8,1100,vh*.6*W/H);
    rect0={l:(vw-w)/2,t:(vh-w*H/W)/2,w};S.x=-(rect0.l+140)*W/w};
  const tip=f=>{for(const[id,s,e]of strokes)if(f>=s&&f<=e){if(id==='star')return{x:498,y:99};
    const pt=paths[id].getPointAtLength(lens[id]*(f-s)/(e-s));return{x:8+pt.x,y:7+pt.y}}return null};
  const spawnAt=(p,now,r0,r1)=>{if(!p)return;const el=document.createElement('div');el.className='mi-spark';el.innerHTML=SP;
    const an=Math.random()*6.28,r=r0+Math.random()*(r1-r0);
    el.style.left=p.x+Math.cos(an)*r+'px';el.style.top=p.y+Math.sin(an)*r+'px';layer.appendChild(el);
    sparks.push({el,born:now,life:520+Math.random()*180,sz:.5+Math.random()*.7})};
  const updSparks=now=>{sparks=sparks.filter(s=>{const u=(now-s.born)/s.life;if(u>=1){s.el.remove();return false}
    const o=Math.sin(Math.PI*u);s.el.style.opacity=o*.95;s.el.style.transform=`scale(${s.sz*(.4+.8*o)}) rotate(${u*50}deg)`;return true})};
  function finish(){dead=true;overlay.remove();slot.style.visibility=originalVisibility;if(page)page.style.opacity='';
    removeEventListener('resize',onResize);current=null;opts.onDone&&opts.onDone()}
  const onResize=()=>layout();addEventListener('resize',onResize);
  function frame(now){if(dead)return;if(t0===null)t0=now;const t=now-t0;
    const f=seg(t,T.start,T.draw);
    for(const[id,s,e]of strokes){const k=cl((f-s)/(e-s));if(id==='star')star.setAttribute('r',90*inOut(k));else paths[id].style.strokeDashoffset=1-k*k*(3-2*k)}
    if(f>0&&f<1&&now-lastSpark>42){lastSpark=now;spawnAt(tip(f),now,30,76)}
    const ur=outExpo(seg(t,T.reveal,T.revealD)),ut=outExpo(seg(t,T.reveal+60,T.revealD));
    kat.style.opacity=ur;kat.style.transform=`scale(${.93+.07*ur})`;kat.style.transformOrigin='50% 50%';
    tree.style.opacity=ut;tree.style.transform=`scale(${.93+.07*ut})`;tree.style.transformOrigin='50% 100%';
    mark.style.opacity=inOut(seg(t,T.markIn,280));const p=markPos(t);mark.style.transform=`translate(${p.x-F.x}px,${p.y-F.y}px)`;
    if(t>T.travel&&t<T.settle&&now-lastTrail>55){lastTrail=now;spawnAt(p,now,8,34)}
    if(t>=T.settle&&!burst){burst=true;for(let i=0;i<8;i++)spawnAt(F,now,28,66)}
    updSparks(now);
    const tt=seg(t,T.transAt,T.trans);
    if(tt>0){const e=outExpo(tt),r1=targetRect(),s=(rect0.w+(r1.width-rect0.w)*e)/W;
      stage.style.transform=`translate(${rect0.l+(r1.left-rect0.l)*e}px,${rect0.t+(r1.top-rect0.t)*e}px) scale(${s})`;
      bg.style.opacity=1-e;if(page)page.style.opacity=e}
    else stage.style.transform=`translate(${rect0.l}px,${rect0.t}px) scale(${rect0.w/W})`;
    if(t<T.end)raf=requestAnimationFrame(frame);else finish()}
  layout();slot.style.visibility='hidden';if(page)page.style.opacity=0;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){tree.style.opacity=kat.style.opacity=mark.style.opacity=1;
    mark.style.transform='none';star.setAttribute('r',90);for(const k in paths)paths[k].style.strokeDashoffset=0;finish()}
  else raf=requestAnimationFrame(frame);
  current={cancel(){dead=true;cancelAnimationFrame(raf);overlay.remove();stage.remove();slot.style.visibility=originalVisibility;if(page)page.style.opacity='';removeEventListener('resize',onResize)}};
  const playback=current;
  return ()=>{playback?.cancel();if(current===playback)current=null};
}


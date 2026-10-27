// Draws the Turquill emblem's still layer (2026-10-26; the host's words: "create a new logo for it", then "maybe a quill
// and a sword", "abandon the T shape of it" and "Finer sword"): the Questbound emblem's still layer
// (public/emblem/core-v2.webp: the Q, its dagger and the inner circle with its suns, moons and dots) with the Q and the
// dagger taken out, and in their place a SWORD and a QUILL crossed in a saltire, as on a coat of arms. The sword's hilt
// (a small star pommel, a long wrapped grip, a thin straight crossguard with diamond finials and a gem) is to the upper
// left and its slender fullered blade's point, with a gleam, to the lower right; the quill's pointed feather (both vanes,
// deep splits along the barbs) is to the upper right and its bare shaft and split nib, with a drop of ink, to the lower
// left (--mirror swaps the sides). They cross at the middle behind a faceted four-point star with a diamond at its heart,
// like the ring's own stars. The arms lean 36 degrees from upright (--angle N), so they pass between the suns and moons
// and stay within about 300 px of the middle. Each part is drawn upright and laid on its diagonal by a transform, its
// lighting turned back so the light still falls from the upper left. The parts carry chiselled bevels and the painted
// Q's marbled crimson stone, and a colour pass matches their saturation, green and value to the old Q as painted
// (assets/title/questbound-seal-source.webp cut as make-emblem.cjs cuts it), turning hues 8 degrees toward its
// crimson-rose (--hue N). The serpent ring (ring-v2.webp) is unchanged: it was already whole under the dagger.
// Writes public/emblem/core-v3.webp (make-turquill-emblem.cjs makes the other pictures from it); --png F and --svg F also
// write those. The report prints the balance (centroid, quadrants), the colour figures and any overlap with the suns,
// the moons, the small diamond or the inner circle's arcs. --quill-at S moves the crossing along the quill.
// Run: node make-turquill-core.cjs [--png out.png] [--svg out.svg]   (headless Chrome or Edge; no internet needed)
const fs=require('node:fs'),path=require('node:path');
const {start}=require(process.env.QB_CDP||'C:/Users/itsbr/qb-work/tools/cdp.cjs');
const here=__dirname,CORE=path.join(here,'public/emblem/core-v2.webp'),SOURCE=path.join(here,'assets/title/questbound-seal-source.webp'),OUT=path.join(here,'public/emblem/core-v3.webp');
const args=process.argv.slice(2),opt=(k,d)=>args.includes(k)?args[args.indexOf(k)+1]:d;
const MIRROR=args.includes('--mirror'),ANG=Number(opt('--angle',36)),PNG=opt('--png',null),SVG=opt('--svg',null),HUE=Number(opt('--hue',8));

// ---- geometry helpers (all in the still layer's 1024 x 1024 pixels) ------------------------------------------------
const f=n=>(Math.round(n*10)/10).toString();
const P=pts=>pts.map((p,i)=>(i?'L':'M')+f(p[0])+' '+f(p[1])).join(' ');
const cub=(a,b,c,d,t)=>{const u=1-t;return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]];};
const cubD=(a,b,c,d,t)=>{const u=1-t;return [3*u*u*(b[0]-a[0])+6*u*t*(c[0]-b[0])+3*t*t*(d[0]-c[0]),3*u*u*(b[1]-a[1])+6*u*t*(c[1]-b[1])+3*t*t*(d[1]-c[1])];};
const norm=v=>{const l=Math.hypot(v[0],v[1])||1;return [v[0]/l,v[1]/l];};
const smooth=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
const ink='#2c0312',X=513;   // the sword's axis; the small diamond under the old Q sits at x 505..525, y 776..798

// ---- the quill: the crossbar ---------------------------------------------------------------------------------------
// The rachis runs from the feather's tip (left, swept up a little) to where the vanes end; then the bare shaft and nib.
const R0=[328,252],R1=[396,264],R2=[484,292],R3=[690,303];
const rach=t=>cub(R0,R1,R2,R3,t),rachT=t=>norm(cubD(R0,R1,R2,R3,t));
// Widths along the rachis (s=0 the tip, 1 the base): a rounded tip, a long body, a taper into the down at the base.
// The vane tapers and curves to a point (a rounded tip read as a paddle).
const body=(s,tip,base)=>{const a=s<tip?Math.pow(Math.sin(Math.PI/2*s/tip),1.25):1;const b=s>base?1-0.9*((s-base)/(1-base))**1.5:1;return a*b;};
// Three deep splits in the wide vane and one in the narrow, running in along the barbs.
const lowNotches=[[0.33,0.86,0.024],[0.52,0.9,0.026],[0.69,0.8,0.024]];
const upNotches=[[0.45,0.82,0.026]];
const notched=(s,list)=>list.reduce((m,[at,depth,half])=>{const d=Math.abs(s-at);return d<half?m*(1-depth*(1-d/half)):m;},1);
const ragged=(s,seed)=>1-0.03*Math.abs(Math.sin(s*181+seed))-0.025*Math.abs(Math.sin(s*67+seed*3))-0.025*((s*97+seed)%1);
const lowerW=s=>64*body(s,0.56,0.82)*notched(s,lowNotches)*ragged(s,1.3);
const upperW=s=>40*body(s,0.5,0.82)*notched(s,upNotches)*ragged(s,4.1);
const slant=s=>0.25+0.5*smooth(s/0.45);   // the barbs lean toward the tip
const normalOf=(t,side)=>side>0?[-t[1],t[0]]:[t[1],-t[0]];   // side +1: below the rachis (the wide vane); -1: above
const edgeAt=(s,side)=>{const p=rach(s),t=rachT(s),n=normalOf(t,side),w=side>0?lowerW(s):upperW(s),k=slant(s);
 return [p[0]+n[0]*w-t[0]*w*k,p[1]+n[1]*w-t[1]*w*k];};
const N=700,ss=[...Array(N+1)].map((_,i)=>i/N);
const vane=side=>P([...ss.map(s=>edgeAt(s,side)),...ss.map(s=>rach(s)).reverse()])+' Z';
const vaneLower=vane(1),vaneUpper=vane(-1);
// The notches: dark clefts where the barbs part, running in along the barbs, each lit on its far (tip-ward) lip.
const clefts=(side,list)=>list.map(([at,depth])=>{const e=edgeAt(at,side),p=rach(at);const q=[e[0]+(p[0]-e[0])*(0.35+0.45*depth),e[1]+(p[1]-e[1])*(0.35+0.45*depth)];
 const t=rachT(at),a=[e[0]-t[0]*2.2,e[1]-t[1]*2.2],b=[e[0]+t[0]*2.2,e[1]+t[1]*2.2],lip=[q[0]-t[0]*1.4,q[1]-t[1]*1.4];
 return `<path d="${P([a,q,b])} Z" fill="#1c010b" opacity=".9"/><path d="${P([[a[0]-t[0]*1.4,a[1]-t[1]*1.4],lip])}" stroke="#ffb3d1" stroke-opacity=".75" stroke-width="1.5" fill="none"/>`;}).join('');
// The vane as strips, one per barb, each shaded from the rachis (lit) to its edge (deep), so the colour follows the feather.
const strips=(side,n,stops,seed)=>{let defs='',body='';for(let i=0;i<n;i++){const a=i/n,b=(i+1)/n,m=(a+b)/2;
 const ra=rach(a),rb=rach(Math.min(1,b+0.002)),ea=edgeAt(a,side),eb=edgeAt(Math.min(1,b+0.002),side),rm=rach(m),em=edgeAt(m,side);
 const j=0.86+0.22*(0.5+0.5*Math.sin(i*2.39+seed))*(0.5+0.5*Math.sin(i*0.61+seed*2));   // barb to barb, a little lighter or darker
 const id='s'+(side>0?'L':'U')+i;
 defs+=`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(rm[0])}" y1="${f(rm[1])}" x2="${f(em[0])}" y2="${f(em[1])}">${stops.map(([o,c])=>`<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
 body+=`<path d="${P([ra,rb,eb,ea])} Z" fill="url(#${id})" opacity="${f(Math.min(1,j))}"/>`;}
 return {defs,body};};
// The barbs: fine grooves and ridges from the rachis out to the edge, each curving a little toward the tip.
const barbs=(side,step,dark,light,da,la)=>{let s='',i=0;for(let v=step*0.8;v<0.99;v+=step*(0.65+0.7*(0.5+0.5*Math.sin(i++*2.17+side)))){const p=rach(v),t=rachT(v),e=edgeAt(Math.min(1,v+0.004),side),n=normalOf(t,side);
 const m=[(p[0]+e[0])/2+n[0]*2.5+t[0]*2.4,(p[1]+e[1])/2+n[1]*2.5+t[1]*2.4];
 s+=`<path d="M${f(p[0])} ${f(p[1])} Q ${f(m[0])} ${f(m[1])} ${f(e[0]-t[0]*5)} ${f(e[1]-t[1]*5)}" stroke="${dark}" stroke-width="1.7" stroke-opacity="${da}" fill="none"/>`;
 s+=`<path d="M${f(p[0]+t[0]*2.4)} ${f(p[1]+t[1]*2.4)} Q ${f(m[0]+t[0]*2.4)} ${f(m[1]+t[1]*2.4)} ${f(e[0]-t[0]*3)} ${f(e[1]-t[1]*3)}" stroke="${light}" stroke-width="1" stroke-opacity="${la}" fill="none"/>`;}return s;};
// A soft gloss along each vane, a little out from the rachis: the painting's satin sheen.
const glossLine=(side,from,to,off)=>{const a=[];for(const s of ss.filter(s=>s>=from&&s<=to)){const p=rach(s),t=rachT(s),n=normalOf(t,side),w=(side>0?lowerW(s):upperW(s))*off;a.push([p[0]+n[0]*w-t[0]*w*0.5,p[1]+n[1]*w-t[1]*w*0.5]);}return P(a);};
// Down at the base of the vanes: a few loose wisps.
const wisps=(()=>{let s='';for(const [v,len,side] of [[0.9,26,1],[0.93,22,1],[0.955,18,1],[0.975,14,1],[0.92,13,-1],[0.95,11,-1]]){const p=rach(v),t=rachT(v),n=normalOf(t,side);
 const e=[p[0]+n[0]*len-t[0]*len*0.25,p[1]+n[1]*len-t[1]*len*0.25],m=[p[0]+n[0]*len*0.6+t[0]*len*0.25,p[1]+n[1]*len*0.6+t[1]*len*0.25];
 s+=`<path d="M${f(p[0])} ${f(p[1])} Q ${f(m[0])} ${f(m[1])} ${f(e[0])} ${f(e[1])}" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M${f(p[0])} ${f(p[1])} Q ${f(m[0])} ${f(m[1])} ${f(e[0])} ${f(e[1])}" stroke="#e5127d" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;}return s;})();
// The rachis: a tapering ribbon, bright on its upper side.
const ribbon=(w0,w1,from=0,to=1)=>{const a=[],b=[];for(const s of ss.filter(s=>s>=from&&s<=to)){const p=rach(s),t=rachT(s),w=(w0+(w1-w0)*s)/2;a.push([p[0]+t[1]*w,p[1]-t[0]*w]);b.push([p[0]-t[1]*w,p[1]+t[0]*w]);}return P([...a,...b.reverse()])+' Z';};
const rachisPath=ribbon(5,18),rachisInk=ribbon(11,27);
const rachisHi=(()=>{const a=[];for(const s of ss.filter(s=>s>0.02&&s<0.995)){const p=rach(s),t=rachT(s),w=(5+13*s)/2;a.push([p[0]+t[1]*w*0.4,p[1]-t[0]*w*0.4]);}return P(a);})();
// The bare shaft (calamus), about 40 px across and tapering to the cut, then the split nib, pointing right. No bands:
// rings made it read as a pen barrel.
const sy=303.5,sx0=680,sx1=812,tip=[860,306];
const shaft=`M${sx0} ${sy-17} C ${sx0+30} ${sy-22}, ${sx1-40} ${sy-17.5}, ${sx1} ${sy-13.5} L ${sx1} ${sy+13.5} C ${sx1-40} ${sy+17.5}, ${sx0+30} ${sy+22}, ${sx0} ${sy+17} Z`;
const nib=`M${sx1-3} ${sy-13.5} C ${sx1+8} ${sy-13.5}, ${sx1+12} ${sy-5}, ${sx1+22} ${sy-2.5} C ${sx1+32} ${sy-0.5}, ${tip[0]-10} ${tip[1]-2.5}, ${tip[0]} ${tip[1]} C ${tip[0]-12} ${tip[1]+5}, ${sx1+22} ${sy+13.5}, ${sx1-3} ${sy+13.5} Z`;
const nibScoop=`M${sx1+1} ${sy-10.5} C ${sx1+9} ${sy-10}, ${sx1+12} ${sy-5}, ${sx1+22} ${sy-2.5} C ${sx1+16} ${sy-0.8}, ${sx1+7} ${sy-3}, ${sx1+1} ${sy-5} Z`;

// ---- the sword: the upright ----------------------------------------------------------------------------------------
// A slender blade (half-widths 28 at the root and 24 where it starts to taper; "Finer sword", the host on 2026-10-26).
const bTop=396,bTip=[X,772],hw0=28,hw1=24,yK=650,bev=9;
// The blade's outline from its root to its point on one side (s -1 left, +1 right), k pixels in from the edge.
const side=(s,k)=>`${X+s*(hw0-k)} ${bTop} L ${X+s*(hw1-k*0.95)} ${yK} C ${X+s*(hw1-1-k*0.9)} 694, ${X+s*(hw1*0.55-k*0.55)} 740, ${bTip[0]} ${bTip[1]}`;
const blade=`M${side(-1,0)} C ${X+hw1*0.55} 740, ${X+hw1-1} 694, ${X+hw1} ${yK} L ${X+hw0} ${bTop} Z`;
const inner=k=>'M'+side(-1,k),innerR=k=>'M'+side(1,k);
const halfL=`M${X} ${bTop} L ${side(-1,0)} Z`,halfR=`M${X} ${bTop} L ${side(1,0)} Z`;
const bevelStrip=left=>{const s=left?-1:1;return `M${side(s,0)} C ${X+s*(hw1*0.55-bev*0.55)} 740, ${X+s*(hw1-1-bev*0.9)} 694, ${X+s*(hw1-bev*0.95)} ${yK} L ${X+s*(hw0-bev)} ${bTop} Z`;};
const fT=428,fB=622;
const fuller=`M${X-6} ${fT} L ${X-4.5} ${fB} C ${X-4} ${fB+10}, ${X-2} ${fB+18}, ${X} ${fB+22} C ${X+2} ${fB+18}, ${X+4} ${fB+10}, ${X+4.5} ${fB} L ${X+6} ${fT} C ${X+4} ${fT-7}, ${X-4} ${fT-7}, ${X-6} ${fT} Z`;
// The crossguard: a thin straight bar (thickest at the middle, tapering to the ends, which droop a little toward
// the blade), each end a small faceted diamond, and a small lozenge over the blade's root holding a gem.
const gC=386,gL=86,gT=6.5,gE=4,gD=3;
const barHi=`M${X-gL} ${gC+gD-gE} L ${X} ${gC-gT} L ${X+gL} ${gC+gD-gE} L ${X+gL} ${gC+gD} L ${X} ${gC} L ${X-gL} ${gC+gD} Z`;
const barLo=`M${X-gL} ${gC+gD} L ${X} ${gC} L ${X+gL} ${gC+gD} L ${X+gL} ${gC+gD+gE} L ${X} ${gC+gT} L ${X-gL} ${gC+gD+gE} Z`;
const bar=`M${X-gL} ${gC+gD-gE} L ${X} ${gC-gT} L ${X+gL} ${gC+gD-gE} L ${X+gL} ${gC+gD+gE} L ${X} ${gC+gT} L ${X-gL} ${gC+gD+gE} Z`;
const finAt=s=>[X+s*(gL+7),gC+gD],fin=s=>{const [cx,cy]=finAt(s);return [[cx,cy-10],[cx+9,cy],[cx,cy+10],[cx-9,cy]];};
const loz=[[X,gC-20],[X+15,gC+1],[X,gC+28],[X-15,gC+1]],lozC=[X,gC+3];
const lozenge=P(loz)+' Z';
const guard=[bar,P(fin(-1))+' Z',P(fin(1))+' Z',lozenge].join(' ');
const gemD=(cx,cy,r)=>`M${cx} ${cy-r} L ${cx+r*0.82} ${cy} L ${cx} ${cy+r} L ${cx-r*0.82} ${cy} Z`;
const grip=`M${X-9.5} 262 L ${X+9.5} 262 L ${X+11} 380 L ${X-11} 380 Z`;
// The pommel: a four-point star, as on the old Q's crown and the ring's own stars; its lower arm goes into the grip.
const star=(cx,cy,up,side,down,w)=>`M${cx} ${cy-up} C ${cx+w*0.3} ${cy-w*1.2}, ${cx+w*1} ${cy-w*0.55}, ${cx+side} ${cy} C ${cx+w*1} ${cy+w*0.55}, ${cx+w*0.3} ${cy+w*1.2}, ${cx} ${cy+down} C ${cx-w*0.3} ${cy+w*1.2}, ${cx-w*1} ${cy+w*0.55}, ${cx-side} ${cy} C ${cx-w*1} ${cy-w*0.55}, ${cx-w*0.3} ${cy-w*1.2}, ${cx} ${cy-up} Z`;
const PC=[X,234],pU=32,pS=24,pD=36;
const pommel=star(PC[0],PC[1],pU,pS,pD,9);
// Eight facets for a star: each arm a lit half and a shaded half, lit from the upper left.
const facets=(cx,cy,up,side,down,w,cols)=>{const c=[cx,cy],T=[cx,cy-up],Rr=[cx+side,cy],B=[cx,cy+down],L=[cx-side,cy];
 const tl=[cx-w,cy-w],tr=[cx+w,cy-w],br=[cx+w,cy+w],bl=[cx-w,cy+w];
 return [[T,tl,cols[0]],[T,tr,cols[3]],[Rr,tr,cols[1]],[Rr,br,cols[4]],[B,br,cols[5]],[B,bl,cols[4]],[L,bl,cols[2]],[L,tl,cols[1]]]
  .map(([a,b,col])=>`<path d="${P([a,b,c])} Z" fill="${col}"/>`).join('');};
const litCols=['#ffe0ec','#ff8fbe','#e5127d','#c3125a','#8a0b40','#5e0726'];

// The bevel: light from azimuth az (in the part's own space), a dull specular sheen (a bright one read as glossy
// plastic), and a chiselled edge: a bright line on the edges facing the light and a dark one on those facing away, as on
// the old Q and the ring's stars.
const bevF=(id,az)=>{const a=az*Math.PI/180,L=[Math.cos(a),Math.sin(a)],k=2.6,g=n=>(Math.round(n*100)/100).toString();
 return `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="b"/>
  <feDiffuseLighting in="b" surfaceScale="4" diffuseConstant="1" lighting-color="#fff" result="d"><feDistantLight azimuth="${g(az)}" elevation="50"/></feDiffuseLighting>
  <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1.31" k2="0" k3="0" k4="0" result="lit"/>
  <feSpecularLighting in="b" surfaceScale="4" specularConstant=".8" specularExponent="40" lighting-color="#ffc9dc" result="s"><feDistantLight azimuth="${g(az)}" elevation="50"/></feSpecularLighting>
  <feComposite in="s" in2="SourceAlpha" operator="in" result="si"/>
  <feComposite in="lit" in2="si" operator="arithmetic" k1="0" k2="1" k3=".8" k4="0" result="o"/>
  <feOffset in="SourceAlpha" dx="${g(-L[0]*k)}" dy="${g(-L[1]*k)}" result="sh"/>
  <feComposite in="SourceAlpha" in2="sh" operator="out" result="ra"/>
  <feFlood flood-color="#ffb8d2" flood-opacity=".85"/><feComposite in2="ra" operator="in" result="rim"/>
  <feOffset in="SourceAlpha" dx="${g(L[0]*k*1.3)}" dy="${g(L[1]*k*1.3)}" result="sh2"/>
  <feComposite in="SourceAlpha" in2="sh2" operator="out" result="rb"/>
  <feFlood flood-color="#24010e" flood-opacity=".8"/><feComposite in2="rb" operator="in" result="rim2"/>
  <feMerge result="m"><feMergeNode in="o"/><feMergeNode in="rim2"/><feMergeNode in="rim"/></feMerge>
  <feComposite in="m" in2="SourceAlpha" operator="in"/>
 </filter>`;};
const sL=strips(1,130,[[0,'#e8206f'],[.25,'#c3125a'],[.65,'#8a0b40'],[1,'#4f0622']],1.7);
const sU=strips(-1,118,[[0,'#ff6d9f'],[.35,'#e01b74'],[1,'#8a0b40']],3.3);
// ---- the drawing ---------------------------------------------------------------------------------------------------
const defs=`<defs>
 <linearGradient id="bladeL" x1="0" y1="0" x2=".25" y2="1"><stop offset="0" stop-color="#ff8fbe"/><stop offset=".3" stop-color="#f23a8e"/><stop offset=".75" stop-color="#d81470"/><stop offset="1" stop-color="#ff86b6"/></linearGradient>
 <linearGradient id="bladeR" x1="0" y1="0" x2=".25" y2="1"><stop offset="0" stop-color="#c3125a"/><stop offset=".5" stop-color="#9c0b4a"/><stop offset="1" stop-color="#6e0832"/></linearGradient>
 <linearGradient id="edgeLg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3ee"/><stop offset=".55" stop-color="#ffb3d1"/><stop offset="1" stop-color="#fff0f6"/></linearGradient>
 <linearGradient id="edgeRg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a0838"/><stop offset=".6" stop-color="#5e0726"/><stop offset="1" stop-color="#8a0b40"/></linearGradient>
 <linearGradient id="fullerG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a0219"/><stop offset=".45" stop-color="#6e0832"/><stop offset=".78" stop-color="#d0106a"/><stop offset="1" stop-color="#ffb3d1"/></linearGradient>
 <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#ffeef5" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <linearGradient id="guardG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5d9f"/><stop offset=".3" stop-color="#d0106a"/><stop offset=".65" stop-color="#8a0b40"/><stop offset="1" stop-color="#4f0622"/></linearGradient>
 <linearGradient id="gripG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d0236e"/><stop offset=".45" stop-color="#8a0b40"/><stop offset="1" stop-color="#3a0219"/></linearGradient>
 <linearGradient id="lowVane" gradientUnits="userSpaceOnUse" x1="0" y1="262" x2="40" y2="352"><stop offset="0" stop-color="#ff5d9f"/><stop offset=".3" stop-color="#ec1f7c"/><stop offset=".65" stop-color="#b80c5c"/><stop offset="1" stop-color="#5e0726"/></linearGradient>
 <linearGradient id="upVane" gradientUnits="userSpaceOnUse" x1="0" y1="240" x2="20" y2="292"><stop offset="0" stop-color="#ffc2da"/><stop offset=".4" stop-color="#ff6aa6"/><stop offset="1" stop-color="#e01b74"/></linearGradient>
 ${sL.defs}${sU.defs}
 <linearGradient id="vaneShade" gradientUnits="userSpaceOnUse" x1="330" y1="0" x2="680" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#2c0312" stop-opacity=".35"/></linearGradient>
 <linearGradient id="shaftG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0f6"/><stop offset=".28" stop-color="#ffa6c9"/><stop offset=".62" stop-color="#d81470"/><stop offset="1" stop-color="#5e0726"/></linearGradient>
 <linearGradient id="nibG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd2e4"/><stop offset=".35" stop-color="#ff6aa6"/><stop offset=".7" stop-color="#c3125a"/><stop offset="1" stop-color="#4f0622"/></linearGradient>
 <radialGradient id="gem" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".2" stop-color="#ffc2da"/><stop offset=".55" stop-color="#f0207e"/><stop offset="1" stop-color="#4f0622"/></radialGradient>
 <radialGradient id="gleam" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".3" stop-color="#ffd9e9" stop-opacity=".75"/><stop offset="1" stop-color="#ff5d9f" stop-opacity="0"/></radialGradient>
 <clipPath id="cLow"><path d="${vaneLower}"/></clipPath>
 <clipPath id="cUp"><path d="${vaneUpper}"/></clipPath>
 <clipPath id="cBlade"><path d="${blade}"/></clipPath>
 <clipPath id="cGrip"><path d="${grip}"/></clipPath>
 ${bevF('bev',225)}
 <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
 <filter id="blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>
 <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
</defs>`;

const sword=`
 <g fill="none" stroke="${ink}" stroke-linejoin="round">
  <path d="${blade}" stroke-width="8"/><path d="${bar}" stroke-width="7"/><path d="${P(fin(-1))} Z" stroke-width="7"/><path d="${P(fin(1))} Z" stroke-width="7"/><path d="${lozenge}" stroke-width="7"/><path d="${grip}" stroke-width="7"/><path d="${pommel}" stroke-width="8"/>
 </g>
 <g filter="url(#bev)"><path d="${halfL}" fill="url(#bladeL)"/><path d="${halfR}" fill="url(#bladeR)"/></g>
 <g clip-path="url(#cBlade)">
  <path d="${bevelStrip(true)}" fill="url(#edgeLg)"/>
  <path d="${bevelStrip(false)}" fill="url(#edgeRg)"/>
  <path d="${inner(5)}" fill="none" stroke="#c3125a" stroke-opacity=".8" stroke-width="1.2"/>
  <path d="${innerR(5)}" fill="none" stroke="#ff86b6" stroke-opacity=".5" stroke-width="1.2"/>
  <path d="M${X} ${fB+21} L ${X} ${bTip[1]}" stroke="#ffe3ee" stroke-opacity=".75" stroke-width="1.4"/>
  <path d="${fuller}" fill="url(#fullerG)" stroke="${ink}" stroke-opacity=".8" stroke-width="1.4"/>
  <path d="M${X-hw0} 420 L ${X-2} 466 L ${X-2} 556 L ${X-hw0} 492 Z" fill="url(#sheen)" opacity=".7" filter="url(#blur2)"/>
  <path d="M${X-hw1} 614 L ${X-4} 662 L ${X-5} 714 L ${X-hw1+2} 654 Z" fill="url(#sheen)" opacity=".55" filter="url(#blur2)"/>
  <rect x="${X-hw0-6}" y="${bTop-6}" width="${2*hw0+12}" height="24" fill="${ink}" opacity=".6" filter="url(#soft)"/>
 </g>
 <g filter="url(#bev)"><path d="${grip}" fill="url(#gripG)"/>
  <g clip-path="url(#cGrip)">${[...Array(11).keys()].map(i=>{const y=268+i*10.6;return `<path d="M${X-14} ${y+5} L ${X+14} ${y-5}" stroke="${ink}" stroke-opacity=".6" stroke-width="2.4"/><path d="M${X-14} ${y+7.5} L ${X+14} ${y-2.5}" stroke="#ff7aa8" stroke-opacity=".35" stroke-width="1"/>`;}).join('')}</g></g>
 <g filter="url(#bev)"><path d="${barHi}" fill="#f0286f"/><path d="${barLo}" fill="#7a0838"/></g>
 <path d="M${X-gL+3} ${gC+gD-0.5} L ${X} ${gC-0.5} L ${X+gL-3} ${gC+gD-0.5}" fill="none" stroke="#ffd0e1" stroke-opacity=".75" stroke-width="1.3" stroke-linecap="round"/>
 ${[-1,1].map(s=>{const q=fin(s),c=finAt(s);return `<g filter="url(#bev)">${[[q[0],q[3],'#ff6d9f'],[q[0],q[1],'#e5195f'],[q[1],q[2],'#6e0832'],[q[2],q[3],'#9c0b44']].map(([a,b,col])=>`<path d="${P([a,b,c])} Z" fill="${col}"/>`).join('')}</g>`;}).join('')}
 <g filter="url(#bev)">${[[loz[0],loz[3],'#ff6d9f'],[loz[0],loz[1],'#e5195f'],[loz[1],loz[2],'#6e0832'],[loz[2],loz[3],'#9c0b44']].map(([a,b,c])=>`<path d="${P([a,b,lozC])} Z" fill="${c}"/>`).join('')}</g>
 <path d="${gemD(lozC[0],lozC[1],10)}" fill="${ink}"/>
 <path d="${gemD(lozC[0],lozC[1],7.5)}" fill="url(#gem)"/>
 <g filter="url(#bev)"><path d="${pommel}" fill="#e01b74"/></g>
 ${facets(PC[0],PC[1],pU,pS,pD,7.5,litCols)}
 <path d="${gemD(PC[0],PC[1],10.5)}" fill="${ink}"/>
 <path d="${gemD(PC[0],PC[1],8)}" fill="url(#gem)"/>`;

const quill=`
 
 
 <g fill="none" stroke="${ink}" stroke-linejoin="round">
  <path d="${vaneLower}" stroke-width="9"/><path d="${vaneUpper}" stroke-width="9"/>
  <path d="${shaft}" stroke-width="9"/><path d="${nib}" stroke-width="9"/>
 </g>
 ${wisps}
 <g filter="url(#bev)"><path d="${vaneLower}" fill="#c3125a"/><g clip-path="url(#cLow)">${sL.body}${barbs(1,0.0175,'#4f0622','#ff8fbe',.22,.16)}</g></g>
 <g filter="url(#bev)"><path d="${vaneUpper}" fill="#ff5d9f"/><g clip-path="url(#cUp)">${sU.body}${barbs(-1,0.0175,'#8a0b40','#ffe3ee',.2,.18)}</g></g>
 <g clip-path="url(#cLow)">
  <path d="${glossLine(1,0.08,0.8,0.32)}" fill="none" stroke="#ffd9e9" stroke-opacity=".55" stroke-width="7" stroke-linecap="round" filter="url(#blur2)"/>
  ${clefts(1,lowNotches)}
 </g>
 <g clip-path="url(#cUp)">
  <path d="${glossLine(-1,0.12,0.7,0.45)}" fill="none" stroke="#fff4f8" stroke-opacity=".6" stroke-width="5" stroke-linecap="round" filter="url(#blur2)"/>
  ${clefts(-1,upNotches)}
 </g>
 <g filter="url(#bev)"><path d="${shaft}" fill="url(#shaftG)"/><path d="${nib}" fill="url(#nibG)"/></g>
 <path d="${nibScoop}" fill="#4f0622" opacity=".85"/>
 <path d="M${sx0+8} ${sy-9} C ${sx0+34} ${sy-14}, ${sx1-40} ${sy-11}, ${sx1+4} ${sy-8}" fill="none" stroke="#ffd0e1" stroke-opacity=".8" stroke-width="2.6" stroke-linecap="round"/>
 <path d="M${sx0+14} ${sy+4} C ${sx0+50} ${sy+5}, ${sx1-50} ${sy+4}, ${sx1-8} ${sy+2}" fill="none" stroke="${ink}" stroke-opacity=".35" stroke-width="5" stroke-linecap="round" filter="url(#blur2)"/>
 <path d="M${sx1+18} ${sy+1.5} L ${tip[0]-1} ${tip[1]}" stroke="${ink}" stroke-width="3.4" stroke-linecap="round"/>
 <path d="M${sx1+20} ${sy-0.8} L ${tip[0]-6} ${tip[1]-1.6}" stroke="#ffb8d2" stroke-opacity=".7" stroke-width="1.1"/>
 <circle cx="${sx1+17}" cy="${sy+1.5}" r="4.4" fill="${ink}"/>
 <path d="${rachisInk}" fill="${ink}" transform="translate(0 1.5)"/>
 <path d="${rachisPath}" fill="#ffc4da"/>
 <path d="${rachisHi}" fill="none" stroke="#fff6fa" stroke-width="2.2" stroke-linecap="round"/>`;

// ---- the saltire: each part drawn upright as above, then laid on its diagonal ----------------------------------------
const C=[512,499],deg=Math.PI/180,f3=n=>(Math.round(n*1000)/1000).toString();
const place=(c0,theta,kx,ky)=>{const co=Math.cos(theta*deg),si=Math.sin(theta*deg);
 return {at:p=>{const x=(p[0]-c0[0])*kx,y=(p[1]-c0[1])*ky;return [C[0]+x*co-y*si,C[1]+x*si+y*co];},
  tf:`translate(${C[0]} ${C[1]}) rotate(${f3(theta)}) scale(${f3(kx)} ${f3(ky)}) translate(${f(-c0[0])} ${f(-c0[1])})`};};
const mod=n=>((n%360)+360)%360;
// The sword crosses at its blade a little below the guard (y 490); its point leans ANG degrees from
// straight down, to the right (left with --mirror).
const thS=MIRROR?ANG:-ANG,SW=place([X,490],thS,1,1);
// The quill crosses just below its vanes (s 0.85, a little toward the wide vane); its nib leans ANG degrees from straight
// down to the left (right with --mirror). Upright, its wide vane is below the rachis; unmirrored it is flipped, so the
// wide vane lies in the right-hand opening of the X, clear of the crossguard, and its lit edge faces the upper left.
const a0=Math.atan2(tip[1]-rach(0)[1],tip[0]-rach(0)[0])/deg;
// The quill crosses a little way up (s 0.79), so the vanes run on past the gem into the lower left, which would otherwise
// be the lightest of the four.
const QS=Number(opt('--quill-at',0.79)),qn=normalOf(rachT(QS),1),qc=[rach(QS)[0]+qn[0]*10,rach(QS)[1]+qn[1]*10];
const thQ=MIRROR?(90-ANG)-a0:(90+ANG)+a0,QU=place(qc,thQ,1,MIRROR?1:-1);
// Lighting is worked out in each part's own space: turn it back so it falls from the upper left (azimuth 225) after all.
const azS=mod(225-thS),azQ=MIRROR?mod(225-thQ):mod(thQ-225);
const defsD=defs.replace('</defs>',bevF('bevS',azS)+bevF('bevQ',azQ)+`
 <radialGradient id="heart" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".35" stop-color="#ff7aa8" stop-opacity=".3"/><stop offset="1" stop-color="#ff1f6e" stop-opacity="0"/></radialGradient>
 <linearGradient id="dropG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb3d1"/><stop offset=".4" stop-color="#e5127d"/><stop offset="1" stop-color="#4f0622"/></linearGradient>
</defs>`);
const swordD=sword.split('url(#bev)').join('url(#bevS)'),quillD=quill.split('url(#bev)').join('url(#bevQ)');
// The gem at the crossing: a faceted four-point star (its arms in the openings of the X) with a diamond at its heart.
// Sharp arms with a ridge down each, as on the ring's cardinal stars.
const cU=105,cS=75,sWd=17;
const cStar=star(C[0],C[1],cU,cS,cU,sWd);
const ridge=(a,b,col,op,w)=>`<path d="M${f(a[0])} ${f(a[1])} L ${f(b[0])} ${f(b[1])}" stroke="${col}" stroke-opacity="${op}" stroke-width="${w}" stroke-linecap="round"/>`;
const centre=`
 <path d="${cStar}" fill="#14010a" opacity=".7" filter="url(#soft)" transform="translate(5 9)"/>
 <path d="${cStar}" fill="none" stroke="${ink}" stroke-width="10" stroke-linejoin="round"/>
 <g filter="url(#bev)"><path d="${cStar}" fill="#e01b74"/></g>
 ${facets(C[0],C[1],cU,cS,cU,14,litCols)}
 ${ridge([C[0],C[1]-cU+5],[C[0],C[1]-28],'#ffe0ec',.85,2.2)}${ridge([C[0]-cS+5,C[1]],[C[0]-27,C[1]],'#ffe0ec',.8,2)}
 ${ridge([C[0]+cS-5,C[1]],[C[0]+27,C[1]],'#3a0219',.7,1.8)}${ridge([C[0],C[1]+cU-5],[C[0],C[1]+28],'#3a0219',.7,1.8)}
 <path d="${gemD(C[0],C[1],34)}" fill="${ink}"/>
 <path d="${gemD(C[0],C[1],27)}" fill="url(#gem)"/>
 <path d="M${C[0]} ${C[1]-27} L ${C[0]} ${C[1]+27} M ${C[0]-22} ${C[1]} L ${C[0]+22} ${C[1]}" stroke="#ffe3ee" stroke-opacity=".4" stroke-width="1.2"/>
 <circle cx="${C[0]}" cy="${C[1]}" r="32" fill="url(#heart)"/>`;
const sparkle=(p,r,op=1)=>`<g transform="translate(${f(p[0])} ${f(p[1])})"><path d="M0 ${-r} L ${r*0.13} ${-r*0.13} L ${r} 0 L ${r*0.13} ${r*0.13} L 0 ${r} L ${-r*0.13} ${r*0.13} L ${-r} 0 L ${-r*0.13} ${-r*0.13} Z" fill="#fff6fa" opacity="${op}"/></g>`;
// A drop of ink falling from the nib.
const nibTip=QU.at(tip),dp=[nibTip[0]+(MIRROR?3:-3),nibTip[1]+20];
const drop0=0;const drop=`<path d="M${f(dp[0])} ${f(dp[1]-12)} C ${f(dp[0]+3)} ${f(dp[1]-5)}, ${f(dp[0]+8)} ${f(dp[1])}, ${f(dp[0]+8)} ${f(dp[1]+5)} C ${f(dp[0]+8)} ${f(dp[1]+10)}, ${f(dp[0]+4)} ${f(dp[1]+13)}, ${f(dp[0])} ${f(dp[1]+13)} C ${f(dp[0]-4)} ${f(dp[1]+13)}, ${f(dp[0]-8)} ${f(dp[1]+10)}, ${f(dp[0]-8)} ${f(dp[1]+5)} C ${f(dp[0]-8)} ${f(dp[1])}, ${f(dp[0]-3)} ${f(dp[1]-5)}, ${f(dp[0])} ${f(dp[1]-12)} Z"`;
const inkDrop=drop+` fill="none" stroke="${ink}" stroke-width="7" stroke-linejoin="round"/>`+drop+` fill="url(#dropG)"/>`+`<circle cx="${f(dp[0]-3)}" cy="${f(dp[1]+3)}" r="2.4" fill="#fff0f6" opacity=".85"/>`;
const gleamAt=SW.at([bTip[0],bTip[1]-5]);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${defsD}
 <g opacity=".32" fill="#e5195f" filter="url(#glow)">
  <g transform="${SW.tf}">${[blade,guard,pommel].map(d=>`<path d="${d}"/>`).join('')}</g>
  <g transform="${QU.tf}">${[vaneLower,vaneUpper,shaft,nib].map(d=>`<path d="${d}"/>`).join('')}</g>
  <path d="${cStar}"/>
 </g>
 <g transform="translate(4 9)" fill="#14010a" opacity=".6" filter="url(#soft)"><g transform="${SW.tf}"><path d="${blade}"/><path d="${guard}"/></g></g>
 <g transform="${SW.tf}">${swordD}</g>
 <g transform="translate(5 10)" fill="#14010a" opacity=".7" filter="url(#soft)"><g transform="${QU.tf}"><path d="${vaneLower}"/><path d="${vaneUpper}"/><path d="${shaft}"/><path d="${nib}"/></g></g>
 <g transform="${QU.tf}">${quillD}</g>
 ${inkDrop}
 ${centre}
 <g transform="translate(${f(gleamAt[0])} ${f(gleamAt[1])})"><circle r="13" fill="url(#gleam)" opacity=".8"/></g>
 ${sparkle(gleamAt,15,.95)}
 ${sparkle(SW.at([PC[0]-8,PC[1]-10]),9,.85)}
 ${sparkle([C[0]-8,C[1]-10],10,.9)}
</svg>`;
console.log('sword rot',thS,'az',f(azS),'quill rot',f(thQ),'az',f(azQ),'arms: pommel',SW.at([X,196]).map(Math.round),'point',SW.at(bTip).map(Math.round),'feather tip',QU.at(rach(0)).map(Math.round),'nib',nibTip.map(Math.round));
if(SVG)fs.writeFileSync(SVG,svg);

(async()=>{
 const core=fs.readFileSync(CORE).toString('base64'),orig=fs.readFileSync(SOURCE).toString('base64');
 const b=await start({width:1100,height:1100,mobile:false,port:9400+Math.floor(Math.random()*80),profileName:'turquill-core'});
 const page=path.join(require('node:os').tmpdir(),'turquill-core.html');
 fs.writeFileSync(page,'<html><body style="margin:0;background:#000"></body></html>');
 await b.go('file:///'+page.split(path.sep).join('/'));await b.sleep(500);
 const result=await b.js(`(async()=>{
  const load=src=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;});
  const old=await load('data:image/webp;base64,${core}');
  const c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d');g.drawImage(old,0,0,1024,1024);
  // Take out the Q with its glow, its top spike and the dagger with its glow, each feathered at the edge.
  g.save();g.globalCompositeOperation='destination-out';g.filter='blur(6px)';g.fillStyle='#000';
  g.beginPath();g.ellipse(512,499,296,282,0,0,Math.PI*2);g.fill();
  g.beginPath();g.moveTo(468,276);g.lineTo(512,168);g.lineTo(556,276);g.closePath();g.fill();
  g.beginPath();g.moveTo(420,556);g.lineTo(528,506);g.lineTo(930,880);g.lineTo(890,925);g.lineTo(462,652);g.closePath();g.fill();
  g.restore();
  for(const [x,y,r] of [[258,310,46],[789,382,30],[786,676,48],[242,750,30],[515,787,13]]){g.save();g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.clip();g.clearRect(x-r,y-r,2*r,2*r);g.drawImage(old,0,0,1024,1024);g.restore();}
  const t=await load('data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(${JSON.stringify(svg)}))));
  // The sword and quill on their own canvas first, so the stone texture is laid on them alone.
  const tc=document.createElement('canvas');tc.width=tc.height=1024;const tg=tc.getContext('2d');tg.drawImage(t,0,0,1024,1024);
  const noise=async(freq,oct,seed)=>load('data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="'+freq+'" numOctaves="'+oct+'" seed="'+seed+'"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="1.8" intercept="-.4"/><feFuncG type="linear" slope="1.8" intercept="-.4"/><feFuncB type="linear" slope="1.8" intercept="-.4"/><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer></filter><rect width="1024" height="1024" filter="url(#n)"/></svg>'));
  // Veins and cracks: a turbulence field's near-zero creases, turned into thin lines by a table (dark lines on white, or
  // with inv, light lines on black).
  const veins=async(freq,oct,seed,inv)=>{const n=24,tv=[...Array(n)].map((_,i)=>{const v=i==0?0.15:i==1?0.7:1;return inv?(1-v).toFixed(2):v.toFixed(2);}).join(' ');
   return load('data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><filter id="n" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="turbulence" baseFrequency="'+freq+'" numOctaves="'+oct+'" seed="'+seed+'"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="table" tableValues="'+tv+'"/><feFuncG type="table" tableValues="'+tv+'"/><feFuncB type="table" tableValues="'+tv+'"/><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer></filter><rect width="1024" height="1024" filter="url(#n)"/></svg>'));};
  const mask=document.createElement('canvas');mask.width=mask.height=1024;const mg=mask.getContext('2d');
  const layImg=async(img,mode,alpha)=>{mg.clearRect(0,0,1024,1024);mg.globalCompositeOperation='source-over';mg.drawImage(await img,0,0);
   mg.globalCompositeOperation='destination-in';mg.drawImage(tc,0,0);tg.save();tg.globalAlpha=alpha;tg.globalCompositeOperation=mode;tg.drawImage(mask,0,0);tg.restore();};
  const lay=(freq,oct,seed,mode,alpha)=>layImg(noise(freq,oct,seed),mode,alpha);
  // The painted Q's mottled, marbled crimson stone with faint cracks (smooth, it read as glossy plastic).
  const pre=tg.getImageData(0,0,1024,1024);
  await lay('0.012 0.03',4,7,'soft-light',0.95);   // broad mottling, as in the painted stone
  await lay('0.03 0.05',3,19,'soft-light',0.55);   // smaller blotches
  await layImg(veins('0.014 0.022',3,11),'multiply',0.42);          // marble veins
  await layImg(veins('0.028 0.04',2,23,true),'screen',0.2);         // pale streaks between them
  await layImg(veins(0.06,2,5),'multiply',0.3);                     // fine cracks
  await lay(0.45,2,3,'overlay',0.2);                // fine grain
  // The stone is on the solid parts only: the glow keeps its own colour and alpha (each layer had thickened it).
  {const post=tg.getImageData(0,0,1024,1024),p0=pre.data,qd=post.data;for(let i=0;i<qd.length;i+=4){const a=p0[i+3],t=Math.max(0,Math.min(1,(a-90)/110)),w=t*t*(3-2*t);for(let j=0;j<3;j++)qd[i+j]=p0[i+j]+(qd[i+j]-p0[i+j])*w;qd[i+3]=a;}tg.putImageData(post,0,0);}
  // The colour: as drawn, the parts are paler and milkier than the painted Q (median saturation about 0.66 against 0.87, mean green
  // about 92 against 59). Measure the old Q's solid parts and push the X's saturation and value to match, keeping each
  // pixel's hue but turning it a little toward the Q's crimson-rose.
  const hsv=(r,g,b)=>{const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx==r)h=((g-b)/d)%6;else if(mx==g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}return [h,mx?d/mx:0,mx/255];};
  const rgb=(h,s,v)=>{const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let r,g,b;if(h<60)[r,g,b]=[c,x,0];else if(h<120)[r,g,b]=[x,c,0];else if(h<180)[r,g,b]=[0,c,x];else if(h<240)[r,g,b]=[0,x,c];else if(h<300)[r,g,b]=[x,0,c];else [r,g,b]=[c,0,x];return [(r+m)*255,(g+m)*255,(b+m)*255];};
  const stats=(data,keep)=>{const S=[];let G=0,V=0,n=0;for(let i=0;i<data.length;i+=4){if(data[i+3]<=200||!keep(i/4))continue;const [h,s,v]=hsv(data[i],data[i+1],data[i+2]);S.push(s);G+=data[i+1];V+=v;n++;}S.sort((a,b)=>a-b);return {medS:+S[n>>1].toFixed(3),meanG:+(G/n).toFixed(1),meanV:+(V/n).toFixed(3),n};};
  const oc=document.createElement('canvas');oc.width=oc.height=1024;const og=oc.getContext('2d');og.drawImage(old,0,0,1024,1024);const od=og.getImageData(0,0,1024,1024).data;
  const inQ=p=>{const x=p%1024,y=(p/1024)|0;return ((x-512)/296)**2+((y-499)/282)**2<1;};
  // The old Q as painted (original.webp laid over this layer as make-emblem.cjs cuts it: centre (622,588), 1260 px square
  // to 1024, on rgb(20,1,15)), measured where the old still layer holds the Q.
  const pic=await load('data:image/webp;base64,${orig}');const pc=document.createElement('canvas');pc.width=pc.height=1024;const pg=pc.getContext('2d');pg.fillStyle='rgb(20,1,15)';pg.fillRect(0,0,1024,1024);
  const kk=1024/1260;pg.imageSmoothingQuality='high';pg.drawImage(pic,512-622*kk,512-588*kk,pic.width*kk,pic.height*kk);const pd=pg.getImageData(0,0,1024,1024).data;
  const BG=[20,1,15],comp=(d,i,c)=>{const a=d[i+3]/255;return [a*c[0]+(1-a)*BG[0],a*c[1]+(1-a)*BG[1],a*c[2]+(1-a)*BG[2]];};
  const stat2=(list)=>{const S=list.map(c=>hsv(...c)[1]).sort((a,b)=>a-b);return {medS:+S[S.length>>1].toFixed(3),meanG:+(list.reduce((t,c)=>t+c[1],0)/list.length).toFixed(1),meanV:+(list.reduce((t,c)=>t+Math.max(...c),0)/list.length/255).toFixed(3),n:list.length};};
  const qList=[];for(let i=0;i<pd.length;i+=4)if(od[i+3]>60&&inQ(i/4))qList.push([pd[i],pd[i+1],pd[i+2]]);
  const ref=stat2(qList);
  const idt=tg.getImageData(0,0,1024,1024),xd=idt.data,xList=f=>{const l=[];for(let i=0;i<xd.length;i+=4)if(xd[i+3]>140)l.push(comp(xd,i,f?f(xd[i],xd[i+1],xd[i+2]):[xd[i],xd[i+1],xd[i+2]]));return l;},before=stat2(xList());
  const HS=${HUE},tr=(h,s,v,k,vs)=>{const h2=s>0.03?(h+HS+360)%360:h;return [h2,1-Math.pow(1-s,k),Math.min(1,v*vs)];};
  let best=null;for(let k=1;k<=3.2;k+=0.1)for(let vs=0.7;vs<=1.1;vs+=0.02){const S=[];let G=0,V=0,n=0;for(let i=0;i<xd.length;i+=4*7){if(xd[i+3]<=140)continue;const [h,s,v]=hsv(xd[i],xd[i+1],xd[i+2]);const c=comp(xd,i,rgb(...tr(h,s,v,k,vs)));const q=hsv(...c);S.push(q[1]);G+=c[1];V+=q[2];n++;}
   S.sort((a,b)=>a-b);const e=Math.abs(S[n>>1]-ref.medS)*100+Math.abs(G/n-ref.meanG)*0.4+Math.abs(V/n-ref.meanV)*30;if(!best||e<best.e)best={e,k,vs};}
  for(let i=0;i<xd.length;i+=4){if(!xd[i+3])continue;const [h,s,v]=hsv(xd[i],xd[i+1],xd[i+2]);const c=rgb(...tr(h,s,v,best.k,best.vs));xd[i]=c[0];xd[i+1]=c[1];xd[i+2]=c[2];}
  tg.putImageData(idt,0,0);const after=stat2(xList());
  g.drawImage(tc,0,0);
  // Balance and presence: the solid parts' centroid and quadrants about the middle, and the bright mass against the Q's.
  let cx=0,cy=0,cn=0;const quad={ul:0,ur:0,ll:0,lr:0};let bx=0,bq=0;
  for(let p=0;p<1024*1024;p++){const i=p*4,x=p%1024,y=(p/1024)|0;
   if(xd[i+3]>140){cx+=x;cy+=y;cn++;quad[(y<499?'u':'l')+(x<512?'l':'r')]++;bx+=(0.3*xd[i]+0.59*xd[i+1]+0.11*xd[i+2])*xd[i+3]/255;}
   if(od[i+3]>60&&inQ(p))bq+=0.3*(pd[i]-20)+0.59*pd[i+1]+0.11*(pd[i+2]-15);}
  const balance={centroid:[Math.round(cx/cn),Math.round(cy/cn)],quad,upper:quad.ul+quad.ur,lower:quad.ll+quad.lr,brightVsQ:+(bx/bq).toFixed(2)};
  const colour={ref,before,after,k:+best.k.toFixed(2),vs:+best.vs.toFixed(2)};
  // How much of the sword and quill (their solid parts) lies on the suns, the moons, the small diamond or the inner circle's arcs.
  const td=tg.getImageData(0,0,1024,1024).data,A=(x,y)=>td[(y*1024+x)*4+3];
  const count=(x0,y0,x1,y1)=>{let n=0;for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(A(x,y)>140)n++;return n;};
  let arcs=0;const arcAt=[];for(let y=140;y<880;y++)for(let x=140;x<880;x++){const r=Math.hypot(x-512,y-499);if(r>322&&r<352&&A(x,y)>140&&!(x>495&&x<535&&y>760)){arcs++;if(arcs%8==1)arcAt.push([x,y]);}}
  let bb=[1e9,1e9,-1,-1];for(let y=0;y<1024;y++)for(let x=0;x<1024;x++)if(A(x,y)>140){bb[0]=Math.min(bb[0],x);bb[1]=Math.min(bb[1],y);bb[2]=Math.max(bb[2],x);bb[3]=Math.max(bb[3],y);}
  const report={sunTL:count(223,273,312,362),moonTR:count(754,357,823,410),sunBR:count(733,632,830,728),moonBL:count(231,710,281,754),diamond:count(505,778,525,798),arcs,arcAt:arcAt.slice(0,6),bbox:bb,balance,colour};
  return {webp:c.toDataURL('image/webp',0.94),png:c.toDataURL('image/png'),report};
 })()`);
 if(!result||typeof result!=='object'||!result.webp)throw new Error('drawing failed: '+String(result).slice(0,300));
 fs.writeFileSync(OUT,Buffer.from(result.webp.split(',')[1],'base64'));
 if(PNG)fs.writeFileSync(PNG,Buffer.from(result.png.split(',')[1],'base64'));
 await b.close();console.log('wrote',path.relative(here,OUT)+(PNG?' and '+PNG:'')+'; overlaps',JSON.stringify(result.report));
})().catch(e=>{console.error(e);process.exit(1);});

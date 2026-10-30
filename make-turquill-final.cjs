// Makes the final Turquill emblem's layers (2026-10-30). The host chose, over that day: option 3 of ten ("I like the
// design on number 3"), natural materials for the quill, sword and book, gold stars set with stones, the blackened silver
// serpent with the bronze-and-owl details round a gold inner circle ("3 but make the ink on the quill look way better"),
// then "put it into the game and make sure it keeps moving like before, maybe we should add another gem at the top and
// have the snake rotate separately", "I want the gems to match the chosen color of the game by the player" and "have the
// snake consume the gems as it passes them, then have them fade back in as it goes around".
// It builds on make-turquill-core.cjs's sword and quill (copied below, as drawn there), recolours each part through a
// natural ramp (steel, gold, bronze, leather, owl feather, horn), draws the book, the ink, the gold stars and their
// settings, takes the painted stars out of the serpent (filling each with the serpent's own body from further round) and
// writes the layers listed under "The final emblem's layers" near the end. Inputs: public/emblem/ring-v2.webp and
// core-v2.webp (make-emblem.cjs, from the host's painting). Run: node make-turquill-final.cjs  (headless Chrome or Edge;
// no internet). QB_DEST=<folder> writes elsewhere; QB_PREVIEW=<file.png> also writes the whole emblem on dark.
// Draws the Turquill emblem's still layer (2026-10-26; the host's words: "create a new logo for it", then "maybe a quill
// and a sword", "abandon the T shape of it" and "Finer sword"): the Turquill emblem's still layer
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
// (assets/title/turquill-seal-source.webp cut as make-emblem.cjs cuts it), turning hues 8 degrees toward its
// crimson-rose (--hue N). The serpent ring (ring-v2.webp) is unchanged: it was already whole under the dagger.
// Writes public/emblem/core-v3.webp (make-turquill-emblem.cjs makes the other pictures from it); --png F and --svg F also
// write those. The report prints the balance (centroid, quadrants), the colour figures and any overlap with the suns,
// the moons, the small diamond or the inner circle's arcs. --quill-at S moves the crossing along the quill.
// Run: node make-turquill-core.cjs [--png out.png] [--svg out.svg]   (headless Chrome or Edge; no internet needed)
const fs=require('node:fs'),path=require('node:path');
const {start}=require(process.env.QB_CDP||'C:/Users/itsbr/qb-work/tools/cdp.cjs');
const here=__dirname,CORE=path.join(here,'public/emblem/core-v2.webp'),SOURCE=path.join(here,'assets/title/turquill-seal-source.webp'),OUT=path.join(here,'public/emblem/core-v3.webp');
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

// ==== Ten emblem options (2026-10-30; the host: "let's design the final emblem for the game", "feel free to test out
// details you'd like to add", "make it 10 options"). Appended to parts.cjs (the sword and quill of make-turquill-core.cjs).
// (The option sheets these helpers once drew went to a scratch folder; nothing here writes one.)
const C=[512,499],deg=Math.PI/180,f3=n=>(Math.round(n*1000)/1000).toString(),mod=n=>((n%360)+360)%360;
let nid=0;const more=[];
const place=(c0,theta,kx,ky,at=C)=>{const co=Math.cos(theta*deg),si=Math.sin(theta*deg);
 return {at:p=>{const x=(p[0]-c0[0])*kx,y=(p[1]-c0[1])*ky;return [at[0]+x*co-y*si,at[1]+x*si+y*co];},
  tf:`translate(${f(at[0])} ${f(at[1])}) rotate(${f3(theta)}) scale(${f3(kx)} ${f3(ky)}) translate(${f(-c0[0])} ${f(-c0[1])})`};};
const lit=(theta,flipped)=>{const id='bv'+(nid++);more.push(bevF(id,flipped?mod(theta-225):mod(225-theta)));return id;};
const put=(s,pl,id)=>`<g transform="${pl.tf}">${s.split('url(#bev)').join(`url(#${id})`)}</g>`;
const swordShapes=[blade,guard,pommel,grip],quillShapes=[vaneLower,vaneUpper,shaft,nib],featherShapes=[vaneLower,vaneUpper];
const shadowOf=(shapes,pl,k=1)=>`<g transform="translate(${f(5*k)} ${f(10*k)})" fill="#14010a" opacity=".65" filter="url(#soft)"><g transform="${pl.tf}">${shapes.map(d=>`<path d="${d}"/>`).join('')}</g></g>`;
const glowOf=(list)=>`<g opacity=".32" fill="#e5195f" filter="url(#glow)">${list.map(([shapes,pl])=>`<g transform="${pl.tf}">${shapes.map(d=>`<path d="${d}"/>`).join('')}</g>`).join('')}</g>`;
// The sword without its grip and pommel (for the quill-blade), and the feather without its shaft and nib.
const gripStart=`<g filter="url(#bev)"><path d="${grip}" fill="url(#gripG)"/>`;
const swordNoHilt=(()=>{let s=sword;const a=s.indexOf(gripStart),b=s.indexOf('</g></g>',a)+8;s=s.slice(0,a)+s.slice(b);
 s=s.slice(0,s.indexOf(`<g filter="url(#bev)"><path d="${pommel}"`));
 return s.replace(`<path d="${grip}" stroke-width="7"/>`,'').replace(`<path d="${pommel}" stroke-width="8"/>`,'');})();
const feather=`
 <g fill="none" stroke="${ink}" stroke-linejoin="round"><path d="${vaneLower}" stroke-width="9"/><path d="${vaneUpper}" stroke-width="9"/></g>
 ${wisps}
 <g filter="url(#bev)"><path d="${vaneLower}" fill="#c3125a"/><g clip-path="url(#cLow)">${sL.body}${barbs(1,0.0175,'#4f0622','#ff8fbe',.22,.16)}</g></g>
 <g filter="url(#bev)"><path d="${vaneUpper}" fill="#ff5d9f"/><g clip-path="url(#cUp)">${sU.body}${barbs(-1,0.0175,'#8a0b40','#ffe3ee',.2,.18)}</g></g>
 <g clip-path="url(#cLow)"><path d="${glossLine(1,0.08,0.8,0.32)}" fill="none" stroke="#ffd9e9" stroke-opacity=".55" stroke-width="7" stroke-linecap="round" filter="url(#blur2)"/>${clefts(1,lowNotches)}</g>
 <g clip-path="url(#cUp)"><path d="${glossLine(-1,0.12,0.7,0.45)}" fill="none" stroke="#fff4f8" stroke-opacity=".6" stroke-width="5" stroke-linecap="round" filter="url(#blur2)"/>${clefts(-1,upNotches)}</g>
 <path d="${rachisInk}" fill="${ink}" transform="translate(0 1.5)"/><path d="${rachisPath}" fill="#ffc4da"/><path d="${rachisHi}" fill="none" stroke="#fff6fa" stroke-width="2.2" stroke-linecap="round"/>`;
const ridge=(a,b,col,op,w)=>`<path d="M${f(a[0])} ${f(a[1])} L ${f(b[0])} ${f(b[1])}" stroke="${col}" stroke-opacity="${op}" stroke-width="${w}" stroke-linecap="round"/>`;
const centreAt=(c,s=1,gem=true)=>{const cU=105*s,cS=75*s,w=17*s,cs=star(c[0],c[1],cU,cS,cU,w);
 return `<path d="${cs}" fill="#14010a" opacity=".7" filter="url(#soft)" transform="translate(${f(5*s)} ${f(9*s)})"/>
 <path d="${cs}" fill="none" stroke="${ink}" stroke-width="${f(10*s)}" stroke-linejoin="round"/>
 <g filter="url(#bev)"><path d="${cs}" fill="#e01b74"/></g>${facets(c[0],c[1],cU,cS,cU,14*s,litCols)}
 ${ridge([c[0],c[1]-cU+5*s],[c[0],c[1]-28*s],'#ffe0ec',.85,2.2*s)}${ridge([c[0]-cS+5*s,c[1]],[c[0]-27*s,c[1]],'#ffe0ec',.8,2*s)}
 ${ridge([c[0]+cS-5*s,c[1]],[c[0]+27*s,c[1]],'#3a0219',.7,1.8*s)}${ridge([c[0],c[1]+cU-5*s],[c[0],c[1]+28*s],'#3a0219',.7,1.8*s)}
 ${gem?`<path d="${gemD(c[0],c[1],34*s)}" fill="${ink}"/><path d="${gemD(c[0],c[1],27*s)}" fill="url(#gem)"/><circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(32*s)}" fill="url(#heart)"/>`:''}`;};
const sparkle=(p,r,op=1)=>`<g transform="translate(${f(p[0])} ${f(p[1])})"><path d="M0 ${-r} L ${r*0.13} ${-r*0.13} L ${r} 0 L ${r*0.13} ${r*0.13} L 0 ${r} L ${-r*0.13} ${r*0.13} L ${-r} 0 L ${-r*0.13} ${-r*0.13} Z" fill="#fff6fa" opacity="${op}"/></g>`;
const inkDrop=(dp,s=1)=>{const k=v=>f(v);const d=`<path d="M${k(dp[0])} ${k(dp[1]-12*s)} C ${k(dp[0]+3*s)} ${k(dp[1]-5*s)}, ${k(dp[0]+8*s)} ${k(dp[1])}, ${k(dp[0]+8*s)} ${k(dp[1]+5*s)} C ${k(dp[0]+8*s)} ${k(dp[1]+10*s)}, ${k(dp[0]+4*s)} ${k(dp[1]+13*s)}, ${k(dp[0])} ${k(dp[1]+13*s)} C ${k(dp[0]-4*s)} ${k(dp[1]+13*s)}, ${k(dp[0]-8*s)} ${k(dp[1]+10*s)}, ${k(dp[0]-8*s)} ${k(dp[1]+5*s)} C ${k(dp[0]-8*s)} ${k(dp[1])}, ${k(dp[0]-3*s)} ${k(dp[1]-5*s)}, ${k(dp[0])} ${k(dp[1]-12*s)} Z"`;
 return d+` fill="none" stroke="${ink}" stroke-width="${f(7*s)}" stroke-linejoin="round"/>`+d+` fill="url(#dropG)"/><circle cx="${k(dp[0]-3*s)}" cy="${k(dp[1]+3*s)}" r="${k(2.4*s)}" fill="#fff0f6" opacity=".85"/>`;};
const a0=Math.atan2(tip[1]-rach(0)[1],tip[0]-rach(0)[0])/deg;
// The saltire of the current emblem, at any angle, size and place.
const saltire=(o={})=>{const ang=o.ang??36,k=o.k??1,at=o.at??C,mir=!!o.mirror;
 const thS=mir?ang:-ang,SW=place([X,490],thS,k,k,at);
 const QS=0.79,qn=normalOf(rachT(QS),1),qc=[rach(QS)[0]+qn[0]*10,rach(QS)[1]+qn[1]*10];
 const thQ=mir?(90-ang)-a0:(90+ang)+a0,QU=place(qc,thQ,k,mir?k:-k,at);
 const idS=lit(thS,false),idQ=lit(thQ,!mir);
 const nibTip=QU.at(tip),drop=[nibTip[0]+(mir?3:-3)*k,nibTip[1]+20*k];
 return {SW,QU,k,at,drop,
  sword:shadowOf(swordShapes,SW,k)+put(sword,SW,idS),
  quill:shadowOf(quillShapes,QU,k)+put(quill,QU,idQ),
  glow:glowOf([[swordShapes,SW],[quillShapes,QU]]),
  gleam:SW.at([bTip[0],bTip[1]-5]),pommelAt:SW.at([PC[0]-8,PC[1]-10])};};
const finish=(S,s=1)=>`<g transform="translate(${f(S.gleam[0])} ${f(S.gleam[1])})"><circle r="${f(13*s)}" fill="url(#gleam)" opacity=".8"/></g>${sparkle(S.gleam,15*s,.95)}${sparkle(S.pommelAt,9*s,.85)}`;
const svgOf=body=>`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${defsAll()}${body}</svg>`;
const defsAll=()=>defs.replace('</defs>',more.join('')+`
 <radialGradient id="heart" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".35" stop-color="#ff7aa8" stop-opacity=".3"/><stop offset="1" stop-color="#ff1f6e" stop-opacity="0"/></radialGradient>
 <linearGradient id="dropG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb3d1"/><stop offset=".4" stop-color="#e5127d"/><stop offset="1" stop-color="#4f0622"/></linearGradient>
 <linearGradient id="pageL" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3ee"/><stop offset=".55" stop-color="#ffb3d1"/><stop offset="1" stop-color="#e5487f"/></linearGradient>
 <linearGradient id="pageR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffc6da"/><stop offset=".6" stop-color="#f0629a"/><stop offset="1" stop-color="#b80c5c"/></linearGradient>
 <linearGradient id="shieldF" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f0622"/><stop offset=".55" stop-color="#2a0213"/><stop offset="1" stop-color="#14010a"/></linearGradient>
 <linearGradient id="potG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff86b6"/><stop offset=".35" stop-color="#d81470"/><stop offset=".75" stop-color="#8a0b40"/><stop offset="1" stop-color="#3a0219"/></linearGradient>
 <radialGradient id="waxG" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#d4204f"/><stop offset=".55" stop-color="#a80f3b"/><stop offset="1" stop-color="#6a0723"/></radialGradient>
 <linearGradient id="roseDeep" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c3125a"/><stop offset=".5" stop-color="#7a0838"/><stop offset="1" stop-color="#3a0219"/></linearGradient>
 <filter id="waxF" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="b"/>
  <feDiffuseLighting in="b" surfaceScale="9" diffuseConstant="1" lighting-color="#fff" result="d"><feDistantLight azimuth="225" elevation="42"/></feDiffuseLighting>
  <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1.35" k2="0" k3="0" k4="0" result="lit"/>
  <feSpecularLighting in="b" surfaceScale="9" specularConstant=".7" specularExponent="22" lighting-color="#ffc9dc" result="s"><feDistantLight azimuth="225" elevation="42"/></feSpecularLighting>
  <feComposite in="s" in2="SourceAlpha" operator="in" result="si"/>
  <feComposite in="lit" in2="si" operator="arithmetic" k1="0" k2="1" k3=".7" k4="0" result="o"/>
  <feComposite in="o" in2="SourceAlpha" operator="in"/>
 </filter>
</defs>`);


// ==== Five takes on option 3 in natural materials (2026-10-30; the host: "I like the design on number 3, but the
// separate coloring for the quill, sword, and book sound like a good idea, let's make those look more natural, make the
// gem above them and the gems on the side be an emerald with a golden exterior"). Each part is drawn as before and its
// shading carried onto a natural ramp (steel, gold, leather, feather, horn); the book is drawn in its own colours; the
// centre star and the ring's three side stars are drawn new in gold, each set with an emerald-cut emerald.
const ramps={
 steel:[[0,'#07090c'],[.22,'#2c333b'],[.45,'#6c7681'],[.68,'#aeb7c0'],[.86,'#e3e8ec'],[1,'#ffffff']],
 gold:[[0,'#1a0f02'],[.22,'#55360a'],[.42,'#956616'],[.62,'#cf9d34'],[.82,'#f4d27a'],[1,'#fff8de']],
 bronze:[[0,'#120a04'],[.3,'#4a2a12'],[.55,'#8c5a2c'],[.78,'#c99560'],[1,'#fbe3c2']],
 leatherDark:[[0,'#060302'],[.4,'#24130b'],[.7,'#4a2a18'],[1,'#8a5a38']],
 leatherBlack:[[0,'#030303'],[.45,'#15120f'],[.75,'#3a332c'],[1,'#7a6e60']],
 swan:[[0,'#2b2622'],[.25,'#6f675f'],[.5,'#b7aea2'],[.72,'#e8e0d4'],[1,'#ffffff']],
 hawk:[[0,'#140903'],[.25,'#4a2810'],[.5,'#8a5726'],[.72,'#c69458'],[1,'#f6e2bd']],
 raven:[[0,'#010102'],[.3,'#0b0e16'],[.55,'#1d2536'],[.78,'#3f5070'],[1,'#a9bddc']],
 snowy:[[0,'#2a2520'],[.3,'#6e6458'],[.55,'#b9ae9e'],[.78,'#ebe4d8'],[1,'#ffffff']],
 owl:[[0,'#120c06'],[.3,'#4d3820'],[.55,'#8f7046'],[.78,'#cdb184'],[1,'#fbf0d8']],
 horn:[[0,'#1d1208'],[.35,'#6a4c2a'],[.65,'#b8956a'],[.85,'#e9d5b2'],[1,'#fff8e8']],
 ink:[[0,'#000000'],[.5,'#0b1020'],[.8,'#2a3a5a'],[1,'#c8d6f0']],
 goldRing:[[0,'#0d0802'],[.2,'#3d2706'],[.4,'#7a5412'],[.6,'#b98a2c'],[.8,'#e8c568'],[1,'#fff4d0']],
 jadeRing:[[0,'#010d08'],[.22,'#06301f'],[.45,'#0f6a45'],[.68,'#2fae78'],[.86,'#8fe6bd'],[1,'#ecfff6']],
 silverRing:[[0,'#020203'],[.25,'#16181c'],[.5,'#43474f'],[.72,'#868b94'],[.88,'#c9ccd2'],[1,'#ffffff']],
 bronzeRing:[[0,'#0a0502'],[.25,'#331b0a'],[.5,'#6e4220'],[.72,'#a8703c'],[.88,'#dcae78'],[1,'#fff0d8']],
};
// Each part drawn alone in part space, clipped to one region, so it can take its own material.
const clip=(id,d,rule='nonzero')=>{more.push(`<clipPath id="${id}"><path d="${d}" clip-rule="${rule}"/></clipPath>`);return id;};
const R=(x0,y0,x1,y1)=>`M${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1} L ${x0} ${y1} Z`;
clip('kBlade',R(440,395.5,590,820)+' '+P(loz)+' Z','evenodd');
clip('kGrip',R(496,256,530,381));
clip('kFeather',R(200,120,684,480));clip('kShaft',R(684,250,809.5,360));clip('kNib',R(809.5,250,900,360));
const inGroup=(s,pl,id,clipId)=>svgOf(`<g transform="${pl.tf}">${clipId?`<g clip-path="url(#${clipId})">`:''}${s.split('url(#bev)').join(`url(#${id})`)}${clipId?'</g>':''}</g>`);
// Dark bars across a barred feather (hawk, owl), drawn before the ramp so they take its darker tones.
const barred=(n)=>{let s='<g clip-path="url(#cLow)">';for(let i=0;i<n;i++){const t=0.12+i*0.78/n,p=rach(t),e=edgeAt(Math.min(1,t+0.01),1),q=rach(t+0.035),e2=edgeAt(Math.min(1,t+0.045),1);s+=`<path d="${P([p,e,e2,q])} Z" fill="#3a0219" opacity=".55"/>`;}
 s+='</g><g clip-path="url(#cUp)">';for(let i=0;i<n;i++){const t=0.15+i*0.74/n,p=rach(t),e=edgeAt(Math.min(1,t+0.01),-1),q=rach(t+0.03),e2=edgeAt(Math.min(1,t+0.04),-1);s+=`<path d="${P([p,e,e2,q])} Z" fill="#3a0219" opacity=".5"/>`;}return s+'</g>';};
const quillBarred=quill.replace(`<path d="${rachisInk}"`,barred(9)+`<path d="${rachisInk}"`);
// A white light for things drawn in their own colours (the parts' bevel throws pink light).
more.push(bevF('bevN',225).replace('id="bevN"','id="bevN"').split('#ffc9dc').join('#fff3dc').split('#ffb8d2').join('#fff0d6').split('#24010e').join('#0a0603'));
more.push(`<linearGradient id="gBez" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4c4"/><stop offset=".35" stop-color="#e2b04a"/><stop offset=".7" stop-color="#9a6a14"/><stop offset="1" stop-color="#4a3005"/></linearGradient>
 <linearGradient id="gEm" x1=".15" y1="0" x2=".85" y2="1"><stop offset="0" stop-color="#b6ffe0"/><stop offset=".25" stop-color="#3fd497"/><stop offset=".6" stop-color="#0d8a57"/><stop offset="1" stop-color="#03331f"/></linearGradient>
 <linearGradient id="gTable" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7cf2bf"/><stop offset=".5" stop-color="#17a96c"/><stop offset="1" stop-color="#064a2e"/></linearGradient>
 <linearGradient id="gGilt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".5" stop-color="#d4a23a"/><stop offset="1" stop-color="#6e4a0c"/></linearGradient>
 <linearGradient id="gPageL" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset=".55" stop-color="#f0e2bf"/><stop offset="1" stop-color="#c9ad7a"/></linearGradient>
 <linearGradient id="gPageR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6ead0"/><stop offset=".6" stop-color="#e2cfa2"/><stop offset="1" stop-color="#ad8f5c"/></linearGradient>
 <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -.9 .55"/><feComposite in2="SourceGraphic" operator="in"/></filter>`);
// An emerald, step cut, set in a gold bezel.
const emerald=(cx,cy,w,h,rot=0)=>{const c=Math.min(w,h)*0.32,oct=(W,H,C)=>`M${cx-W+C} ${cy-H} L ${cx+W-C} ${cy-H} L ${cx+W} ${cy-H+C} L ${cx+W} ${cy+H-C} L ${cx+W-C} ${cy+H} L ${cx-W+C} ${cy+H} L ${cx-W} ${cy+H-C} L ${cx-W} ${cy-H+C} Z`;
 const bw=w*1.3,bh=h*1.22,bc=c*1.3,tw=w*0.52,th=h*0.58,tc=c*0.5;
 const steps=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sy])=>`<path d="M${cx+sx*(w-c*0.3)} ${cy+sy*(h-c*0.3)} L ${cx+sx*tw*0.95} ${cy+sy*th*0.95}" stroke="#03331f" stroke-opacity=".55" stroke-width="${f(w*0.05)}"/>`).join('');
 return `<g transform="rotate(${rot} ${cx} ${cy})">
  <path d="${oct(bw+2,bh+2,bc+1)}" fill="#1a0f02"/><g filter="url(#bevN)"><path d="${oct(bw,bh,bc)}" fill="url(#gBez)"/></g>
  <path d="${oct(w+1.5,h+1.5,c+0.6)}" fill="#021a10"/><path d="${oct(w,h,c)}" fill="url(#gEm)"/>
  <path d="${oct(w*0.8,h*0.82,c*0.8)}" fill="none" stroke="#c9ffe6" stroke-opacity=".35" stroke-width="${f(w*0.05)}"/>
  ${steps}<path d="${oct(tw,th,tc)}" fill="url(#gTable)" stroke="#e8fff4" stroke-opacity=".5" stroke-width="${f(w*0.04)}"/>
  <path d="M${cx-tw*0.7} ${cy-th*0.55} L ${cx-tw*0.15} ${cy-th*0.85}" stroke="#ffffff" stroke-opacity=".85" stroke-width="${f(w*0.09)}" stroke-linecap="round"/>
  <circle cx="${cx+tw*0.35}" cy="${cy+th*0.4}" r="${f(w*0.07)}" fill="#e8fff4" opacity=".6"/></g>`;};
// A four-point star in faceted gold.
const goldCols=['#fff6d6','#f2cf6e','#d4a23a','#a87a1f','#6b4710','#3d2807'];
const goldStar=(cx,cy,up,side,down,w,stroke=8)=>{const s=star(cx,cy,up,side,down,w);
 return `<path d="${s}" fill="#0a0602" opacity=".6" filter="url(#soft)" transform="translate(4 7)"/><path d="${s}" fill="none" stroke="#1a0f02" stroke-width="${stroke}" stroke-linejoin="round"/>
  <g filter="url(#bevN)"><path d="${s}" fill="#c9952f"/></g>${facets(cx,cy,up,side,down,w*0.82,goldCols)}
  ${ridge([cx,cy-up+4],[cx,cy-w*1.6],'#fff8e0',.9,2)}${ridge([cx-side+4,cy],[cx-w*1.6,cy],'#fff8e0',.85,1.8)}${ridge([cx+side-4,cy],[cx+w*1.6,cy],'#3d2807',.7,1.6)}${ridge([cx,cy+down-4],[cx,cy+w*1.6],'#3d2807',.7,1.6)}`;};
const ringStars=()=>goldStar(130,506,104,92,104,16,7)+emerald(130,506,13,19)+goldStar(900,509,104,92,104,16,7)+emerald(900,509,13,19)+goldStar(515,883,84,72,122,15,7)+emerald(515,883,12,18);
// The open book in its own colours: a leather cover with gilt corners, parchment pages with gilt edges, a ribbon.
const bookSvg=(cover,ribbon)=>{const bk=(s)=>`M512 612 C ${512+s*40} 590, ${512+s*104} 586, ${512+s*150} 598 L ${512+s*156} 700 C ${512+s*110} 690, ${512+s*44} 694, 512 716 Z`;
 const lines=(s)=>[0,1,2,3,4].map(i=>{const y=622+i*16;return `<path d="M${512+s*22} ${y+6} C ${512+s*60} ${y-6}, ${512+s*100} ${y-8}, ${512+s*136} ${y-1}" fill="none" stroke="#6b4a2a" stroke-opacity=".5" stroke-width="2.2"/>`;}).join('');
 const coverD='M352 704 C 420 698, 470 708, 512 726 C 554 708, 604 698, 672 704 L 670 718 C 604 714, 556 722, 512 742 C 468 722, 420 714, 354 718 Z';
 const corner=(x,y,s)=>`<path d="M${x} ${y} L ${x+s*20} ${y-2} L ${x+s*2} ${y+12} Z" fill="url(#gGilt)" stroke="#2a1a04" stroke-width="1.5"/>`;
 return `<path d="M348 600 L 356 718 L 512 744 L 670 718 L 676 600 Z" fill="#0a0603" opacity=".6" filter="url(#soft)" transform="translate(5 10)"/>
  <path d="M500 728 L 500 790 L 510 780 L 520 790 L 520 728 Z" fill="${ribbon[1]}"/><path d="M503 728 L 503 784 L 510 777 L 510 728 Z" fill="${ribbon[0]}"/>
  <path d="${coverD}" fill="#0a0603" stroke="#0a0603" stroke-width="9" stroke-linejoin="round"/>
  <g filter="url(#bevN)"><path d="${coverD}" fill="${cover}"/></g><path d="${coverD}" fill="#000" filter="url(#grain)" opacity=".5"/>
  ${corner(356,708,1)}${corner(668,708,-1)}
  <path d="M358 700 C 420 694, 470 704, 512 722 C 554 704, 604 694, 666 700" fill="none" stroke="url(#gGilt)" stroke-width="3.2"/>
  <path d="${bk(-1)}" fill="none" stroke="#1a1006" stroke-width="7" stroke-linejoin="round"/><path d="${bk(1)}" fill="none" stroke="#1a1006" stroke-width="7" stroke-linejoin="round"/>
  <g filter="url(#bevN)"><path d="${bk(-1)}" fill="url(#gPageL)"/><path d="${bk(1)}" fill="url(#gPageR)"/></g>
  <path d="${bk(-1)}" fill="#000" filter="url(#grain)" opacity=".18"/><path d="${bk(1)}" fill="#000" filter="url(#grain)" opacity=".18"/>
  ${lines(-1)}${lines(1)}<path d="M512 612 C 510 650, 510 690, 512 716" stroke="#5a3a1c" stroke-opacity=".7" stroke-width="3"/>
  <path d="M374 598 C 420 588, 470 590, 506 608" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`;};

// The ink: the last of the nib wet and glossy, ink run up its slit, and a drop forming at the point (hanging
// straight down on a thin neck, glassy, with a faint gold reflection), a smaller one already falling.
clip('kNibShape',nib);
more.push(`<linearGradient id="gWet" gradientUnits="userSpaceOnUse" x1="808" y1="0" x2="842" y2="0"><stop offset="0" stop-color="#0a0f1c" stop-opacity="0"/><stop offset=".35" stop-color="#0a0f1c" stop-opacity=".55"/><stop offset=".7" stop-color="#070a14" stop-opacity=".92"/><stop offset="1" stop-color="#05070d"/></linearGradient>
 <radialGradient id="gInk" cx=".36" cy=".62" r=".75"><stop offset="0" stop-color="#2e4370"/><stop offset=".3" stop-color="#101a30"/><stop offset=".75" stop-color="#04060c"/><stop offset="1" stop-color="#0e1a36"/></radialGradient>
 <radialGradient id="gInkSmall" cx=".38" cy=".4" r=".7"><stop offset="0" stop-color="#3a5288"/><stop offset=".5" stop-color="#0a1222"/><stop offset="1" stop-color="#04060c"/></radialGradient>`);
const wetNib=()=>`<g transform="${S.QU.tf}"><g clip-path="url(#kNibShape)">
  <path d="M806 288 L 872 288 L 872 324 L 806 324 Z" fill="url(#gWet)"/>
  <path d="M${sx1+12} ${sy+1.5} L ${tip[0]-1} ${tip[1]}" stroke="#020308" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M822 ${sy-7} C 838 ${sy-5.5}, 850 ${sy-2.4}, ${tip[0]-3} ${tip[1]-0.8}" stroke="#b9cdf2" stroke-opacity=".85" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M818 ${sy-8.5} C 826 ${sy-8}, 832 ${sy-7}, 838 ${sy-6}" stroke="#ffffff" stroke-opacity=".7" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <path d="M840 ${sy+5.5} C 848 ${sy+5}, 853 ${sy+3}, ${tip[0]-4} ${tip[1]+1.4}" stroke="#4d6aa6" stroke-opacity=".55" stroke-width="1.1" fill="none" stroke-linecap="round"/>
 </g></g>`;
const inkHanging=()=>{const [tx,ty]=S.QU.at(tip),k=v=>f(v);const x=tx+0.5,y=ty+1;
 const drop=`M${k(x)} ${k(y)} C ${k(x+1.2)} ${k(y+7)}, ${k(x+11)} ${k(y+13)}, ${k(x+11)} ${k(y+23)} C ${k(x+11)} ${k(y+30.5)}, ${k(x+6)} ${k(y+35)}, ${k(x)} ${k(y+35)} C ${k(x-6)} ${k(y+35)}, ${k(x-11)} ${k(y+30.5)}, ${k(x-11)} ${k(y+23)} C ${k(x-11)} ${k(y+13)}, ${k(x-1.2)} ${k(y+7)}, ${k(x)} ${k(y)} Z`;
 const fy=y+52,fall=`M${k(x)} ${k(fy-7)} C ${k(x+1)} ${k(fy-3)}, ${k(x+5)} ${k(fy-1)}, ${k(x+5)} ${k(fy+2.5)} C ${k(x+5)} ${k(fy+5.5)}, ${k(x+2.5)} ${k(fy+7)}, ${k(x)} ${k(fy+7)} C ${k(x-2.5)} ${k(fy+7)}, ${k(x-5)} ${k(fy+5.5)}, ${k(x-5)} ${k(fy+2.5)} C ${k(x-5)} ${k(fy-1)}, ${k(x-1)} ${k(fy-3)}, ${k(x)} ${k(fy-7)} Z`;
 return `<path d="${drop}" fill="none" stroke="#000" stroke-width="3" stroke-linejoin="round"/>
  <path d="${drop}" fill="url(#gInk)"/>
  <path d="M${k(x-7.5)} ${k(y+28)} C ${k(x-4)} ${k(y+32.5)}, ${k(x+4)} ${k(y+32.5)}, ${k(x+8.5)} ${k(y+27)}" fill="none" stroke="#5f80c4" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M${k(x-8.6)} ${k(y+19)} C ${k(x-9.4)} ${k(y+23)}, ${k(x-8.6)} ${k(y+26)}, ${k(x-6.6)} ${k(y+28.5)}" fill="none" stroke="#d9a63e" stroke-opacity=".45" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M${k(x-5.8)} ${k(y+17.5)} C ${k(x-4.2)} ${k(y+14)}, ${k(x-1.8)} ${k(y+12.5)}, ${k(x+0.6)} ${k(y+12.8)} C ${k(x-1.6)} ${k(y+14.8)}, ${k(x-3.6)} ${k(y+17.4)}, ${k(x-4.4)} ${k(y+20.4)} Z" fill="#ffffff" opacity=".92"/>
  <circle cx="${k(x+4.8)}" cy="${k(y+19.5)}" r="1.5" fill="#dfe9ff" opacity=".8"/>
  <path d="M${k(x+0.2)} ${k(y+1.5)} L ${k(x+0.6)} ${k(y+8)}" stroke="#7d98d0" stroke-opacity=".55" stroke-width="1"/>
  <path d="${fall}" fill="none" stroke="#000" stroke-width="2" stroke-linejoin="round"/><path d="${fall}" fill="url(#gInkSmall)"/>
  <circle cx="${k(x-1.6)}" cy="${k(fy+0.6)}" r="1.4" fill="#ffffff" opacity=".85"/>`;};
// ---- the five --------------------------------------------------------------------------------------------------------
const S=saltire({at:[512,476]});
const idS=S.sword.match(/url\(#(bv\d+)\)/)[1],idQ=S.quill.match(/url\(#(bv\d+)\)/)[1];
const shadows=svgOf(shadowOf(swordShapes,S.SW)+shadowOf(quillShapes,S.QU));
const variants=[
 {id:3,name:'Two metals',note:'A silver serpent round a gold inner circle; bronze hilt, owl feather, crimson book; the nib wet with ink',
  ring:'silverRing',coreMap:'goldRing',hilt:'bronze',grip:'leatherDark',feather:'owl',bars:true,nib:'horn',cover:'#7a1420',ribbon:['#3fd497','#0d6a43']},
];
const pieces=v=>[
 {svg:shadows},
 {svg:svgOf(bookSvg(v.cover,v.ribbon))},
 {svg:inGroup(sword,S.SW,idS),map:v.hilt},
 {svg:inGroup(sword,S.SW,idS,'kBlade'),map:'steel'},
 {svg:inGroup(sword,S.SW,idS,'kGrip'),map:v.grip},
 {svg:inGroup(v.bars?quillBarred:quill,S.QU,idQ,'kFeather'),map:v.feather},
 {svg:inGroup(quill,S.QU,idQ,'kShaft'),map:'horn'},
 {svg:inGroup(quill,S.QU,idQ,'kNib'),map:v.nib},
 {svg:svgOf(wetNib()+inkHanging())},
 {svg:svgOf(goldStar(S.at[0],S.at[1],86,62,86,14,9)+emerald(S.at[0],S.at[1],17,25)+ringStars()+
   `<g transform="${S.SW.tf}">${emerald(lozC[0],lozC[1],6,9)}${emerald(PC[0],PC[1],7,9)}</g>`)},
 {svg:svgOf(finish(S))},
];

// ==== The final emblem's layers (2026-10-30; the host chose "3 but make the ink on the quill look way better", then
// "put it into the game and make sure it keeps moving like before, maybe we should add another gem at the top and have
// the snake rotate separately" and "I want the gems to match the chosen color of the game by the player").
//   public/emblem/ring-v3.webp      the serpent alone, blackened silver, its painted stars taken out (it turns)
//   public/emblem/core-v4.webp      still: the gold inner circle, the open book, the sword and quill, the ink, and five gold
//                                   stars (north, east, south, west on the ring and one where the sword and quill cross)
//                                   with their settings, but not the stones
//   public/emblem/gems-v1.webp      still: the stones and the book's ribbon, drawn as rubies; the theme's emblem filter
//                                   turns them to its colour (emerald for Green, sapphire for Blue...)
//   ring-glow-v3, core-glow-v4      small blurred copies for the breathing glow
//   seal-v3 (the top bar's whole emblem without stones), seal-ring-v2, seal-core-v3, seal-gems-v1 (boot card, pairing
//   page, the top bar's stones), assets/title/turquill-emblem.webp (the whole emblem with rubies, for the icons)
const DEST=process.env.QB_DEST||here;
// ---- the stones: rubies, so the theme filter (tuned to turn the painting's crimson) carries them to each colour ----
more.push(`<linearGradient id="gRuby" x1=".15" y1="0" x2=".85" y2="1"><stop offset="0" stop-color="#ffc9d8"/><stop offset=".25" stop-color="#ff4a7c"/><stop offset=".6" stop-color="#cf1149"/><stop offset="1" stop-color="#4d0320"/></linearGradient>
 <linearGradient id="gRubyT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9bb8"/><stop offset=".5" stop-color="#e5195f"/><stop offset="1" stop-color="#7a0634"/></linearGradient>
 <linearGradient id="gRibbon" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff5d8c"/><stop offset=".5" stop-color="#d0124f"/><stop offset="1" stop-color="#7a0634"/></linearGradient>`);
const oct=(cx,cy,W,H,C)=>`M${f(cx-W+C)} ${f(cy-H)} L ${f(cx+W-C)} ${f(cy-H)} L ${f(cx+W)} ${f(cy-H+C)} L ${f(cx+W)} ${f(cy+H-C)} L ${f(cx+W-C)} ${f(cy+H)} L ${f(cx-W+C)} ${f(cy+H)} L ${f(cx-W)} ${f(cy+H-C)} L ${f(cx-W)} ${f(cy-H+C)} Z`;
const bezel=(cx,cy,w,h)=>{const c=Math.min(w,h)*0.32,bw=w*1.3,bh=h*1.22,bc=c*1.3;
 return `<path d="${oct(cx,cy,bw+2,bh+2,bc+1)}" fill="#1a0f02"/><g filter="url(#bevN)"><path d="${oct(cx,cy,bw,bh,bc)}" fill="url(#gBez)"/></g><path d="${oct(cx,cy,w+1.5,h+1.5,c+0.6)}" fill="#14010a"/>`;};
const stone=(cx,cy,w,h)=>{const c=Math.min(w,h)*0.32,tw=w*0.52,th=h*0.58,tc=c*0.5;
 const steps=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sy])=>`<path d="M${f(cx+sx*(w-c*0.3))} ${f(cy+sy*(h-c*0.3))} L ${f(cx+sx*tw*0.95)} ${f(cy+sy*th*0.95)}" stroke="#3d0216" stroke-opacity=".55" stroke-width="${f(w*0.05)}"/>`).join('');
 return `<path d="${oct(cx,cy,w,h,c)}" fill="url(#gRuby)"/><path d="${oct(cx,cy,w*0.8,h*0.82,c*0.8)}" fill="none" stroke="#ffd6e2" stroke-opacity=".35" stroke-width="${f(w*0.05)}"/>
  ${steps}<path d="${oct(cx,cy,tw,th,tc)}" fill="url(#gRubyT)" stroke="#fff0f5" stroke-opacity=".5" stroke-width="${f(w*0.04)}"/>
  <path d="M${f(cx-tw*0.7)} ${f(cy-th*0.55)} L ${f(cx-tw*0.15)} ${f(cy-th*0.85)}" stroke="#ffffff" stroke-opacity=".85" stroke-width="${f(w*0.09)}" stroke-linecap="round"/>
  <circle cx="${f(cx+tw*0.35)}" cy="${f(cy+th*0.4)}" r="${f(w*0.07)}" fill="#fff0f5" opacity=".6"/>`;};
// Where the stars are: the ring's three from the painting (their centres measured), a fourth at the top opposite the
// south one, and the one where the sword and quill cross.
const ringStarAt={N:[515,131],W:[130,506],E:[900,509],S:[515,883]},centreAt2=S.at;
const ringStarsGold=()=>goldStar(ringStarAt.W[0],ringStarAt.W[1],104,92,104,16,7)+goldStar(ringStarAt.E[0],ringStarAt.E[1],104,92,104,16,7)+
 goldStar(ringStarAt.S[0],ringStarAt.S[1],84,72,122,15,7)+goldStar(ringStarAt.N[0],ringStarAt.N[1],122,72,84,15,7);
const centreGold=()=>goldStar(S.at[0],S.at[1],86,62,86,14,9);
const ringGemSpots=()=>[[...ringStarAt.W,13,19],[...ringStarAt.E,13,19],[...ringStarAt.S,12,18],[...ringStarAt.N,12,18]],centreGemSpot=()=>[[S.at[0],S.at[1],17,25]];
const swordGems=[[lozC,6,9],[PC,7,9]];
// The book without its ribbon (the ribbon is drawn with the stones, below the cover's edge, so it takes the theme too).
const bookNoRibbon=v=>bookSvg(v.cover,['none','none']).replace(/<path d="M500 728[^>]*\/><path d="M503 728[^>]*\/>/,'');
const ribbonGem=`<g clip-path="url(#kBelowCover)"><path d="M500 728 L 500 790 L 510 780 L 520 790 L 520 728 Z" fill="url(#gRibbon)"/><path d="M503 728 L 503 784 L 510 777 L 510 728 Z" fill="#ff8fb0" opacity=".55"/><path d="M500 728 L 500 790 L 510 780 L 520 790 L 520 728 Z" fill="none" stroke="#3d0216" stroke-width="1.5"/></g>`;
more.push(`<clipPath id="kBelowCover"><path d="M480 741 C 500 742.5, 524 742.5, 544 741 L 544 800 L 480 800 Z"/></clipPath>`);
const v=variants[0];
const corePieces=[
 {svg:shadows},
 {svg:svgOf(bookNoRibbon(v))},
 {svg:inGroup(sword,S.SW,idS),map:v.hilt},
 {svg:inGroup(sword,S.SW,idS,'kBlade'),map:'steel'},
 {svg:inGroup(sword,S.SW,idS,'kGrip'),map:v.grip},
 {svg:inGroup(v.bars?quillBarred:quill,S.QU,idQ,'kFeather'),map:v.feather},
 {svg:inGroup(quill,S.QU,idQ,'kShaft'),map:'horn'},
 {svg:inGroup(quill,S.QU,idQ,'kNib'),map:v.nib},
 {svg:svgOf(wetNib()+inkHanging())},
 {svg:svgOf(centreGold()+centreGemSpot().map(([x,y,w,h])=>bezel(x,y,w,h)).join('')+`<g transform="${S.SW.tf}">${swordGems.map(([p,w,h])=>bezel(p[0],p[1],w,h)).join('')}</g>`)},
 {svg:svgOf(finish(S))},
];
const ringStarsSvg=svgOf(ringStarsGold()+ringGemSpots().map(([x,y,w,h])=>bezel(x,y,w,h)).join(''));
const ringStonesSvg=svgOf(ringGemSpots().map(([x,y,w,h])=>stone(x,y,w,h)).join(''));
const gemsSvg=svgOf(ribbonGem+centreGemSpot().map(([x,y,w,h])=>stone(x,y,w,h)).join('')+`<g transform="${S.SW.tf}">${swordGems.map(([p,w,h])=>stone(p[0],p[1],w,h)).join('')}</g>`);
// The painted stars, to take out of the serpent (a little larger than painted, with their glow).
const starMasks=[star(130,506,128,116,128,34),star(900,509,128,116,128,34),star(515,883,106,96,150,32)];

(async()=>{
 const b64=p=>fs.readFileSync(p).toString('base64');
 const ring=b64(path.join(here,'public/emblem/ring-v2.webp')),core=b64(CORE);
 const b=await start({width:1200,height:1200,mobile:false,port:9400+Math.floor(Math.random()*80),profileName:'turquill-final-layers'});
 const page=path.join(require('node:os').tmpdir(),'turquill-final-layers.html');fs.writeFileSync(page,'<html><body style="margin:0;background:#000"></body></html>');
 await b.go('file:///'+page.split(path.sep).join('/'));await b.sleep(400);
 const out=await b.js(`(async()=>{const load=src=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;});
  const svgImg=s=>load('data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(s))));
  const canvas=(n=1024)=>{const c=document.createElement('canvas');c.width=c.height=n;return c;};
  const ringI=await load('data:image/webp;base64,${ring}'),coreI=await load('data:image/webp;base64,${core}');
  const ramps=${JSON.stringify(ramps)};const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const gmap=(cv,name)=>{const st=ramps[name].map(([t,c])=>[t,hex(c)]),g=cv.getContext('2d'),d=g.getImageData(0,0,cv.width,cv.height),x=d.data;
   for(let i=0;i<x.length;i+=4){if(!x[i+3])continue;const r=x[i],gg=x[i+1],bb=x[i+2],mx=Math.max(r,gg,bb),mn=Math.min(r,gg,bb),v=mx/255,s=mx?(mx-mn)/mx:0;let t=Math.min(1,v*(1-0.45*s)*1.08);
    let k=1;while(k<st.length-1&&st[k][0]<t)k++;const [t0,c0]=st[k-1],[t1,c1]=st[k],u=Math.max(0,Math.min(1,(t-t0)/((t1-t0)||1)));for(let j=0;j<3;j++)x[i+j]=c0[j]+(c1[j]-c0[j])*u;}
   g.putImageData(d,0,0);};
  const report={};
  // ---- the serpent: each painted star taken out and filled with the serpent's own body from further round ----
  const R=canvas();const rg=R.getContext('2d');rg.drawImage(ringI,0,0,1024,1024);
  const ringData=rg.getImageData(0,0,1024,1024).data;
  const RC=[515,507];   // the serpent's own middle (the painted stars' centres lie on a circle about it)
  const rotated=(deg)=>{const c=canvas(),g=c.getContext('2d');g.translate(RC[0],RC[1]);g.rotate(deg*Math.PI/180);g.translate(-RC[0],-RC[1]);g.drawImage(ringI,0,0,1024,1024);return c;};
  const maskOf=(d,grow)=>{const c=canvas(),g=c.getContext('2d');const p=new Path2D(d);g.fillStyle='#fff';g.fill(p);if(grow){g.lineWidth=grow;g.strokeStyle='#fff';g.lineJoin='round';g.stroke(p);}return c;};
  const masks=${JSON.stringify(starMasks)};
  for(const [mi,d] of masks.entries()){
   const inner=maskOf(d,40).getContext('2d').getImageData(0,0,1024,1024).data,outer=maskOf(d,72).getContext('2d').getImageData(0,0,1024,1024).data;
   let best=null;
   for(const sign of [-1,1])for(let deg=18;deg<=72;deg+=1){const a=sign*deg;const rd=rotated(a).getContext('2d').getImageData(0,0,1024,1024).data;let e=0,n=0;
    for(let i=0;i<rd.length;i+=4*3){if(!outer[i+3]||inner[i+3])continue;const w=Math.min(ringData[i+3],rd[i+3])/255;e+=Math.abs(ringData[i]-rd[i])+Math.abs(ringData[i+1]-rd[i+1])+Math.abs(ringData[i+2]-rd[i+2])+Math.abs(ringData[i+3]-rd[i+3])*0.6;n++;}
    if(n&&(!best||e/n<best.e))best={a,e:e/n};}
   report['star'+mi]=best;
   const src=rotated(best.a),soft=canvas(),sg=soft.getContext('2d');sg.filter='blur(7px)';sg.drawImage(maskOf(d,44),0,0);
   const patch=canvas(),pg=patch.getContext('2d');pg.drawImage(src,0,0);pg.globalCompositeOperation='destination-in';pg.drawImage(soft,0,0);
   rg.save();rg.globalCompositeOperation='destination-out';rg.drawImage(soft,0,0);rg.restore();rg.drawImage(patch,0,0);}
  gmap(R,'silverRing');
  // ---- the still layer ----
  const Cc=canvas(),cg=Cc.getContext('2d');
  {const cc=canvas(),g=cc.getContext('2d');g.drawImage(coreI,0,0,1024,1024);
   g.save();g.globalCompositeOperation='destination-out';g.filter='blur(6px)';g.fillStyle='#000';
   g.beginPath();g.ellipse(512,499,296,282,0,0,Math.PI*2);g.fill();g.beginPath();g.moveTo(468,276);g.lineTo(512,168);g.lineTo(556,276);g.closePath();g.fill();
   g.beginPath();g.moveTo(420,556);g.lineTo(528,506);g.lineTo(930,880);g.lineTo(890,925);g.lineTo(462,652);g.closePath();g.fill();g.beginPath();g.arc(515,787,22,0,Math.PI*2);g.fill();g.restore();
   for(const [x,y,r] of [[258,310,46],[789,382,30],[786,676,48],[242,750,30]]){g.save();g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.clip();g.clearRect(x-r,y-r,2*r,2*r);g.drawImage(coreI,0,0,1024,1024);g.restore();}
   gmap(cc,'goldRing');cg.drawImage(cc,0,0);}
  for(const p of ${JSON.stringify(corePieces)}){const t=canvas();t.getContext('2d').drawImage(await svgImg(p.svg),0,0);if(p.map)gmap(t,p.map);cg.drawImage(t,0,0);}
  // ---- the stones ----
  const G=canvas();G.getContext('2d').drawImage(await svgImg(${JSON.stringify(gemsSvg)}),0,0);
  const ST=canvas();ST.getContext('2d').drawImage(await svgImg(${JSON.stringify(ringStarsSvg)}),0,0);
  const SS=canvas();SS.getContext('2d').drawImage(await svgImg(${JSON.stringify(ringStonesSvg)}),0,0);
  // ---- the pictures ----
  const scaled=(layers,n,blur)=>{const c=canvas(n),g=c.getContext('2d');g.imageSmoothingQuality='high';if(blur)g.filter='blur('+blur+'px)';for(const l of layers)g.drawImage(l,0,0,n,n);return c;};
  const webp=(c,q)=>c.toDataURL('image/webp',q);
  const preview=canvas();{const g=preview.getContext('2d');g.fillStyle='#0b0708';g.fillRect(0,0,1024,1024);g.drawImage(R,0,0);g.drawImage(Cc,0,0);g.drawImage(ST,0,0);g.drawImage(G,0,0);g.drawImage(SS,0,0);}
  return {report,ring:webp(R,.84),core:webp(Cc,.86),gems:webp(G,.9),stars:webp(ST,.88),starStones:webp(SS,.9),ringGlow:webp(scaled([R],256,5),.8),coreGlow:webp(scaled([Cc],256,4),.8),
   seal:webp(scaled([R,Cc,ST],264),.88),sealRing:webp(scaled([R],360),.86),sealCore:webp(scaled([Cc,ST],360),.88),sealGems:webp(scaled([G,SS],360),.9),
   whole:webp(scaled([R,Cc,ST,G,SS],900),.8),preview:preview.toDataURL('image/png')};})()`);
 if(!out||typeof out!=='object'||!out.whole)throw new Error('drawing failed: '+String(out).slice(0,400));
 const files={ring:'public/emblem/ring-v3.webp',core:'public/emblem/core-v4.webp',gems:'public/emblem/gems-v1.webp',stars:'public/emblem/stars-v1.webp',starStones:'public/emblem/star-stones-v1.webp',ringGlow:'public/emblem/ring-glow-v3.webp',coreGlow:'public/emblem/core-glow-v4.webp',
  seal:'public/emblem/seal-v3.webp',sealRing:'public/emblem/seal-ring-v2.webp',sealCore:'public/emblem/seal-core-v3.webp',sealGems:'public/emblem/seal-gems-v1.webp',whole:'assets/title/turquill-emblem.webp'};
 for(const [k,file] of Object.entries(files)){const bytes=Buffer.from(out[k].split(',')[1],'base64');fs.writeFileSync(path.join(DEST,file),bytes);console.log(file,Math.round(bytes.length/1024)+' KB');}
 if(process.env.QB_PREVIEW)fs.writeFileSync(process.env.QB_PREVIEW,Buffer.from(out.preview.split(',')[1],'base64'));
 console.log('patches',JSON.stringify(out.report));await b.close();
})().catch(e=>{console.error(e);process.exit(1);});

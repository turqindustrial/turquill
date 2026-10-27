// Makes the Turquill emblem's other pictures from its two layers (2026-10-25): the serpent ring (public/emblem/ring-v2.webp,
// the host's own painting prepared by make-emblem.cjs, unchanged) and the still layer with the T (public/emblem/core-v3.webp,
// drawn by make-turquill-core.cjs), the same sizes and qualities make-emblem.cjs uses:
//   public/emblem/core-glow-v3.webp   a small blurred copy of the still layer for the breathing glow (256 px, blur 4)
//   public/emblem/seal-v2.webp        a small whole emblem for the top bar's mark (264 px)
//   public/emblem/seal-core-v2.webp   a small still layer for the boot card and the pairing page (360 px; their ring is
//                                     still seal-ring-v1.webp, as the ring has not changed)
//   assets/title/turquill-emblem.webp the whole emblem for the app icons (assets/title/icon.html) and native builds (900 px)
// Run: node make-turquill-emblem.cjs   (headless Chrome or Edge; no internet needed). Raise the -vN in the names (and in
// webTheme.js, public/index.html and phone-server.cjs) when the pictures change.
const fs=require('node:fs'),path=require('node:path');
const {start}=require(process.env.QB_CDP||'C:/Users/itsbr/qb-work/tools/cdp.cjs');
const here=__dirname,read=f=>'data:image/webp;base64,'+fs.readFileSync(path.join(here,f)).toString('base64');
const outputs={coreGlow:'public/emblem/core-glow-v3.webp',seal:'public/emblem/seal-v2.webp',sealCore:'public/emblem/seal-core-v2.webp',whole:'assets/title/turquill-emblem.webp'};
(async()=>{
 const b=await start({width:400,height:300,mobile:false,port:9400+Math.floor(Math.random()*80),profileName:'turquill-emblem'});
 const page=path.join(require('node:os').tmpdir(),'turquill-emblem.html');fs.writeFileSync(page,'<html><body></body></html>');
 await b.go('file:///'+page.split(path.sep).join('/'));await b.sleep(400);
 const out=await b.js(`(async()=>{
  const load=src=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;});
  const ring=await load(${JSON.stringify(read('public/emblem/ring-v2.webp'))}),core=await load(${JSON.stringify(read('public/emblem/core-v3.webp'))});
  const canvas=n=>{const c=document.createElement('canvas');c.width=c.height=n;return c;};
  const draw=(n,layers,blur)=>{const c=canvas(n),g=c.getContext('2d');g.imageSmoothingQuality='high';if(blur)g.filter='blur('+blur+'px)';for(const l of layers)g.drawImage(l,0,0,n,n);return c;};
  const webp=(c,q)=>c.toDataURL('image/webp',q);
  return {coreGlow:webp(draw(256,[core],4),.8),seal:webp(draw(264,[ring,core]),.88),sealCore:webp(draw(360,[core]),.88),whole:webp(draw(900,[ring,core]),.76)};
 })()`);
 if(!out||typeof out!=='object'||!out.whole)throw new Error('drawing failed: '+String(out).slice(0,300));
 for(const [key,file] of Object.entries(outputs)){const bytes=Buffer.from(out[key].split(',')[1],'base64');fs.mkdirSync(path.dirname(path.join(here,file)),{recursive:true});fs.writeFileSync(path.join(here,file),bytes);console.log(file+' '+Math.round(bytes.length/1024)+' KB');}
 await b.close();
})().catch(e=>{console.error(e);process.exit(1);});

// Makes the Discord server icon from the emblem's own layers (2026-10-30, the host: "send me a copy of the logo designed
// to be for my discord logo"): the serpent turned 45 degrees (a moment of its turn, so the dragon's face shows between the
// north and east stars), the still gold, book, sword and quill, the four ring stars and every stone as rubies, on a dark
// ground with a faint warm glow. Discord shows server icons in a circle: everything stays inside it (the star points lie
// within 0.97 of its radius). Writes assets/branding/discord/turquill-discord-icon.png (1024 px, to upload),
// turquill-discord-icon-512.png and turquill-discord-preview.png (both crops side by side, to look at).
// Run: node make-discord-icon.cjs   (headless Chrome or Edge; no internet needed)
const fs=require('node:fs'),path=require('node:path');
const {start}=require(process.env.QB_CDP||'C:/Users/itsbr/qb-work/tools/cdp.cjs');
const here=__dirname,dir=path.join(here,'assets/branding/discord'),read=f=>'data:image/webp;base64,'+fs.readFileSync(path.join(here,'public/emblem',f)).toString('base64');
const TURN=Number(process.env.QB_TURN||45);
(async()=>{
 fs.mkdirSync(dir,{recursive:true});
 const b=await start({width:400,height:300,mobile:false,port:9400+Math.floor(Math.random()*80),profileName:'turquill-discord'});
 const page=path.join(require('node:os').tmpdir(),'turquill-discord.html');fs.writeFileSync(page,'<html><body></body></html>');
 await b.go('file:///'+page.split(path.sep).join('/'));await b.sleep(400);
 const out=await b.js(`(async()=>{const load=src=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;});
  const [ring,core,gems,stars,stones]=await Promise.all([${['ring-v3.webp','core-v4.webp','gems-v1.webp','stars-v1.webp','star-stones-v1.webp'].map(f=>JSON.stringify(read(f))).join(',')}].map(load));
  const icon=n=>{const c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d'),k=n/1024;
   const bg=g.createRadialGradient(512*k,500*k,0,512*k,512*k,724*k);bg.addColorStop(0,'#2a1620');bg.addColorStop(.45,'#160b12');bg.addColorStop(1,'#060308');g.fillStyle=bg;g.fillRect(0,0,n,n);
   const glow=g.createRadialGradient(512*k,500*k,0,512*k,500*k,380*k);glow.addColorStop(0,'rgba(232,190,110,.17)');glow.addColorStop(.6,'rgba(160,40,70,.08)');glow.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=glow;g.fillRect(0,0,n,n);
   g.imageSmoothingQuality='high';const s=.985*n,o=(n-s)/2;
   g.save();g.translate(n/2,n/2);g.rotate(${TURN}*Math.PI/180);g.translate(-n/2,-n/2);g.drawImage(ring,o,o,s,s);g.restore();
   for(const l of [core,stars,gems,stones])g.drawImage(l,o,o,s,s);return c;};
  const big=icon(1024),small=icon(512);
  // A look at it as Discord shows it: round, large and in the server list's small size.
  const p=document.createElement('canvas');p.width=760;p.height=420;const g=p.getContext('2d');g.fillStyle='#313338';g.fillRect(0,0,760,420);
  const round=(x,y,d)=>{g.save();g.beginPath();g.arc(x+d/2,y+d/2,d/2,0,Math.PI*2);g.clip();g.imageSmoothingQuality='high';g.drawImage(big,x,y,d,d);g.restore();};
  round(30,30,360);g.fillStyle='#1e1f22';g.fillRect(430,30,90,360);round(443,46,48);round(443,106,48);
  g.fillStyle='#dbdee1';g.font='15px sans-serif';g.fillText('As Discord shows it: round,',540,60);g.fillText('and at 48 px in the server list.',540,82);
  return {big:big.toDataURL('image/png'),small:small.toDataURL('image/png'),preview:p.toDataURL('image/png')};})()`);
 if(!out||typeof out!=='object'||!out.big)throw new Error('drawing failed: '+String(out).slice(0,300));
 for(const [k,f] of [['big','turquill-discord-icon.png'],['small','turquill-discord-icon-512.png'],['preview','turquill-discord-preview.png']]){const bytes=Buffer.from(out[k].split(',')[1],'base64');fs.writeFileSync(path.join(dir,f),bytes);console.log(path.join('assets/branding/discord',f),Math.round(bytes.length/1024)+' KB');}
 await b.close();
})().catch(e=>{console.error(e);process.exit(1);});

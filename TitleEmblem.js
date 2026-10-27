import React,{useLayoutEffect,useRef} from 'react';
import {View,Image,Platform,StyleSheet} from 'react-native';

// The Turquill emblem: the serpent of the host's own painting (assets/title/turquill-seal-source.webp, 2026-10-10)
// biting its tail round a sword and a quill crossed like a coat of arms (2026-10-26, drawn by make-turquill-core.cjs in
// place of the painting's Q and dagger). make-emblem.cjs splits the painting into layers (public/emblem/) and
// webTheme.js animates them: the serpent ring with its stars turns all the way round, once every 36 s, the way the
// dragon's head faces, while the sword and quill stay still on top; a soft glow breathes, a light sweeps across them now
// and then and the stars twinkle. The Light atmosphere, reduced motion
// and the full-screen covers hold it still, and the player's colour theme tints it (a filter, themeRules.js emblemFilter).
// The ring keeps one clock for the whole page: every emblem starts its turn where the page's clock has it (a negative
// animation delay), so the boot card, the launch card, the title page and the story seal are all at the same angle and
// a screen change never sends the ring back to where it began.
// `size` is the size of the old ring; the emblem's square (the serpent, its head and the star points) is 1.42 times it.
const web=Platform.OS==='web';
const whole=web?null:require('./assets/title/turquill-emblem.webp');
// Where the four-point stars shine, as shares of the square: west, east and south on the ring (from the painting; they
// turn with it), and the star where the sword and quill cross (its glint in make-turquill-core.cjs).
const ringStars=[[12.7,49.7,'west'],[87.9,49.6,'east'],[50.2,86.3,'south']],centreStar=[49.2,47.8,'centre'];
// One full turn of the ring, in seconds (webTheme.js [data-qb=emblem-turn] and the boot card in public/index.html).
export const emblemTurn=36;
export const emblemPhase=(now=globalThis.performance?.now?.()??0)=>-(now%(emblemTurn*1000));
const twinkle=([left,top,star])=><View key={star} dataSet={{qb:'emblem-twinkle',star}} style={[s.twinkle,{left:left-6+'%',top:top-6+'%'}]}/>;
export default function TitleEmblem({size=200,place='title'}){
 const box=Math.round(size*1.42),turn=useRef(null);
 useLayoutEffect(()=>{if(turn.current?.style)turn.current.style.animationDelay=Math.round(emblemPhase())+'ms';},[]);
 if(!web)return <Image source={whole} accessible={false} style={{width:box,height:box}}/>;
 return <View accessible={false} dataSet={{qb:'emblem',place}} style={[s.still,{width:box,height:box}]}>
  <View dataSet={{qb:'emblem-back'}} style={s.layer}/>
  <View ref={turn} dataSet={{qb:'emblem-turn'}} style={s.layer}>
   <View dataSet={{qb:'emblem-glow',part:'ring'}} style={s.layer}/>
   <View dataSet={{qb:'emblem-ring'}} style={s.layer}/>
   {ringStars.map(twinkle)}
  </View>
  <View dataSet={{qb:'emblem-glow',part:'core'}} style={s.layer}/>
  <View dataSet={{qb:'emblem-core'}} style={s.layer}/>
  <View dataSet={{qb:'emblem-sheen'}} style={s.layer}><View dataSet={{qb:'emblem-shine'}} style={s.shine}/></View>
  {twinkle(centreStar)}
 </View>;
}
// The emblem as a small still mark (the top bar's way back to the main menu).
export function EmblemMark({size=40}){
 if(!web)return <Image source={whole} accessible={false} style={{width:size,height:size}}/>;
 return <View accessible={false} dataSet={{qb:'emblem-mark'}} style={[s.still,{width:size,height:size}]}/>;
}
const s=StyleSheet.create({
 still:{pointerEvents:'none'},
 layer:{position:'absolute',left:0,top:0,right:0,bottom:0,pointerEvents:'none'},
 twinkle:{position:'absolute',width:'12%',height:'12%',pointerEvents:'none'},
 shine:{position:'absolute',top:'-10%',bottom:'-10%',left:0,width:'45%'},
});

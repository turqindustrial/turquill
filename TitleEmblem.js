import React,{useLayoutEffect,useRef} from 'react';
import {View,Image,Platform,StyleSheet} from 'react-native';

// The Turquill emblem (2026-10-30, the host's final choice): the serpent of the host's own painting
// (assets/title/turquill-seal-source.webp, 2026-10-10) in blackened silver, biting its tail round a gold inner circle, an
// open book with a steel sword and an owl's quill crossed over it, the nib wet with ink, and five gold stars (north, east,
// south and west on the ring and one where the sword and quill cross) each set with a stone. make-turquill-final.cjs makes
// the layers (public/emblem/) and webTheme.js animates them: the serpent alone turns all the way round, once every 36 s,
// the way the dragon's head faces, under the still stars (the host: "have the snake rotate separately"), and as its
// jaws reach each star on the ring it swallows it, and the star grows back while the serpent goes round (the host: "have
// the snake consume the gems as it passes them, then have them fade back in as it goes around"); a soft glow
// breathes, a light sweeps across the still layer now and then and the stars twinkle. The Light atmosphere, reduced
// motion and the full-screen covers hold it still. Only the stones follow the player's colour theme (the host: "I want
// the gems to match the chosen color of the game by the player"): they are drawn as rubies and the theme's filter
// (themeRules.js emblemFilter) turns them, emerald for Green, sapphire for Blue; silver, gold, steel and the book stay.
// The ring keeps one clock for the whole page: every emblem starts its turn where the page's clock has it (a negative
// animation delay), so the boot card, the launch card, the title page and the story seal are all at the same angle and
// a screen change never sends the ring back to where it began.
// `size` is the size of the old ring; the emblem's square (the serpent, its head and the star points) is 1.42 times it.
const web=Platform.OS==='web';
const whole=web?null:require('./assets/title/turquill-emblem.webp');
// Where the four-point stars shine, as shares of the square: north, west, east and south on the ring, and the star
// where the sword and quill cross (make-turquill-final.cjs ringStarAt). They stand still while the serpent turns.
const ringStars=[[50.3,12.8,'north'],[12.7,49.4,'west'],[87.9,49.7,'east'],[50.3,86.2,'south']],centreStar=[50,46.5,'centre'];
// One full turn of the ring, in seconds (webTheme.js [data-qb=emblem-turn] and the boot card in public/index.html).
export const emblemTurn=36;
export const emblemPhase=(now=globalThis.performance?.now?.()??0)=>-(now%(emblemTurn*1000));
const twinkle=([left,top,star])=><View key={star} dataSet={{qb:'emblem-twinkle',star}} style={[s.twinkle,{left:left-6+'%',top:top-6+'%'}]}/>;
// A star on the ring: its gold and setting (stars-v1.webp), its stone in the theme's colour (star-stones-v1.webp) and its
// twinkle, cut to the star's own corner of the square so it can be swallowed alone (webTheme.js qb-emblem-swallow-*).
const ringStar=spot=><View key={spot[2]} dataSet={{qb:'emblem-star',star:spot[2]}} style={s.layer}>
 <View dataSet={{qb:'emblem-star-gold'}} style={s.layer}/><View dataSet={{qb:'emblem-star-stone'}} style={s.layer}/>{twinkle(spot)}
</View>;
export default function TitleEmblem({size=200,place='title'}){
 const box=Math.round(size*1.42),root=useRef(null);
 // The serpent and the stars it swallows keep the page's one clock.
 useLayoutEffect(()=>{const delay=Math.round(emblemPhase())+'ms';root.current?.querySelectorAll?.('[data-qb=emblem-turn],[data-qb=emblem-star]').forEach(el=>{el.style.animationDelay=delay;});},[]);
 if(!web)return <Image source={whole} accessible={false} style={{width:box,height:box}}/>;
 return <View ref={root} accessible={false} dataSet={{qb:'emblem',place}} style={[s.still,{width:box,height:box}]}>
  <View dataSet={{qb:'emblem-back'}} style={s.layer}/>
  <View dataSet={{qb:'emblem-turn'}} style={s.layer}>
   <View dataSet={{qb:'emblem-glow',part:'ring'}} style={s.layer}/>
   <View dataSet={{qb:'emblem-ring'}} style={s.layer}/>
  </View>
  <View dataSet={{qb:'emblem-glow',part:'core'}} style={s.layer}/>
  <View dataSet={{qb:'emblem-core'}} style={s.layer}/>
  <View dataSet={{qb:'emblem-gems'}} style={s.layer}/>
  <View dataSet={{qb:'emblem-sheen'}} style={s.layer}><View dataSet={{qb:'emblem-shine'}} style={s.shine}/></View>
  {ringStars.map(ringStar)}
  {twinkle(centreStar)}
 </View>;
}
// The emblem as a small still mark (the top bar's way back to the main menu), its stones in the theme's colour.
export function EmblemMark({size=40}){
 if(!web)return <Image source={whole} accessible={false} style={{width:size,height:size}}/>;
 return <View accessible={false} dataSet={{qb:'emblem-mark'}} style={[s.still,{width:size,height:size}]}><View dataSet={{qb:'emblem-mark-gems'}} style={s.layer}/></View>;
}
const s=StyleSheet.create({
 still:{pointerEvents:'none'},
 layer:{position:'absolute',left:0,top:0,right:0,bottom:0,pointerEvents:'none'},
 twinkle:{position:'absolute',width:'12%',height:'12%',pointerEvents:'none'},
 shine:{position:'absolute',top:'-10%',bottom:'-10%',left:0,width:'45%'},
});

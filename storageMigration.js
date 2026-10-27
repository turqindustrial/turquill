// The game's storage keys were named questbound.* until 2026-10-27, when they took the game's name, Turquill (the host
// chose "Everything, with save migration"). This moves every saved key in the browser to its new name once, before any
// other module reads storage (index.js imports this first): questbound.adventure.v1 becomes turquill.adventure.v1, and a
// profile's questbound.profile.<id>.questbound.adventure.v1 becomes turquill.profile.<id>.turquill.adventure.v1. A key
// already under its new name wins (a tab from before the update that wrote the old name later is not taken over it), and
// the old key goes. A save too large to copy beside its old self is moved by removing the old key first: the new name
// is shorter, so the value always fits where it was. Pure and total: storage that refuses or throws is left as it is,
// and nothing else in the game depends on it having run.
export const oldPrefix='questbound.',newPrefix='turquill.';
export const renamedKey=key=>typeof key==='string'&&key.startsWith(oldPrefix)?key.split(oldPrefix).join(newPrefix):null;
export function migrateStorage(store){
 const moved=[];
 try{
  if(!store||typeof store.length!=='number')return moved;
  const keys=[];for(let i=0;i<store.length;i++){const key=store.key(i);if(renamedKey(key))keys.push(key);}
  for(const key of keys){
   try{
    const value=store.getItem(key),next=renamedKey(key);
    if(value===null)continue;
    if(store.getItem(next)===null){
     try{store.setItem(next,value);}catch{store.removeItem(key);store.setItem(next,value);}
     moved.push(next);
    }
    store.removeItem(key);
   }catch{}
  }
 }catch{}
 return moved;
}
export function migrateBrowserStorage(){
 const get=name=>{try{return globalThis.window?.[name]??null;}catch{return null;}};
 return [...migrateStorage(get('localStorage')),...migrateStorage(get('sessionStorage'))];
}
migrateBrowserStorage();

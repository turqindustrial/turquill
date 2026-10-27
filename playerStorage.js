import AsyncStorage from '@react-native-async-storage/async-storage';
import {renamedKey} from './storageMigration';
// Namespaces prevent accidental cross-account save adoption on a shared browser.
// This is local separation, not encryption against someone who controls the device.
let profile='guest';
const listeners=new Set();
export const currentProfile=()=>profile;
export const profileKey=(key,id=profile)=>'turquill.profile.'+id+'.'+key;
export const subscribeProfile=fn=>{listeners.add(fn);return()=>listeners.delete(fn);};
export function selectProfile(id){const next=/^[a-f0-9]{64}$/.test(id??'')?id:'guest';if(next===profile)return;profile=next;listeners.forEach(fn=>fn(next));}
// Keys saved before the rename (questbound.*, until 2026-10-27) move to their new names once, before the first read. On
// the web storageMigration.js has already moved them (this finds none); a native build keeps AsyncStorage of its own.
let renamed=null;
const renameOld=()=>renamed??=(async()=>{try{const keys=(await AsyncStorage.getAllKeys()).filter(k=>renamedKey(k));for(const key of keys){const value=await AsyncStorage.getItem(key),next=renamedKey(key);if(value!==null&&await AsyncStorage.getItem(next)===null)await AsyncStorage.setItem(next,value);await AsyncStorage.removeItem(key);}}catch{}})();
function scope(id=profile){return {
 async getItem(key){await renameOld();const saved=await AsyncStorage.getItem(profileKey(key,id));if(saved!==null||id!=='guest')return saved;const legacy=await AsyncStorage.getItem(key);if(legacy!==null)await AsyncStorage.setItem(profileKey(key,id),legacy);return legacy;},
 setItem:(key,value)=>AsyncStorage.setItem(profileKey(key,id),value),
 removeItem:key=>AsyncStorage.removeItem(profileKey(key,id)),
 };}
export default {scope,getItem:key=>scope().getItem(key),setItem:(key,v)=>scope().setItem(key,v),removeItem:key=>scope().removeItem(key)};

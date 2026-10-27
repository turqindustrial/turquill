// Account-scoped campaign membership and local recovery copies. All requests use the same-origin gateway.
import {profileKey,currentProfile} from './playerStorage';
const KEY='turquill.table.v2';
const store={get(){try{return JSON.parse(globalThis.localStorage?.getItem(profileKey(KEY)))??{};}catch{return {};}},set(v){try{globalThis.localStorage?.setItem(profileKey(KEY),JSON.stringify(v));}catch{}}};
export function tableEndpoint(location=globalThis.location){
 return '/api/sync';
}
export function deviceId(){
 const s=store.get();if(currentProfile()!=='guest')return currentProfile();if(s.deviceId)return s.deviceId;
 const id=(globalThis.crypto?.randomUUID?.()??(Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12)));store.set({...s,deviceId:id});return id;
}
export const tableMembership=()=>{const s=store.get();return {joined:!!s.joined,name:s.name??'',campaignId:s.campaignId??null,version:Number.isInteger(s.version)?s.version:0};};
export function setTableMembership(changes){store.set({...store.get(),deviceId:deviceId(),...changes});}
// Before the table first replaces this device's save, keep a copy so it can be restored.
const saveKeys=['turquill.character.v1','turquill.adventure.v1'];
export function backupLocalSave(){try{const ls=globalThis.localStorage;if(!ls||ls.getItem(profileKey('turquill.backup.savedAt')))return;for(const k of saveKeys){const v=ls.getItem(profileKey(k));if(v!==null)ls.setItem(profileKey('turquill.backup.'+k),v);}ls.setItem(profileKey('turquill.backup.savedAt'),new Date().toISOString());}catch{}}
export function localBackup(){try{return globalThis.localStorage?.getItem(profileKey('turquill.backup.savedAt'))??null;}catch{return null;}}
export function restoreLocalBackup(){const ls=globalThis.localStorage;for(const k of saveKeys){const v=ls.getItem(profileKey('turquill.backup.'+k));if(v===null)ls.removeItem(profileKey(k));else ls.setItem(profileKey(k),v);ls.removeItem(profileKey('turquill.backup.'+k));}ls.removeItem(profileKey('turquill.backup.savedAt'));}

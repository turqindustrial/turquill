// The host's files took the game's name, Turquill, on 2026-10-27 (the host chose "Everything, with save migration"):
// every .questbound-* file and folder of the game's data (accounts, the shared tables, the libraries, logs, keys, budgets,
// sessions) is renamed .turquill-* once, where it lies, and nothing is copied or lost. Run by the launcher before it
// reads anything (node name-migration.cjs), by serve.cjs for a hosted data folder, and by each server as it starts
// (a second run finds nothing to do). Where both names exist (a process from before the update wrote the old one again)
// a folder's entries the new one lacks are moved into it, a log (.jsonl) is appended to the new one, and anything else
// keeps the new one and leaves the old where it is (reported, never deleted). The Desktop copies of the libraries
// ("Questbound people" and the rest) are renamed too when asked (--desktop), and settings given under their old names
// (QUESTBOUND_*) are read as TURQUILL_* (legacyEnv). Run: node name-migration.cjs [folder] [--desktop] [--quiet]
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const oldPrefix='.questbound-',newPrefix='.turquill-';
const desktopFolders=['people','creatures','place art','paintings backup','written tales'];
function moveInto(from,to,report){
 for(const entry of fs.readdirSync(from)){
  const a=path.join(from,entry),b=path.join(to,entry);
  if(!fs.existsSync(b)){fs.renameSync(a,b);continue;}
  if(fs.statSync(a).isDirectory()&&fs.statSync(b).isDirectory())moveInto(a,b,report);
  else report.kept.push(a);
 }
 if(!fs.readdirSync(from).length)fs.rmdirSync(from);
}
function migrateDataNames(dir=__dirname,report={renamed:[],merged:[],kept:[]}){
 let entries=[];try{entries=fs.readdirSync(dir);}catch{return report;}
 for(const name of entries){
  if(!name.startsWith(oldPrefix))continue;
  const from=path.join(dir,name),to=path.join(dir,newPrefix+name.slice(oldPrefix.length));
  try{
   if(!fs.existsSync(to)){fs.renameSync(from,to);report.renamed.push(name);continue;}
   const stat=fs.statSync(from);
   if(stat.isDirectory()&&fs.statSync(to).isDirectory()){moveInto(from,to,report);report.merged.push(name);}
   else if(stat.isFile()&&/\.jsonl$/.test(name)){const text=fs.readFileSync(from,'utf8');if(text)fs.appendFileSync(to,text.endsWith('\n')?text:text+'\n');fs.rmSync(from);report.merged.push(name);}
   else report.kept.push(from);
  }catch(e){if(e.code!=='ENOENT')report.kept.push(from+' ('+e.code+')');}
 }
 return report;
}
function migrateDesktopFolders(home=os.homedir(),report={renamed:[],merged:[],kept:[]}){
 for(const kind of desktopFolders){
  const from=path.join(home,'Desktop','Questbound '+kind),to=path.join(home,'Desktop','Turquill '+kind);
  try{if(fs.existsSync(from)&&!fs.existsSync(to)){fs.renameSync(from,to);report.renamed.push('Desktop/Questbound '+kind);}else if(fs.existsSync(from))report.kept.push(from);}catch(e){report.kept.push(from+' ('+e.code+')');}
 }
 return report;
}
function legacyEnv(env=process.env){
 for(const [key,value] of Object.entries(env))if(key.startsWith('QUESTBOUND_')){const next='TURQUILL_'+key.slice(11);if(env[next]===undefined)env[next]=value;}
 return env;
}
module.exports={migrateDataNames,migrateDesktopFolders,legacyEnv,oldPrefix,newPrefix,desktopFolders};
if(require.main===module){
 const args=process.argv.slice(2),dir=path.resolve(args.find(a=>!a.startsWith('--'))??__dirname);
 const report=migrateDataNames(dir);if(args.includes('--desktop'))migrateDesktopFolders(os.homedir(),report);
 if(!args.includes('--quiet')||report.renamed.length||report.merged.length||report.kept.length)
  console.log('Names: '+(report.renamed.length?'renamed '+report.renamed.join(', '):'nothing to rename')+(report.merged.length?'; merged '+report.merged.join(', '):'')+(report.kept.length?'; left in place (both names exist): '+report.kept.join(', '):''));
}

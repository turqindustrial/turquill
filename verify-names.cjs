// The rename of 2026-10-27 (Questbound to Turquill; the host chose "Everything, with save migration"): every saved key in
// the browser (storageMigration.js), every data file and Desktop copy on the host (name-migration.cjs), settings under
// their old names and the old sign-in cookie move over or keep working, and nothing is lost on the way. Also: no name of
// the old kind is left in the code but the stored identifiers that must keep their bytes (hash salts, picture ids).
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto'),{execSync}=require('node:child_process');

// 1. The browser's storage (storageMigration.js, loaded as the game loads it but without the module syntax).
const source=fs.readFileSync('storageMigration.js','utf8');
assert.ok(/^migrateBrowserStorage\(\);\s*$/m.test(source),'the migration runs as the module loads');
assert.ok(/^\/\/[^\n]*\nimport '\.\/storageMigration';\nimport \{ registerRootComponent \} from 'expo';/m.test(fs.readFileSync('index.js','utf8').replace(/\r\n/g,'\n')),'index.js imports the migration before anything else');
const {migrateStorage,renamedKey,migrateBrowserStorage}=new Function(source.replace(/^export /gm,'').replace(/^migrateBrowserStorage\(\);\s*$/m,'')+';return {migrateStorage,renamedKey,migrateBrowserStorage};')();
function store(entries={},{quota=Infinity,broken=false}={}){
 const map=new Map(Object.entries(entries)),size=()=>[...map].reduce((n,[k,v])=>n+k.length+v.length,0);
 const s={get length(){if(broken)throw Error('denied');return map.size;},key:i=>[...map.keys()][i]??null,getItem:k=>map.has(k)?map.get(k):null,
  setItem(k,v){const before=map.get(k);map.set(k,String(v));if(size()>quota){if(before===undefined)map.delete(k);else map.set(k,before);const e=Error('QuotaExceededError');e.name='QuotaExceededError';throw e;}},
  removeItem:k=>{map.delete(k);},map};return s;}
assert.equal(renamedKey('questbound.adventure.v1'),'turquill.adventure.v1');
assert.equal(renamedKey('questbound.profile.guest.questbound.adventure.v1'),'turquill.profile.guest.turquill.adventure.v1');
assert.equal(renamedKey('questbound.profile.'+'a'.repeat(64)+'.questbound.roster.v1'),'turquill.profile.'+'a'.repeat(64)+'.turquill.roster.v1');
assert.equal(renamedKey('turquill.theme.v1'),null);assert.equal(renamedKey('other.questbound.x'),null);assert.equal(renamedKey(null),null);
{const s=store({'questbound.adventure.v1':'{"a":1}','questbound.profile.guest.questbound.character.v1':'{"name":"Kara"}','questbound.theme.v1':'{"theme":"green"}','other':'x'});
 const moved=migrateStorage(s);assert.deepEqual(moved.sort(),['turquill.adventure.v1','turquill.profile.guest.turquill.character.v1','turquill.theme.v1']);
 assert.deepEqual(Object.fromEntries(s.map),{'other':'x','turquill.adventure.v1':'{"a":1}','turquill.profile.guest.turquill.character.v1':'{"name":"Kara"}','turquill.theme.v1':'{"theme":"green"}'});
 assert.deepEqual(migrateStorage(s),[],'a second run moves nothing');}
// A key already under its new name wins; a different old value is kept beside it, never lost; the same value just goes.
{const s=store({'questbound.audio.v1':'old','turquill.audio.v1':'new','questbound.theme.v1':'t','turquill.theme.v1':'t'});migrateStorage(s);
 assert.deepEqual(Object.fromEntries(s.map),{'turquill.audio.v1':'new','turquill.renamed-conflict.questbound.audio.v1':'old','turquill.theme.v1':'t'});
 assert.deepEqual(migrateStorage(s),[],'the kept value is not moved again');}
// When even the second write fails, the value goes back under its old name.
{const s=store({'questbound.roster.v1':'r'});const set=s.setItem;s.setItem=(k,v)=>{if(k.startsWith('turquill.'))throw Error('quota');return set(k,v);};migrateStorage(s);assert.equal(s.getItem('questbound.roster.v1'),'r');}
// A save too large to copy beside its old self is moved all the same (the old key goes first).
{const big='x'.repeat(4000),s=store({'questbound.roster.v1':big,'turquill.small':'1'},{quota:4000+'questbound.roster.v1'.length+20+30});
 migrateStorage(s);assert.equal(s.getItem('turquill.roster.v1'),big);assert.equal(s.getItem('questbound.roster.v1'),null);}
// Storage that refuses or throws is left alone and never breaks the game.
assert.deepEqual(migrateStorage(store({'questbound.a':'1'},{broken:true})),[]);assert.deepEqual(migrateStorage(null),[]);assert.deepEqual(migrateStorage({}),[]);
{const s=store({'questbound.a':'1'});s.getItem=()=>{throw Error('no');};assert.deepEqual(migrateStorage(s),[]);}
// In a browser it moves both the local and the session storage.
{const local=store({'questbound.character.v1':'c'}),session=store({'questbound.problems.v1':'[]'});const was=globalThis.window;globalThis.window={localStorage:local,sessionStorage:session};
 try{assert.deepEqual(migrateBrowserStorage().sort(),['turquill.character.v1','turquill.problems.v1']);}finally{if(was===undefined)delete globalThis.window;else globalThis.window=was;}}
// The boot card reads the saved theme under either name (its script runs before the migration).
assert.ok(fs.readFileSync('public/index.html','utf8').includes("localStorage.getItem('turquill.theme.v1')||localStorage.getItem('questbound.theme.v1')"),'the boot card falls back to the old theme key');
// A native build's AsyncStorage is moved before the first profile read.
{const ps=fs.readFileSync('playerStorage.js','utf8');assert.ok(ps.includes("import {renamedKey} from './storageMigration';")&&ps.includes('async getItem(key){await renameOld();'),'playerStorage moves old keys before reading');}

// 2. The host's files (name-migration.cjs).
const {migrateDataNames,migrateDesktopFolders,legacyEnv}=require('./name-migration.cjs');
{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'turquill-names-'));const w=(f,t)=>{fs.mkdirSync(path.dirname(path.join(dir,f)),{recursive:true});fs.writeFileSync(path.join(dir,f),t);};
 w('.questbound-usage.jsonl','{"a":1}\n');w('.questbound-art/abc.jpg','jpg');w('.questbound-art/picks/x.json','{}');w('.questbound-key.dpapi','secret');w('.questbound-logs/pids.json','{}');
 w('.questbound-diagnostics.jsonl','{"old":1}\n');w('.turquill-diagnostics.jsonl','{"new":1}\n');
 w('.questbound-people/np001.jpg','old');w('.questbound-people/np002.jpg','two');w('.turquill-people/np001.jpg','new');
 w('.questbound-model','old-model');w('.turquill-model','new-model');w('keep.txt','k');w('.other','o');
 const report=migrateDataNames(dir);const has=f=>fs.existsSync(path.join(dir,f)),read=f=>fs.readFileSync(path.join(dir,f),'utf8');
 assert.deepEqual(report.renamed.sort(),['.questbound-art','.questbound-key.dpapi','.questbound-logs','.questbound-usage.jsonl']);
 assert.equal(read('.turquill-usage.jsonl'),'{"a":1}\n');assert.equal(read('.turquill-art/abc.jpg'),'jpg');assert.equal(read('.turquill-art/picks/x.json'),'{}');assert.equal(read('.turquill-key.dpapi'),'secret');assert.ok(has('.turquill-logs/pids.json'));
 assert.equal(read('.turquill-diagnostics.jsonl'),'{"new":1}\n{"old":1}\n','a log written under both names keeps every line');assert.ok(!has('.questbound-diagnostics.jsonl'));
 assert.equal(read('.turquill-people/np001.jpg'),'new','the new name wins');assert.equal(read('.turquill-people/np002.jpg'),'two','entries only the old folder has move in');assert.equal(read('.questbound-people/np001.jpg'),'old','nothing is deleted');
 assert.equal(read('.turquill-model'),'new-model');assert.equal(read('.questbound-model'),'old-model');assert.ok(report.kept.length>=2);
 assert.ok(has('keep.txt')&&has('.other'));
 const again=migrateDataNames(dir);assert.deepEqual(again.renamed,[]);assert.deepEqual(again.merged,['.questbound-people']);
 assert.deepEqual(migrateDataNames(path.join(dir,'missing')).renamed,[],'a folder that is not there is no error');
 // The Desktop copies of the libraries.
 const home=path.join(dir,'home');for(const k of ['people','written tales'])fs.mkdirSync(path.join(home,'Desktop','Questbound '+k),{recursive:true});fs.mkdirSync(path.join(home,'Desktop','Turquill written tales'),{recursive:true});
 const d=migrateDesktopFolders(home);assert.deepEqual(d.renamed,['Desktop/Questbound people']);assert.ok(fs.existsSync(path.join(home,'Desktop','Turquill people')));assert.ok(fs.existsSync(path.join(home,'Desktop','Questbound written tales')),'a Desktop copy is never merged or deleted');
 fs.rmSync(dir,{recursive:true,force:true});}
{const env={QUESTBOUND_DATA:'/old',QUESTBOUND_DM_PORT:'9',TURQUILL_DM_PORT:'8084',OTHER:'x'};legacyEnv(env);assert.equal(env.TURQUILL_DATA,'/old');assert.equal(env.TURQUILL_DM_PORT,'8084','a new setting wins');}
// Every server reads old settings first. Only the launcher (with nothing of the game running) and the hosted runner
// (which starts everything itself) rename files: a server renaming them under services still running from before the
// update would leave those with empty libraries and no spending record (the review of 2026-10-27).
for(const f of ['dm-server.cjs','sync-server.cjs','account-server.cjs','phone-server.cjs','desktop-server.cjs','serve.cjs']){const text=fs.readFileSync(f,'utf8'),at=text.indexOf("require('./name-migration.cjs').legacyEnv();");assert.ok(at>=0&&at<=text.indexOf('require(')&&!text.slice(0,at).includes('process.env'),f+' reads old settings before anything else');}
for(const f of ['dm-server.cjs','sync-server.cjs','account-server.cjs','phone-server.cjs','desktop-server.cjs'])assert.ok(!fs.readFileSync(f,'utf8').includes('migrateDataNames('),f+' never renames files under running services');
{const serve=fs.readFileSync('serve.cjs','utf8');assert.ok(serve.includes("require('./name-migration.cjs').migrateDataNames(dataDir);")&&serve.indexOf("if(!process.env.TURQUILL_DATA)require('./name-migration.cjs').migrateDataNames(__dirname);")<serve.indexOf('async function startHosted'),'serve.cjs renames its folder and a local default one');}
{const launch=fs.readFileSync('launch.ps1','utf8').replace(/\r\n/g,'\n'),at=launch.indexOf("& node (Join-Path $root 'name-migration.cjs') --desktop --quiet"),guard=launch.indexOf('$busy = @(8084, 8086, 8087');
 assert.ok(at>0&&at<launch.indexOf('$keyFile')&&guard>0&&guard<at&&launch.includes("if ($oldNames.Count -and -not $Stop) {")&&launch.includes("if ($cmd -like '*desktop-server.cjs*') { $busy += 8081 }"),'the launcher renames everything before it reads a file, only with nothing of the game running and never on -Stop');
 assert.ok(launch.includes("$logs = Join-Path $root '.questbound-logs'; $pidFile = Join-Path $logs 'pids.json'; $shareFile = Join-Path $root '.questbound-share-session.json'"),'-Stop finds services recorded under the old names');
 assert.ok(!/[^\x00-\x7f]/.test(launch),'launch.ps1 stays pure ASCII');
 assert.ok(fs.readFileSync('restart-game-services.ps1','utf8').includes("The game files still have their old names."),'the restarter refuses to mix old and new names');}
// The ignore files keep the old names too, so nothing of the host's is ever committed or built into an image.
for(const f of ['.gitignore','.dockerignore'])assert.ok(/^\.questbound-\*$/m.test(fs.readFileSync(f,'utf8'))&&/^\.turquill-\*$/m.test(fs.readFileSync(f,'utf8')),f+' ignores both names');
// A key file is adopted under its new name, never made afresh beside the old one (backups and keyed records need it).
{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'turquill-key-'));fs.writeFileSync(path.join(dir,'.questbound-backup-key.dpapi'),'k');
 const src=fs.readFileSync('private-secrets.cjs','utf8');const adopt=new Function('fs','path',src.match(/function adoptOldName\(file\)\{[^\n]*\}/)[0]+';return adoptOldName;')(fs,path);
 adopt(path.join(dir,'.turquill-backup-key.dpapi'));assert.equal(fs.readFileSync(path.join(dir,'.turquill-backup-key.dpapi'),'utf8'),'k');assert.ok(!fs.existsSync(path.join(dir,'.questbound-backup-key.dpapi')));
 assert.ok(/function secretKey\(file\)\{\n adoptOldName\(file\);/.test(src.replace(/\r\n/g,'\n'))&&/function secretKeyAsync\(file\)\{\n adoptOldName\(file\);/.test(src.replace(/\r\n/g,'\n')),'both key readers adopt an old-named key first');fs.rmSync(dir,{recursive:true,force:true});}
// The account service reads the old header names too (a gateway from before the update sends them).
{const acct=fs.readFileSync('account-server.cjs','utf8');for(const h of ['client','secure','local'])assert.ok(acct.includes(`(req.headers['x-turquill-${h}']??req.headers['x-questbound-${h}'])`),'reads X-Questbound-'+h);}

// 3. The launchers: Turquill.cmd is the real one; the old names run it.
assert.ok(fs.readFileSync('Turquill.cmd','utf8').includes('launch.ps1')&&fs.readFileSync('Turquill-Share.cmd','utf8').includes('launch.ps1" -Share'));
assert.ok(fs.readFileSync('Questbound.cmd','utf8').includes('call "%~dp0Turquill.cmd" %*')&&fs.readFileSync('Questbound-Share.cmd','utf8').includes('call "%~dp0Turquill-Share.cmd" %*'));

// 4. Nothing of the old name is left but the stored identifiers (their bytes are hashed or saved) and history.
{const keep=/questbound-(?:art-v1|account-v1|cloud-v1|ban-v1|table-ban-v1|campaign-invite-v2|invite-caller-v1|guest-v1|metrics-v1|mod-v1|people-plan-v2|people-plan-2|people-picks|place-picks|creature-picks|hero-face|creatures-v1|people-library|place-library|creature-library)/g;
 const allowed=new Set(['storageMigration.js','name-migration.cjs','verify-names.cjs','Questbound.cmd','Questbound-Share.cmd','account-server.cjs','phone-server.cjs','public/index.html','verify-theme.cjs','launch.ps1','AGENTS.md','assets/title/ART-NOTES.md','make-emblem.cjs','accounts.cjs','private-secrets.cjs','restart-game-services.ps1','serve.cjs']);
 const files=execSync('git ls-files',{encoding:'utf8'}).split('\n').filter(f=>f&&!f.startsWith('save-fixtures/')&&!f.startsWith('public/fonts/')&&!/\.(png|jpe?g|webp|woff2?|ico|zip)$/i.test(f)&&fs.existsSync(f));
 // Phrases that name the old kind on purpose: the migrations, the wrappers and their comments.
 const meant=/QUESTBOUND_\*|questbound\.\*|\.questbound-\*|Questbound(?:-Share)?\.cmd|questbound_(?:account|phone)|questbound\.theme\.v1|\(Questbound, until 2026-10-27\)/g;
 const stray=files.filter(f=>!allowed.has(f)&&/questbound/i.test(fs.readFileSync(f,'utf8').replace(keep,'').replace(meant,'')));
 assert.deepEqual(stray,[],'files still naming the old game: '+stray.join(', '));}
// The stored identifiers keep their bytes: changing one would orphan accounts, invites and bans or repaint every picture.
{const art=fs.readFileSync('world-art.cjs','utf8'),accounts=fs.readFileSync('accounts.cjs','utf8');
 assert.ok(art.includes("['questbound-art-v1',subject.campaignId,subject.kind,subject.id]"),'the art key is unchanged');
 assert.ok(accounts.includes("update('questbound-account-v1:'+email)"),'account ids are unchanged');
 for(const [f,id] of [['people-library.cjs','questbound-people-library-v1'],['creature-library.cjs','questbound-creature-library-v1'],['place-library.cjs','questbound-place-library-v1'],['world-art.cjs','questbound-creatures-v1']])assert.ok(fs.readFileSync(f,'utf8').includes("'"+id+"'"),f+' keeps '+id);}

// 5. The old sign-in cookie still signs in, and the new one replaces it.
(async()=>{
 const {createSyncServer}=require('./account-server.cjs'),{createOperations}=require('./operations.cjs');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'turquill-cookie-'));const ops=createOperations({dir:root,key:crypto.randomBytes(32)});
 const {server}=createSyncServer({dir:path.join(root,'table'),accountsDir:path.join(root,'accounts'),cloudDir:path.join(root,'cloud'),operations:ops});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const post=async(route,cookie='')=>{const res=await fetch(base+'/'+route,{method:'POST',headers:{Origin:'http://localhost:8081','Content-Type':'application/json',Cookie:cookie},body:'{}'});return {status:res.status,body:await res.json(),cookies:res.headers.getSetCookie()};};
 try{
  const guest=await post('account-guest');assert.equal(guest.status,200,JSON.stringify(guest.body));
  const token=/turquill_account=([a-f0-9]{64})/.exec(guest.cookies.join(';'))?.[1];assert.ok(token,'a guest gets the new cookie: '+guest.cookies);
  const now=await post('account-status','turquill_account='+token),then=await post('account-status','questbound_account='+token);
  assert.equal(now.status,200);assert.equal(then.status,200);assert.deepEqual(then.body.account?.id??then.body.id??null,now.body.account?.id??now.body.id??null,'the old cookie is the same browser');
  assert.ok(now.body.account||now.body.guest||now.body.id,'the new cookie is a session: '+JSON.stringify(now.body));
  // Setting the cookie again (a guest asking again) expires the old name when the browser still had it.
  const again=await post('account-guest','questbound_account='+token);
  if(again.cookies.length)assert.ok(again.cookies.some(c=>c.startsWith('questbound_account=;')&&/Max-Age=0/.test(c))&&again.cookies.some(c=>c.startsWith('turquill_account=')),'the old cookie is expired as the new one is set: '+again.cookies);
 }finally{server.close();fs.rmSync(root,{recursive:true,force:true});}
 console.log('Names: saved keys (local and session, profiles, a full store, refusals) and the boot card\'s theme; data files, logs, folders and Desktop copies (merged, never deleted), old settings and the launcher first; Turquill.cmd with the old names as wrappers; no old name left but the stored identifiers; the old sign-in cookie still signs in.');
})().catch(e=>{console.error(e);process.exitCode=1;});

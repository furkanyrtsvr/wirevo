/** Bounded browser-local recovery. Storage writes are atomic per key; the
 * previous valid workspace is backed up before replacing the current key. */
export class ProjectHistory{
 constructor(storage,{key,validate,now=Date.now,limit=12,maxChars=650000,interval=20000}){Object.assign(this,{storage,key,validate,now,limit,maxChars,interval});this.backupKey=key+'.backup';this.historyKey=key+'.history';}
 parse(text){if(!text)return null;try{return this.validate(JSON.parse(text));}catch{return null;}}
 load(){const current=this.storage.getItem(this.key),project=this.parse(current);if(project)return{project,recovered:false};const backup=this.parse(this.storage.getItem(this.backupKey));return{project:backup,recovered:!!backup,corrupt:!!current};}
 entries(){try{const data=JSON.parse(this.storage.getItem(this.historyKey)||'null');return data?.version===1&&Array.isArray(data.entries)?data.entries.filter(e=>e&&typeof e.text==='string'&&e.text.length<=this.maxChars&&typeof e.name==='string'&&e.name.length<=100&&Number.isFinite(e.at)).slice(0,this.limit):[];}catch{return[];}}
 record(project,reason='Manuel',force=true){const text=JSON.stringify(project);this.validate(JSON.parse(text));const entries=this.entries(),at=this.now();if(entries[0]?.text===text)return false;if(!force&&entries.length&&at-entries[0].at<this.interval)return false;if(text.length>this.maxChars)return false;
  entries.unshift({at,reason,name:project.name,text});entries.splice(this.limit);while(entries.length&&JSON.stringify({version:1,entries}).length>this.maxChars)entries.pop();if(!entries.length)return false;this.storage.setItem(this.historyKey,JSON.stringify({version:1,entries}));return true;
 }
 save(project){const text=JSON.stringify(project);this.validate(JSON.parse(text));const prior=this.parse(this.storage.getItem(this.key));let backup=true,history=true;
  if(prior&&JSON.stringify(prior)!==text){try{this.storage.setItem(this.backupKey,JSON.stringify(prior));}catch{backup=false;}try{this.record(prior,'Otomatik',false);}catch{history=false;}}
  this.storage.setItem(this.key,text);return{backup,history};
 }
 restore(entry){const project=this.parse(entry?.text);if(!project)throw Error('Geçmişteki proje geçersiz.');return project;}
}

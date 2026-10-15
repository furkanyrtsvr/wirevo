/** Parse actual GCC stderr. Compiler/library locations stay visible; only
 * sketch.ino locations are navigable in the current single-file editor. */
export function parseCompilerDiagnostics(log,files=['sketch.ino']){
 const text=(Array.isArray(log)?log.join('\n'):String(log||'')).replace(/\x1b\[[0-9;]*m/g,'');
 const found=[],seen=new Set();
 for(const raw of text.split(/\r?\n/)){
  const line=raw.replace(/^\[[\w-]+\]\s*/,''),match=line.match(/^(.*?):(\d+)(?::(\d+))?:\s*(fatal error|error|warning|note):\s*(.+)$/);
  let item;
  if(match){const file=match[1],row=+match[2],column=+(match[3]||1);if(!Number.isSafeInteger(row)||row<1||!Number.isSafeInteger(column)||column<1)continue;
   item={file,line:row,column,severity:match[4]==='warning'?'warning':match[4]==='note'?'info':'error',message:match[5],navigable:files.includes(file)};
  }else if(/undefined reference to|multiple definition of|fatal error:/.test(line))item={file:'linker',line:null,column:null,severity:'error',message:line,navigable:false};
  if(item){const key=JSON.stringify(item);if(!seen.has(key)){seen.add(key);found.push(item);}if(found.length>=200)break;}
 }return found;
}
export function editorDiagnosticRanges(source,diagnostics,compiler='avr-g++'){
 const lines=source.split('\n'),starts=[0];for(let i=0;i<lines.length-1;i++)starts.push(starts[i]+lines[i].length+1);
 return diagnostics.filter(d=>d.navigable&&d.line<=lines.length&&d.line>0).map(d=>{const text=lines[d.line-1],start=starts[d.line-1],column=Math.max(0,Math.min(text.length,d.column-1)),from=start+column;
  return{from,to:Math.min(start+text.length,from+Math.max(1,text.slice(column).match(/^\w+/)?.[0].length||1)),severity:d.severity,message:d.message,source:compiler};
 });
}

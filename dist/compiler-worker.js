// CircuitForge's own loader. Compiler code and binaries are fetched directly
// from the upstream published npm package; this wrapper contains no vendor code.
self.onmessage=async({data})=>{
  try{
    const base=new URL(data.assetsBase||'https://cdn.jsdelivr.net/npm/@horang-corp/avr-gcc-wasm@0.2.0/');
    let result;
    if(data.files){const {buildProjectFirmware}=await import('./gcc-project.js');result=await buildProjectFirmware(data.files,{assetsBase:String(base),board:data.board,libraries:data.libraries,onProgress:message=>postMessage({progress:message})});}
    else{const {buildProjectFirmware}=await import('./gcc-project.js');result=await buildProjectFirmware([{name:'sketch.ino',content:data.source}],{assetsBase:String(base),board:data.board,onProgress:message=>postMessage({progress:message})});}
    postMessage({ok:true,result});
  }catch(error){postMessage({ok:false,error:{message:error.message,stack:error.stack}});}
};

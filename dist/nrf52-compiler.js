var Re=class n{static read_bytes(e,_){let E=new n;return E.buf=e.getUint32(_,!0),E.buf_len=e.getUint32(_+4,!0),E}static read_bytes_array(e,_,E){let d=[];for(let i=0;i<E;i++)d.push(n.read_bytes(e,_+8*i));return d}},re=class n{static read_bytes(e,_){let E=new n;return E.buf=e.getUint32(_,!0),E.buf_len=e.getUint32(_+4,!0),E}static read_bytes_array(e,_,E){let d=[];for(let i=0;i<E;i++)d.push(n.read_bytes(e,_+8*i));return d}},Xe=0,We=1,xe=2;var we=2,G=3,Ie=4;var oe=class{head_length(){return 24}name_length(){return this.dir_name.byteLength}write_head_bytes(e,_){e.setBigUint64(_,this.d_next,!0),e.setBigUint64(_+8,this.d_ino,!0),e.setUint32(_+16,this.dir_name.length,!0),e.setUint8(_+20,this.d_type)}write_name_bytes(e,_,E){e.set(this.dir_name.slice(0,Math.min(this.dir_name.byteLength,E)),_)}constructor(e,_,E,d){let i=new TextEncoder().encode(E);this.d_next=e,this.d_ino=_,this.d_namlen=i.byteLength,this.d_type=d,this.dir_name=i}};var Ke=1;var ee=class{write_bytes(e,_){e.setUint8(_,this.fs_filetype),e.setUint16(_+2,this.fs_flags,!0),e.setBigUint64(_+8,this.fs_rights_base,!0),e.setBigUint64(_+16,this.fs_rights_inherited,!0)}constructor(e,_){this.fs_rights_base=0n,this.fs_rights_inherited=0n,this.fs_filetype=e,this.fs_flags=_}};var me=1,Pe=2,ve=4,he=8,ne=class{write_bytes(e,_){e.setBigUint64(_,this.dev,!0),e.setBigUint64(_+8,this.ino,!0),e.setUint8(_+16,this.filetype),e.setBigUint64(_+24,this.nlink,!0),e.setBigUint64(_+32,this.size,!0),e.setBigUint64(_+38,this.atim,!0),e.setBigUint64(_+46,this.mtim,!0),e.setBigUint64(_+52,this.ctim,!0)}constructor(e,_,E){this.dev=0n,this.nlink=0n,this.atim=0n,this.mtim=0n,this.ctim=0n,this.ino=e,this.filetype=_,this.size=E}},sn=0;var En=1,ce=class n{static read_bytes(e,_){return new n(e.getBigUint64(_,!0),e.getUint8(_+8),e.getUint32(_+16,!0),e.getBigUint64(_+24,!0),e.getUint16(_+36,!0))}constructor(e,_,E,d,i){this.userdata=e,this.eventtype=_,this.clockid=E,this.timeout=d,this.flags=i}},pe=class{write_bytes(e,_){e.setBigUint64(_,this.userdata,!0),e.setUint16(_+8,this.error,!0),e.setUint8(_+10,this.eventtype)}constructor(e,_,E){this.userdata=e,this.error=_,this.eventtype=E}};var xn=0,Ve=class{write_bytes(e,_){e.setUint32(_,this.pr_name.byteLength,!0)}constructor(e){this.pr_name=new TextEncoder().encode(e)}},be=class n{static dir(e){let _=new n;return _.tag=xn,_.inner=new Ve(e),_}write_bytes(e,_){e.setUint32(_,this.tag,!0),this.inner.write_bytes(e,_+4)}};var mn=class{enable(e){this.log=hn(e===void 0?!0:e,this.prefix)}get enabled(){return this.isEnabled}constructor(e){this.isEnabled=e,this.prefix="wasi:",this.enable(e)}};function hn(n,e){return n?console.log.bind(console,"%c%s","color: #265BA0",e):()=>{}}var b=new mn(!1);var Oe=class extends Error{constructor(e){super("exit with exit code "+e),this.code=e}},ze=class{start(e){this.inst=e;try{return e.exports._start(),0}catch(_){if(_ instanceof Oe)return _.code;throw _}}initialize(e){this.inst=e,e.exports._initialize&&e.exports._initialize()}constructor(e,_,E,d={}){this.args=[],this.env=[],this.fds=[],b.enable(d.debug),this.args=e,this.env=_,this.fds=E;let i=this;this.wasiImport={args_sizes_get(t,s){let T=new DataView(i.inst.exports.memory.buffer);T.setUint32(t,i.args.length,!0);let o=0;for(let I of i.args)o+=I.length+1;return T.setUint32(s,o,!0),b.log(T.getUint32(t,!0),T.getUint32(s,!0)),0},args_get(t,s){let T=new DataView(i.inst.exports.memory.buffer),o=new Uint8Array(i.inst.exports.memory.buffer),I=s;for(let a=0;a<i.args.length;a++){T.setUint32(t,s,!0),t+=4;let R=new TextEncoder().encode(i.args[a]);o.set(R,s),T.setUint8(s+R.length,0),s+=R.length+1}return b.enabled&&b.log(new TextDecoder("utf-8").decode(o.slice(I,s))),0},environ_sizes_get(t,s){let T=new DataView(i.inst.exports.memory.buffer);T.setUint32(t,i.env.length,!0);let o=0;for(let I of i.env)o+=new TextEncoder().encode(I).length+1;return T.setUint32(s,o,!0),b.log(T.getUint32(t,!0),T.getUint32(s,!0)),0},environ_get(t,s){let T=new DataView(i.inst.exports.memory.buffer),o=new Uint8Array(i.inst.exports.memory.buffer),I=s;for(let a=0;a<i.env.length;a++){T.setUint32(t,s,!0),t+=4;let R=new TextEncoder().encode(i.env[a]);o.set(R,s),T.setUint8(s+R.length,0),s+=R.length+1}return b.enabled&&b.log(new TextDecoder("utf-8").decode(o.slice(I,s))),0},clock_res_get(t,s){let T;switch(t){case 1:{T=5000n;break}case 0:{T=1000000n;break}default:return 52}return new DataView(i.inst.exports.memory.buffer).setBigUint64(s,T,!0),0},clock_time_get(t,s,T){let o=new DataView(i.inst.exports.memory.buffer);if(t===0)o.setBigUint64(T,BigInt(new Date().getTime())*1000000n,!0);else if(t==1){let I;try{I=BigInt(Math.round(performance.now()*1e6))}catch{I=0n}o.setBigUint64(T,I,!0)}else o.setBigUint64(T,0n,!0);return 0},fd_advise(t,s,T,o){return i.fds[t]!=null?0:8},fd_allocate(t,s,T){return i.fds[t]!=null?i.fds[t].fd_allocate(s,T):8},fd_close(t){if(i.fds[t]!=null){let s=i.fds[t].fd_close();return i.fds[t]=void 0,s}else return 8},fd_datasync(t){return i.fds[t]!=null?i.fds[t].fd_sync():8},fd_fdstat_get(t,s){if(i.fds[t]!=null){let{ret:T,fdstat:o}=i.fds[t].fd_fdstat_get();return o?.write_bytes(new DataView(i.inst.exports.memory.buffer),s),T}else return 8},fd_fdstat_set_flags(t,s){return i.fds[t]!=null?i.fds[t].fd_fdstat_set_flags(s):8},fd_fdstat_set_rights(t,s,T){return i.fds[t]!=null?i.fds[t].fd_fdstat_set_rights(s,T):8},fd_filestat_get(t,s){if(i.fds[t]!=null){let{ret:T,filestat:o}=i.fds[t].fd_filestat_get();return o?.write_bytes(new DataView(i.inst.exports.memory.buffer),s),T}else return 8},fd_filestat_set_size(t,s){return i.fds[t]!=null?i.fds[t].fd_filestat_set_size(s):8},fd_filestat_set_times(t,s,T,o){return i.fds[t]!=null?i.fds[t].fd_filestat_set_times(s,T,o):8},fd_pread(t,s,T,o,I){let a=new DataView(i.inst.exports.memory.buffer),R=new Uint8Array(i.inst.exports.memory.buffer);if(i.fds[t]!=null){let r=Re.read_bytes_array(a,s,T),N=0;for(let S of r){let{ret:P,data:A}=i.fds[t].fd_pread(S.buf_len,o);if(P!=0)return a.setUint32(I,N,!0),P;if(R.set(A,S.buf),N+=A.length,o+=BigInt(A.length),A.length!=S.buf_len)break}return a.setUint32(I,N,!0),0}else return 8},fd_prestat_get(t,s){let T=new DataView(i.inst.exports.memory.buffer);if(i.fds[t]!=null){let{ret:o,prestat:I}=i.fds[t].fd_prestat_get();return I?.write_bytes(T,s),o}else return 8},fd_prestat_dir_name(t,s,T){if(i.fds[t]!=null){let{ret:o,prestat:I}=i.fds[t].fd_prestat_get();if(I==null)return o;let a=I.inner.pr_name;return new Uint8Array(i.inst.exports.memory.buffer).set(a.slice(0,T),s),a.byteLength>T?37:0}else return 8},fd_pwrite(t,s,T,o,I){let a=new DataView(i.inst.exports.memory.buffer),R=new Uint8Array(i.inst.exports.memory.buffer);if(i.fds[t]!=null){let r=re.read_bytes_array(a,s,T),N=0;for(let S of r){let P=R.slice(S.buf,S.buf+S.buf_len),{ret:A,nwritten:m}=i.fds[t].fd_pwrite(P,o);if(A!=0)return a.setUint32(I,N,!0),A;if(N+=m,o+=BigInt(m),m!=P.byteLength)break}return a.setUint32(I,N,!0),0}else return 8},fd_read(t,s,T,o){let I=new DataView(i.inst.exports.memory.buffer),a=new Uint8Array(i.inst.exports.memory.buffer);if(i.fds[t]!=null){let R=Re.read_bytes_array(I,s,T),r=0;for(let N of R){let{ret:S,data:P}=i.fds[t].fd_read(N.buf_len);if(S!=0)return I.setUint32(o,r,!0),S;if(a.set(P,N.buf),r+=P.length,P.length!=N.buf_len)break}return I.setUint32(o,r,!0),0}else return 8},fd_readdir(t,s,T,o,I){let a=new DataView(i.inst.exports.memory.buffer),R=new Uint8Array(i.inst.exports.memory.buffer);if(i.fds[t]!=null){let r=0;for(;;){let{ret:N,dirent:S}=i.fds[t].fd_readdir_single(o);if(N!=0)return a.setUint32(I,r,!0),N;if(S==null)break;if(T-r<S.head_length()){r=T;break}let P=new ArrayBuffer(S.head_length());if(S.write_head_bytes(new DataView(P),0),R.set(new Uint8Array(P).slice(0,Math.min(P.byteLength,T-r)),s),s+=S.head_length(),r+=S.head_length(),T-r<S.name_length()){r=T;break}S.write_name_bytes(R,s,T-r),s+=S.name_length(),r+=S.name_length(),o=S.d_next}return a.setUint32(I,r,!0),0}else return 8},fd_renumber(t,s){if(i.fds[t]!=null&&i.fds[s]!=null){let T=i.fds[s].fd_close();return T!=0?T:(i.fds[s]=i.fds[t],i.fds[t]=void 0,0)}else return 8},fd_seek(t,s,T,o){let I=new DataView(i.inst.exports.memory.buffer);if(i.fds[t]!=null){let{ret:a,offset:R}=i.fds[t].fd_seek(s,T);return I.setBigInt64(o,R,!0),a}else return 8},fd_sync(t){return i.fds[t]!=null?i.fds[t].fd_sync():8},fd_tell(t,s){let T=new DataView(i.inst.exports.memory.buffer);if(i.fds[t]!=null){let{ret:o,offset:I}=i.fds[t].fd_tell();return T.setBigUint64(s,I,!0),o}else return 8},fd_write(t,s,T,o){let I=new DataView(i.inst.exports.memory.buffer),a=new Uint8Array(i.inst.exports.memory.buffer);if(i.fds[t]!=null){let R=re.read_bytes_array(I,s,T),r=0;for(let N of R){let S=a.slice(N.buf,N.buf+N.buf_len),{ret:P,nwritten:A}=i.fds[t].fd_write(S);if(P!=0)return I.setUint32(o,r,!0),P;if(r+=A,A!=S.byteLength)break}return I.setUint32(o,r,!0),0}else return 8},path_create_directory(t,s,T){let o=new Uint8Array(i.inst.exports.memory.buffer);if(i.fds[t]!=null){let I=new TextDecoder("utf-8").decode(o.slice(s,s+T));return i.fds[t].path_create_directory(I)}else return 8},path_filestat_get(t,s,T,o,I){let a=new DataView(i.inst.exports.memory.buffer),R=new Uint8Array(i.inst.exports.memory.buffer);if(i.fds[t]!=null){let r=new TextDecoder("utf-8").decode(R.slice(T,T+o)),{ret:N,filestat:S}=i.fds[t].path_filestat_get(s,r);return S?.write_bytes(a,I),N}else return 8},path_filestat_set_times(t,s,T,o,I,a,R){let r=new Uint8Array(i.inst.exports.memory.buffer);if(i.fds[t]!=null){let N=new TextDecoder("utf-8").decode(r.slice(T,T+o));return i.fds[t].path_filestat_set_times(s,N,I,a,R)}else return 8},path_link(t,s,T,o,I,a,R){let r=new Uint8Array(i.inst.exports.memory.buffer);if(i.fds[t]!=null&&i.fds[I]!=null){let N=new TextDecoder("utf-8").decode(r.slice(T,T+o)),S=new TextDecoder("utf-8").decode(r.slice(a,a+R)),{ret:P,inode_obj:A}=i.fds[t].path_lookup(N,s);return A==null?P:i.fds[I].path_link(S,A,!1)}else return 8},path_open(t,s,T,o,I,a,R,r,N){let S=new DataView(i.inst.exports.memory.buffer),P=new Uint8Array(i.inst.exports.memory.buffer);if(i.fds[t]!=null){let A=new TextDecoder("utf-8").decode(P.slice(T,T+o));b.log(A);let{ret:m,fd_obj:u}=i.fds[t].path_open(s,A,I,a,R,r);if(m!=0)return m;i.fds.push(u);let f=i.fds.length-1;return S.setUint32(N,f,!0),0}else return 8},path_readlink(t,s,T,o,I,a){let R=new DataView(i.inst.exports.memory.buffer),r=new Uint8Array(i.inst.exports.memory.buffer);if(i.fds[t]!=null){let N=new TextDecoder("utf-8").decode(r.slice(s,s+T));b.log(N);let{ret:S,data:P}=i.fds[t].path_readlink(N);if(P!=null){let A=new TextEncoder().encode(P);if(A.length>I)return R.setUint32(a,0,!0),8;r.set(A,o),R.setUint32(a,A.length,!0)}return S}else return 8},path_remove_directory(t,s,T){let o=new Uint8Array(i.inst.exports.memory.buffer);if(i.fds[t]!=null){let I=new TextDecoder("utf-8").decode(o.slice(s,s+T));return i.fds[t].path_remove_directory(I)}else return 8},path_rename(t,s,T,o,I,a){let R=new Uint8Array(i.inst.exports.memory.buffer);if(i.fds[t]!=null&&i.fds[o]!=null){let r=new TextDecoder("utf-8").decode(R.slice(s,s+T)),N=new TextDecoder("utf-8").decode(R.slice(I,I+a)),{ret:S,inode_obj:P}=i.fds[t].path_unlink(r);if(P==null)return S;if(S=i.fds[o].path_link(N,P,!0),S!=0&&i.fds[t].path_link(r,P,!0)!=0)throw"path_link should always return success when relinking an inode back to the original place";return S}else return 8},path_symlink(t,s,T,o,I){let a=new Uint8Array(i.inst.exports.memory.buffer);if(i.fds[T]!=null){let R=new TextDecoder("utf-8").decode(a.slice(t,t+s)),r=new TextDecoder("utf-8").decode(a.slice(o,o+I));return 58}else return 8},path_unlink_file(t,s,T){let o=new Uint8Array(i.inst.exports.memory.buffer);if(i.fds[t]!=null){let I=new TextDecoder("utf-8").decode(o.slice(s,s+T));return i.fds[t].path_unlink_file(I)}else return 8},poll_oneoff(t,s,T){if(T===0)return 28;if(T>1)return b.log("poll_oneoff: only a single subscription is supported"),58;let o=new DataView(i.inst.exports.memory.buffer),I=ce.read_bytes(o,t),a=I.eventtype,R=I.clockid,r=I.timeout;if(a!==sn)return b.log("poll_oneoff: only clock subscriptions are supported"),58;let N;if(R===1)N=()=>BigInt(Math.round(performance.now()*1e6));else if(R===0)N=()=>BigInt(new Date().getTime())*1000000n;else return 28;let S=(I.flags&En)!==0?r:N()+r;for(;S>N(););return new pe(I.userdata,0,a).write_bytes(o,s),0},proc_exit(t){throw new Oe(t)},proc_raise(t){throw"raised signal "+t},sched_yield(){},random_get(t,s){let T=new Uint8Array(i.inst.exports.memory.buffer).subarray(t,t+s);if("crypto"in globalThis&&(typeof SharedArrayBuffer>"u"||!(i.inst.exports.memory.buffer instanceof SharedArrayBuffer)))for(let o=0;o<s;o+=65536)crypto.getRandomValues(T.subarray(o,o+65536));else for(let o=0;o<s;o++)T[o]=Math.random()*256|0},sock_recv(t,s,T){throw"sockets not supported"},sock_send(t,s,T){throw"sockets not supported"},sock_shutdown(t,s){throw"sockets not supported"},sock_accept(t,s){throw"sockets not supported"}}}};var $=class{fd_allocate(e,_){return 58}fd_close(){return 0}fd_fdstat_get(){return{ret:58,fdstat:null}}fd_fdstat_set_flags(e){return 58}fd_fdstat_set_rights(e,_){return 58}fd_filestat_get(){return{ret:58,filestat:null}}fd_filestat_set_size(e){return 58}fd_filestat_set_times(e,_,E){return 58}fd_pread(e,_){return{ret:58,data:new Uint8Array}}fd_prestat_get(){return{ret:58,prestat:null}}fd_pwrite(e,_){return{ret:58,nwritten:0}}fd_read(e){return{ret:58,data:new Uint8Array}}fd_readdir_single(e){return{ret:58,dirent:null}}fd_seek(e,_){return{ret:58,offset:0n}}fd_sync(){return 0}fd_tell(){return{ret:58,offset:0n}}fd_write(e){return{ret:58,nwritten:0}}path_create_directory(e){return 58}path_filestat_get(e,_){return{ret:58,filestat:null}}path_filestat_set_times(e,_,E,d,i){return 58}path_link(e,_,E){return 58}path_unlink(e){return{ret:58,inode_obj:null}}path_lookup(e,_){return{ret:58,inode_obj:null}}path_open(e,_,E,d,i,t){return{ret:54,fd_obj:null}}path_readlink(e){return{ret:58,data:null}}path_remove_directory(e){return 58}path_rename(e,_,E){return 58}path_unlink_file(e){return 58}},V=class n{static issue_ino(){return n.next_ino++}static root_ino(){return 0n}constructor(){this.ino=n.issue_ino()}};V.next_ino=1n;var ae=class extends ${fd_allocate(e,_){if(!(this.file.size>e+_)){let E=new Uint8Array(Number(e+_));E.set(this.file.data,0),this.file.data=E}return 0}fd_fdstat_get(){return{ret:0,fdstat:new ee(Ie,0)}}fd_filestat_set_size(e){if(this.file.size>e)this.file.data=new Uint8Array(this.file.data.buffer.slice(0,Number(e)));else{let _=new Uint8Array(Number(e));_.set(this.file.data,0),this.file.data=_}return 0}fd_read(e){let _=this.file.data.slice(Number(this.file_pos),Number(this.file_pos+BigInt(e)));return this.file_pos+=BigInt(_.length),{ret:0,data:_}}fd_pread(e,_){return{ret:0,data:this.file.data.slice(Number(_),Number(_+BigInt(e)))}}fd_seek(e,_){let E;switch(_){case Xe:E=e;break;case We:E=this.file_pos+e;break;case xe:E=BigInt(this.file.data.byteLength)+e;break;default:return{ret:28,offset:0n}}return E<0?{ret:28,offset:0n}:(this.file_pos=E,{ret:0,offset:this.file_pos})}fd_tell(){return{ret:0,offset:this.file_pos}}fd_write(e){if(this.file.readonly)return{ret:8,nwritten:0};if(this.file_pos+BigInt(e.byteLength)>this.file.size){let _=this.file.data;this.file.data=new Uint8Array(Number(this.file_pos+BigInt(e.byteLength))),this.file.data.set(_)}return this.file.data.set(e,Number(this.file_pos)),this.file_pos+=BigInt(e.byteLength),{ret:0,nwritten:e.byteLength}}fd_pwrite(e,_){if(this.file.readonly)return{ret:8,nwritten:0};if(_+BigInt(e.byteLength)>this.file.size){let E=this.file.data;this.file.data=new Uint8Array(Number(_+BigInt(e.byteLength))),this.file.data.set(E)}return this.file.data.set(e,Number(_)),{ret:0,nwritten:e.byteLength}}fd_filestat_get(){return{ret:0,filestat:this.file.stat()}}constructor(e){super(),this.file_pos=0n,this.file=e}},le=class extends ${fd_seek(e,_){return{ret:8,offset:0n}}fd_tell(){return{ret:8,offset:0n}}fd_allocate(e,_){return 8}fd_fdstat_get(){return{ret:0,fdstat:new ee(G,0)}}fd_readdir_single(e){if(b.enabled&&(b.log("readdir_single",e),b.log(e,this.dir.contents.keys())),e==0n)return{ret:0,dirent:new oe(1n,this.dir.ino,".",G)};if(e==1n)return{ret:0,dirent:new oe(2n,this.dir.parent_ino(),"..",G)};if(e>=BigInt(this.dir.contents.size)+2n)return{ret:0,dirent:null};let[_,E]=Array.from(this.dir.contents.entries())[Number(e-2n)];return{ret:0,dirent:new oe(e+1n,E.ino,_,E.stat().filetype)}}path_filestat_get(e,_){let{ret:E,path:d}=q.from(_);if(d==null)return{ret:E,filestat:null};let{ret:i,entry:t}=this.dir.get_entry_for_path(d);return t==null?{ret:i,filestat:null}:{ret:0,filestat:t.stat()}}path_lookup(e,_){let{ret:E,path:d}=q.from(e);if(d==null)return{ret:E,inode_obj:null};let{ret:i,entry:t}=this.dir.get_entry_for_path(d);return t==null?{ret:i,inode_obj:null}:{ret:0,inode_obj:t}}path_open(e,_,E,d,i,t){let{ret:s,path:T}=q.from(_);if(T==null)return{ret:s,fd_obj:null};let{ret:o,entry:I}=this.dir.get_entry_for_path(T);if(I==null){if(o!=44)return{ret:o,fd_obj:null};if((E&me)==me){let{ret:a,entry:R}=this.dir.create_entry_for_path(_,(E&Pe)==Pe);if(R==null)return{ret:a,fd_obj:null};I=R}else return{ret:44,fd_obj:null}}else if((E&ve)==ve)return{ret:20,fd_obj:null};return(E&Pe)==Pe&&I.stat().filetype!==G?{ret:54,fd_obj:null}:I.path_open(E,d,t)}path_create_directory(e){return this.path_open(0,e,me|Pe,0n,0n,0).ret}path_link(e,_,E){let{ret:d,path:i}=q.from(e);if(i==null)return d;if(i.is_dir)return 44;let{ret:t,parent_entry:s,filename:T,entry:o}=this.dir.get_parent_dir_and_entry_for_path(i,!0);if(s==null||T==null)return t;if(o!=null){let I=_.stat().filetype==G,a=o.stat().filetype==G;if(I&&a)if(E&&o instanceof w){if(o.contents.size!=0)return 55}else return 20;else{if(I&&!a)return 54;if(!I&&a)return 31;if(!(_.stat().filetype==Ie&&o.stat().filetype==Ie))return 20}}return!E&&_.stat().filetype==G?63:(s.contents.set(T,_),0)}path_unlink(e){let{ret:_,path:E}=q.from(e);if(E==null)return{ret:_,inode_obj:null};let{ret:d,parent_entry:i,filename:t,entry:s}=this.dir.get_parent_dir_and_entry_for_path(E,!0);return i==null||t==null?{ret:d,inode_obj:null}:s==null?{ret:44,inode_obj:null}:(i.contents.delete(t),{ret:0,inode_obj:s})}path_unlink_file(e){let{ret:_,path:E}=q.from(e);if(E==null)return _;let{ret:d,parent_entry:i,filename:t,entry:s}=this.dir.get_parent_dir_and_entry_for_path(E,!1);return i==null||t==null||s==null?d:s.stat().filetype===G?31:(i.contents.delete(t),0)}path_remove_directory(e){let{ret:_,path:E}=q.from(e);if(E==null)return _;let{ret:d,parent_entry:i,filename:t,entry:s}=this.dir.get_parent_dir_and_entry_for_path(E,!1);return i==null||t==null||s==null?d:!(s instanceof w)||s.stat().filetype!==G?54:s.contents.size!==0?55:i.contents.delete(t)?0:44}fd_filestat_get(){return{ret:0,filestat:this.dir.stat()}}fd_filestat_set_size(e){return 8}fd_read(e){return{ret:8,data:new Uint8Array}}fd_pread(e,_){return{ret:8,data:new Uint8Array}}fd_write(e){return{ret:8,nwritten:0}}fd_pwrite(e,_){return{ret:8,nwritten:0}}constructor(e){super(),this.dir=e}},Ce=class extends le{fd_prestat_get(){return{ret:0,prestat:be.dir(this.prestat_name)}}constructor(e,_){super(new w(_)),this.prestat_name=e}},J=class extends V{path_open(e,_,E){if(this.readonly&&(_&BigInt(64))==BigInt(64))return{ret:63,fd_obj:null};if((e&he)==he){if(this.readonly)return{ret:63,fd_obj:null};this.data=new Uint8Array([])}let d=new ae(this);return E&Ke&&d.fd_seek(0n,xe),{ret:0,fd_obj:d}}get size(){return BigInt(this.data.byteLength)}stat(){return new ne(this.ino,Ie,this.size)}constructor(e,_){super(),this.data=new Uint8Array(e),this.readonly=!!_?.readonly}},q=class In{static from(e){let _=new In;if(_.is_dir=e.endsWith("/"),e.startsWith("/"))return{ret:76,path:null};if(e.includes("\0"))return{ret:28,path:null};for(let E of e.split("/"))if(!(E===""||E===".")){if(E===".."){if(_.parts.pop()==null)return{ret:76,path:null};continue}_.parts.push(E)}return{ret:0,path:_}}to_path_string(){let e=this.parts.join("/");return this.is_dir&&(e+="/"),e}constructor(){this.parts=[],this.is_dir=!1}},w=class n extends V{parent_ino(){return this.parent==null?V.root_ino():this.parent.ino}path_open(e,_,E){return{ret:0,fd_obj:new le(this)}}stat(){return new ne(this.ino,G,0n)}get_entry_for_path(e){let _=this;for(let E of e.parts){if(!(_ instanceof n))return{ret:54,entry:null};let d=_.contents.get(E);if(d!==void 0)_=d;else return b.log(E),{ret:44,entry:null}}return e.is_dir&&_.stat().filetype!=G?{ret:54,entry:null}:{ret:0,entry:_}}get_parent_dir_and_entry_for_path(e,_){let E=e.parts.pop();if(E===void 0)return{ret:28,parent_entry:null,filename:null,entry:null};let{ret:d,entry:i}=this.get_entry_for_path(e);if(i==null)return{ret:d,parent_entry:null,filename:null,entry:null};if(!(i instanceof n))return{ret:54,parent_entry:null,filename:null,entry:null};let t=i.contents.get(E);return t===void 0?_?{ret:0,parent_entry:i,filename:E,entry:null}:{ret:44,parent_entry:null,filename:null,entry:null}:e.is_dir&&t.stat().filetype!=G?{ret:54,parent_entry:null,filename:null,entry:null}:{ret:0,parent_entry:i,filename:E,entry:t}}create_entry_for_path(e,_){let{ret:E,path:d}=q.from(e);if(d==null)return{ret:E,entry:null};let{ret:i,parent_entry:t,filename:s,entry:T}=this.get_parent_dir_and_entry_for_path(d,!0);if(t==null||s==null)return{ret:i,entry:null};if(T!=null)return{ret:20,entry:null};b.log("create",d);let o;return _?o=new n(new Map):o=new J(new ArrayBuffer(0)),t.contents.set(s,o),T=o,{ret:0,entry:T}}constructor(e){super(),this.parent=null,e instanceof Array?this.contents=new Map(e):this.contents=e;for(let _ of this.contents.values())_ instanceof n&&(_.parent=this)}},Ae=class n extends ${fd_filestat_get(){return{ret:0,filestat:new ne(this.ino,we,BigInt(0))}}fd_fdstat_get(){let e=new ee(we,0);return e.fs_rights_base=BigInt(64),{ret:0,fdstat:e}}fd_write(e){return this.write(e),{ret:0,nwritten:e.byteLength}}static lineBuffered(e){let _=new TextDecoder("utf-8",{fatal:!1}),E="";return new n(d=>{E+=_.decode(d,{stream:!0});let i=E.split(`
`);for(let[t,s]of i.entries())t<i.length-1?e(s):E=s})}constructor(e){super(),this.ino=V.issue_ino(),this.write=e}};var fe=(n,e)=>`https://docs.espressif.com/projects/esp-dev-kits/en/latest/${n}/${e}/user_guide.html`,je=[];function K(n,e,_,E,d="rows"){let i=d==="xiao"?84:d==="nano"?210:d==="p4"?460:220,t=d==="xiao"?108:d==="nano"?86:d==="p4"?350:460,s=new Map,T=[];for(let[I,a]of[["left",_],["right",E]])for(let[R,r]of a.entries()){let N=String(r),S=N.match(/^(?:GPIO|TX|RX)?(\d+)$/),P=S?"GPIO"+S[1]:N==="G"?"GND":["VBUS"].includes(N)?"5V":N,A=S?P:N==="G"?"GND":N.startsWith("NC")?"NC":N,m=s.get(A)||0;s.set(A,m+1);let u={id:A+(m?"."+m:""),name:e.aliasLabels?.[P]||N,net:P};S?Object.assign(u,{port:"ESP",bit:Number(S[1])}):P==="GND"?u.voltage=0:P==="3V3"||n==="esp32h2"&&P==="VBAT"?u.voltage=3.3:P==="5V"&&(u.voltage=5),(["RST","RESET","LDO_EN","VUSB"].includes(N)||N.startsWith("NC"))&&(u.connectable=!1),d==="nano"?(u.x=12+R*12.6,u.y=I==="left"?7:79):d==="p4"?(u.x=20+R*21,u.y=I==="left"?296:320):d==="xiao"?(u.x=I==="left"?6:78,u.y=17+R*12):(u.x=I==="left"?17:203,u.y=86+R*311/Math.max(_.length-1,E.length-1)),T.push(u)}let o=[...new Set(T.filter(I=>I.port).map(I=>I.bit))].sort((I,a)=>I-a);je.push({id:n,...e,width:i,height:t,layout:d,pins:T,gpio:o,pads:T.length,asset:n+".svg"})}K("esp32h2",{name:"ESP32-H2",board:"DevKitM-1 \xB7 v1.3 N4",arch:"RISC-V \xB7 RV32IMAC",target:"esp32h2",hz:96e6,flash:4*1024*1024,chipId:16,ram:240*1024,mux:1611202560,muxOffset:4,source:fe("esp32h2","esp32-h2-devkitm-1"),examplePins:{6:11,7:10},reserved:"GPIO13/14: 32 kHz kristal; GPIO6/7: mod\xFCl flash"},["3V3","RST",0,1,2,3,"NC13","NC14",4,5,"NC","VBAT","G","5V","G"],["G","TX24","RX23",10,11,25,12,8,22,"G",9,"G",27,26,"G"]);K("esp32c5",{name:"ESP32-C5",board:"DevKitC-1 \xB7 v1.2 N8R8",arch:"RISC-V \xB7 RV32IMAC",target:"esp32c5",hz:24e7,flash:8*1024*1024,chipId:23,ram:304*1024,mux:1611202560,muxOffset:0,imageOffset:8192,source:fe("esp32c5","esp32-c5-devkitc-1"),reserved:"GPIO15: N8R8 PSRAM; dahili PSRAM modeli yok"},["3V3","RST",2,3,0,1,6,7,8,9,10,26,25,"5V","G","NC"],["G","TX11","RX12",24,23,"NC15",27,4,5,"NC",28,"G",14,13,"G","NC"]);K("esp32p4",{name:"ESP32-P4",board:"Function-EV \xB7 v1.5.2 J1",arch:"RISC-V \xB7 RV32IMAF",target:"esp32p4",hz:4e8,flash:16*1024*1024,chipId:18,ram:560*1024,mux:1343098880,muxOffset:4,imageOffset:8192,source:fe("esp32p4","esp32-p4-function-ev-board"),reserved:"J1: GPIO0/1 kristal, GPIO45 SD_PWRn; kamera/LCD/PSRAM/Ethernet model d\u0131\u015F\u0131"},["5V","5V","G","TX37","RX38",22,"G",5,4,"G","NC1",36,32,"NC","G",54,"G",46,27,"NC45"],["3V3",7,8,23,"G",21,20,6,"3V3",3,2,"NC0","G","NC",33,26,48,53,47,"G"],"p4");for(let[n,e,_]of[["esp32c3",[2,3,4,5,6,7,21,20,8,9,10],"https://wiki.seeedstudio.com/XIAO_ESP32C3_Getting_Started/"],["esp32c6",[0,1,2,21,22,23,16,17,19,20,18],"https://wiki.seeedstudio.com/xiao_esp32c6_getting_started/"],["esp32s3",[1,2,3,4,5,6,43,44,7,8,9],"https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/"]]){let E=Object.fromEntries(e.map((i,t)=>["D"+t,i])),d=Object.fromEntries(e.map((i,t)=>["GPIO"+i,"D"+t+" / "+i]));K("xiao-"+n,{name:n==="esp32s3"?"ESP32-S3":n==="esp32c6"?"ESP32-C6":"ESP32-C3",board:"Seeed XIAO",title:"Seeed XIAO "+n.replace("esp32","ESP32-").toUpperCase(),target:n,aliases:E,aliasLabels:d,source:_,flash:n==="esp32s3"?8*1024*1024:4*1024*1024,...n==="esp32c6"?{examplePins:{2:0,3:1,4:22,5:23,6:20,7:2}}:{}},e.slice(0,7),["5V","G","3V3",...e.slice(7).reverse()],"xiao")}var Pn={D0:44,D1:43,D2:5,D3:6,D4:7,D5:8,D6:9,D7:10,D8:17,D9:18,D10:21,D11:38,D12:47,D13:48,A0:1,A1:2,A2:3,A3:4,A4:11,A5:12,A6:13,A7:14,B0:46,B1:0,LED_BUILTIN:48,LEDR:46,LEDG:0,LEDB:45};K("nano-esp32",{name:"ESP32-S3",board:"Arduino Nano ESP32",title:"Arduino Nano ESP32 \xB7 NORA-W106",target:"esp32s3",aliases:Pn,aliasLabels:Object.fromEntries(Object.entries(Pn).filter(([n])=>!n.startsWith("LED")).map(([n,e])=>["GPIO"+e,n+" / "+e])),source:"https://docs.arduino.cc/resources/pinouts/ABX00083-full-pinout.pdf",flash:16*1024*1024,reserved:"VUSB: a\xE7\u0131k lehim k\xF6pr\xFCs\xFC; GPIO45 RGB LED, haric\xEE ba\u015Fl\u0131k yok; native GPIO numaralar\u0131"},[47,38,21,18,17,10,9,8,7,6,5,"G","RESET",44,43],[48,"3V3",46,1,2,3,4,11,12,13,14,"VUSB",0,"G","VIN"],"nano");K("esp32c3-devkitc02",{name:"ESP32-C3",board:"DevKitC-02",target:"esp32c3",source:fe("esp32c3","esp32-c3-devkitc-02")},["G","3V3","3V3","RST","G",4,5,6,7,"G",8,9,"5V","5V","G"],["G",0,1,2,3,"G",10,"G","RX20","TX21","G",18,19,"G","G"]);K("esp32c6-devkitm1",{name:"ESP32-C6",board:"DevKitM-1",target:"esp32c6",flash:4*1024*1024,source:fe("esp32c6","esp32-c6-devkitm-1")},["3V3","RST",2,3,4,5,0,1,8,6,7,14,"G","5V","G"],["G","TX16","RX17",23,22,21,20,19,18,15,9,"G",13,12,"G"]);K("esp32s3-devkitm1",{name:"ESP32-S3",board:"DevKitM-1",target:"esp32s3",source:fe("esp32s3","esp32-s3-devkitm-1")},["3V3",0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,"5V","G"],["G","RST",46,45,"RX44","TX43",42,41,40,39,38,37,36,35,34,33,26,21,20,19,48,47]);K("esp32c3-rust",{name:"ESP32-C3",board:"DevKit-RUST-1",target:"esp32c3",source:"https://github.com/esp-rs/esp-rust-board/blob/master/hardware/esp-rust-board/schematic/esp-rust-board.pdf",reserved:"SHTC3/ICM42670P/WS2812/batarya devresi model d\u0131\u015F\u0131"},["RESET","3V3","NC","G",0,1,2,3,4,5,6,7,8,21,20,9],["VBAT","LDO_EN","VBUS","NC","NC","NC","NC","NC",18,19,8,10]);var an=Object.fromEntries(je.map(n=>[n.id,n.pins]));function fn(n){let e={...n};for(let _ of je){let E=e[_.target]||{};e[_.id]={...E,..._,hz:_.hz||E.hz,chipId:_.chipId??E.chipId,flash:_.flash||E.flash}}return e}var $e=fn({esp32c3:{target:"esp32c3",ram:240*1024,mux:1610649600,muxOffset:4,name:"ESP32-C3",board:"DevKitM-1",arch:"RISC-V \xB7 RV32IMC",hz:16e7,flash:4*1024*1024,chipId:5,asset:"esp32-c3.svg",gpio:[0,1,2,3,4,5,6,7,8,9,10,18,19,20,21],pads:30,source:"https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c3/esp32-c3-devkitm-1/user_guide.html"},esp32c6:{target:"esp32c6",ram:432*1024,mux:1611202560,muxOffset:4,name:"ESP32-C6",board:"DevKitC-1 \xB7 v1.2",arch:"RISC-V \xB7 RV32IMAC",hz:16e7,flash:8*1024*1024,chipId:13,asset:"esp32-c6.svg",gpio:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,15,16,17,18,19,20,21,22,23],pads:32,source:"https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c6/esp32-c6-devkitc-1/user_guide.html"},esp32s3:{target:"esp32s3",ram:400*1024,mux:1610649600,muxOffset:4,name:"ESP32-S3",board:"DevKitC-1 \xB7 v1.0",arch:"Xtensa LX7 \xB7 iki \xE7ekirdek",hz:24e7,flash:8*1024*1024,chipId:9,asset:"esp32-s3.svg",gpio:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,35,36,37,38,39,40,41,42,43,44,45,46,47,48],pads:44,source:"https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide_v1.0.html"}});var qe={"cf_hal.h":`#pragma once
#define CF_INPUT 0
#define CF_OUTPUT 1
#define CF_INPUT_PULLUP 2
int cf_gpio_valid(unsigned);
void cf_gpio_mode(unsigned,int); void cf_gpio_write(unsigned,int); int cf_gpio_read(unsigned);
void cf_delay_ms(unsigned); void cf_delay_us(unsigned); unsigned cf_millis(void);
void cf_uart_begin(unsigned); void cf_uart_write(unsigned char); int cf_uart_read(void);
`,"stdint.h":`#pragma once
typedef unsigned char uint8_t; typedef signed char int8_t; typedef unsigned short uint16_t; typedef short int16_t; typedef unsigned int uint32_t; typedef int int32_t; typedef unsigned long long uint64_t; typedef long long int64_t;
`,"stdbool.h":`#pragma once
#define bool _Bool
#define true 1
#define false 0
`,"stddef.h":`#pragma once
typedef __SIZE_TYPE__ size_t;
#define NULL ((void*)0)
`,"stdio.h":String.raw`#pragma once
#include <cf_hal.h>
typedef __builtin_va_list cf_va_list;
static inline int putchar(int c){cf_uart_write((unsigned char)c);return c;}
static inline int puts(const char *s){while(*s)putchar(*s++);putchar('\r');putchar('\n');return 0;}
static inline void cf_number(unsigned n,unsigned base){char b[32];int i=0;do{unsigned d=n%base;b[i++]=d<10?'0'+d:'A'+d-10;n/=base;}while(n);while(i)putchar(b[--i]);}
static inline int printf(const char *fmt,...){cf_va_list ap;__builtin_va_start(ap,fmt);while(*fmt){if(*fmt!='%'){putchar(*fmt++);continue;}fmt++;switch(*fmt++){case '%':putchar('%');break;case 's':{const char*s=__builtin_va_arg(ap,const char*);if(s)while(*s)putchar(*s++);break;}case 'c':putchar(__builtin_va_arg(ap,int));break;case 'd':{int n=__builtin_va_arg(ap,int);if(n<0){putchar('-');cf_number(0u-(unsigned)n,10);}else cf_number(n,10);break;}case 'u':cf_number(__builtin_va_arg(ap,unsigned),10);break;case 'x':case 'X':cf_number(__builtin_va_arg(ap,unsigned),16);break;default:__builtin_va_end(ap);return -1;}}__builtin_va_end(ap);return 0;}
`};var ie={"nrf52840-supermini":{id:"nrf52840-supermini",architecture:"nrf52",family:"nrf52840",name:"Pro Micro nRF52840 \xB7 SuperMini",mcu:"nRF52840",cpu:"cortex-m4f",hz:64e6,flashSize:1048576,flashLimit:1048576,ram:262144,ioVoltage:3.3,logicHigh:2.31,supplyPin:"3V3",width:92,height:146,asset:"nrf52840-supermini.svg",pins:[{id:"GND",net:"GND",name:"GND",x:17.256,y:18,side:"left",voltage:0},{id:"P0.06",net:"P0.06",name:"P0.06",x:17.256,y:27.6,side:"left",port:"0",bit:6,digital:6},{id:"P0.08",net:"P0.08",name:"P0.08",x:17.256,y:37.2,side:"left",port:"0",bit:8,digital:8},{id:"GND.1",net:"GND",name:"GND.1",x:17.256,y:46.8,side:"left",voltage:0},{id:"GND.2",net:"GND",name:"GND.2",x:17.256,y:56.4,side:"left",voltage:0},{id:"P0.17",net:"P0.17",name:"P0.17",x:17.256,y:66,side:"left",port:"0",bit:17,digital:17},{id:"P0.20",net:"P0.20",name:"P0.20",x:17.256,y:75.6,side:"left",port:"0",bit:20,digital:20},{id:"P0.22",net:"P0.22",name:"P0.22",x:17.256,y:85.2,side:"left",port:"0",bit:22,digital:22},{id:"P0.24",net:"P0.24",name:"P0.24",x:17.256,y:94.8,side:"left",port:"0",bit:24,digital:24},{id:"P1.00",net:"P1.00",name:"P1.00",x:17.256,y:104.39999999999999,side:"left",port:"1",bit:0,digital:32},{id:"P0.11",net:"P0.11",name:"P0.11",x:17.256,y:114,side:"left",port:"0",bit:11,digital:11},{id:"P1.04",net:"P1.04",name:"P1.04",x:17.256,y:123.6,side:"left",port:"1",bit:4,digital:36},{id:"P1.06",net:"P1.06",name:"P1.06",x:17.256,y:133.2,side:"left",port:"1",bit:6,digital:38},{id:"BAT+",net:"BAT+",name:"BAT+",x:74.744,y:18,side:"right"},{id:"RAW",net:"RAW",name:"RAW",x:74.744,y:27.6,side:"right"},{id:"GND.3",net:"GND",name:"GND.3",x:74.744,y:37.2,side:"right",voltage:0},{id:"RESET",net:"RESET",name:"RESET",x:74.744,y:46.8,side:"right"},{id:"3V3",net:"3V3",name:"3V3",x:74.744,y:56.4,side:"right",voltage:3.3},{id:"P0.31",net:"P0.31",name:"P0.31",x:74.744,y:66,side:"right",port:"0",bit:31,digital:31,analog:7},{id:"P0.29",net:"P0.29",name:"P0.29",x:74.744,y:75.6,side:"right",port:"0",bit:29,digital:29,analog:5},{id:"P0.02",net:"P0.02",name:"P0.02",x:74.744,y:85.2,side:"right",port:"0",bit:2,digital:2,analog:0},{id:"P1.15",net:"P1.15",name:"P1.15",x:74.744,y:94.8,side:"right",port:"1",bit:15,digital:47},{id:"P1.13",net:"P1.13",name:"P1.13",x:74.744,y:104.39999999999999,side:"right",port:"1",bit:13,digital:45},{id:"P1.11",net:"P1.11",name:"P1.11",x:74.744,y:114,side:"right",port:"1",bit:11,digital:43},{id:"P0.10",net:"P0.10",name:"P0.10",x:74.744,y:123.6,side:"right",port:"0",bit:10,digital:10},{id:"P0.09",net:"P0.09",name:"P0.09",x:74.744,y:133.2,side:"right",port:"0",bit:9,digital:9},{id:"P0.15",net:"P0.15",name:"P0.15 \xB7 dahili LED",x:33,y:51,port:"0",bit:15,connectable:!1},{id:"P1.07",net:"P1.07",name:"P1.07",x:28.53,y:121.591,side:"bottom",port:"1",bit:7,digital:39},{id:"P1.02",net:"P1.02",name:"P1.02",x:38.13,y:121.591,side:"bottom",port:"1",bit:2,digital:34},{id:"P1.01",net:"P1.01",name:"P1.01",x:47.842,y:121.591,side:"bottom",port:"1",bit:1,digital:33}],gpio:["P0.06","P0.08","P0.17","P0.20","P0.22","P0.24","P1.00","P0.11","P1.04","P1.06","P0.31","P0.29","P0.02","P1.15","P1.13","P1.11","P0.10","P0.09","P0.15","P1.07","P1.02","P1.01"],ledPin:"P0.15",leds:{"P0.15":{x:45.498,y:132.865,color:"#529bff"}},ledChannels:[{pin:"P0.15",color:"blue",activeLow:!1}],txPin:6,rxPin:8,sdaPin:17,sclPin:20,sckPin:45,mosiPin:47,misoPin:43,uart:"UARTE0 / UART0 \xB7 3.3 V",revision:"sasodoma tersine \xE7\u0131kar\u0131lm\u0131\u015F k\u0131rm\u0131z\u0131 SuperMini profili",boardSource:"https://github.com/sasodoma/nrf52840-promicro",source:"https://docs.nordicsemi.com/bundle/ps_nrf52840/page/keyfeatures_html5.html",reserved:"C17 e\u011Fitim modeli: GPIO, timer, ADC, PWM ve s\u0131n\u0131rl\u0131 EasyDMA protokolleri. Sanal USB/BLE klavye C API desteklenir; SoftDevice/ZMK, ger\xE7ek RF/USB, batarya/\u015Farj ve Sense dahili IMU/PDM desteklenmez. T\xFCm klonlarla e\u015Fde\u011Fer de\u011Fildir."},"nice-nano-v2":{id:"nice-nano-v2",architecture:"nrf52",family:"nrf52840",name:"nice!nano v2",mcu:"nRF52840",cpu:"cortex-m4f",hz:64e6,flashSize:1048576,flashLimit:1048576,ram:262144,ioVoltage:3.3,logicHigh:2.31,supplyPin:"3V3",width:92,height:146,asset:"nice-nano-v2.svg",pins:[{id:"GND",net:"GND",name:"GND",x:6,y:18,side:"left",voltage:0},{id:"P0.06",net:"P0.06",name:"P0.06",x:6,y:27.6,side:"left",port:"0",bit:6,digital:6},{id:"P0.08",net:"P0.08",name:"P0.08",x:6,y:37.2,side:"left",port:"0",bit:8,digital:8},{id:"GND.1",net:"GND",name:"GND.1",x:6,y:46.8,side:"left",voltage:0},{id:"GND.2",net:"GND",name:"GND.2",x:6,y:56.4,side:"left",voltage:0},{id:"P0.17",net:"P0.17",name:"P0.17",x:6,y:66,side:"left",port:"0",bit:17,digital:17},{id:"P0.20",net:"P0.20",name:"P0.20",x:6,y:75.6,side:"left",port:"0",bit:20,digital:20},{id:"P0.22",net:"P0.22",name:"P0.22",x:6,y:85.2,side:"left",port:"0",bit:22,digital:22},{id:"P0.24",net:"P0.24",name:"P0.24",x:6,y:94.8,side:"left",port:"0",bit:24,digital:24},{id:"P1.00",net:"P1.00",name:"P1.00",x:6,y:104.39999999999999,side:"left",port:"1",bit:0,digital:32},{id:"P0.11",net:"P0.11",name:"P0.11",x:6,y:114,side:"left",port:"0",bit:11,digital:11},{id:"P1.04",net:"P1.04",name:"P1.04",x:6,y:123.6,side:"left",port:"1",bit:4,digital:36},{id:"P1.06",net:"P1.06",name:"P1.06",x:6,y:133.2,side:"left",port:"1",bit:6,digital:38},{id:"BAT+",net:"BAT+",name:"BAT+",x:86,y:18,side:"right"},{id:"RAW",net:"RAW",name:"BAT+ / RAW",x:86,y:27.6,side:"right"},{id:"GND.3",net:"GND",name:"GND.3",x:86,y:37.2,side:"right",voltage:0},{id:"RESET",net:"RESET",name:"RESET",x:86,y:46.8,side:"right"},{id:"3V3",net:"3V3",name:"3V3",x:86,y:56.4,side:"right",voltage:3.3},{id:"P0.31",net:"P0.31",name:"P0.31",x:86,y:66,side:"right",port:"0",bit:31,digital:31,analog:7},{id:"P0.29",net:"P0.29",name:"P0.29",x:86,y:75.6,side:"right",port:"0",bit:29,digital:29,analog:5},{id:"P0.02",net:"P0.02",name:"P0.02",x:86,y:85.2,side:"right",port:"0",bit:2,digital:2,analog:0},{id:"P1.15",net:"P1.15",name:"P1.15",x:86,y:94.8,side:"right",port:"1",bit:15,digital:47},{id:"P1.13",net:"P1.13",name:"P1.13",x:86,y:104.39999999999999,side:"right",port:"1",bit:13,digital:45},{id:"P1.11",net:"P1.11",name:"P1.11",x:86,y:114,side:"right",port:"1",bit:11,digital:43},{id:"P0.10",net:"P0.10",name:"P0.10",x:86,y:123.6,side:"right",port:"0",bit:10,digital:10},{id:"P0.09",net:"P0.09",name:"P0.09",x:86,y:133.2,side:"right",port:"0",bit:9,digital:9},{id:"P0.15",net:"P0.15",name:"P0.15 \xB7 dahili LED",x:33,y:51,port:"0",bit:15,connectable:!1},{id:"P1.07",net:"P1.07",name:"P1.07",x:30,y:124,side:"bottom",port:"1",bit:7,digital:39},{id:"P1.02",net:"P1.02",name:"P1.02",x:46,y:124,side:"bottom",port:"1",bit:2,digital:34},{id:"P1.01",net:"P1.01",name:"P1.01",x:62,y:124,side:"bottom",port:"1",bit:1,digital:33}],gpio:["P0.06","P0.08","P0.17","P0.20","P0.22","P0.24","P1.00","P0.11","P1.04","P1.06","P0.31","P0.29","P0.02","P1.15","P1.13","P1.11","P0.10","P0.09","P0.15","P1.07","P1.02","P1.01"],ledPin:"P0.15",leds:{"P0.15":{x:46,y:137,color:"#529bff"}},ledChannels:[{pin:"P0.15",color:"blue",activeLow:!1}],txPin:6,rxPin:8,sdaPin:17,sclPin:20,sckPin:45,mosiPin:47,misoPin:43,uart:"UARTE0 / UART0 \xB7 3.3 V",revision:"nice!nano v2 \u015Fema profili",boardSource:"https://nicekeyboards.com/docs/nice-nano/pinout-schematic/",source:"https://docs.nordicsemi.com/bundle/ps_nrf52840/page/keyfeatures_html5.html",reserved:"C17 e\u011Fitim modeli: GPIO, timer, ADC, PWM ve s\u0131n\u0131rl\u0131 EasyDMA protokolleri. Sanal USB/BLE klavye C API desteklenir; SoftDevice/ZMK, ger\xE7ek RF/USB, batarya/\u015Farj ve Sense dahili IMU/PDM desteklenmez. T\xFCm klonlarla e\u015Fde\u011Fer de\u011Fildir."},"xiao-nrf52840":{id:"xiao-nrf52840",architecture:"nrf52",family:"nrf52840",name:"Seeed XIAO nRF52840",mcu:"nRF52840",cpu:"cortex-m4f",hz:64e6,flashSize:1048576,flashLimit:1048576,ram:262144,ioVoltage:3.3,logicHigh:2.31,supplyPin:"3V3",width:68,height:86,asset:"xiao-nrf52840.svg",pins:[{id:"P0.02",net:"P0.02",name:"D0 / P0.02",x:6,y:18,side:"left",port:"0",bit:2,digital:2,analog:0},{id:"P0.03",net:"P0.03",name:"D1 / P0.03",x:6,y:27.6,side:"left",port:"0",bit:3,digital:3,analog:1},{id:"P0.28",net:"P0.28",name:"D2 / P0.28",x:6,y:37.2,side:"left",port:"0",bit:28,digital:28,analog:4},{id:"P0.29",net:"P0.29",name:"D3 / P0.29",x:6,y:46.8,side:"left",port:"0",bit:29,digital:29,analog:5},{id:"P0.04",net:"P0.04",name:"D4 / P0.04",x:6,y:56.4,side:"left",port:"0",bit:4,digital:4,analog:2},{id:"P0.05",net:"P0.05",name:"D5 / P0.05",x:6,y:66,side:"left",port:"0",bit:5,digital:5,analog:3},{id:"P1.11",net:"P1.11",name:"D6 / P1.11",x:6,y:75.6,side:"left",port:"1",bit:11,digital:43},{id:"5V",net:"5V",name:"5V",x:62,y:18,side:"right",voltage:5},{id:"GND",net:"GND",name:"GND",x:62,y:27.6,side:"right",voltage:0},{id:"3V3",net:"3V3",name:"3V3",x:62,y:37.2,side:"right",voltage:3.3},{id:"P1.15",net:"P1.15",name:"D10 / P1.15",x:62,y:46.8,side:"right",port:"1",bit:15,digital:47},{id:"P1.14",net:"P1.14",name:"D9 / P1.14",x:62,y:56.4,side:"right",port:"1",bit:14,digital:46},{id:"P1.13",net:"P1.13",name:"D8 / P1.13",x:62,y:66,side:"right",port:"1",bit:13,digital:45},{id:"P1.12",net:"P1.12",name:"D7 / P1.12",x:62,y:75.6,side:"right",port:"1",bit:12,digital:44},{id:"P0.26",net:"P0.26",name:"P0.26 \xB7 dahili LED",x:33,y:51,port:"0",bit:26,connectable:!1},{id:"P0.30",net:"P0.30",name:"P0.30 \xB7 dahili LED",x:33,y:51,port:"0",bit:30,connectable:!1},{id:"P0.06",net:"P0.06",name:"P0.06 \xB7 dahili LED",x:33,y:51,port:"0",bit:6,connectable:!1}],gpio:["P0.02","P0.03","P0.28","P0.29","P0.04","P0.05","P1.11","P1.15","P1.14","P1.13","P1.12","P0.26","P0.30","P0.06"],ledPin:"P0.26",leds:{"P0.26":{x:54,y:11,color:"#ff3939"},"P0.30":{x:55,y:11,color:"#3be37a"},"P0.06":{x:56,y:11,color:"#529bff"}},ledChannels:[{pin:"P0.26",color:"red",activeLow:!0},{pin:"P0.30",color:"green",activeLow:!0},{pin:"P0.06",color:"blue",activeLow:!0}],txPin:43,rxPin:44,sdaPin:4,sclPin:5,sckPin:45,mosiPin:47,misoPin:46,uart:"UARTE0 / UART0 \xB7 3.3 V",revision:"XIAO v1.1 \u015Fema profili",boardSource:"https://wiki.seeedstudio.com/XIAO_BLE/",source:"https://docs.nordicsemi.com/bundle/ps_nrf52840/page/keyfeatures_html5.html",reserved:"C17 e\u011Fitim modeli: GPIO, timer, ADC, PWM ve s\u0131n\u0131rl\u0131 EasyDMA protokolleri. Sanal USB/BLE klavye C API desteklenir; SoftDevice/ZMK, ger\xE7ek RF/USB, batarya/\u015Farj ve Sense dahili IMU/PDM desteklenmez. T\xFCm klonlarla e\u015Fde\u011Fer de\u011Fildir."},"xiao-nrf52840-sense":{id:"xiao-nrf52840-sense",architecture:"nrf52",family:"nrf52840",name:"Seeed XIAO nRF52840 Sense",mcu:"nRF52840",cpu:"cortex-m4f",hz:64e6,flashSize:1048576,flashLimit:1048576,ram:262144,ioVoltage:3.3,logicHigh:2.31,supplyPin:"3V3",width:68,height:86,asset:"xiao-nrf52840-sense.svg",pins:[{id:"P0.02",net:"P0.02",name:"D0 / P0.02",x:6,y:18,side:"left",port:"0",bit:2,digital:2,analog:0},{id:"P0.03",net:"P0.03",name:"D1 / P0.03",x:6,y:27.6,side:"left",port:"0",bit:3,digital:3,analog:1},{id:"P0.28",net:"P0.28",name:"D2 / P0.28",x:6,y:37.2,side:"left",port:"0",bit:28,digital:28,analog:4},{id:"P0.29",net:"P0.29",name:"D3 / P0.29",x:6,y:46.8,side:"left",port:"0",bit:29,digital:29,analog:5},{id:"P0.04",net:"P0.04",name:"D4 / P0.04",x:6,y:56.4,side:"left",port:"0",bit:4,digital:4,analog:2},{id:"P0.05",net:"P0.05",name:"D5 / P0.05",x:6,y:66,side:"left",port:"0",bit:5,digital:5,analog:3},{id:"P1.11",net:"P1.11",name:"D6 / P1.11",x:6,y:75.6,side:"left",port:"1",bit:11,digital:43},{id:"5V",net:"5V",name:"5V",x:62,y:18,side:"right",voltage:5},{id:"GND",net:"GND",name:"GND",x:62,y:27.6,side:"right",voltage:0},{id:"3V3",net:"3V3",name:"3V3",x:62,y:37.2,side:"right",voltage:3.3},{id:"P1.15",net:"P1.15",name:"D10 / P1.15",x:62,y:46.8,side:"right",port:"1",bit:15,digital:47},{id:"P1.14",net:"P1.14",name:"D9 / P1.14",x:62,y:56.4,side:"right",port:"1",bit:14,digital:46},{id:"P1.13",net:"P1.13",name:"D8 / P1.13",x:62,y:66,side:"right",port:"1",bit:13,digital:45},{id:"P1.12",net:"P1.12",name:"D7 / P1.12",x:62,y:75.6,side:"right",port:"1",bit:12,digital:44},{id:"P0.26",net:"P0.26",name:"P0.26 \xB7 dahili LED",x:33,y:51,port:"0",bit:26,connectable:!1},{id:"P0.30",net:"P0.30",name:"P0.30 \xB7 dahili LED",x:33,y:51,port:"0",bit:30,connectable:!1},{id:"P0.06",net:"P0.06",name:"P0.06 \xB7 dahili LED",x:33,y:51,port:"0",bit:6,connectable:!1}],gpio:["P0.02","P0.03","P0.28","P0.29","P0.04","P0.05","P1.11","P1.15","P1.14","P1.13","P1.12","P0.26","P0.30","P0.06"],ledPin:"P0.26",leds:{"P0.26":{x:54,y:11,color:"#ff3939"},"P0.30":{x:55,y:11,color:"#3be37a"},"P0.06":{x:56,y:11,color:"#529bff"}},ledChannels:[{pin:"P0.26",color:"red",activeLow:!0},{pin:"P0.30",color:"green",activeLow:!0},{pin:"P0.06",color:"blue",activeLow:!0}],txPin:43,rxPin:44,sdaPin:4,sclPin:5,sckPin:45,mosiPin:47,misoPin:46,uart:"UARTE0 / UART0 \xB7 3.3 V",revision:"XIAO v1.1 \u015Fema profili",boardSource:"https://wiki.seeedstudio.com/XIAO_BLE/",source:"https://docs.nordicsemi.com/bundle/ps_nrf52840/page/keyfeatures_html5.html",reserved:"C17 e\u011Fitim modeli: GPIO, timer, ADC, PWM ve s\u0131n\u0131rl\u0131 EasyDMA protokolleri. Sanal USB/BLE klavye C API desteklenir; SoftDevice/ZMK, ger\xE7ek RF/USB, batarya/\u015Farj ve Sense dahili IMU/PDM desteklenmez. T\xFCm klonlarla e\u015Fde\u011Fer de\u011Fildir."}};var kn=[["J1",9.6,["3V3","PB5","PB0","PB1","PE4","PE5","PB4","PA5","PA6","PA7"]],["J3",19.2,["5V","GND","PD0","PD1","PD2","PD3","PE1","PE2","PE3","PF1"]],["J4",172.8,["PF2","PF3","PB3","PC4","PC5","PC6","PC7","PD6","PD7","PF4"]],["J2",182.4,["GND.1","PB2","PE0","PF0","NRST","PB7","PB6","PA4","PA3","PA2"]]],Sn=kn.flatMap(([n,e,_])=>_.map((E,d)=>({id:E,name:n+"."+(d+1)+" \xB7 "+E,header:n,number:d+1,net:E.startsWith("GND")?"GND":E,x:e,y:91.2+d*9.6,side:e<96?"left":"right",.../^P[A-F][0-7]$/.test(E)?{port:E[1],bit:+E[2],digital:(E.charCodeAt(1)-65)*8+ +E[2]}:{voltage:E==="3V3"?3.3:E==="5V"?5:E.startsWith("GND")?0:void 0}}))),Je={id:"ek-tm4c123gxl",architecture:"tiva",family:"tm4c123",name:"Tiva C \xB7 TM4C123G LaunchPad",mcu:"TM4C123GH6PM",revision:"EK-TM4C123GXL \xB7 Rev B",cpu:"cortex-m4f",hz:16e6,maxHz:8e7,hse:16e6,flashSize:262144,flashLimit:262144,ram:32768,ioVoltage:3.3,logicHigh:2.31,supplyPin:"3V3",width:192,height:216,asset:"tiva-tm4c123gxl.svg",pins:Sn,gpio:Sn.filter(n=>n.port).map(n=>n.net),ledPin:"PF1",leds:{power:{x:79,y:37},PF1:{x:94,y:188,color:"#ff3232"},PF2:{x:97,y:188,color:"#329bff"},PF3:{x:100,y:188,color:"#42ff6c"}},uart:"UART0 \xB7 ICDI VCP \xB7 PA0/PA1",internalLinks:[["PB6","PD0"],["PB7","PD1"]],source:"https://www.ti.com/lit/ds/symlink/tm4c123gh6pm.pdf",boardSource:"https://www.ti.com/lit/ug/spmu296/spmu296.pdf",visualReference:"https://robiz.net/ektm4c123gxl",reserved:"Yaln\u0131z C17. PF4=SW1, PF0=SW2 (kilit a\xE7ma gerekir); PF1/PF2/PF3 RGB. PA0/PA1 ICDI UART. R9/R10 varsay\u0131lan PB6\u2013PD0 ve PB7\u2013PD1 ba\u011Flant\u0131lar\u0131 korunur. USB/ICDI donan\u0131m em\xFClasyonu yok."};var yn=["GPIO0","GPIO1","GND","GPIO2","GPIO3","GPIO4","GPIO5","GND.1","GPIO6","GPIO7","GPIO8","GPIO9","GND.2","GPIO10","GPIO11","GPIO12","GPIO13","GND.3","GPIO14","GPIO15"],Bn=["VBUS","VSYS","GND.4","3V3_EN","3V3","ADC_VREF","GPIO28","AGND","GPIO27","GPIO26","RUN","GPIO22","GND.5","GPIO21","GPIO20","GPIO19","GPIO18","GND.6","GPIO17","GPIO16"],Nn=[...yn.map((n,e)=>({id:n,x:6,y:16+e*9.6,side:"left",physical:e+1})),...Bn.map((n,e)=>({id:n,x:79,y:16+e*9.6,side:"right",physical:40-e}))].map(n=>({...n,name:n.id.replace("GPIO","GP").replace(/GND\.\d/,"GND"),net:n.id.startsWith("GND")||n.id==="AGND"?"GND":n.id,...n.id.startsWith("GPIO")?{port:"GPIO",bit:+n.id.slice(4),digital:+n.id.slice(4),...+n.id.slice(4)>=26?{analog:+n.id.slice(4)-26}:{}}:n.id==="3V3"||n.id==="ADC_VREF"?{voltage:3.3}:n.id==="VBUS"||n.id==="VSYS"?{voltage:5}:n.id.startsWith("GND")||n.id==="AGND"?{voltage:0}:{}})),Fn=[["pico","Raspberry Pi Pico",!1,!1,!1],["pico-h","Raspberry Pi Pico H",!1,!0,!1],["pico-w","Raspberry Pi Pico W",!1,!1,!0],["pico-wh","Raspberry Pi Pico WH",!1,!0,!0],["pico-2","Raspberry Pi Pico 2",!0,!1,!1],["pico-2-headers","Raspberry Pi Pico 2 with headers",!0,!0,!1],["pico-2-w","Raspberry Pi Pico 2 W",!0,!1,!0],["pico-2-w-headers","Raspberry Pi Pico 2 W with headers",!0,!0,!0]],Rn=Object.fromEntries(Fn.map(([n,e,_,E,d])=>[n,{id:n,name:e,architecture:"pico",mcu:_?"RP2350":"RP2040",cpu:_?"Cortex-M33":"Cortex-M0+",hz:_?15e7:125e6,ram:(_?520:264)*1024,flashSize:(_?4:2)*1024*1024,flashLimit:(_?4:2)*1024*1024,ioVoltage:3.3,logicHigh:2.31,supplyPin:"3V3",width:85,height:216,pins:Nn,gpio:Nn.filter(i=>i.port).map(i=>i.digital),leds:{},asset:n+".svg",headers:E,wireless:d,uart:"UART0 \xB7 GP0 TX / GP1 RX",source:"https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html"}]));var te=(n,e,_,E,d=n)=>({id:n,name:n,net:d,x:e,y:_,side:E,.../^P[A-D]\d+$/.test(d)?{port:d[1],bit:+d.slice(2),digital:(d.charCodeAt(1)-65)*16+ +d.slice(2)}:{net:d.startsWith("GND")||d==="AGND"?"GND":d,voltage:["3V3","VDD","AVDD","IOREF","VBAT"].includes(d)?3.3:d==="5V"||d==="U5V"?5:d.startsWith("GND")||d==="AGND"?0:void 0}}),rn=(n,e,_)=>n.map((E,d)=>te(E,e,12+d*9.6,_)),Hn=["VBAT","PC13","PC14","PC15","PA0","PA1","PA2","PA3","PA4","PA5","PA6","PA7","PB0","PB1","PB10","PB11","NRST","3V3","GND","GND.1"],Vn=["PB12","PB13","PB14","PB15","PA8","PA9","PA10","PA11","PA12","PA15","PB3","PB4","PB5","PB6","PB7","PB8","PB9","5V","GND.2","3V3.1"],Xn=["PC10","PC11","PC12","PD2","VDD","E5V","BOOT0","GND","NC","NC","NC","IOREF","PA13","NRST","PA14","3V3","PA15","5V","GND","GND","PB7","GND","PC13","VIN","PC14","NC","PC15","PA0","PD0","PA1","PD1","PA4","VBAT","PB0","PC2","PC1","PC3","PC0"],Wn=["PC9","PC8","PB8","PC6","PB9","PC5","AVDD","U5V","GND","NC","PA5","PA12","PA6","PA11","PA7","PB12","PB6","PB11","PC7","GND","PA9","PB2","PA8","PB1","PB10","PB15","PB4","PB14","PB5","PB13","PB3","AGND","PA10","PC4","PA2","NC","PA3","NC"],wn=["PA3","PA2","PA10","PB3","PB5","PB4","PB10","PA8","PA9","PC7","PB6","PA7","PA6","PA5","PB9","PB8"],Kn=["PA0","PA1","PA4","PB0","PC1","PC0"],Ln=(n,e,_)=>n.map((E,d)=>({...te(e+"-"+(d+1),_+d%2*9.6,125+Math.floor(d/2)*9.6,_<100?"left":"right",E),name:e+"-"+(d+1)+" \xB7 "+E,...["NC","PA2","PA3","PA13","PA14","PB3","PC14","PC15","PD0","PD1"].includes(E)?{connectable:!1,port:void 0}:{}})),vn=[...Ln(Xn,"CN7",14),...Ln(Wn,"CN10",224),...wn.map((n,e)=>({...te("D"+e,186,125+(15-e)*9.6,"right",n),name:"D"+e+" \xB7 "+n,...e<2||e===3?{connectable:!1,port:void 0}:{}})),...Kn.map((n,e)=>({...te("A"+e,63,245+e*9.6,"left",n),name:"A"+e+" \xB7 "+n})),...["IOREF","NRST","3V3","5V","GND","GND.1","VIN"].map((n,e)=>te(n,63,125+e*9.6,"left"))],ye={architecture:"stm32",family:"f103",terminalNumber:1,hse:8e6,hz:72e6,cpu:"cortex-m3",ioVoltage:3.3,logicHigh:2.31,supplyPin:"3V3",flashLimit:null,revision:"Blue Pill \xB7 yayg\u0131n iki s\u0131ra 20 pin; \xFC\xE7\xFCnc\xFC taraf PCB",ledPin:"PC13",ledActiveLow:!0,uart:"USART1 \xB7 PA9/PA10",asset:"stm32-blue-pill.svg",width:86.4,height:211.2,pins:[...rn(Hn,4.8,"left"),...rn(Vn,81.6,"right")].map(n=>["PC14","PC15","PA15","PB3","PB4"].includes(n.net)?{...n,connectable:!1,port:void 0,name:n.name+" \xB7 kristal/debug"}:{...n,net:n.id==="3V3.1"?"3V3":n.net}),source:"https://www.st.com/resource/en/datasheet/stm32f103c8.pdf",reserved:"PC14/PC15 kristal; PA15/PB3/PB4 debug i\xE7in ayr\u0131lm\u0131\u015Ft\u0131r. PC13 LED aktif LOW; USB FS device/sanal host ve CAN loopback C17/C++17 modunda. SWD sim\xFClasyonu yok."},Se={stm32f103c6:{...ye,id:"stm32f103c6",name:"Blue Pill \xB7 STM32F103C6T6",mcu:"STM32F103C6T6",flashSize:32768,ram:10240,source:"https://www.st.com/resource/en/datasheet/stm32f103c6.pdf"},stm32f103c8:{...ye,id:"stm32f103c8",name:"Blue Pill \xB7 STM32F103C8T6",mcu:"STM32F103C8T6",flashSize:65536,ram:20480},stm32f103cb:{...ye,id:"stm32f103cb",name:"Blue Pill \xB7 STM32F103CBT6",mcu:"STM32F103CBT6",flashSize:131072,ram:20480},"nucleo-f103rb":{...ye,id:"nucleo-f103rb",name:"NUCLEO-F103RB \xB7 MB1136 C04",mcu:"STM32F103RBT6",flashSize:131072,ram:20480,revision:"ST MB1136 C04 \xB7 varsay\u0131lan solder bridge",asset:"stm32-nucleo-f103rb.svg",width:249.6,height:364.8,pins:vn,ledPin:"PA5",ledActiveLow:!1,userButton:"PC13",userButtonPullup:1e4,userButtonOhms:10,userButtonName:"B1",terminalNumber:2,uart:"USART2 \xB7 ST-LINK VCP",reserved:"SB62/63 OFF: D0/D1 ve PA2/PA3 header kopuk. SWD/SWO ve kristal pinleri ayr\u0131lm\u0131\u015F. B1 aktif LOW. ST-LINK USB sim\xFCle edilmez.",source:"https://www.st.com/resource/en/user_manual/um1724-stm32-nucleo64-boards-mb1136-stmicroelectronics.pdf"}};for(let[n,e,_,E]of[["nucleo-f401re","STM32F401RET6",84e6,98304],["nucleo-f411re","STM32F411RET6",96e6,131072]]){let d=Se["nucleo-f103rb"];Se[n]={...d,id:n,name:"NUCLEO-"+e.slice(5,11)+" \xB7 MB1136 C04",mcu:e,hz:_,ram:E,cpu:"cortex-m4f",family:n.includes("f411")?"f411":"f401",flashSize:524288,asset:"stm32-"+n+".svg",pins:d.pins.map(i=>i.id==="CN10-18"?{...i,name:"CN10-18 \xB7 NC",net:"NC",port:void 0,connectable:!1}:i.id==="CN7-29"||i.id==="CN7-31"?{...i,name:i.id+" \xB7 "+(i.id==="CN7-29"?"PH0":"PH1"),net:i.id==="CN7-29"?"PH0":"PH1",port:void 0,connectable:!1}:i),source:"https://www.st.com/resource/en/datasheet/"+n.replace("nucleo-","stm32")+".pdf"}}var Yn=["PB12","PB13","PB14","PB15","PA8","PA9","PA10","PA11","PA12","PA15","PB3","PB4","PB5","PB6","PB7","PB8","PB9","5V","GND","3V3"],Qn=["5V.1","GND.1","3V3.1","PB10","PB2","PB1","PB0","PA7","PA6","PA5","PA4","PA3","PA2","PA1","PA0","NRST","PC15","PC14","PC13","VBAT"],zn=[...Yn.map((n,e)=>te(n,10.47,7.8+e*9.6,"left")),...Qn.map((n,e)=>te(n,68.07,7.8+e*9.6,"right",n.replace(/\.1$/,"")))].map(n=>["PA11","PA12","PC14","PC15"].includes(n.net)?{...n,connectable:!1,port:void 0,name:n.name+" \xB7 USB/LSE"}:n);for(let[n,e,_,E,d,i]of[["weact-f401cc","STM32F401CCU6","f401",84e6,262144,65536],["weact-f401ce","STM32F401CEU6","f401",84e6,524288,98304],["weact-f411ce","STM32F411CEU6","f411",96e6,524288,131072]])Se[n]={architecture:"stm32",id:n,name:"WeAct Black Pill \xB7 "+e,family:_,cpu:"cortex-m4f",mcu:e,hz:E,hse:25e6,flashSize:d,ram:i,ioVoltage:3.3,logicHigh:2.31,supplyPin:"3V3",revision:_==="f401"&&d===262144?"WeAct F401CC SKU \xB7 V3 header uyumlu topoloji":"WeAct MiniSTM32F4x1 \xB7 V3.0",width:78.54,height:198,pins:zn.map(t=>({...t})),ledPin:"PC13",ledActiveLow:!0,ledColor:"blue",userButton:"PA0",userButtonName:"KEY / PA0",userButtonPullup:!1,userButtonOhms:330,fixedPulls:[{pin:"PB2",voltage:0,ohms:1e4}],terminalNumber:1,uart:"USART1 \xB7 PA9/PA10",asset:"stm32-"+n+".svg",source:"https://www.st.com/resource/en/datasheet/"+e.slice(0,11).toLowerCase()+".pdf",boardSource:"https://github.com/WeActStudio/WeActStudio.MiniSTM32F4x1/blob/master/Hardware/legacy%20version/MiniF4x1Cx_V30%20SchDoc.pdf",reserved:"25 MHz HSE; PC14/15 LSE, PA11/12 USB i\xE7in ayr\u0131lm\u0131\u015F. SWD PA13/14 ayr\u0131 konekt\xF6r; PA15/PB3/PB4 GPIO ile SWD-only profilde kullan\u0131labilir. KEY PA0 aktif LOW, haric\xEE pull-up yok. PC13 LED aktif LOW; USB sanal host ile OTG FS device; fiziksel PHY/BOOT-ROM/SWD em\xFClasyonu yok."};for(let n of Object.values(Se))n.flashLimit=n.flashSize,n.gpio=[...new Set(n.pins.filter(e=>e.port&&e.connectable!==!1).map(e=>e.net))],n.leds={power:{x:n.id.startsWith("nucleo")?156:48,y:n.id.startsWith("nucleo")?278:178},[n.ledPin]:{x:n.id.startsWith("nucleo")?164:40,y:n.id.startsWith("nucleo")?278:178}};var On={...an,esp32c3:[{id:"GND",name:"GND",x:17,y:86,net:"GND",voltage:0},{id:"3V3",name:"3V3",x:17,y:108.21,net:"3V3",voltage:3.3},{id:"3V3.1",name:"3V3",x:17,y:130.43,net:"3V3",voltage:3.3},{id:"GPIO2",name:"IO2",x:17,y:152.64,net:"GPIO2",port:"ESP",bit:2},{id:"GPIO3",name:"IO3",x:17,y:174.86,net:"GPIO3",port:"ESP",bit:3},{id:"GND.1",name:"GND",x:17,y:197.07,net:"GND",voltage:0},{id:"RST",name:"RST",x:17,y:219.29,net:"RST",connectable:!1},{id:"GND.2",name:"GND",x:17,y:241.5,net:"GND",voltage:0},{id:"GPIO0",name:"IO0",x:17,y:263.71,net:"GPIO0",port:"ESP",bit:0},{id:"GPIO1",name:"IO1",x:17,y:285.93,net:"GPIO1",port:"ESP",bit:1},{id:"GPIO10",name:"IO10",x:17,y:308.14,net:"GPIO10",port:"ESP",bit:10},{id:"GND.3",name:"GND",x:17,y:330.36,net:"GND",voltage:0},{id:"5V",name:"5V",x:17,y:352.57,net:"5V",voltage:5},{id:"5V.1",name:"5V",x:17,y:374.79,net:"5V",voltage:5},{id:"GND.4",name:"GND",x:17,y:397,net:"GND",voltage:0},{id:"GND.5",name:"GND",x:203,y:86,net:"GND",voltage:0},{id:"GPIO21",name:"TX",x:203,y:108.21,net:"GPIO21",port:"ESP",bit:21},{id:"GPIO20",name:"RX",x:203,y:130.43,net:"GPIO20",port:"ESP",bit:20},{id:"GND.6",name:"GND",x:203,y:152.64,net:"GND",voltage:0},{id:"GPIO9",name:"IO9",x:203,y:174.86,net:"GPIO9",port:"ESP",bit:9},{id:"GPIO8",name:"IO8",x:203,y:197.07,net:"GPIO8",port:"ESP",bit:8},{id:"GND.7",name:"GND",x:203,y:219.29,net:"GND",voltage:0},{id:"GPIO7",name:"IO7",x:203,y:241.5,net:"GPIO7",port:"ESP",bit:7},{id:"GPIO6",name:"IO6",x:203,y:263.71,net:"GPIO6",port:"ESP",bit:6},{id:"GPIO5",name:"IO5",x:203,y:285.93,net:"GPIO5",port:"ESP",bit:5},{id:"GPIO4",name:"IO4",x:203,y:308.14,net:"GPIO4",port:"ESP",bit:4},{id:"GND.8",name:"GND",x:203,y:330.36,net:"GND",voltage:0},{id:"GPIO18",name:"IO18",x:203,y:352.57,net:"GPIO18",port:"ESP",bit:18},{id:"GPIO19",name:"IO19",x:203,y:374.79,net:"GPIO19",port:"ESP",bit:19},{id:"GND.9",name:"GND",x:203,y:397,net:"GND",voltage:0}],esp32c6:[{id:"3V3",name:"3V3",x:17,y:86,net:"3V3",voltage:3.3},{id:"RST",name:"RST",x:17,y:106.73,net:"RST",connectable:!1},{id:"GPIO4",name:"4",x:17,y:127.47,net:"GPIO4",port:"ESP",bit:4},{id:"GPIO5",name:"5",x:17,y:148.2,net:"GPIO5",port:"ESP",bit:5},{id:"GPIO6",name:"6",x:17,y:168.93,net:"GPIO6",port:"ESP",bit:6},{id:"GPIO7",name:"7",x:17,y:189.67,net:"GPIO7",port:"ESP",bit:7},{id:"GPIO0",name:"0",x:17,y:210.4,net:"GPIO0",port:"ESP",bit:0},{id:"GPIO1",name:"1",x:17,y:231.13,net:"GPIO1",port:"ESP",bit:1},{id:"GPIO8",name:"8",x:17,y:251.87,net:"GPIO8",port:"ESP",bit:8},{id:"GPIO10",name:"10",x:17,y:272.6,net:"GPIO10",port:"ESP",bit:10},{id:"GPIO11",name:"11",x:17,y:293.33,net:"GPIO11",port:"ESP",bit:11},{id:"GPIO2",name:"2",x:17,y:314.07,net:"GPIO2",port:"ESP",bit:2},{id:"GPIO3",name:"3",x:17,y:334.8,net:"GPIO3",port:"ESP",bit:3},{id:"5V",name:"5V",x:17,y:355.53,net:"5V",voltage:5},{id:"GND",name:"G",x:17,y:376.27,net:"GND",voltage:0},{id:"NC",name:"NC",x:17,y:397,net:"NC",connectable:!1},{id:"GND.1",name:"G",x:203,y:86,net:"GND",voltage:0},{id:"GPIO16",name:"TX",x:203,y:106.73,net:"GPIO16",port:"ESP",bit:16},{id:"GPIO17",name:"RX",x:203,y:127.47,net:"GPIO17",port:"ESP",bit:17},{id:"GPIO15",name:"15",x:203,y:148.2,net:"GPIO15",port:"ESP",bit:15},{id:"GPIO23",name:"23",x:203,y:168.93,net:"GPIO23",port:"ESP",bit:23},{id:"GPIO22",name:"22",x:203,y:189.67,net:"GPIO22",port:"ESP",bit:22},{id:"GPIO21",name:"21",x:203,y:210.4,net:"GPIO21",port:"ESP",bit:21},{id:"GPIO20",name:"20",x:203,y:231.13,net:"GPIO20",port:"ESP",bit:20},{id:"GPIO19",name:"19",x:203,y:251.87,net:"GPIO19",port:"ESP",bit:19},{id:"GPIO18",name:"18",x:203,y:272.6,net:"GPIO18",port:"ESP",bit:18},{id:"GPIO9",name:"9",x:203,y:293.33,net:"GPIO9",port:"ESP",bit:9},{id:"GND.2",name:"G",x:203,y:314.07,net:"GND",voltage:0},{id:"GPIO13",name:"13",x:203,y:334.8,net:"GPIO13",port:"ESP",bit:13},{id:"GPIO12",name:"12",x:203,y:355.53,net:"GPIO12",port:"ESP",bit:12},{id:"GND.3",name:"G",x:203,y:376.27,net:"GND",voltage:0},{id:"NC.1",name:"NC",x:203,y:397,net:"NC",connectable:!1}],esp32s3:[{id:"3V3",name:"3V3",x:17,y:86,net:"3V3",voltage:3.3},{id:"3V3.1",name:"3V3",x:17,y:100.81,net:"3V3",voltage:3.3},{id:"RST",name:"RST",x:17,y:115.62,net:"RST",connectable:!1},{id:"GPIO4",name:"4",x:17,y:130.43,net:"GPIO4",port:"ESP",bit:4},{id:"GPIO5",name:"5",x:17,y:145.24,net:"GPIO5",port:"ESP",bit:5},{id:"GPIO6",name:"6",x:17,y:160.05,net:"GPIO6",port:"ESP",bit:6},{id:"GPIO7",name:"7",x:17,y:174.86,net:"GPIO7",port:"ESP",bit:7},{id:"GPIO15",name:"15",x:17,y:189.67,net:"GPIO15",port:"ESP",bit:15},{id:"GPIO16",name:"16",x:17,y:204.48,net:"GPIO16",port:"ESP",bit:16},{id:"GPIO17",name:"17",x:17,y:219.29,net:"GPIO17",port:"ESP",bit:17},{id:"GPIO18",name:"18",x:17,y:234.1,net:"GPIO18",port:"ESP",bit:18},{id:"GPIO8",name:"8",x:17,y:248.9,net:"GPIO8",port:"ESP",bit:8},{id:"GPIO3",name:"3",x:17,y:263.71,net:"GPIO3",port:"ESP",bit:3},{id:"GPIO46",name:"46",x:17,y:278.52,net:"GPIO46",port:"ESP",bit:46},{id:"GPIO9",name:"9",x:17,y:293.33,net:"GPIO9",port:"ESP",bit:9},{id:"GPIO10",name:"10",x:17,y:308.14,net:"GPIO10",port:"ESP",bit:10},{id:"GPIO11",name:"11",x:17,y:322.95,net:"GPIO11",port:"ESP",bit:11},{id:"GPIO12",name:"12",x:17,y:337.76,net:"GPIO12",port:"ESP",bit:12},{id:"GPIO13",name:"13",x:17,y:352.57,net:"GPIO13",port:"ESP",bit:13},{id:"GPIO14",name:"14",x:17,y:367.38,net:"GPIO14",port:"ESP",bit:14},{id:"5V",name:"5V",x:17,y:382.19,net:"5V",voltage:5},{id:"GND",name:"G",x:17,y:397,net:"GND",voltage:0},{id:"GND.1",name:"G",x:203,y:86,net:"GND",voltage:0},{id:"GPIO43",name:"TX",x:203,y:100.81,net:"GPIO43",port:"ESP",bit:43},{id:"GPIO44",name:"RX",x:203,y:115.62,net:"GPIO44",port:"ESP",bit:44},{id:"GPIO1",name:"1",x:203,y:130.43,net:"GPIO1",port:"ESP",bit:1},{id:"GPIO2",name:"2",x:203,y:145.24,net:"GPIO2",port:"ESP",bit:2},{id:"GPIO42",name:"42",x:203,y:160.05,net:"GPIO42",port:"ESP",bit:42},{id:"GPIO41",name:"41",x:203,y:174.86,net:"GPIO41",port:"ESP",bit:41},{id:"GPIO40",name:"40",x:203,y:189.67,net:"GPIO40",port:"ESP",bit:40},{id:"GPIO39",name:"39",x:203,y:204.48,net:"GPIO39",port:"ESP",bit:39},{id:"GPIO38",name:"38",x:203,y:219.29,net:"GPIO38",port:"ESP",bit:38},{id:"GPIO37",name:"37",x:203,y:234.1,net:"GPIO37",port:"ESP",bit:37},{id:"GPIO36",name:"36",x:203,y:248.9,net:"GPIO36",port:"ESP",bit:36},{id:"GPIO35",name:"35",x:203,y:263.71,net:"GPIO35",port:"ESP",bit:35},{id:"GPIO0",name:"0",x:203,y:278.52,net:"GPIO0",port:"ESP",bit:0},{id:"GPIO45",name:"45",x:203,y:293.33,net:"GPIO45",port:"ESP",bit:45},{id:"GPIO48",name:"48",x:203,y:308.14,net:"GPIO48",port:"ESP",bit:48},{id:"GPIO47",name:"47",x:203,y:322.95,net:"GPIO47",port:"ESP",bit:47},{id:"GPIO21",name:"21",x:203,y:337.76,net:"GPIO21",port:"ESP",bit:21},{id:"GPIO20",name:"20",x:203,y:352.57,net:"GPIO20",port:"ESP",bit:20},{id:"GPIO19",name:"19",x:203,y:367.38,net:"GPIO19",port:"ESP",bit:19},{id:"GND.2",name:"G",x:203,y:382.19,net:"GND",voltage:0},{id:"GND.3",name:"G",x:203,y:397,net:"GND",voltage:0}]};var ln=[{id:"GND",name:"GND",net:"GND",x:4.8,y:81.6,side:"left"},{id:"GND.1",name:"GND.1",net:"GND",x:62.4,y:100.8,side:"right"},{id:"GND.2",name:"GND.2",net:"GND",x:19.2,y:120,side:"bottom"},{id:"GND.3",name:"GND.3",net:"GND",x:9.6,y:120,side:"bottom"},{id:"RESET",name:"RESET",net:"RESET",x:4.8,y:91.2,side:"left"},{id:"RESET.1",name:"RESET.1",net:"RESET",x:62.4,y:91.2,side:"right"},{id:"D13",name:"D13",net:"D13",x:62.4,y:33.6,side:"right"},{id:"D12",name:"D12",net:"D12",x:62.4,y:24,side:"right"},{id:"D11",name:"D11",net:"D11",x:62.4,y:14.4,side:"right"},{id:"D1",name:"D1",net:"D1",x:4.8,y:110.4,side:"left"},{id:"D1.1",name:"D1.1",net:"D1",x:48,y:120,side:"bottom"},{id:"VCC",name:"VCC",net:"VCC",x:62.4,y:81.6,side:"right"},{id:"VCC.1",name:"VCC.1",net:"VCC",x:28.8,y:120,side:"bottom"},{id:"RAW",name:"RAW",net:"RAW",x:62.4,y:110.4,side:"right"},{id:"D9",name:"D9",net:"D9",x:4.8,y:4.8,side:"left"},{id:"D8",name:"D8",net:"D8",x:4.8,y:14.4,side:"left"},{id:"A5",name:"A5",net:"A5",x:51.36,y:77.28,side:"inner"},{id:"A4",name:"A4",net:"A4",x:51.36,y:67.68,side:"inner"},{id:"A3",name:"A3",net:"A3",x:62.4,y:72,side:"right"},{id:"A2",name:"A2",net:"A2",x:62.4,y:62.4,side:"right"},{id:"A1",name:"A1",net:"A1",x:62.4,y:52.8,side:"right"},{id:"A0",name:"A0",net:"A0",x:62.4,y:43.2,side:"right"},{id:"D2",name:"D2",net:"D2",x:4.8,y:72,side:"left"},{id:"D3",name:"D3",net:"D3",x:4.8,y:62.4,side:"left"},{id:"D4",name:"D4",net:"D4",x:4.8,y:52.8,side:"left"},{id:"D5",name:"D5",net:"D5",x:4.8,y:43.2,side:"left"},{id:"D6",name:"D6",net:"D6",x:4.8,y:33.6,side:"left"},{id:"D7",name:"D7",net:"D7",x:4.8,y:24,side:"left"},{id:"D10",name:"D10",net:"D10",x:62.4,y:4.8,side:"right"},{id:"DTR",name:"DTR",net:"DTR",x:57.6,y:120,side:"bottom"},{id:"D0",name:"D0",net:"D0",x:38.4,y:120,side:"bottom"},{id:"D0.1",name:"D0.1",net:"D0",x:4.8,y:100.8,side:"left"},{id:"A6",name:"A6",net:"A6",x:51.36,y:28.32,side:"inner"},{id:"A7",name:"A7",net:"A7",x:51.36,y:37.92,side:"inner"}];var Ue={id:"uno",name:"Arduino Uno R3",width:274.31811,height:201.6,asset:"arduino-uno-r3.svg",pins:[{id:"SCL",name:"SCL",x:86.766614,y:9.626457,side:"top",net:"A5",analog:5,digital:19,port:"C",bit:5},{id:"SDA",name:"SDA",x:96.366614,y:9.626457,side:"top",net:"A4",analog:4,digital:18,port:"C",bit:4},{id:"AREF",name:"AREF",x:105.966614,y:9.626457,side:"top",net:"AREF"},{id:"GND",name:"GND",x:115.566614,y:9.626457,side:"top",net:"GND",voltage:0},{id:"D13",name:"D13",x:125.166614,y:9.626457,side:"top",net:"D13",digital:13,pwm:!1,port:"B",bit:5},{id:"D12",name:"D12",x:134.766614,y:9.626457,side:"top",net:"D12",digital:12,pwm:!1,port:"B",bit:4},{id:"D11",name:"D11",x:144.366614,y:9.626457,side:"top",net:"D11",digital:11,pwm:!0,port:"B",bit:3},{id:"D10",name:"D10",x:153.966614,y:9.626457,side:"top",net:"D10",digital:10,pwm:!0,port:"B",bit:2},{id:"D9",name:"D9",x:163.566614,y:9.626457,side:"top",net:"D9",digital:9,pwm:!0,port:"B",bit:1},{id:"D8",name:"D8",x:173.166614,y:9.626457,side:"top",net:"D8",digital:8,pwm:!1,port:"B",bit:0},{id:"D7",name:"D7",x:188.526614,y:9.626457,side:"top",net:"D7",digital:7,pwm:!1,port:"D",bit:7},{id:"D6",name:"D6",x:198.126614,y:9.626457,side:"top",net:"D6",digital:6,pwm:!0,port:"D",bit:6},{id:"D5",name:"D5",x:207.726614,y:9.626457,side:"top",net:"D5",digital:5,pwm:!0,port:"D",bit:5},{id:"D4",name:"D4",x:217.326614,y:9.626457,side:"top",net:"D4",digital:4,pwm:!1,port:"D",bit:4},{id:"D3",name:"D3",x:226.926614,y:9.626457,side:"top",net:"D3",digital:3,pwm:!0,port:"D",bit:3},{id:"D2",name:"D2",x:236.526614,y:9.626457,side:"top",net:"D2",digital:2,pwm:!1,port:"D",bit:2},{id:"D1",name:"D1",x:246.126614,y:9.626457,side:"top",net:"D1",digital:1,pwm:!1,port:"D",bit:1},{id:"D0",name:"D0",x:255.726614,y:9.626457,side:"top",net:"D0",digital:0,pwm:!1,port:"D",bit:0},{id:"NC",name:"NC",x:121.326614,y:192.026457,side:"bottom",net:"NC",connectable:!1},{id:"IOREF",name:"IOREF",x:130.926614,y:192.026457,side:"bottom",net:"IOREF"},{id:"RESET",name:"RESET",x:140.526614,y:192.026457,side:"bottom",net:"RESET"},{id:"3.3V",name:"3.3V",x:150.126614,y:192.026457,side:"bottom",net:"3.3V",voltage:3.3},{id:"5V",name:"5V",x:159.726614,y:192.026457,side:"bottom",net:"5V",voltage:5},{id:"GND.1",name:"GND.1",x:169.326614,y:192.026457,side:"bottom",net:"GND",voltage:0},{id:"GND.2",name:"GND.2",x:178.926614,y:192.026457,side:"bottom",net:"GND",voltage:0},{id:"VIN",name:"VIN",x:188.526614,y:192.026457,side:"bottom",net:"VIN"},{id:"A0",name:"A0",x:207.726614,y:192.026457,side:"bottom",net:"A0",analog:0,digital:14,port:"C",bit:0},{id:"A1",name:"A1",x:217.326614,y:192.026457,side:"bottom",net:"A1",analog:1,digital:15,port:"C",bit:1},{id:"A2",name:"A2",x:226.926614,y:192.026457,side:"bottom",net:"A2",analog:2,digital:16,port:"C",bit:2},{id:"A3",name:"A3",x:236.526614,y:192.026457,side:"bottom",net:"A3",analog:3,digital:17,port:"C",bit:3},{id:"A4",name:"A4",x:246.126614,y:192.026457,side:"bottom",net:"A4",analog:4,digital:18,port:"C",bit:4},{id:"A5",name:"A5",x:255.726614,y:192.026457,side:"bottom",net:"A5",analog:5,digital:19,port:"C",bit:5}],leds:{power:{x:236.5984251968504,y:63.34488188976379},D13:{x:121.58740157480317,y:46.26141732283465},TX:{x:120.4724409448819,y:63.30708661417324},RX:{x:120.4724409448819,y:72.00000000000001}},source:"https://github.com/wokwi/wokwi-elements/blob/main/src/arduino-uno-element.ts",license:"MIT",copyright:"2020 Uri Shaked",verification:"https://content.arduino.cc/assets/Pinout-UNOrev3_latest.pdf"};var Ze=n=>{if(/^D\d+$/.test(n)){let e=+n.slice(1);return{net:n,digital:e,port:e<8?"D":"B",bit:e<8?e:e-8,pwm:[3,5,6,9,10,11].includes(e)}}if(/^A[0-7]$/.test(n)){let e=+n.slice(1);return{net:n,analog:e,...e<6?{digital:14+e,port:"C",bit:e}:{analogOnly:!0}}}return n.startsWith("GND")?{net:"GND",voltage:0}:n.startsWith("RESET")?{net:"RESET"}:{net:n,...n==="5V"||n==="VCC"?{voltage:5}:n==="3.3V"?{voltage:3.3}:{}}},Cn=(n,e,_,E)=>n.map((d,i)=>({id:d,name:d,x:e,y:_+i*9.6,side:E,...Ze(d)})),jn={id:"nano",name:"Arduino Nano (classic)",width:68.03,height:170.08,asset:"arduino-nano.svg",pins:[...Cn(["D1","D0","RESET","GND","D2","D3","D4","D5","D6","D7","D8","D9","D10","D11","D12"],5.7,18,"left"),...Cn(["VIN","GND.1","RESET.1","5V","A0","A1","A2","A3","A4","A5","A6","A7","AREF","3.3V","D13"],62.33,18,"right")],leds:{power:{x:34,y:97},D13:{x:34,y:105}},source:"https://docs.arduino.cc/resources/pinouts/A000005-full-pinout.pdf"},$n={id:"pro-mini",name:"Arduino Pro Mini (5 V / 16 MHz)",width:68.03,height:124.72,asset:"arduino-pro-mini.svg",pins:ln.map(n=>({...n,...Ze(n.net)})),leds:{power:{x:24,y:91},D13:{x:46,y:91}},source:"https://github.com/sparkfun/Arduino_Pro_Mini_328/blob/master/Hardware/Arduino-Pro-Mini.brd"},qn=[["E",0],["E",1],["E",4],["E",5],["G",5],["E",3],["H",3],["H",4],["H",5],["H",6],["B",4],["B",5],["B",6],["B",7],["J",1],["J",0],["H",1],["H",0],["D",3],["D",2],["D",1],["D",0],...Array.from({length:8},(n,e)=>["A",e]),...Array.from({length:8},(n,e)=>["C",7-e]),["D",7],["G",2],["G",1],["G",0],...Array.from({length:8},(n,e)=>["L",7-e]),["B",3],["B",2],["B",1],["B",0]],Ne=(n,e,_,E)=>{let d={SDA:"D20",SCL:"D21",IOREF:"5V"}[n],i=d||n,t={id:n,name:n,x:e,y:_,side:E,...Ze(n),net:i,...n==="IOREF"?{voltage:5}:{}};if(/^D\d+$/.test(i)){let s=+i.slice(1),[T,o]=qn[s];t={...t,digital:s,port:T,bit:o,pwm:s>=2&&s<=13||s>=44&&s<=46}}else if(/^A\d+$/.test(i)){let s=+i.slice(1);t={...t,analogOnly:!1,analog:s,digital:54+s,port:s<8?"F":"K",bit:s%8}}return t},Jn={id:"mega",name:"Arduino Mega 2560 R3",width:392,height:201.6,asset:"arduino-mega2560.svg",pins:[...Ue.pins.filter(n=>n.side==="top").map(n=>Ne(n.id,n.x,n.y,n.side)),...Array.from({length:8},(n,e)=>Ne("D"+(14+e),275+e*9.6,9.626457,"top")),...Ue.pins.filter(n=>n.side==="bottom"&&!/^A/.test(n.id)).map(n=>({...Ne(n.id,n.x,n.y,n.side),...n.connectable===!1?{connectable:!1}:{}})),...Array.from({length:16},(n,e)=>Ne("A"+e,207.726614+(e<8?e*9.6:86.4+(e-8)*9.6),192.026457,"bottom")),...Array.from({length:32},(n,e)=>Ne("D"+(22+e),e%2?381.5:371.9,33.626457+Math.floor(e/2)*9.6,"right")),...[["5V.1",371.9,24.026457],["5V.2",381.5,24.026457],["GND.3",371.9,187.226457],["GND.4",381.5,187.226457]].map(([n,e,_])=>({...Ne(n,e,_,"right"),net:n.startsWith("5V")?"5V":"GND",voltage:n.startsWith("5V")?5:0}))],leds:{power:{x:251,y:54},D13:{x:125,y:45},TX:{x:110,y:58},RX:{x:110,y:67}},source:"https://docs.arduino.cc/resources/pinouts/A000067-full-pinout.pdf"},An=Ue.pins.filter(n=>!["SCL","SDA","NC","IOREF"].includes(n.id)).map(n=>({...n})),Zn={id:"duemilanove",name:"Arduino Duemilanove (ATmega328P)",width:274.31811,height:201.6,asset:"arduino-duemilanove.svg",pins:An,leds:{power:{x:234,y:64},D13:{x:125,y:46},TX:{x:100,y:67},RX:{x:100,y:76}},source:"https://docs.arduino.cc/retired/boards/arduino-duemilanove/"},e_={id:"pro",name:"Arduino Pro (5 V / 16 MHz)",width:274.31811,height:201.6,asset:"arduino-pro.svg",pins:An,leds:{power:{x:225,y:100},D13:{x:130,y:49}},source:"https://docs.arduino.cc/retired/boards/arduino-pro/"},De=n=>({...n,hz:16e6,mcu:"ATmega328P",flashSize:32768,analogChannels:6,flashLimit:30720,ram:2048}),j_={...ie,...Rn,...Se,[Je.id]:Je,uno:{...De(Ue),flashLimit:32256},nano:{...De(jn),analogChannels:8},"pro-mini":{...De($n),analogChannels:8},mega:{...Jn,hz:16e6,mcu:"ATmega2560",flashSize:262144,analogChannels:16,flashLimit:253952,ram:8192},duemilanove:De(Zn),pro:De(e_),...Object.fromEntries(Object.entries($e).map(([n,e])=>[n,{...e,id:n,name:e.title||e.name+" "+e.board,mcu:e.name,architecture:"esp32",ioVoltage:3.3,logicHigh:2.475,supplyPin:"3V3",width:e.width||220,height:e.height||460,pins:On[n],flashSize:e.flash,flashLimit:e.flash,ram:e.ram??(n==="esp32c3"?240*1024:n==="esp32c6"?432*1024:400*1024),leds:{}}]))};var n_=[{id:"software-serial",name:"SoftwareSerial",version:"1.0",dependencies:[],roots:[],includes:["/software-serial"],objects:[],source:"./notices/arduino-avr-1.8.7-source.tar.bz2",license:"LGPL-2.1-or-later",licenseUrl:"./notices/FIRMWARE-NOTICES.md",headers:["SoftwareSerial.h"]},{id:"wire",name:"Wire",version:"1.0",dependencies:[],roots:["/arduino/libraries/Wire/src"],includes:["/arduino/libraries/Wire/src","/arduino/libraries/Wire/src/utility"],objects:["lib_Wire.o","lib_twi.o"],source:"./notices/arduino-avr-1.8.7-source.tar.bz2",license:"LGPL-2.1-or-later",licenseUrl:"./notices/FIRMWARE-NOTICES.md",headers:["Wire.h"]},{id:"spi",name:"SPI",version:"1.0",dependencies:[],roots:["/arduino/libraries/SPI/src"],includes:["/arduino/libraries/SPI/src"],objects:["lib_SPI.o"],source:"./notices/arduino-avr-1.8.7-source.tar.bz2",license:"GPL-2.0 / LGPL-2.1",licenseUrl:"./notices/FIRMWARE-NOTICES.md",headers:["SPI.h"]},{id:"busio",name:"Adafruit BusIO",version:"1.17.4",dependencies:["wire","spi"],roots:["/libraries/Adafruit_BusIO"],includes:["/libraries/Adafruit_BusIO"],objects:["lib_BusIO_Register.o","lib_I2CDevice.o","lib_SPIDevice.o"],source:"./notices/Adafruit-BusIO-1.17.4-source.zip",license:"MIT",licenseUrl:"./notices/ADAFRUIT-BUSIO-LICENSE.txt",headers:["Adafruit_I2CDevice.h","Adafruit_SPIDevice.h","Adafruit_BusIO_Register.h"]},{id:"gfx",name:"Adafruit GFX",version:"1.12.6",dependencies:["busio"],roots:["/libraries/Adafruit_GFX_Library"],includes:["/libraries/Adafruit_GFX_Library"],objects:["lib_GFX.o"],source:"./notices/Adafruit-GFX-1.12.6-source.zip",license:"BSD",licenseUrl:"./notices/ADAFRUIT-GFX-LICENSE.txt",headers:["Adafruit_GFX.h","gfxfont.h"]},{id:"ssd1306",name:"Adafruit SSD1306",version:"2.5.16",dependencies:["gfx","wire","spi"],roots:["/libraries/Adafruit_SSD1306"],includes:["/libraries/Adafruit_SSD1306"],objects:["lib_SSD1306.o"],source:"./notices/Adafruit-SSD1306-2.5.16-source.zip",license:"BSD",licenseUrl:"./notices/ADAFRUIT-SSD1306-LICENSE.txt",headers:["Adafruit_SSD1306.h"]}],q_=new Map(n_.map(n=>[n.id,n]));function en(n,{language:e="arduino",build:_=!1}={}){let E=e==="c"?"main.c":e==="cpp"?"main.cpp":e==="micropython"?"main.py":"sketch.ino";if(!Array.isArray(n)||!n.length||n.length>16)throw Error("1\u201316 kaynak dosyas\u0131 desteklenir.");let d=0,i=new Set,t=n.map(s=>{if(!s||typeof s.name!="string"||s.name.length>100||!(/^([A-Za-z_][\w-]*\/)*[A-Za-z_][\w.-]*\.(ino|cpp|c|h|hpp|py)$/.test(s.name)||_&&e==="c"&&/^([A-Za-z_][\w-]*\/)*(CMakeLists\.txt|[A-Za-z_][\w.-]*\.cmake|[A-Za-z_][\w.-]*\.h\.in)$/.test(s.name))||s.name.split("/").some(T=>T==="."||T==="..")||i.has(s.name.toLowerCase()))throw Error("Dosya ad\u0131 ge\xE7ersiz veya yineleniyor.");if(["c","cpp"].includes(e)&&["cf_hal.h","stdint.h","stdio.h","stddef.h","stdbool.h",...e==="cpp"?["stdlib.h","string.h"]:[]].includes(s.name))throw Error("Bu ba\u015Fl\u0131k derleyici taraf\u0131ndan sa\u011Flan\u0131r: "+s.name);if(e==="micropython"&&s.name==="machine.py")throw Error("machine.py devre modeli taraf\u0131ndan sa\u011Flan\u0131r.");if(i.add(s.name.toLowerCase()),typeof s.content!="string")throw Error("Kaynak kod ge\xE7ersiz.");return d+=new TextEncoder().encode(s.content).length,{name:s.name,content:s.content}});if(d>1e5)throw Error("Kaynak dosyalar\u0131 toplam 100 KB s\u0131n\u0131r\u0131n\u0131 a\u015F\u0131yor.");if(!t.some(s=>s.name===E)||t.filter(s=>s.name.endsWith(".ino")).length!==(e==="arduino"?1:0)||t.some(s=>e==="micropython"?!s.name.endsWith(".py"):e==="c"?/\.(ino|cpp|py)$/.test(s.name):e==="cpp"?/\.(ino|py)$/.test(s.name):/\.(c|py)$/.test(s.name)))throw Error("Ana kaynak "+E+" olmal\u0131; ek dosyalar se\xE7ilen dile uygun olmal\u0131.");return t}var Ri=new TextEncoder;var __={esp32c3:{chip:"esp32c3",id:5,text:1077411840,data:1070137344,stack:1070458640,gpio:1610629120,inputOffset:60,matrix:1364,signal:128,mux:1610649600,uart:1610612736,hz:16e7,maxPin:21,ram:240*1024},esp32c6:{chip:"esp32c6",id:13,text:1082130432,data:1082195968,stack:1082650624,gpio:1611206656,inputOffset:60,matrix:1364,signal:128,mux:1611202560,uart:1610612736,hz:16e7,maxPin:30,ram:432*1024},esp32h2:{chip:"esp32h2",id:16,text:1082130432,data:1082195968,stack:1082454016,gpio:1611206656,inputOffset:60,matrix:1364,signal:128,mux:1611202560,uart:1610612736,hz:96e6,maxPin:27,ram:240*1024},esp32c5:{chip:"esp32c5",id:23,text:1082130432,data:1082195968,stack:1082519552,gpio:1611206656,inputOffset:100,enable:52,enableHigh:64,matrix:2772,signal:256,oeBit:10,mux:1611202560,muxOffset:0,uart:1610612736,hz:24e7,maxPin:28,ram:304*1024,imageOffset:8192},esp32p4:{chip:"esp32p4",id:18,text:1341128704,data:1341194240,stack:1341779968,gpio:1343094784,inputOffset:60,matrix:1368,signal:256,oeBit:10,mux:1343098880,uart:1343004672,hz:4e8,maxPin:54,ram:560*1024,imageOffset:8192},esp32s3:{chip:"esp32s3",id:9,text:1077411840,data:1070170112,stack:1070592e3,gpio:1610629120,inputOffset:60,matrix:1364,signal:256,mux:1610649600,uart:1610612736,hz:24e7,maxPin:48,ram:400*1024,xtensa:!0}},ri=__.esp32c3;async function nn(n,e,_){let E="",d=new Ae(T=>{E+=new TextDecoder().decode(T)}),i=new ze(_,[],[new ae(new J([])),d,d,new Ce(".",e)],{debug:!1}),t=await WebAssembly.instantiate(n,{wasi_snapshot_preview1:i.wasiImport}),s=i.start(t);if(s)throw Error(E||`Clang \xE7\u0131k\u0131\u015F kodu ${s}`);return E}var Un=`#pragma once
#include <stdint.h>
#define CF_HID_LEFT_CTRL 1u
#define CF_HID_LEFT_SHIFT 2u
#define CF_HID_LEFT_ALT 4u
#define CF_HID_LEFT_GUI 8u
#define CF_HID_KEY_A 4u
#define CF_HID_KEY_B 5u
#define CF_HID_KEY_ENTER 40u
#define CF_HID_KEY_SPACE 44u
#define CF_HID_KEY_CAPS_LOCK 57u
static inline volatile uint32_t *cf_kbd_regs(void){return (volatile uint32_t*)0x5fffd000;}
static inline int cf_kbd_command(unsigned command,const void*data,unsigned length){volatile uint32_t*r=cf_kbd_regs();while(r[1]&0x80000000u){}r[2]=(uint32_t)data;r[6]=length;r[8]=command;while(r[1]&0x80000000u){}return (int)r[3];}
static inline int cf_usb_keyboard_begin(void){return cf_kbd_command(1,0,0);}
static inline int cf_ble_keyboard_begin(const char*name){if(!name)return -3;uint8_t copy[32];unsigned n=0;while(n<32&&name[n]){copy[n]=(uint8_t)name[n];n++;}if(!n||name[n])return -3;return cf_kbd_command(2,copy,n);}
static inline int cf_usb_keyboard_ready(void){return !!(cf_kbd_regs()[1]&1);}
static inline int cf_ble_keyboard_ready(void){return !!(cf_kbd_regs()[1]&2);}
static inline unsigned cf_usb_keyboard_leds(void){return cf_kbd_regs()[4];}
static inline unsigned cf_ble_keyboard_leds(void){return cf_kbd_regs()[5];}
static inline int cf_keyboard_report(unsigned ble,unsigned modifier,const uint8_t keys[6]){uint8_t report[8]={(uint8_t)modifier,0,0,0,0,0,0,0};for(unsigned i=0;i<6;i++)report[i+2]=keys?keys[i]:0;return cf_kbd_command(ble?4:3,report,8);}
static inline int cf_usb_keyboard_report(unsigned modifier,const uint8_t keys[6]){return cf_keyboard_report(0,modifier,keys);}
static inline int cf_ble_keyboard_report(unsigned modifier,const uint8_t keys[6]){return cf_keyboard_report(1,modifier,keys);}
static inline int cf_usb_keyboard_release(void){return cf_keyboard_report(0,0,0);}
static inline int cf_ble_keyboard_release(void){return cf_keyboard_report(1,0,0);}
static inline void cf_usb_keyboard_end(void){cf_kbd_command(5,0,0);}
static inline void cf_ble_keyboard_end(void){cf_kbd_command(6,0,0);}
`;var Dn={"nrf52840.h":`/*
Copyright (c) 2010 - 2023, Nordic Semiconductor ASA All rights reserved.\\n
\\n
SPDX-License-Identifier: BSD-3-Clause\\n
\\n
Redistribution and use in source and binary forms, with or without\\n
modification, are permitted provided that the following conditions are met:\\n
\\n
1. Redistributions of source code must retain the above copyright notice, this\\n
   list of conditions and the following disclaimer.\\n
\\n
2. Redistributions in binary form must reproduce the above copyright\\n
   notice, this list of conditions and the following disclaimer in the\\n
   documentation and/or other materials provided with the distribution.\\n
\\n
3. Neither the name of Nordic Semiconductor ASA nor the names of its\\n
   contributors may be used to endorse or promote products derived from this\\n
   software without specific prior written permission.\\n
\\n
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"\\n
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\\n
IMPLIED WARRANTIES OF MERCHANTABILITY, AND FITNESS FOR A PARTICULAR PURPOSE\\n
ARE DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE\\n
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR\\n
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF\\n
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS\\n
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN\\n
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)\\n
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE\\n
POSSIBILITY OF SUCH DAMAGE.\\n
 *
 * @file     nrf52840.h
 * @brief    CMSIS HeaderFile
 * @version  1
 * @date     20. September 2023
 * @note     Generated by SVDConv V3.3.35 on Wednesday, 20.09.2023 12:45:33
 *           from File 'nrf52840.svd',
 *           last modified on Wednesday, 20.09.2023 10:44:18
 */



/** @addtogroup Nordic Semiconductor
  * @{
  */


/** @addtogroup nrf52840
  * @{
  */


#ifndef NRF52840_H
#define NRF52840_H

#ifdef __cplusplus
extern "C" {
#endif


/** @addtogroup Configuration_of_CMSIS
  * @{
  */



/* =========================================================================================================================== */
/* ================                                Interrupt Number Definition                                ================ */
/* =========================================================================================================================== */

typedef enum {
/* =======================================  ARM Cortex-M4 Specific Interrupt Numbers  ======================================== */
  Reset_IRQn                = -15,              /*!< -15  Reset Vector, invoked on Power up and warm reset                     */
  NonMaskableInt_IRQn       = -14,              /*!< -14  Non maskable Interrupt, cannot be stopped or preempted               */
  HardFault_IRQn            = -13,              /*!< -13  Hard Fault, all classes of Fault                                     */
  MemoryManagement_IRQn     = -12,              /*!< -12  Memory Management, MPU mismatch, including Access Violation
                                                     and No Match                                                              */
  BusFault_IRQn             = -11,              /*!< -11  Bus Fault, Pre-Fetch-, Memory Access Fault, other address/memory
                                                     related Fault                                                             */
  UsageFault_IRQn           = -10,              /*!< -10  Usage Fault, i.e. Undef Instruction, Illegal State Transition        */
  SVCall_IRQn               =  -5,              /*!< -5 System Service Call via SVC instruction                                */
  DebugMonitor_IRQn         =  -4,              /*!< -4 Debug Monitor                                                          */
  PendSV_IRQn               =  -2,              /*!< -2 Pendable request for system service                                    */
  SysTick_IRQn              =  -1,              /*!< -1 System Tick Timer                                                      */
/* ==========================================  nrf52840 Specific Interrupt Numbers  ========================================== */
  POWER_CLOCK_IRQn          =   0,              /*!< 0  POWER_CLOCK                                                            */
  RADIO_IRQn                =   1,              /*!< 1  RADIO                                                                  */
  UARTE0_UART0_IRQn         =   2,              /*!< 2  UARTE0_UART0                                                           */
  SPIM0_SPIS0_TWIM0_TWIS0_SPI0_TWI0_IRQn=   3,  /*!< 3  SPIM0_SPIS0_TWIM0_TWIS0_SPI0_TWI0                                      */
  SPIM1_SPIS1_TWIM1_TWIS1_SPI1_TWI1_IRQn=   4,  /*!< 4  SPIM1_SPIS1_TWIM1_TWIS1_SPI1_TWI1                                      */
  NFCT_IRQn                 =   5,              /*!< 5  NFCT                                                                   */
  GPIOTE_IRQn               =   6,              /*!< 6  GPIOTE                                                                 */
  SAADC_IRQn                =   7,              /*!< 7  SAADC                                                                  */
  TIMER0_IRQn               =   8,              /*!< 8  TIMER0                                                                 */
  TIMER1_IRQn               =   9,              /*!< 9  TIMER1                                                                 */
  TIMER2_IRQn               =  10,              /*!< 10 TIMER2                                                                 */
  RTC0_IRQn                 =  11,              /*!< 11 RTC0                                                                   */
  TEMP_IRQn                 =  12,              /*!< 12 TEMP                                                                   */
  RNG_IRQn                  =  13,              /*!< 13 RNG                                                                    */
  ECB_IRQn                  =  14,              /*!< 14 ECB                                                                    */
  CCM_AAR_IRQn              =  15,              /*!< 15 CCM_AAR                                                                */
  WDT_IRQn                  =  16,              /*!< 16 WDT                                                                    */
  RTC1_IRQn                 =  17,              /*!< 17 RTC1                                                                   */
  QDEC_IRQn                 =  18,              /*!< 18 QDEC                                                                   */
  COMP_LPCOMP_IRQn          =  19,              /*!< 19 COMP_LPCOMP                                                            */
  SWI0_EGU0_IRQn            =  20,              /*!< 20 SWI0_EGU0                                                              */
  SWI1_EGU1_IRQn            =  21,              /*!< 21 SWI1_EGU1                                                              */
  SWI2_EGU2_IRQn            =  22,              /*!< 22 SWI2_EGU2                                                              */
  SWI3_EGU3_IRQn            =  23,              /*!< 23 SWI3_EGU3                                                              */
  SWI4_EGU4_IRQn            =  24,              /*!< 24 SWI4_EGU4                                                              */
  SWI5_EGU5_IRQn            =  25,              /*!< 25 SWI5_EGU5                                                              */
  TIMER3_IRQn               =  26,              /*!< 26 TIMER3                                                                 */
  TIMER4_IRQn               =  27,              /*!< 27 TIMER4                                                                 */
  PWM0_IRQn                 =  28,              /*!< 28 PWM0                                                                   */
  PDM_IRQn                  =  29,              /*!< 29 PDM                                                                    */
  MWU_IRQn                  =  32,              /*!< 32 MWU                                                                    */
  PWM1_IRQn                 =  33,              /*!< 33 PWM1                                                                   */
  PWM2_IRQn                 =  34,              /*!< 34 PWM2                                                                   */
  SPIM2_SPIS2_SPI2_IRQn     =  35,              /*!< 35 SPIM2_SPIS2_SPI2                                                       */
  RTC2_IRQn                 =  36,              /*!< 36 RTC2                                                                   */
  I2S_IRQn                  =  37,              /*!< 37 I2S                                                                    */
  FPU_IRQn                  =  38,              /*!< 38 FPU                                                                    */
  USBD_IRQn                 =  39,              /*!< 39 USBD                                                                   */
  UARTE1_IRQn               =  40,              /*!< 40 UARTE1                                                                 */
  QSPI_IRQn                 =  41,              /*!< 41 QSPI                                                                   */
  CRYPTOCELL_IRQn           =  42,              /*!< 42 CRYPTOCELL                                                             */
  PWM3_IRQn                 =  45,              /*!< 45 PWM3                                                                   */
  SPIM3_IRQn                =  47               /*!< 47 SPIM3                                                                  */
} IRQn_Type;



/* =========================================================================================================================== */
/* ================                           Processor and Core Peripheral Section                           ================ */
/* =========================================================================================================================== */

/* ===========================  Configuration of the ARM Cortex-M4 Processor and Core Peripherals  =========================== */
#define __CM4_REV                 0x0001U       /*!< CM4 Core Revision                                                         */
#define __INTERRUPTS_MAX                   112        /*!< Top interrupt number                                                      */
#define __DSP_PRESENT                  1        /*!< DSP present or not                                                        */
#define __VTOR_PRESENT                 1        /*!< Set to 1 if CPU supports Vector Table Offset Register                     */
#define __NVIC_PRIO_BITS               3        /*!< Number of Bits used for Priority Levels                                   */
#define __Vendor_SysTickConfig         0        /*!< Set to 1 if different SysTick Config is used                              */
#define __MPU_PRESENT                  1        /*!< MPU present                                                               */
#define __FPU_PRESENT                  1        /*!< FPU present                                                               */


/** @} */ /* End of group Configuration_of_CMSIS */

#include "core_cm4.h"                           /*!< ARM Cortex-M4 processor and core peripherals                              */
#include "system_nrf52840.h"                    /*!< nrf52840 System                                                           */

#ifndef __IM                                    /*!< Fallback for older CMSIS versions                                         */
  #define __IM   __I
#endif
#ifndef __OM                                    /*!< Fallback for older CMSIS versions                                         */
  #define __OM   __O
#endif
#ifndef __IOM                                   /*!< Fallback for older CMSIS versions                                         */
  #define __IOM  __IO
#endif


/* ========================================  Start of section using anonymous unions  ======================================== */
#if defined (__CC_ARM)
  #pragma push
  #pragma anon_unions
#elif defined (__ICCARM__)
  #pragma language=extended
#elif defined(__ARMCC_VERSION) && (__ARMCC_VERSION >= 6010050)
  #pragma clang diagnostic push
  #pragma clang diagnostic ignored "-Wc11-extensions"
  #pragma clang diagnostic ignored "-Wreserved-id-macro"
  #pragma clang diagnostic ignored "-Wgnu-anonymous-struct"
  #pragma clang diagnostic ignored "-Wnested-anon-types"
#elif defined (__GNUC__)
  /* anonymous unions are enabled by default */
#elif defined (__TMS470__)
  /* anonymous unions are enabled by default */
#elif defined (__TASKING__)
  #pragma warning 586
#elif defined (__CSMC__)
  /* anonymous unions are enabled by default */
#else
  #warning Not supported compiler type
#endif


/* =========================================================================================================================== */
/* ================                              Device Specific Cluster Section                              ================ */
/* =========================================================================================================================== */


/** @addtogroup Device_Peripheral_clusters
  * @{
  */


/**
  * @brief FICR_INFO [INFO] (Device info)
  */
typedef struct {
  __IM  uint32_t  PART;                         /*!< (@ 0x00000000) Part code                                                  */
  __IM  uint32_t  VARIANT;                      /*!< (@ 0x00000004) Build code (hardware version and production configuration) */
  __IM  uint32_t  PACKAGE;                      /*!< (@ 0x00000008) Package option                                             */
  __IM  uint32_t  RAM;                          /*!< (@ 0x0000000C) RAM variant                                                */
  __IM  uint32_t  FLASH;                        /*!< (@ 0x00000010) Flash variant                                              */
} FICR_INFO_Type;                               /*!< Size = 20 (0x14)                                                          */


/**
  * @brief FICR_TEMP [TEMP] (Registers storing factory TEMP module linearization coefficients)
  */
typedef struct {
  __IM  uint32_t  A0;                           /*!< (@ 0x00000000) Slope definition A0                                        */
  __IM  uint32_t  A1;                           /*!< (@ 0x00000004) Slope definition A1                                        */
  __IM  uint32_t  A2;                           /*!< (@ 0x00000008) Slope definition A2                                        */
  __IM  uint32_t  A3;                           /*!< (@ 0x0000000C) Slope definition A3                                        */
  __IM  uint32_t  A4;                           /*!< (@ 0x00000010) Slope definition A4                                        */
  __IM  uint32_t  A5;                           /*!< (@ 0x00000014) Slope definition A5                                        */
  __IM  uint32_t  B0;                           /*!< (@ 0x00000018) Y-intercept B0                                             */
  __IM  uint32_t  B1;                           /*!< (@ 0x0000001C) Y-intercept B1                                             */
  __IM  uint32_t  B2;                           /*!< (@ 0x00000020) Y-intercept B2                                             */
  __IM  uint32_t  B3;                           /*!< (@ 0x00000024) Y-intercept B3                                             */
  __IM  uint32_t  B4;                           /*!< (@ 0x00000028) Y-intercept B4                                             */
  __IM  uint32_t  B5;                           /*!< (@ 0x0000002C) Y-intercept B5                                             */
  __IM  uint32_t  T0;                           /*!< (@ 0x00000030) Segment end T0                                             */
  __IM  uint32_t  T1;                           /*!< (@ 0x00000034) Segment end T1                                             */
  __IM  uint32_t  T2;                           /*!< (@ 0x00000038) Segment end T2                                             */
  __IM  uint32_t  T3;                           /*!< (@ 0x0000003C) Segment end T3                                             */
  __IM  uint32_t  T4;                           /*!< (@ 0x00000040) Segment end T4                                             */
} FICR_TEMP_Type;                               /*!< Size = 68 (0x44)                                                          */


/**
  * @brief FICR_NFC [NFC] (Unspecified)
  */
typedef struct {
  __IM  uint32_t  TAGHEADER0;                   /*!< (@ 0x00000000) Default header for NFC tag. Software can read
                                                                    these values to populate NFCID1_3RD_LAST,
                                                                    NFCID1_2ND_LAST, and NFCID1_LAST.                          */
  __IM  uint32_t  TAGHEADER1;                   /*!< (@ 0x00000004) Default header for NFC tag. Software can read
                                                                    these values to populate NFCID1_3RD_LAST,
                                                                    NFCID1_2ND_LAST, and NFCID1_LAST.                          */
  __IM  uint32_t  TAGHEADER2;                   /*!< (@ 0x00000008) Default header for NFC tag. Software can read
                                                                    these values to populate NFCID1_3RD_LAST,
                                                                    NFCID1_2ND_LAST, and NFCID1_LAST.                          */
  __IM  uint32_t  TAGHEADER3;                   /*!< (@ 0x0000000C) Default header for NFC tag. Software can read
                                                                    these values to populate NFCID1_3RD_LAST,
                                                                    NFCID1_2ND_LAST, and NFCID1_LAST.                          */
} FICR_NFC_Type;                                /*!< Size = 16 (0x10)                                                          */


/**
  * @brief FICR_TRNG90B [TRNG90B] (NIST800-90B RNG calibration data)
  */
typedef struct {
  __IM  uint32_t  BYTES;                        /*!< (@ 0x00000000) Amount of bytes for the required entropy bits              */
  __IM  uint32_t  RCCUTOFF;                     /*!< (@ 0x00000004) Repetition counter cutoff                                  */
  __IM  uint32_t  APCUTOFF;                     /*!< (@ 0x00000008) Adaptive proportion cutoff                                 */
  __IM  uint32_t  STARTUP;                      /*!< (@ 0x0000000C) Amount of bytes for the startup tests                      */
  __IM  uint32_t  ROSC1;                        /*!< (@ 0x00000010) Sample count for ring oscillator 1                         */
  __IM  uint32_t  ROSC2;                        /*!< (@ 0x00000014) Sample count for ring oscillator 2                         */
  __IM  uint32_t  ROSC3;                        /*!< (@ 0x00000018) Sample count for ring oscillator 3                         */
  __IM  uint32_t  ROSC4;                        /*!< (@ 0x0000001C) Sample count for ring oscillator 4                         */
} FICR_TRNG90B_Type;                            /*!< Size = 32 (0x20)                                                          */


/**
  * @brief POWER_RAM [RAM] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  POWER;                        /*!< (@ 0x00000000) Description cluster: RAMn power control register           */
  __OM  uint32_t  POWERSET;                     /*!< (@ 0x00000004) Description cluster: RAMn power control set register       */
  __OM  uint32_t  POWERCLR;                     /*!< (@ 0x00000008) Description cluster: RAMn power control clear
                                                                    register                                                   */
  __IM  uint32_t  RESERVED;
} POWER_RAM_Type;                               /*!< Size = 16 (0x10)                                                          */


/**
  * @brief UART_PSEL [PSEL] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  RTS;                          /*!< (@ 0x00000000) Pin select for RTS                                         */
  __IOM uint32_t  TXD;                          /*!< (@ 0x00000004) Pin select for TXD                                         */
  __IOM uint32_t  CTS;                          /*!< (@ 0x00000008) Pin select for CTS                                         */
  __IOM uint32_t  RXD;                          /*!< (@ 0x0000000C) Pin select for RXD                                         */
} UART_PSEL_Type;                               /*!< Size = 16 (0x10)                                                          */


/**
  * @brief UARTE_PSEL [PSEL] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  RTS;                          /*!< (@ 0x00000000) Pin select for RTS signal                                  */
  __IOM uint32_t  TXD;                          /*!< (@ 0x00000004) Pin select for TXD signal                                  */
  __IOM uint32_t  CTS;                          /*!< (@ 0x00000008) Pin select for CTS signal                                  */
  __IOM uint32_t  RXD;                          /*!< (@ 0x0000000C) Pin select for RXD signal                                  */
} UARTE_PSEL_Type;                              /*!< Size = 16 (0x10)                                                          */


/**
  * @brief UARTE_RXD [RXD] (RXD EasyDMA channel)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) Data pointer                                               */
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000004) Maximum number of bytes in receive buffer                  */
  __IM  uint32_t  AMOUNT;                       /*!< (@ 0x00000008) Number of bytes transferred in the last transaction        */
} UARTE_RXD_Type;                               /*!< Size = 12 (0xc)                                                           */


/**
  * @brief UARTE_TXD [TXD] (TXD EasyDMA channel)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) Data pointer                                               */
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000004) Maximum number of bytes in transmit buffer                 */
  __IM  uint32_t  AMOUNT;                       /*!< (@ 0x00000008) Number of bytes transferred in the last transaction        */
} UARTE_TXD_Type;                               /*!< Size = 12 (0xc)                                                           */


/**
  * @brief SPI_PSEL [PSEL] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  SCK;                          /*!< (@ 0x00000000) Pin select for SCK                                         */
  __IOM uint32_t  MOSI;                         /*!< (@ 0x00000004) Pin select for MOSI signal                                 */
  __IOM uint32_t  MISO;                         /*!< (@ 0x00000008) Pin select for MISO signal                                 */
} SPI_PSEL_Type;                                /*!< Size = 12 (0xc)                                                           */


/**
  * @brief SPIM_PSEL [PSEL] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  SCK;                          /*!< (@ 0x00000000) Pin select for SCK                                         */
  __IOM uint32_t  MOSI;                         /*!< (@ 0x00000004) Pin select for MOSI signal                                 */
  __IOM uint32_t  MISO;                         /*!< (@ 0x00000008) Pin select for MISO signal                                 */
  __IOM uint32_t  CSN;                          /*!< (@ 0x0000000C) Pin select for CSN                                         */
} SPIM_PSEL_Type;                               /*!< Size = 16 (0x10)                                                          */


/**
  * @brief SPIM_RXD [RXD] (RXD EasyDMA channel)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) Data pointer                                               */
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000004) Maximum number of bytes in receive buffer                  */
  __IM  uint32_t  AMOUNT;                       /*!< (@ 0x00000008) Number of bytes transferred in the last transaction        */
  __IOM uint32_t  LIST;                         /*!< (@ 0x0000000C) EasyDMA list type                                          */
} SPIM_RXD_Type;                                /*!< Size = 16 (0x10)                                                          */


/**
  * @brief SPIM_TXD [TXD] (TXD EasyDMA channel)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) Data pointer                                               */
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000004) Number of bytes in transmit buffer                         */
  __IM  uint32_t  AMOUNT;                       /*!< (@ 0x00000008) Number of bytes transferred in the last transaction        */
  __IOM uint32_t  LIST;                         /*!< (@ 0x0000000C) EasyDMA list type                                          */
} SPIM_TXD_Type;                                /*!< Size = 16 (0x10)                                                          */


/**
  * @brief SPIM_IFTIMING [IFTIMING] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  RXDELAY;                      /*!< (@ 0x00000000) Sample delay for input serial data on MISO                 */
  __IOM uint32_t  CSNDUR;                       /*!< (@ 0x00000004) Minimum duration between edge of CSN and edge
                                                                    of SCK and minimum duration CSN must stay
                                                                    high between transactions                                  */
} SPIM_IFTIMING_Type;                           /*!< Size = 8 (0x8)                                                            */


/**
  * @brief SPIS_PSEL [PSEL] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  SCK;                          /*!< (@ 0x00000000) Pin select for SCK                                         */
  __IOM uint32_t  MISO;                         /*!< (@ 0x00000004) Pin select for MISO signal                                 */
  __IOM uint32_t  MOSI;                         /*!< (@ 0x00000008) Pin select for MOSI signal                                 */
  __IOM uint32_t  CSN;                          /*!< (@ 0x0000000C) Pin select for CSN signal                                  */
} SPIS_PSEL_Type;                               /*!< Size = 16 (0x10)                                                          */


/**
  * @brief SPIS_RXD [RXD] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) RXD data pointer                                           */
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000004) Maximum number of bytes in receive buffer                  */
  __IM  uint32_t  AMOUNT;                       /*!< (@ 0x00000008) Number of bytes received in last granted transaction       */
  __IOM uint32_t  LIST;                         /*!< (@ 0x0000000C) EasyDMA list type                                          */
} SPIS_RXD_Type;                                /*!< Size = 16 (0x10)                                                          */


/**
  * @brief SPIS_TXD [TXD] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) TXD data pointer                                           */
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000004) Maximum number of bytes in transmit buffer                 */
  __IM  uint32_t  AMOUNT;                       /*!< (@ 0x00000008) Number of bytes transmitted in last granted transaction    */
  __IOM uint32_t  LIST;                         /*!< (@ 0x0000000C) EasyDMA list type                                          */
} SPIS_TXD_Type;                                /*!< Size = 16 (0x10)                                                          */


/**
  * @brief TWI_PSEL [PSEL] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  SCL;                          /*!< (@ 0x00000000) Pin select for SCL                                         */
  __IOM uint32_t  SDA;                          /*!< (@ 0x00000004) Pin select for SDA                                         */
} TWI_PSEL_Type;                                /*!< Size = 8 (0x8)                                                            */


/**
  * @brief TWIM_PSEL [PSEL] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  SCL;                          /*!< (@ 0x00000000) Pin select for SCL signal                                  */
  __IOM uint32_t  SDA;                          /*!< (@ 0x00000004) Pin select for SDA signal                                  */
} TWIM_PSEL_Type;                               /*!< Size = 8 (0x8)                                                            */


/**
  * @brief TWIM_RXD [RXD] (RXD EasyDMA channel)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) Data pointer                                               */
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000004) Maximum number of bytes in receive buffer                  */
  __IM  uint32_t  AMOUNT;                       /*!< (@ 0x00000008) Number of bytes transferred in the last transaction        */
  __IOM uint32_t  LIST;                         /*!< (@ 0x0000000C) EasyDMA list type                                          */
} TWIM_RXD_Type;                                /*!< Size = 16 (0x10)                                                          */


/**
  * @brief TWIM_TXD [TXD] (TXD EasyDMA channel)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) Data pointer                                               */
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000004) Maximum number of bytes in transmit buffer                 */
  __IM  uint32_t  AMOUNT;                       /*!< (@ 0x00000008) Number of bytes transferred in the last transaction        */
  __IOM uint32_t  LIST;                         /*!< (@ 0x0000000C) EasyDMA list type                                          */
} TWIM_TXD_Type;                                /*!< Size = 16 (0x10)                                                          */


/**
  * @brief TWIS_PSEL [PSEL] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  SCL;                          /*!< (@ 0x00000000) Pin select for SCL signal                                  */
  __IOM uint32_t  SDA;                          /*!< (@ 0x00000004) Pin select for SDA signal                                  */
} TWIS_PSEL_Type;                               /*!< Size = 8 (0x8)                                                            */


/**
  * @brief TWIS_RXD [RXD] (RXD EasyDMA channel)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) RXD Data pointer                                           */
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000004) Maximum number of bytes in RXD buffer                      */
  __IM  uint32_t  AMOUNT;                       /*!< (@ 0x00000008) Number of bytes transferred in the last RXD transaction    */
  __IOM uint32_t  LIST;                         /*!< (@ 0x0000000C) EasyDMA list type                                          */
} TWIS_RXD_Type;                                /*!< Size = 16 (0x10)                                                          */


/**
  * @brief TWIS_TXD [TXD] (TXD EasyDMA channel)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) TXD Data pointer                                           */
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000004) Maximum number of bytes in TXD buffer                      */
  __IM  uint32_t  AMOUNT;                       /*!< (@ 0x00000008) Number of bytes transferred in the last TXD transaction    */
  __IOM uint32_t  LIST;                         /*!< (@ 0x0000000C) EasyDMA list type                                          */
} TWIS_TXD_Type;                                /*!< Size = 16 (0x10)                                                          */


/**
  * @brief NFCT_FRAMESTATUS [FRAMESTATUS] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  RX;                           /*!< (@ 0x00000000) Result of last incoming frame                              */
} NFCT_FRAMESTATUS_Type;                        /*!< Size = 4 (0x4)                                                            */


/**
  * @brief NFCT_TXD [TXD] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  FRAMECONFIG;                  /*!< (@ 0x00000000) Configuration of outgoing frames                           */
  __IOM uint32_t  AMOUNT;                       /*!< (@ 0x00000004) Size of outgoing frame                                     */
} NFCT_TXD_Type;                                /*!< Size = 8 (0x8)                                                            */


/**
  * @brief NFCT_RXD [RXD] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  FRAMECONFIG;                  /*!< (@ 0x00000000) Configuration of incoming frames                           */
  __IM  uint32_t  AMOUNT;                       /*!< (@ 0x00000004) Size of last incoming frame                                */
} NFCT_RXD_Type;                                /*!< Size = 8 (0x8)                                                            */


/**
  * @brief SAADC_EVENTS_CH [EVENTS_CH] (Peripheral events.)
  */
typedef struct {
  __IOM uint32_t  LIMITH;                       /*!< (@ 0x00000000) Description cluster: Last result is equal or
                                                                    above CH[n].LIMIT.HIGH                                     */
  __IOM uint32_t  LIMITL;                       /*!< (@ 0x00000004) Description cluster: Last result is equal or
                                                                    below CH[n].LIMIT.LOW                                      */
} SAADC_EVENTS_CH_Type;                         /*!< Size = 8 (0x8)                                                            */


/**
  * @brief SAADC_CH [CH] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  PSELP;                        /*!< (@ 0x00000000) Description cluster: Input positive pin selection
                                                                    for CH[n]                                                  */
  __IOM uint32_t  PSELN;                        /*!< (@ 0x00000004) Description cluster: Input negative pin selection
                                                                    for CH[n]                                                  */
  __IOM uint32_t  CONFIG;                       /*!< (@ 0x00000008) Description cluster: Input configuration for
                                                                    CH[n]                                                      */
  __IOM uint32_t  LIMIT;                        /*!< (@ 0x0000000C) Description cluster: High/low limits for event
                                                                    monitoring of a channel                                    */
} SAADC_CH_Type;                                /*!< Size = 16 (0x10)                                                          */


/**
  * @brief SAADC_RESULT [RESULT] (RESULT EasyDMA channel)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) Data pointer                                               */
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000004) Maximum number of 16-bit samples to be written
                                                                    to output RAM buffer                                       */
  __IM  uint32_t  AMOUNT;                       /*!< (@ 0x00000008) Number of 16-bit samples written to output RAM
                                                                    buffer since the previous START task                       */
} SAADC_RESULT_Type;                            /*!< Size = 12 (0xc)                                                           */


/**
  * @brief QDEC_PSEL [PSEL] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  LED;                          /*!< (@ 0x00000000) Pin select for LED signal                                  */
  __IOM uint32_t  A;                            /*!< (@ 0x00000004) Pin select for A signal                                    */
  __IOM uint32_t  B;                            /*!< (@ 0x00000008) Pin select for B signal                                    */
} QDEC_PSEL_Type;                               /*!< Size = 12 (0xc)                                                           */


/**
  * @brief PWM_SEQ [SEQ] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) Description cluster: Beginning address in RAM
                                                                    of this sequence                                           */
  __IOM uint32_t  CNT;                          /*!< (@ 0x00000004) Description cluster: Number of values (duty cycles)
                                                                    in this sequence                                           */
  __IOM uint32_t  REFRESH;                      /*!< (@ 0x00000008) Description cluster: Number of additional PWM
                                                                    periods between samples loaded into compare
                                                                    register                                                   */
  __IOM uint32_t  ENDDELAY;                     /*!< (@ 0x0000000C) Description cluster: Time added after the sequence         */
  __IM  uint32_t  RESERVED[4];
} PWM_SEQ_Type;                                 /*!< Size = 32 (0x20)                                                          */


/**
  * @brief PWM_PSEL [PSEL] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  OUT[4];                       /*!< (@ 0x00000000) Description collection: Output pin select for
                                                                    PWM channel n                                              */
} PWM_PSEL_Type;                                /*!< Size = 16 (0x10)                                                          */


/**
  * @brief PDM_PSEL [PSEL] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  CLK;                          /*!< (@ 0x00000000) Pin number configuration for PDM CLK signal                */
  __IOM uint32_t  DIN;                          /*!< (@ 0x00000004) Pin number configuration for PDM DIN signal                */
} PDM_PSEL_Type;                                /*!< Size = 8 (0x8)                                                            */


/**
  * @brief PDM_SAMPLE [SAMPLE] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) RAM address pointer to write samples to with
                                                                    EasyDMA                                                    */
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000004) Number of samples to allocate memory for in EasyDMA
                                                                    mode                                                       */
} PDM_SAMPLE_Type;                              /*!< Size = 8 (0x8)                                                            */


/**
  * @brief ACL_ACL [ACL] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  ADDR;                         /*!< (@ 0x00000000) Description cluster: Start address of region
                                                                    to protect. The start address must be word-aligned.        */
  __IOM uint32_t  SIZE;                         /*!< (@ 0x00000004) Description cluster: Size of region to protect
                                                                    counting from address ACL[n].ADDR. Writing
                                                                    a '0' has no effect.                                       */
  __IOM uint32_t  PERM;                         /*!< (@ 0x00000008) Description cluster: Access permissions for region
                                                                    n as defined by start address ACL[n].ADDR
                                                                    and size ACL[n].SIZE                                       */
  __IM  uint32_t  RESERVED;
} ACL_ACL_Type;                                 /*!< Size = 16 (0x10)                                                          */


/**
  * @brief PPI_TASKS_CHG [TASKS_CHG] (Channel group tasks)
  */
typedef struct {
  __OM  uint32_t  EN;                           /*!< (@ 0x00000000) Description cluster: Enable channel group n                */
  __OM  uint32_t  DIS;                          /*!< (@ 0x00000004) Description cluster: Disable channel group n               */
} PPI_TASKS_CHG_Type;                           /*!< Size = 8 (0x8)                                                            */


/**
  * @brief PPI_CH [CH] (PPI Channel)
  */
typedef struct {
  __IOM uint32_t  EEP;                          /*!< (@ 0x00000000) Description cluster: Channel n event endpoint              */
  __IOM uint32_t  TEP;                          /*!< (@ 0x00000004) Description cluster: Channel n task endpoint               */
} PPI_CH_Type;                                  /*!< Size = 8 (0x8)                                                            */


/**
  * @brief PPI_FORK [FORK] (Fork)
  */
typedef struct {
  __IOM uint32_t  TEP;                          /*!< (@ 0x00000000) Description cluster: Channel n task endpoint               */
} PPI_FORK_Type;                                /*!< Size = 4 (0x4)                                                            */


/**
  * @brief MWU_EVENTS_REGION [EVENTS_REGION] (Peripheral events.)
  */
typedef struct {
  __IOM uint32_t  WA;                           /*!< (@ 0x00000000) Description cluster: Write access to region n
                                                                    detected                                                   */
  __IOM uint32_t  RA;                           /*!< (@ 0x00000004) Description cluster: Read access to region n
                                                                    detected                                                   */
} MWU_EVENTS_REGION_Type;                       /*!< Size = 8 (0x8)                                                            */


/**
  * @brief MWU_EVENTS_PREGION [EVENTS_PREGION] (Peripheral events.)
  */
typedef struct {
  __IOM uint32_t  WA;                           /*!< (@ 0x00000000) Description cluster: Write access to peripheral
                                                                    region n detected                                          */
  __IOM uint32_t  RA;                           /*!< (@ 0x00000004) Description cluster: Read access to peripheral
                                                                    region n detected                                          */
} MWU_EVENTS_PREGION_Type;                      /*!< Size = 8 (0x8)                                                            */


/**
  * @brief MWU_PERREGION [PERREGION] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  SUBSTATWA;                    /*!< (@ 0x00000000) Description cluster: Source of event/interrupt
                                                                    in region n, write access detected while
                                                                    corresponding subregion was enabled for
                                                                    watching                                                   */
  __IOM uint32_t  SUBSTATRA;                    /*!< (@ 0x00000004) Description cluster: Source of event/interrupt
                                                                    in region n, read access detected while
                                                                    corresponding subregion was enabled for
                                                                    watching                                                   */
} MWU_PERREGION_Type;                           /*!< Size = 8 (0x8)                                                            */


/**
  * @brief MWU_REGION [REGION] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  START;                        /*!< (@ 0x00000000) Description cluster: Start address for region
                                                                    n                                                          */
  __IOM uint32_t  END;                          /*!< (@ 0x00000004) Description cluster: End address of region n               */
  __IM  uint32_t  RESERVED[2];
} MWU_REGION_Type;                              /*!< Size = 16 (0x10)                                                          */


/**
  * @brief MWU_PREGION [PREGION] (Unspecified)
  */
typedef struct {
  __IM  uint32_t  START;                        /*!< (@ 0x00000000) Description cluster: Reserved for future use               */
  __IM  uint32_t  END;                          /*!< (@ 0x00000004) Description cluster: Reserved for future use               */
  __IOM uint32_t  SUBS;                         /*!< (@ 0x00000008) Description cluster: Subregions of region n                */
  __IM  uint32_t  RESERVED;
} MWU_PREGION_Type;                             /*!< Size = 16 (0x10)                                                          */


/**
  * @brief I2S_CONFIG [CONFIG] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  MODE;                         /*!< (@ 0x00000000) I2S mode.                                                  */
  __IOM uint32_t  RXEN;                         /*!< (@ 0x00000004) Reception (RX) enable.                                     */
  __IOM uint32_t  TXEN;                         /*!< (@ 0x00000008) Transmission (TX) enable.                                  */
  __IOM uint32_t  MCKEN;                        /*!< (@ 0x0000000C) Master clock generator enable.                             */
  __IOM uint32_t  MCKFREQ;                      /*!< (@ 0x00000010) Master clock generator frequency.                          */
  __IOM uint32_t  RATIO;                        /*!< (@ 0x00000014) MCK / LRCK ratio.                                          */
  __IOM uint32_t  SWIDTH;                       /*!< (@ 0x00000018) Sample width.                                              */
  __IOM uint32_t  ALIGN;                        /*!< (@ 0x0000001C) Alignment of sample within a frame.                        */
  __IOM uint32_t  FORMAT;                       /*!< (@ 0x00000020) Frame format.                                              */
  __IOM uint32_t  CHANNELS;                     /*!< (@ 0x00000024) Enable channels.                                           */
} I2S_CONFIG_Type;                              /*!< Size = 40 (0x28)                                                          */


/**
  * @brief I2S_RXD [RXD] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) Receive buffer RAM start address.                          */
} I2S_RXD_Type;                                 /*!< Size = 4 (0x4)                                                            */


/**
  * @brief I2S_TXD [TXD] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) Transmit buffer RAM start address.                         */
} I2S_TXD_Type;                                 /*!< Size = 4 (0x4)                                                            */


/**
  * @brief I2S_RXTXD [RXTXD] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000000) Size of RXD and TXD buffers.                               */
} I2S_RXTXD_Type;                               /*!< Size = 4 (0x4)                                                            */


/**
  * @brief I2S_PSEL [PSEL] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  MCK;                          /*!< (@ 0x00000000) Pin select for MCK signal.                                 */
  __IOM uint32_t  SCK;                          /*!< (@ 0x00000004) Pin select for SCK signal.                                 */
  __IOM uint32_t  LRCK;                         /*!< (@ 0x00000008) Pin select for LRCK signal.                                */
  __IOM uint32_t  SDIN;                         /*!< (@ 0x0000000C) Pin select for SDIN signal.                                */
  __IOM uint32_t  SDOUT;                        /*!< (@ 0x00000010) Pin select for SDOUT signal.                               */
} I2S_PSEL_Type;                                /*!< Size = 20 (0x14)                                                          */


/**
  * @brief USBD_HALTED [HALTED] (Unspecified)
  */
typedef struct {
  __IM  uint32_t  EPIN[8];                      /*!< (@ 0x00000000) Description collection: IN endpoint halted status.
                                                                    Can be used as is as response to a GetStatus()
                                                                    request to endpoint.                                       */
  __IM  uint32_t  RESERVED;
  __IM  uint32_t  EPOUT[8];                     /*!< (@ 0x00000024) Description collection: OUT endpoint halted status.
                                                                    Can be used as is as response to a GetStatus()
                                                                    request to endpoint.                                       */
} USBD_HALTED_Type;                             /*!< Size = 68 (0x44)                                                          */


/**
  * @brief USBD_SIZE [SIZE] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  EPOUT[8];                     /*!< (@ 0x00000000) Description collection: Number of bytes received
                                                                    last in the data stage of this OUT endpoint                */
  __IM  uint32_t  ISOOUT;                       /*!< (@ 0x00000020) Number of bytes received last on this ISO OUT
                                                                    data endpoint                                              */
} USBD_SIZE_Type;                               /*!< Size = 36 (0x24)                                                          */


/**
  * @brief USBD_EPIN [EPIN] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) Description cluster: Data pointer                          */
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000004) Description cluster: Maximum number of bytes
                                                                    to transfer                                                */
  __IM  uint32_t  AMOUNT;                       /*!< (@ 0x00000008) Description cluster: Number of bytes transferred
                                                                    in the last transaction                                    */
  __IM  uint32_t  RESERVED[2];
} USBD_EPIN_Type;                               /*!< Size = 20 (0x14)                                                          */


/**
  * @brief USBD_ISOIN [ISOIN] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) Data pointer                                               */
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000004) Maximum number of bytes to transfer                        */
  __IM  uint32_t  AMOUNT;                       /*!< (@ 0x00000008) Number of bytes transferred in the last transaction        */
} USBD_ISOIN_Type;                              /*!< Size = 12 (0xc)                                                           */


/**
  * @brief USBD_EPOUT [EPOUT] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) Description cluster: Data pointer                          */
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000004) Description cluster: Maximum number of bytes
                                                                    to transfer                                                */
  __IM  uint32_t  AMOUNT;                       /*!< (@ 0x00000008) Description cluster: Number of bytes transferred
                                                                    in the last transaction                                    */
  __IM  uint32_t  RESERVED[2];
} USBD_EPOUT_Type;                              /*!< Size = 20 (0x14)                                                          */


/**
  * @brief USBD_ISOOUT [ISOOUT] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) Data pointer                                               */
  __IOM uint32_t  MAXCNT;                       /*!< (@ 0x00000004) Maximum number of bytes to transfer                        */
  __IM  uint32_t  AMOUNT;                       /*!< (@ 0x00000008) Number of bytes transferred in the last transaction        */
} USBD_ISOOUT_Type;                             /*!< Size = 12 (0xc)                                                           */


/**
  * @brief QSPI_READ [READ] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  SRC;                          /*!< (@ 0x00000000) Flash memory source address                                */
  __IOM uint32_t  DST;                          /*!< (@ 0x00000004) RAM destination address                                    */
  __IOM uint32_t  CNT;                          /*!< (@ 0x00000008) Read transfer length                                       */
} QSPI_READ_Type;                               /*!< Size = 12 (0xc)                                                           */


/**
  * @brief QSPI_WRITE [WRITE] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  DST;                          /*!< (@ 0x00000000) Flash destination address                                  */
  __IOM uint32_t  SRC;                          /*!< (@ 0x00000004) RAM source address                                         */
  __IOM uint32_t  CNT;                          /*!< (@ 0x00000008) Write transfer length                                      */
} QSPI_WRITE_Type;                              /*!< Size = 12 (0xc)                                                           */


/**
  * @brief QSPI_ERASE [ERASE] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  PTR;                          /*!< (@ 0x00000000) Start address of flash block to be erased                  */
  __IOM uint32_t  LEN;                          /*!< (@ 0x00000004) Size of block to be erased.                                */
} QSPI_ERASE_Type;                              /*!< Size = 8 (0x8)                                                            */


/**
  * @brief QSPI_PSEL [PSEL] (Unspecified)
  */
typedef struct {
  __IOM uint32_t  SCK;                          /*!< (@ 0x00000000) Pin select for serial clock SCK                            */
  __IOM uint32_t  CSN;                          /*!< (@ 0x00000004) Pin select for chip select signal CSN.                     */
  __IM  uint32_t  RESERVED;
  __IOM uint32_t  IO0;                          /*!< (@ 0x0000000C) Pin select for serial data MOSI/IO0.                       */
  __IOM uint32_t  IO1;                          /*!< (@ 0x00000010) Pin select for serial data MISO/IO1.                       */
  __IOM uint32_t  IO2;                          /*!< (@ 0x00000014) Pin select for serial data IO2.                            */
  __IOM uint32_t  IO3;                          /*!< (@ 0x00000018) Pin select for serial data IO3.                            */
} QSPI_PSEL_Type;                               /*!< Size = 28 (0x1c)                                                          */


/** @} */ /* End of group Device_Peripheral_clusters */


/* =========================================================================================================================== */
/* ================                            Device Specific Peripheral Section                             ================ */
/* =========================================================================================================================== */


/** @addtogroup Device_Peripheral_peripherals
  * @{
  */



/* =========================================================================================================================== */
/* ================                                           FICR                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Factory information configuration registers (FICR)
  */

typedef struct {                                /*!< (@ 0x10000000) FICR Structure                                             */
  __IM  uint32_t  RESERVED[4];
  __IM  uint32_t  CODEPAGESIZE;                 /*!< (@ 0x00000010) Code memory page size                                      */
  __IM  uint32_t  CODESIZE;                     /*!< (@ 0x00000014) Code memory size                                           */
  __IM  uint32_t  RESERVED1[18];
  __IM  uint32_t  DEVICEID[2];                  /*!< (@ 0x00000060) Description collection: Device identifier                  */
  __IM  uint32_t  RESERVED2[6];
  __IM  uint32_t  ER[4];                        /*!< (@ 0x00000080) Description collection: Encryption root, word
                                                                    n                                                          */
  __IM  uint32_t  IR[4];                        /*!< (@ 0x00000090) Description collection: Identity Root, word n              */
  __IM  uint32_t  DEVICEADDRTYPE;               /*!< (@ 0x000000A0) Device address type                                        */
  __IM  uint32_t  DEVICEADDR[2];                /*!< (@ 0x000000A4) Description collection: Device address n                   */
  __IM  uint32_t  RESERVED3[21];
  __IM  FICR_INFO_Type INFO;                    /*!< (@ 0x00000100) Device info                                                */
  __IM  uint32_t  RESERVED4[143];
  __IM  uint32_t  PRODTEST[3];                  /*!< (@ 0x00000350) Description collection: Production test signature
                                                                    n                                                          */
  __IM  uint32_t  RESERVED5[42];
  __IM  FICR_TEMP_Type TEMP;                    /*!< (@ 0x00000404) Registers storing factory TEMP module linearization
                                                                    coefficients                                               */
  __IM  uint32_t  RESERVED6[2];
  __IOM FICR_NFC_Type NFC;                      /*!< (@ 0x00000450) Unspecified                                                */
  __IM  uint32_t  RESERVED7[488];
  __IOM FICR_TRNG90B_Type TRNG90B;              /*!< (@ 0x00000C00) NIST800-90B RNG calibration data                           */
} NRF_FICR_Type;                                /*!< Size = 3104 (0xc20)                                                       */



/* =========================================================================================================================== */
/* ================                                           UICR                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief User information configuration registers (UICR)
  */

typedef struct {                                /*!< (@ 0x10001000) UICR Structure                                             */
  __IM  uint32_t  RESERVED[5];
  __IOM uint32_t  NRFFW[13];                    /*!< (@ 0x00000014) Description collection: Reserved for Nordic firmware
                                                                    design                                                     */
  __IM  uint32_t  RESERVED1[2];
  __IOM uint32_t  NRFHW[12];                    /*!< (@ 0x00000050) Description collection: Reserved for Nordic hardware
                                                                    design                                                     */
  __IOM uint32_t  CUSTOMER[32];                 /*!< (@ 0x00000080) Description collection: Reserved for customer              */
  __IM  uint32_t  RESERVED2[64];
  __IOM uint32_t  PSELRESET[2];                 /*!< (@ 0x00000200) Description collection: Mapping of the nRESET
                                                                    function (see POWER chapter for details)                   */
  __IOM uint32_t  APPROTECT;                    /*!< (@ 0x00000208) Access port protection                                     */
  __IOM uint32_t  NFCPINS;                      /*!< (@ 0x0000020C) Setting of pins dedicated to NFC functionality:
                                                                    NFC antenna or GPIO                                        */
  __IOM uint32_t  DEBUGCTRL;                    /*!< (@ 0x00000210) Processor debug control                                    */
  __IM  uint32_t  RESERVED3[60];
  __IOM uint32_t  REGOUT0;                      /*!< (@ 0x00000304) Output voltage from REG0 regulator stage. The
                                                                    maximum output voltage from this stage is
                                                                    given as VDDH - V_VDDH-VDD.                                */
} NRF_UICR_Type;                                /*!< Size = 776 (0x308)                                                        */



/* =========================================================================================================================== */
/* ================                                         APPROTECT                                         ================ */
/* =========================================================================================================================== */


/**
  * @brief Access Port Protection (APPROTECT)
  */

typedef struct {                                /*!< (@ 0x40000000) APPROTECT Structure                                        */
  __IM  uint32_t  RESERVED[340];
  __IOM uint32_t  FORCEPROTECT;                 /*!< (@ 0x00000550) Software force enable APPROTECT mechanism until
                                                                    next reset.                                                */
  __IM  uint32_t  RESERVED1;
  __IOM uint32_t  DISABLE;                      /*!< (@ 0x00000558) Software disable APPROTECT mechanism                       */
} NRF_APPROTECT_Type;                           /*!< Size = 1372 (0x55c)                                                       */



/* =========================================================================================================================== */
/* ================                                           CLOCK                                           ================ */
/* =========================================================================================================================== */


/**
  * @brief Clock control (CLOCK)
  */

typedef struct {                                /*!< (@ 0x40000000) CLOCK Structure                                            */
  __OM  uint32_t  TASKS_HFCLKSTART;             /*!< (@ 0x00000000) Start HFXO crystal oscillator                              */
  __OM  uint32_t  TASKS_HFCLKSTOP;              /*!< (@ 0x00000004) Stop HFXO crystal oscillator                               */
  __OM  uint32_t  TASKS_LFCLKSTART;             /*!< (@ 0x00000008) Start LFCLK                                                */
  __OM  uint32_t  TASKS_LFCLKSTOP;              /*!< (@ 0x0000000C) Stop LFCLK                                                 */
  __OM  uint32_t  TASKS_CAL;                    /*!< (@ 0x00000010) Start calibration of LFRC                                  */
  __OM  uint32_t  TASKS_CTSTART;                /*!< (@ 0x00000014) Start calibration timer                                    */
  __OM  uint32_t  TASKS_CTSTOP;                 /*!< (@ 0x00000018) Stop calibration timer                                     */
  __IM  uint32_t  RESERVED[57];
  __IOM uint32_t  EVENTS_HFCLKSTARTED;          /*!< (@ 0x00000100) HFXO crystal oscillator started                            */
  __IOM uint32_t  EVENTS_LFCLKSTARTED;          /*!< (@ 0x00000104) LFCLK started                                              */
  __IM  uint32_t  RESERVED1;
  __IOM uint32_t  EVENTS_DONE;                  /*!< (@ 0x0000010C) Calibration of LFRC completed                              */
  __IOM uint32_t  EVENTS_CTTO;                  /*!< (@ 0x00000110) Calibration timer timeout                                  */
  __IM  uint32_t  RESERVED2[5];
  __IOM uint32_t  EVENTS_CTSTARTED;             /*!< (@ 0x00000128) Calibration timer has been started and is ready
                                                                    to process new tasks                                       */
  __IOM uint32_t  EVENTS_CTSTOPPED;             /*!< (@ 0x0000012C) Calibration timer has been stopped and is ready
                                                                    to process new tasks                                       */
  __IM  uint32_t  RESERVED3[117];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED4[63];
  __IM  uint32_t  HFCLKRUN;                     /*!< (@ 0x00000408) Status indicating that HFCLKSTART task has been
                                                                    triggered                                                  */
  __IM  uint32_t  HFCLKSTAT;                    /*!< (@ 0x0000040C) HFCLK status                                               */
  __IM  uint32_t  RESERVED5;
  __IM  uint32_t  LFCLKRUN;                     /*!< (@ 0x00000414) Status indicating that LFCLKSTART task has been
                                                                    triggered                                                  */
  __IM  uint32_t  LFCLKSTAT;                    /*!< (@ 0x00000418) LFCLK status                                               */
  __IM  uint32_t  LFCLKSRCCOPY;                 /*!< (@ 0x0000041C) Copy of LFCLKSRC register, set when LFCLKSTART
                                                                    task was triggered                                         */
  __IM  uint32_t  RESERVED6[62];
  __IOM uint32_t  LFCLKSRC;                     /*!< (@ 0x00000518) Clock source for the LFCLK                                 */
  __IM  uint32_t  RESERVED7[3];
  __IOM uint32_t  HFXODEBOUNCE;                 /*!< (@ 0x00000528) HFXO debounce time. The HFXO is started by triggering
                                                                    the TASKS_HFCLKSTART task.                                 */
  __IM  uint32_t  RESERVED8[3];
  __IOM uint32_t  CTIV;                         /*!< (@ 0x00000538) Calibration timer interval                                 */
  __IM  uint32_t  RESERVED9[8];
  __IOM uint32_t  TRACECONFIG;                  /*!< (@ 0x0000055C) Clocking options for the trace port debug interface        */
  __IM  uint32_t  RESERVED10[21];
  __IOM uint32_t  LFRCMODE;                     /*!< (@ 0x000005B4) LFRC mode configuration                                    */
} NRF_CLOCK_Type;                               /*!< Size = 1464 (0x5b8)                                                       */



/* =========================================================================================================================== */
/* ================                                           POWER                                           ================ */
/* =========================================================================================================================== */


/**
  * @brief Power control (POWER)
  */

typedef struct {                                /*!< (@ 0x40000000) POWER Structure                                            */
  __IM  uint32_t  RESERVED[30];
  __OM  uint32_t  TASKS_CONSTLAT;               /*!< (@ 0x00000078) Enable Constant Latency mode                               */
  __OM  uint32_t  TASKS_LOWPWR;                 /*!< (@ 0x0000007C) Enable Low-power mode (variable latency)                   */
  __IM  uint32_t  RESERVED1[34];
  __IOM uint32_t  EVENTS_POFWARN;               /*!< (@ 0x00000108) Power failure warning                                      */
  __IM  uint32_t  RESERVED2[2];
  __IOM uint32_t  EVENTS_SLEEPENTER;            /*!< (@ 0x00000114) CPU entered WFI/WFE sleep                                  */
  __IOM uint32_t  EVENTS_SLEEPEXIT;             /*!< (@ 0x00000118) CPU exited WFI/WFE sleep                                   */
  __IOM uint32_t  EVENTS_USBDETECTED;           /*!< (@ 0x0000011C) Voltage supply detected on VBUS                            */
  __IOM uint32_t  EVENTS_USBREMOVED;            /*!< (@ 0x00000120) Voltage supply removed from VBUS                           */
  __IOM uint32_t  EVENTS_USBPWRRDY;             /*!< (@ 0x00000124) USB 3.3 V supply ready                                     */
  __IM  uint32_t  RESERVED3[119];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED4[61];
  __IOM uint32_t  RESETREAS;                    /*!< (@ 0x00000400) Reset reason                                               */
  __IM  uint32_t  RESERVED5[9];
  __IM  uint32_t  RAMSTATUS;                    /*!< (@ 0x00000428) Deprecated register - RAM status register                  */
  __IM  uint32_t  RESERVED6[3];
  __IM  uint32_t  USBREGSTATUS;                 /*!< (@ 0x00000438) USB supply status                                          */
  __IM  uint32_t  RESERVED7[49];
  __OM  uint32_t  SYSTEMOFF;                    /*!< (@ 0x00000500) System OFF register                                        */
  __IM  uint32_t  RESERVED8[3];
  __IOM uint32_t  POFCON;                       /*!< (@ 0x00000510) Power-fail comparator configuration                        */
  __IM  uint32_t  RESERVED9[2];
  __IOM uint32_t  GPREGRET;                     /*!< (@ 0x0000051C) General purpose retention register                         */
  __IOM uint32_t  GPREGRET2;                    /*!< (@ 0x00000520) General purpose retention register                         */
  __IM  uint32_t  RESERVED10[21];
  __IOM uint32_t  DCDCEN;                       /*!< (@ 0x00000578) Enable DC/DC converter for REG1 stage                      */
  __IM  uint32_t  RESERVED11;
  __IOM uint32_t  DCDCEN0;                      /*!< (@ 0x00000580) Enable DC/DC converter for REG0 stage                      */
  __IM  uint32_t  RESERVED12[47];
  __IM  uint32_t  MAINREGSTATUS;                /*!< (@ 0x00000640) Main supply status                                         */
  __IM  uint32_t  RESERVED13[175];
  __IOM POWER_RAM_Type RAM[9];                  /*!< (@ 0x00000900) Unspecified                                                */
} NRF_POWER_Type;                               /*!< Size = 2448 (0x990)                                                       */



/* =========================================================================================================================== */
/* ================                                            P0                                             ================ */
/* =========================================================================================================================== */


/**
  * @brief GPIO Port 1 (P0)
  */

typedef struct {                                /*!< (@ 0x50000000) P0 Structure                                               */
  __IM  uint32_t  RESERVED[321];
  __IOM uint32_t  OUT;                          /*!< (@ 0x00000504) Write GPIO port                                            */
  __IOM uint32_t  OUTSET;                       /*!< (@ 0x00000508) Set individual bits in GPIO port                           */
  __IOM uint32_t  OUTCLR;                       /*!< (@ 0x0000050C) Clear individual bits in GPIO port                         */
  __IM  uint32_t  IN;                           /*!< (@ 0x00000510) Read GPIO port                                             */
  __IOM uint32_t  DIR;                          /*!< (@ 0x00000514) Direction of GPIO pins                                     */
  __IOM uint32_t  DIRSET;                       /*!< (@ 0x00000518) DIR set register                                           */
  __IOM uint32_t  DIRCLR;                       /*!< (@ 0x0000051C) DIR clear register                                         */
  __IOM uint32_t  LATCH;                        /*!< (@ 0x00000520) Latch register indicating what GPIO pins that
                                                                    have met the criteria set in the PIN_CNF[n].SENSE
                                                                    registers                                                  */
  __IOM uint32_t  DETECTMODE;                   /*!< (@ 0x00000524) Select between default DETECT signal behavior
                                                                    and LDETECT mode                                           */
  __IM  uint32_t  RESERVED1[118];
  __IOM uint32_t  PIN_CNF[32];                  /*!< (@ 0x00000700) Description collection: Configuration of GPIO
                                                                    pins                                                       */
} NRF_GPIO_Type;                                /*!< Size = 1920 (0x780)                                                       */



/* =========================================================================================================================== */
/* ================                                           RADIO                                           ================ */
/* =========================================================================================================================== */


/**
  * @brief 2.4 GHz radio (RADIO)
  */

typedef struct {                                /*!< (@ 0x40001000) RADIO Structure                                            */
  __OM  uint32_t  TASKS_TXEN;                   /*!< (@ 0x00000000) Enable RADIO in TX mode                                    */
  __OM  uint32_t  TASKS_RXEN;                   /*!< (@ 0x00000004) Enable RADIO in RX mode                                    */
  __OM  uint32_t  TASKS_START;                  /*!< (@ 0x00000008) Start RADIO                                                */
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x0000000C) Stop RADIO                                                 */
  __OM  uint32_t  TASKS_DISABLE;                /*!< (@ 0x00000010) Disable RADIO                                              */
  __OM  uint32_t  TASKS_RSSISTART;              /*!< (@ 0x00000014) Start the RSSI and take one single sample of
                                                                    the receive signal strength                                */
  __OM  uint32_t  TASKS_RSSISTOP;               /*!< (@ 0x00000018) Stop the RSSI measurement                                  */
  __OM  uint32_t  TASKS_BCSTART;                /*!< (@ 0x0000001C) Start the bit counter                                      */
  __OM  uint32_t  TASKS_BCSTOP;                 /*!< (@ 0x00000020) Stop the bit counter                                       */
  __OM  uint32_t  TASKS_EDSTART;                /*!< (@ 0x00000024) Start the energy detect measurement used in IEEE
                                                                    802.15.4 mode                                              */
  __OM  uint32_t  TASKS_EDSTOP;                 /*!< (@ 0x00000028) Stop the energy detect measurement                         */
  __OM  uint32_t  TASKS_CCASTART;               /*!< (@ 0x0000002C) Start the clear channel assessment used in IEEE
                                                                    802.15.4 mode                                              */
  __OM  uint32_t  TASKS_CCASTOP;                /*!< (@ 0x00000030) Stop the clear channel assessment                          */
  __IM  uint32_t  RESERVED[51];
  __IOM uint32_t  EVENTS_READY;                 /*!< (@ 0x00000100) RADIO has ramped up and is ready to be started             */
  __IOM uint32_t  EVENTS_ADDRESS;               /*!< (@ 0x00000104) Address sent or received                                   */
  __IOM uint32_t  EVENTS_PAYLOAD;               /*!< (@ 0x00000108) Packet payload sent or received                            */
  __IOM uint32_t  EVENTS_END;                   /*!< (@ 0x0000010C) Packet sent or received                                    */
  __IOM uint32_t  EVENTS_DISABLED;              /*!< (@ 0x00000110) RADIO has been disabled                                    */
  __IOM uint32_t  EVENTS_DEVMATCH;              /*!< (@ 0x00000114) A device address match occurred on the last received
                                                                    packet                                                     */
  __IOM uint32_t  EVENTS_DEVMISS;               /*!< (@ 0x00000118) No device address match occurred on the last
                                                                    received packet                                            */
  __IOM uint32_t  EVENTS_RSSIEND;               /*!< (@ 0x0000011C) Sampling of receive signal strength complete               */
  __IM  uint32_t  RESERVED1[2];
  __IOM uint32_t  EVENTS_BCMATCH;               /*!< (@ 0x00000128) Bit counter reached bit count value                        */
  __IM  uint32_t  RESERVED2;
  __IOM uint32_t  EVENTS_CRCOK;                 /*!< (@ 0x00000130) Packet received with CRC ok                                */
  __IOM uint32_t  EVENTS_CRCERROR;              /*!< (@ 0x00000134) Packet received with CRC error                             */
  __IOM uint32_t  EVENTS_FRAMESTART;            /*!< (@ 0x00000138) IEEE 802.15.4 length field received                        */
  __IOM uint32_t  EVENTS_EDEND;                 /*!< (@ 0x0000013C) Sampling of energy detection complete. A new
                                                                    ED sample is ready for readout from the
                                                                    RADIO.EDSAMPLE register.                                   */
  __IOM uint32_t  EVENTS_EDSTOPPED;             /*!< (@ 0x00000140) The sampling of energy detection has stopped               */
  __IOM uint32_t  EVENTS_CCAIDLE;               /*!< (@ 0x00000144) Wireless medium in idle - clear to send                    */
  __IOM uint32_t  EVENTS_CCABUSY;               /*!< (@ 0x00000148) Wireless medium busy - do not send                         */
  __IOM uint32_t  EVENTS_CCASTOPPED;            /*!< (@ 0x0000014C) The CCA has stopped                                        */
  __IOM uint32_t  EVENTS_RATEBOOST;             /*!< (@ 0x00000150) Ble_LR CI field received, receive mode is changed
                                                                    from Ble_LR125Kbit to Ble_LR500Kbit.                       */
  __IOM uint32_t  EVENTS_TXREADY;               /*!< (@ 0x00000154) RADIO has ramped up and is ready to be started
                                                                    TX path                                                    */
  __IOM uint32_t  EVENTS_RXREADY;               /*!< (@ 0x00000158) RADIO has ramped up and is ready to be started
                                                                    RX path                                                    */
  __IOM uint32_t  EVENTS_MHRMATCH;              /*!< (@ 0x0000015C) MAC header match found                                     */
  __IM  uint32_t  RESERVED3[2];
  __IOM uint32_t  EVENTS_SYNC;                  /*!< (@ 0x00000168) Preamble indicator.                                        */
  __IOM uint32_t  EVENTS_PHYEND;                /*!< (@ 0x0000016C) Generated in Ble_LR125Kbit, Ble_LR500Kbit and
                                                                    Ieee802154_250Kbit modes when last bit is
                                                                    sent on air.                                               */
  __IM  uint32_t  RESERVED4[36];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED5[64];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED6[61];
  __IM  uint32_t  CRCSTATUS;                    /*!< (@ 0x00000400) CRC status                                                 */
  __IM  uint32_t  RESERVED7;
  __IM  uint32_t  RXMATCH;                      /*!< (@ 0x00000408) Received address                                           */
  __IM  uint32_t  RXCRC;                        /*!< (@ 0x0000040C) CRC field of previously received packet                    */
  __IM  uint32_t  DAI;                          /*!< (@ 0x00000410) Device address match index                                 */
  __IM  uint32_t  PDUSTAT;                      /*!< (@ 0x00000414) Payload status                                             */
  __IM  uint32_t  RESERVED8[59];
  __IOM uint32_t  PACKETPTR;                    /*!< (@ 0x00000504) Packet pointer                                             */
  __IOM uint32_t  FREQUENCY;                    /*!< (@ 0x00000508) Frequency                                                  */
  __IOM uint32_t  TXPOWER;                      /*!< (@ 0x0000050C) Output power                                               */
  __IOM uint32_t  MODE;                         /*!< (@ 0x00000510) Data rate and modulation                                   */
  __IOM uint32_t  PCNF0;                        /*!< (@ 0x00000514) Packet configuration register 0                            */
  __IOM uint32_t  PCNF1;                        /*!< (@ 0x00000518) Packet configuration register 1                            */
  __IOM uint32_t  BASE0;                        /*!< (@ 0x0000051C) Base address 0                                             */
  __IOM uint32_t  BASE1;                        /*!< (@ 0x00000520) Base address 1                                             */
  __IOM uint32_t  PREFIX0;                      /*!< (@ 0x00000524) Prefixes bytes for logical addresses 0-3                   */
  __IOM uint32_t  PREFIX1;                      /*!< (@ 0x00000528) Prefixes bytes for logical addresses 4-7                   */
  __IOM uint32_t  TXADDRESS;                    /*!< (@ 0x0000052C) Transmit address select                                    */
  __IOM uint32_t  RXADDRESSES;                  /*!< (@ 0x00000530) Receive address select                                     */
  __IOM uint32_t  CRCCNF;                       /*!< (@ 0x00000534) CRC configuration                                          */
  __IOM uint32_t  CRCPOLY;                      /*!< (@ 0x00000538) CRC polynomial                                             */
  __IOM uint32_t  CRCINIT;                      /*!< (@ 0x0000053C) CRC initial value                                          */
  __IM  uint32_t  RESERVED9;
  __IOM uint32_t  TIFS;                         /*!< (@ 0x00000544) Interframe spacing in us                                   */
  __IM  uint32_t  RSSISAMPLE;                   /*!< (@ 0x00000548) RSSI sample                                                */
  __IM  uint32_t  RESERVED10;
  __IM  uint32_t  STATE;                        /*!< (@ 0x00000550) Current radio state                                        */
  __IOM uint32_t  DATAWHITEIV;                  /*!< (@ 0x00000554) Data whitening initial value                               */
  __IM  uint32_t  RESERVED11[2];
  __IOM uint32_t  BCC;                          /*!< (@ 0x00000560) Bit counter compare                                        */
  __IM  uint32_t  RESERVED12[39];
  __IOM uint32_t  DAB[8];                       /*!< (@ 0x00000600) Description collection: Device address base segment
                                                                    n                                                          */
  __IOM uint32_t  DAP[8];                       /*!< (@ 0x00000620) Description collection: Device address prefix
                                                                    n                                                          */
  __IOM uint32_t  DACNF;                        /*!< (@ 0x00000640) Device address match configuration                         */
  __IOM uint32_t  MHRMATCHCONF;                 /*!< (@ 0x00000644) Search pattern configuration                               */
  __IOM uint32_t  MHRMATCHMAS;                  /*!< (@ 0x00000648) Pattern mask                                               */
  __IM  uint32_t  RESERVED13;
  __IOM uint32_t  MODECNF0;                     /*!< (@ 0x00000650) Radio mode configuration register 0                        */
  __IM  uint32_t  RESERVED14[3];
  __IOM uint32_t  SFD;                          /*!< (@ 0x00000660) IEEE 802.15.4 start of frame delimiter                     */
  __IOM uint32_t  EDCNT;                        /*!< (@ 0x00000664) IEEE 802.15.4 energy detect loop count                     */
  __IOM uint32_t  EDSAMPLE;                     /*!< (@ 0x00000668) IEEE 802.15.4 energy detect level                          */
  __IOM uint32_t  CCACTRL;                      /*!< (@ 0x0000066C) IEEE 802.15.4 clear channel assessment control             */
  __IM  uint32_t  RESERVED15[611];
  __IOM uint32_t  POWER;                        /*!< (@ 0x00000FFC) Peripheral power control                                   */
} NRF_RADIO_Type;                               /*!< Size = 4096 (0x1000)                                                      */



/* =========================================================================================================================== */
/* ================                                           UART0                                           ================ */
/* =========================================================================================================================== */


/**
  * @brief Universal Asynchronous Receiver/Transmitter (UART0)
  */

typedef struct {                                /*!< (@ 0x40002000) UART0 Structure                                            */
  __OM  uint32_t  TASKS_STARTRX;                /*!< (@ 0x00000000) Start UART receiver                                        */
  __OM  uint32_t  TASKS_STOPRX;                 /*!< (@ 0x00000004) Stop UART receiver                                         */
  __OM  uint32_t  TASKS_STARTTX;                /*!< (@ 0x00000008) Start UART transmitter                                     */
  __OM  uint32_t  TASKS_STOPTX;                 /*!< (@ 0x0000000C) Stop UART transmitter                                      */
  __IM  uint32_t  RESERVED[3];
  __OM  uint32_t  TASKS_SUSPEND;                /*!< (@ 0x0000001C) Suspend UART                                               */
  __IM  uint32_t  RESERVED1[56];
  __IOM uint32_t  EVENTS_CTS;                   /*!< (@ 0x00000100) CTS is activated (set low). Clear To Send.                 */
  __IOM uint32_t  EVENTS_NCTS;                  /*!< (@ 0x00000104) CTS is deactivated (set high). Not Clear To Send.          */
  __IOM uint32_t  EVENTS_RXDRDY;                /*!< (@ 0x00000108) Data received in RXD                                       */
  __IM  uint32_t  RESERVED2[4];
  __IOM uint32_t  EVENTS_TXDRDY;                /*!< (@ 0x0000011C) Data sent from TXD                                         */
  __IM  uint32_t  RESERVED3;
  __IOM uint32_t  EVENTS_ERROR;                 /*!< (@ 0x00000124) Error detected                                             */
  __IM  uint32_t  RESERVED4[7];
  __IOM uint32_t  EVENTS_RXTO;                  /*!< (@ 0x00000144) Receiver timeout                                           */
  __IM  uint32_t  RESERVED5[46];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED6[64];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED7[93];
  __IOM uint32_t  ERRORSRC;                     /*!< (@ 0x00000480) Error source                                               */
  __IM  uint32_t  RESERVED8[31];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable UART                                                */
  __IM  uint32_t  RESERVED9;
  __IOM UART_PSEL_Type PSEL;                    /*!< (@ 0x00000508) Unspecified                                                */
  __IM  uint32_t  RXD;                          /*!< (@ 0x00000518) RXD register                                               */
  __OM  uint32_t  TXD;                          /*!< (@ 0x0000051C) TXD register                                               */
  __IM  uint32_t  RESERVED10;
  __IOM uint32_t  BAUDRATE;                     /*!< (@ 0x00000524) Baud rate. Accuracy depends on the HFCLK source
                                                                    selected.                                                  */
  __IM  uint32_t  RESERVED11[17];
  __IOM uint32_t  CONFIG;                       /*!< (@ 0x0000056C) Configuration of parity and hardware flow control          */
} NRF_UART_Type;                                /*!< Size = 1392 (0x570)                                                       */



/* =========================================================================================================================== */
/* ================                                          UARTE0                                           ================ */
/* =========================================================================================================================== */


/**
  * @brief UART with EasyDMA 0 (UARTE0)
  */

typedef struct {                                /*!< (@ 0x40002000) UARTE0 Structure                                           */
  __OM  uint32_t  TASKS_STARTRX;                /*!< (@ 0x00000000) Start UART receiver                                        */
  __OM  uint32_t  TASKS_STOPRX;                 /*!< (@ 0x00000004) Stop UART receiver                                         */
  __OM  uint32_t  TASKS_STARTTX;                /*!< (@ 0x00000008) Start UART transmitter                                     */
  __OM  uint32_t  TASKS_STOPTX;                 /*!< (@ 0x0000000C) Stop UART transmitter                                      */
  __IM  uint32_t  RESERVED[7];
  __OM  uint32_t  TASKS_FLUSHRX;                /*!< (@ 0x0000002C) Flush RX FIFO into RX buffer                               */
  __IM  uint32_t  RESERVED1[52];
  __IOM uint32_t  EVENTS_CTS;                   /*!< (@ 0x00000100) CTS is activated (set low). Clear To Send.                 */
  __IOM uint32_t  EVENTS_NCTS;                  /*!< (@ 0x00000104) CTS is deactivated (set high). Not Clear To Send.          */
  __IOM uint32_t  EVENTS_RXDRDY;                /*!< (@ 0x00000108) Data received in RXD (but potentially not yet
                                                                    transferred to Data RAM)                                   */
  __IM  uint32_t  RESERVED2;
  __IOM uint32_t  EVENTS_ENDRX;                 /*!< (@ 0x00000110) Receive buffer is filled up                                */
  __IM  uint32_t  RESERVED3[2];
  __IOM uint32_t  EVENTS_TXDRDY;                /*!< (@ 0x0000011C) Data sent from TXD                                         */
  __IOM uint32_t  EVENTS_ENDTX;                 /*!< (@ 0x00000120) Last TX byte transmitted                                   */
  __IOM uint32_t  EVENTS_ERROR;                 /*!< (@ 0x00000124) Error detected                                             */
  __IM  uint32_t  RESERVED4[7];
  __IOM uint32_t  EVENTS_RXTO;                  /*!< (@ 0x00000144) Receiver timeout                                           */
  __IM  uint32_t  RESERVED5;
  __IOM uint32_t  EVENTS_RXSTARTED;             /*!< (@ 0x0000014C) UART receiver has started                                  */
  __IOM uint32_t  EVENTS_TXSTARTED;             /*!< (@ 0x00000150) UART transmitter has started                               */
  __IM  uint32_t  RESERVED6;
  __IOM uint32_t  EVENTS_TXSTOPPED;             /*!< (@ 0x00000158) Transmitter stopped                                        */
  __IM  uint32_t  RESERVED7[41];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED8[63];
  __IOM uint32_t  INTEN;                        /*!< (@ 0x00000300) Enable or disable interrupt                                */
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED9[93];
  __IOM uint32_t  ERRORSRC;                     /*!< (@ 0x00000480) Error source This register is read/write one
                                                                    to clear.                                                  */
  __IM  uint32_t  RESERVED10[31];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable UART                                                */
  __IM  uint32_t  RESERVED11;
  __IOM UARTE_PSEL_Type PSEL;                   /*!< (@ 0x00000508) Unspecified                                                */
  __IM  uint32_t  RESERVED12[3];
  __IOM uint32_t  BAUDRATE;                     /*!< (@ 0x00000524) Baud rate. Accuracy depends on the HFCLK source
                                                                    selected.                                                  */
  __IM  uint32_t  RESERVED13[3];
  __IOM UARTE_RXD_Type RXD;                     /*!< (@ 0x00000534) RXD EasyDMA channel                                        */
  __IM  uint32_t  RESERVED14;
  __IOM UARTE_TXD_Type TXD;                     /*!< (@ 0x00000544) TXD EasyDMA channel                                        */
  __IM  uint32_t  RESERVED15[7];
  __IOM uint32_t  CONFIG;                       /*!< (@ 0x0000056C) Configuration of parity and hardware flow control          */
} NRF_UARTE_Type;                               /*!< Size = 1392 (0x570)                                                       */



/* =========================================================================================================================== */
/* ================                                           SPI0                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Serial Peripheral Interface 0 (SPI0)
  */

typedef struct {                                /*!< (@ 0x40003000) SPI0 Structure                                             */
  __IM  uint32_t  RESERVED[66];
  __IOM uint32_t  EVENTS_READY;                 /*!< (@ 0x00000108) TXD byte sent and RXD byte received                        */
  __IM  uint32_t  RESERVED1[126];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED2[125];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable SPI                                                 */
  __IM  uint32_t  RESERVED3;
  __IOM SPI_PSEL_Type PSEL;                     /*!< (@ 0x00000508) Unspecified                                                */
  __IM  uint32_t  RESERVED4;
  __IM  uint32_t  RXD;                          /*!< (@ 0x00000518) RXD register                                               */
  __IOM uint32_t  TXD;                          /*!< (@ 0x0000051C) TXD register                                               */
  __IM  uint32_t  RESERVED5;
  __IOM uint32_t  FREQUENCY;                    /*!< (@ 0x00000524) SPI frequency. Accuracy depends on the HFCLK
                                                                    source selected.                                           */
  __IM  uint32_t  RESERVED6[11];
  __IOM uint32_t  CONFIG;                       /*!< (@ 0x00000554) Configuration register                                     */
} NRF_SPI_Type;                                 /*!< Size = 1368 (0x558)                                                       */



/* =========================================================================================================================== */
/* ================                                           SPIM0                                           ================ */
/* =========================================================================================================================== */


/**
  * @brief Serial Peripheral Interface Master with EasyDMA 0 (SPIM0)
  */

typedef struct {                                /*!< (@ 0x40003000) SPIM0 Structure                                            */
  __IM  uint32_t  RESERVED[4];
  __OM  uint32_t  TASKS_START;                  /*!< (@ 0x00000010) Start SPI transaction                                      */
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000014) Stop SPI transaction                                       */
  __IM  uint32_t  RESERVED1;
  __OM  uint32_t  TASKS_SUSPEND;                /*!< (@ 0x0000001C) Suspend SPI transaction                                    */
  __OM  uint32_t  TASKS_RESUME;                 /*!< (@ 0x00000020) Resume SPI transaction                                     */
  __IM  uint32_t  RESERVED2[56];
  __IOM uint32_t  EVENTS_STOPPED;               /*!< (@ 0x00000104) SPI transaction has stopped                                */
  __IM  uint32_t  RESERVED3[2];
  __IOM uint32_t  EVENTS_ENDRX;                 /*!< (@ 0x00000110) End of RXD buffer reached                                  */
  __IM  uint32_t  RESERVED4;
  __IOM uint32_t  EVENTS_END;                   /*!< (@ 0x00000118) End of RXD buffer and TXD buffer reached                   */
  __IM  uint32_t  RESERVED5;
  __IOM uint32_t  EVENTS_ENDTX;                 /*!< (@ 0x00000120) End of TXD buffer reached                                  */
  __IM  uint32_t  RESERVED6[10];
  __IOM uint32_t  EVENTS_STARTED;               /*!< (@ 0x0000014C) Transaction started                                        */
  __IM  uint32_t  RESERVED7[44];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED8[64];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED9[61];
  __IOM uint32_t  STALLSTAT;                    /*!< (@ 0x00000400) Stall status for EasyDMA RAM accesses. The fields
                                                                    in this register are set to STALL by hardware
                                                                    whenever a stall occurs and can be cleared
                                                                    (set to NOSTALL) by the CPU.                               */
  __IM  uint32_t  RESERVED10[63];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable SPIM                                                */
  __IM  uint32_t  RESERVED11;
  __IOM SPIM_PSEL_Type PSEL;                    /*!< (@ 0x00000508) Unspecified                                                */
  __IM  uint32_t  RESERVED12[3];
  __IOM uint32_t  FREQUENCY;                    /*!< (@ 0x00000524) SPI frequency. Accuracy depends on the HFCLK
                                                                    source selected.                                           */
  __IM  uint32_t  RESERVED13[3];
  __IOM SPIM_RXD_Type RXD;                      /*!< (@ 0x00000534) RXD EasyDMA channel                                        */
  __IOM SPIM_TXD_Type TXD;                      /*!< (@ 0x00000544) TXD EasyDMA channel                                        */
  __IOM uint32_t  CONFIG;                       /*!< (@ 0x00000554) Configuration register                                     */
  __IM  uint32_t  RESERVED14[2];
  __IOM SPIM_IFTIMING_Type IFTIMING;            /*!< (@ 0x00000560) Unspecified                                                */
  __IOM uint32_t  CSNPOL;                       /*!< (@ 0x00000568) Polarity of CSN output                                     */
  __IOM uint32_t  PSELDCX;                      /*!< (@ 0x0000056C) Pin select for DCX signal                                  */
  __IOM uint32_t  DCXCNT;                       /*!< (@ 0x00000570) DCX configuration                                          */
  __IM  uint32_t  RESERVED15[19];
  __IOM uint32_t  ORC;                          /*!< (@ 0x000005C0) Byte transmitted after TXD.MAXCNT bytes have
                                                                    been transmitted in the case when RXD.MAXCNT
                                                                    is greater than TXD.MAXCNT                                 */
} NRF_SPIM_Type;                                /*!< Size = 1476 (0x5c4)                                                       */



/* =========================================================================================================================== */
/* ================                                           SPIS0                                           ================ */
/* =========================================================================================================================== */


/**
  * @brief SPI Slave 0 (SPIS0)
  */

typedef struct {                                /*!< (@ 0x40003000) SPIS0 Structure                                            */
  __IM  uint32_t  RESERVED[9];
  __OM  uint32_t  TASKS_ACQUIRE;                /*!< (@ 0x00000024) Acquire SPI semaphore                                      */
  __OM  uint32_t  TASKS_RELEASE;                /*!< (@ 0x00000028) Release SPI semaphore, enabling the SPI slave
                                                                    to acquire it                                              */
  __IM  uint32_t  RESERVED1[54];
  __IOM uint32_t  EVENTS_END;                   /*!< (@ 0x00000104) Granted transaction completed                              */
  __IM  uint32_t  RESERVED2[2];
  __IOM uint32_t  EVENTS_ENDRX;                 /*!< (@ 0x00000110) End of RXD buffer reached                                  */
  __IM  uint32_t  RESERVED3[5];
  __IOM uint32_t  EVENTS_ACQUIRED;              /*!< (@ 0x00000128) Semaphore acquired                                         */
  __IM  uint32_t  RESERVED4[53];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED5[64];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED6[61];
  __IM  uint32_t  SEMSTAT;                      /*!< (@ 0x00000400) Semaphore status register                                  */
  __IM  uint32_t  RESERVED7[15];
  __IOM uint32_t  STATUS;                       /*!< (@ 0x00000440) Status from last transaction                               */
  __IM  uint32_t  RESERVED8[47];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable SPI slave                                           */
  __IM  uint32_t  RESERVED9;
  __IOM SPIS_PSEL_Type PSEL;                    /*!< (@ 0x00000508) Unspecified                                                */
  __IM  uint32_t  RESERVED10[7];
  __IOM SPIS_RXD_Type RXD;                      /*!< (@ 0x00000534) Unspecified                                                */
  __IOM SPIS_TXD_Type TXD;                      /*!< (@ 0x00000544) Unspecified                                                */
  __IOM uint32_t  CONFIG;                       /*!< (@ 0x00000554) Configuration register                                     */
  __IM  uint32_t  RESERVED11;
  __IOM uint32_t  DEF;                          /*!< (@ 0x0000055C) Default character. Character clocked out in case
                                                                    of an ignored transaction.                                 */
  __IM  uint32_t  RESERVED12[24];
  __IOM uint32_t  ORC;                          /*!< (@ 0x000005C0) Over-read character                                        */
} NRF_SPIS_Type;                                /*!< Size = 1476 (0x5c4)                                                       */



/* =========================================================================================================================== */
/* ================                                           TWI0                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief I2C compatible Two-Wire Interface 0 (TWI0)
  */

typedef struct {                                /*!< (@ 0x40003000) TWI0 Structure                                             */
  __OM  uint32_t  TASKS_STARTRX;                /*!< (@ 0x00000000) Start TWI receive sequence                                 */
  __IM  uint32_t  RESERVED;
  __OM  uint32_t  TASKS_STARTTX;                /*!< (@ 0x00000008) Start TWI transmit sequence                                */
  __IM  uint32_t  RESERVED1[2];
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000014) Stop TWI transaction                                       */
  __IM  uint32_t  RESERVED2;
  __OM  uint32_t  TASKS_SUSPEND;                /*!< (@ 0x0000001C) Suspend TWI transaction                                    */
  __OM  uint32_t  TASKS_RESUME;                 /*!< (@ 0x00000020) Resume TWI transaction                                     */
  __IM  uint32_t  RESERVED3[56];
  __IOM uint32_t  EVENTS_STOPPED;               /*!< (@ 0x00000104) TWI stopped                                                */
  __IOM uint32_t  EVENTS_RXDREADY;              /*!< (@ 0x00000108) TWI RXD byte received                                      */
  __IM  uint32_t  RESERVED4[4];
  __IOM uint32_t  EVENTS_TXDSENT;               /*!< (@ 0x0000011C) TWI TXD byte sent                                          */
  __IM  uint32_t  RESERVED5;
  __IOM uint32_t  EVENTS_ERROR;                 /*!< (@ 0x00000124) TWI error                                                  */
  __IM  uint32_t  RESERVED6[4];
  __IOM uint32_t  EVENTS_BB;                    /*!< (@ 0x00000138) TWI byte boundary, generated before each byte
                                                                    that is sent or received                                   */
  __IM  uint32_t  RESERVED7[3];
  __IOM uint32_t  EVENTS_SUSPENDED;             /*!< (@ 0x00000148) TWI entered the suspended state                            */
  __IM  uint32_t  RESERVED8[45];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED9[64];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED10[110];
  __IOM uint32_t  ERRORSRC;                     /*!< (@ 0x000004C4) Error source                                               */
  __IM  uint32_t  RESERVED11[14];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable TWI                                                 */
  __IM  uint32_t  RESERVED12;
  __IOM TWI_PSEL_Type PSEL;                     /*!< (@ 0x00000508) Unspecified                                                */
  __IM  uint32_t  RESERVED13[2];
  __IM  uint32_t  RXD;                          /*!< (@ 0x00000518) RXD register                                               */
  __IOM uint32_t  TXD;                          /*!< (@ 0x0000051C) TXD register                                               */
  __IM  uint32_t  RESERVED14;
  __IOM uint32_t  FREQUENCY;                    /*!< (@ 0x00000524) TWI frequency. Accuracy depends on the HFCLK
                                                                    source selected.                                           */
  __IM  uint32_t  RESERVED15[24];
  __IOM uint32_t  ADDRESS;                      /*!< (@ 0x00000588) Address used in the TWI transfer                           */
} NRF_TWI_Type;                                 /*!< Size = 1420 (0x58c)                                                       */



/* =========================================================================================================================== */
/* ================                                           TWIM0                                           ================ */
/* =========================================================================================================================== */


/**
  * @brief I2C compatible Two-Wire Master Interface with EasyDMA 0 (TWIM0)
  */

typedef struct {                                /*!< (@ 0x40003000) TWIM0 Structure                                            */
  __OM  uint32_t  TASKS_STARTRX;                /*!< (@ 0x00000000) Start TWI receive sequence                                 */
  __IM  uint32_t  RESERVED;
  __OM  uint32_t  TASKS_STARTTX;                /*!< (@ 0x00000008) Start TWI transmit sequence                                */
  __IM  uint32_t  RESERVED1[2];
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000014) Stop TWI transaction. Must be issued while the
                                                                    TWI master is not suspended.                               */
  __IM  uint32_t  RESERVED2;
  __OM  uint32_t  TASKS_SUSPEND;                /*!< (@ 0x0000001C) Suspend TWI transaction                                    */
  __OM  uint32_t  TASKS_RESUME;                 /*!< (@ 0x00000020) Resume TWI transaction                                     */
  __IM  uint32_t  RESERVED3[56];
  __IOM uint32_t  EVENTS_STOPPED;               /*!< (@ 0x00000104) TWI stopped                                                */
  __IM  uint32_t  RESERVED4[7];
  __IOM uint32_t  EVENTS_ERROR;                 /*!< (@ 0x00000124) TWI error                                                  */
  __IM  uint32_t  RESERVED5[8];
  __IOM uint32_t  EVENTS_SUSPENDED;             /*!< (@ 0x00000148) SUSPEND task has been issued, TWI traffic is
                                                                    now suspended.                                             */
  __IOM uint32_t  EVENTS_RXSTARTED;             /*!< (@ 0x0000014C) Receive sequence started                                   */
  __IOM uint32_t  EVENTS_TXSTARTED;             /*!< (@ 0x00000150) Transmit sequence started                                  */
  __IM  uint32_t  RESERVED6[2];
  __IOM uint32_t  EVENTS_LASTRX;                /*!< (@ 0x0000015C) Byte boundary, starting to receive the last byte           */
  __IOM uint32_t  EVENTS_LASTTX;                /*!< (@ 0x00000160) Byte boundary, starting to transmit the last
                                                                    byte                                                       */
  __IM  uint32_t  RESERVED7[39];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED8[63];
  __IOM uint32_t  INTEN;                        /*!< (@ 0x00000300) Enable or disable interrupt                                */
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED9[110];
  __IOM uint32_t  ERRORSRC;                     /*!< (@ 0x000004C4) Error source                                               */
  __IM  uint32_t  RESERVED10[14];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable TWIM                                                */
  __IM  uint32_t  RESERVED11;
  __IOM TWIM_PSEL_Type PSEL;                    /*!< (@ 0x00000508) Unspecified                                                */
  __IM  uint32_t  RESERVED12[5];
  __IOM uint32_t  FREQUENCY;                    /*!< (@ 0x00000524) TWI frequency. Accuracy depends on the HFCLK
                                                                    source selected.                                           */
  __IM  uint32_t  RESERVED13[3];
  __IOM TWIM_RXD_Type RXD;                      /*!< (@ 0x00000534) RXD EasyDMA channel                                        */
  __IOM TWIM_TXD_Type TXD;                      /*!< (@ 0x00000544) TXD EasyDMA channel                                        */
  __IM  uint32_t  RESERVED14[13];
  __IOM uint32_t  ADDRESS;                      /*!< (@ 0x00000588) Address used in the TWI transfer                           */
} NRF_TWIM_Type;                                /*!< Size = 1420 (0x58c)                                                       */



/* =========================================================================================================================== */
/* ================                                           TWIS0                                           ================ */
/* =========================================================================================================================== */


/**
  * @brief I2C compatible Two-Wire Slave Interface with EasyDMA 0 (TWIS0)
  */

typedef struct {                                /*!< (@ 0x40003000) TWIS0 Structure                                            */
  __IM  uint32_t  RESERVED[5];
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000014) Stop TWI transaction                                       */
  __IM  uint32_t  RESERVED1;
  __OM  uint32_t  TASKS_SUSPEND;                /*!< (@ 0x0000001C) Suspend TWI transaction                                    */
  __OM  uint32_t  TASKS_RESUME;                 /*!< (@ 0x00000020) Resume TWI transaction                                     */
  __IM  uint32_t  RESERVED2[3];
  __OM  uint32_t  TASKS_PREPARERX;              /*!< (@ 0x00000030) Prepare the TWI slave to respond to a write command        */
  __OM  uint32_t  TASKS_PREPARETX;              /*!< (@ 0x00000034) Prepare the TWI slave to respond to a read command         */
  __IM  uint32_t  RESERVED3[51];
  __IOM uint32_t  EVENTS_STOPPED;               /*!< (@ 0x00000104) TWI stopped                                                */
  __IM  uint32_t  RESERVED4[7];
  __IOM uint32_t  EVENTS_ERROR;                 /*!< (@ 0x00000124) TWI error                                                  */
  __IM  uint32_t  RESERVED5[9];
  __IOM uint32_t  EVENTS_RXSTARTED;             /*!< (@ 0x0000014C) Receive sequence started                                   */
  __IOM uint32_t  EVENTS_TXSTARTED;             /*!< (@ 0x00000150) Transmit sequence started                                  */
  __IM  uint32_t  RESERVED6[4];
  __IOM uint32_t  EVENTS_WRITE;                 /*!< (@ 0x00000164) Write command received                                     */
  __IOM uint32_t  EVENTS_READ;                  /*!< (@ 0x00000168) Read command received                                      */
  __IM  uint32_t  RESERVED7[37];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED8[63];
  __IOM uint32_t  INTEN;                        /*!< (@ 0x00000300) Enable or disable interrupt                                */
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED9[113];
  __IOM uint32_t  ERRORSRC;                     /*!< (@ 0x000004D0) Error source                                               */
  __IM  uint32_t  MATCH;                        /*!< (@ 0x000004D4) Status register indicating which address had
                                                                    a match                                                    */
  __IM  uint32_t  RESERVED10[10];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable TWIS                                                */
  __IM  uint32_t  RESERVED11;
  __IOM TWIS_PSEL_Type PSEL;                    /*!< (@ 0x00000508) Unspecified                                                */
  __IM  uint32_t  RESERVED12[9];
  __IOM TWIS_RXD_Type RXD;                      /*!< (@ 0x00000534) RXD EasyDMA channel                                        */
  __IOM TWIS_TXD_Type TXD;                      /*!< (@ 0x00000544) TXD EasyDMA channel                                        */
  __IM  uint32_t  RESERVED13[13];
  __IOM uint32_t  ADDRESS[2];                   /*!< (@ 0x00000588) Description collection: TWI slave address n                */
  __IM  uint32_t  RESERVED14;
  __IOM uint32_t  CONFIG;                       /*!< (@ 0x00000594) Configuration register for the address match
                                                                    mechanism                                                  */
  __IM  uint32_t  RESERVED15[10];
  __IOM uint32_t  ORC;                          /*!< (@ 0x000005C0) Over-read character. Character sent out in case
                                                                    of an over-read of the transmit buffer.                    */
} NRF_TWIS_Type;                                /*!< Size = 1476 (0x5c4)                                                       */



/* =========================================================================================================================== */
/* ================                                           NFCT                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief NFC-A compatible radio (NFCT)
  */

typedef struct {                                /*!< (@ 0x40005000) NFCT Structure                                             */
  __OM  uint32_t  TASKS_ACTIVATE;               /*!< (@ 0x00000000) Activate NFCT peripheral for incoming and outgoing
                                                                    frames, change state to activated                          */
  __OM  uint32_t  TASKS_DISABLE;                /*!< (@ 0x00000004) Disable NFCT peripheral                                    */
  __OM  uint32_t  TASKS_SENSE;                  /*!< (@ 0x00000008) Enable NFC sense field mode, change state to
                                                                    sense mode                                                 */
  __OM  uint32_t  TASKS_STARTTX;                /*!< (@ 0x0000000C) Start transmission of an outgoing frame, change
                                                                    state to transmit                                          */
  __IM  uint32_t  RESERVED[3];
  __OM  uint32_t  TASKS_ENABLERXDATA;           /*!< (@ 0x0000001C) Initializes the EasyDMA for receive.                       */
  __IM  uint32_t  RESERVED1;
  __OM  uint32_t  TASKS_GOIDLE;                 /*!< (@ 0x00000024) Force state machine to IDLE state                          */
  __OM  uint32_t  TASKS_GOSLEEP;                /*!< (@ 0x00000028) Force state machine to SLEEP_A state                       */
  __IM  uint32_t  RESERVED2[53];
  __IOM uint32_t  EVENTS_READY;                 /*!< (@ 0x00000100) The NFCT peripheral is ready to receive and send
                                                                    frames                                                     */
  __IOM uint32_t  EVENTS_FIELDDETECTED;         /*!< (@ 0x00000104) Remote NFC field detected                                  */
  __IOM uint32_t  EVENTS_FIELDLOST;             /*!< (@ 0x00000108) Remote NFC field lost                                      */
  __IOM uint32_t  EVENTS_TXFRAMESTART;          /*!< (@ 0x0000010C) Marks the start of the first symbol of a transmitted
                                                                    frame                                                      */
  __IOM uint32_t  EVENTS_TXFRAMEEND;            /*!< (@ 0x00000110) Marks the end of the last transmitted on-air
                                                                    symbol of a frame                                          */
  __IOM uint32_t  EVENTS_RXFRAMESTART;          /*!< (@ 0x00000114) Marks the end of the first symbol of a received
                                                                    frame                                                      */
  __IOM uint32_t  EVENTS_RXFRAMEEND;            /*!< (@ 0x00000118) Received data has been checked (CRC, parity)
                                                                    and transferred to RAM, and EasyDMA has
                                                                    ended accessing the RX buffer                              */
  __IOM uint32_t  EVENTS_ERROR;                 /*!< (@ 0x0000011C) NFC error reported. The ERRORSTATUS register
                                                                    contains details on the source of the error.               */
  __IM  uint32_t  RESERVED3[2];
  __IOM uint32_t  EVENTS_RXERROR;               /*!< (@ 0x00000128) NFC RX frame error reported. The FRAMESTATUS.RX
                                                                    register contains details on the source
                                                                    of the error.                                              */
  __IOM uint32_t  EVENTS_ENDRX;                 /*!< (@ 0x0000012C) RX buffer (as defined by PACKETPTR and MAXLEN)
                                                                    in Data RAM full.                                          */
  __IOM uint32_t  EVENTS_ENDTX;                 /*!< (@ 0x00000130) Transmission of data in RAM has ended, and EasyDMA
                                                                    has ended accessing the TX buffer                          */
  __IM  uint32_t  RESERVED4;
  __IOM uint32_t  EVENTS_AUTOCOLRESSTARTED;     /*!< (@ 0x00000138) Auto collision resolution process has started              */
  __IM  uint32_t  RESERVED5[3];
  __IOM uint32_t  EVENTS_COLLISION;             /*!< (@ 0x00000148) NFC auto collision resolution error reported.              */
  __IOM uint32_t  EVENTS_SELECTED;              /*!< (@ 0x0000014C) NFC auto collision resolution successfully completed       */
  __IOM uint32_t  EVENTS_STARTED;               /*!< (@ 0x00000150) EasyDMA is ready to receive or send frames.                */
  __IM  uint32_t  RESERVED6[43];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED7[63];
  __IOM uint32_t  INTEN;                        /*!< (@ 0x00000300) Enable or disable interrupt                                */
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED8[62];
  __IOM uint32_t  ERRORSTATUS;                  /*!< (@ 0x00000404) NFC Error Status register                                  */
  __IM  uint32_t  RESERVED9;
  __IOM NFCT_FRAMESTATUS_Type FRAMESTATUS;      /*!< (@ 0x0000040C) Unspecified                                                */
  __IM  uint32_t  NFCTAGSTATE;                  /*!< (@ 0x00000410) NfcTag state register                                      */
  __IM  uint32_t  RESERVED10[3];
  __IM  uint32_t  SLEEPSTATE;                   /*!< (@ 0x00000420) Sleep state during automatic collision resolution          */
  __IM  uint32_t  RESERVED11[6];
  __IM  uint32_t  FIELDPRESENT;                 /*!< (@ 0x0000043C) Indicates the presence or not of a valid field             */
  __IM  uint32_t  RESERVED12[49];
  __IOM uint32_t  FRAMEDELAYMIN;                /*!< (@ 0x00000504) Minimum frame delay                                        */
  __IOM uint32_t  FRAMEDELAYMAX;                /*!< (@ 0x00000508) Maximum frame delay                                        */
  __IOM uint32_t  FRAMEDELAYMODE;               /*!< (@ 0x0000050C) Configuration register for the Frame Delay Timer           */
  __IOM uint32_t  PACKETPTR;                    /*!< (@ 0x00000510) Packet pointer for TXD and RXD data storage in
                                                                    Data RAM                                                   */
  __IOM uint32_t  MAXLEN;                       /*!< (@ 0x00000514) Size of the RAM buffer allocated to TXD and RXD
                                                                    data storage each                                          */
  __IOM NFCT_TXD_Type TXD;                      /*!< (@ 0x00000518) Unspecified                                                */
  __IOM NFCT_RXD_Type RXD;                      /*!< (@ 0x00000520) Unspecified                                                */
  __IM  uint32_t  RESERVED13[26];
  __IOM uint32_t  NFCID1_LAST;                  /*!< (@ 0x00000590) Last NFCID1 part (4, 7 or 10 bytes ID)                     */
  __IOM uint32_t  NFCID1_2ND_LAST;              /*!< (@ 0x00000594) Second last NFCID1 part (7 or 10 bytes ID)                 */
  __IOM uint32_t  NFCID1_3RD_LAST;              /*!< (@ 0x00000598) Third last NFCID1 part (10 bytes ID)                       */
  __IOM uint32_t  AUTOCOLRESCONFIG;             /*!< (@ 0x0000059C) Controls the auto collision resolution function.
                                                                    This setting must be done before the NFCT
                                                                    peripheral is activated.                                   */
  __IOM uint32_t  SENSRES;                      /*!< (@ 0x000005A0) NFC-A SENS_RES auto-response settings                      */
  __IOM uint32_t  SELRES;                       /*!< (@ 0x000005A4) NFC-A SEL_RES auto-response settings                       */
} NRF_NFCT_Type;                                /*!< Size = 1448 (0x5a8)                                                       */



/* =========================================================================================================================== */
/* ================                                          GPIOTE                                           ================ */
/* =========================================================================================================================== */


/**
  * @brief GPIO Tasks and Events (GPIOTE)
  */

typedef struct {                                /*!< (@ 0x40006000) GPIOTE Structure                                           */
  __OM  uint32_t  TASKS_OUT[8];                 /*!< (@ 0x00000000) Description collection: Task for writing to pin
                                                                    specified in CONFIG[n].PSEL. Action on pin
                                                                    is configured in CONFIG[n].POLARITY.                       */
  __IM  uint32_t  RESERVED[4];
  __OM  uint32_t  TASKS_SET[8];                 /*!< (@ 0x00000030) Description collection: Task for writing to pin
                                                                    specified in CONFIG[n].PSEL. Action on pin
                                                                    is to set it high.                                         */
  __IM  uint32_t  RESERVED1[4];
  __OM  uint32_t  TASKS_CLR[8];                 /*!< (@ 0x00000060) Description collection: Task for writing to pin
                                                                    specified in CONFIG[n].PSEL. Action on pin
                                                                    is to set it low.                                          */
  __IM  uint32_t  RESERVED2[32];
  __IOM uint32_t  EVENTS_IN[8];                 /*!< (@ 0x00000100) Description collection: Event generated from
                                                                    pin specified in CONFIG[n].PSEL                            */
  __IM  uint32_t  RESERVED3[23];
  __IOM uint32_t  EVENTS_PORT;                  /*!< (@ 0x0000017C) Event generated from multiple input GPIO pins
                                                                    with SENSE mechanism enabled                               */
  __IM  uint32_t  RESERVED4[97];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED5[129];
  __IOM uint32_t  CONFIG[8];                    /*!< (@ 0x00000510) Description collection: Configuration for OUT[n],
                                                                    SET[n], and CLR[n] tasks and IN[n] event                   */
} NRF_GPIOTE_Type;                              /*!< Size = 1328 (0x530)                                                       */



/* =========================================================================================================================== */
/* ================                                           SAADC                                           ================ */
/* =========================================================================================================================== */


/**
  * @brief Successive approximation register (SAR) analog-to-digital converter (SAADC)
  */

typedef struct {                                /*!< (@ 0x40007000) SAADC Structure                                            */
  __OM  uint32_t  TASKS_START;                  /*!< (@ 0x00000000) Starts the SAADC and prepares the result buffer
                                                                    in RAM                                                     */
  __OM  uint32_t  TASKS_SAMPLE;                 /*!< (@ 0x00000004) Takes one SAADC sample                                     */
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000008) Stops the SAADC and terminates all on-going conversions    */
  __OM  uint32_t  TASKS_CALIBRATEOFFSET;        /*!< (@ 0x0000000C) Starts offset auto-calibration                             */
  __IM  uint32_t  RESERVED[60];
  __IOM uint32_t  EVENTS_STARTED;               /*!< (@ 0x00000100) The SAADC has started                                      */
  __IOM uint32_t  EVENTS_END;                   /*!< (@ 0x00000104) The SAADC has filled up the result buffer                  */
  __IOM uint32_t  EVENTS_DONE;                  /*!< (@ 0x00000108) A conversion task has been completed. Depending
                                                                    on the configuration, multiple conversions
                                                                    might be needed for a result to be transferred
                                                                    to RAM.                                                    */
  __IOM uint32_t  EVENTS_RESULTDONE;            /*!< (@ 0x0000010C) Result ready for transfer to RAM                           */
  __IOM uint32_t  EVENTS_CALIBRATEDONE;         /*!< (@ 0x00000110) Calibration is complete                                    */
  __IOM uint32_t  EVENTS_STOPPED;               /*!< (@ 0x00000114) The SAADC has stopped                                      */
  __IOM SAADC_EVENTS_CH_Type EVENTS_CH[8];      /*!< (@ 0x00000118) Peripheral events.                                         */
  __IM  uint32_t  RESERVED1[106];
  __IOM uint32_t  INTEN;                        /*!< (@ 0x00000300) Enable or disable interrupt                                */
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED2[61];
  __IM  uint32_t  STATUS;                       /*!< (@ 0x00000400) Status                                                     */
  __IM  uint32_t  RESERVED3[63];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable or disable SAADC                                    */
  __IM  uint32_t  RESERVED4[3];
  __IOM SAADC_CH_Type CH[8];                    /*!< (@ 0x00000510) Unspecified                                                */
  __IM  uint32_t  RESERVED5[24];
  __IOM uint32_t  RESOLUTION;                   /*!< (@ 0x000005F0) Resolution configuration                                   */
  __IOM uint32_t  OVERSAMPLE;                   /*!< (@ 0x000005F4) Oversampling configuration. The RESOLUTION is
                                                                    applied before averaging, thus for high
                                                                    OVERSAMPLE a higher RESOLUTION should be
                                                                    used.                                                      */
  __IOM uint32_t  SAMPLERATE;                   /*!< (@ 0x000005F8) Controls normal or continuous sample rate                  */
  __IM  uint32_t  RESERVED6[12];
  __IOM SAADC_RESULT_Type RESULT;               /*!< (@ 0x0000062C) RESULT EasyDMA channel                                     */
} NRF_SAADC_Type;                               /*!< Size = 1592 (0x638)                                                       */



/* =========================================================================================================================== */
/* ================                                          TIMER0                                           ================ */
/* =========================================================================================================================== */


/**
  * @brief Timer/Counter 0 (TIMER0)
  */

typedef struct {                                /*!< (@ 0x40008000) TIMER0 Structure                                           */
  __OM  uint32_t  TASKS_START;                  /*!< (@ 0x00000000) Start Timer                                                */
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000004) Stop Timer                                                 */
  __OM  uint32_t  TASKS_COUNT;                  /*!< (@ 0x00000008) Increment Timer (Counter mode only)                        */
  __OM  uint32_t  TASKS_CLEAR;                  /*!< (@ 0x0000000C) Clear time                                                 */
  __OM  uint32_t  TASKS_SHUTDOWN;               /*!< (@ 0x00000010) Deprecated register - Shut down timer                      */
  __IM  uint32_t  RESERVED[11];
  __OM  uint32_t  TASKS_CAPTURE[6];             /*!< (@ 0x00000040) Description collection: Capture Timer value to
                                                                    CC[n] register                                             */
  __IM  uint32_t  RESERVED1[58];
  __IOM uint32_t  EVENTS_COMPARE[6];            /*!< (@ 0x00000140) Description collection: Compare event on CC[n]
                                                                    match                                                      */
  __IM  uint32_t  RESERVED2[42];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED3[64];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED4[126];
  __IOM uint32_t  MODE;                         /*!< (@ 0x00000504) Timer mode selection                                       */
  __IOM uint32_t  BITMODE;                      /*!< (@ 0x00000508) Configure the number of bits used by the TIMER             */
  __IM  uint32_t  RESERVED5;
  __IOM uint32_t  PRESCALER;                    /*!< (@ 0x00000510) Timer prescaler register                                   */
  __IM  uint32_t  RESERVED6[11];
  __IOM uint32_t  CC[6];                        /*!< (@ 0x00000540) Description collection: Capture/Compare register
                                                                    n                                                          */
} NRF_TIMER_Type;                               /*!< Size = 1368 (0x558)                                                       */



/* =========================================================================================================================== */
/* ================                                           RTC0                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Real time counter 0 (RTC0)
  */

typedef struct {                                /*!< (@ 0x4000B000) RTC0 Structure                                             */
  __OM  uint32_t  TASKS_START;                  /*!< (@ 0x00000000) Start RTC COUNTER                                          */
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000004) Stop RTC COUNTER                                           */
  __OM  uint32_t  TASKS_CLEAR;                  /*!< (@ 0x00000008) Clear RTC COUNTER                                          */
  __OM  uint32_t  TASKS_TRIGOVRFLW;             /*!< (@ 0x0000000C) Set COUNTER to 0xFFFFF0                                    */
  __IM  uint32_t  RESERVED[60];
  __IOM uint32_t  EVENTS_TICK;                  /*!< (@ 0x00000100) Event on COUNTER increment                                 */
  __IOM uint32_t  EVENTS_OVRFLW;                /*!< (@ 0x00000104) Event on COUNTER overflow                                  */
  __IM  uint32_t  RESERVED1[14];
  __IOM uint32_t  EVENTS_COMPARE[4];            /*!< (@ 0x00000140) Description collection: Compare event on CC[n]
                                                                    match                                                      */
  __IM  uint32_t  RESERVED2[109];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED3[13];
  __IOM uint32_t  EVTEN;                        /*!< (@ 0x00000340) Enable or disable event routing                            */
  __IOM uint32_t  EVTENSET;                     /*!< (@ 0x00000344) Enable event routing                                       */
  __IOM uint32_t  EVTENCLR;                     /*!< (@ 0x00000348) Disable event routing                                      */
  __IM  uint32_t  RESERVED4[110];
  __IM  uint32_t  COUNTER;                      /*!< (@ 0x00000504) Current COUNTER value                                      */
  __IOM uint32_t  PRESCALER;                    /*!< (@ 0x00000508) 12 bit prescaler for COUNTER frequency (32768/(PRESCALER+1)).
                                                                    Must be written when RTC is stopped.                       */
  __IM  uint32_t  RESERVED5[13];
  __IOM uint32_t  CC[4];                        /*!< (@ 0x00000540) Description collection: Compare register n                 */
} NRF_RTC_Type;                                 /*!< Size = 1360 (0x550)                                                       */



/* =========================================================================================================================== */
/* ================                                           TEMP                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Temperature Sensor (TEMP)
  */

typedef struct {                                /*!< (@ 0x4000C000) TEMP Structure                                             */
  __OM  uint32_t  TASKS_START;                  /*!< (@ 0x00000000) Start temperature measurement                              */
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000004) Stop temperature measurement                               */
  __IM  uint32_t  RESERVED[62];
  __IOM uint32_t  EVENTS_DATARDY;               /*!< (@ 0x00000100) Temperature measurement complete, data ready               */
  __IM  uint32_t  RESERVED1[128];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED2[127];
  __IM  int32_t   TEMP;                         /*!< (@ 0x00000508) Temperature in degC (0.25deg steps)                        */
  __IM  uint32_t  RESERVED3[5];
  __IOM uint32_t  A0;                           /*!< (@ 0x00000520) Slope of first piecewise linear function                   */
  __IOM uint32_t  A1;                           /*!< (@ 0x00000524) Slope of second piecewise linear function                  */
  __IOM uint32_t  A2;                           /*!< (@ 0x00000528) Slope of third piecewise linear function                   */
  __IOM uint32_t  A3;                           /*!< (@ 0x0000052C) Slope of fourth piecewise linear function                  */
  __IOM uint32_t  A4;                           /*!< (@ 0x00000530) Slope of fifth piecewise linear function                   */
  __IOM uint32_t  A5;                           /*!< (@ 0x00000534) Slope of sixth piecewise linear function                   */
  __IM  uint32_t  RESERVED4[2];
  __IOM uint32_t  B0;                           /*!< (@ 0x00000540) y-intercept of first piecewise linear function             */
  __IOM uint32_t  B1;                           /*!< (@ 0x00000544) y-intercept of second piecewise linear function            */
  __IOM uint32_t  B2;                           /*!< (@ 0x00000548) y-intercept of third piecewise linear function             */
  __IOM uint32_t  B3;                           /*!< (@ 0x0000054C) y-intercept of fourth piecewise linear function            */
  __IOM uint32_t  B4;                           /*!< (@ 0x00000550) y-intercept of fifth piecewise linear function             */
  __IOM uint32_t  B5;                           /*!< (@ 0x00000554) y-intercept of sixth piecewise linear function             */
  __IM  uint32_t  RESERVED5[2];
  __IOM uint32_t  T0;                           /*!< (@ 0x00000560) End point of first piecewise linear function               */
  __IOM uint32_t  T1;                           /*!< (@ 0x00000564) End point of second piecewise linear function              */
  __IOM uint32_t  T2;                           /*!< (@ 0x00000568) End point of third piecewise linear function               */
  __IOM uint32_t  T3;                           /*!< (@ 0x0000056C) End point of fourth piecewise linear function              */
  __IOM uint32_t  T4;                           /*!< (@ 0x00000570) End point of fifth piecewise linear function               */
} NRF_TEMP_Type;                                /*!< Size = 1396 (0x574)                                                       */



/* =========================================================================================================================== */
/* ================                                            RNG                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Random Number Generator (RNG)
  */

typedef struct {                                /*!< (@ 0x4000D000) RNG Structure                                              */
  __OM  uint32_t  TASKS_START;                  /*!< (@ 0x00000000) Task starting the random number generator                  */
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000004) Task stopping the random number generator                  */
  __IM  uint32_t  RESERVED[62];
  __IOM uint32_t  EVENTS_VALRDY;                /*!< (@ 0x00000100) Event being generated for every new random number
                                                                    written to the VALUE register                              */
  __IM  uint32_t  RESERVED1[63];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED2[64];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED3[126];
  __IOM uint32_t  CONFIG;                       /*!< (@ 0x00000504) Configuration register                                     */
  __IM  uint32_t  VALUE;                        /*!< (@ 0x00000508) Output random number                                       */
} NRF_RNG_Type;                                 /*!< Size = 1292 (0x50c)                                                       */



/* =========================================================================================================================== */
/* ================                                            ECB                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief AES ECB Mode Encryption (ECB)
  */

typedef struct {                                /*!< (@ 0x4000E000) ECB Structure                                              */
  __OM  uint32_t  TASKS_STARTECB;               /*!< (@ 0x00000000) Start ECB block encrypt                                    */
  __OM  uint32_t  TASKS_STOPECB;                /*!< (@ 0x00000004) Abort a possible executing ECB operation                   */
  __IM  uint32_t  RESERVED[62];
  __IOM uint32_t  EVENTS_ENDECB;                /*!< (@ 0x00000100) ECB block encrypt complete                                 */
  __IOM uint32_t  EVENTS_ERRORECB;              /*!< (@ 0x00000104) ECB block encrypt aborted because of a STOPECB
                                                                    task or due to an error                                    */
  __IM  uint32_t  RESERVED1[127];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED2[126];
  __IOM uint32_t  ECBDATAPTR;                   /*!< (@ 0x00000504) ECB block encrypt memory pointers                          */
} NRF_ECB_Type;                                 /*!< Size = 1288 (0x508)                                                       */



/* =========================================================================================================================== */
/* ================                                            AAR                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Accelerated Address Resolver (AAR)
  */

typedef struct {                                /*!< (@ 0x4000F000) AAR Structure                                              */
  __OM  uint32_t  TASKS_START;                  /*!< (@ 0x00000000) Start resolving addresses based on IRKs specified
                                                                    in the IRK data structure                                  */
  __IM  uint32_t  RESERVED;
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000008) Stop resolving addresses                                   */
  __IM  uint32_t  RESERVED1[61];
  __IOM uint32_t  EVENTS_END;                   /*!< (@ 0x00000100) Address resolution procedure complete                      */
  __IOM uint32_t  EVENTS_RESOLVED;              /*!< (@ 0x00000104) Address resolved                                           */
  __IOM uint32_t  EVENTS_NOTRESOLVED;           /*!< (@ 0x00000108) Address not resolved                                       */
  __IM  uint32_t  RESERVED2[126];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED3[61];
  __IM  uint32_t  STATUS;                       /*!< (@ 0x00000400) Resolution status                                          */
  __IM  uint32_t  RESERVED4[63];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable AAR                                                 */
  __IOM uint32_t  NIRK;                         /*!< (@ 0x00000504) Number of IRKs                                             */
  __IOM uint32_t  IRKPTR;                       /*!< (@ 0x00000508) Pointer to IRK data structure                              */
  __IM  uint32_t  RESERVED5;
  __IOM uint32_t  ADDRPTR;                      /*!< (@ 0x00000510) Pointer to the resolvable address                          */
  __IOM uint32_t  SCRATCHPTR;                   /*!< (@ 0x00000514) Pointer to data area used for temporary storage            */
} NRF_AAR_Type;                                 /*!< Size = 1304 (0x518)                                                       */



/* =========================================================================================================================== */
/* ================                                            CCM                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief AES CCM mode encryption (CCM)
  */

typedef struct {                                /*!< (@ 0x4000F000) CCM Structure                                              */
  __OM  uint32_t  TASKS_KSGEN;                  /*!< (@ 0x00000000) Start generation of keystream. This operation
                                                                    will stop by itself when completed.                        */
  __OM  uint32_t  TASKS_CRYPT;                  /*!< (@ 0x00000004) Start encryption/decryption. This operation will
                                                                    stop by itself when completed.                             */
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000008) Stop encryption/decryption                                 */
  __OM  uint32_t  TASKS_RATEOVERRIDE;           /*!< (@ 0x0000000C) Override DATARATE setting in MODE register with
                                                                    the contents of the RATEOVERRIDE register
                                                                    for any ongoing encryption/decryption                      */
  __IM  uint32_t  RESERVED[60];
  __IOM uint32_t  EVENTS_ENDKSGEN;              /*!< (@ 0x00000100) Keystream generation complete                              */
  __IOM uint32_t  EVENTS_ENDCRYPT;              /*!< (@ 0x00000104) Encrypt/decrypt complete                                   */
  __IOM uint32_t  EVENTS_ERROR;                 /*!< (@ 0x00000108) Deprecated register - CCM error event                      */
  __IM  uint32_t  RESERVED1[61];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED2[64];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED3[61];
  __IM  uint32_t  MICSTATUS;                    /*!< (@ 0x00000400) MIC check result                                           */
  __IM  uint32_t  RESERVED4[63];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable                                                     */
  __IOM uint32_t  MODE;                         /*!< (@ 0x00000504) Operation mode                                             */
  __IOM uint32_t  CNFPTR;                       /*!< (@ 0x00000508) Pointer to data structure holding the AES key
                                                                    and the NONCE vector                                       */
  __IOM uint32_t  INPTR;                        /*!< (@ 0x0000050C) Input pointer                                              */
  __IOM uint32_t  OUTPTR;                       /*!< (@ 0x00000510) Output pointer                                             */
  __IOM uint32_t  SCRATCHPTR;                   /*!< (@ 0x00000514) Pointer to data area used for temporary storage            */
  __IOM uint32_t  MAXPACKETSIZE;                /*!< (@ 0x00000518) Length of keystream generated when MODE.LENGTH
                                                                    = Extended                                                 */
  __IOM uint32_t  RATEOVERRIDE;                 /*!< (@ 0x0000051C) Data rate override setting.                                */
} NRF_CCM_Type;                                 /*!< Size = 1312 (0x520)                                                       */



/* =========================================================================================================================== */
/* ================                                            WDT                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Watchdog Timer (WDT)
  */

typedef struct {                                /*!< (@ 0x40010000) WDT Structure                                              */
  __OM  uint32_t  TASKS_START;                  /*!< (@ 0x00000000) Start the watchdog                                         */
  __IM  uint32_t  RESERVED[63];
  __IOM uint32_t  EVENTS_TIMEOUT;               /*!< (@ 0x00000100) Watchdog timeout                                           */
  __IM  uint32_t  RESERVED1[128];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED2[61];
  __IM  uint32_t  RUNSTATUS;                    /*!< (@ 0x00000400) Run status                                                 */
  __IM  uint32_t  REQSTATUS;                    /*!< (@ 0x00000404) Request status                                             */
  __IM  uint32_t  RESERVED3[63];
  __IOM uint32_t  CRV;                          /*!< (@ 0x00000504) Counter reload value                                       */
  __IOM uint32_t  RREN;                         /*!< (@ 0x00000508) Enable register for reload request registers               */
  __IOM uint32_t  CONFIG;                       /*!< (@ 0x0000050C) Configuration register                                     */
  __IM  uint32_t  RESERVED4[60];
  __OM  uint32_t  RR[8];                        /*!< (@ 0x00000600) Description collection: Reload request n                   */
} NRF_WDT_Type;                                 /*!< Size = 1568 (0x620)                                                       */



/* =========================================================================================================================== */
/* ================                                           QDEC                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Quadrature Decoder (QDEC)
  */

typedef struct {                                /*!< (@ 0x40012000) QDEC Structure                                             */
  __OM  uint32_t  TASKS_START;                  /*!< (@ 0x00000000) Task starting the quadrature decoder                       */
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000004) Task stopping the quadrature decoder                       */
  __OM  uint32_t  TASKS_READCLRACC;             /*!< (@ 0x00000008) Read and clear ACC and ACCDBL                              */
  __OM  uint32_t  TASKS_RDCLRACC;               /*!< (@ 0x0000000C) Read and clear ACC                                         */
  __OM  uint32_t  TASKS_RDCLRDBL;               /*!< (@ 0x00000010) Read and clear ACCDBL                                      */
  __IM  uint32_t  RESERVED[59];
  __IOM uint32_t  EVENTS_SAMPLERDY;             /*!< (@ 0x00000100) Event being generated for every new sample value
                                                                    written to the SAMPLE register                             */
  __IOM uint32_t  EVENTS_REPORTRDY;             /*!< (@ 0x00000104) Non-null report ready                                      */
  __IOM uint32_t  EVENTS_ACCOF;                 /*!< (@ 0x00000108) ACC or ACCDBL register overflow                            */
  __IOM uint32_t  EVENTS_DBLRDY;                /*!< (@ 0x0000010C) Double displacement(s) detected                            */
  __IOM uint32_t  EVENTS_STOPPED;               /*!< (@ 0x00000110) QDEC has been stopped                                      */
  __IM  uint32_t  RESERVED1[59];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED2[64];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED3[125];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable the quadrature decoder                              */
  __IOM uint32_t  LEDPOL;                       /*!< (@ 0x00000504) LED output pin polarity                                    */
  __IOM uint32_t  SAMPLEPER;                    /*!< (@ 0x00000508) Sample period                                              */
  __IM  int32_t   SAMPLE;                       /*!< (@ 0x0000050C) Motion sample value                                        */
  __IOM uint32_t  REPORTPER;                    /*!< (@ 0x00000510) Number of samples to be taken before REPORTRDY
                                                                    and DBLRDY events can be generated                         */
  __IM  int32_t   ACC;                          /*!< (@ 0x00000514) Register accumulating the valid transitions                */
  __IM  int32_t   ACCREAD;                      /*!< (@ 0x00000518) Snapshot of the ACC register, updated by the
                                                                    READCLRACC or RDCLRACC task                                */
  __IOM QDEC_PSEL_Type PSEL;                    /*!< (@ 0x0000051C) Unspecified                                                */
  __IOM uint32_t  DBFEN;                        /*!< (@ 0x00000528) Enable input debounce filters                              */
  __IM  uint32_t  RESERVED4[5];
  __IOM uint32_t  LEDPRE;                       /*!< (@ 0x00000540) Time period the LED is switched ON prior to sampling       */
  __IM  uint32_t  ACCDBL;                       /*!< (@ 0x00000544) Register accumulating the number of detected
                                                                    double transitions                                         */
  __IM  uint32_t  ACCDBLREAD;                   /*!< (@ 0x00000548) Snapshot of the ACCDBL, updated by the READCLRACC
                                                                    or RDCLRDBL task                                           */
} NRF_QDEC_Type;                                /*!< Size = 1356 (0x54c)                                                       */



/* =========================================================================================================================== */
/* ================                                           COMP                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Comparator (COMP)
  */

typedef struct {                                /*!< (@ 0x40013000) COMP Structure                                             */
  __OM  uint32_t  TASKS_START;                  /*!< (@ 0x00000000) Start comparator                                           */
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000004) Stop comparator                                            */
  __OM  uint32_t  TASKS_SAMPLE;                 /*!< (@ 0x00000008) Sample comparator value                                    */
  __IM  uint32_t  RESERVED[61];
  __IOM uint32_t  EVENTS_READY;                 /*!< (@ 0x00000100) COMP is ready and output is valid                          */
  __IOM uint32_t  EVENTS_DOWN;                  /*!< (@ 0x00000104) Downward crossing                                          */
  __IOM uint32_t  EVENTS_UP;                    /*!< (@ 0x00000108) Upward crossing                                            */
  __IOM uint32_t  EVENTS_CROSS;                 /*!< (@ 0x0000010C) Downward or upward crossing                                */
  __IM  uint32_t  RESERVED1[60];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED2[63];
  __IOM uint32_t  INTEN;                        /*!< (@ 0x00000300) Enable or disable interrupt                                */
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED3[61];
  __IM  uint32_t  RESULT;                       /*!< (@ 0x00000400) Compare result                                             */
  __IM  uint32_t  RESERVED4[63];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) COMP enable                                                */
  __IOM uint32_t  PSEL;                         /*!< (@ 0x00000504) Pin select                                                 */
  __IOM uint32_t  REFSEL;                       /*!< (@ 0x00000508) Reference source select for single-ended mode              */
  __IOM uint32_t  EXTREFSEL;                    /*!< (@ 0x0000050C) External reference select                                  */
  __IM  uint32_t  RESERVED5[8];
  __IOM uint32_t  TH;                           /*!< (@ 0x00000530) Threshold configuration for hysteresis unit                */
  __IOM uint32_t  MODE;                         /*!< (@ 0x00000534) Mode configuration                                         */
  __IOM uint32_t  HYST;                         /*!< (@ 0x00000538) Comparator hysteresis enable                               */
} NRF_COMP_Type;                                /*!< Size = 1340 (0x53c)                                                       */



/* =========================================================================================================================== */
/* ================                                          LPCOMP                                           ================ */
/* =========================================================================================================================== */


/**
  * @brief Low-power comparator (LPCOMP)
  */

typedef struct {                                /*!< (@ 0x40013000) LPCOMP Structure                                           */
  __OM  uint32_t  TASKS_START;                  /*!< (@ 0x00000000) Start comparator                                           */
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000004) Stop comparator                                            */
  __OM  uint32_t  TASKS_SAMPLE;                 /*!< (@ 0x00000008) Sample comparator value                                    */
  __IM  uint32_t  RESERVED[61];
  __IOM uint32_t  EVENTS_READY;                 /*!< (@ 0x00000100) LPCOMP is ready and output is valid                        */
  __IOM uint32_t  EVENTS_DOWN;                  /*!< (@ 0x00000104) Downward crossing                                          */
  __IOM uint32_t  EVENTS_UP;                    /*!< (@ 0x00000108) Upward crossing                                            */
  __IOM uint32_t  EVENTS_CROSS;                 /*!< (@ 0x0000010C) Downward or upward crossing                                */
  __IM  uint32_t  RESERVED1[60];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED2[64];
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED3[61];
  __IM  uint32_t  RESULT;                       /*!< (@ 0x00000400) Compare result                                             */
  __IM  uint32_t  RESERVED4[63];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable LPCOMP                                              */
  __IOM uint32_t  PSEL;                         /*!< (@ 0x00000504) Input pin select                                           */
  __IOM uint32_t  REFSEL;                       /*!< (@ 0x00000508) Reference select                                           */
  __IOM uint32_t  EXTREFSEL;                    /*!< (@ 0x0000050C) External reference select                                  */
  __IM  uint32_t  RESERVED5[4];
  __IOM uint32_t  ANADETECT;                    /*!< (@ 0x00000520) Analog detect configuration                                */
  __IM  uint32_t  RESERVED6[5];
  __IOM uint32_t  HYST;                         /*!< (@ 0x00000538) Comparator hysteresis enable                               */
} NRF_LPCOMP_Type;                              /*!< Size = 1340 (0x53c)                                                       */



/* =========================================================================================================================== */
/* ================                                           EGU0                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Event generator unit 0 (EGU0)
  */

typedef struct {                                /*!< (@ 0x40014000) EGU0 Structure                                             */
  __OM  uint32_t  TASKS_TRIGGER[16];            /*!< (@ 0x00000000) Description collection: Trigger n for triggering
                                                                    the corresponding TRIGGERED[n] event                       */
  __IM  uint32_t  RESERVED[48];
  __IOM uint32_t  EVENTS_TRIGGERED[16];         /*!< (@ 0x00000100) Description collection: Event number n generated
                                                                    by triggering the corresponding TRIGGER[n]
                                                                    task                                                       */
  __IM  uint32_t  RESERVED1[112];
  __IOM uint32_t  INTEN;                        /*!< (@ 0x00000300) Enable or disable interrupt                                */
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
} NRF_EGU_Type;                                 /*!< Size = 780 (0x30c)                                                        */



/* =========================================================================================================================== */
/* ================                                           SWI0                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Software interrupt 0 (SWI0)
  */

typedef struct {                                /*!< (@ 0x40014000) SWI0 Structure                                             */
  __IM  uint32_t  UNUSED;                       /*!< (@ 0x00000000) Unused.                                                    */
} NRF_SWI_Type;                                 /*!< Size = 4 (0x4)                                                            */



/* =========================================================================================================================== */
/* ================                                           PWM0                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Pulse width modulation unit 0 (PWM0)
  */

typedef struct {                                /*!< (@ 0x4001C000) PWM0 Structure                                             */
  __IM  uint32_t  RESERVED;
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000004) Stops PWM pulse generation on all channels at
                                                                    the end of current PWM period, and stops
                                                                    sequence playback                                          */
  __OM  uint32_t  TASKS_SEQSTART[2];            /*!< (@ 0x00000008) Description collection: Loads the first PWM value
                                                                    on all enabled channels from sequence n,
                                                                    and starts playing that sequence at the
                                                                    rate defined in SEQ[n]REFRESH and/or DECODER.MODE.
                                                                    Causes PWM generation to start if not running.             */
  __OM  uint32_t  TASKS_NEXTSTEP;               /*!< (@ 0x00000010) Steps by one value in the current sequence on
                                                                    all enabled channels if DECODER.MODE=NextStep.
                                                                    Does not cause PWM generation to start if
                                                                    not running.                                               */
  __IM  uint32_t  RESERVED1[60];
  __IOM uint32_t  EVENTS_STOPPED;               /*!< (@ 0x00000104) Response to STOP task, emitted when PWM pulses
                                                                    are no longer generated                                    */
  __IOM uint32_t  EVENTS_SEQSTARTED[2];         /*!< (@ 0x00000108) Description collection: First PWM period started
                                                                    on sequence n                                              */
  __IOM uint32_t  EVENTS_SEQEND[2];             /*!< (@ 0x00000110) Description collection: Emitted at end of every
                                                                    sequence n, when last value from RAM has
                                                                    been applied to wave counter                               */
  __IOM uint32_t  EVENTS_PWMPERIODEND;          /*!< (@ 0x00000118) Emitted at the end of each PWM period                      */
  __IOM uint32_t  EVENTS_LOOPSDONE;             /*!< (@ 0x0000011C) Concatenated sequences have been played the amount
                                                                    of times defined in LOOP.CNT                               */
  __IM  uint32_t  RESERVED2[56];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED3[63];
  __IOM uint32_t  INTEN;                        /*!< (@ 0x00000300) Enable or disable interrupt                                */
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED4[125];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) PWM module enable register                                 */
  __IOM uint32_t  MODE;                         /*!< (@ 0x00000504) Selects operating mode of the wave counter                 */
  __IOM uint32_t  COUNTERTOP;                   /*!< (@ 0x00000508) Value up to which the pulse generator counter
                                                                    counts                                                     */
  __IOM uint32_t  PRESCALER;                    /*!< (@ 0x0000050C) Configuration for PWM_CLK                                  */
  __IOM uint32_t  DECODER;                      /*!< (@ 0x00000510) Configuration of the decoder                               */
  __IOM uint32_t  LOOP;                         /*!< (@ 0x00000514) Number of playbacks of a loop                              */
  __IM  uint32_t  RESERVED5[2];
  __IOM PWM_SEQ_Type SEQ[2];                    /*!< (@ 0x00000520) Unspecified                                                */
  __IOM PWM_PSEL_Type PSEL;                     /*!< (@ 0x00000560) Unspecified                                                */
} NRF_PWM_Type;                                 /*!< Size = 1392 (0x570)                                                       */



/* =========================================================================================================================== */
/* ================                                            PDM                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Pulse Density Modulation (Digital Microphone) Interface (PDM)
  */

typedef struct {                                /*!< (@ 0x4001D000) PDM Structure                                              */
  __OM  uint32_t  TASKS_START;                  /*!< (@ 0x00000000) Starts continuous PDM transfer                             */
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000004) Stops PDM transfer                                         */
  __IM  uint32_t  RESERVED[62];
  __IOM uint32_t  EVENTS_STARTED;               /*!< (@ 0x00000100) PDM transfer has started                                   */
  __IOM uint32_t  EVENTS_STOPPED;               /*!< (@ 0x00000104) PDM transfer has finished                                  */
  __IOM uint32_t  EVENTS_END;                   /*!< (@ 0x00000108) The PDM has written the last sample specified
                                                                    by SAMPLE.MAXCNT (or the last sample after
                                                                    a STOP task has been received) to Data RAM                 */
  __IM  uint32_t  RESERVED1[125];
  __IOM uint32_t  INTEN;                        /*!< (@ 0x00000300) Enable or disable interrupt                                */
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED2[125];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) PDM module enable register                                 */
  __IOM uint32_t  PDMCLKCTRL;                   /*!< (@ 0x00000504) PDM clock generator control                                */
  __IOM uint32_t  MODE;                         /*!< (@ 0x00000508) Defines the routing of the connected PDM microphones'
                                                                    signals                                                    */
  __IM  uint32_t  RESERVED3[3];
  __IOM uint32_t  GAINL;                        /*!< (@ 0x00000518) Left output gain adjustment                                */
  __IOM uint32_t  GAINR;                        /*!< (@ 0x0000051C) Right output gain adjustment                               */
  __IOM uint32_t  RATIO;                        /*!< (@ 0x00000520) Selects the ratio between PDM_CLK and output
                                                                    sample rate. Change PDMCLKCTRL accordingly.                */
  __IM  uint32_t  RESERVED4[7];
  __IOM PDM_PSEL_Type PSEL;                     /*!< (@ 0x00000540) Unspecified                                                */
  __IM  uint32_t  RESERVED5[6];
  __IOM PDM_SAMPLE_Type SAMPLE;                 /*!< (@ 0x00000560) Unspecified                                                */
} NRF_PDM_Type;                                 /*!< Size = 1384 (0x568)                                                       */



/* =========================================================================================================================== */
/* ================                                            ACL                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Access control lists (ACL)
  */

typedef struct {                                /*!< (@ 0x4001E000) ACL Structure                                              */
  __IM  uint32_t  RESERVED[512];
  __IOM ACL_ACL_Type ACL[8];                    /*!< (@ 0x00000800) Unspecified                                                */
} NRF_ACL_Type;                                 /*!< Size = 2176 (0x880)                                                       */



/* =========================================================================================================================== */
/* ================                                           NVMC                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Non Volatile Memory Controller (NVMC)
  */

typedef struct {                                /*!< (@ 0x4001E000) NVMC Structure                                             */
  __IM  uint32_t  RESERVED[256];
  __IM  uint32_t  READY;                        /*!< (@ 0x00000400) Ready flag                                                 */
  __IM  uint32_t  RESERVED1;
  __IM  uint32_t  READYNEXT;                    /*!< (@ 0x00000408) Ready flag                                                 */
  __IM  uint32_t  RESERVED2[62];
  __IOM uint32_t  CONFIG;                       /*!< (@ 0x00000504) Configuration register                                     */
  
  union {
    __OM  uint32_t ERASEPAGE;                   /*!< (@ 0x00000508) Register for erasing a page in code area                   */
    __OM  uint32_t ERASEPCR1;                   /*!< (@ 0x00000508) Deprecated register - Register for erasing a
                                                                    page in code area, equivalent to ERASEPAGE                 */
  };
  __OM  uint32_t  ERASEALL;                     /*!< (@ 0x0000050C) Register for erasing all non-volatile user memory          */
  __OM  uint32_t  ERASEPCR0;                    /*!< (@ 0x00000510) Deprecated register - Register for erasing a
                                                                    page in code area, equivalent to ERASEPAGE                 */
  __OM  uint32_t  ERASEUICR;                    /*!< (@ 0x00000514) Register for erasing user information configuration
                                                                    registers                                                  */
  __OM  uint32_t  ERASEPAGEPARTIAL;             /*!< (@ 0x00000518) Register for partial erase of a page in code
                                                                    area                                                       */
  __IOM uint32_t  ERASEPAGEPARTIALCFG;          /*!< (@ 0x0000051C) Register for partial erase configuration                   */
  __IM  uint32_t  RESERVED3[8];
  __IOM uint32_t  ICACHECNF;                    /*!< (@ 0x00000540) I-code cache configuration register                        */
  __IM  uint32_t  RESERVED4;
  __IOM uint32_t  IHIT;                         /*!< (@ 0x00000548) I-code cache hit counter                                   */
  __IOM uint32_t  IMISS;                        /*!< (@ 0x0000054C) I-code cache miss counter                                  */
} NRF_NVMC_Type;                                /*!< Size = 1360 (0x550)                                                       */



/* =========================================================================================================================== */
/* ================                                            PPI                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Programmable Peripheral Interconnect (PPI)
  */

typedef struct {                                /*!< (@ 0x4001F000) PPI Structure                                              */
  __OM  PPI_TASKS_CHG_Type TASKS_CHG[6];        /*!< (@ 0x00000000) Channel group tasks                                        */
  __IM  uint32_t  RESERVED[308];
  __IOM uint32_t  CHEN;                         /*!< (@ 0x00000500) Channel enable register                                    */
  __IOM uint32_t  CHENSET;                      /*!< (@ 0x00000504) Channel enable set register                                */
  __IOM uint32_t  CHENCLR;                      /*!< (@ 0x00000508) Channel enable clear register                              */
  __IM  uint32_t  RESERVED1;
  __IOM PPI_CH_Type CH[20];                     /*!< (@ 0x00000510) PPI Channel                                                */
  __IM  uint32_t  RESERVED2[148];
  __IOM uint32_t  CHG[6];                       /*!< (@ 0x00000800) Description collection: Channel group n                    */
  __IM  uint32_t  RESERVED3[62];
  __IOM PPI_FORK_Type FORK[32];                 /*!< (@ 0x00000910) Fork                                                       */
} NRF_PPI_Type;                                 /*!< Size = 2448 (0x990)                                                       */



/* =========================================================================================================================== */
/* ================                                            MWU                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Memory Watch Unit (MWU)
  */

typedef struct {                                /*!< (@ 0x40020000) MWU Structure                                              */
  __IM  uint32_t  RESERVED[64];
  __IOM MWU_EVENTS_REGION_Type EVENTS_REGION[4];/*!< (@ 0x00000100) Peripheral events.                                         */
  __IM  uint32_t  RESERVED1[16];
  __IOM MWU_EVENTS_PREGION_Type EVENTS_PREGION[2];/*!< (@ 0x00000160) Peripheral events.                                       */
  __IM  uint32_t  RESERVED2[100];
  __IOM uint32_t  INTEN;                        /*!< (@ 0x00000300) Enable or disable interrupt                                */
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED3[5];
  __IOM uint32_t  NMIEN;                        /*!< (@ 0x00000320) Enable or disable interrupt                                */
  __IOM uint32_t  NMIENSET;                     /*!< (@ 0x00000324) Enable interrupt                                           */
  __IOM uint32_t  NMIENCLR;                     /*!< (@ 0x00000328) Disable interrupt                                          */
  __IM  uint32_t  RESERVED4[53];
  __IOM MWU_PERREGION_Type PERREGION[2];        /*!< (@ 0x00000400) Unspecified                                                */
  __IM  uint32_t  RESERVED5[64];
  __IOM uint32_t  REGIONEN;                     /*!< (@ 0x00000510) Enable/disable regions watch                               */
  __IOM uint32_t  REGIONENSET;                  /*!< (@ 0x00000514) Enable regions watch                                       */
  __IOM uint32_t  REGIONENCLR;                  /*!< (@ 0x00000518) Disable regions watch                                      */
  __IM  uint32_t  RESERVED6[57];
  __IOM MWU_REGION_Type REGION[4];              /*!< (@ 0x00000600) Unspecified                                                */
  __IM  uint32_t  RESERVED7[32];
  __IOM MWU_PREGION_Type PREGION[2];            /*!< (@ 0x000006C0) Unspecified                                                */
} NRF_MWU_Type;                                 /*!< Size = 1760 (0x6e0)                                                       */



/* =========================================================================================================================== */
/* ================                                            I2S                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Inter-IC Sound (I2S)
  */

typedef struct {                                /*!< (@ 0x40025000) I2S Structure                                              */
  __OM  uint32_t  TASKS_START;                  /*!< (@ 0x00000000) Starts continuous I2S transfer. Also starts MCK
                                                                    generator when this is enabled.                            */
  __OM  uint32_t  TASKS_STOP;                   /*!< (@ 0x00000004) Stops I2S transfer. Also stops MCK generator.
                                                                    Triggering this task will cause the STOPPED
                                                                    event to be generated.                                     */
  __IM  uint32_t  RESERVED[63];
  __IOM uint32_t  EVENTS_RXPTRUPD;              /*!< (@ 0x00000104) The RXD.PTR register has been copied to internal
                                                                    double-buffers. When the I2S module is started
                                                                    and RX is enabled, this event will be generated
                                                                    for every RXTXD.MAXCNT words that are received
                                                                    on the SDIN pin.                                           */
  __IOM uint32_t  EVENTS_STOPPED;               /*!< (@ 0x00000108) I2S transfer stopped.                                      */
  __IM  uint32_t  RESERVED1[2];
  __IOM uint32_t  EVENTS_TXPTRUPD;              /*!< (@ 0x00000114) The TDX.PTR register has been copied to internal
                                                                    double-buffers. When the I2S module is started
                                                                    and TX is enabled, this event will be generated
                                                                    for every RXTXD.MAXCNT words that are sent
                                                                    on the SDOUT pin.                                          */
  __IM  uint32_t  RESERVED2[122];
  __IOM uint32_t  INTEN;                        /*!< (@ 0x00000300) Enable or disable interrupt                                */
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED3[125];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable I2S module.                                         */
  __IOM I2S_CONFIG_Type CONFIG;                 /*!< (@ 0x00000504) Unspecified                                                */
  __IM  uint32_t  RESERVED4[3];
  __IOM I2S_RXD_Type RXD;                       /*!< (@ 0x00000538) Unspecified                                                */
  __IM  uint32_t  RESERVED5;
  __IOM I2S_TXD_Type TXD;                       /*!< (@ 0x00000540) Unspecified                                                */
  __IM  uint32_t  RESERVED6[3];
  __IOM I2S_RXTXD_Type RXTXD;                   /*!< (@ 0x00000550) Unspecified                                                */
  __IM  uint32_t  RESERVED7[3];
  __IOM I2S_PSEL_Type PSEL;                     /*!< (@ 0x00000560) Unspecified                                                */
} NRF_I2S_Type;                                 /*!< Size = 1396 (0x574)                                                       */



/* =========================================================================================================================== */
/* ================                                            FPU                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief FPU (FPU)
  */

typedef struct {                                /*!< (@ 0x40026000) FPU Structure                                              */
  __IM  uint32_t  UNUSED;                       /*!< (@ 0x00000000) Unused.                                                    */
} NRF_FPU_Type;                                 /*!< Size = 4 (0x4)                                                            */



/* =========================================================================================================================== */
/* ================                                           USBD                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief Universal serial bus device (USBD)
  */

typedef struct {                                /*!< (@ 0x40027000) USBD Structure                                             */
  __IM  uint32_t  RESERVED;
  __OM  uint32_t  TASKS_STARTEPIN[8];           /*!< (@ 0x00000004) Description collection: Captures the EPIN[n].PTR
                                                                    and EPIN[n].MAXCNT registers values, and
                                                                    enables endpoint IN n to respond to traffic
                                                                    from host                                                  */
  __OM  uint32_t  TASKS_STARTISOIN;             /*!< (@ 0x00000024) Captures the ISOIN.PTR and ISOIN.MAXCNT registers
                                                                    values, and enables sending data on ISO
                                                                    endpoint                                                   */
  __OM  uint32_t  TASKS_STARTEPOUT[8];          /*!< (@ 0x00000028) Description collection: Captures the EPOUT[n].PTR
                                                                    and EPOUT[n].MAXCNT registers values, and
                                                                    enables endpoint n to respond to traffic
                                                                    from host                                                  */
  __OM  uint32_t  TASKS_STARTISOOUT;            /*!< (@ 0x00000048) Captures the ISOOUT.PTR and ISOOUT.MAXCNT registers
                                                                    values, and enables receiving of data on
                                                                    ISO endpoint                                               */
  __OM  uint32_t  TASKS_EP0RCVOUT;              /*!< (@ 0x0000004C) Allows OUT data stage on control endpoint 0                */
  __OM  uint32_t  TASKS_EP0STATUS;              /*!< (@ 0x00000050) Allows status stage on control endpoint 0                  */
  __OM  uint32_t  TASKS_EP0STALL;               /*!< (@ 0x00000054) Stalls data and status stage on control endpoint
                                                                    0                                                          */
  __OM  uint32_t  TASKS_DPDMDRIVE;              /*!< (@ 0x00000058) Forces D+ and D- lines into the state defined
                                                                    in the DPDMVALUE register                                  */
  __OM  uint32_t  TASKS_DPDMNODRIVE;            /*!< (@ 0x0000005C) Stops forcing D+ and D- lines into any state
                                                                    (USB engine takes control)                                 */
  __IM  uint32_t  RESERVED1[40];
  __IOM uint32_t  EVENTS_USBRESET;              /*!< (@ 0x00000100) Signals that a USB reset condition has been detected
                                                                    on USB lines                                               */
  __IOM uint32_t  EVENTS_STARTED;               /*!< (@ 0x00000104) Confirms that the EPIN[n].PTR and EPIN[n].MAXCNT,
                                                                    or EPOUT[n].PTR and EPOUT[n].MAXCNT registers
                                                                    have been captured on all endpoints reported
                                                                    in the EPSTATUS register                                   */
  __IOM uint32_t  EVENTS_ENDEPIN[8];            /*!< (@ 0x00000108) Description collection: The whole EPIN[n] buffer
                                                                    has been consumed. The buffer can be accessed
                                                                    safely by software.                                        */
  __IOM uint32_t  EVENTS_EP0DATADONE;           /*!< (@ 0x00000128) An acknowledged data transfer has taken place
                                                                    on the control endpoint                                    */
  __IOM uint32_t  EVENTS_ENDISOIN;              /*!< (@ 0x0000012C) The whole ISOIN buffer has been consumed. The
                                                                    buffer can be accessed safely by software.                 */
  __IOM uint32_t  EVENTS_ENDEPOUT[8];           /*!< (@ 0x00000130) Description collection: The whole EPOUT[n] buffer
                                                                    has been consumed. The buffer can be accessed
                                                                    safely by software.                                        */
  __IOM uint32_t  EVENTS_ENDISOOUT;             /*!< (@ 0x00000150) The whole ISOOUT buffer has been consumed. The
                                                                    buffer can be accessed safely by software.                 */
  __IOM uint32_t  EVENTS_SOF;                   /*!< (@ 0x00000154) Signals that a SOF (start of frame) condition
                                                                    has been detected on USB lines                             */
  __IOM uint32_t  EVENTS_USBEVENT;              /*!< (@ 0x00000158) An event or an error not covered by specific
                                                                    events has occurred. Check EVENTCAUSE register
                                                                    to find the cause.                                         */
  __IOM uint32_t  EVENTS_EP0SETUP;              /*!< (@ 0x0000015C) A valid SETUP token has been received (and acknowledged)
                                                                    on the control endpoint                                    */
  __IOM uint32_t  EVENTS_EPDATA;                /*!< (@ 0x00000160) A data transfer has occurred on a data endpoint,
                                                                    indicated by the EPDATASTATUS register                     */
  __IM  uint32_t  RESERVED2[39];
  __IOM uint32_t  SHORTS;                       /*!< (@ 0x00000200) Shortcuts between local events and tasks                   */
  __IM  uint32_t  RESERVED3[63];
  __IOM uint32_t  INTEN;                        /*!< (@ 0x00000300) Enable or disable interrupt                                */
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED4[61];
  __IOM uint32_t  EVENTCAUSE;                   /*!< (@ 0x00000400) Details on what caused the USBEVENT event                  */
  __IM  uint32_t  RESERVED5[7];
  __IOM USBD_HALTED_Type HALTED;                /*!< (@ 0x00000420) Unspecified                                                */
  __IM  uint32_t  RESERVED6;
  __IOM uint32_t  EPSTATUS;                     /*!< (@ 0x00000468) Provides information on which endpoint's EasyDMA
                                                                    registers have been captured                               */
  __IOM uint32_t  EPDATASTATUS;                 /*!< (@ 0x0000046C) Provides information on which endpoint(s) an
                                                                    acknowledged data transfer has occurred
                                                                    (EPDATA event)                                             */
  __IM  uint32_t  USBADDR;                      /*!< (@ 0x00000470) Device USB address                                         */
  __IM  uint32_t  RESERVED7[3];
  __IM  uint32_t  BMREQUESTTYPE;                /*!< (@ 0x00000480) SETUP data, byte 0, bmRequestType                          */
  __IM  uint32_t  BREQUEST;                     /*!< (@ 0x00000484) SETUP data, byte 1, bRequest                               */
  __IM  uint32_t  WVALUEL;                      /*!< (@ 0x00000488) SETUP data, byte 2, LSB of wValue                          */
  __IM  uint32_t  WVALUEH;                      /*!< (@ 0x0000048C) SETUP data, byte 3, MSB of wValue                          */
  __IM  uint32_t  WINDEXL;                      /*!< (@ 0x00000490) SETUP data, byte 4, LSB of wIndex                          */
  __IM  uint32_t  WINDEXH;                      /*!< (@ 0x00000494) SETUP data, byte 5, MSB of wIndex                          */
  __IM  uint32_t  WLENGTHL;                     /*!< (@ 0x00000498) SETUP data, byte 6, LSB of wLength                         */
  __IM  uint32_t  WLENGTHH;                     /*!< (@ 0x0000049C) SETUP data, byte 7, MSB of wLength                         */
  __IOM USBD_SIZE_Type SIZE;                    /*!< (@ 0x000004A0) Unspecified                                                */
  __IM  uint32_t  RESERVED8[15];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable USB                                                 */
  __IOM uint32_t  USBPULLUP;                    /*!< (@ 0x00000504) Control of the USB pull-up                                 */
  __IOM uint32_t  DPDMVALUE;                    /*!< (@ 0x00000508) State D+ and D- lines will be forced into by
                                                                    the DPDMDRIVE task. The DPDMNODRIVE task
                                                                    reverts the control of the lines to MAC
                                                                    IP (no forcing).                                           */
  __IOM uint32_t  DTOGGLE;                      /*!< (@ 0x0000050C) Data toggle control and status                             */
  __IOM uint32_t  EPINEN;                       /*!< (@ 0x00000510) Endpoint IN enable                                         */
  __IOM uint32_t  EPOUTEN;                      /*!< (@ 0x00000514) Endpoint OUT enable                                        */
  __OM  uint32_t  EPSTALL;                      /*!< (@ 0x00000518) STALL endpoints                                            */
  __IOM uint32_t  ISOSPLIT;                     /*!< (@ 0x0000051C) Controls the split of ISO buffers                          */
  __IM  uint32_t  FRAMECNTR;                    /*!< (@ 0x00000520) Returns the current value of the start of frame
                                                                    counter                                                    */
  __IM  uint32_t  RESERVED9[2];
  __IOM uint32_t  LOWPOWER;                     /*!< (@ 0x0000052C) Controls USBD peripheral low power mode during
                                                                    USB suspend                                                */
  __IOM uint32_t  ISOINCONFIG;                  /*!< (@ 0x00000530) Controls the response of the ISO IN endpoint
                                                                    to an IN token when no data is ready to
                                                                    be sent                                                    */
  __IM  uint32_t  RESERVED10[51];
  __IOM USBD_EPIN_Type EPIN[8];                 /*!< (@ 0x00000600) Unspecified                                                */
  __IOM USBD_ISOIN_Type ISOIN;                  /*!< (@ 0x000006A0) Unspecified                                                */
  __IM  uint32_t  RESERVED11[21];
  __IOM USBD_EPOUT_Type EPOUT[8];               /*!< (@ 0x00000700) Unspecified                                                */
  __IOM USBD_ISOOUT_Type ISOOUT;                /*!< (@ 0x000007A0) Unspecified                                                */
} NRF_USBD_Type;                                /*!< Size = 1964 (0x7ac)                                                       */



/* =========================================================================================================================== */
/* ================                                           QSPI                                            ================ */
/* =========================================================================================================================== */


/**
  * @brief External flash interface (QSPI)
  */

typedef struct {                                /*!< (@ 0x40029000) QSPI Structure                                             */
  __OM  uint32_t  TASKS_ACTIVATE;               /*!< (@ 0x00000000) Activate QSPI interface                                    */
  __OM  uint32_t  TASKS_READSTART;              /*!< (@ 0x00000004) Start transfer from external flash memory to
                                                                    internal RAM                                               */
  __OM  uint32_t  TASKS_WRITESTART;             /*!< (@ 0x00000008) Start transfer from internal RAM to external
                                                                    flash memory                                               */
  __OM  uint32_t  TASKS_ERASESTART;             /*!< (@ 0x0000000C) Start external flash memory erase operation                */
  __OM  uint32_t  TASKS_DEACTIVATE;             /*!< (@ 0x00000010) Deactivate QSPI interface                                  */
  __IM  uint32_t  RESERVED[59];
  __IOM uint32_t  EVENTS_READY;                 /*!< (@ 0x00000100) QSPI peripheral is ready. This event will be
                                                                    generated as a response to any QSPI task.                  */
  __IM  uint32_t  RESERVED1[127];
  __IOM uint32_t  INTEN;                        /*!< (@ 0x00000300) Enable or disable interrupt                                */
  __IOM uint32_t  INTENSET;                     /*!< (@ 0x00000304) Enable interrupt                                           */
  __IOM uint32_t  INTENCLR;                     /*!< (@ 0x00000308) Disable interrupt                                          */
  __IM  uint32_t  RESERVED2[125];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable QSPI peripheral and acquire the pins selected
                                                                    in PSELn registers                                         */
  __IOM QSPI_READ_Type READ;                    /*!< (@ 0x00000504) Unspecified                                                */
  __IOM QSPI_WRITE_Type WRITE;                  /*!< (@ 0x00000510) Unspecified                                                */
  __IOM QSPI_ERASE_Type ERASE;                  /*!< (@ 0x0000051C) Unspecified                                                */
  __IOM QSPI_PSEL_Type PSEL;                    /*!< (@ 0x00000524) Unspecified                                                */
  __IOM uint32_t  XIPOFFSET;                    /*!< (@ 0x00000540) Address offset into the external memory for Execute
                                                                    in Place operation.                                        */
  __IOM uint32_t  IFCONFIG0;                    /*!< (@ 0x00000544) Interface configuration.                                   */
  __IM  uint32_t  RESERVED3[46];
  __IOM uint32_t  IFCONFIG1;                    /*!< (@ 0x00000600) Interface configuration.                                   */
  __IM  uint32_t  STATUS;                       /*!< (@ 0x00000604) Status register.                                           */
  __IM  uint32_t  RESERVED4[3];
  __IOM uint32_t  DPMDUR;                       /*!< (@ 0x00000614) Set the duration required to enter/exit deep
                                                                    power-down mode (DPM).                                     */
  __IM  uint32_t  RESERVED5[3];
  __IOM uint32_t  ADDRCONF;                     /*!< (@ 0x00000624) Extended address configuration.                            */
  __IM  uint32_t  RESERVED6[3];
  __IOM uint32_t  CINSTRCONF;                   /*!< (@ 0x00000634) Custom instruction configuration register.                 */
  __IOM uint32_t  CINSTRDAT0;                   /*!< (@ 0x00000638) Custom instruction data register 0.                        */
  __IOM uint32_t  CINSTRDAT1;                   /*!< (@ 0x0000063C) Custom instruction data register 1.                        */
  __IOM uint32_t  IFTIMING;                     /*!< (@ 0x00000640) SPI interface timing.                                      */
} NRF_QSPI_Type;                                /*!< Size = 1604 (0x644)                                                       */



/* =========================================================================================================================== */
/* ================                                        CC_HOST_RGF                                        ================ */
/* =========================================================================================================================== */


/**
  * @brief CRYPTOCELL HOST_RGF interface (CC_HOST_RGF)
  */

typedef struct {                                /*!< (@ 0x5002A000) CC_HOST_RGF Structure                                      */
  __IM  uint32_t  RESERVED[1678];
  __IOM uint32_t  HOST_CRYPTOKEY_SEL;           /*!< (@ 0x00001A38) AES hardware key select                                    */
  __IM  uint32_t  RESERVED1[4];
  __IOM uint32_t  HOST_IOT_KPRTL_LOCK;          /*!< (@ 0x00001A4C) This write-once register is the K_PRTL lock register.
                                                                    When this register is set, K_PRTL cannot
                                                                    be used and a zeroed key will be used instead.
                                                                    The value of this register is saved in the
                                                                    CRYPTOCELL AO power domain.                                */
  __IOM uint32_t  HOST_IOT_KDR0;                /*!< (@ 0x00001A50) This register holds bits 31:0 of K_DR. The value
                                                                    of this register is saved in the CRYPTOCELL
                                                                    AO power domain. Reading from this address
                                                                    returns the K_DR valid status indicating
                                                                    if K_DR is successfully retained.                          */
  __OM  uint32_t  HOST_IOT_KDR1;                /*!< (@ 0x00001A54) This register holds bits 63:32 of K_DR. The value
                                                                    of this register is saved in the CRYPTOCELL
                                                                    AO power domain.                                           */
  __OM  uint32_t  HOST_IOT_KDR2;                /*!< (@ 0x00001A58) This register holds bits 95:64 of K_DR. The value
                                                                    of this register is saved in the CRYPTOCELL
                                                                    AO power domain.                                           */
  __OM  uint32_t  HOST_IOT_KDR3;                /*!< (@ 0x00001A5C) This register holds bits 127:96 of K_DR. The
                                                                    value of this register is saved in the CRYPTOCELL
                                                                    AO power domain.                                           */
  __IOM uint32_t  HOST_IOT_LCS;                 /*!< (@ 0x00001A60) Controls lifecycle state (LCS) for CRYPTOCELL
                                                                    subsystem                                                  */
} NRF_CC_HOST_RGF_Type;                         /*!< Size = 6756 (0x1a64)                                                      */



/* =========================================================================================================================== */
/* ================                                        CRYPTOCELL                                         ================ */
/* =========================================================================================================================== */


/**
  * @brief ARM TrustZone CryptoCell register interface (CRYPTOCELL)
  */

typedef struct {                                /*!< (@ 0x5002A000) CRYPTOCELL Structure                                       */
  __IM  uint32_t  RESERVED[320];
  __IOM uint32_t  ENABLE;                       /*!< (@ 0x00000500) Enable CRYPTOCELL subsystem                                */
} NRF_CRYPTOCELL_Type;                          /*!< Size = 1284 (0x504)                                                       */


/** @} */ /* End of group Device_Peripheral_peripherals */


/* =========================================================================================================================== */
/* ================                          Device Specific Peripheral Address Map                           ================ */
/* =========================================================================================================================== */


/** @addtogroup Device_Peripheral_peripheralAddr
  * @{
  */

#define NRF_FICR_BASE               0x10000000UL
#define NRF_UICR_BASE               0x10001000UL
#define NRF_APPROTECT_BASE          0x40000000UL
#define NRF_CLOCK_BASE              0x40000000UL
#define NRF_POWER_BASE              0x40000000UL
#define NRF_P0_BASE                 0x50000000UL
#define NRF_P1_BASE                 0x50000300UL
#define NRF_RADIO_BASE              0x40001000UL
#define NRF_UART0_BASE              0x40002000UL
#define NRF_UARTE0_BASE             0x40002000UL
#define NRF_SPI0_BASE               0x40003000UL
#define NRF_SPIM0_BASE              0x40003000UL
#define NRF_SPIS0_BASE              0x40003000UL
#define NRF_TWI0_BASE               0x40003000UL
#define NRF_TWIM0_BASE              0x40003000UL
#define NRF_TWIS0_BASE              0x40003000UL
#define NRF_SPI1_BASE               0x40004000UL
#define NRF_SPIM1_BASE              0x40004000UL
#define NRF_SPIS1_BASE              0x40004000UL
#define NRF_TWI1_BASE               0x40004000UL
#define NRF_TWIM1_BASE              0x40004000UL
#define NRF_TWIS1_BASE              0x40004000UL
#define NRF_NFCT_BASE               0x40005000UL
#define NRF_GPIOTE_BASE             0x40006000UL
#define NRF_SAADC_BASE              0x40007000UL
#define NRF_TIMER0_BASE             0x40008000UL
#define NRF_TIMER1_BASE             0x40009000UL
#define NRF_TIMER2_BASE             0x4000A000UL
#define NRF_RTC0_BASE               0x4000B000UL
#define NRF_TEMP_BASE               0x4000C000UL
#define NRF_RNG_BASE                0x4000D000UL
#define NRF_ECB_BASE                0x4000E000UL
#define NRF_AAR_BASE                0x4000F000UL
#define NRF_CCM_BASE                0x4000F000UL
#define NRF_WDT_BASE                0x40010000UL
#define NRF_RTC1_BASE               0x40011000UL
#define NRF_QDEC_BASE               0x40012000UL
#define NRF_COMP_BASE               0x40013000UL
#define NRF_LPCOMP_BASE             0x40013000UL
#define NRF_EGU0_BASE               0x40014000UL
#define NRF_SWI0_BASE               0x40014000UL
#define NRF_EGU1_BASE               0x40015000UL
#define NRF_SWI1_BASE               0x40015000UL
#define NRF_EGU2_BASE               0x40016000UL
#define NRF_SWI2_BASE               0x40016000UL
#define NRF_EGU3_BASE               0x40017000UL
#define NRF_SWI3_BASE               0x40017000UL
#define NRF_EGU4_BASE               0x40018000UL
#define NRF_SWI4_BASE               0x40018000UL
#define NRF_EGU5_BASE               0x40019000UL
#define NRF_SWI5_BASE               0x40019000UL
#define NRF_TIMER3_BASE             0x4001A000UL
#define NRF_TIMER4_BASE             0x4001B000UL
#define NRF_PWM0_BASE               0x4001C000UL
#define NRF_PDM_BASE                0x4001D000UL
#define NRF_ACL_BASE                0x4001E000UL
#define NRF_NVMC_BASE               0x4001E000UL
#define NRF_PPI_BASE                0x4001F000UL
#define NRF_MWU_BASE                0x40020000UL
#define NRF_PWM1_BASE               0x40021000UL
#define NRF_PWM2_BASE               0x40022000UL
#define NRF_SPI2_BASE               0x40023000UL
#define NRF_SPIM2_BASE              0x40023000UL
#define NRF_SPIS2_BASE              0x40023000UL
#define NRF_RTC2_BASE               0x40024000UL
#define NRF_I2S_BASE                0x40025000UL
#define NRF_FPU_BASE                0x40026000UL
#define NRF_USBD_BASE               0x40027000UL
#define NRF_UARTE1_BASE             0x40028000UL
#define NRF_QSPI_BASE               0x40029000UL
#define NRF_CC_HOST_RGF_BASE        0x5002A000UL
#define NRF_CRYPTOCELL_BASE         0x5002A000UL
#define NRF_PWM3_BASE               0x4002D000UL
#define NRF_SPIM3_BASE              0x4002F000UL

/** @} */ /* End of group Device_Peripheral_peripheralAddr */


/* =========================================================================================================================== */
/* ================                                  Peripheral declaration                                   ================ */
/* =========================================================================================================================== */


/** @addtogroup Device_Peripheral_declaration
  * @{
  */

#define NRF_FICR                    ((NRF_FICR_Type*)          NRF_FICR_BASE)
#define NRF_UICR                    ((NRF_UICR_Type*)          NRF_UICR_BASE)
#define NRF_APPROTECT               ((NRF_APPROTECT_Type*)     NRF_APPROTECT_BASE)
#define NRF_CLOCK                   ((NRF_CLOCK_Type*)         NRF_CLOCK_BASE)
#define NRF_POWER                   ((NRF_POWER_Type*)         NRF_POWER_BASE)
#define NRF_P0                      ((NRF_GPIO_Type*)          NRF_P0_BASE)
#define NRF_P1                      ((NRF_GPIO_Type*)          NRF_P1_BASE)
#define NRF_RADIO                   ((NRF_RADIO_Type*)         NRF_RADIO_BASE)
#define NRF_UART0                   ((NRF_UART_Type*)          NRF_UART0_BASE)
#define NRF_UARTE0                  ((NRF_UARTE_Type*)         NRF_UARTE0_BASE)
#define NRF_SPI0                    ((NRF_SPI_Type*)           NRF_SPI0_BASE)
#define NRF_SPIM0                   ((NRF_SPIM_Type*)          NRF_SPIM0_BASE)
#define NRF_SPIS0                   ((NRF_SPIS_Type*)          NRF_SPIS0_BASE)
#define NRF_TWI0                    ((NRF_TWI_Type*)           NRF_TWI0_BASE)
#define NRF_TWIM0                   ((NRF_TWIM_Type*)          NRF_TWIM0_BASE)
#define NRF_TWIS0                   ((NRF_TWIS_Type*)          NRF_TWIS0_BASE)
#define NRF_SPI1                    ((NRF_SPI_Type*)           NRF_SPI1_BASE)
#define NRF_SPIM1                   ((NRF_SPIM_Type*)          NRF_SPIM1_BASE)
#define NRF_SPIS1                   ((NRF_SPIS_Type*)          NRF_SPIS1_BASE)
#define NRF_TWI1                    ((NRF_TWI_Type*)           NRF_TWI1_BASE)
#define NRF_TWIM1                   ((NRF_TWIM_Type*)          NRF_TWIM1_BASE)
#define NRF_TWIS1                   ((NRF_TWIS_Type*)          NRF_TWIS1_BASE)
#define NRF_NFCT                    ((NRF_NFCT_Type*)          NRF_NFCT_BASE)
#define NRF_GPIOTE                  ((NRF_GPIOTE_Type*)        NRF_GPIOTE_BASE)
#define NRF_SAADC                   ((NRF_SAADC_Type*)         NRF_SAADC_BASE)
#define NRF_TIMER0                  ((NRF_TIMER_Type*)         NRF_TIMER0_BASE)
#define NRF_TIMER1                  ((NRF_TIMER_Type*)         NRF_TIMER1_BASE)
#define NRF_TIMER2                  ((NRF_TIMER_Type*)         NRF_TIMER2_BASE)
#define NRF_RTC0                    ((NRF_RTC_Type*)           NRF_RTC0_BASE)
#define NRF_TEMP                    ((NRF_TEMP_Type*)          NRF_TEMP_BASE)
#define NRF_RNG                     ((NRF_RNG_Type*)           NRF_RNG_BASE)
#define NRF_ECB                     ((NRF_ECB_Type*)           NRF_ECB_BASE)
#define NRF_AAR                     ((NRF_AAR_Type*)           NRF_AAR_BASE)
#define NRF_CCM                     ((NRF_CCM_Type*)           NRF_CCM_BASE)
#define NRF_WDT                     ((NRF_WDT_Type*)           NRF_WDT_BASE)
#define NRF_RTC1                    ((NRF_RTC_Type*)           NRF_RTC1_BASE)
#define NRF_QDEC                    ((NRF_QDEC_Type*)          NRF_QDEC_BASE)
#define NRF_COMP                    ((NRF_COMP_Type*)          NRF_COMP_BASE)
#define NRF_LPCOMP                  ((NRF_LPCOMP_Type*)        NRF_LPCOMP_BASE)
#define NRF_EGU0                    ((NRF_EGU_Type*)           NRF_EGU0_BASE)
#define NRF_SWI0                    ((NRF_SWI_Type*)           NRF_SWI0_BASE)
#define NRF_EGU1                    ((NRF_EGU_Type*)           NRF_EGU1_BASE)
#define NRF_SWI1                    ((NRF_SWI_Type*)           NRF_SWI1_BASE)
#define NRF_EGU2                    ((NRF_EGU_Type*)           NRF_EGU2_BASE)
#define NRF_SWI2                    ((NRF_SWI_Type*)           NRF_SWI2_BASE)
#define NRF_EGU3                    ((NRF_EGU_Type*)           NRF_EGU3_BASE)
#define NRF_SWI3                    ((NRF_SWI_Type*)           NRF_SWI3_BASE)
#define NRF_EGU4                    ((NRF_EGU_Type*)           NRF_EGU4_BASE)
#define NRF_SWI4                    ((NRF_SWI_Type*)           NRF_SWI4_BASE)
#define NRF_EGU5                    ((NRF_EGU_Type*)           NRF_EGU5_BASE)
#define NRF_SWI5                    ((NRF_SWI_Type*)           NRF_SWI5_BASE)
#define NRF_TIMER3                  ((NRF_TIMER_Type*)         NRF_TIMER3_BASE)
#define NRF_TIMER4                  ((NRF_TIMER_Type*)         NRF_TIMER4_BASE)
#define NRF_PWM0                    ((NRF_PWM_Type*)           NRF_PWM0_BASE)
#define NRF_PDM                     ((NRF_PDM_Type*)           NRF_PDM_BASE)
#define NRF_ACL                     ((NRF_ACL_Type*)           NRF_ACL_BASE)
#define NRF_NVMC                    ((NRF_NVMC_Type*)          NRF_NVMC_BASE)
#define NRF_PPI                     ((NRF_PPI_Type*)           NRF_PPI_BASE)
#define NRF_MWU                     ((NRF_MWU_Type*)           NRF_MWU_BASE)
#define NRF_PWM1                    ((NRF_PWM_Type*)           NRF_PWM1_BASE)
#define NRF_PWM2                    ((NRF_PWM_Type*)           NRF_PWM2_BASE)
#define NRF_SPI2                    ((NRF_SPI_Type*)           NRF_SPI2_BASE)
#define NRF_SPIM2                   ((NRF_SPIM_Type*)          NRF_SPIM2_BASE)
#define NRF_SPIS2                   ((NRF_SPIS_Type*)          NRF_SPIS2_BASE)
#define NRF_RTC2                    ((NRF_RTC_Type*)           NRF_RTC2_BASE)
#define NRF_I2S                     ((NRF_I2S_Type*)           NRF_I2S_BASE)
#define NRF_FPU                     ((NRF_FPU_Type*)           NRF_FPU_BASE)
#define NRF_USBD                    ((NRF_USBD_Type*)          NRF_USBD_BASE)
#define NRF_UARTE1                  ((NRF_UARTE_Type*)         NRF_UARTE1_BASE)
#define NRF_QSPI                    ((NRF_QSPI_Type*)          NRF_QSPI_BASE)
#define NRF_CC_HOST_RGF             ((NRF_CC_HOST_RGF_Type*)   NRF_CC_HOST_RGF_BASE)
#define NRF_CRYPTOCELL              ((NRF_CRYPTOCELL_Type*)    NRF_CRYPTOCELL_BASE)
#define NRF_PWM3                    ((NRF_PWM_Type*)           NRF_PWM3_BASE)
#define NRF_SPIM3                   ((NRF_SPIM_Type*)          NRF_SPIM3_BASE)

/** @} */ /* End of group Device_Peripheral_declaration */


/* =========================================  End of section using anonymous unions  ========================================= */
#if defined (__CC_ARM)
  #pragma pop
#elif defined (__ICCARM__)
  /* leave anonymous unions enabled */
#elif defined(__ARMCC_VERSION) && (__ARMCC_VERSION >= 6010050)
  #pragma clang diagnostic pop
#elif defined (__GNUC__)
  /* anonymous unions are enabled by default */
#elif defined (__TMS470__)
  /* anonymous unions are enabled by default */
#elif defined (__TASKING__)
  #pragma warning restore
#elif defined (__CSMC__)
  /* anonymous unions are enabled by default */
#endif


#ifdef __cplusplus
}
#endif

#endif /* NRF52840_H */


/** @} */ /* End of group nrf52840 */

/** @} */ /* End of group Nordic Semiconductor */
`,"nrf52840_bitfields.h":`/*

Copyright (c) 2010 - 2023, Nordic Semiconductor ASA All rights reserved.

SPDX-License-Identifier: BSD-3-Clause

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

3. Neither the name of Nordic Semiconductor ASA nor the names of its
   contributors may be used to endorse or promote products derived from this
   software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY, AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.

*/


#pragma once
#define CLOCK_TASKS_HFCLKSTART_TASKS_HFCLKSTART_Pos (0UL) /*!< Position of TASKS_HFCLKSTART field. */
#define CLOCK_TASKS_HFCLKSTART_TASKS_HFCLKSTART_Msk (0x1UL << CLOCK_TASKS_HFCLKSTART_TASKS_HFCLKSTART_Pos) /*!< Bit mask of TASKS_HFCLKSTART field. */
#define CLOCK_TASKS_HFCLKSTART_TASKS_HFCLKSTART_Trigger (1UL) /*!< Trigger task */
#define CLOCK_TASKS_HFCLKSTOP_TASKS_HFCLKSTOP_Pos (0UL) /*!< Position of TASKS_HFCLKSTOP field. */
#define CLOCK_TASKS_HFCLKSTOP_TASKS_HFCLKSTOP_Msk (0x1UL << CLOCK_TASKS_HFCLKSTOP_TASKS_HFCLKSTOP_Pos) /*!< Bit mask of TASKS_HFCLKSTOP field. */
#define CLOCK_TASKS_HFCLKSTOP_TASKS_HFCLKSTOP_Trigger (1UL) /*!< Trigger task */
#define CLOCK_TASKS_LFCLKSTART_TASKS_LFCLKSTART_Pos (0UL) /*!< Position of TASKS_LFCLKSTART field. */
#define CLOCK_TASKS_LFCLKSTART_TASKS_LFCLKSTART_Msk (0x1UL << CLOCK_TASKS_LFCLKSTART_TASKS_LFCLKSTART_Pos) /*!< Bit mask of TASKS_LFCLKSTART field. */
#define CLOCK_TASKS_LFCLKSTART_TASKS_LFCLKSTART_Trigger (1UL) /*!< Trigger task */
#define CLOCK_TASKS_LFCLKSTOP_TASKS_LFCLKSTOP_Pos (0UL) /*!< Position of TASKS_LFCLKSTOP field. */
#define CLOCK_TASKS_LFCLKSTOP_TASKS_LFCLKSTOP_Msk (0x1UL << CLOCK_TASKS_LFCLKSTOP_TASKS_LFCLKSTOP_Pos) /*!< Bit mask of TASKS_LFCLKSTOP field. */
#define CLOCK_TASKS_LFCLKSTOP_TASKS_LFCLKSTOP_Trigger (1UL) /*!< Trigger task */
#define CLOCK_TASKS_CAL_TASKS_CAL_Pos (0UL) /*!< Position of TASKS_CAL field. */
#define CLOCK_TASKS_CAL_TASKS_CAL_Msk (0x1UL << CLOCK_TASKS_CAL_TASKS_CAL_Pos) /*!< Bit mask of TASKS_CAL field. */
#define CLOCK_TASKS_CAL_TASKS_CAL_Trigger (1UL) /*!< Trigger task */
#define CLOCK_TASKS_CTSTART_TASKS_CTSTART_Pos (0UL) /*!< Position of TASKS_CTSTART field. */
#define CLOCK_TASKS_CTSTART_TASKS_CTSTART_Msk (0x1UL << CLOCK_TASKS_CTSTART_TASKS_CTSTART_Pos) /*!< Bit mask of TASKS_CTSTART field. */
#define CLOCK_TASKS_CTSTART_TASKS_CTSTART_Trigger (1UL) /*!< Trigger task */
#define CLOCK_TASKS_CTSTOP_TASKS_CTSTOP_Pos (0UL) /*!< Position of TASKS_CTSTOP field. */
#define CLOCK_TASKS_CTSTOP_TASKS_CTSTOP_Msk (0x1UL << CLOCK_TASKS_CTSTOP_TASKS_CTSTOP_Pos) /*!< Bit mask of TASKS_CTSTOP field. */
#define CLOCK_TASKS_CTSTOP_TASKS_CTSTOP_Trigger (1UL) /*!< Trigger task */
#define CLOCK_EVENTS_HFCLKSTARTED_EVENTS_HFCLKSTARTED_Pos (0UL) /*!< Position of EVENTS_HFCLKSTARTED field. */
#define CLOCK_EVENTS_HFCLKSTARTED_EVENTS_HFCLKSTARTED_Msk (0x1UL << CLOCK_EVENTS_HFCLKSTARTED_EVENTS_HFCLKSTARTED_Pos) /*!< Bit mask of EVENTS_HFCLKSTARTED field. */
#define CLOCK_EVENTS_HFCLKSTARTED_EVENTS_HFCLKSTARTED_NotGenerated (0UL) /*!< Event not generated */
#define CLOCK_EVENTS_HFCLKSTARTED_EVENTS_HFCLKSTARTED_Generated (1UL) /*!< Event generated */
#define CLOCK_EVENTS_LFCLKSTARTED_EVENTS_LFCLKSTARTED_Pos (0UL) /*!< Position of EVENTS_LFCLKSTARTED field. */
#define CLOCK_EVENTS_LFCLKSTARTED_EVENTS_LFCLKSTARTED_Msk (0x1UL << CLOCK_EVENTS_LFCLKSTARTED_EVENTS_LFCLKSTARTED_Pos) /*!< Bit mask of EVENTS_LFCLKSTARTED field. */
#define CLOCK_EVENTS_LFCLKSTARTED_EVENTS_LFCLKSTARTED_NotGenerated (0UL) /*!< Event not generated */
#define CLOCK_EVENTS_LFCLKSTARTED_EVENTS_LFCLKSTARTED_Generated (1UL) /*!< Event generated */
#define CLOCK_EVENTS_DONE_EVENTS_DONE_Pos (0UL) /*!< Position of EVENTS_DONE field. */
#define CLOCK_EVENTS_DONE_EVENTS_DONE_Msk (0x1UL << CLOCK_EVENTS_DONE_EVENTS_DONE_Pos) /*!< Bit mask of EVENTS_DONE field. */
#define CLOCK_EVENTS_DONE_EVENTS_DONE_NotGenerated (0UL) /*!< Event not generated */
#define CLOCK_EVENTS_DONE_EVENTS_DONE_Generated (1UL) /*!< Event generated */
#define CLOCK_EVENTS_CTTO_EVENTS_CTTO_Pos (0UL) /*!< Position of EVENTS_CTTO field. */
#define CLOCK_EVENTS_CTTO_EVENTS_CTTO_Msk (0x1UL << CLOCK_EVENTS_CTTO_EVENTS_CTTO_Pos) /*!< Bit mask of EVENTS_CTTO field. */
#define CLOCK_EVENTS_CTTO_EVENTS_CTTO_NotGenerated (0UL) /*!< Event not generated */
#define CLOCK_EVENTS_CTTO_EVENTS_CTTO_Generated (1UL) /*!< Event generated */
#define CLOCK_EVENTS_CTSTARTED_EVENTS_CTSTARTED_Pos (0UL) /*!< Position of EVENTS_CTSTARTED field. */
#define CLOCK_EVENTS_CTSTARTED_EVENTS_CTSTARTED_Msk (0x1UL << CLOCK_EVENTS_CTSTARTED_EVENTS_CTSTARTED_Pos) /*!< Bit mask of EVENTS_CTSTARTED field. */
#define CLOCK_EVENTS_CTSTARTED_EVENTS_CTSTARTED_NotGenerated (0UL) /*!< Event not generated */
#define CLOCK_EVENTS_CTSTARTED_EVENTS_CTSTARTED_Generated (1UL) /*!< Event generated */
#define CLOCK_EVENTS_CTSTOPPED_EVENTS_CTSTOPPED_Pos (0UL) /*!< Position of EVENTS_CTSTOPPED field. */
#define CLOCK_EVENTS_CTSTOPPED_EVENTS_CTSTOPPED_Msk (0x1UL << CLOCK_EVENTS_CTSTOPPED_EVENTS_CTSTOPPED_Pos) /*!< Bit mask of EVENTS_CTSTOPPED field. */
#define CLOCK_EVENTS_CTSTOPPED_EVENTS_CTSTOPPED_NotGenerated (0UL) /*!< Event not generated */
#define CLOCK_EVENTS_CTSTOPPED_EVENTS_CTSTOPPED_Generated (1UL) /*!< Event generated */
#define CLOCK_INTENSET_CTSTOPPED_Pos (11UL) /*!< Position of CTSTOPPED field. */
#define CLOCK_INTENSET_CTSTOPPED_Msk (0x1UL << CLOCK_INTENSET_CTSTOPPED_Pos) /*!< Bit mask of CTSTOPPED field. */
#define CLOCK_INTENSET_CTSTOPPED_Disabled (0UL) /*!< Read: Disabled */
#define CLOCK_INTENSET_CTSTOPPED_Enabled (1UL) /*!< Read: Enabled */
#define CLOCK_INTENSET_CTSTOPPED_Set (1UL) /*!< Enable */
#define CLOCK_INTENSET_CTSTARTED_Pos (10UL) /*!< Position of CTSTARTED field. */
#define CLOCK_INTENSET_CTSTARTED_Msk (0x1UL << CLOCK_INTENSET_CTSTARTED_Pos) /*!< Bit mask of CTSTARTED field. */
#define CLOCK_INTENSET_CTSTARTED_Disabled (0UL) /*!< Read: Disabled */
#define CLOCK_INTENSET_CTSTARTED_Enabled (1UL) /*!< Read: Enabled */
#define CLOCK_INTENSET_CTSTARTED_Set (1UL) /*!< Enable */
#define CLOCK_INTENSET_CTTO_Pos (4UL) /*!< Position of CTTO field. */
#define CLOCK_INTENSET_CTTO_Msk (0x1UL << CLOCK_INTENSET_CTTO_Pos) /*!< Bit mask of CTTO field. */
#define CLOCK_INTENSET_CTTO_Disabled (0UL) /*!< Read: Disabled */
#define CLOCK_INTENSET_CTTO_Enabled (1UL) /*!< Read: Enabled */
#define CLOCK_INTENSET_CTTO_Set (1UL) /*!< Enable */
#define CLOCK_INTENSET_DONE_Pos (3UL) /*!< Position of DONE field. */
#define CLOCK_INTENSET_DONE_Msk (0x1UL << CLOCK_INTENSET_DONE_Pos) /*!< Bit mask of DONE field. */
#define CLOCK_INTENSET_DONE_Disabled (0UL) /*!< Read: Disabled */
#define CLOCK_INTENSET_DONE_Enabled (1UL) /*!< Read: Enabled */
#define CLOCK_INTENSET_DONE_Set (1UL) /*!< Enable */
#define CLOCK_INTENSET_LFCLKSTARTED_Pos (1UL) /*!< Position of LFCLKSTARTED field. */
#define CLOCK_INTENSET_LFCLKSTARTED_Msk (0x1UL << CLOCK_INTENSET_LFCLKSTARTED_Pos) /*!< Bit mask of LFCLKSTARTED field. */
#define CLOCK_INTENSET_LFCLKSTARTED_Disabled (0UL) /*!< Read: Disabled */
#define CLOCK_INTENSET_LFCLKSTARTED_Enabled (1UL) /*!< Read: Enabled */
#define CLOCK_INTENSET_LFCLKSTARTED_Set (1UL) /*!< Enable */
#define CLOCK_INTENSET_HFCLKSTARTED_Pos (0UL) /*!< Position of HFCLKSTARTED field. */
#define CLOCK_INTENSET_HFCLKSTARTED_Msk (0x1UL << CLOCK_INTENSET_HFCLKSTARTED_Pos) /*!< Bit mask of HFCLKSTARTED field. */
#define CLOCK_INTENSET_HFCLKSTARTED_Disabled (0UL) /*!< Read: Disabled */
#define CLOCK_INTENSET_HFCLKSTARTED_Enabled (1UL) /*!< Read: Enabled */
#define CLOCK_INTENSET_HFCLKSTARTED_Set (1UL) /*!< Enable */
#define CLOCK_INTENCLR_CTSTOPPED_Pos (11UL) /*!< Position of CTSTOPPED field. */
#define CLOCK_INTENCLR_CTSTOPPED_Msk (0x1UL << CLOCK_INTENCLR_CTSTOPPED_Pos) /*!< Bit mask of CTSTOPPED field. */
#define CLOCK_INTENCLR_CTSTOPPED_Disabled (0UL) /*!< Read: Disabled */
#define CLOCK_INTENCLR_CTSTOPPED_Enabled (1UL) /*!< Read: Enabled */
#define CLOCK_INTENCLR_CTSTOPPED_Clear (1UL) /*!< Disable */
#define CLOCK_INTENCLR_CTSTARTED_Pos (10UL) /*!< Position of CTSTARTED field. */
#define CLOCK_INTENCLR_CTSTARTED_Msk (0x1UL << CLOCK_INTENCLR_CTSTARTED_Pos) /*!< Bit mask of CTSTARTED field. */
#define CLOCK_INTENCLR_CTSTARTED_Disabled (0UL) /*!< Read: Disabled */
#define CLOCK_INTENCLR_CTSTARTED_Enabled (1UL) /*!< Read: Enabled */
#define CLOCK_INTENCLR_CTSTARTED_Clear (1UL) /*!< Disable */
#define CLOCK_INTENCLR_CTTO_Pos (4UL) /*!< Position of CTTO field. */
#define CLOCK_INTENCLR_CTTO_Msk (0x1UL << CLOCK_INTENCLR_CTTO_Pos) /*!< Bit mask of CTTO field. */
#define CLOCK_INTENCLR_CTTO_Disabled (0UL) /*!< Read: Disabled */
#define CLOCK_INTENCLR_CTTO_Enabled (1UL) /*!< Read: Enabled */
#define CLOCK_INTENCLR_CTTO_Clear (1UL) /*!< Disable */
#define CLOCK_INTENCLR_DONE_Pos (3UL) /*!< Position of DONE field. */
#define CLOCK_INTENCLR_DONE_Msk (0x1UL << CLOCK_INTENCLR_DONE_Pos) /*!< Bit mask of DONE field. */
#define CLOCK_INTENCLR_DONE_Disabled (0UL) /*!< Read: Disabled */
#define CLOCK_INTENCLR_DONE_Enabled (1UL) /*!< Read: Enabled */
#define CLOCK_INTENCLR_DONE_Clear (1UL) /*!< Disable */
#define CLOCK_INTENCLR_LFCLKSTARTED_Pos (1UL) /*!< Position of LFCLKSTARTED field. */
#define CLOCK_INTENCLR_LFCLKSTARTED_Msk (0x1UL << CLOCK_INTENCLR_LFCLKSTARTED_Pos) /*!< Bit mask of LFCLKSTARTED field. */
#define CLOCK_INTENCLR_LFCLKSTARTED_Disabled (0UL) /*!< Read: Disabled */
#define CLOCK_INTENCLR_LFCLKSTARTED_Enabled (1UL) /*!< Read: Enabled */
#define CLOCK_INTENCLR_LFCLKSTARTED_Clear (1UL) /*!< Disable */
#define CLOCK_INTENCLR_HFCLKSTARTED_Pos (0UL) /*!< Position of HFCLKSTARTED field. */
#define CLOCK_INTENCLR_HFCLKSTARTED_Msk (0x1UL << CLOCK_INTENCLR_HFCLKSTARTED_Pos) /*!< Bit mask of HFCLKSTARTED field. */
#define CLOCK_INTENCLR_HFCLKSTARTED_Disabled (0UL) /*!< Read: Disabled */
#define CLOCK_INTENCLR_HFCLKSTARTED_Enabled (1UL) /*!< Read: Enabled */
#define CLOCK_INTENCLR_HFCLKSTARTED_Clear (1UL) /*!< Disable */
#define CLOCK_HFCLKRUN_STATUS_Pos (0UL) /*!< Position of STATUS field. */
#define CLOCK_HFCLKRUN_STATUS_Msk (0x1UL << CLOCK_HFCLKRUN_STATUS_Pos) /*!< Bit mask of STATUS field. */
#define CLOCK_HFCLKRUN_STATUS_NotTriggered (0UL) /*!< Task not triggered */
#define CLOCK_HFCLKRUN_STATUS_Triggered (1UL) /*!< Task triggered */
#define CLOCK_HFCLKSTAT_STATE_Pos (16UL) /*!< Position of STATE field. */
#define CLOCK_HFCLKSTAT_STATE_Msk (0x1UL << CLOCK_HFCLKSTAT_STATE_Pos) /*!< Bit mask of STATE field. */
#define CLOCK_HFCLKSTAT_STATE_NotRunning (0UL) /*!< HFCLK not running */
#define CLOCK_HFCLKSTAT_STATE_Running (1UL) /*!< HFCLK running */
#define CLOCK_HFCLKSTAT_SRC_Pos (0UL) /*!< Position of SRC field. */
#define CLOCK_HFCLKSTAT_SRC_Msk (0x1UL << CLOCK_HFCLKSTAT_SRC_Pos) /*!< Bit mask of SRC field. */
#define CLOCK_HFCLKSTAT_SRC_RC (0UL) /*!< 64 MHz internal oscillator (HFINT) */
#define CLOCK_HFCLKSTAT_SRC_Xtal (1UL) /*!< 64 MHz crystal oscillator (HFXO) */
#define CLOCK_LFCLKRUN_STATUS_Pos (0UL) /*!< Position of STATUS field. */
#define CLOCK_LFCLKRUN_STATUS_Msk (0x1UL << CLOCK_LFCLKRUN_STATUS_Pos) /*!< Bit mask of STATUS field. */
#define CLOCK_LFCLKRUN_STATUS_NotTriggered (0UL) /*!< Task not triggered */
#define CLOCK_LFCLKRUN_STATUS_Triggered (1UL) /*!< Task triggered */
#define CLOCK_LFCLKSTAT_STATE_Pos (16UL) /*!< Position of STATE field. */
#define CLOCK_LFCLKSTAT_STATE_Msk (0x1UL << CLOCK_LFCLKSTAT_STATE_Pos) /*!< Bit mask of STATE field. */
#define CLOCK_LFCLKSTAT_STATE_NotRunning (0UL) /*!< LFCLK not running */
#define CLOCK_LFCLKSTAT_STATE_Running (1UL) /*!< LFCLK running */
#define CLOCK_LFCLKSTAT_SRC_Pos (0UL) /*!< Position of SRC field. */
#define CLOCK_LFCLKSTAT_SRC_Msk (0x3UL << CLOCK_LFCLKSTAT_SRC_Pos) /*!< Bit mask of SRC field. */
#define CLOCK_LFCLKSTAT_SRC_RC (0UL) /*!< 32.768 kHz RC oscillator (LFRC) */
#define CLOCK_LFCLKSTAT_SRC_Xtal (1UL) /*!< 32.768 kHz crystal oscillator (LFXO) */
#define CLOCK_LFCLKSTAT_SRC_Synth (2UL) /*!< 32.768 kHz synthesized from HFCLK (LFSYNT) */
#define CLOCK_LFCLKSRCCOPY_SRC_Pos (0UL) /*!< Position of SRC field. */
#define CLOCK_LFCLKSRCCOPY_SRC_Msk (0x3UL << CLOCK_LFCLKSRCCOPY_SRC_Pos) /*!< Bit mask of SRC field. */
#define CLOCK_LFCLKSRCCOPY_SRC_RC (0UL) /*!< 32.768 kHz RC oscillator (LFRC) */
#define CLOCK_LFCLKSRCCOPY_SRC_Xtal (1UL) /*!< 32.768 kHz crystal oscillator (LFXO) */
#define CLOCK_LFCLKSRCCOPY_SRC_Synth (2UL) /*!< 32.768 kHz synthesized from HFCLK (LFSYNT) */
#define CLOCK_LFCLKSRC_EXTERNAL_Pos (17UL) /*!< Position of EXTERNAL field. */
#define CLOCK_LFCLKSRC_EXTERNAL_Msk (0x1UL << CLOCK_LFCLKSRC_EXTERNAL_Pos) /*!< Bit mask of EXTERNAL field. */
#define CLOCK_LFCLKSRC_EXTERNAL_Disabled (0UL) /*!< Disable external source (use with Xtal) */
#define CLOCK_LFCLKSRC_EXTERNAL_Enabled (1UL) /*!< Enable use of external source instead of Xtal (SRC needs to be set to Xtal) */
#define CLOCK_LFCLKSRC_BYPASS_Pos (16UL) /*!< Position of BYPASS field. */
#define CLOCK_LFCLKSRC_BYPASS_Msk (0x1UL << CLOCK_LFCLKSRC_BYPASS_Pos) /*!< Bit mask of BYPASS field. */
#define CLOCK_LFCLKSRC_BYPASS_Disabled (0UL) /*!< Disable (use with Xtal or low-swing external source) */
#define CLOCK_LFCLKSRC_BYPASS_Enabled (1UL) /*!< Enable (use with rail-to-rail external source) */
#define CLOCK_LFCLKSRC_SRC_Pos (0UL) /*!< Position of SRC field. */
#define CLOCK_LFCLKSRC_SRC_Msk (0x3UL << CLOCK_LFCLKSRC_SRC_Pos) /*!< Bit mask of SRC field. */
#define CLOCK_LFCLKSRC_SRC_RC (0UL) /*!< 32.768 kHz RC oscillator (LFRC) */
#define CLOCK_LFCLKSRC_SRC_Xtal (1UL) /*!< 32.768 kHz crystal oscillator (LFXO) */
#define CLOCK_LFCLKSRC_SRC_Synth (2UL) /*!< 32.768 kHz synthesized from HFCLK (LFSYNT) */
#define CLOCK_HFXODEBOUNCE_HFXODEBOUNCE_Pos (0UL) /*!< Position of HFXODEBOUNCE field. */
#define CLOCK_HFXODEBOUNCE_HFXODEBOUNCE_Msk (0xFFUL << CLOCK_HFXODEBOUNCE_HFXODEBOUNCE_Pos) /*!< Bit mask of HFXODEBOUNCE field. */
#define CLOCK_HFXODEBOUNCE_HFXODEBOUNCE_Db256us (0x10UL) /*!< 256 us debounce time. Recommended for TSX-3225, FA-20H and FA-128 crystals. */
#define CLOCK_HFXODEBOUNCE_HFXODEBOUNCE_Db1024us (0x40UL) /*!< 1024 us debounce time. Recommended for NX1612AA and NX1210AB crystals. */
#define CLOCK_CTIV_CTIV_Pos (0UL) /*!< Position of CTIV field. */
#define CLOCK_CTIV_CTIV_Msk (0x7FUL << CLOCK_CTIV_CTIV_Pos) /*!< Bit mask of CTIV field. */
#define CLOCK_TRACECONFIG_TRACEMUX_Pos (16UL) /*!< Position of TRACEMUX field. */
#define CLOCK_TRACECONFIG_TRACEMUX_Msk (0x3UL << CLOCK_TRACECONFIG_TRACEMUX_Pos) /*!< Bit mask of TRACEMUX field. */
#define CLOCK_TRACECONFIG_TRACEMUX_GPIO (0UL) /*!< No trace signals routed to pins. All pins can be used as regular GPIOs. */
#define CLOCK_TRACECONFIG_TRACEMUX_Serial (1UL) /*!< SWO trace signal routed to pin. Remaining pins can be used as regular GPIOs. */
#define CLOCK_TRACECONFIG_TRACEMUX_Parallel (2UL) /*!< All trace signals (TRACECLK and TRACEDATA[n]) routed to pins. */
#define CLOCK_TRACECONFIG_TRACEPORTSPEED_Pos (0UL) /*!< Position of TRACEPORTSPEED field. */
#define CLOCK_TRACECONFIG_TRACEPORTSPEED_Msk (0x3UL << CLOCK_TRACECONFIG_TRACEPORTSPEED_Pos) /*!< Bit mask of TRACEPORTSPEED field. */
#define CLOCK_TRACECONFIG_TRACEPORTSPEED_32MHz (0UL) /*!< 32 MHz trace port clock (TRACECLK = 16 MHz) */
#define CLOCK_TRACECONFIG_TRACEPORTSPEED_16MHz (1UL) /*!< 16 MHz trace port clock (TRACECLK = 8 MHz) */
#define CLOCK_TRACECONFIG_TRACEPORTSPEED_8MHz (2UL) /*!< 8 MHz trace port clock (TRACECLK = 4 MHz) */
#define CLOCK_TRACECONFIG_TRACEPORTSPEED_4MHz (3UL) /*!< 4 MHz trace port clock (TRACECLK = 2 MHz) */
#define CLOCK_LFRCMODE_STATUS_Pos (16UL) /*!< Position of STATUS field. */
#define CLOCK_LFRCMODE_STATUS_Msk (0x1UL << CLOCK_LFRCMODE_STATUS_Pos) /*!< Bit mask of STATUS field. */
#define CLOCK_LFRCMODE_STATUS_Normal (0UL) /*!< Normal mode */
#define CLOCK_LFRCMODE_STATUS_ULP (1UL) /*!< Ultra-low power mode (ULP) */
#define CLOCK_LFRCMODE_MODE_Pos (0UL) /*!< Position of MODE field. */
#define CLOCK_LFRCMODE_MODE_Msk (0x1UL << CLOCK_LFRCMODE_MODE_Pos) /*!< Bit mask of MODE field. */
#define CLOCK_LFRCMODE_MODE_Normal (0UL) /*!< Normal mode */
#define CLOCK_LFRCMODE_MODE_ULP (1UL) /*!< Ultra-low power mode (ULP) */
#define GPIOTE_TASKS_OUT_TASKS_OUT_Pos (0UL) /*!< Position of TASKS_OUT field. */
#define GPIOTE_TASKS_OUT_TASKS_OUT_Msk (0x1UL << GPIOTE_TASKS_OUT_TASKS_OUT_Pos) /*!< Bit mask of TASKS_OUT field. */
#define GPIOTE_TASKS_OUT_TASKS_OUT_Trigger (1UL) /*!< Trigger task */
#define GPIOTE_TASKS_SET_TASKS_SET_Pos (0UL) /*!< Position of TASKS_SET field. */
#define GPIOTE_TASKS_SET_TASKS_SET_Msk (0x1UL << GPIOTE_TASKS_SET_TASKS_SET_Pos) /*!< Bit mask of TASKS_SET field. */
#define GPIOTE_TASKS_SET_TASKS_SET_Trigger (1UL) /*!< Trigger task */
#define GPIOTE_TASKS_CLR_TASKS_CLR_Pos (0UL) /*!< Position of TASKS_CLR field. */
#define GPIOTE_TASKS_CLR_TASKS_CLR_Msk (0x1UL << GPIOTE_TASKS_CLR_TASKS_CLR_Pos) /*!< Bit mask of TASKS_CLR field. */
#define GPIOTE_TASKS_CLR_TASKS_CLR_Trigger (1UL) /*!< Trigger task */
#define GPIOTE_EVENTS_IN_EVENTS_IN_Pos (0UL) /*!< Position of EVENTS_IN field. */
#define GPIOTE_EVENTS_IN_EVENTS_IN_Msk (0x1UL << GPIOTE_EVENTS_IN_EVENTS_IN_Pos) /*!< Bit mask of EVENTS_IN field. */
#define GPIOTE_EVENTS_IN_EVENTS_IN_NotGenerated (0UL) /*!< Event not generated */
#define GPIOTE_EVENTS_IN_EVENTS_IN_Generated (1UL) /*!< Event generated */
#define GPIOTE_EVENTS_PORT_EVENTS_PORT_Pos (0UL) /*!< Position of EVENTS_PORT field. */
#define GPIOTE_EVENTS_PORT_EVENTS_PORT_Msk (0x1UL << GPIOTE_EVENTS_PORT_EVENTS_PORT_Pos) /*!< Bit mask of EVENTS_PORT field. */
#define GPIOTE_EVENTS_PORT_EVENTS_PORT_NotGenerated (0UL) /*!< Event not generated */
#define GPIOTE_EVENTS_PORT_EVENTS_PORT_Generated (1UL) /*!< Event generated */
#define GPIOTE_INTENSET_PORT_Pos (31UL) /*!< Position of PORT field. */
#define GPIOTE_INTENSET_PORT_Msk (0x1UL << GPIOTE_INTENSET_PORT_Pos) /*!< Bit mask of PORT field. */
#define GPIOTE_INTENSET_PORT_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENSET_PORT_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENSET_PORT_Set (1UL) /*!< Enable */
#define GPIOTE_INTENSET_IN7_Pos (7UL) /*!< Position of IN7 field. */
#define GPIOTE_INTENSET_IN7_Msk (0x1UL << GPIOTE_INTENSET_IN7_Pos) /*!< Bit mask of IN7 field. */
#define GPIOTE_INTENSET_IN7_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENSET_IN7_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENSET_IN7_Set (1UL) /*!< Enable */
#define GPIOTE_INTENSET_IN6_Pos (6UL) /*!< Position of IN6 field. */
#define GPIOTE_INTENSET_IN6_Msk (0x1UL << GPIOTE_INTENSET_IN6_Pos) /*!< Bit mask of IN6 field. */
#define GPIOTE_INTENSET_IN6_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENSET_IN6_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENSET_IN6_Set (1UL) /*!< Enable */
#define GPIOTE_INTENSET_IN5_Pos (5UL) /*!< Position of IN5 field. */
#define GPIOTE_INTENSET_IN5_Msk (0x1UL << GPIOTE_INTENSET_IN5_Pos) /*!< Bit mask of IN5 field. */
#define GPIOTE_INTENSET_IN5_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENSET_IN5_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENSET_IN5_Set (1UL) /*!< Enable */
#define GPIOTE_INTENSET_IN4_Pos (4UL) /*!< Position of IN4 field. */
#define GPIOTE_INTENSET_IN4_Msk (0x1UL << GPIOTE_INTENSET_IN4_Pos) /*!< Bit mask of IN4 field. */
#define GPIOTE_INTENSET_IN4_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENSET_IN4_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENSET_IN4_Set (1UL) /*!< Enable */
#define GPIOTE_INTENSET_IN3_Pos (3UL) /*!< Position of IN3 field. */
#define GPIOTE_INTENSET_IN3_Msk (0x1UL << GPIOTE_INTENSET_IN3_Pos) /*!< Bit mask of IN3 field. */
#define GPIOTE_INTENSET_IN3_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENSET_IN3_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENSET_IN3_Set (1UL) /*!< Enable */
#define GPIOTE_INTENSET_IN2_Pos (2UL) /*!< Position of IN2 field. */
#define GPIOTE_INTENSET_IN2_Msk (0x1UL << GPIOTE_INTENSET_IN2_Pos) /*!< Bit mask of IN2 field. */
#define GPIOTE_INTENSET_IN2_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENSET_IN2_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENSET_IN2_Set (1UL) /*!< Enable */
#define GPIOTE_INTENSET_IN1_Pos (1UL) /*!< Position of IN1 field. */
#define GPIOTE_INTENSET_IN1_Msk (0x1UL << GPIOTE_INTENSET_IN1_Pos) /*!< Bit mask of IN1 field. */
#define GPIOTE_INTENSET_IN1_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENSET_IN1_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENSET_IN1_Set (1UL) /*!< Enable */
#define GPIOTE_INTENSET_IN0_Pos (0UL) /*!< Position of IN0 field. */
#define GPIOTE_INTENSET_IN0_Msk (0x1UL << GPIOTE_INTENSET_IN0_Pos) /*!< Bit mask of IN0 field. */
#define GPIOTE_INTENSET_IN0_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENSET_IN0_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENSET_IN0_Set (1UL) /*!< Enable */
#define GPIOTE_INTENCLR_PORT_Pos (31UL) /*!< Position of PORT field. */
#define GPIOTE_INTENCLR_PORT_Msk (0x1UL << GPIOTE_INTENCLR_PORT_Pos) /*!< Bit mask of PORT field. */
#define GPIOTE_INTENCLR_PORT_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENCLR_PORT_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENCLR_PORT_Clear (1UL) /*!< Disable */
#define GPIOTE_INTENCLR_IN7_Pos (7UL) /*!< Position of IN7 field. */
#define GPIOTE_INTENCLR_IN7_Msk (0x1UL << GPIOTE_INTENCLR_IN7_Pos) /*!< Bit mask of IN7 field. */
#define GPIOTE_INTENCLR_IN7_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENCLR_IN7_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENCLR_IN7_Clear (1UL) /*!< Disable */
#define GPIOTE_INTENCLR_IN6_Pos (6UL) /*!< Position of IN6 field. */
#define GPIOTE_INTENCLR_IN6_Msk (0x1UL << GPIOTE_INTENCLR_IN6_Pos) /*!< Bit mask of IN6 field. */
#define GPIOTE_INTENCLR_IN6_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENCLR_IN6_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENCLR_IN6_Clear (1UL) /*!< Disable */
#define GPIOTE_INTENCLR_IN5_Pos (5UL) /*!< Position of IN5 field. */
#define GPIOTE_INTENCLR_IN5_Msk (0x1UL << GPIOTE_INTENCLR_IN5_Pos) /*!< Bit mask of IN5 field. */
#define GPIOTE_INTENCLR_IN5_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENCLR_IN5_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENCLR_IN5_Clear (1UL) /*!< Disable */
#define GPIOTE_INTENCLR_IN4_Pos (4UL) /*!< Position of IN4 field. */
#define GPIOTE_INTENCLR_IN4_Msk (0x1UL << GPIOTE_INTENCLR_IN4_Pos) /*!< Bit mask of IN4 field. */
#define GPIOTE_INTENCLR_IN4_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENCLR_IN4_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENCLR_IN4_Clear (1UL) /*!< Disable */
#define GPIOTE_INTENCLR_IN3_Pos (3UL) /*!< Position of IN3 field. */
#define GPIOTE_INTENCLR_IN3_Msk (0x1UL << GPIOTE_INTENCLR_IN3_Pos) /*!< Bit mask of IN3 field. */
#define GPIOTE_INTENCLR_IN3_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENCLR_IN3_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENCLR_IN3_Clear (1UL) /*!< Disable */
#define GPIOTE_INTENCLR_IN2_Pos (2UL) /*!< Position of IN2 field. */
#define GPIOTE_INTENCLR_IN2_Msk (0x1UL << GPIOTE_INTENCLR_IN2_Pos) /*!< Bit mask of IN2 field. */
#define GPIOTE_INTENCLR_IN2_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENCLR_IN2_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENCLR_IN2_Clear (1UL) /*!< Disable */
#define GPIOTE_INTENCLR_IN1_Pos (1UL) /*!< Position of IN1 field. */
#define GPIOTE_INTENCLR_IN1_Msk (0x1UL << GPIOTE_INTENCLR_IN1_Pos) /*!< Bit mask of IN1 field. */
#define GPIOTE_INTENCLR_IN1_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENCLR_IN1_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENCLR_IN1_Clear (1UL) /*!< Disable */
#define GPIOTE_INTENCLR_IN0_Pos (0UL) /*!< Position of IN0 field. */
#define GPIOTE_INTENCLR_IN0_Msk (0x1UL << GPIOTE_INTENCLR_IN0_Pos) /*!< Bit mask of IN0 field. */
#define GPIOTE_INTENCLR_IN0_Disabled (0UL) /*!< Read: Disabled */
#define GPIOTE_INTENCLR_IN0_Enabled (1UL) /*!< Read: Enabled */
#define GPIOTE_INTENCLR_IN0_Clear (1UL) /*!< Disable */
#define GPIOTE_CONFIG_OUTINIT_Pos (20UL) /*!< Position of OUTINIT field. */
#define GPIOTE_CONFIG_OUTINIT_Msk (0x1UL << GPIOTE_CONFIG_OUTINIT_Pos) /*!< Bit mask of OUTINIT field. */
#define GPIOTE_CONFIG_OUTINIT_Low (0UL) /*!< Task mode: Initial value of pin before task triggering is low */
#define GPIOTE_CONFIG_OUTINIT_High (1UL) /*!< Task mode: Initial value of pin before task triggering is high */
#define GPIOTE_CONFIG_POLARITY_Pos (16UL) /*!< Position of POLARITY field. */
#define GPIOTE_CONFIG_POLARITY_Msk (0x3UL << GPIOTE_CONFIG_POLARITY_Pos) /*!< Bit mask of POLARITY field. */
#define GPIOTE_CONFIG_POLARITY_None (0UL) /*!< Task mode: No effect on pin from OUT[n] task. Event mode: no IN[n] event generated on pin activity. */
#define GPIOTE_CONFIG_POLARITY_LoToHi (1UL) /*!< Task mode: Set pin from OUT[n] task. Event mode: Generate IN[n] event when rising edge on pin. */
#define GPIOTE_CONFIG_POLARITY_HiToLo (2UL) /*!< Task mode: Clear pin from OUT[n] task. Event mode: Generate IN[n] event when falling edge on pin. */
#define GPIOTE_CONFIG_POLARITY_Toggle (3UL) /*!< Task mode: Toggle pin from OUT[n]. Event mode: Generate IN[n] when any change on pin. */
#define GPIOTE_CONFIG_PORT_Pos (13UL) /*!< Position of PORT field. */
#define GPIOTE_CONFIG_PORT_Msk (0x1UL << GPIOTE_CONFIG_PORT_Pos) /*!< Bit mask of PORT field. */
#define GPIOTE_CONFIG_PSEL_Pos (8UL) /*!< Position of PSEL field. */
#define GPIOTE_CONFIG_PSEL_Msk (0x1FUL << GPIOTE_CONFIG_PSEL_Pos) /*!< Bit mask of PSEL field. */
#define GPIOTE_CONFIG_MODE_Pos (0UL) /*!< Position of MODE field. */
#define GPIOTE_CONFIG_MODE_Msk (0x3UL << GPIOTE_CONFIG_MODE_Pos) /*!< Bit mask of MODE field. */
#define GPIOTE_CONFIG_MODE_Disabled (0UL) /*!< Disabled. Pin specified by PSEL will not be acquired by the GPIOTE module. */
#define GPIOTE_CONFIG_MODE_Event (1UL) /*!< Event mode */
#define GPIOTE_CONFIG_MODE_Task (3UL) /*!< Task mode */
#define GPIO_OUT_PIN31_Pos (31UL) /*!< Position of PIN31 field. */
#define GPIO_OUT_PIN31_Msk (0x1UL << GPIO_OUT_PIN31_Pos) /*!< Bit mask of PIN31 field. */
#define GPIO_OUT_PIN31_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN31_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN30_Pos (30UL) /*!< Position of PIN30 field. */
#define GPIO_OUT_PIN30_Msk (0x1UL << GPIO_OUT_PIN30_Pos) /*!< Bit mask of PIN30 field. */
#define GPIO_OUT_PIN30_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN30_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN29_Pos (29UL) /*!< Position of PIN29 field. */
#define GPIO_OUT_PIN29_Msk (0x1UL << GPIO_OUT_PIN29_Pos) /*!< Bit mask of PIN29 field. */
#define GPIO_OUT_PIN29_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN29_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN28_Pos (28UL) /*!< Position of PIN28 field. */
#define GPIO_OUT_PIN28_Msk (0x1UL << GPIO_OUT_PIN28_Pos) /*!< Bit mask of PIN28 field. */
#define GPIO_OUT_PIN28_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN28_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN27_Pos (27UL) /*!< Position of PIN27 field. */
#define GPIO_OUT_PIN27_Msk (0x1UL << GPIO_OUT_PIN27_Pos) /*!< Bit mask of PIN27 field. */
#define GPIO_OUT_PIN27_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN27_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN26_Pos (26UL) /*!< Position of PIN26 field. */
#define GPIO_OUT_PIN26_Msk (0x1UL << GPIO_OUT_PIN26_Pos) /*!< Bit mask of PIN26 field. */
#define GPIO_OUT_PIN26_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN26_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN25_Pos (25UL) /*!< Position of PIN25 field. */
#define GPIO_OUT_PIN25_Msk (0x1UL << GPIO_OUT_PIN25_Pos) /*!< Bit mask of PIN25 field. */
#define GPIO_OUT_PIN25_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN25_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN24_Pos (24UL) /*!< Position of PIN24 field. */
#define GPIO_OUT_PIN24_Msk (0x1UL << GPIO_OUT_PIN24_Pos) /*!< Bit mask of PIN24 field. */
#define GPIO_OUT_PIN24_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN24_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN23_Pos (23UL) /*!< Position of PIN23 field. */
#define GPIO_OUT_PIN23_Msk (0x1UL << GPIO_OUT_PIN23_Pos) /*!< Bit mask of PIN23 field. */
#define GPIO_OUT_PIN23_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN23_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN22_Pos (22UL) /*!< Position of PIN22 field. */
#define GPIO_OUT_PIN22_Msk (0x1UL << GPIO_OUT_PIN22_Pos) /*!< Bit mask of PIN22 field. */
#define GPIO_OUT_PIN22_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN22_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN21_Pos (21UL) /*!< Position of PIN21 field. */
#define GPIO_OUT_PIN21_Msk (0x1UL << GPIO_OUT_PIN21_Pos) /*!< Bit mask of PIN21 field. */
#define GPIO_OUT_PIN21_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN21_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN20_Pos (20UL) /*!< Position of PIN20 field. */
#define GPIO_OUT_PIN20_Msk (0x1UL << GPIO_OUT_PIN20_Pos) /*!< Bit mask of PIN20 field. */
#define GPIO_OUT_PIN20_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN20_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN19_Pos (19UL) /*!< Position of PIN19 field. */
#define GPIO_OUT_PIN19_Msk (0x1UL << GPIO_OUT_PIN19_Pos) /*!< Bit mask of PIN19 field. */
#define GPIO_OUT_PIN19_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN19_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN18_Pos (18UL) /*!< Position of PIN18 field. */
#define GPIO_OUT_PIN18_Msk (0x1UL << GPIO_OUT_PIN18_Pos) /*!< Bit mask of PIN18 field. */
#define GPIO_OUT_PIN18_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN18_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN17_Pos (17UL) /*!< Position of PIN17 field. */
#define GPIO_OUT_PIN17_Msk (0x1UL << GPIO_OUT_PIN17_Pos) /*!< Bit mask of PIN17 field. */
#define GPIO_OUT_PIN17_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN17_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN16_Pos (16UL) /*!< Position of PIN16 field. */
#define GPIO_OUT_PIN16_Msk (0x1UL << GPIO_OUT_PIN16_Pos) /*!< Bit mask of PIN16 field. */
#define GPIO_OUT_PIN16_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN16_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN15_Pos (15UL) /*!< Position of PIN15 field. */
#define GPIO_OUT_PIN15_Msk (0x1UL << GPIO_OUT_PIN15_Pos) /*!< Bit mask of PIN15 field. */
#define GPIO_OUT_PIN15_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN15_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN14_Pos (14UL) /*!< Position of PIN14 field. */
#define GPIO_OUT_PIN14_Msk (0x1UL << GPIO_OUT_PIN14_Pos) /*!< Bit mask of PIN14 field. */
#define GPIO_OUT_PIN14_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN14_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN13_Pos (13UL) /*!< Position of PIN13 field. */
#define GPIO_OUT_PIN13_Msk (0x1UL << GPIO_OUT_PIN13_Pos) /*!< Bit mask of PIN13 field. */
#define GPIO_OUT_PIN13_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN13_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN12_Pos (12UL) /*!< Position of PIN12 field. */
#define GPIO_OUT_PIN12_Msk (0x1UL << GPIO_OUT_PIN12_Pos) /*!< Bit mask of PIN12 field. */
#define GPIO_OUT_PIN12_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN12_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN11_Pos (11UL) /*!< Position of PIN11 field. */
#define GPIO_OUT_PIN11_Msk (0x1UL << GPIO_OUT_PIN11_Pos) /*!< Bit mask of PIN11 field. */
#define GPIO_OUT_PIN11_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN11_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN10_Pos (10UL) /*!< Position of PIN10 field. */
#define GPIO_OUT_PIN10_Msk (0x1UL << GPIO_OUT_PIN10_Pos) /*!< Bit mask of PIN10 field. */
#define GPIO_OUT_PIN10_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN10_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN9_Pos (9UL) /*!< Position of PIN9 field. */
#define GPIO_OUT_PIN9_Msk (0x1UL << GPIO_OUT_PIN9_Pos) /*!< Bit mask of PIN9 field. */
#define GPIO_OUT_PIN9_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN9_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN8_Pos (8UL) /*!< Position of PIN8 field. */
#define GPIO_OUT_PIN8_Msk (0x1UL << GPIO_OUT_PIN8_Pos) /*!< Bit mask of PIN8 field. */
#define GPIO_OUT_PIN8_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN8_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN7_Pos (7UL) /*!< Position of PIN7 field. */
#define GPIO_OUT_PIN7_Msk (0x1UL << GPIO_OUT_PIN7_Pos) /*!< Bit mask of PIN7 field. */
#define GPIO_OUT_PIN7_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN7_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN6_Pos (6UL) /*!< Position of PIN6 field. */
#define GPIO_OUT_PIN6_Msk (0x1UL << GPIO_OUT_PIN6_Pos) /*!< Bit mask of PIN6 field. */
#define GPIO_OUT_PIN6_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN6_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN5_Pos (5UL) /*!< Position of PIN5 field. */
#define GPIO_OUT_PIN5_Msk (0x1UL << GPIO_OUT_PIN5_Pos) /*!< Bit mask of PIN5 field. */
#define GPIO_OUT_PIN5_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN5_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN4_Pos (4UL) /*!< Position of PIN4 field. */
#define GPIO_OUT_PIN4_Msk (0x1UL << GPIO_OUT_PIN4_Pos) /*!< Bit mask of PIN4 field. */
#define GPIO_OUT_PIN4_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN4_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN3_Pos (3UL) /*!< Position of PIN3 field. */
#define GPIO_OUT_PIN3_Msk (0x1UL << GPIO_OUT_PIN3_Pos) /*!< Bit mask of PIN3 field. */
#define GPIO_OUT_PIN3_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN3_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN2_Pos (2UL) /*!< Position of PIN2 field. */
#define GPIO_OUT_PIN2_Msk (0x1UL << GPIO_OUT_PIN2_Pos) /*!< Bit mask of PIN2 field. */
#define GPIO_OUT_PIN2_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN2_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN1_Pos (1UL) /*!< Position of PIN1 field. */
#define GPIO_OUT_PIN1_Msk (0x1UL << GPIO_OUT_PIN1_Pos) /*!< Bit mask of PIN1 field. */
#define GPIO_OUT_PIN1_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN1_High (1UL) /*!< Pin driver is high */
#define GPIO_OUT_PIN0_Pos (0UL) /*!< Position of PIN0 field. */
#define GPIO_OUT_PIN0_Msk (0x1UL << GPIO_OUT_PIN0_Pos) /*!< Bit mask of PIN0 field. */
#define GPIO_OUT_PIN0_Low (0UL) /*!< Pin driver is low */
#define GPIO_OUT_PIN0_High (1UL) /*!< Pin driver is high */
#define GPIO_OUTSET_PIN31_Pos (31UL) /*!< Position of PIN31 field. */
#define GPIO_OUTSET_PIN31_Msk (0x1UL << GPIO_OUTSET_PIN31_Pos) /*!< Bit mask of PIN31 field. */
#define GPIO_OUTSET_PIN31_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN31_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN31_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN30_Pos (30UL) /*!< Position of PIN30 field. */
#define GPIO_OUTSET_PIN30_Msk (0x1UL << GPIO_OUTSET_PIN30_Pos) /*!< Bit mask of PIN30 field. */
#define GPIO_OUTSET_PIN30_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN30_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN30_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN29_Pos (29UL) /*!< Position of PIN29 field. */
#define GPIO_OUTSET_PIN29_Msk (0x1UL << GPIO_OUTSET_PIN29_Pos) /*!< Bit mask of PIN29 field. */
#define GPIO_OUTSET_PIN29_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN29_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN29_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN28_Pos (28UL) /*!< Position of PIN28 field. */
#define GPIO_OUTSET_PIN28_Msk (0x1UL << GPIO_OUTSET_PIN28_Pos) /*!< Bit mask of PIN28 field. */
#define GPIO_OUTSET_PIN28_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN28_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN28_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN27_Pos (27UL) /*!< Position of PIN27 field. */
#define GPIO_OUTSET_PIN27_Msk (0x1UL << GPIO_OUTSET_PIN27_Pos) /*!< Bit mask of PIN27 field. */
#define GPIO_OUTSET_PIN27_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN27_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN27_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN26_Pos (26UL) /*!< Position of PIN26 field. */
#define GPIO_OUTSET_PIN26_Msk (0x1UL << GPIO_OUTSET_PIN26_Pos) /*!< Bit mask of PIN26 field. */
#define GPIO_OUTSET_PIN26_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN26_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN26_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN25_Pos (25UL) /*!< Position of PIN25 field. */
#define GPIO_OUTSET_PIN25_Msk (0x1UL << GPIO_OUTSET_PIN25_Pos) /*!< Bit mask of PIN25 field. */
#define GPIO_OUTSET_PIN25_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN25_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN25_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN24_Pos (24UL) /*!< Position of PIN24 field. */
#define GPIO_OUTSET_PIN24_Msk (0x1UL << GPIO_OUTSET_PIN24_Pos) /*!< Bit mask of PIN24 field. */
#define GPIO_OUTSET_PIN24_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN24_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN24_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN23_Pos (23UL) /*!< Position of PIN23 field. */
#define GPIO_OUTSET_PIN23_Msk (0x1UL << GPIO_OUTSET_PIN23_Pos) /*!< Bit mask of PIN23 field. */
#define GPIO_OUTSET_PIN23_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN23_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN23_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN22_Pos (22UL) /*!< Position of PIN22 field. */
#define GPIO_OUTSET_PIN22_Msk (0x1UL << GPIO_OUTSET_PIN22_Pos) /*!< Bit mask of PIN22 field. */
#define GPIO_OUTSET_PIN22_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN22_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN22_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN21_Pos (21UL) /*!< Position of PIN21 field. */
#define GPIO_OUTSET_PIN21_Msk (0x1UL << GPIO_OUTSET_PIN21_Pos) /*!< Bit mask of PIN21 field. */
#define GPIO_OUTSET_PIN21_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN21_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN21_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN20_Pos (20UL) /*!< Position of PIN20 field. */
#define GPIO_OUTSET_PIN20_Msk (0x1UL << GPIO_OUTSET_PIN20_Pos) /*!< Bit mask of PIN20 field. */
#define GPIO_OUTSET_PIN20_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN20_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN20_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN19_Pos (19UL) /*!< Position of PIN19 field. */
#define GPIO_OUTSET_PIN19_Msk (0x1UL << GPIO_OUTSET_PIN19_Pos) /*!< Bit mask of PIN19 field. */
#define GPIO_OUTSET_PIN19_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN19_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN19_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN18_Pos (18UL) /*!< Position of PIN18 field. */
#define GPIO_OUTSET_PIN18_Msk (0x1UL << GPIO_OUTSET_PIN18_Pos) /*!< Bit mask of PIN18 field. */
#define GPIO_OUTSET_PIN18_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN18_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN18_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN17_Pos (17UL) /*!< Position of PIN17 field. */
#define GPIO_OUTSET_PIN17_Msk (0x1UL << GPIO_OUTSET_PIN17_Pos) /*!< Bit mask of PIN17 field. */
#define GPIO_OUTSET_PIN17_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN17_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN17_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN16_Pos (16UL) /*!< Position of PIN16 field. */
#define GPIO_OUTSET_PIN16_Msk (0x1UL << GPIO_OUTSET_PIN16_Pos) /*!< Bit mask of PIN16 field. */
#define GPIO_OUTSET_PIN16_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN16_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN16_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN15_Pos (15UL) /*!< Position of PIN15 field. */
#define GPIO_OUTSET_PIN15_Msk (0x1UL << GPIO_OUTSET_PIN15_Pos) /*!< Bit mask of PIN15 field. */
#define GPIO_OUTSET_PIN15_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN15_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN15_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN14_Pos (14UL) /*!< Position of PIN14 field. */
#define GPIO_OUTSET_PIN14_Msk (0x1UL << GPIO_OUTSET_PIN14_Pos) /*!< Bit mask of PIN14 field. */
#define GPIO_OUTSET_PIN14_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN14_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN14_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN13_Pos (13UL) /*!< Position of PIN13 field. */
#define GPIO_OUTSET_PIN13_Msk (0x1UL << GPIO_OUTSET_PIN13_Pos) /*!< Bit mask of PIN13 field. */
#define GPIO_OUTSET_PIN13_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN13_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN13_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN12_Pos (12UL) /*!< Position of PIN12 field. */
#define GPIO_OUTSET_PIN12_Msk (0x1UL << GPIO_OUTSET_PIN12_Pos) /*!< Bit mask of PIN12 field. */
#define GPIO_OUTSET_PIN12_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN12_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN12_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN11_Pos (11UL) /*!< Position of PIN11 field. */
#define GPIO_OUTSET_PIN11_Msk (0x1UL << GPIO_OUTSET_PIN11_Pos) /*!< Bit mask of PIN11 field. */
#define GPIO_OUTSET_PIN11_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN11_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN11_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN10_Pos (10UL) /*!< Position of PIN10 field. */
#define GPIO_OUTSET_PIN10_Msk (0x1UL << GPIO_OUTSET_PIN10_Pos) /*!< Bit mask of PIN10 field. */
#define GPIO_OUTSET_PIN10_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN10_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN10_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN9_Pos (9UL) /*!< Position of PIN9 field. */
#define GPIO_OUTSET_PIN9_Msk (0x1UL << GPIO_OUTSET_PIN9_Pos) /*!< Bit mask of PIN9 field. */
#define GPIO_OUTSET_PIN9_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN9_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN9_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN8_Pos (8UL) /*!< Position of PIN8 field. */
#define GPIO_OUTSET_PIN8_Msk (0x1UL << GPIO_OUTSET_PIN8_Pos) /*!< Bit mask of PIN8 field. */
#define GPIO_OUTSET_PIN8_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN8_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN8_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN7_Pos (7UL) /*!< Position of PIN7 field. */
#define GPIO_OUTSET_PIN7_Msk (0x1UL << GPIO_OUTSET_PIN7_Pos) /*!< Bit mask of PIN7 field. */
#define GPIO_OUTSET_PIN7_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN7_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN7_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN6_Pos (6UL) /*!< Position of PIN6 field. */
#define GPIO_OUTSET_PIN6_Msk (0x1UL << GPIO_OUTSET_PIN6_Pos) /*!< Bit mask of PIN6 field. */
#define GPIO_OUTSET_PIN6_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN6_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN6_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN5_Pos (5UL) /*!< Position of PIN5 field. */
#define GPIO_OUTSET_PIN5_Msk (0x1UL << GPIO_OUTSET_PIN5_Pos) /*!< Bit mask of PIN5 field. */
#define GPIO_OUTSET_PIN5_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN5_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN5_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN4_Pos (4UL) /*!< Position of PIN4 field. */
#define GPIO_OUTSET_PIN4_Msk (0x1UL << GPIO_OUTSET_PIN4_Pos) /*!< Bit mask of PIN4 field. */
#define GPIO_OUTSET_PIN4_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN4_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN4_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN3_Pos (3UL) /*!< Position of PIN3 field. */
#define GPIO_OUTSET_PIN3_Msk (0x1UL << GPIO_OUTSET_PIN3_Pos) /*!< Bit mask of PIN3 field. */
#define GPIO_OUTSET_PIN3_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN3_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN3_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN2_Pos (2UL) /*!< Position of PIN2 field. */
#define GPIO_OUTSET_PIN2_Msk (0x1UL << GPIO_OUTSET_PIN2_Pos) /*!< Bit mask of PIN2 field. */
#define GPIO_OUTSET_PIN2_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN2_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN2_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN1_Pos (1UL) /*!< Position of PIN1 field. */
#define GPIO_OUTSET_PIN1_Msk (0x1UL << GPIO_OUTSET_PIN1_Pos) /*!< Bit mask of PIN1 field. */
#define GPIO_OUTSET_PIN1_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN1_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN1_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTSET_PIN0_Pos (0UL) /*!< Position of PIN0 field. */
#define GPIO_OUTSET_PIN0_Msk (0x1UL << GPIO_OUTSET_PIN0_Pos) /*!< Bit mask of PIN0 field. */
#define GPIO_OUTSET_PIN0_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTSET_PIN0_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTSET_PIN0_Set (1UL) /*!< Write: a '1' sets the pin high; a '0' has no effect */
#define GPIO_OUTCLR_PIN31_Pos (31UL) /*!< Position of PIN31 field. */
#define GPIO_OUTCLR_PIN31_Msk (0x1UL << GPIO_OUTCLR_PIN31_Pos) /*!< Bit mask of PIN31 field. */
#define GPIO_OUTCLR_PIN31_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN31_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN31_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN30_Pos (30UL) /*!< Position of PIN30 field. */
#define GPIO_OUTCLR_PIN30_Msk (0x1UL << GPIO_OUTCLR_PIN30_Pos) /*!< Bit mask of PIN30 field. */
#define GPIO_OUTCLR_PIN30_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN30_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN30_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN29_Pos (29UL) /*!< Position of PIN29 field. */
#define GPIO_OUTCLR_PIN29_Msk (0x1UL << GPIO_OUTCLR_PIN29_Pos) /*!< Bit mask of PIN29 field. */
#define GPIO_OUTCLR_PIN29_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN29_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN29_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN28_Pos (28UL) /*!< Position of PIN28 field. */
#define GPIO_OUTCLR_PIN28_Msk (0x1UL << GPIO_OUTCLR_PIN28_Pos) /*!< Bit mask of PIN28 field. */
#define GPIO_OUTCLR_PIN28_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN28_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN28_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN27_Pos (27UL) /*!< Position of PIN27 field. */
#define GPIO_OUTCLR_PIN27_Msk (0x1UL << GPIO_OUTCLR_PIN27_Pos) /*!< Bit mask of PIN27 field. */
#define GPIO_OUTCLR_PIN27_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN27_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN27_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN26_Pos (26UL) /*!< Position of PIN26 field. */
#define GPIO_OUTCLR_PIN26_Msk (0x1UL << GPIO_OUTCLR_PIN26_Pos) /*!< Bit mask of PIN26 field. */
#define GPIO_OUTCLR_PIN26_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN26_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN26_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN25_Pos (25UL) /*!< Position of PIN25 field. */
#define GPIO_OUTCLR_PIN25_Msk (0x1UL << GPIO_OUTCLR_PIN25_Pos) /*!< Bit mask of PIN25 field. */
#define GPIO_OUTCLR_PIN25_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN25_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN25_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN24_Pos (24UL) /*!< Position of PIN24 field. */
#define GPIO_OUTCLR_PIN24_Msk (0x1UL << GPIO_OUTCLR_PIN24_Pos) /*!< Bit mask of PIN24 field. */
#define GPIO_OUTCLR_PIN24_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN24_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN24_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN23_Pos (23UL) /*!< Position of PIN23 field. */
#define GPIO_OUTCLR_PIN23_Msk (0x1UL << GPIO_OUTCLR_PIN23_Pos) /*!< Bit mask of PIN23 field. */
#define GPIO_OUTCLR_PIN23_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN23_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN23_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN22_Pos (22UL) /*!< Position of PIN22 field. */
#define GPIO_OUTCLR_PIN22_Msk (0x1UL << GPIO_OUTCLR_PIN22_Pos) /*!< Bit mask of PIN22 field. */
#define GPIO_OUTCLR_PIN22_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN22_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN22_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN21_Pos (21UL) /*!< Position of PIN21 field. */
#define GPIO_OUTCLR_PIN21_Msk (0x1UL << GPIO_OUTCLR_PIN21_Pos) /*!< Bit mask of PIN21 field. */
#define GPIO_OUTCLR_PIN21_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN21_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN21_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN20_Pos (20UL) /*!< Position of PIN20 field. */
#define GPIO_OUTCLR_PIN20_Msk (0x1UL << GPIO_OUTCLR_PIN20_Pos) /*!< Bit mask of PIN20 field. */
#define GPIO_OUTCLR_PIN20_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN20_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN20_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN19_Pos (19UL) /*!< Position of PIN19 field. */
#define GPIO_OUTCLR_PIN19_Msk (0x1UL << GPIO_OUTCLR_PIN19_Pos) /*!< Bit mask of PIN19 field. */
#define GPIO_OUTCLR_PIN19_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN19_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN19_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN18_Pos (18UL) /*!< Position of PIN18 field. */
#define GPIO_OUTCLR_PIN18_Msk (0x1UL << GPIO_OUTCLR_PIN18_Pos) /*!< Bit mask of PIN18 field. */
#define GPIO_OUTCLR_PIN18_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN18_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN18_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN17_Pos (17UL) /*!< Position of PIN17 field. */
#define GPIO_OUTCLR_PIN17_Msk (0x1UL << GPIO_OUTCLR_PIN17_Pos) /*!< Bit mask of PIN17 field. */
#define GPIO_OUTCLR_PIN17_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN17_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN17_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN16_Pos (16UL) /*!< Position of PIN16 field. */
#define GPIO_OUTCLR_PIN16_Msk (0x1UL << GPIO_OUTCLR_PIN16_Pos) /*!< Bit mask of PIN16 field. */
#define GPIO_OUTCLR_PIN16_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN16_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN16_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN15_Pos (15UL) /*!< Position of PIN15 field. */
#define GPIO_OUTCLR_PIN15_Msk (0x1UL << GPIO_OUTCLR_PIN15_Pos) /*!< Bit mask of PIN15 field. */
#define GPIO_OUTCLR_PIN15_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN15_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN15_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN14_Pos (14UL) /*!< Position of PIN14 field. */
#define GPIO_OUTCLR_PIN14_Msk (0x1UL << GPIO_OUTCLR_PIN14_Pos) /*!< Bit mask of PIN14 field. */
#define GPIO_OUTCLR_PIN14_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN14_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN14_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN13_Pos (13UL) /*!< Position of PIN13 field. */
#define GPIO_OUTCLR_PIN13_Msk (0x1UL << GPIO_OUTCLR_PIN13_Pos) /*!< Bit mask of PIN13 field. */
#define GPIO_OUTCLR_PIN13_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN13_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN13_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN12_Pos (12UL) /*!< Position of PIN12 field. */
#define GPIO_OUTCLR_PIN12_Msk (0x1UL << GPIO_OUTCLR_PIN12_Pos) /*!< Bit mask of PIN12 field. */
#define GPIO_OUTCLR_PIN12_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN12_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN12_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN11_Pos (11UL) /*!< Position of PIN11 field. */
#define GPIO_OUTCLR_PIN11_Msk (0x1UL << GPIO_OUTCLR_PIN11_Pos) /*!< Bit mask of PIN11 field. */
#define GPIO_OUTCLR_PIN11_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN11_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN11_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN10_Pos (10UL) /*!< Position of PIN10 field. */
#define GPIO_OUTCLR_PIN10_Msk (0x1UL << GPIO_OUTCLR_PIN10_Pos) /*!< Bit mask of PIN10 field. */
#define GPIO_OUTCLR_PIN10_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN10_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN10_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN9_Pos (9UL) /*!< Position of PIN9 field. */
#define GPIO_OUTCLR_PIN9_Msk (0x1UL << GPIO_OUTCLR_PIN9_Pos) /*!< Bit mask of PIN9 field. */
#define GPIO_OUTCLR_PIN9_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN9_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN9_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN8_Pos (8UL) /*!< Position of PIN8 field. */
#define GPIO_OUTCLR_PIN8_Msk (0x1UL << GPIO_OUTCLR_PIN8_Pos) /*!< Bit mask of PIN8 field. */
#define GPIO_OUTCLR_PIN8_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN8_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN8_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN7_Pos (7UL) /*!< Position of PIN7 field. */
#define GPIO_OUTCLR_PIN7_Msk (0x1UL << GPIO_OUTCLR_PIN7_Pos) /*!< Bit mask of PIN7 field. */
#define GPIO_OUTCLR_PIN7_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN7_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN7_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN6_Pos (6UL) /*!< Position of PIN6 field. */
#define GPIO_OUTCLR_PIN6_Msk (0x1UL << GPIO_OUTCLR_PIN6_Pos) /*!< Bit mask of PIN6 field. */
#define GPIO_OUTCLR_PIN6_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN6_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN6_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN5_Pos (5UL) /*!< Position of PIN5 field. */
#define GPIO_OUTCLR_PIN5_Msk (0x1UL << GPIO_OUTCLR_PIN5_Pos) /*!< Bit mask of PIN5 field. */
#define GPIO_OUTCLR_PIN5_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN5_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN5_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN4_Pos (4UL) /*!< Position of PIN4 field. */
#define GPIO_OUTCLR_PIN4_Msk (0x1UL << GPIO_OUTCLR_PIN4_Pos) /*!< Bit mask of PIN4 field. */
#define GPIO_OUTCLR_PIN4_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN4_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN4_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN3_Pos (3UL) /*!< Position of PIN3 field. */
#define GPIO_OUTCLR_PIN3_Msk (0x1UL << GPIO_OUTCLR_PIN3_Pos) /*!< Bit mask of PIN3 field. */
#define GPIO_OUTCLR_PIN3_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN3_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN3_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN2_Pos (2UL) /*!< Position of PIN2 field. */
#define GPIO_OUTCLR_PIN2_Msk (0x1UL << GPIO_OUTCLR_PIN2_Pos) /*!< Bit mask of PIN2 field. */
#define GPIO_OUTCLR_PIN2_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN2_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN2_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN1_Pos (1UL) /*!< Position of PIN1 field. */
#define GPIO_OUTCLR_PIN1_Msk (0x1UL << GPIO_OUTCLR_PIN1_Pos) /*!< Bit mask of PIN1 field. */
#define GPIO_OUTCLR_PIN1_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN1_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN1_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_OUTCLR_PIN0_Pos (0UL) /*!< Position of PIN0 field. */
#define GPIO_OUTCLR_PIN0_Msk (0x1UL << GPIO_OUTCLR_PIN0_Pos) /*!< Bit mask of PIN0 field. */
#define GPIO_OUTCLR_PIN0_Low (0UL) /*!< Read: pin driver is low */
#define GPIO_OUTCLR_PIN0_High (1UL) /*!< Read: pin driver is high */
#define GPIO_OUTCLR_PIN0_Clear (1UL) /*!< Write: a '1' sets the pin low; a '0' has no effect */
#define GPIO_IN_PIN31_Pos (31UL) /*!< Position of PIN31 field. */
#define GPIO_IN_PIN31_Msk (0x1UL << GPIO_IN_PIN31_Pos) /*!< Bit mask of PIN31 field. */
#define GPIO_IN_PIN31_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN31_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN30_Pos (30UL) /*!< Position of PIN30 field. */
#define GPIO_IN_PIN30_Msk (0x1UL << GPIO_IN_PIN30_Pos) /*!< Bit mask of PIN30 field. */
#define GPIO_IN_PIN30_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN30_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN29_Pos (29UL) /*!< Position of PIN29 field. */
#define GPIO_IN_PIN29_Msk (0x1UL << GPIO_IN_PIN29_Pos) /*!< Bit mask of PIN29 field. */
#define GPIO_IN_PIN29_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN29_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN28_Pos (28UL) /*!< Position of PIN28 field. */
#define GPIO_IN_PIN28_Msk (0x1UL << GPIO_IN_PIN28_Pos) /*!< Bit mask of PIN28 field. */
#define GPIO_IN_PIN28_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN28_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN27_Pos (27UL) /*!< Position of PIN27 field. */
#define GPIO_IN_PIN27_Msk (0x1UL << GPIO_IN_PIN27_Pos) /*!< Bit mask of PIN27 field. */
#define GPIO_IN_PIN27_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN27_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN26_Pos (26UL) /*!< Position of PIN26 field. */
#define GPIO_IN_PIN26_Msk (0x1UL << GPIO_IN_PIN26_Pos) /*!< Bit mask of PIN26 field. */
#define GPIO_IN_PIN26_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN26_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN25_Pos (25UL) /*!< Position of PIN25 field. */
#define GPIO_IN_PIN25_Msk (0x1UL << GPIO_IN_PIN25_Pos) /*!< Bit mask of PIN25 field. */
#define GPIO_IN_PIN25_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN25_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN24_Pos (24UL) /*!< Position of PIN24 field. */
#define GPIO_IN_PIN24_Msk (0x1UL << GPIO_IN_PIN24_Pos) /*!< Bit mask of PIN24 field. */
#define GPIO_IN_PIN24_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN24_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN23_Pos (23UL) /*!< Position of PIN23 field. */
#define GPIO_IN_PIN23_Msk (0x1UL << GPIO_IN_PIN23_Pos) /*!< Bit mask of PIN23 field. */
#define GPIO_IN_PIN23_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN23_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN22_Pos (22UL) /*!< Position of PIN22 field. */
#define GPIO_IN_PIN22_Msk (0x1UL << GPIO_IN_PIN22_Pos) /*!< Bit mask of PIN22 field. */
#define GPIO_IN_PIN22_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN22_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN21_Pos (21UL) /*!< Position of PIN21 field. */
#define GPIO_IN_PIN21_Msk (0x1UL << GPIO_IN_PIN21_Pos) /*!< Bit mask of PIN21 field. */
#define GPIO_IN_PIN21_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN21_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN20_Pos (20UL) /*!< Position of PIN20 field. */
#define GPIO_IN_PIN20_Msk (0x1UL << GPIO_IN_PIN20_Pos) /*!< Bit mask of PIN20 field. */
#define GPIO_IN_PIN20_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN20_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN19_Pos (19UL) /*!< Position of PIN19 field. */
#define GPIO_IN_PIN19_Msk (0x1UL << GPIO_IN_PIN19_Pos) /*!< Bit mask of PIN19 field. */
#define GPIO_IN_PIN19_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN19_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN18_Pos (18UL) /*!< Position of PIN18 field. */
#define GPIO_IN_PIN18_Msk (0x1UL << GPIO_IN_PIN18_Pos) /*!< Bit mask of PIN18 field. */
#define GPIO_IN_PIN18_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN18_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN17_Pos (17UL) /*!< Position of PIN17 field. */
#define GPIO_IN_PIN17_Msk (0x1UL << GPIO_IN_PIN17_Pos) /*!< Bit mask of PIN17 field. */
#define GPIO_IN_PIN17_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN17_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN16_Pos (16UL) /*!< Position of PIN16 field. */
#define GPIO_IN_PIN16_Msk (0x1UL << GPIO_IN_PIN16_Pos) /*!< Bit mask of PIN16 field. */
#define GPIO_IN_PIN16_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN16_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN15_Pos (15UL) /*!< Position of PIN15 field. */
#define GPIO_IN_PIN15_Msk (0x1UL << GPIO_IN_PIN15_Pos) /*!< Bit mask of PIN15 field. */
#define GPIO_IN_PIN15_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN15_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN14_Pos (14UL) /*!< Position of PIN14 field. */
#define GPIO_IN_PIN14_Msk (0x1UL << GPIO_IN_PIN14_Pos) /*!< Bit mask of PIN14 field. */
#define GPIO_IN_PIN14_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN14_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN13_Pos (13UL) /*!< Position of PIN13 field. */
#define GPIO_IN_PIN13_Msk (0x1UL << GPIO_IN_PIN13_Pos) /*!< Bit mask of PIN13 field. */
#define GPIO_IN_PIN13_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN13_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN12_Pos (12UL) /*!< Position of PIN12 field. */
#define GPIO_IN_PIN12_Msk (0x1UL << GPIO_IN_PIN12_Pos) /*!< Bit mask of PIN12 field. */
#define GPIO_IN_PIN12_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN12_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN11_Pos (11UL) /*!< Position of PIN11 field. */
#define GPIO_IN_PIN11_Msk (0x1UL << GPIO_IN_PIN11_Pos) /*!< Bit mask of PIN11 field. */
#define GPIO_IN_PIN11_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN11_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN10_Pos (10UL) /*!< Position of PIN10 field. */
#define GPIO_IN_PIN10_Msk (0x1UL << GPIO_IN_PIN10_Pos) /*!< Bit mask of PIN10 field. */
#define GPIO_IN_PIN10_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN10_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN9_Pos (9UL) /*!< Position of PIN9 field. */
#define GPIO_IN_PIN9_Msk (0x1UL << GPIO_IN_PIN9_Pos) /*!< Bit mask of PIN9 field. */
#define GPIO_IN_PIN9_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN9_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN8_Pos (8UL) /*!< Position of PIN8 field. */
#define GPIO_IN_PIN8_Msk (0x1UL << GPIO_IN_PIN8_Pos) /*!< Bit mask of PIN8 field. */
#define GPIO_IN_PIN8_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN8_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN7_Pos (7UL) /*!< Position of PIN7 field. */
#define GPIO_IN_PIN7_Msk (0x1UL << GPIO_IN_PIN7_Pos) /*!< Bit mask of PIN7 field. */
#define GPIO_IN_PIN7_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN7_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN6_Pos (6UL) /*!< Position of PIN6 field. */
#define GPIO_IN_PIN6_Msk (0x1UL << GPIO_IN_PIN6_Pos) /*!< Bit mask of PIN6 field. */
#define GPIO_IN_PIN6_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN6_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN5_Pos (5UL) /*!< Position of PIN5 field. */
#define GPIO_IN_PIN5_Msk (0x1UL << GPIO_IN_PIN5_Pos) /*!< Bit mask of PIN5 field. */
#define GPIO_IN_PIN5_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN5_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN4_Pos (4UL) /*!< Position of PIN4 field. */
#define GPIO_IN_PIN4_Msk (0x1UL << GPIO_IN_PIN4_Pos) /*!< Bit mask of PIN4 field. */
#define GPIO_IN_PIN4_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN4_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN3_Pos (3UL) /*!< Position of PIN3 field. */
#define GPIO_IN_PIN3_Msk (0x1UL << GPIO_IN_PIN3_Pos) /*!< Bit mask of PIN3 field. */
#define GPIO_IN_PIN3_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN3_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN2_Pos (2UL) /*!< Position of PIN2 field. */
#define GPIO_IN_PIN2_Msk (0x1UL << GPIO_IN_PIN2_Pos) /*!< Bit mask of PIN2 field. */
#define GPIO_IN_PIN2_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN2_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN1_Pos (1UL) /*!< Position of PIN1 field. */
#define GPIO_IN_PIN1_Msk (0x1UL << GPIO_IN_PIN1_Pos) /*!< Bit mask of PIN1 field. */
#define GPIO_IN_PIN1_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN1_High (1UL) /*!< Pin input is high */
#define GPIO_IN_PIN0_Pos (0UL) /*!< Position of PIN0 field. */
#define GPIO_IN_PIN0_Msk (0x1UL << GPIO_IN_PIN0_Pos) /*!< Bit mask of PIN0 field. */
#define GPIO_IN_PIN0_Low (0UL) /*!< Pin input is low */
#define GPIO_IN_PIN0_High (1UL) /*!< Pin input is high */
#define GPIO_DIR_PIN31_Pos (31UL) /*!< Position of PIN31 field. */
#define GPIO_DIR_PIN31_Msk (0x1UL << GPIO_DIR_PIN31_Pos) /*!< Bit mask of PIN31 field. */
#define GPIO_DIR_PIN31_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN31_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN30_Pos (30UL) /*!< Position of PIN30 field. */
#define GPIO_DIR_PIN30_Msk (0x1UL << GPIO_DIR_PIN30_Pos) /*!< Bit mask of PIN30 field. */
#define GPIO_DIR_PIN30_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN30_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN29_Pos (29UL) /*!< Position of PIN29 field. */
#define GPIO_DIR_PIN29_Msk (0x1UL << GPIO_DIR_PIN29_Pos) /*!< Bit mask of PIN29 field. */
#define GPIO_DIR_PIN29_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN29_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN28_Pos (28UL) /*!< Position of PIN28 field. */
#define GPIO_DIR_PIN28_Msk (0x1UL << GPIO_DIR_PIN28_Pos) /*!< Bit mask of PIN28 field. */
#define GPIO_DIR_PIN28_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN28_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN27_Pos (27UL) /*!< Position of PIN27 field. */
#define GPIO_DIR_PIN27_Msk (0x1UL << GPIO_DIR_PIN27_Pos) /*!< Bit mask of PIN27 field. */
#define GPIO_DIR_PIN27_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN27_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN26_Pos (26UL) /*!< Position of PIN26 field. */
#define GPIO_DIR_PIN26_Msk (0x1UL << GPIO_DIR_PIN26_Pos) /*!< Bit mask of PIN26 field. */
#define GPIO_DIR_PIN26_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN26_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN25_Pos (25UL) /*!< Position of PIN25 field. */
#define GPIO_DIR_PIN25_Msk (0x1UL << GPIO_DIR_PIN25_Pos) /*!< Bit mask of PIN25 field. */
#define GPIO_DIR_PIN25_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN25_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN24_Pos (24UL) /*!< Position of PIN24 field. */
#define GPIO_DIR_PIN24_Msk (0x1UL << GPIO_DIR_PIN24_Pos) /*!< Bit mask of PIN24 field. */
#define GPIO_DIR_PIN24_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN24_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN23_Pos (23UL) /*!< Position of PIN23 field. */
#define GPIO_DIR_PIN23_Msk (0x1UL << GPIO_DIR_PIN23_Pos) /*!< Bit mask of PIN23 field. */
#define GPIO_DIR_PIN23_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN23_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN22_Pos (22UL) /*!< Position of PIN22 field. */
#define GPIO_DIR_PIN22_Msk (0x1UL << GPIO_DIR_PIN22_Pos) /*!< Bit mask of PIN22 field. */
#define GPIO_DIR_PIN22_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN22_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN21_Pos (21UL) /*!< Position of PIN21 field. */
#define GPIO_DIR_PIN21_Msk (0x1UL << GPIO_DIR_PIN21_Pos) /*!< Bit mask of PIN21 field. */
#define GPIO_DIR_PIN21_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN21_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN20_Pos (20UL) /*!< Position of PIN20 field. */
#define GPIO_DIR_PIN20_Msk (0x1UL << GPIO_DIR_PIN20_Pos) /*!< Bit mask of PIN20 field. */
#define GPIO_DIR_PIN20_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN20_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN19_Pos (19UL) /*!< Position of PIN19 field. */
#define GPIO_DIR_PIN19_Msk (0x1UL << GPIO_DIR_PIN19_Pos) /*!< Bit mask of PIN19 field. */
#define GPIO_DIR_PIN19_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN19_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN18_Pos (18UL) /*!< Position of PIN18 field. */
#define GPIO_DIR_PIN18_Msk (0x1UL << GPIO_DIR_PIN18_Pos) /*!< Bit mask of PIN18 field. */
#define GPIO_DIR_PIN18_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN18_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN17_Pos (17UL) /*!< Position of PIN17 field. */
#define GPIO_DIR_PIN17_Msk (0x1UL << GPIO_DIR_PIN17_Pos) /*!< Bit mask of PIN17 field. */
#define GPIO_DIR_PIN17_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN17_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN16_Pos (16UL) /*!< Position of PIN16 field. */
#define GPIO_DIR_PIN16_Msk (0x1UL << GPIO_DIR_PIN16_Pos) /*!< Bit mask of PIN16 field. */
#define GPIO_DIR_PIN16_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN16_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN15_Pos (15UL) /*!< Position of PIN15 field. */
#define GPIO_DIR_PIN15_Msk (0x1UL << GPIO_DIR_PIN15_Pos) /*!< Bit mask of PIN15 field. */
#define GPIO_DIR_PIN15_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN15_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN14_Pos (14UL) /*!< Position of PIN14 field. */
#define GPIO_DIR_PIN14_Msk (0x1UL << GPIO_DIR_PIN14_Pos) /*!< Bit mask of PIN14 field. */
#define GPIO_DIR_PIN14_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN14_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN13_Pos (13UL) /*!< Position of PIN13 field. */
#define GPIO_DIR_PIN13_Msk (0x1UL << GPIO_DIR_PIN13_Pos) /*!< Bit mask of PIN13 field. */
#define GPIO_DIR_PIN13_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN13_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN12_Pos (12UL) /*!< Position of PIN12 field. */
#define GPIO_DIR_PIN12_Msk (0x1UL << GPIO_DIR_PIN12_Pos) /*!< Bit mask of PIN12 field. */
#define GPIO_DIR_PIN12_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN12_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN11_Pos (11UL) /*!< Position of PIN11 field. */
#define GPIO_DIR_PIN11_Msk (0x1UL << GPIO_DIR_PIN11_Pos) /*!< Bit mask of PIN11 field. */
#define GPIO_DIR_PIN11_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN11_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN10_Pos (10UL) /*!< Position of PIN10 field. */
#define GPIO_DIR_PIN10_Msk (0x1UL << GPIO_DIR_PIN10_Pos) /*!< Bit mask of PIN10 field. */
#define GPIO_DIR_PIN10_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN10_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN9_Pos (9UL) /*!< Position of PIN9 field. */
#define GPIO_DIR_PIN9_Msk (0x1UL << GPIO_DIR_PIN9_Pos) /*!< Bit mask of PIN9 field. */
#define GPIO_DIR_PIN9_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN9_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN8_Pos (8UL) /*!< Position of PIN8 field. */
#define GPIO_DIR_PIN8_Msk (0x1UL << GPIO_DIR_PIN8_Pos) /*!< Bit mask of PIN8 field. */
#define GPIO_DIR_PIN8_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN8_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN7_Pos (7UL) /*!< Position of PIN7 field. */
#define GPIO_DIR_PIN7_Msk (0x1UL << GPIO_DIR_PIN7_Pos) /*!< Bit mask of PIN7 field. */
#define GPIO_DIR_PIN7_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN7_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN6_Pos (6UL) /*!< Position of PIN6 field. */
#define GPIO_DIR_PIN6_Msk (0x1UL << GPIO_DIR_PIN6_Pos) /*!< Bit mask of PIN6 field. */
#define GPIO_DIR_PIN6_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN6_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN5_Pos (5UL) /*!< Position of PIN5 field. */
#define GPIO_DIR_PIN5_Msk (0x1UL << GPIO_DIR_PIN5_Pos) /*!< Bit mask of PIN5 field. */
#define GPIO_DIR_PIN5_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN5_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN4_Pos (4UL) /*!< Position of PIN4 field. */
#define GPIO_DIR_PIN4_Msk (0x1UL << GPIO_DIR_PIN4_Pos) /*!< Bit mask of PIN4 field. */
#define GPIO_DIR_PIN4_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN4_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN3_Pos (3UL) /*!< Position of PIN3 field. */
#define GPIO_DIR_PIN3_Msk (0x1UL << GPIO_DIR_PIN3_Pos) /*!< Bit mask of PIN3 field. */
#define GPIO_DIR_PIN3_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN3_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN2_Pos (2UL) /*!< Position of PIN2 field. */
#define GPIO_DIR_PIN2_Msk (0x1UL << GPIO_DIR_PIN2_Pos) /*!< Bit mask of PIN2 field. */
#define GPIO_DIR_PIN2_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN2_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN1_Pos (1UL) /*!< Position of PIN1 field. */
#define GPIO_DIR_PIN1_Msk (0x1UL << GPIO_DIR_PIN1_Pos) /*!< Bit mask of PIN1 field. */
#define GPIO_DIR_PIN1_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN1_Output (1UL) /*!< Pin set as output */
#define GPIO_DIR_PIN0_Pos (0UL) /*!< Position of PIN0 field. */
#define GPIO_DIR_PIN0_Msk (0x1UL << GPIO_DIR_PIN0_Pos) /*!< Bit mask of PIN0 field. */
#define GPIO_DIR_PIN0_Input (0UL) /*!< Pin set as input */
#define GPIO_DIR_PIN0_Output (1UL) /*!< Pin set as output */
#define GPIO_DIRSET_PIN31_Pos (31UL) /*!< Position of PIN31 field. */
#define GPIO_DIRSET_PIN31_Msk (0x1UL << GPIO_DIRSET_PIN31_Pos) /*!< Bit mask of PIN31 field. */
#define GPIO_DIRSET_PIN31_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN31_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN31_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN30_Pos (30UL) /*!< Position of PIN30 field. */
#define GPIO_DIRSET_PIN30_Msk (0x1UL << GPIO_DIRSET_PIN30_Pos) /*!< Bit mask of PIN30 field. */
#define GPIO_DIRSET_PIN30_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN30_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN30_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN29_Pos (29UL) /*!< Position of PIN29 field. */
#define GPIO_DIRSET_PIN29_Msk (0x1UL << GPIO_DIRSET_PIN29_Pos) /*!< Bit mask of PIN29 field. */
#define GPIO_DIRSET_PIN29_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN29_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN29_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN28_Pos (28UL) /*!< Position of PIN28 field. */
#define GPIO_DIRSET_PIN28_Msk (0x1UL << GPIO_DIRSET_PIN28_Pos) /*!< Bit mask of PIN28 field. */
#define GPIO_DIRSET_PIN28_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN28_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN28_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN27_Pos (27UL) /*!< Position of PIN27 field. */
#define GPIO_DIRSET_PIN27_Msk (0x1UL << GPIO_DIRSET_PIN27_Pos) /*!< Bit mask of PIN27 field. */
#define GPIO_DIRSET_PIN27_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN27_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN27_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN26_Pos (26UL) /*!< Position of PIN26 field. */
#define GPIO_DIRSET_PIN26_Msk (0x1UL << GPIO_DIRSET_PIN26_Pos) /*!< Bit mask of PIN26 field. */
#define GPIO_DIRSET_PIN26_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN26_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN26_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN25_Pos (25UL) /*!< Position of PIN25 field. */
#define GPIO_DIRSET_PIN25_Msk (0x1UL << GPIO_DIRSET_PIN25_Pos) /*!< Bit mask of PIN25 field. */
#define GPIO_DIRSET_PIN25_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN25_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN25_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN24_Pos (24UL) /*!< Position of PIN24 field. */
#define GPIO_DIRSET_PIN24_Msk (0x1UL << GPIO_DIRSET_PIN24_Pos) /*!< Bit mask of PIN24 field. */
#define GPIO_DIRSET_PIN24_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN24_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN24_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN23_Pos (23UL) /*!< Position of PIN23 field. */
#define GPIO_DIRSET_PIN23_Msk (0x1UL << GPIO_DIRSET_PIN23_Pos) /*!< Bit mask of PIN23 field. */
#define GPIO_DIRSET_PIN23_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN23_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN23_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN22_Pos (22UL) /*!< Position of PIN22 field. */
#define GPIO_DIRSET_PIN22_Msk (0x1UL << GPIO_DIRSET_PIN22_Pos) /*!< Bit mask of PIN22 field. */
#define GPIO_DIRSET_PIN22_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN22_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN22_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN21_Pos (21UL) /*!< Position of PIN21 field. */
#define GPIO_DIRSET_PIN21_Msk (0x1UL << GPIO_DIRSET_PIN21_Pos) /*!< Bit mask of PIN21 field. */
#define GPIO_DIRSET_PIN21_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN21_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN21_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN20_Pos (20UL) /*!< Position of PIN20 field. */
#define GPIO_DIRSET_PIN20_Msk (0x1UL << GPIO_DIRSET_PIN20_Pos) /*!< Bit mask of PIN20 field. */
#define GPIO_DIRSET_PIN20_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN20_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN20_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN19_Pos (19UL) /*!< Position of PIN19 field. */
#define GPIO_DIRSET_PIN19_Msk (0x1UL << GPIO_DIRSET_PIN19_Pos) /*!< Bit mask of PIN19 field. */
#define GPIO_DIRSET_PIN19_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN19_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN19_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN18_Pos (18UL) /*!< Position of PIN18 field. */
#define GPIO_DIRSET_PIN18_Msk (0x1UL << GPIO_DIRSET_PIN18_Pos) /*!< Bit mask of PIN18 field. */
#define GPIO_DIRSET_PIN18_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN18_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN18_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN17_Pos (17UL) /*!< Position of PIN17 field. */
#define GPIO_DIRSET_PIN17_Msk (0x1UL << GPIO_DIRSET_PIN17_Pos) /*!< Bit mask of PIN17 field. */
#define GPIO_DIRSET_PIN17_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN17_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN17_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN16_Pos (16UL) /*!< Position of PIN16 field. */
#define GPIO_DIRSET_PIN16_Msk (0x1UL << GPIO_DIRSET_PIN16_Pos) /*!< Bit mask of PIN16 field. */
#define GPIO_DIRSET_PIN16_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN16_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN16_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN15_Pos (15UL) /*!< Position of PIN15 field. */
#define GPIO_DIRSET_PIN15_Msk (0x1UL << GPIO_DIRSET_PIN15_Pos) /*!< Bit mask of PIN15 field. */
#define GPIO_DIRSET_PIN15_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN15_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN15_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN14_Pos (14UL) /*!< Position of PIN14 field. */
#define GPIO_DIRSET_PIN14_Msk (0x1UL << GPIO_DIRSET_PIN14_Pos) /*!< Bit mask of PIN14 field. */
#define GPIO_DIRSET_PIN14_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN14_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN14_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN13_Pos (13UL) /*!< Position of PIN13 field. */
#define GPIO_DIRSET_PIN13_Msk (0x1UL << GPIO_DIRSET_PIN13_Pos) /*!< Bit mask of PIN13 field. */
#define GPIO_DIRSET_PIN13_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN13_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN13_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN12_Pos (12UL) /*!< Position of PIN12 field. */
#define GPIO_DIRSET_PIN12_Msk (0x1UL << GPIO_DIRSET_PIN12_Pos) /*!< Bit mask of PIN12 field. */
#define GPIO_DIRSET_PIN12_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN12_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN12_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN11_Pos (11UL) /*!< Position of PIN11 field. */
#define GPIO_DIRSET_PIN11_Msk (0x1UL << GPIO_DIRSET_PIN11_Pos) /*!< Bit mask of PIN11 field. */
#define GPIO_DIRSET_PIN11_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN11_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN11_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN10_Pos (10UL) /*!< Position of PIN10 field. */
#define GPIO_DIRSET_PIN10_Msk (0x1UL << GPIO_DIRSET_PIN10_Pos) /*!< Bit mask of PIN10 field. */
#define GPIO_DIRSET_PIN10_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN10_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN10_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN9_Pos (9UL) /*!< Position of PIN9 field. */
#define GPIO_DIRSET_PIN9_Msk (0x1UL << GPIO_DIRSET_PIN9_Pos) /*!< Bit mask of PIN9 field. */
#define GPIO_DIRSET_PIN9_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN9_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN9_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN8_Pos (8UL) /*!< Position of PIN8 field. */
#define GPIO_DIRSET_PIN8_Msk (0x1UL << GPIO_DIRSET_PIN8_Pos) /*!< Bit mask of PIN8 field. */
#define GPIO_DIRSET_PIN8_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN8_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN8_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN7_Pos (7UL) /*!< Position of PIN7 field. */
#define GPIO_DIRSET_PIN7_Msk (0x1UL << GPIO_DIRSET_PIN7_Pos) /*!< Bit mask of PIN7 field. */
#define GPIO_DIRSET_PIN7_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN7_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN7_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN6_Pos (6UL) /*!< Position of PIN6 field. */
#define GPIO_DIRSET_PIN6_Msk (0x1UL << GPIO_DIRSET_PIN6_Pos) /*!< Bit mask of PIN6 field. */
#define GPIO_DIRSET_PIN6_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN6_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN6_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN5_Pos (5UL) /*!< Position of PIN5 field. */
#define GPIO_DIRSET_PIN5_Msk (0x1UL << GPIO_DIRSET_PIN5_Pos) /*!< Bit mask of PIN5 field. */
#define GPIO_DIRSET_PIN5_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN5_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN5_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN4_Pos (4UL) /*!< Position of PIN4 field. */
#define GPIO_DIRSET_PIN4_Msk (0x1UL << GPIO_DIRSET_PIN4_Pos) /*!< Bit mask of PIN4 field. */
#define GPIO_DIRSET_PIN4_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN4_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN4_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN3_Pos (3UL) /*!< Position of PIN3 field. */
#define GPIO_DIRSET_PIN3_Msk (0x1UL << GPIO_DIRSET_PIN3_Pos) /*!< Bit mask of PIN3 field. */
#define GPIO_DIRSET_PIN3_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN3_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN3_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN2_Pos (2UL) /*!< Position of PIN2 field. */
#define GPIO_DIRSET_PIN2_Msk (0x1UL << GPIO_DIRSET_PIN2_Pos) /*!< Bit mask of PIN2 field. */
#define GPIO_DIRSET_PIN2_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN2_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN2_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN1_Pos (1UL) /*!< Position of PIN1 field. */
#define GPIO_DIRSET_PIN1_Msk (0x1UL << GPIO_DIRSET_PIN1_Pos) /*!< Bit mask of PIN1 field. */
#define GPIO_DIRSET_PIN1_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN1_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN1_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRSET_PIN0_Pos (0UL) /*!< Position of PIN0 field. */
#define GPIO_DIRSET_PIN0_Msk (0x1UL << GPIO_DIRSET_PIN0_Pos) /*!< Bit mask of PIN0 field. */
#define GPIO_DIRSET_PIN0_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRSET_PIN0_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRSET_PIN0_Set (1UL) /*!< Write: a '1' sets pin to output; a '0' has no effect */
#define GPIO_DIRCLR_PIN31_Pos (31UL) /*!< Position of PIN31 field. */
#define GPIO_DIRCLR_PIN31_Msk (0x1UL << GPIO_DIRCLR_PIN31_Pos) /*!< Bit mask of PIN31 field. */
#define GPIO_DIRCLR_PIN31_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN31_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN31_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN30_Pos (30UL) /*!< Position of PIN30 field. */
#define GPIO_DIRCLR_PIN30_Msk (0x1UL << GPIO_DIRCLR_PIN30_Pos) /*!< Bit mask of PIN30 field. */
#define GPIO_DIRCLR_PIN30_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN30_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN30_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN29_Pos (29UL) /*!< Position of PIN29 field. */
#define GPIO_DIRCLR_PIN29_Msk (0x1UL << GPIO_DIRCLR_PIN29_Pos) /*!< Bit mask of PIN29 field. */
#define GPIO_DIRCLR_PIN29_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN29_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN29_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN28_Pos (28UL) /*!< Position of PIN28 field. */
#define GPIO_DIRCLR_PIN28_Msk (0x1UL << GPIO_DIRCLR_PIN28_Pos) /*!< Bit mask of PIN28 field. */
#define GPIO_DIRCLR_PIN28_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN28_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN28_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN27_Pos (27UL) /*!< Position of PIN27 field. */
#define GPIO_DIRCLR_PIN27_Msk (0x1UL << GPIO_DIRCLR_PIN27_Pos) /*!< Bit mask of PIN27 field. */
#define GPIO_DIRCLR_PIN27_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN27_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN27_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN26_Pos (26UL) /*!< Position of PIN26 field. */
#define GPIO_DIRCLR_PIN26_Msk (0x1UL << GPIO_DIRCLR_PIN26_Pos) /*!< Bit mask of PIN26 field. */
#define GPIO_DIRCLR_PIN26_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN26_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN26_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN25_Pos (25UL) /*!< Position of PIN25 field. */
#define GPIO_DIRCLR_PIN25_Msk (0x1UL << GPIO_DIRCLR_PIN25_Pos) /*!< Bit mask of PIN25 field. */
#define GPIO_DIRCLR_PIN25_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN25_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN25_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN24_Pos (24UL) /*!< Position of PIN24 field. */
#define GPIO_DIRCLR_PIN24_Msk (0x1UL << GPIO_DIRCLR_PIN24_Pos) /*!< Bit mask of PIN24 field. */
#define GPIO_DIRCLR_PIN24_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN24_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN24_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN23_Pos (23UL) /*!< Position of PIN23 field. */
#define GPIO_DIRCLR_PIN23_Msk (0x1UL << GPIO_DIRCLR_PIN23_Pos) /*!< Bit mask of PIN23 field. */
#define GPIO_DIRCLR_PIN23_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN23_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN23_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN22_Pos (22UL) /*!< Position of PIN22 field. */
#define GPIO_DIRCLR_PIN22_Msk (0x1UL << GPIO_DIRCLR_PIN22_Pos) /*!< Bit mask of PIN22 field. */
#define GPIO_DIRCLR_PIN22_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN22_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN22_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN21_Pos (21UL) /*!< Position of PIN21 field. */
#define GPIO_DIRCLR_PIN21_Msk (0x1UL << GPIO_DIRCLR_PIN21_Pos) /*!< Bit mask of PIN21 field. */
#define GPIO_DIRCLR_PIN21_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN21_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN21_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN20_Pos (20UL) /*!< Position of PIN20 field. */
#define GPIO_DIRCLR_PIN20_Msk (0x1UL << GPIO_DIRCLR_PIN20_Pos) /*!< Bit mask of PIN20 field. */
#define GPIO_DIRCLR_PIN20_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN20_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN20_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN19_Pos (19UL) /*!< Position of PIN19 field. */
#define GPIO_DIRCLR_PIN19_Msk (0x1UL << GPIO_DIRCLR_PIN19_Pos) /*!< Bit mask of PIN19 field. */
#define GPIO_DIRCLR_PIN19_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN19_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN19_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN18_Pos (18UL) /*!< Position of PIN18 field. */
#define GPIO_DIRCLR_PIN18_Msk (0x1UL << GPIO_DIRCLR_PIN18_Pos) /*!< Bit mask of PIN18 field. */
#define GPIO_DIRCLR_PIN18_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN18_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN18_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN17_Pos (17UL) /*!< Position of PIN17 field. */
#define GPIO_DIRCLR_PIN17_Msk (0x1UL << GPIO_DIRCLR_PIN17_Pos) /*!< Bit mask of PIN17 field. */
#define GPIO_DIRCLR_PIN17_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN17_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN17_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN16_Pos (16UL) /*!< Position of PIN16 field. */
#define GPIO_DIRCLR_PIN16_Msk (0x1UL << GPIO_DIRCLR_PIN16_Pos) /*!< Bit mask of PIN16 field. */
#define GPIO_DIRCLR_PIN16_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN16_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN16_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN15_Pos (15UL) /*!< Position of PIN15 field. */
#define GPIO_DIRCLR_PIN15_Msk (0x1UL << GPIO_DIRCLR_PIN15_Pos) /*!< Bit mask of PIN15 field. */
#define GPIO_DIRCLR_PIN15_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN15_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN15_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN14_Pos (14UL) /*!< Position of PIN14 field. */
#define GPIO_DIRCLR_PIN14_Msk (0x1UL << GPIO_DIRCLR_PIN14_Pos) /*!< Bit mask of PIN14 field. */
#define GPIO_DIRCLR_PIN14_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN14_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN14_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN13_Pos (13UL) /*!< Position of PIN13 field. */
#define GPIO_DIRCLR_PIN13_Msk (0x1UL << GPIO_DIRCLR_PIN13_Pos) /*!< Bit mask of PIN13 field. */
#define GPIO_DIRCLR_PIN13_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN13_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN13_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN12_Pos (12UL) /*!< Position of PIN12 field. */
#define GPIO_DIRCLR_PIN12_Msk (0x1UL << GPIO_DIRCLR_PIN12_Pos) /*!< Bit mask of PIN12 field. */
#define GPIO_DIRCLR_PIN12_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN12_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN12_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN11_Pos (11UL) /*!< Position of PIN11 field. */
#define GPIO_DIRCLR_PIN11_Msk (0x1UL << GPIO_DIRCLR_PIN11_Pos) /*!< Bit mask of PIN11 field. */
#define GPIO_DIRCLR_PIN11_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN11_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN11_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN10_Pos (10UL) /*!< Position of PIN10 field. */
#define GPIO_DIRCLR_PIN10_Msk (0x1UL << GPIO_DIRCLR_PIN10_Pos) /*!< Bit mask of PIN10 field. */
#define GPIO_DIRCLR_PIN10_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN10_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN10_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN9_Pos (9UL) /*!< Position of PIN9 field. */
#define GPIO_DIRCLR_PIN9_Msk (0x1UL << GPIO_DIRCLR_PIN9_Pos) /*!< Bit mask of PIN9 field. */
#define GPIO_DIRCLR_PIN9_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN9_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN9_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN8_Pos (8UL) /*!< Position of PIN8 field. */
#define GPIO_DIRCLR_PIN8_Msk (0x1UL << GPIO_DIRCLR_PIN8_Pos) /*!< Bit mask of PIN8 field. */
#define GPIO_DIRCLR_PIN8_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN8_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN8_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN7_Pos (7UL) /*!< Position of PIN7 field. */
#define GPIO_DIRCLR_PIN7_Msk (0x1UL << GPIO_DIRCLR_PIN7_Pos) /*!< Bit mask of PIN7 field. */
#define GPIO_DIRCLR_PIN7_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN7_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN7_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN6_Pos (6UL) /*!< Position of PIN6 field. */
#define GPIO_DIRCLR_PIN6_Msk (0x1UL << GPIO_DIRCLR_PIN6_Pos) /*!< Bit mask of PIN6 field. */
#define GPIO_DIRCLR_PIN6_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN6_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN6_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN5_Pos (5UL) /*!< Position of PIN5 field. */
#define GPIO_DIRCLR_PIN5_Msk (0x1UL << GPIO_DIRCLR_PIN5_Pos) /*!< Bit mask of PIN5 field. */
#define GPIO_DIRCLR_PIN5_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN5_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN5_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN4_Pos (4UL) /*!< Position of PIN4 field. */
#define GPIO_DIRCLR_PIN4_Msk (0x1UL << GPIO_DIRCLR_PIN4_Pos) /*!< Bit mask of PIN4 field. */
#define GPIO_DIRCLR_PIN4_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN4_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN4_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN3_Pos (3UL) /*!< Position of PIN3 field. */
#define GPIO_DIRCLR_PIN3_Msk (0x1UL << GPIO_DIRCLR_PIN3_Pos) /*!< Bit mask of PIN3 field. */
#define GPIO_DIRCLR_PIN3_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN3_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN3_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN2_Pos (2UL) /*!< Position of PIN2 field. */
#define GPIO_DIRCLR_PIN2_Msk (0x1UL << GPIO_DIRCLR_PIN2_Pos) /*!< Bit mask of PIN2 field. */
#define GPIO_DIRCLR_PIN2_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN2_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN2_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN1_Pos (1UL) /*!< Position of PIN1 field. */
#define GPIO_DIRCLR_PIN1_Msk (0x1UL << GPIO_DIRCLR_PIN1_Pos) /*!< Bit mask of PIN1 field. */
#define GPIO_DIRCLR_PIN1_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN1_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN1_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_DIRCLR_PIN0_Pos (0UL) /*!< Position of PIN0 field. */
#define GPIO_DIRCLR_PIN0_Msk (0x1UL << GPIO_DIRCLR_PIN0_Pos) /*!< Bit mask of PIN0 field. */
#define GPIO_DIRCLR_PIN0_Input (0UL) /*!< Read: pin set as input */
#define GPIO_DIRCLR_PIN0_Output (1UL) /*!< Read: pin set as output */
#define GPIO_DIRCLR_PIN0_Clear (1UL) /*!< Write: a '1' sets pin to input; a '0' has no effect */
#define GPIO_LATCH_PIN31_Pos (31UL) /*!< Position of PIN31 field. */
#define GPIO_LATCH_PIN31_Msk (0x1UL << GPIO_LATCH_PIN31_Pos) /*!< Bit mask of PIN31 field. */
#define GPIO_LATCH_PIN31_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN31_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN30_Pos (30UL) /*!< Position of PIN30 field. */
#define GPIO_LATCH_PIN30_Msk (0x1UL << GPIO_LATCH_PIN30_Pos) /*!< Bit mask of PIN30 field. */
#define GPIO_LATCH_PIN30_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN30_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN29_Pos (29UL) /*!< Position of PIN29 field. */
#define GPIO_LATCH_PIN29_Msk (0x1UL << GPIO_LATCH_PIN29_Pos) /*!< Bit mask of PIN29 field. */
#define GPIO_LATCH_PIN29_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN29_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN28_Pos (28UL) /*!< Position of PIN28 field. */
#define GPIO_LATCH_PIN28_Msk (0x1UL << GPIO_LATCH_PIN28_Pos) /*!< Bit mask of PIN28 field. */
#define GPIO_LATCH_PIN28_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN28_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN27_Pos (27UL) /*!< Position of PIN27 field. */
#define GPIO_LATCH_PIN27_Msk (0x1UL << GPIO_LATCH_PIN27_Pos) /*!< Bit mask of PIN27 field. */
#define GPIO_LATCH_PIN27_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN27_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN26_Pos (26UL) /*!< Position of PIN26 field. */
#define GPIO_LATCH_PIN26_Msk (0x1UL << GPIO_LATCH_PIN26_Pos) /*!< Bit mask of PIN26 field. */
#define GPIO_LATCH_PIN26_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN26_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN25_Pos (25UL) /*!< Position of PIN25 field. */
#define GPIO_LATCH_PIN25_Msk (0x1UL << GPIO_LATCH_PIN25_Pos) /*!< Bit mask of PIN25 field. */
#define GPIO_LATCH_PIN25_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN25_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN24_Pos (24UL) /*!< Position of PIN24 field. */
#define GPIO_LATCH_PIN24_Msk (0x1UL << GPIO_LATCH_PIN24_Pos) /*!< Bit mask of PIN24 field. */
#define GPIO_LATCH_PIN24_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN24_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN23_Pos (23UL) /*!< Position of PIN23 field. */
#define GPIO_LATCH_PIN23_Msk (0x1UL << GPIO_LATCH_PIN23_Pos) /*!< Bit mask of PIN23 field. */
#define GPIO_LATCH_PIN23_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN23_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN22_Pos (22UL) /*!< Position of PIN22 field. */
#define GPIO_LATCH_PIN22_Msk (0x1UL << GPIO_LATCH_PIN22_Pos) /*!< Bit mask of PIN22 field. */
#define GPIO_LATCH_PIN22_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN22_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN21_Pos (21UL) /*!< Position of PIN21 field. */
#define GPIO_LATCH_PIN21_Msk (0x1UL << GPIO_LATCH_PIN21_Pos) /*!< Bit mask of PIN21 field. */
#define GPIO_LATCH_PIN21_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN21_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN20_Pos (20UL) /*!< Position of PIN20 field. */
#define GPIO_LATCH_PIN20_Msk (0x1UL << GPIO_LATCH_PIN20_Pos) /*!< Bit mask of PIN20 field. */
#define GPIO_LATCH_PIN20_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN20_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN19_Pos (19UL) /*!< Position of PIN19 field. */
#define GPIO_LATCH_PIN19_Msk (0x1UL << GPIO_LATCH_PIN19_Pos) /*!< Bit mask of PIN19 field. */
#define GPIO_LATCH_PIN19_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN19_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN18_Pos (18UL) /*!< Position of PIN18 field. */
#define GPIO_LATCH_PIN18_Msk (0x1UL << GPIO_LATCH_PIN18_Pos) /*!< Bit mask of PIN18 field. */
#define GPIO_LATCH_PIN18_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN18_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN17_Pos (17UL) /*!< Position of PIN17 field. */
#define GPIO_LATCH_PIN17_Msk (0x1UL << GPIO_LATCH_PIN17_Pos) /*!< Bit mask of PIN17 field. */
#define GPIO_LATCH_PIN17_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN17_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN16_Pos (16UL) /*!< Position of PIN16 field. */
#define GPIO_LATCH_PIN16_Msk (0x1UL << GPIO_LATCH_PIN16_Pos) /*!< Bit mask of PIN16 field. */
#define GPIO_LATCH_PIN16_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN16_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN15_Pos (15UL) /*!< Position of PIN15 field. */
#define GPIO_LATCH_PIN15_Msk (0x1UL << GPIO_LATCH_PIN15_Pos) /*!< Bit mask of PIN15 field. */
#define GPIO_LATCH_PIN15_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN15_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN14_Pos (14UL) /*!< Position of PIN14 field. */
#define GPIO_LATCH_PIN14_Msk (0x1UL << GPIO_LATCH_PIN14_Pos) /*!< Bit mask of PIN14 field. */
#define GPIO_LATCH_PIN14_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN14_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN13_Pos (13UL) /*!< Position of PIN13 field. */
#define GPIO_LATCH_PIN13_Msk (0x1UL << GPIO_LATCH_PIN13_Pos) /*!< Bit mask of PIN13 field. */
#define GPIO_LATCH_PIN13_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN13_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN12_Pos (12UL) /*!< Position of PIN12 field. */
#define GPIO_LATCH_PIN12_Msk (0x1UL << GPIO_LATCH_PIN12_Pos) /*!< Bit mask of PIN12 field. */
#define GPIO_LATCH_PIN12_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN12_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN11_Pos (11UL) /*!< Position of PIN11 field. */
#define GPIO_LATCH_PIN11_Msk (0x1UL << GPIO_LATCH_PIN11_Pos) /*!< Bit mask of PIN11 field. */
#define GPIO_LATCH_PIN11_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN11_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN10_Pos (10UL) /*!< Position of PIN10 field. */
#define GPIO_LATCH_PIN10_Msk (0x1UL << GPIO_LATCH_PIN10_Pos) /*!< Bit mask of PIN10 field. */
#define GPIO_LATCH_PIN10_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN10_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN9_Pos (9UL) /*!< Position of PIN9 field. */
#define GPIO_LATCH_PIN9_Msk (0x1UL << GPIO_LATCH_PIN9_Pos) /*!< Bit mask of PIN9 field. */
#define GPIO_LATCH_PIN9_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN9_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN8_Pos (8UL) /*!< Position of PIN8 field. */
#define GPIO_LATCH_PIN8_Msk (0x1UL << GPIO_LATCH_PIN8_Pos) /*!< Bit mask of PIN8 field. */
#define GPIO_LATCH_PIN8_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN8_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN7_Pos (7UL) /*!< Position of PIN7 field. */
#define GPIO_LATCH_PIN7_Msk (0x1UL << GPIO_LATCH_PIN7_Pos) /*!< Bit mask of PIN7 field. */
#define GPIO_LATCH_PIN7_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN7_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN6_Pos (6UL) /*!< Position of PIN6 field. */
#define GPIO_LATCH_PIN6_Msk (0x1UL << GPIO_LATCH_PIN6_Pos) /*!< Bit mask of PIN6 field. */
#define GPIO_LATCH_PIN6_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN6_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN5_Pos (5UL) /*!< Position of PIN5 field. */
#define GPIO_LATCH_PIN5_Msk (0x1UL << GPIO_LATCH_PIN5_Pos) /*!< Bit mask of PIN5 field. */
#define GPIO_LATCH_PIN5_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN5_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN4_Pos (4UL) /*!< Position of PIN4 field. */
#define GPIO_LATCH_PIN4_Msk (0x1UL << GPIO_LATCH_PIN4_Pos) /*!< Bit mask of PIN4 field. */
#define GPIO_LATCH_PIN4_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN4_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN3_Pos (3UL) /*!< Position of PIN3 field. */
#define GPIO_LATCH_PIN3_Msk (0x1UL << GPIO_LATCH_PIN3_Pos) /*!< Bit mask of PIN3 field. */
#define GPIO_LATCH_PIN3_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN3_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN2_Pos (2UL) /*!< Position of PIN2 field. */
#define GPIO_LATCH_PIN2_Msk (0x1UL << GPIO_LATCH_PIN2_Pos) /*!< Bit mask of PIN2 field. */
#define GPIO_LATCH_PIN2_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN2_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN1_Pos (1UL) /*!< Position of PIN1 field. */
#define GPIO_LATCH_PIN1_Msk (0x1UL << GPIO_LATCH_PIN1_Pos) /*!< Bit mask of PIN1 field. */
#define GPIO_LATCH_PIN1_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN1_Latched (1UL) /*!< Criteria has been met */
#define GPIO_LATCH_PIN0_Pos (0UL) /*!< Position of PIN0 field. */
#define GPIO_LATCH_PIN0_Msk (0x1UL << GPIO_LATCH_PIN0_Pos) /*!< Bit mask of PIN0 field. */
#define GPIO_LATCH_PIN0_NotLatched (0UL) /*!< Criteria has not been met */
#define GPIO_LATCH_PIN0_Latched (1UL) /*!< Criteria has been met */
#define GPIO_DETECTMODE_DETECTMODE_Pos (0UL) /*!< Position of DETECTMODE field. */
#define GPIO_DETECTMODE_DETECTMODE_Msk (0x1UL << GPIO_DETECTMODE_DETECTMODE_Pos) /*!< Bit mask of DETECTMODE field. */
#define GPIO_DETECTMODE_DETECTMODE_Default (0UL) /*!< DETECT directly connected to PIN DETECT signals */
#define GPIO_DETECTMODE_DETECTMODE_LDETECT (1UL) /*!< Use the latched LDETECT behavior */
#define GPIO_PIN_CNF_SENSE_Pos (16UL) /*!< Position of SENSE field. */
#define GPIO_PIN_CNF_SENSE_Msk (0x3UL << GPIO_PIN_CNF_SENSE_Pos) /*!< Bit mask of SENSE field. */
#define GPIO_PIN_CNF_SENSE_Disabled (0UL) /*!< Disabled */
#define GPIO_PIN_CNF_SENSE_High (2UL) /*!< Sense for high level */
#define GPIO_PIN_CNF_SENSE_Low (3UL) /*!< Sense for low level */
#define GPIO_PIN_CNF_DRIVE_Pos (8UL) /*!< Position of DRIVE field. */
#define GPIO_PIN_CNF_DRIVE_Msk (0x7UL << GPIO_PIN_CNF_DRIVE_Pos) /*!< Bit mask of DRIVE field. */
#define GPIO_PIN_CNF_DRIVE_S0S1 (0UL) /*!< Standard '0', standard '1' */
#define GPIO_PIN_CNF_DRIVE_H0S1 (1UL) /*!< High drive '0', standard '1' */
#define GPIO_PIN_CNF_DRIVE_S0H1 (2UL) /*!< Standard '0', high drive '1' */
#define GPIO_PIN_CNF_DRIVE_H0H1 (3UL) /*!< High drive '0', high 'drive '1'' */
#define GPIO_PIN_CNF_DRIVE_D0S1 (4UL) /*!< Disconnect '0' standard '1' (normally used for wired-or connections) */
#define GPIO_PIN_CNF_DRIVE_D0H1 (5UL) /*!< Disconnect '0', high drive '1' (normally used for wired-or connections) */
#define GPIO_PIN_CNF_DRIVE_S0D1 (6UL) /*!< Standard '0'. disconnect '1' (normally used for wired-and connections) */
#define GPIO_PIN_CNF_DRIVE_H0D1 (7UL) /*!< High drive '0', disconnect '1' (normally used for wired-and connections) */
#define GPIO_PIN_CNF_PULL_Pos (2UL) /*!< Position of PULL field. */
#define GPIO_PIN_CNF_PULL_Msk (0x3UL << GPIO_PIN_CNF_PULL_Pos) /*!< Bit mask of PULL field. */
#define GPIO_PIN_CNF_PULL_Disabled (0UL) /*!< No pull */
#define GPIO_PIN_CNF_PULL_Pulldown (1UL) /*!< Pull down on pin */
#define GPIO_PIN_CNF_PULL_Pullup (3UL) /*!< Pull up on pin */
#define GPIO_PIN_CNF_INPUT_Pos (1UL) /*!< Position of INPUT field. */
#define GPIO_PIN_CNF_INPUT_Msk (0x1UL << GPIO_PIN_CNF_INPUT_Pos) /*!< Bit mask of INPUT field. */
#define GPIO_PIN_CNF_INPUT_Connect (0UL) /*!< Connect input buffer */
#define GPIO_PIN_CNF_INPUT_Disconnect (1UL) /*!< Disconnect input buffer */
#define GPIO_PIN_CNF_DIR_Pos (0UL) /*!< Position of DIR field. */
#define GPIO_PIN_CNF_DIR_Msk (0x1UL << GPIO_PIN_CNF_DIR_Pos) /*!< Bit mask of DIR field. */
#define GPIO_PIN_CNF_DIR_Input (0UL) /*!< Configure pin as an input pin */
#define GPIO_PIN_CNF_DIR_Output (1UL) /*!< Configure pin as an output pin */
#define PWM_TASKS_STOP_TASKS_STOP_Pos (0UL) /*!< Position of TASKS_STOP field. */
#define PWM_TASKS_STOP_TASKS_STOP_Msk (0x1UL << PWM_TASKS_STOP_TASKS_STOP_Pos) /*!< Bit mask of TASKS_STOP field. */
#define PWM_TASKS_STOP_TASKS_STOP_Trigger (1UL) /*!< Trigger task */
#define PWM_TASKS_SEQSTART_TASKS_SEQSTART_Pos (0UL) /*!< Position of TASKS_SEQSTART field. */
#define PWM_TASKS_SEQSTART_TASKS_SEQSTART_Msk (0x1UL << PWM_TASKS_SEQSTART_TASKS_SEQSTART_Pos) /*!< Bit mask of TASKS_SEQSTART field. */
#define PWM_TASKS_SEQSTART_TASKS_SEQSTART_Trigger (1UL) /*!< Trigger task */
#define PWM_TASKS_NEXTSTEP_TASKS_NEXTSTEP_Pos (0UL) /*!< Position of TASKS_NEXTSTEP field. */
#define PWM_TASKS_NEXTSTEP_TASKS_NEXTSTEP_Msk (0x1UL << PWM_TASKS_NEXTSTEP_TASKS_NEXTSTEP_Pos) /*!< Bit mask of TASKS_NEXTSTEP field. */
#define PWM_TASKS_NEXTSTEP_TASKS_NEXTSTEP_Trigger (1UL) /*!< Trigger task */
#define PWM_EVENTS_STOPPED_EVENTS_STOPPED_Pos (0UL) /*!< Position of EVENTS_STOPPED field. */
#define PWM_EVENTS_STOPPED_EVENTS_STOPPED_Msk (0x1UL << PWM_EVENTS_STOPPED_EVENTS_STOPPED_Pos) /*!< Bit mask of EVENTS_STOPPED field. */
#define PWM_EVENTS_STOPPED_EVENTS_STOPPED_NotGenerated (0UL) /*!< Event not generated */
#define PWM_EVENTS_STOPPED_EVENTS_STOPPED_Generated (1UL) /*!< Event generated */
#define PWM_EVENTS_SEQSTARTED_EVENTS_SEQSTARTED_Pos (0UL) /*!< Position of EVENTS_SEQSTARTED field. */
#define PWM_EVENTS_SEQSTARTED_EVENTS_SEQSTARTED_Msk (0x1UL << PWM_EVENTS_SEQSTARTED_EVENTS_SEQSTARTED_Pos) /*!< Bit mask of EVENTS_SEQSTARTED field. */
#define PWM_EVENTS_SEQSTARTED_EVENTS_SEQSTARTED_NotGenerated (0UL) /*!< Event not generated */
#define PWM_EVENTS_SEQSTARTED_EVENTS_SEQSTARTED_Generated (1UL) /*!< Event generated */
#define PWM_EVENTS_SEQEND_EVENTS_SEQEND_Pos (0UL) /*!< Position of EVENTS_SEQEND field. */
#define PWM_EVENTS_SEQEND_EVENTS_SEQEND_Msk (0x1UL << PWM_EVENTS_SEQEND_EVENTS_SEQEND_Pos) /*!< Bit mask of EVENTS_SEQEND field. */
#define PWM_EVENTS_SEQEND_EVENTS_SEQEND_NotGenerated (0UL) /*!< Event not generated */
#define PWM_EVENTS_SEQEND_EVENTS_SEQEND_Generated (1UL) /*!< Event generated */
#define PWM_EVENTS_PWMPERIODEND_EVENTS_PWMPERIODEND_Pos (0UL) /*!< Position of EVENTS_PWMPERIODEND field. */
#define PWM_EVENTS_PWMPERIODEND_EVENTS_PWMPERIODEND_Msk (0x1UL << PWM_EVENTS_PWMPERIODEND_EVENTS_PWMPERIODEND_Pos) /*!< Bit mask of EVENTS_PWMPERIODEND field. */
#define PWM_EVENTS_PWMPERIODEND_EVENTS_PWMPERIODEND_NotGenerated (0UL) /*!< Event not generated */
#define PWM_EVENTS_PWMPERIODEND_EVENTS_PWMPERIODEND_Generated (1UL) /*!< Event generated */
#define PWM_EVENTS_LOOPSDONE_EVENTS_LOOPSDONE_Pos (0UL) /*!< Position of EVENTS_LOOPSDONE field. */
#define PWM_EVENTS_LOOPSDONE_EVENTS_LOOPSDONE_Msk (0x1UL << PWM_EVENTS_LOOPSDONE_EVENTS_LOOPSDONE_Pos) /*!< Bit mask of EVENTS_LOOPSDONE field. */
#define PWM_EVENTS_LOOPSDONE_EVENTS_LOOPSDONE_NotGenerated (0UL) /*!< Event not generated */
#define PWM_EVENTS_LOOPSDONE_EVENTS_LOOPSDONE_Generated (1UL) /*!< Event generated */
#define PWM_SHORTS_LOOPSDONE_STOP_Pos (4UL) /*!< Position of LOOPSDONE_STOP field. */
#define PWM_SHORTS_LOOPSDONE_STOP_Msk (0x1UL << PWM_SHORTS_LOOPSDONE_STOP_Pos) /*!< Bit mask of LOOPSDONE_STOP field. */
#define PWM_SHORTS_LOOPSDONE_STOP_Disabled (0UL) /*!< Disable shortcut */
#define PWM_SHORTS_LOOPSDONE_STOP_Enabled (1UL) /*!< Enable shortcut */
#define PWM_SHORTS_LOOPSDONE_SEQSTART1_Pos (3UL) /*!< Position of LOOPSDONE_SEQSTART1 field. */
#define PWM_SHORTS_LOOPSDONE_SEQSTART1_Msk (0x1UL << PWM_SHORTS_LOOPSDONE_SEQSTART1_Pos) /*!< Bit mask of LOOPSDONE_SEQSTART1 field. */
#define PWM_SHORTS_LOOPSDONE_SEQSTART1_Disabled (0UL) /*!< Disable shortcut */
#define PWM_SHORTS_LOOPSDONE_SEQSTART1_Enabled (1UL) /*!< Enable shortcut */
#define PWM_SHORTS_LOOPSDONE_SEQSTART0_Pos (2UL) /*!< Position of LOOPSDONE_SEQSTART0 field. */
#define PWM_SHORTS_LOOPSDONE_SEQSTART0_Msk (0x1UL << PWM_SHORTS_LOOPSDONE_SEQSTART0_Pos) /*!< Bit mask of LOOPSDONE_SEQSTART0 field. */
#define PWM_SHORTS_LOOPSDONE_SEQSTART0_Disabled (0UL) /*!< Disable shortcut */
#define PWM_SHORTS_LOOPSDONE_SEQSTART0_Enabled (1UL) /*!< Enable shortcut */
#define PWM_SHORTS_SEQEND1_STOP_Pos (1UL) /*!< Position of SEQEND1_STOP field. */
#define PWM_SHORTS_SEQEND1_STOP_Msk (0x1UL << PWM_SHORTS_SEQEND1_STOP_Pos) /*!< Bit mask of SEQEND1_STOP field. */
#define PWM_SHORTS_SEQEND1_STOP_Disabled (0UL) /*!< Disable shortcut */
#define PWM_SHORTS_SEQEND1_STOP_Enabled (1UL) /*!< Enable shortcut */
#define PWM_SHORTS_SEQEND0_STOP_Pos (0UL) /*!< Position of SEQEND0_STOP field. */
#define PWM_SHORTS_SEQEND0_STOP_Msk (0x1UL << PWM_SHORTS_SEQEND0_STOP_Pos) /*!< Bit mask of SEQEND0_STOP field. */
#define PWM_SHORTS_SEQEND0_STOP_Disabled (0UL) /*!< Disable shortcut */
#define PWM_SHORTS_SEQEND0_STOP_Enabled (1UL) /*!< Enable shortcut */
#define PWM_INTEN_LOOPSDONE_Pos (7UL) /*!< Position of LOOPSDONE field. */
#define PWM_INTEN_LOOPSDONE_Msk (0x1UL << PWM_INTEN_LOOPSDONE_Pos) /*!< Bit mask of LOOPSDONE field. */
#define PWM_INTEN_LOOPSDONE_Disabled (0UL) /*!< Disable */
#define PWM_INTEN_LOOPSDONE_Enabled (1UL) /*!< Enable */
#define PWM_INTEN_PWMPERIODEND_Pos (6UL) /*!< Position of PWMPERIODEND field. */
#define PWM_INTEN_PWMPERIODEND_Msk (0x1UL << PWM_INTEN_PWMPERIODEND_Pos) /*!< Bit mask of PWMPERIODEND field. */
#define PWM_INTEN_PWMPERIODEND_Disabled (0UL) /*!< Disable */
#define PWM_INTEN_PWMPERIODEND_Enabled (1UL) /*!< Enable */
#define PWM_INTEN_SEQEND1_Pos (5UL) /*!< Position of SEQEND1 field. */
#define PWM_INTEN_SEQEND1_Msk (0x1UL << PWM_INTEN_SEQEND1_Pos) /*!< Bit mask of SEQEND1 field. */
#define PWM_INTEN_SEQEND1_Disabled (0UL) /*!< Disable */
#define PWM_INTEN_SEQEND1_Enabled (1UL) /*!< Enable */
#define PWM_INTEN_SEQEND0_Pos (4UL) /*!< Position of SEQEND0 field. */
#define PWM_INTEN_SEQEND0_Msk (0x1UL << PWM_INTEN_SEQEND0_Pos) /*!< Bit mask of SEQEND0 field. */
#define PWM_INTEN_SEQEND0_Disabled (0UL) /*!< Disable */
#define PWM_INTEN_SEQEND0_Enabled (1UL) /*!< Enable */
#define PWM_INTEN_SEQSTARTED1_Pos (3UL) /*!< Position of SEQSTARTED1 field. */
#define PWM_INTEN_SEQSTARTED1_Msk (0x1UL << PWM_INTEN_SEQSTARTED1_Pos) /*!< Bit mask of SEQSTARTED1 field. */
#define PWM_INTEN_SEQSTARTED1_Disabled (0UL) /*!< Disable */
#define PWM_INTEN_SEQSTARTED1_Enabled (1UL) /*!< Enable */
#define PWM_INTEN_SEQSTARTED0_Pos (2UL) /*!< Position of SEQSTARTED0 field. */
#define PWM_INTEN_SEQSTARTED0_Msk (0x1UL << PWM_INTEN_SEQSTARTED0_Pos) /*!< Bit mask of SEQSTARTED0 field. */
#define PWM_INTEN_SEQSTARTED0_Disabled (0UL) /*!< Disable */
#define PWM_INTEN_SEQSTARTED0_Enabled (1UL) /*!< Enable */
#define PWM_INTEN_STOPPED_Pos (1UL) /*!< Position of STOPPED field. */
#define PWM_INTEN_STOPPED_Msk (0x1UL << PWM_INTEN_STOPPED_Pos) /*!< Bit mask of STOPPED field. */
#define PWM_INTEN_STOPPED_Disabled (0UL) /*!< Disable */
#define PWM_INTEN_STOPPED_Enabled (1UL) /*!< Enable */
#define PWM_INTENSET_LOOPSDONE_Pos (7UL) /*!< Position of LOOPSDONE field. */
#define PWM_INTENSET_LOOPSDONE_Msk (0x1UL << PWM_INTENSET_LOOPSDONE_Pos) /*!< Bit mask of LOOPSDONE field. */
#define PWM_INTENSET_LOOPSDONE_Disabled (0UL) /*!< Read: Disabled */
#define PWM_INTENSET_LOOPSDONE_Enabled (1UL) /*!< Read: Enabled */
#define PWM_INTENSET_LOOPSDONE_Set (1UL) /*!< Enable */
#define PWM_INTENSET_PWMPERIODEND_Pos (6UL) /*!< Position of PWMPERIODEND field. */
#define PWM_INTENSET_PWMPERIODEND_Msk (0x1UL << PWM_INTENSET_PWMPERIODEND_Pos) /*!< Bit mask of PWMPERIODEND field. */
#define PWM_INTENSET_PWMPERIODEND_Disabled (0UL) /*!< Read: Disabled */
#define PWM_INTENSET_PWMPERIODEND_Enabled (1UL) /*!< Read: Enabled */
#define PWM_INTENSET_PWMPERIODEND_Set (1UL) /*!< Enable */
#define PWM_INTENSET_SEQEND1_Pos (5UL) /*!< Position of SEQEND1 field. */
#define PWM_INTENSET_SEQEND1_Msk (0x1UL << PWM_INTENSET_SEQEND1_Pos) /*!< Bit mask of SEQEND1 field. */
#define PWM_INTENSET_SEQEND1_Disabled (0UL) /*!< Read: Disabled */
#define PWM_INTENSET_SEQEND1_Enabled (1UL) /*!< Read: Enabled */
#define PWM_INTENSET_SEQEND1_Set (1UL) /*!< Enable */
#define PWM_INTENSET_SEQEND0_Pos (4UL) /*!< Position of SEQEND0 field. */
#define PWM_INTENSET_SEQEND0_Msk (0x1UL << PWM_INTENSET_SEQEND0_Pos) /*!< Bit mask of SEQEND0 field. */
#define PWM_INTENSET_SEQEND0_Disabled (0UL) /*!< Read: Disabled */
#define PWM_INTENSET_SEQEND0_Enabled (1UL) /*!< Read: Enabled */
#define PWM_INTENSET_SEQEND0_Set (1UL) /*!< Enable */
#define PWM_INTENSET_SEQSTARTED1_Pos (3UL) /*!< Position of SEQSTARTED1 field. */
#define PWM_INTENSET_SEQSTARTED1_Msk (0x1UL << PWM_INTENSET_SEQSTARTED1_Pos) /*!< Bit mask of SEQSTARTED1 field. */
#define PWM_INTENSET_SEQSTARTED1_Disabled (0UL) /*!< Read: Disabled */
#define PWM_INTENSET_SEQSTARTED1_Enabled (1UL) /*!< Read: Enabled */
#define PWM_INTENSET_SEQSTARTED1_Set (1UL) /*!< Enable */
#define PWM_INTENSET_SEQSTARTED0_Pos (2UL) /*!< Position of SEQSTARTED0 field. */
#define PWM_INTENSET_SEQSTARTED0_Msk (0x1UL << PWM_INTENSET_SEQSTARTED0_Pos) /*!< Bit mask of SEQSTARTED0 field. */
#define PWM_INTENSET_SEQSTARTED0_Disabled (0UL) /*!< Read: Disabled */
#define PWM_INTENSET_SEQSTARTED0_Enabled (1UL) /*!< Read: Enabled */
#define PWM_INTENSET_SEQSTARTED0_Set (1UL) /*!< Enable */
#define PWM_INTENSET_STOPPED_Pos (1UL) /*!< Position of STOPPED field. */
#define PWM_INTENSET_STOPPED_Msk (0x1UL << PWM_INTENSET_STOPPED_Pos) /*!< Bit mask of STOPPED field. */
#define PWM_INTENSET_STOPPED_Disabled (0UL) /*!< Read: Disabled */
#define PWM_INTENSET_STOPPED_Enabled (1UL) /*!< Read: Enabled */
#define PWM_INTENSET_STOPPED_Set (1UL) /*!< Enable */
#define PWM_INTENCLR_LOOPSDONE_Pos (7UL) /*!< Position of LOOPSDONE field. */
#define PWM_INTENCLR_LOOPSDONE_Msk (0x1UL << PWM_INTENCLR_LOOPSDONE_Pos) /*!< Bit mask of LOOPSDONE field. */
#define PWM_INTENCLR_LOOPSDONE_Disabled (0UL) /*!< Read: Disabled */
#define PWM_INTENCLR_LOOPSDONE_Enabled (1UL) /*!< Read: Enabled */
#define PWM_INTENCLR_LOOPSDONE_Clear (1UL) /*!< Disable */
#define PWM_INTENCLR_PWMPERIODEND_Pos (6UL) /*!< Position of PWMPERIODEND field. */
#define PWM_INTENCLR_PWMPERIODEND_Msk (0x1UL << PWM_INTENCLR_PWMPERIODEND_Pos) /*!< Bit mask of PWMPERIODEND field. */
#define PWM_INTENCLR_PWMPERIODEND_Disabled (0UL) /*!< Read: Disabled */
#define PWM_INTENCLR_PWMPERIODEND_Enabled (1UL) /*!< Read: Enabled */
#define PWM_INTENCLR_PWMPERIODEND_Clear (1UL) /*!< Disable */
#define PWM_INTENCLR_SEQEND1_Pos (5UL) /*!< Position of SEQEND1 field. */
#define PWM_INTENCLR_SEQEND1_Msk (0x1UL << PWM_INTENCLR_SEQEND1_Pos) /*!< Bit mask of SEQEND1 field. */
#define PWM_INTENCLR_SEQEND1_Disabled (0UL) /*!< Read: Disabled */
#define PWM_INTENCLR_SEQEND1_Enabled (1UL) /*!< Read: Enabled */
#define PWM_INTENCLR_SEQEND1_Clear (1UL) /*!< Disable */
#define PWM_INTENCLR_SEQEND0_Pos (4UL) /*!< Position of SEQEND0 field. */
#define PWM_INTENCLR_SEQEND0_Msk (0x1UL << PWM_INTENCLR_SEQEND0_Pos) /*!< Bit mask of SEQEND0 field. */
#define PWM_INTENCLR_SEQEND0_Disabled (0UL) /*!< Read: Disabled */
#define PWM_INTENCLR_SEQEND0_Enabled (1UL) /*!< Read: Enabled */
#define PWM_INTENCLR_SEQEND0_Clear (1UL) /*!< Disable */
#define PWM_INTENCLR_SEQSTARTED1_Pos (3UL) /*!< Position of SEQSTARTED1 field. */
#define PWM_INTENCLR_SEQSTARTED1_Msk (0x1UL << PWM_INTENCLR_SEQSTARTED1_Pos) /*!< Bit mask of SEQSTARTED1 field. */
#define PWM_INTENCLR_SEQSTARTED1_Disabled (0UL) /*!< Read: Disabled */
#define PWM_INTENCLR_SEQSTARTED1_Enabled (1UL) /*!< Read: Enabled */
#define PWM_INTENCLR_SEQSTARTED1_Clear (1UL) /*!< Disable */
#define PWM_INTENCLR_SEQSTARTED0_Pos (2UL) /*!< Position of SEQSTARTED0 field. */
#define PWM_INTENCLR_SEQSTARTED0_Msk (0x1UL << PWM_INTENCLR_SEQSTARTED0_Pos) /*!< Bit mask of SEQSTARTED0 field. */
#define PWM_INTENCLR_SEQSTARTED0_Disabled (0UL) /*!< Read: Disabled */
#define PWM_INTENCLR_SEQSTARTED0_Enabled (1UL) /*!< Read: Enabled */
#define PWM_INTENCLR_SEQSTARTED0_Clear (1UL) /*!< Disable */
#define PWM_INTENCLR_STOPPED_Pos (1UL) /*!< Position of STOPPED field. */
#define PWM_INTENCLR_STOPPED_Msk (0x1UL << PWM_INTENCLR_STOPPED_Pos) /*!< Bit mask of STOPPED field. */
#define PWM_INTENCLR_STOPPED_Disabled (0UL) /*!< Read: Disabled */
#define PWM_INTENCLR_STOPPED_Enabled (1UL) /*!< Read: Enabled */
#define PWM_INTENCLR_STOPPED_Clear (1UL) /*!< Disable */
#define PWM_ENABLE_ENABLE_Pos (0UL) /*!< Position of ENABLE field. */
#define PWM_ENABLE_ENABLE_Msk (0x1UL << PWM_ENABLE_ENABLE_Pos) /*!< Bit mask of ENABLE field. */
#define PWM_ENABLE_ENABLE_Disabled (0UL) /*!< Disabled */
#define PWM_ENABLE_ENABLE_Enabled (1UL) /*!< Enable */
#define PWM_MODE_UPDOWN_Pos (0UL) /*!< Position of UPDOWN field. */
#define PWM_MODE_UPDOWN_Msk (0x1UL << PWM_MODE_UPDOWN_Pos) /*!< Bit mask of UPDOWN field. */
#define PWM_MODE_UPDOWN_Up (0UL) /*!< Up counter, edge-aligned PWM duty cycle */
#define PWM_MODE_UPDOWN_UpAndDown (1UL) /*!< Up and down counter, center-aligned PWM duty cycle */
#define PWM_COUNTERTOP_COUNTERTOP_Pos (0UL) /*!< Position of COUNTERTOP field. */
#define PWM_COUNTERTOP_COUNTERTOP_Msk (0x7FFFUL << PWM_COUNTERTOP_COUNTERTOP_Pos) /*!< Bit mask of COUNTERTOP field. */
#define PWM_PRESCALER_PRESCALER_Pos (0UL) /*!< Position of PRESCALER field. */
#define PWM_PRESCALER_PRESCALER_Msk (0x7UL << PWM_PRESCALER_PRESCALER_Pos) /*!< Bit mask of PRESCALER field. */
#define PWM_PRESCALER_PRESCALER_DIV_1 (0UL) /*!< Divide by 1 (16 MHz) */
#define PWM_PRESCALER_PRESCALER_DIV_2 (1UL) /*!< Divide by 2 (8 MHz) */
#define PWM_PRESCALER_PRESCALER_DIV_4 (2UL) /*!< Divide by 4 (4 MHz) */
#define PWM_PRESCALER_PRESCALER_DIV_8 (3UL) /*!< Divide by 8 (2 MHz) */
#define PWM_PRESCALER_PRESCALER_DIV_16 (4UL) /*!< Divide by 16 (1 MHz) */
#define PWM_PRESCALER_PRESCALER_DIV_32 (5UL) /*!< Divide by 32 (500 kHz) */
#define PWM_PRESCALER_PRESCALER_DIV_64 (6UL) /*!< Divide by 64 (250 kHz) */
#define PWM_PRESCALER_PRESCALER_DIV_128 (7UL) /*!< Divide by 128 (125 kHz) */
#define PWM_DECODER_MODE_Pos (8UL) /*!< Position of MODE field. */
#define PWM_DECODER_MODE_Msk (0x1UL << PWM_DECODER_MODE_Pos) /*!< Bit mask of MODE field. */
#define PWM_DECODER_MODE_RefreshCount (0UL) /*!< SEQ[n].REFRESH is used to determine loading internal compare registers */
#define PWM_DECODER_MODE_NextStep (1UL) /*!< NEXTSTEP task causes a new value to be loaded to internal compare registers */
#define PWM_DECODER_LOAD_Pos (0UL) /*!< Position of LOAD field. */
#define PWM_DECODER_LOAD_Msk (0x3UL << PWM_DECODER_LOAD_Pos) /*!< Bit mask of LOAD field. */
#define PWM_DECODER_LOAD_Common (0UL) /*!< 1st half word (16-bit) used in all PWM channels 0..3 */
#define PWM_DECODER_LOAD_Grouped (1UL) /*!< 1st half word (16-bit) used in channel 0..1; 2nd word in channel 2..3 */
#define PWM_DECODER_LOAD_Individual (2UL) /*!< 1st half word (16-bit) in ch.0; 2nd in ch.1; ...; 4th in ch.3 */
#define PWM_DECODER_LOAD_WaveForm (3UL) /*!< 1st half word (16-bit) in ch.0; 2nd in ch.1; ...; 4th in COUNTERTOP */
#define PWM_LOOP_CNT_Pos (0UL) /*!< Position of CNT field. */
#define PWM_LOOP_CNT_Msk (0xFFFFUL << PWM_LOOP_CNT_Pos) /*!< Bit mask of CNT field. */
#define PWM_LOOP_CNT_Disabled (0UL) /*!< Looping disabled (stop at the end of the sequence) */
#define PWM_SEQ_PTR_PTR_Pos (0UL) /*!< Position of PTR field. */
#define PWM_SEQ_PTR_PTR_Msk (0xFFFFFFFFUL << PWM_SEQ_PTR_PTR_Pos) /*!< Bit mask of PTR field. */
#define PWM_SEQ_CNT_CNT_Pos (0UL) /*!< Position of CNT field. */
#define PWM_SEQ_CNT_CNT_Msk (0x7FFFUL << PWM_SEQ_CNT_CNT_Pos) /*!< Bit mask of CNT field. */
#define PWM_SEQ_CNT_CNT_Disabled (0UL) /*!< Sequence is disabled, and shall not be started as it is empty */
#define PWM_SEQ_REFRESH_CNT_Pos (0UL) /*!< Position of CNT field. */
#define PWM_SEQ_REFRESH_CNT_Msk (0xFFFFFFUL << PWM_SEQ_REFRESH_CNT_Pos) /*!< Bit mask of CNT field. */
#define PWM_SEQ_REFRESH_CNT_Continuous (0UL) /*!< Update every PWM period */
#define PWM_SEQ_ENDDELAY_CNT_Pos (0UL) /*!< Position of CNT field. */
#define PWM_SEQ_ENDDELAY_CNT_Msk (0xFFFFFFUL << PWM_SEQ_ENDDELAY_CNT_Pos) /*!< Bit mask of CNT field. */
#define PWM_PSEL_OUT_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define PWM_PSEL_OUT_CONNECT_Msk (0x1UL << PWM_PSEL_OUT_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define PWM_PSEL_OUT_CONNECT_Connected (0UL) /*!< Connect */
#define PWM_PSEL_OUT_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define PWM_PSEL_OUT_PORT_Pos (5UL) /*!< Position of PORT field. */
#define PWM_PSEL_OUT_PORT_Msk (0x1UL << PWM_PSEL_OUT_PORT_Pos) /*!< Bit mask of PORT field. */
#define PWM_PSEL_OUT_PIN_Pos (0UL) /*!< Position of PIN field. */
#define PWM_PSEL_OUT_PIN_Msk (0x1FUL << PWM_PSEL_OUT_PIN_Pos) /*!< Bit mask of PIN field. */
#define SAADC_TASKS_START_TASKS_START_Pos (0UL) /*!< Position of TASKS_START field. */
#define SAADC_TASKS_START_TASKS_START_Msk (0x1UL << SAADC_TASKS_START_TASKS_START_Pos) /*!< Bit mask of TASKS_START field. */
#define SAADC_TASKS_START_TASKS_START_Trigger (1UL) /*!< Trigger task */
#define SAADC_TASKS_SAMPLE_TASKS_SAMPLE_Pos (0UL) /*!< Position of TASKS_SAMPLE field. */
#define SAADC_TASKS_SAMPLE_TASKS_SAMPLE_Msk (0x1UL << SAADC_TASKS_SAMPLE_TASKS_SAMPLE_Pos) /*!< Bit mask of TASKS_SAMPLE field. */
#define SAADC_TASKS_SAMPLE_TASKS_SAMPLE_Trigger (1UL) /*!< Trigger task */
#define SAADC_TASKS_STOP_TASKS_STOP_Pos (0UL) /*!< Position of TASKS_STOP field. */
#define SAADC_TASKS_STOP_TASKS_STOP_Msk (0x1UL << SAADC_TASKS_STOP_TASKS_STOP_Pos) /*!< Bit mask of TASKS_STOP field. */
#define SAADC_TASKS_STOP_TASKS_STOP_Trigger (1UL) /*!< Trigger task */
#define SAADC_TASKS_CALIBRATEOFFSET_TASKS_CALIBRATEOFFSET_Pos (0UL) /*!< Position of TASKS_CALIBRATEOFFSET field. */
#define SAADC_TASKS_CALIBRATEOFFSET_TASKS_CALIBRATEOFFSET_Msk (0x1UL << SAADC_TASKS_CALIBRATEOFFSET_TASKS_CALIBRATEOFFSET_Pos) /*!< Bit mask of TASKS_CALIBRATEOFFSET field. */
#define SAADC_TASKS_CALIBRATEOFFSET_TASKS_CALIBRATEOFFSET_Trigger (1UL) /*!< Trigger task */
#define SAADC_EVENTS_STARTED_EVENTS_STARTED_Pos (0UL) /*!< Position of EVENTS_STARTED field. */
#define SAADC_EVENTS_STARTED_EVENTS_STARTED_Msk (0x1UL << SAADC_EVENTS_STARTED_EVENTS_STARTED_Pos) /*!< Bit mask of EVENTS_STARTED field. */
#define SAADC_EVENTS_STARTED_EVENTS_STARTED_NotGenerated (0UL) /*!< Event not generated */
#define SAADC_EVENTS_STARTED_EVENTS_STARTED_Generated (1UL) /*!< Event generated */
#define SAADC_EVENTS_END_EVENTS_END_Pos (0UL) /*!< Position of EVENTS_END field. */
#define SAADC_EVENTS_END_EVENTS_END_Msk (0x1UL << SAADC_EVENTS_END_EVENTS_END_Pos) /*!< Bit mask of EVENTS_END field. */
#define SAADC_EVENTS_END_EVENTS_END_NotGenerated (0UL) /*!< Event not generated */
#define SAADC_EVENTS_END_EVENTS_END_Generated (1UL) /*!< Event generated */
#define SAADC_EVENTS_DONE_EVENTS_DONE_Pos (0UL) /*!< Position of EVENTS_DONE field. */
#define SAADC_EVENTS_DONE_EVENTS_DONE_Msk (0x1UL << SAADC_EVENTS_DONE_EVENTS_DONE_Pos) /*!< Bit mask of EVENTS_DONE field. */
#define SAADC_EVENTS_DONE_EVENTS_DONE_NotGenerated (0UL) /*!< Event not generated */
#define SAADC_EVENTS_DONE_EVENTS_DONE_Generated (1UL) /*!< Event generated */
#define SAADC_EVENTS_RESULTDONE_EVENTS_RESULTDONE_Pos (0UL) /*!< Position of EVENTS_RESULTDONE field. */
#define SAADC_EVENTS_RESULTDONE_EVENTS_RESULTDONE_Msk (0x1UL << SAADC_EVENTS_RESULTDONE_EVENTS_RESULTDONE_Pos) /*!< Bit mask of EVENTS_RESULTDONE field. */
#define SAADC_EVENTS_RESULTDONE_EVENTS_RESULTDONE_NotGenerated (0UL) /*!< Event not generated */
#define SAADC_EVENTS_RESULTDONE_EVENTS_RESULTDONE_Generated (1UL) /*!< Event generated */
#define SAADC_EVENTS_CALIBRATEDONE_EVENTS_CALIBRATEDONE_Pos (0UL) /*!< Position of EVENTS_CALIBRATEDONE field. */
#define SAADC_EVENTS_CALIBRATEDONE_EVENTS_CALIBRATEDONE_Msk (0x1UL << SAADC_EVENTS_CALIBRATEDONE_EVENTS_CALIBRATEDONE_Pos) /*!< Bit mask of EVENTS_CALIBRATEDONE field. */
#define SAADC_EVENTS_CALIBRATEDONE_EVENTS_CALIBRATEDONE_NotGenerated (0UL) /*!< Event not generated */
#define SAADC_EVENTS_CALIBRATEDONE_EVENTS_CALIBRATEDONE_Generated (1UL) /*!< Event generated */
#define SAADC_EVENTS_STOPPED_EVENTS_STOPPED_Pos (0UL) /*!< Position of EVENTS_STOPPED field. */
#define SAADC_EVENTS_STOPPED_EVENTS_STOPPED_Msk (0x1UL << SAADC_EVENTS_STOPPED_EVENTS_STOPPED_Pos) /*!< Bit mask of EVENTS_STOPPED field. */
#define SAADC_EVENTS_STOPPED_EVENTS_STOPPED_NotGenerated (0UL) /*!< Event not generated */
#define SAADC_EVENTS_STOPPED_EVENTS_STOPPED_Generated (1UL) /*!< Event generated */
#define SAADC_EVENTS_CH_LIMITH_LIMITH_Pos (0UL) /*!< Position of LIMITH field. */
#define SAADC_EVENTS_CH_LIMITH_LIMITH_Msk (0x1UL << SAADC_EVENTS_CH_LIMITH_LIMITH_Pos) /*!< Bit mask of LIMITH field. */
#define SAADC_EVENTS_CH_LIMITH_LIMITH_NotGenerated (0UL) /*!< Event not generated */
#define SAADC_EVENTS_CH_LIMITH_LIMITH_Generated (1UL) /*!< Event generated */
#define SAADC_EVENTS_CH_LIMITL_LIMITL_Pos (0UL) /*!< Position of LIMITL field. */
#define SAADC_EVENTS_CH_LIMITL_LIMITL_Msk (0x1UL << SAADC_EVENTS_CH_LIMITL_LIMITL_Pos) /*!< Bit mask of LIMITL field. */
#define SAADC_EVENTS_CH_LIMITL_LIMITL_NotGenerated (0UL) /*!< Event not generated */
#define SAADC_EVENTS_CH_LIMITL_LIMITL_Generated (1UL) /*!< Event generated */
#define SAADC_INTEN_CH7LIMITL_Pos (21UL) /*!< Position of CH7LIMITL field. */
#define SAADC_INTEN_CH7LIMITL_Msk (0x1UL << SAADC_INTEN_CH7LIMITL_Pos) /*!< Bit mask of CH7LIMITL field. */
#define SAADC_INTEN_CH7LIMITL_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CH7LIMITL_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_CH7LIMITH_Pos (20UL) /*!< Position of CH7LIMITH field. */
#define SAADC_INTEN_CH7LIMITH_Msk (0x1UL << SAADC_INTEN_CH7LIMITH_Pos) /*!< Bit mask of CH7LIMITH field. */
#define SAADC_INTEN_CH7LIMITH_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CH7LIMITH_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_CH6LIMITL_Pos (19UL) /*!< Position of CH6LIMITL field. */
#define SAADC_INTEN_CH6LIMITL_Msk (0x1UL << SAADC_INTEN_CH6LIMITL_Pos) /*!< Bit mask of CH6LIMITL field. */
#define SAADC_INTEN_CH6LIMITL_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CH6LIMITL_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_CH6LIMITH_Pos (18UL) /*!< Position of CH6LIMITH field. */
#define SAADC_INTEN_CH6LIMITH_Msk (0x1UL << SAADC_INTEN_CH6LIMITH_Pos) /*!< Bit mask of CH6LIMITH field. */
#define SAADC_INTEN_CH6LIMITH_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CH6LIMITH_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_CH5LIMITL_Pos (17UL) /*!< Position of CH5LIMITL field. */
#define SAADC_INTEN_CH5LIMITL_Msk (0x1UL << SAADC_INTEN_CH5LIMITL_Pos) /*!< Bit mask of CH5LIMITL field. */
#define SAADC_INTEN_CH5LIMITL_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CH5LIMITL_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_CH5LIMITH_Pos (16UL) /*!< Position of CH5LIMITH field. */
#define SAADC_INTEN_CH5LIMITH_Msk (0x1UL << SAADC_INTEN_CH5LIMITH_Pos) /*!< Bit mask of CH5LIMITH field. */
#define SAADC_INTEN_CH5LIMITH_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CH5LIMITH_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_CH4LIMITL_Pos (15UL) /*!< Position of CH4LIMITL field. */
#define SAADC_INTEN_CH4LIMITL_Msk (0x1UL << SAADC_INTEN_CH4LIMITL_Pos) /*!< Bit mask of CH4LIMITL field. */
#define SAADC_INTEN_CH4LIMITL_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CH4LIMITL_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_CH4LIMITH_Pos (14UL) /*!< Position of CH4LIMITH field. */
#define SAADC_INTEN_CH4LIMITH_Msk (0x1UL << SAADC_INTEN_CH4LIMITH_Pos) /*!< Bit mask of CH4LIMITH field. */
#define SAADC_INTEN_CH4LIMITH_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CH4LIMITH_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_CH3LIMITL_Pos (13UL) /*!< Position of CH3LIMITL field. */
#define SAADC_INTEN_CH3LIMITL_Msk (0x1UL << SAADC_INTEN_CH3LIMITL_Pos) /*!< Bit mask of CH3LIMITL field. */
#define SAADC_INTEN_CH3LIMITL_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CH3LIMITL_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_CH3LIMITH_Pos (12UL) /*!< Position of CH3LIMITH field. */
#define SAADC_INTEN_CH3LIMITH_Msk (0x1UL << SAADC_INTEN_CH3LIMITH_Pos) /*!< Bit mask of CH3LIMITH field. */
#define SAADC_INTEN_CH3LIMITH_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CH3LIMITH_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_CH2LIMITL_Pos (11UL) /*!< Position of CH2LIMITL field. */
#define SAADC_INTEN_CH2LIMITL_Msk (0x1UL << SAADC_INTEN_CH2LIMITL_Pos) /*!< Bit mask of CH2LIMITL field. */
#define SAADC_INTEN_CH2LIMITL_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CH2LIMITL_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_CH2LIMITH_Pos (10UL) /*!< Position of CH2LIMITH field. */
#define SAADC_INTEN_CH2LIMITH_Msk (0x1UL << SAADC_INTEN_CH2LIMITH_Pos) /*!< Bit mask of CH2LIMITH field. */
#define SAADC_INTEN_CH2LIMITH_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CH2LIMITH_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_CH1LIMITL_Pos (9UL) /*!< Position of CH1LIMITL field. */
#define SAADC_INTEN_CH1LIMITL_Msk (0x1UL << SAADC_INTEN_CH1LIMITL_Pos) /*!< Bit mask of CH1LIMITL field. */
#define SAADC_INTEN_CH1LIMITL_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CH1LIMITL_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_CH1LIMITH_Pos (8UL) /*!< Position of CH1LIMITH field. */
#define SAADC_INTEN_CH1LIMITH_Msk (0x1UL << SAADC_INTEN_CH1LIMITH_Pos) /*!< Bit mask of CH1LIMITH field. */
#define SAADC_INTEN_CH1LIMITH_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CH1LIMITH_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_CH0LIMITL_Pos (7UL) /*!< Position of CH0LIMITL field. */
#define SAADC_INTEN_CH0LIMITL_Msk (0x1UL << SAADC_INTEN_CH0LIMITL_Pos) /*!< Bit mask of CH0LIMITL field. */
#define SAADC_INTEN_CH0LIMITL_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CH0LIMITL_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_CH0LIMITH_Pos (6UL) /*!< Position of CH0LIMITH field. */
#define SAADC_INTEN_CH0LIMITH_Msk (0x1UL << SAADC_INTEN_CH0LIMITH_Pos) /*!< Bit mask of CH0LIMITH field. */
#define SAADC_INTEN_CH0LIMITH_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CH0LIMITH_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_STOPPED_Pos (5UL) /*!< Position of STOPPED field. */
#define SAADC_INTEN_STOPPED_Msk (0x1UL << SAADC_INTEN_STOPPED_Pos) /*!< Bit mask of STOPPED field. */
#define SAADC_INTEN_STOPPED_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_STOPPED_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_CALIBRATEDONE_Pos (4UL) /*!< Position of CALIBRATEDONE field. */
#define SAADC_INTEN_CALIBRATEDONE_Msk (0x1UL << SAADC_INTEN_CALIBRATEDONE_Pos) /*!< Bit mask of CALIBRATEDONE field. */
#define SAADC_INTEN_CALIBRATEDONE_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_CALIBRATEDONE_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_RESULTDONE_Pos (3UL) /*!< Position of RESULTDONE field. */
#define SAADC_INTEN_RESULTDONE_Msk (0x1UL << SAADC_INTEN_RESULTDONE_Pos) /*!< Bit mask of RESULTDONE field. */
#define SAADC_INTEN_RESULTDONE_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_RESULTDONE_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_DONE_Pos (2UL) /*!< Position of DONE field. */
#define SAADC_INTEN_DONE_Msk (0x1UL << SAADC_INTEN_DONE_Pos) /*!< Bit mask of DONE field. */
#define SAADC_INTEN_DONE_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_DONE_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_END_Pos (1UL) /*!< Position of END field. */
#define SAADC_INTEN_END_Msk (0x1UL << SAADC_INTEN_END_Pos) /*!< Bit mask of END field. */
#define SAADC_INTEN_END_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_END_Enabled (1UL) /*!< Enable */
#define SAADC_INTEN_STARTED_Pos (0UL) /*!< Position of STARTED field. */
#define SAADC_INTEN_STARTED_Msk (0x1UL << SAADC_INTEN_STARTED_Pos) /*!< Bit mask of STARTED field. */
#define SAADC_INTEN_STARTED_Disabled (0UL) /*!< Disable */
#define SAADC_INTEN_STARTED_Enabled (1UL) /*!< Enable */
#define SAADC_INTENSET_CH7LIMITL_Pos (21UL) /*!< Position of CH7LIMITL field. */
#define SAADC_INTENSET_CH7LIMITL_Msk (0x1UL << SAADC_INTENSET_CH7LIMITL_Pos) /*!< Bit mask of CH7LIMITL field. */
#define SAADC_INTENSET_CH7LIMITL_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CH7LIMITL_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CH7LIMITL_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_CH7LIMITH_Pos (20UL) /*!< Position of CH7LIMITH field. */
#define SAADC_INTENSET_CH7LIMITH_Msk (0x1UL << SAADC_INTENSET_CH7LIMITH_Pos) /*!< Bit mask of CH7LIMITH field. */
#define SAADC_INTENSET_CH7LIMITH_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CH7LIMITH_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CH7LIMITH_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_CH6LIMITL_Pos (19UL) /*!< Position of CH6LIMITL field. */
#define SAADC_INTENSET_CH6LIMITL_Msk (0x1UL << SAADC_INTENSET_CH6LIMITL_Pos) /*!< Bit mask of CH6LIMITL field. */
#define SAADC_INTENSET_CH6LIMITL_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CH6LIMITL_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CH6LIMITL_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_CH6LIMITH_Pos (18UL) /*!< Position of CH6LIMITH field. */
#define SAADC_INTENSET_CH6LIMITH_Msk (0x1UL << SAADC_INTENSET_CH6LIMITH_Pos) /*!< Bit mask of CH6LIMITH field. */
#define SAADC_INTENSET_CH6LIMITH_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CH6LIMITH_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CH6LIMITH_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_CH5LIMITL_Pos (17UL) /*!< Position of CH5LIMITL field. */
#define SAADC_INTENSET_CH5LIMITL_Msk (0x1UL << SAADC_INTENSET_CH5LIMITL_Pos) /*!< Bit mask of CH5LIMITL field. */
#define SAADC_INTENSET_CH5LIMITL_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CH5LIMITL_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CH5LIMITL_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_CH5LIMITH_Pos (16UL) /*!< Position of CH5LIMITH field. */
#define SAADC_INTENSET_CH5LIMITH_Msk (0x1UL << SAADC_INTENSET_CH5LIMITH_Pos) /*!< Bit mask of CH5LIMITH field. */
#define SAADC_INTENSET_CH5LIMITH_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CH5LIMITH_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CH5LIMITH_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_CH4LIMITL_Pos (15UL) /*!< Position of CH4LIMITL field. */
#define SAADC_INTENSET_CH4LIMITL_Msk (0x1UL << SAADC_INTENSET_CH4LIMITL_Pos) /*!< Bit mask of CH4LIMITL field. */
#define SAADC_INTENSET_CH4LIMITL_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CH4LIMITL_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CH4LIMITL_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_CH4LIMITH_Pos (14UL) /*!< Position of CH4LIMITH field. */
#define SAADC_INTENSET_CH4LIMITH_Msk (0x1UL << SAADC_INTENSET_CH4LIMITH_Pos) /*!< Bit mask of CH4LIMITH field. */
#define SAADC_INTENSET_CH4LIMITH_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CH4LIMITH_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CH4LIMITH_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_CH3LIMITL_Pos (13UL) /*!< Position of CH3LIMITL field. */
#define SAADC_INTENSET_CH3LIMITL_Msk (0x1UL << SAADC_INTENSET_CH3LIMITL_Pos) /*!< Bit mask of CH3LIMITL field. */
#define SAADC_INTENSET_CH3LIMITL_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CH3LIMITL_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CH3LIMITL_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_CH3LIMITH_Pos (12UL) /*!< Position of CH3LIMITH field. */
#define SAADC_INTENSET_CH3LIMITH_Msk (0x1UL << SAADC_INTENSET_CH3LIMITH_Pos) /*!< Bit mask of CH3LIMITH field. */
#define SAADC_INTENSET_CH3LIMITH_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CH3LIMITH_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CH3LIMITH_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_CH2LIMITL_Pos (11UL) /*!< Position of CH2LIMITL field. */
#define SAADC_INTENSET_CH2LIMITL_Msk (0x1UL << SAADC_INTENSET_CH2LIMITL_Pos) /*!< Bit mask of CH2LIMITL field. */
#define SAADC_INTENSET_CH2LIMITL_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CH2LIMITL_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CH2LIMITL_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_CH2LIMITH_Pos (10UL) /*!< Position of CH2LIMITH field. */
#define SAADC_INTENSET_CH2LIMITH_Msk (0x1UL << SAADC_INTENSET_CH2LIMITH_Pos) /*!< Bit mask of CH2LIMITH field. */
#define SAADC_INTENSET_CH2LIMITH_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CH2LIMITH_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CH2LIMITH_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_CH1LIMITL_Pos (9UL) /*!< Position of CH1LIMITL field. */
#define SAADC_INTENSET_CH1LIMITL_Msk (0x1UL << SAADC_INTENSET_CH1LIMITL_Pos) /*!< Bit mask of CH1LIMITL field. */
#define SAADC_INTENSET_CH1LIMITL_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CH1LIMITL_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CH1LIMITL_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_CH1LIMITH_Pos (8UL) /*!< Position of CH1LIMITH field. */
#define SAADC_INTENSET_CH1LIMITH_Msk (0x1UL << SAADC_INTENSET_CH1LIMITH_Pos) /*!< Bit mask of CH1LIMITH field. */
#define SAADC_INTENSET_CH1LIMITH_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CH1LIMITH_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CH1LIMITH_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_CH0LIMITL_Pos (7UL) /*!< Position of CH0LIMITL field. */
#define SAADC_INTENSET_CH0LIMITL_Msk (0x1UL << SAADC_INTENSET_CH0LIMITL_Pos) /*!< Bit mask of CH0LIMITL field. */
#define SAADC_INTENSET_CH0LIMITL_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CH0LIMITL_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CH0LIMITL_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_CH0LIMITH_Pos (6UL) /*!< Position of CH0LIMITH field. */
#define SAADC_INTENSET_CH0LIMITH_Msk (0x1UL << SAADC_INTENSET_CH0LIMITH_Pos) /*!< Bit mask of CH0LIMITH field. */
#define SAADC_INTENSET_CH0LIMITH_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CH0LIMITH_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CH0LIMITH_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_STOPPED_Pos (5UL) /*!< Position of STOPPED field. */
#define SAADC_INTENSET_STOPPED_Msk (0x1UL << SAADC_INTENSET_STOPPED_Pos) /*!< Bit mask of STOPPED field. */
#define SAADC_INTENSET_STOPPED_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_STOPPED_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_STOPPED_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_CALIBRATEDONE_Pos (4UL) /*!< Position of CALIBRATEDONE field. */
#define SAADC_INTENSET_CALIBRATEDONE_Msk (0x1UL << SAADC_INTENSET_CALIBRATEDONE_Pos) /*!< Bit mask of CALIBRATEDONE field. */
#define SAADC_INTENSET_CALIBRATEDONE_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_CALIBRATEDONE_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_CALIBRATEDONE_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_RESULTDONE_Pos (3UL) /*!< Position of RESULTDONE field. */
#define SAADC_INTENSET_RESULTDONE_Msk (0x1UL << SAADC_INTENSET_RESULTDONE_Pos) /*!< Bit mask of RESULTDONE field. */
#define SAADC_INTENSET_RESULTDONE_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_RESULTDONE_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_RESULTDONE_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_DONE_Pos (2UL) /*!< Position of DONE field. */
#define SAADC_INTENSET_DONE_Msk (0x1UL << SAADC_INTENSET_DONE_Pos) /*!< Bit mask of DONE field. */
#define SAADC_INTENSET_DONE_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_DONE_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_DONE_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_END_Pos (1UL) /*!< Position of END field. */
#define SAADC_INTENSET_END_Msk (0x1UL << SAADC_INTENSET_END_Pos) /*!< Bit mask of END field. */
#define SAADC_INTENSET_END_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_END_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_END_Set (1UL) /*!< Enable */
#define SAADC_INTENSET_STARTED_Pos (0UL) /*!< Position of STARTED field. */
#define SAADC_INTENSET_STARTED_Msk (0x1UL << SAADC_INTENSET_STARTED_Pos) /*!< Bit mask of STARTED field. */
#define SAADC_INTENSET_STARTED_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENSET_STARTED_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENSET_STARTED_Set (1UL) /*!< Enable */
#define SAADC_INTENCLR_CH7LIMITL_Pos (21UL) /*!< Position of CH7LIMITL field. */
#define SAADC_INTENCLR_CH7LIMITL_Msk (0x1UL << SAADC_INTENCLR_CH7LIMITL_Pos) /*!< Bit mask of CH7LIMITL field. */
#define SAADC_INTENCLR_CH7LIMITL_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CH7LIMITL_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CH7LIMITL_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_CH7LIMITH_Pos (20UL) /*!< Position of CH7LIMITH field. */
#define SAADC_INTENCLR_CH7LIMITH_Msk (0x1UL << SAADC_INTENCLR_CH7LIMITH_Pos) /*!< Bit mask of CH7LIMITH field. */
#define SAADC_INTENCLR_CH7LIMITH_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CH7LIMITH_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CH7LIMITH_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_CH6LIMITL_Pos (19UL) /*!< Position of CH6LIMITL field. */
#define SAADC_INTENCLR_CH6LIMITL_Msk (0x1UL << SAADC_INTENCLR_CH6LIMITL_Pos) /*!< Bit mask of CH6LIMITL field. */
#define SAADC_INTENCLR_CH6LIMITL_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CH6LIMITL_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CH6LIMITL_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_CH6LIMITH_Pos (18UL) /*!< Position of CH6LIMITH field. */
#define SAADC_INTENCLR_CH6LIMITH_Msk (0x1UL << SAADC_INTENCLR_CH6LIMITH_Pos) /*!< Bit mask of CH6LIMITH field. */
#define SAADC_INTENCLR_CH6LIMITH_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CH6LIMITH_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CH6LIMITH_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_CH5LIMITL_Pos (17UL) /*!< Position of CH5LIMITL field. */
#define SAADC_INTENCLR_CH5LIMITL_Msk (0x1UL << SAADC_INTENCLR_CH5LIMITL_Pos) /*!< Bit mask of CH5LIMITL field. */
#define SAADC_INTENCLR_CH5LIMITL_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CH5LIMITL_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CH5LIMITL_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_CH5LIMITH_Pos (16UL) /*!< Position of CH5LIMITH field. */
#define SAADC_INTENCLR_CH5LIMITH_Msk (0x1UL << SAADC_INTENCLR_CH5LIMITH_Pos) /*!< Bit mask of CH5LIMITH field. */
#define SAADC_INTENCLR_CH5LIMITH_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CH5LIMITH_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CH5LIMITH_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_CH4LIMITL_Pos (15UL) /*!< Position of CH4LIMITL field. */
#define SAADC_INTENCLR_CH4LIMITL_Msk (0x1UL << SAADC_INTENCLR_CH4LIMITL_Pos) /*!< Bit mask of CH4LIMITL field. */
#define SAADC_INTENCLR_CH4LIMITL_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CH4LIMITL_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CH4LIMITL_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_CH4LIMITH_Pos (14UL) /*!< Position of CH4LIMITH field. */
#define SAADC_INTENCLR_CH4LIMITH_Msk (0x1UL << SAADC_INTENCLR_CH4LIMITH_Pos) /*!< Bit mask of CH4LIMITH field. */
#define SAADC_INTENCLR_CH4LIMITH_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CH4LIMITH_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CH4LIMITH_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_CH3LIMITL_Pos (13UL) /*!< Position of CH3LIMITL field. */
#define SAADC_INTENCLR_CH3LIMITL_Msk (0x1UL << SAADC_INTENCLR_CH3LIMITL_Pos) /*!< Bit mask of CH3LIMITL field. */
#define SAADC_INTENCLR_CH3LIMITL_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CH3LIMITL_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CH3LIMITL_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_CH3LIMITH_Pos (12UL) /*!< Position of CH3LIMITH field. */
#define SAADC_INTENCLR_CH3LIMITH_Msk (0x1UL << SAADC_INTENCLR_CH3LIMITH_Pos) /*!< Bit mask of CH3LIMITH field. */
#define SAADC_INTENCLR_CH3LIMITH_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CH3LIMITH_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CH3LIMITH_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_CH2LIMITL_Pos (11UL) /*!< Position of CH2LIMITL field. */
#define SAADC_INTENCLR_CH2LIMITL_Msk (0x1UL << SAADC_INTENCLR_CH2LIMITL_Pos) /*!< Bit mask of CH2LIMITL field. */
#define SAADC_INTENCLR_CH2LIMITL_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CH2LIMITL_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CH2LIMITL_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_CH2LIMITH_Pos (10UL) /*!< Position of CH2LIMITH field. */
#define SAADC_INTENCLR_CH2LIMITH_Msk (0x1UL << SAADC_INTENCLR_CH2LIMITH_Pos) /*!< Bit mask of CH2LIMITH field. */
#define SAADC_INTENCLR_CH2LIMITH_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CH2LIMITH_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CH2LIMITH_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_CH1LIMITL_Pos (9UL) /*!< Position of CH1LIMITL field. */
#define SAADC_INTENCLR_CH1LIMITL_Msk (0x1UL << SAADC_INTENCLR_CH1LIMITL_Pos) /*!< Bit mask of CH1LIMITL field. */
#define SAADC_INTENCLR_CH1LIMITL_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CH1LIMITL_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CH1LIMITL_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_CH1LIMITH_Pos (8UL) /*!< Position of CH1LIMITH field. */
#define SAADC_INTENCLR_CH1LIMITH_Msk (0x1UL << SAADC_INTENCLR_CH1LIMITH_Pos) /*!< Bit mask of CH1LIMITH field. */
#define SAADC_INTENCLR_CH1LIMITH_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CH1LIMITH_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CH1LIMITH_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_CH0LIMITL_Pos (7UL) /*!< Position of CH0LIMITL field. */
#define SAADC_INTENCLR_CH0LIMITL_Msk (0x1UL << SAADC_INTENCLR_CH0LIMITL_Pos) /*!< Bit mask of CH0LIMITL field. */
#define SAADC_INTENCLR_CH0LIMITL_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CH0LIMITL_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CH0LIMITL_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_CH0LIMITH_Pos (6UL) /*!< Position of CH0LIMITH field. */
#define SAADC_INTENCLR_CH0LIMITH_Msk (0x1UL << SAADC_INTENCLR_CH0LIMITH_Pos) /*!< Bit mask of CH0LIMITH field. */
#define SAADC_INTENCLR_CH0LIMITH_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CH0LIMITH_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CH0LIMITH_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_STOPPED_Pos (5UL) /*!< Position of STOPPED field. */
#define SAADC_INTENCLR_STOPPED_Msk (0x1UL << SAADC_INTENCLR_STOPPED_Pos) /*!< Bit mask of STOPPED field. */
#define SAADC_INTENCLR_STOPPED_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_STOPPED_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_STOPPED_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_CALIBRATEDONE_Pos (4UL) /*!< Position of CALIBRATEDONE field. */
#define SAADC_INTENCLR_CALIBRATEDONE_Msk (0x1UL << SAADC_INTENCLR_CALIBRATEDONE_Pos) /*!< Bit mask of CALIBRATEDONE field. */
#define SAADC_INTENCLR_CALIBRATEDONE_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_CALIBRATEDONE_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_CALIBRATEDONE_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_RESULTDONE_Pos (3UL) /*!< Position of RESULTDONE field. */
#define SAADC_INTENCLR_RESULTDONE_Msk (0x1UL << SAADC_INTENCLR_RESULTDONE_Pos) /*!< Bit mask of RESULTDONE field. */
#define SAADC_INTENCLR_RESULTDONE_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_RESULTDONE_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_RESULTDONE_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_DONE_Pos (2UL) /*!< Position of DONE field. */
#define SAADC_INTENCLR_DONE_Msk (0x1UL << SAADC_INTENCLR_DONE_Pos) /*!< Bit mask of DONE field. */
#define SAADC_INTENCLR_DONE_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_DONE_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_DONE_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_END_Pos (1UL) /*!< Position of END field. */
#define SAADC_INTENCLR_END_Msk (0x1UL << SAADC_INTENCLR_END_Pos) /*!< Bit mask of END field. */
#define SAADC_INTENCLR_END_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_END_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_END_Clear (1UL) /*!< Disable */
#define SAADC_INTENCLR_STARTED_Pos (0UL) /*!< Position of STARTED field. */
#define SAADC_INTENCLR_STARTED_Msk (0x1UL << SAADC_INTENCLR_STARTED_Pos) /*!< Bit mask of STARTED field. */
#define SAADC_INTENCLR_STARTED_Disabled (0UL) /*!< Read: Disabled */
#define SAADC_INTENCLR_STARTED_Enabled (1UL) /*!< Read: Enabled */
#define SAADC_INTENCLR_STARTED_Clear (1UL) /*!< Disable */
#define SAADC_STATUS_STATUS_Pos (0UL) /*!< Position of STATUS field. */
#define SAADC_STATUS_STATUS_Msk (0x1UL << SAADC_STATUS_STATUS_Pos) /*!< Bit mask of STATUS field. */
#define SAADC_STATUS_STATUS_Ready (0UL) /*!< SAADC is ready. No on-going conversions. */
#define SAADC_STATUS_STATUS_Busy (1UL) /*!< SAADC is busy. Conversion in progress. */
#define SAADC_ENABLE_ENABLE_Pos (0UL) /*!< Position of ENABLE field. */
#define SAADC_ENABLE_ENABLE_Msk (0x1UL << SAADC_ENABLE_ENABLE_Pos) /*!< Bit mask of ENABLE field. */
#define SAADC_ENABLE_ENABLE_Disabled (0UL) /*!< Disable SAADC */
#define SAADC_ENABLE_ENABLE_Enabled (1UL) /*!< Enable SAADC */
#define SAADC_CH_PSELP_PSELP_Pos (0UL) /*!< Position of PSELP field. */
#define SAADC_CH_PSELP_PSELP_Msk (0x1FUL << SAADC_CH_PSELP_PSELP_Pos) /*!< Bit mask of PSELP field. */
#define SAADC_CH_PSELP_PSELP_NC (0UL) /*!< Not connected */
#define SAADC_CH_PSELP_PSELP_AnalogInput0 (1UL) /*!< AIN0 */
#define SAADC_CH_PSELP_PSELP_AnalogInput1 (2UL) /*!< AIN1 */
#define SAADC_CH_PSELP_PSELP_AnalogInput2 (3UL) /*!< AIN2 */
#define SAADC_CH_PSELP_PSELP_AnalogInput3 (4UL) /*!< AIN3 */
#define SAADC_CH_PSELP_PSELP_AnalogInput4 (5UL) /*!< AIN4 */
#define SAADC_CH_PSELP_PSELP_AnalogInput5 (6UL) /*!< AIN5 */
#define SAADC_CH_PSELP_PSELP_AnalogInput6 (7UL) /*!< AIN6 */
#define SAADC_CH_PSELP_PSELP_AnalogInput7 (8UL) /*!< AIN7 */
#define SAADC_CH_PSELP_PSELP_VDD (9UL) /*!< VDD */
#define SAADC_CH_PSELP_PSELP_VDDHDIV5 (0x0DUL) /*!< VDDH/5 */
#define SAADC_CH_PSELN_PSELN_Pos (0UL) /*!< Position of PSELN field. */
#define SAADC_CH_PSELN_PSELN_Msk (0x1FUL << SAADC_CH_PSELN_PSELN_Pos) /*!< Bit mask of PSELN field. */
#define SAADC_CH_PSELN_PSELN_NC (0UL) /*!< Not connected */
#define SAADC_CH_PSELN_PSELN_AnalogInput0 (1UL) /*!< AIN0 */
#define SAADC_CH_PSELN_PSELN_AnalogInput1 (2UL) /*!< AIN1 */
#define SAADC_CH_PSELN_PSELN_AnalogInput2 (3UL) /*!< AIN2 */
#define SAADC_CH_PSELN_PSELN_AnalogInput3 (4UL) /*!< AIN3 */
#define SAADC_CH_PSELN_PSELN_AnalogInput4 (5UL) /*!< AIN4 */
#define SAADC_CH_PSELN_PSELN_AnalogInput5 (6UL) /*!< AIN5 */
#define SAADC_CH_PSELN_PSELN_AnalogInput6 (7UL) /*!< AIN6 */
#define SAADC_CH_PSELN_PSELN_AnalogInput7 (8UL) /*!< AIN7 */
#define SAADC_CH_PSELN_PSELN_VDD (9UL) /*!< VDD */
#define SAADC_CH_PSELN_PSELN_VDDHDIV5 (0x0DUL) /*!< VDDH/5 */
#define SAADC_CH_CONFIG_BURST_Pos (24UL) /*!< Position of BURST field. */
#define SAADC_CH_CONFIG_BURST_Msk (0x1UL << SAADC_CH_CONFIG_BURST_Pos) /*!< Bit mask of BURST field. */
#define SAADC_CH_CONFIG_BURST_Disabled (0UL) /*!< Burst mode is disabled (normal operation) */
#define SAADC_CH_CONFIG_BURST_Enabled (1UL) /*!< Burst mode is enabled. SAADC takes 2^OVERSAMPLE number of samples as fast as it can, and sends the average to Data RAM. */
#define SAADC_CH_CONFIG_MODE_Pos (20UL) /*!< Position of MODE field. */
#define SAADC_CH_CONFIG_MODE_Msk (0x1UL << SAADC_CH_CONFIG_MODE_Pos) /*!< Bit mask of MODE field. */
#define SAADC_CH_CONFIG_MODE_SE (0UL) /*!< Single-ended, PSELN will be ignored, negative input to SAADC shorted to GND */
#define SAADC_CH_CONFIG_MODE_Diff (1UL) /*!< Differential */
#define SAADC_CH_CONFIG_TACQ_Pos (16UL) /*!< Position of TACQ field. */
#define SAADC_CH_CONFIG_TACQ_Msk (0x7UL << SAADC_CH_CONFIG_TACQ_Pos) /*!< Bit mask of TACQ field. */
#define SAADC_CH_CONFIG_TACQ_3us (0UL) /*!< 3 us */
#define SAADC_CH_CONFIG_TACQ_5us (1UL) /*!< 5 us */
#define SAADC_CH_CONFIG_TACQ_10us (2UL) /*!< 10 us */
#define SAADC_CH_CONFIG_TACQ_15us (3UL) /*!< 15 us */
#define SAADC_CH_CONFIG_TACQ_20us (4UL) /*!< 20 us */
#define SAADC_CH_CONFIG_TACQ_40us (5UL) /*!< 40 us */
#define SAADC_CH_CONFIG_REFSEL_Pos (12UL) /*!< Position of REFSEL field. */
#define SAADC_CH_CONFIG_REFSEL_Msk (0x1UL << SAADC_CH_CONFIG_REFSEL_Pos) /*!< Bit mask of REFSEL field. */
#define SAADC_CH_CONFIG_REFSEL_Internal (0UL) /*!< Internal reference (0.6 V) */
#define SAADC_CH_CONFIG_REFSEL_VDD1_4 (1UL) /*!< VDD/4 as reference */
#define SAADC_CH_CONFIG_GAIN_Pos (8UL) /*!< Position of GAIN field. */
#define SAADC_CH_CONFIG_GAIN_Msk (0x7UL << SAADC_CH_CONFIG_GAIN_Pos) /*!< Bit mask of GAIN field. */
#define SAADC_CH_CONFIG_GAIN_Gain1_6 (0UL) /*!< 1/6 */
#define SAADC_CH_CONFIG_GAIN_Gain1_5 (1UL) /*!< 1/5 */
#define SAADC_CH_CONFIG_GAIN_Gain1_4 (2UL) /*!< 1/4 */
#define SAADC_CH_CONFIG_GAIN_Gain1_3 (3UL) /*!< 1/3 */
#define SAADC_CH_CONFIG_GAIN_Gain1_2 (4UL) /*!< 1/2 */
#define SAADC_CH_CONFIG_GAIN_Gain1 (5UL) /*!< 1 */
#define SAADC_CH_CONFIG_GAIN_Gain2 (6UL) /*!< 2 */
#define SAADC_CH_CONFIG_GAIN_Gain4 (7UL) /*!< 4 */
#define SAADC_CH_CONFIG_RESN_Pos (4UL) /*!< Position of RESN field. */
#define SAADC_CH_CONFIG_RESN_Msk (0x3UL << SAADC_CH_CONFIG_RESN_Pos) /*!< Bit mask of RESN field. */
#define SAADC_CH_CONFIG_RESN_Bypass (0UL) /*!< Bypass resistor ladder */
#define SAADC_CH_CONFIG_RESN_Pulldown (1UL) /*!< Pull-down to GND */
#define SAADC_CH_CONFIG_RESN_Pullup (2UL) /*!< Pull-up to VDD */
#define SAADC_CH_CONFIG_RESN_VDD1_2 (3UL) /*!< Set input at VDD/2 */
#define SAADC_CH_CONFIG_RESP_Pos (0UL) /*!< Position of RESP field. */
#define SAADC_CH_CONFIG_RESP_Msk (0x3UL << SAADC_CH_CONFIG_RESP_Pos) /*!< Bit mask of RESP field. */
#define SAADC_CH_CONFIG_RESP_Bypass (0UL) /*!< Bypass resistor ladder */
#define SAADC_CH_CONFIG_RESP_Pulldown (1UL) /*!< Pull-down to GND */
#define SAADC_CH_CONFIG_RESP_Pullup (2UL) /*!< Pull-up to VDD */
#define SAADC_CH_CONFIG_RESP_VDD1_2 (3UL) /*!< Set input at VDD/2 */
#define SAADC_CH_LIMIT_HIGH_Pos (16UL) /*!< Position of HIGH field. */
#define SAADC_CH_LIMIT_HIGH_Msk (0xFFFFUL << SAADC_CH_LIMIT_HIGH_Pos) /*!< Bit mask of HIGH field. */
#define SAADC_CH_LIMIT_LOW_Pos (0UL) /*!< Position of LOW field. */
#define SAADC_CH_LIMIT_LOW_Msk (0xFFFFUL << SAADC_CH_LIMIT_LOW_Pos) /*!< Bit mask of LOW field. */
#define SAADC_RESOLUTION_VAL_Pos (0UL) /*!< Position of VAL field. */
#define SAADC_RESOLUTION_VAL_Msk (0x7UL << SAADC_RESOLUTION_VAL_Pos) /*!< Bit mask of VAL field. */
#define SAADC_RESOLUTION_VAL_8bit (0UL) /*!< 8 bits */
#define SAADC_RESOLUTION_VAL_10bit (1UL) /*!< 10 bits */
#define SAADC_RESOLUTION_VAL_12bit (2UL) /*!< 12 bits */
#define SAADC_RESOLUTION_VAL_14bit (3UL) /*!< 14 bits */
#define SAADC_OVERSAMPLE_OVERSAMPLE_Pos (0UL) /*!< Position of OVERSAMPLE field. */
#define SAADC_OVERSAMPLE_OVERSAMPLE_Msk (0xFUL << SAADC_OVERSAMPLE_OVERSAMPLE_Pos) /*!< Bit mask of OVERSAMPLE field. */
#define SAADC_OVERSAMPLE_OVERSAMPLE_Bypass (0UL) /*!< Bypass oversampling */
#define SAADC_OVERSAMPLE_OVERSAMPLE_Over2x (1UL) /*!< Oversample 2x */
#define SAADC_OVERSAMPLE_OVERSAMPLE_Over4x (2UL) /*!< Oversample 4x */
#define SAADC_OVERSAMPLE_OVERSAMPLE_Over8x (3UL) /*!< Oversample 8x */
#define SAADC_OVERSAMPLE_OVERSAMPLE_Over16x (4UL) /*!< Oversample 16x */
#define SAADC_OVERSAMPLE_OVERSAMPLE_Over32x (5UL) /*!< Oversample 32x */
#define SAADC_OVERSAMPLE_OVERSAMPLE_Over64x (6UL) /*!< Oversample 64x */
#define SAADC_OVERSAMPLE_OVERSAMPLE_Over128x (7UL) /*!< Oversample 128x */
#define SAADC_OVERSAMPLE_OVERSAMPLE_Over256x (8UL) /*!< Oversample 256x */
#define SAADC_SAMPLERATE_MODE_Pos (12UL) /*!< Position of MODE field. */
#define SAADC_SAMPLERATE_MODE_Msk (0x1UL << SAADC_SAMPLERATE_MODE_Pos) /*!< Bit mask of MODE field. */
#define SAADC_SAMPLERATE_MODE_Task (0UL) /*!< Rate is controlled from SAMPLE task */
#define SAADC_SAMPLERATE_MODE_Timers (1UL) /*!< Rate is controlled from local timer (use CC to control the rate) */
#define SAADC_SAMPLERATE_CC_Pos (0UL) /*!< Position of CC field. */
#define SAADC_SAMPLERATE_CC_Msk (0x7FFUL << SAADC_SAMPLERATE_CC_Pos) /*!< Bit mask of CC field. */
#define SAADC_RESULT_PTR_PTR_Pos (0UL) /*!< Position of PTR field. */
#define SAADC_RESULT_PTR_PTR_Msk (0xFFFFFFFFUL << SAADC_RESULT_PTR_PTR_Pos) /*!< Bit mask of PTR field. */
#define SAADC_RESULT_MAXCNT_MAXCNT_Pos (0UL) /*!< Position of MAXCNT field. */
#define SAADC_RESULT_MAXCNT_MAXCNT_Msk (0x7FFFUL << SAADC_RESULT_MAXCNT_MAXCNT_Pos) /*!< Bit mask of MAXCNT field. */
#define SAADC_RESULT_AMOUNT_AMOUNT_Pos (0UL) /*!< Position of AMOUNT field. */
#define SAADC_RESULT_AMOUNT_AMOUNT_Msk (0x7FFFUL << SAADC_RESULT_AMOUNT_AMOUNT_Pos) /*!< Bit mask of AMOUNT field. */
#define SPI_EVENTS_READY_EVENTS_READY_Pos (0UL) /*!< Position of EVENTS_READY field. */
#define SPI_EVENTS_READY_EVENTS_READY_Msk (0x1UL << SPI_EVENTS_READY_EVENTS_READY_Pos) /*!< Bit mask of EVENTS_READY field. */
#define SPI_EVENTS_READY_EVENTS_READY_NotGenerated (0UL) /*!< Event not generated */
#define SPI_EVENTS_READY_EVENTS_READY_Generated (1UL) /*!< Event generated */
#define SPI_INTENSET_READY_Pos (2UL) /*!< Position of READY field. */
#define SPI_INTENSET_READY_Msk (0x1UL << SPI_INTENSET_READY_Pos) /*!< Bit mask of READY field. */
#define SPI_INTENSET_READY_Disabled (0UL) /*!< Read: Disabled */
#define SPI_INTENSET_READY_Enabled (1UL) /*!< Read: Enabled */
#define SPI_INTENSET_READY_Set (1UL) /*!< Enable */
#define SPI_INTENCLR_READY_Pos (2UL) /*!< Position of READY field. */
#define SPI_INTENCLR_READY_Msk (0x1UL << SPI_INTENCLR_READY_Pos) /*!< Bit mask of READY field. */
#define SPI_INTENCLR_READY_Disabled (0UL) /*!< Read: Disabled */
#define SPI_INTENCLR_READY_Enabled (1UL) /*!< Read: Enabled */
#define SPI_INTENCLR_READY_Clear (1UL) /*!< Disable */
#define SPI_ENABLE_ENABLE_Pos (0UL) /*!< Position of ENABLE field. */
#define SPI_ENABLE_ENABLE_Msk (0xFUL << SPI_ENABLE_ENABLE_Pos) /*!< Bit mask of ENABLE field. */
#define SPI_ENABLE_ENABLE_Disabled (0UL) /*!< Disable SPI */
#define SPI_ENABLE_ENABLE_Enabled (1UL) /*!< Enable SPI */
#define SPI_PSEL_SCK_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define SPI_PSEL_SCK_CONNECT_Msk (0x1UL << SPI_PSEL_SCK_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define SPI_PSEL_SCK_CONNECT_Connected (0UL) /*!< Connect */
#define SPI_PSEL_SCK_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define SPI_PSEL_SCK_PORT_Pos (5UL) /*!< Position of PORT field. */
#define SPI_PSEL_SCK_PORT_Msk (0x1UL << SPI_PSEL_SCK_PORT_Pos) /*!< Bit mask of PORT field. */
#define SPI_PSEL_SCK_PIN_Pos (0UL) /*!< Position of PIN field. */
#define SPI_PSEL_SCK_PIN_Msk (0x1FUL << SPI_PSEL_SCK_PIN_Pos) /*!< Bit mask of PIN field. */
#define SPI_PSEL_MOSI_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define SPI_PSEL_MOSI_CONNECT_Msk (0x1UL << SPI_PSEL_MOSI_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define SPI_PSEL_MOSI_CONNECT_Connected (0UL) /*!< Connect */
#define SPI_PSEL_MOSI_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define SPI_PSEL_MOSI_PORT_Pos (5UL) /*!< Position of PORT field. */
#define SPI_PSEL_MOSI_PORT_Msk (0x1UL << SPI_PSEL_MOSI_PORT_Pos) /*!< Bit mask of PORT field. */
#define SPI_PSEL_MOSI_PIN_Pos (0UL) /*!< Position of PIN field. */
#define SPI_PSEL_MOSI_PIN_Msk (0x1FUL << SPI_PSEL_MOSI_PIN_Pos) /*!< Bit mask of PIN field. */
#define SPI_PSEL_MISO_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define SPI_PSEL_MISO_CONNECT_Msk (0x1UL << SPI_PSEL_MISO_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define SPI_PSEL_MISO_CONNECT_Connected (0UL) /*!< Connect */
#define SPI_PSEL_MISO_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define SPI_PSEL_MISO_PORT_Pos (5UL) /*!< Position of PORT field. */
#define SPI_PSEL_MISO_PORT_Msk (0x1UL << SPI_PSEL_MISO_PORT_Pos) /*!< Bit mask of PORT field. */
#define SPI_PSEL_MISO_PIN_Pos (0UL) /*!< Position of PIN field. */
#define SPI_PSEL_MISO_PIN_Msk (0x1FUL << SPI_PSEL_MISO_PIN_Pos) /*!< Bit mask of PIN field. */
#define SPI_RXD_RXD_Pos (0UL) /*!< Position of RXD field. */
#define SPI_RXD_RXD_Msk (0xFFUL << SPI_RXD_RXD_Pos) /*!< Bit mask of RXD field. */
#define SPI_TXD_TXD_Pos (0UL) /*!< Position of TXD field. */
#define SPI_TXD_TXD_Msk (0xFFUL << SPI_TXD_TXD_Pos) /*!< Bit mask of TXD field. */
#define SPI_FREQUENCY_FREQUENCY_Pos (0UL) /*!< Position of FREQUENCY field. */
#define SPI_FREQUENCY_FREQUENCY_Msk (0xFFFFFFFFUL << SPI_FREQUENCY_FREQUENCY_Pos) /*!< Bit mask of FREQUENCY field. */
#define SPI_FREQUENCY_FREQUENCY_K125 (0x02000000UL) /*!< 125 kbps */
#define SPI_FREQUENCY_FREQUENCY_K250 (0x04000000UL) /*!< 250 kbps */
#define SPI_FREQUENCY_FREQUENCY_K500 (0x08000000UL) /*!< 500 kbps */
#define SPI_FREQUENCY_FREQUENCY_M1 (0x10000000UL) /*!< 1 Mbps */
#define SPI_FREQUENCY_FREQUENCY_M2 (0x20000000UL) /*!< 2 Mbps */
#define SPI_FREQUENCY_FREQUENCY_M4 (0x40000000UL) /*!< 4 Mbps */
#define SPI_FREQUENCY_FREQUENCY_M8 (0x80000000UL) /*!< 8 Mbps */
#define SPI_CONFIG_CPOL_Pos (2UL) /*!< Position of CPOL field. */
#define SPI_CONFIG_CPOL_Msk (0x1UL << SPI_CONFIG_CPOL_Pos) /*!< Bit mask of CPOL field. */
#define SPI_CONFIG_CPOL_ActiveHigh (0UL) /*!< Active high */
#define SPI_CONFIG_CPOL_ActiveLow (1UL) /*!< Active low */
#define SPI_CONFIG_CPHA_Pos (1UL) /*!< Position of CPHA field. */
#define SPI_CONFIG_CPHA_Msk (0x1UL << SPI_CONFIG_CPHA_Pos) /*!< Bit mask of CPHA field. */
#define SPI_CONFIG_CPHA_Leading (0UL) /*!< Sample on leading edge of clock, shift serial data on trailing edge */
#define SPI_CONFIG_CPHA_Trailing (1UL) /*!< Sample on trailing edge of clock, shift serial data on leading edge */
#define SPI_CONFIG_ORDER_Pos (0UL) /*!< Position of ORDER field. */
#define SPI_CONFIG_ORDER_Msk (0x1UL << SPI_CONFIG_ORDER_Pos) /*!< Bit mask of ORDER field. */
#define SPI_CONFIG_ORDER_MsbFirst (0UL) /*!< Most significant bit shifted out first */
#define SPI_CONFIG_ORDER_LsbFirst (1UL) /*!< Least significant bit shifted out first */
#define SPIM_TASKS_START_TASKS_START_Pos (0UL) /*!< Position of TASKS_START field. */
#define SPIM_TASKS_START_TASKS_START_Msk (0x1UL << SPIM_TASKS_START_TASKS_START_Pos) /*!< Bit mask of TASKS_START field. */
#define SPIM_TASKS_START_TASKS_START_Trigger (1UL) /*!< Trigger task */
#define SPIM_TASKS_STOP_TASKS_STOP_Pos (0UL) /*!< Position of TASKS_STOP field. */
#define SPIM_TASKS_STOP_TASKS_STOP_Msk (0x1UL << SPIM_TASKS_STOP_TASKS_STOP_Pos) /*!< Bit mask of TASKS_STOP field. */
#define SPIM_TASKS_STOP_TASKS_STOP_Trigger (1UL) /*!< Trigger task */
#define SPIM_TASKS_SUSPEND_TASKS_SUSPEND_Pos (0UL) /*!< Position of TASKS_SUSPEND field. */
#define SPIM_TASKS_SUSPEND_TASKS_SUSPEND_Msk (0x1UL << SPIM_TASKS_SUSPEND_TASKS_SUSPEND_Pos) /*!< Bit mask of TASKS_SUSPEND field. */
#define SPIM_TASKS_SUSPEND_TASKS_SUSPEND_Trigger (1UL) /*!< Trigger task */
#define SPIM_TASKS_RESUME_TASKS_RESUME_Pos (0UL) /*!< Position of TASKS_RESUME field. */
#define SPIM_TASKS_RESUME_TASKS_RESUME_Msk (0x1UL << SPIM_TASKS_RESUME_TASKS_RESUME_Pos) /*!< Bit mask of TASKS_RESUME field. */
#define SPIM_TASKS_RESUME_TASKS_RESUME_Trigger (1UL) /*!< Trigger task */
#define SPIM_EVENTS_STOPPED_EVENTS_STOPPED_Pos (0UL) /*!< Position of EVENTS_STOPPED field. */
#define SPIM_EVENTS_STOPPED_EVENTS_STOPPED_Msk (0x1UL << SPIM_EVENTS_STOPPED_EVENTS_STOPPED_Pos) /*!< Bit mask of EVENTS_STOPPED field. */
#define SPIM_EVENTS_STOPPED_EVENTS_STOPPED_NotGenerated (0UL) /*!< Event not generated */
#define SPIM_EVENTS_STOPPED_EVENTS_STOPPED_Generated (1UL) /*!< Event generated */
#define SPIM_EVENTS_ENDRX_EVENTS_ENDRX_Pos (0UL) /*!< Position of EVENTS_ENDRX field. */
#define SPIM_EVENTS_ENDRX_EVENTS_ENDRX_Msk (0x1UL << SPIM_EVENTS_ENDRX_EVENTS_ENDRX_Pos) /*!< Bit mask of EVENTS_ENDRX field. */
#define SPIM_EVENTS_ENDRX_EVENTS_ENDRX_NotGenerated (0UL) /*!< Event not generated */
#define SPIM_EVENTS_ENDRX_EVENTS_ENDRX_Generated (1UL) /*!< Event generated */
#define SPIM_EVENTS_END_EVENTS_END_Pos (0UL) /*!< Position of EVENTS_END field. */
#define SPIM_EVENTS_END_EVENTS_END_Msk (0x1UL << SPIM_EVENTS_END_EVENTS_END_Pos) /*!< Bit mask of EVENTS_END field. */
#define SPIM_EVENTS_END_EVENTS_END_NotGenerated (0UL) /*!< Event not generated */
#define SPIM_EVENTS_END_EVENTS_END_Generated (1UL) /*!< Event generated */
#define SPIM_EVENTS_ENDTX_EVENTS_ENDTX_Pos (0UL) /*!< Position of EVENTS_ENDTX field. */
#define SPIM_EVENTS_ENDTX_EVENTS_ENDTX_Msk (0x1UL << SPIM_EVENTS_ENDTX_EVENTS_ENDTX_Pos) /*!< Bit mask of EVENTS_ENDTX field. */
#define SPIM_EVENTS_ENDTX_EVENTS_ENDTX_NotGenerated (0UL) /*!< Event not generated */
#define SPIM_EVENTS_ENDTX_EVENTS_ENDTX_Generated (1UL) /*!< Event generated */
#define SPIM_EVENTS_STARTED_EVENTS_STARTED_Pos (0UL) /*!< Position of EVENTS_STARTED field. */
#define SPIM_EVENTS_STARTED_EVENTS_STARTED_Msk (0x1UL << SPIM_EVENTS_STARTED_EVENTS_STARTED_Pos) /*!< Bit mask of EVENTS_STARTED field. */
#define SPIM_EVENTS_STARTED_EVENTS_STARTED_NotGenerated (0UL) /*!< Event not generated */
#define SPIM_EVENTS_STARTED_EVENTS_STARTED_Generated (1UL) /*!< Event generated */
#define SPIM_SHORTS_END_START_Pos (17UL) /*!< Position of END_START field. */
#define SPIM_SHORTS_END_START_Msk (0x1UL << SPIM_SHORTS_END_START_Pos) /*!< Bit mask of END_START field. */
#define SPIM_SHORTS_END_START_Disabled (0UL) /*!< Disable shortcut */
#define SPIM_SHORTS_END_START_Enabled (1UL) /*!< Enable shortcut */
#define SPIM_INTENSET_STARTED_Pos (19UL) /*!< Position of STARTED field. */
#define SPIM_INTENSET_STARTED_Msk (0x1UL << SPIM_INTENSET_STARTED_Pos) /*!< Bit mask of STARTED field. */
#define SPIM_INTENSET_STARTED_Disabled (0UL) /*!< Read: Disabled */
#define SPIM_INTENSET_STARTED_Enabled (1UL) /*!< Read: Enabled */
#define SPIM_INTENSET_STARTED_Set (1UL) /*!< Enable */
#define SPIM_INTENSET_ENDTX_Pos (8UL) /*!< Position of ENDTX field. */
#define SPIM_INTENSET_ENDTX_Msk (0x1UL << SPIM_INTENSET_ENDTX_Pos) /*!< Bit mask of ENDTX field. */
#define SPIM_INTENSET_ENDTX_Disabled (0UL) /*!< Read: Disabled */
#define SPIM_INTENSET_ENDTX_Enabled (1UL) /*!< Read: Enabled */
#define SPIM_INTENSET_ENDTX_Set (1UL) /*!< Enable */
#define SPIM_INTENSET_END_Pos (6UL) /*!< Position of END field. */
#define SPIM_INTENSET_END_Msk (0x1UL << SPIM_INTENSET_END_Pos) /*!< Bit mask of END field. */
#define SPIM_INTENSET_END_Disabled (0UL) /*!< Read: Disabled */
#define SPIM_INTENSET_END_Enabled (1UL) /*!< Read: Enabled */
#define SPIM_INTENSET_END_Set (1UL) /*!< Enable */
#define SPIM_INTENSET_ENDRX_Pos (4UL) /*!< Position of ENDRX field. */
#define SPIM_INTENSET_ENDRX_Msk (0x1UL << SPIM_INTENSET_ENDRX_Pos) /*!< Bit mask of ENDRX field. */
#define SPIM_INTENSET_ENDRX_Disabled (0UL) /*!< Read: Disabled */
#define SPIM_INTENSET_ENDRX_Enabled (1UL) /*!< Read: Enabled */
#define SPIM_INTENSET_ENDRX_Set (1UL) /*!< Enable */
#define SPIM_INTENSET_STOPPED_Pos (1UL) /*!< Position of STOPPED field. */
#define SPIM_INTENSET_STOPPED_Msk (0x1UL << SPIM_INTENSET_STOPPED_Pos) /*!< Bit mask of STOPPED field. */
#define SPIM_INTENSET_STOPPED_Disabled (0UL) /*!< Read: Disabled */
#define SPIM_INTENSET_STOPPED_Enabled (1UL) /*!< Read: Enabled */
#define SPIM_INTENSET_STOPPED_Set (1UL) /*!< Enable */
#define SPIM_INTENCLR_STARTED_Pos (19UL) /*!< Position of STARTED field. */
#define SPIM_INTENCLR_STARTED_Msk (0x1UL << SPIM_INTENCLR_STARTED_Pos) /*!< Bit mask of STARTED field. */
#define SPIM_INTENCLR_STARTED_Disabled (0UL) /*!< Read: Disabled */
#define SPIM_INTENCLR_STARTED_Enabled (1UL) /*!< Read: Enabled */
#define SPIM_INTENCLR_STARTED_Clear (1UL) /*!< Disable */
#define SPIM_INTENCLR_ENDTX_Pos (8UL) /*!< Position of ENDTX field. */
#define SPIM_INTENCLR_ENDTX_Msk (0x1UL << SPIM_INTENCLR_ENDTX_Pos) /*!< Bit mask of ENDTX field. */
#define SPIM_INTENCLR_ENDTX_Disabled (0UL) /*!< Read: Disabled */
#define SPIM_INTENCLR_ENDTX_Enabled (1UL) /*!< Read: Enabled */
#define SPIM_INTENCLR_ENDTX_Clear (1UL) /*!< Disable */
#define SPIM_INTENCLR_END_Pos (6UL) /*!< Position of END field. */
#define SPIM_INTENCLR_END_Msk (0x1UL << SPIM_INTENCLR_END_Pos) /*!< Bit mask of END field. */
#define SPIM_INTENCLR_END_Disabled (0UL) /*!< Read: Disabled */
#define SPIM_INTENCLR_END_Enabled (1UL) /*!< Read: Enabled */
#define SPIM_INTENCLR_END_Clear (1UL) /*!< Disable */
#define SPIM_INTENCLR_ENDRX_Pos (4UL) /*!< Position of ENDRX field. */
#define SPIM_INTENCLR_ENDRX_Msk (0x1UL << SPIM_INTENCLR_ENDRX_Pos) /*!< Bit mask of ENDRX field. */
#define SPIM_INTENCLR_ENDRX_Disabled (0UL) /*!< Read: Disabled */
#define SPIM_INTENCLR_ENDRX_Enabled (1UL) /*!< Read: Enabled */
#define SPIM_INTENCLR_ENDRX_Clear (1UL) /*!< Disable */
#define SPIM_INTENCLR_STOPPED_Pos (1UL) /*!< Position of STOPPED field. */
#define SPIM_INTENCLR_STOPPED_Msk (0x1UL << SPIM_INTENCLR_STOPPED_Pos) /*!< Bit mask of STOPPED field. */
#define SPIM_INTENCLR_STOPPED_Disabled (0UL) /*!< Read: Disabled */
#define SPIM_INTENCLR_STOPPED_Enabled (1UL) /*!< Read: Enabled */
#define SPIM_INTENCLR_STOPPED_Clear (1UL) /*!< Disable */
#define SPIM_STALLSTAT_RX_Pos (1UL) /*!< Position of RX field. */
#define SPIM_STALLSTAT_RX_Msk (0x1UL << SPIM_STALLSTAT_RX_Pos) /*!< Bit mask of RX field. */
#define SPIM_STALLSTAT_RX_NOSTALL (0UL) /*!< No stall */
#define SPIM_STALLSTAT_RX_STALL (1UL) /*!< A stall has occurred */
#define SPIM_STALLSTAT_TX_Pos (0UL) /*!< Position of TX field. */
#define SPIM_STALLSTAT_TX_Msk (0x1UL << SPIM_STALLSTAT_TX_Pos) /*!< Bit mask of TX field. */
#define SPIM_STALLSTAT_TX_NOSTALL (0UL) /*!< No stall */
#define SPIM_STALLSTAT_TX_STALL (1UL) /*!< A stall has occurred */
#define SPIM_ENABLE_ENABLE_Pos (0UL) /*!< Position of ENABLE field. */
#define SPIM_ENABLE_ENABLE_Msk (0xFUL << SPIM_ENABLE_ENABLE_Pos) /*!< Bit mask of ENABLE field. */
#define SPIM_ENABLE_ENABLE_Disabled (0UL) /*!< Disable SPIM */
#define SPIM_ENABLE_ENABLE_Enabled (7UL) /*!< Enable SPIM */
#define SPIM_PSEL_SCK_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define SPIM_PSEL_SCK_CONNECT_Msk (0x1UL << SPIM_PSEL_SCK_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define SPIM_PSEL_SCK_CONNECT_Connected (0UL) /*!< Connect */
#define SPIM_PSEL_SCK_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define SPIM_PSEL_SCK_PORT_Pos (5UL) /*!< Position of PORT field. */
#define SPIM_PSEL_SCK_PORT_Msk (0x1UL << SPIM_PSEL_SCK_PORT_Pos) /*!< Bit mask of PORT field. */
#define SPIM_PSEL_SCK_PIN_Pos (0UL) /*!< Position of PIN field. */
#define SPIM_PSEL_SCK_PIN_Msk (0x1FUL << SPIM_PSEL_SCK_PIN_Pos) /*!< Bit mask of PIN field. */
#define SPIM_PSEL_MOSI_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define SPIM_PSEL_MOSI_CONNECT_Msk (0x1UL << SPIM_PSEL_MOSI_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define SPIM_PSEL_MOSI_CONNECT_Connected (0UL) /*!< Connect */
#define SPIM_PSEL_MOSI_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define SPIM_PSEL_MOSI_PORT_Pos (5UL) /*!< Position of PORT field. */
#define SPIM_PSEL_MOSI_PORT_Msk (0x1UL << SPIM_PSEL_MOSI_PORT_Pos) /*!< Bit mask of PORT field. */
#define SPIM_PSEL_MOSI_PIN_Pos (0UL) /*!< Position of PIN field. */
#define SPIM_PSEL_MOSI_PIN_Msk (0x1FUL << SPIM_PSEL_MOSI_PIN_Pos) /*!< Bit mask of PIN field. */
#define SPIM_PSEL_MISO_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define SPIM_PSEL_MISO_CONNECT_Msk (0x1UL << SPIM_PSEL_MISO_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define SPIM_PSEL_MISO_CONNECT_Connected (0UL) /*!< Connect */
#define SPIM_PSEL_MISO_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define SPIM_PSEL_MISO_PORT_Pos (5UL) /*!< Position of PORT field. */
#define SPIM_PSEL_MISO_PORT_Msk (0x1UL << SPIM_PSEL_MISO_PORT_Pos) /*!< Bit mask of PORT field. */
#define SPIM_PSEL_MISO_PIN_Pos (0UL) /*!< Position of PIN field. */
#define SPIM_PSEL_MISO_PIN_Msk (0x1FUL << SPIM_PSEL_MISO_PIN_Pos) /*!< Bit mask of PIN field. */
#define SPIM_PSEL_CSN_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define SPIM_PSEL_CSN_CONNECT_Msk (0x1UL << SPIM_PSEL_CSN_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define SPIM_PSEL_CSN_CONNECT_Connected (0UL) /*!< Connect */
#define SPIM_PSEL_CSN_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define SPIM_PSEL_CSN_PORT_Pos (5UL) /*!< Position of PORT field. */
#define SPIM_PSEL_CSN_PORT_Msk (0x1UL << SPIM_PSEL_CSN_PORT_Pos) /*!< Bit mask of PORT field. */
#define SPIM_PSEL_CSN_PIN_Pos (0UL) /*!< Position of PIN field. */
#define SPIM_PSEL_CSN_PIN_Msk (0x1FUL << SPIM_PSEL_CSN_PIN_Pos) /*!< Bit mask of PIN field. */
#define SPIM_FREQUENCY_FREQUENCY_Pos (0UL) /*!< Position of FREQUENCY field. */
#define SPIM_FREQUENCY_FREQUENCY_Msk (0xFFFFFFFFUL << SPIM_FREQUENCY_FREQUENCY_Pos) /*!< Bit mask of FREQUENCY field. */
#define SPIM_FREQUENCY_FREQUENCY_K125 (0x02000000UL) /*!< 125 kbps */
#define SPIM_FREQUENCY_FREQUENCY_K250 (0x04000000UL) /*!< 250 kbps */
#define SPIM_FREQUENCY_FREQUENCY_K500 (0x08000000UL) /*!< 500 kbps */
#define SPIM_FREQUENCY_FREQUENCY_M16 (0x0A000000UL) /*!< 16 Mbps */
#define SPIM_FREQUENCY_FREQUENCY_M1 (0x10000000UL) /*!< 1 Mbps */
#define SPIM_FREQUENCY_FREQUENCY_M32 (0x14000000UL) /*!< 32 Mbps */
#define SPIM_FREQUENCY_FREQUENCY_M2 (0x20000000UL) /*!< 2 Mbps */
#define SPIM_FREQUENCY_FREQUENCY_M4 (0x40000000UL) /*!< 4 Mbps */
#define SPIM_FREQUENCY_FREQUENCY_M8 (0x80000000UL) /*!< 8 Mbps */
#define SPIM_RXD_PTR_PTR_Pos (0UL) /*!< Position of PTR field. */
#define SPIM_RXD_PTR_PTR_Msk (0xFFFFFFFFUL << SPIM_RXD_PTR_PTR_Pos) /*!< Bit mask of PTR field. */
#define SPIM_RXD_MAXCNT_MAXCNT_Pos (0UL) /*!< Position of MAXCNT field. */
#define SPIM_RXD_MAXCNT_MAXCNT_Msk (0xFFFFUL << SPIM_RXD_MAXCNT_MAXCNT_Pos) /*!< Bit mask of MAXCNT field. */
#define SPIM_RXD_AMOUNT_AMOUNT_Pos (0UL) /*!< Position of AMOUNT field. */
#define SPIM_RXD_AMOUNT_AMOUNT_Msk (0xFFFFUL << SPIM_RXD_AMOUNT_AMOUNT_Pos) /*!< Bit mask of AMOUNT field. */
#define SPIM_RXD_LIST_LIST_Pos (0UL) /*!< Position of LIST field. */
#define SPIM_RXD_LIST_LIST_Msk (0x3UL << SPIM_RXD_LIST_LIST_Pos) /*!< Bit mask of LIST field. */
#define SPIM_RXD_LIST_LIST_Disabled (0UL) /*!< Disable EasyDMA list */
#define SPIM_RXD_LIST_LIST_ArrayList (1UL) /*!< Use array list */
#define SPIM_TXD_PTR_PTR_Pos (0UL) /*!< Position of PTR field. */
#define SPIM_TXD_PTR_PTR_Msk (0xFFFFFFFFUL << SPIM_TXD_PTR_PTR_Pos) /*!< Bit mask of PTR field. */
#define SPIM_TXD_MAXCNT_MAXCNT_Pos (0UL) /*!< Position of MAXCNT field. */
#define SPIM_TXD_MAXCNT_MAXCNT_Msk (0xFFFFUL << SPIM_TXD_MAXCNT_MAXCNT_Pos) /*!< Bit mask of MAXCNT field. */
#define SPIM_TXD_AMOUNT_AMOUNT_Pos (0UL) /*!< Position of AMOUNT field. */
#define SPIM_TXD_AMOUNT_AMOUNT_Msk (0xFFFFUL << SPIM_TXD_AMOUNT_AMOUNT_Pos) /*!< Bit mask of AMOUNT field. */
#define SPIM_TXD_LIST_LIST_Pos (0UL) /*!< Position of LIST field. */
#define SPIM_TXD_LIST_LIST_Msk (0x3UL << SPIM_TXD_LIST_LIST_Pos) /*!< Bit mask of LIST field. */
#define SPIM_TXD_LIST_LIST_Disabled (0UL) /*!< Disable EasyDMA list */
#define SPIM_TXD_LIST_LIST_ArrayList (1UL) /*!< Use array list */
#define SPIM_CONFIG_CPOL_Pos (2UL) /*!< Position of CPOL field. */
#define SPIM_CONFIG_CPOL_Msk (0x1UL << SPIM_CONFIG_CPOL_Pos) /*!< Bit mask of CPOL field. */
#define SPIM_CONFIG_CPOL_ActiveHigh (0UL) /*!< Active high */
#define SPIM_CONFIG_CPOL_ActiveLow (1UL) /*!< Active low */
#define SPIM_CONFIG_CPHA_Pos (1UL) /*!< Position of CPHA field. */
#define SPIM_CONFIG_CPHA_Msk (0x1UL << SPIM_CONFIG_CPHA_Pos) /*!< Bit mask of CPHA field. */
#define SPIM_CONFIG_CPHA_Leading (0UL) /*!< Sample on leading edge of clock, shift serial data on trailing edge */
#define SPIM_CONFIG_CPHA_Trailing (1UL) /*!< Sample on trailing edge of clock, shift serial data on leading edge */
#define SPIM_CONFIG_ORDER_Pos (0UL) /*!< Position of ORDER field. */
#define SPIM_CONFIG_ORDER_Msk (0x1UL << SPIM_CONFIG_ORDER_Pos) /*!< Bit mask of ORDER field. */
#define SPIM_CONFIG_ORDER_MsbFirst (0UL) /*!< Most significant bit shifted out first */
#define SPIM_CONFIG_ORDER_LsbFirst (1UL) /*!< Least significant bit shifted out first */
#define SPIM_IFTIMING_RXDELAY_RXDELAY_Pos (0UL) /*!< Position of RXDELAY field. */
#define SPIM_IFTIMING_RXDELAY_RXDELAY_Msk (0x7UL << SPIM_IFTIMING_RXDELAY_RXDELAY_Pos) /*!< Bit mask of RXDELAY field. */
#define SPIM_IFTIMING_CSNDUR_CSNDUR_Pos (0UL) /*!< Position of CSNDUR field. */
#define SPIM_IFTIMING_CSNDUR_CSNDUR_Msk (0xFFUL << SPIM_IFTIMING_CSNDUR_CSNDUR_Pos) /*!< Bit mask of CSNDUR field. */
#define SPIM_CSNPOL_CSNPOL_Pos (0UL) /*!< Position of CSNPOL field. */
#define SPIM_CSNPOL_CSNPOL_Msk (0x1UL << SPIM_CSNPOL_CSNPOL_Pos) /*!< Bit mask of CSNPOL field. */
#define SPIM_CSNPOL_CSNPOL_LOW (0UL) /*!< Active low (idle state high) */
#define SPIM_CSNPOL_CSNPOL_HIGH (1UL) /*!< Active high (idle state low) */
#define SPIM_PSELDCX_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define SPIM_PSELDCX_CONNECT_Msk (0x1UL << SPIM_PSELDCX_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define SPIM_PSELDCX_CONNECT_Connected (0UL) /*!< Connect */
#define SPIM_PSELDCX_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define SPIM_PSELDCX_PORT_Pos (5UL) /*!< Position of PORT field. */
#define SPIM_PSELDCX_PORT_Msk (0x1UL << SPIM_PSELDCX_PORT_Pos) /*!< Bit mask of PORT field. */
#define SPIM_PSELDCX_PIN_Pos (0UL) /*!< Position of PIN field. */
#define SPIM_PSELDCX_PIN_Msk (0x1FUL << SPIM_PSELDCX_PIN_Pos) /*!< Bit mask of PIN field. */
#define SPIM_DCXCNT_DCXCNT_Pos (0UL) /*!< Position of DCXCNT field. */
#define SPIM_DCXCNT_DCXCNT_Msk (0xFUL << SPIM_DCXCNT_DCXCNT_Pos) /*!< Bit mask of DCXCNT field. */
#define SPIM_ORC_ORC_Pos (0UL) /*!< Position of ORC field. */
#define SPIM_ORC_ORC_Msk (0xFFUL << SPIM_ORC_ORC_Pos) /*!< Bit mask of ORC field. */
#define TIMER_TASKS_START_TASKS_START_Pos (0UL) /*!< Position of TASKS_START field. */
#define TIMER_TASKS_START_TASKS_START_Msk (0x1UL << TIMER_TASKS_START_TASKS_START_Pos) /*!< Bit mask of TASKS_START field. */
#define TIMER_TASKS_START_TASKS_START_Trigger (1UL) /*!< Trigger task */
#define TIMER_TASKS_STOP_TASKS_STOP_Pos (0UL) /*!< Position of TASKS_STOP field. */
#define TIMER_TASKS_STOP_TASKS_STOP_Msk (0x1UL << TIMER_TASKS_STOP_TASKS_STOP_Pos) /*!< Bit mask of TASKS_STOP field. */
#define TIMER_TASKS_STOP_TASKS_STOP_Trigger (1UL) /*!< Trigger task */
#define TIMER_TASKS_COUNT_TASKS_COUNT_Pos (0UL) /*!< Position of TASKS_COUNT field. */
#define TIMER_TASKS_COUNT_TASKS_COUNT_Msk (0x1UL << TIMER_TASKS_COUNT_TASKS_COUNT_Pos) /*!< Bit mask of TASKS_COUNT field. */
#define TIMER_TASKS_COUNT_TASKS_COUNT_Trigger (1UL) /*!< Trigger task */
#define TIMER_TASKS_CLEAR_TASKS_CLEAR_Pos (0UL) /*!< Position of TASKS_CLEAR field. */
#define TIMER_TASKS_CLEAR_TASKS_CLEAR_Msk (0x1UL << TIMER_TASKS_CLEAR_TASKS_CLEAR_Pos) /*!< Bit mask of TASKS_CLEAR field. */
#define TIMER_TASKS_CLEAR_TASKS_CLEAR_Trigger (1UL) /*!< Trigger task */
#define TIMER_TASKS_SHUTDOWN_TASKS_SHUTDOWN_Pos (0UL) /*!< Position of TASKS_SHUTDOWN field. */
#define TIMER_TASKS_SHUTDOWN_TASKS_SHUTDOWN_Msk (0x1UL << TIMER_TASKS_SHUTDOWN_TASKS_SHUTDOWN_Pos) /*!< Bit mask of TASKS_SHUTDOWN field. */
#define TIMER_TASKS_SHUTDOWN_TASKS_SHUTDOWN_Trigger (1UL) /*!< Trigger task */
#define TIMER_TASKS_CAPTURE_TASKS_CAPTURE_Pos (0UL) /*!< Position of TASKS_CAPTURE field. */
#define TIMER_TASKS_CAPTURE_TASKS_CAPTURE_Msk (0x1UL << TIMER_TASKS_CAPTURE_TASKS_CAPTURE_Pos) /*!< Bit mask of TASKS_CAPTURE field. */
#define TIMER_TASKS_CAPTURE_TASKS_CAPTURE_Trigger (1UL) /*!< Trigger task */
#define TIMER_EVENTS_COMPARE_EVENTS_COMPARE_Pos (0UL) /*!< Position of EVENTS_COMPARE field. */
#define TIMER_EVENTS_COMPARE_EVENTS_COMPARE_Msk (0x1UL << TIMER_EVENTS_COMPARE_EVENTS_COMPARE_Pos) /*!< Bit mask of EVENTS_COMPARE field. */
#define TIMER_EVENTS_COMPARE_EVENTS_COMPARE_NotGenerated (0UL) /*!< Event not generated */
#define TIMER_EVENTS_COMPARE_EVENTS_COMPARE_Generated (1UL) /*!< Event generated */
#define TIMER_SHORTS_COMPARE5_STOP_Pos (13UL) /*!< Position of COMPARE5_STOP field. */
#define TIMER_SHORTS_COMPARE5_STOP_Msk (0x1UL << TIMER_SHORTS_COMPARE5_STOP_Pos) /*!< Bit mask of COMPARE5_STOP field. */
#define TIMER_SHORTS_COMPARE5_STOP_Disabled (0UL) /*!< Disable shortcut */
#define TIMER_SHORTS_COMPARE5_STOP_Enabled (1UL) /*!< Enable shortcut */
#define TIMER_SHORTS_COMPARE4_STOP_Pos (12UL) /*!< Position of COMPARE4_STOP field. */
#define TIMER_SHORTS_COMPARE4_STOP_Msk (0x1UL << TIMER_SHORTS_COMPARE4_STOP_Pos) /*!< Bit mask of COMPARE4_STOP field. */
#define TIMER_SHORTS_COMPARE4_STOP_Disabled (0UL) /*!< Disable shortcut */
#define TIMER_SHORTS_COMPARE4_STOP_Enabled (1UL) /*!< Enable shortcut */
#define TIMER_SHORTS_COMPARE3_STOP_Pos (11UL) /*!< Position of COMPARE3_STOP field. */
#define TIMER_SHORTS_COMPARE3_STOP_Msk (0x1UL << TIMER_SHORTS_COMPARE3_STOP_Pos) /*!< Bit mask of COMPARE3_STOP field. */
#define TIMER_SHORTS_COMPARE3_STOP_Disabled (0UL) /*!< Disable shortcut */
#define TIMER_SHORTS_COMPARE3_STOP_Enabled (1UL) /*!< Enable shortcut */
#define TIMER_SHORTS_COMPARE2_STOP_Pos (10UL) /*!< Position of COMPARE2_STOP field. */
#define TIMER_SHORTS_COMPARE2_STOP_Msk (0x1UL << TIMER_SHORTS_COMPARE2_STOP_Pos) /*!< Bit mask of COMPARE2_STOP field. */
#define TIMER_SHORTS_COMPARE2_STOP_Disabled (0UL) /*!< Disable shortcut */
#define TIMER_SHORTS_COMPARE2_STOP_Enabled (1UL) /*!< Enable shortcut */
#define TIMER_SHORTS_COMPARE1_STOP_Pos (9UL) /*!< Position of COMPARE1_STOP field. */
#define TIMER_SHORTS_COMPARE1_STOP_Msk (0x1UL << TIMER_SHORTS_COMPARE1_STOP_Pos) /*!< Bit mask of COMPARE1_STOP field. */
#define TIMER_SHORTS_COMPARE1_STOP_Disabled (0UL) /*!< Disable shortcut */
#define TIMER_SHORTS_COMPARE1_STOP_Enabled (1UL) /*!< Enable shortcut */
#define TIMER_SHORTS_COMPARE0_STOP_Pos (8UL) /*!< Position of COMPARE0_STOP field. */
#define TIMER_SHORTS_COMPARE0_STOP_Msk (0x1UL << TIMER_SHORTS_COMPARE0_STOP_Pos) /*!< Bit mask of COMPARE0_STOP field. */
#define TIMER_SHORTS_COMPARE0_STOP_Disabled (0UL) /*!< Disable shortcut */
#define TIMER_SHORTS_COMPARE0_STOP_Enabled (1UL) /*!< Enable shortcut */
#define TIMER_SHORTS_COMPARE5_CLEAR_Pos (5UL) /*!< Position of COMPARE5_CLEAR field. */
#define TIMER_SHORTS_COMPARE5_CLEAR_Msk (0x1UL << TIMER_SHORTS_COMPARE5_CLEAR_Pos) /*!< Bit mask of COMPARE5_CLEAR field. */
#define TIMER_SHORTS_COMPARE5_CLEAR_Disabled (0UL) /*!< Disable shortcut */
#define TIMER_SHORTS_COMPARE5_CLEAR_Enabled (1UL) /*!< Enable shortcut */
#define TIMER_SHORTS_COMPARE4_CLEAR_Pos (4UL) /*!< Position of COMPARE4_CLEAR field. */
#define TIMER_SHORTS_COMPARE4_CLEAR_Msk (0x1UL << TIMER_SHORTS_COMPARE4_CLEAR_Pos) /*!< Bit mask of COMPARE4_CLEAR field. */
#define TIMER_SHORTS_COMPARE4_CLEAR_Disabled (0UL) /*!< Disable shortcut */
#define TIMER_SHORTS_COMPARE4_CLEAR_Enabled (1UL) /*!< Enable shortcut */
#define TIMER_SHORTS_COMPARE3_CLEAR_Pos (3UL) /*!< Position of COMPARE3_CLEAR field. */
#define TIMER_SHORTS_COMPARE3_CLEAR_Msk (0x1UL << TIMER_SHORTS_COMPARE3_CLEAR_Pos) /*!< Bit mask of COMPARE3_CLEAR field. */
#define TIMER_SHORTS_COMPARE3_CLEAR_Disabled (0UL) /*!< Disable shortcut */
#define TIMER_SHORTS_COMPARE3_CLEAR_Enabled (1UL) /*!< Enable shortcut */
#define TIMER_SHORTS_COMPARE2_CLEAR_Pos (2UL) /*!< Position of COMPARE2_CLEAR field. */
#define TIMER_SHORTS_COMPARE2_CLEAR_Msk (0x1UL << TIMER_SHORTS_COMPARE2_CLEAR_Pos) /*!< Bit mask of COMPARE2_CLEAR field. */
#define TIMER_SHORTS_COMPARE2_CLEAR_Disabled (0UL) /*!< Disable shortcut */
#define TIMER_SHORTS_COMPARE2_CLEAR_Enabled (1UL) /*!< Enable shortcut */
#define TIMER_SHORTS_COMPARE1_CLEAR_Pos (1UL) /*!< Position of COMPARE1_CLEAR field. */
#define TIMER_SHORTS_COMPARE1_CLEAR_Msk (0x1UL << TIMER_SHORTS_COMPARE1_CLEAR_Pos) /*!< Bit mask of COMPARE1_CLEAR field. */
#define TIMER_SHORTS_COMPARE1_CLEAR_Disabled (0UL) /*!< Disable shortcut */
#define TIMER_SHORTS_COMPARE1_CLEAR_Enabled (1UL) /*!< Enable shortcut */
#define TIMER_SHORTS_COMPARE0_CLEAR_Pos (0UL) /*!< Position of COMPARE0_CLEAR field. */
#define TIMER_SHORTS_COMPARE0_CLEAR_Msk (0x1UL << TIMER_SHORTS_COMPARE0_CLEAR_Pos) /*!< Bit mask of COMPARE0_CLEAR field. */
#define TIMER_SHORTS_COMPARE0_CLEAR_Disabled (0UL) /*!< Disable shortcut */
#define TIMER_SHORTS_COMPARE0_CLEAR_Enabled (1UL) /*!< Enable shortcut */
#define TIMER_INTENSET_COMPARE5_Pos (21UL) /*!< Position of COMPARE5 field. */
#define TIMER_INTENSET_COMPARE5_Msk (0x1UL << TIMER_INTENSET_COMPARE5_Pos) /*!< Bit mask of COMPARE5 field. */
#define TIMER_INTENSET_COMPARE5_Disabled (0UL) /*!< Read: Disabled */
#define TIMER_INTENSET_COMPARE5_Enabled (1UL) /*!< Read: Enabled */
#define TIMER_INTENSET_COMPARE5_Set (1UL) /*!< Enable */
#define TIMER_INTENSET_COMPARE4_Pos (20UL) /*!< Position of COMPARE4 field. */
#define TIMER_INTENSET_COMPARE4_Msk (0x1UL << TIMER_INTENSET_COMPARE4_Pos) /*!< Bit mask of COMPARE4 field. */
#define TIMER_INTENSET_COMPARE4_Disabled (0UL) /*!< Read: Disabled */
#define TIMER_INTENSET_COMPARE4_Enabled (1UL) /*!< Read: Enabled */
#define TIMER_INTENSET_COMPARE4_Set (1UL) /*!< Enable */
#define TIMER_INTENSET_COMPARE3_Pos (19UL) /*!< Position of COMPARE3 field. */
#define TIMER_INTENSET_COMPARE3_Msk (0x1UL << TIMER_INTENSET_COMPARE3_Pos) /*!< Bit mask of COMPARE3 field. */
#define TIMER_INTENSET_COMPARE3_Disabled (0UL) /*!< Read: Disabled */
#define TIMER_INTENSET_COMPARE3_Enabled (1UL) /*!< Read: Enabled */
#define TIMER_INTENSET_COMPARE3_Set (1UL) /*!< Enable */
#define TIMER_INTENSET_COMPARE2_Pos (18UL) /*!< Position of COMPARE2 field. */
#define TIMER_INTENSET_COMPARE2_Msk (0x1UL << TIMER_INTENSET_COMPARE2_Pos) /*!< Bit mask of COMPARE2 field. */
#define TIMER_INTENSET_COMPARE2_Disabled (0UL) /*!< Read: Disabled */
#define TIMER_INTENSET_COMPARE2_Enabled (1UL) /*!< Read: Enabled */
#define TIMER_INTENSET_COMPARE2_Set (1UL) /*!< Enable */
#define TIMER_INTENSET_COMPARE1_Pos (17UL) /*!< Position of COMPARE1 field. */
#define TIMER_INTENSET_COMPARE1_Msk (0x1UL << TIMER_INTENSET_COMPARE1_Pos) /*!< Bit mask of COMPARE1 field. */
#define TIMER_INTENSET_COMPARE1_Disabled (0UL) /*!< Read: Disabled */
#define TIMER_INTENSET_COMPARE1_Enabled (1UL) /*!< Read: Enabled */
#define TIMER_INTENSET_COMPARE1_Set (1UL) /*!< Enable */
#define TIMER_INTENSET_COMPARE0_Pos (16UL) /*!< Position of COMPARE0 field. */
#define TIMER_INTENSET_COMPARE0_Msk (0x1UL << TIMER_INTENSET_COMPARE0_Pos) /*!< Bit mask of COMPARE0 field. */
#define TIMER_INTENSET_COMPARE0_Disabled (0UL) /*!< Read: Disabled */
#define TIMER_INTENSET_COMPARE0_Enabled (1UL) /*!< Read: Enabled */
#define TIMER_INTENSET_COMPARE0_Set (1UL) /*!< Enable */
#define TIMER_INTENCLR_COMPARE5_Pos (21UL) /*!< Position of COMPARE5 field. */
#define TIMER_INTENCLR_COMPARE5_Msk (0x1UL << TIMER_INTENCLR_COMPARE5_Pos) /*!< Bit mask of COMPARE5 field. */
#define TIMER_INTENCLR_COMPARE5_Disabled (0UL) /*!< Read: Disabled */
#define TIMER_INTENCLR_COMPARE5_Enabled (1UL) /*!< Read: Enabled */
#define TIMER_INTENCLR_COMPARE5_Clear (1UL) /*!< Disable */
#define TIMER_INTENCLR_COMPARE4_Pos (20UL) /*!< Position of COMPARE4 field. */
#define TIMER_INTENCLR_COMPARE4_Msk (0x1UL << TIMER_INTENCLR_COMPARE4_Pos) /*!< Bit mask of COMPARE4 field. */
#define TIMER_INTENCLR_COMPARE4_Disabled (0UL) /*!< Read: Disabled */
#define TIMER_INTENCLR_COMPARE4_Enabled (1UL) /*!< Read: Enabled */
#define TIMER_INTENCLR_COMPARE4_Clear (1UL) /*!< Disable */
#define TIMER_INTENCLR_COMPARE3_Pos (19UL) /*!< Position of COMPARE3 field. */
#define TIMER_INTENCLR_COMPARE3_Msk (0x1UL << TIMER_INTENCLR_COMPARE3_Pos) /*!< Bit mask of COMPARE3 field. */
#define TIMER_INTENCLR_COMPARE3_Disabled (0UL) /*!< Read: Disabled */
#define TIMER_INTENCLR_COMPARE3_Enabled (1UL) /*!< Read: Enabled */
#define TIMER_INTENCLR_COMPARE3_Clear (1UL) /*!< Disable */
#define TIMER_INTENCLR_COMPARE2_Pos (18UL) /*!< Position of COMPARE2 field. */
#define TIMER_INTENCLR_COMPARE2_Msk (0x1UL << TIMER_INTENCLR_COMPARE2_Pos) /*!< Bit mask of COMPARE2 field. */
#define TIMER_INTENCLR_COMPARE2_Disabled (0UL) /*!< Read: Disabled */
#define TIMER_INTENCLR_COMPARE2_Enabled (1UL) /*!< Read: Enabled */
#define TIMER_INTENCLR_COMPARE2_Clear (1UL) /*!< Disable */
#define TIMER_INTENCLR_COMPARE1_Pos (17UL) /*!< Position of COMPARE1 field. */
#define TIMER_INTENCLR_COMPARE1_Msk (0x1UL << TIMER_INTENCLR_COMPARE1_Pos) /*!< Bit mask of COMPARE1 field. */
#define TIMER_INTENCLR_COMPARE1_Disabled (0UL) /*!< Read: Disabled */
#define TIMER_INTENCLR_COMPARE1_Enabled (1UL) /*!< Read: Enabled */
#define TIMER_INTENCLR_COMPARE1_Clear (1UL) /*!< Disable */
#define TIMER_INTENCLR_COMPARE0_Pos (16UL) /*!< Position of COMPARE0 field. */
#define TIMER_INTENCLR_COMPARE0_Msk (0x1UL << TIMER_INTENCLR_COMPARE0_Pos) /*!< Bit mask of COMPARE0 field. */
#define TIMER_INTENCLR_COMPARE0_Disabled (0UL) /*!< Read: Disabled */
#define TIMER_INTENCLR_COMPARE0_Enabled (1UL) /*!< Read: Enabled */
#define TIMER_INTENCLR_COMPARE0_Clear (1UL) /*!< Disable */
#define TIMER_MODE_MODE_Pos (0UL) /*!< Position of MODE field. */
#define TIMER_MODE_MODE_Msk (0x3UL << TIMER_MODE_MODE_Pos) /*!< Bit mask of MODE field. */
#define TIMER_MODE_MODE_Timer (0UL) /*!< Select Timer mode */
#define TIMER_MODE_MODE_Counter (1UL) /*!< Deprecated enumerator -  Select Counter mode */
#define TIMER_MODE_MODE_LowPowerCounter (2UL) /*!< Select Low Power Counter mode */
#define TIMER_BITMODE_BITMODE_Pos (0UL) /*!< Position of BITMODE field. */
#define TIMER_BITMODE_BITMODE_Msk (0x3UL << TIMER_BITMODE_BITMODE_Pos) /*!< Bit mask of BITMODE field. */
#define TIMER_BITMODE_BITMODE_16Bit (0UL) /*!< 16 bit timer bit width */
#define TIMER_BITMODE_BITMODE_08Bit (1UL) /*!< 8 bit timer bit width */
#define TIMER_BITMODE_BITMODE_24Bit (2UL) /*!< 24 bit timer bit width */
#define TIMER_BITMODE_BITMODE_32Bit (3UL) /*!< 32 bit timer bit width */
#define TIMER_PRESCALER_PRESCALER_Pos (0UL) /*!< Position of PRESCALER field. */
#define TIMER_PRESCALER_PRESCALER_Msk (0xFUL << TIMER_PRESCALER_PRESCALER_Pos) /*!< Bit mask of PRESCALER field. */
#define TIMER_CC_CC_Pos (0UL) /*!< Position of CC field. */
#define TIMER_CC_CC_Msk (0xFFFFFFFFUL << TIMER_CC_CC_Pos) /*!< Bit mask of CC field. */
#define TWI_TASKS_STARTRX_TASKS_STARTRX_Pos (0UL) /*!< Position of TASKS_STARTRX field. */
#define TWI_TASKS_STARTRX_TASKS_STARTRX_Msk (0x1UL << TWI_TASKS_STARTRX_TASKS_STARTRX_Pos) /*!< Bit mask of TASKS_STARTRX field. */
#define TWI_TASKS_STARTRX_TASKS_STARTRX_Trigger (1UL) /*!< Trigger task */
#define TWI_TASKS_STARTTX_TASKS_STARTTX_Pos (0UL) /*!< Position of TASKS_STARTTX field. */
#define TWI_TASKS_STARTTX_TASKS_STARTTX_Msk (0x1UL << TWI_TASKS_STARTTX_TASKS_STARTTX_Pos) /*!< Bit mask of TASKS_STARTTX field. */
#define TWI_TASKS_STARTTX_TASKS_STARTTX_Trigger (1UL) /*!< Trigger task */
#define TWI_TASKS_STOP_TASKS_STOP_Pos (0UL) /*!< Position of TASKS_STOP field. */
#define TWI_TASKS_STOP_TASKS_STOP_Msk (0x1UL << TWI_TASKS_STOP_TASKS_STOP_Pos) /*!< Bit mask of TASKS_STOP field. */
#define TWI_TASKS_STOP_TASKS_STOP_Trigger (1UL) /*!< Trigger task */
#define TWI_TASKS_SUSPEND_TASKS_SUSPEND_Pos (0UL) /*!< Position of TASKS_SUSPEND field. */
#define TWI_TASKS_SUSPEND_TASKS_SUSPEND_Msk (0x1UL << TWI_TASKS_SUSPEND_TASKS_SUSPEND_Pos) /*!< Bit mask of TASKS_SUSPEND field. */
#define TWI_TASKS_SUSPEND_TASKS_SUSPEND_Trigger (1UL) /*!< Trigger task */
#define TWI_TASKS_RESUME_TASKS_RESUME_Pos (0UL) /*!< Position of TASKS_RESUME field. */
#define TWI_TASKS_RESUME_TASKS_RESUME_Msk (0x1UL << TWI_TASKS_RESUME_TASKS_RESUME_Pos) /*!< Bit mask of TASKS_RESUME field. */
#define TWI_TASKS_RESUME_TASKS_RESUME_Trigger (1UL) /*!< Trigger task */
#define TWI_EVENTS_STOPPED_EVENTS_STOPPED_Pos (0UL) /*!< Position of EVENTS_STOPPED field. */
#define TWI_EVENTS_STOPPED_EVENTS_STOPPED_Msk (0x1UL << TWI_EVENTS_STOPPED_EVENTS_STOPPED_Pos) /*!< Bit mask of EVENTS_STOPPED field. */
#define TWI_EVENTS_STOPPED_EVENTS_STOPPED_NotGenerated (0UL) /*!< Event not generated */
#define TWI_EVENTS_STOPPED_EVENTS_STOPPED_Generated (1UL) /*!< Event generated */
#define TWI_EVENTS_RXDREADY_EVENTS_RXDREADY_Pos (0UL) /*!< Position of EVENTS_RXDREADY field. */
#define TWI_EVENTS_RXDREADY_EVENTS_RXDREADY_Msk (0x1UL << TWI_EVENTS_RXDREADY_EVENTS_RXDREADY_Pos) /*!< Bit mask of EVENTS_RXDREADY field. */
#define TWI_EVENTS_RXDREADY_EVENTS_RXDREADY_NotGenerated (0UL) /*!< Event not generated */
#define TWI_EVENTS_RXDREADY_EVENTS_RXDREADY_Generated (1UL) /*!< Event generated */
#define TWI_EVENTS_TXDSENT_EVENTS_TXDSENT_Pos (0UL) /*!< Position of EVENTS_TXDSENT field. */
#define TWI_EVENTS_TXDSENT_EVENTS_TXDSENT_Msk (0x1UL << TWI_EVENTS_TXDSENT_EVENTS_TXDSENT_Pos) /*!< Bit mask of EVENTS_TXDSENT field. */
#define TWI_EVENTS_TXDSENT_EVENTS_TXDSENT_NotGenerated (0UL) /*!< Event not generated */
#define TWI_EVENTS_TXDSENT_EVENTS_TXDSENT_Generated (1UL) /*!< Event generated */
#define TWI_EVENTS_ERROR_EVENTS_ERROR_Pos (0UL) /*!< Position of EVENTS_ERROR field. */
#define TWI_EVENTS_ERROR_EVENTS_ERROR_Msk (0x1UL << TWI_EVENTS_ERROR_EVENTS_ERROR_Pos) /*!< Bit mask of EVENTS_ERROR field. */
#define TWI_EVENTS_ERROR_EVENTS_ERROR_NotGenerated (0UL) /*!< Event not generated */
#define TWI_EVENTS_ERROR_EVENTS_ERROR_Generated (1UL) /*!< Event generated */
#define TWI_EVENTS_BB_EVENTS_BB_Pos (0UL) /*!< Position of EVENTS_BB field. */
#define TWI_EVENTS_BB_EVENTS_BB_Msk (0x1UL << TWI_EVENTS_BB_EVENTS_BB_Pos) /*!< Bit mask of EVENTS_BB field. */
#define TWI_EVENTS_BB_EVENTS_BB_NotGenerated (0UL) /*!< Event not generated */
#define TWI_EVENTS_BB_EVENTS_BB_Generated (1UL) /*!< Event generated */
#define TWI_EVENTS_SUSPENDED_EVENTS_SUSPENDED_Pos (0UL) /*!< Position of EVENTS_SUSPENDED field. */
#define TWI_EVENTS_SUSPENDED_EVENTS_SUSPENDED_Msk (0x1UL << TWI_EVENTS_SUSPENDED_EVENTS_SUSPENDED_Pos) /*!< Bit mask of EVENTS_SUSPENDED field. */
#define TWI_EVENTS_SUSPENDED_EVENTS_SUSPENDED_NotGenerated (0UL) /*!< Event not generated */
#define TWI_EVENTS_SUSPENDED_EVENTS_SUSPENDED_Generated (1UL) /*!< Event generated */
#define TWI_SHORTS_BB_STOP_Pos (1UL) /*!< Position of BB_STOP field. */
#define TWI_SHORTS_BB_STOP_Msk (0x1UL << TWI_SHORTS_BB_STOP_Pos) /*!< Bit mask of BB_STOP field. */
#define TWI_SHORTS_BB_STOP_Disabled (0UL) /*!< Disable shortcut */
#define TWI_SHORTS_BB_STOP_Enabled (1UL) /*!< Enable shortcut */
#define TWI_SHORTS_BB_SUSPEND_Pos (0UL) /*!< Position of BB_SUSPEND field. */
#define TWI_SHORTS_BB_SUSPEND_Msk (0x1UL << TWI_SHORTS_BB_SUSPEND_Pos) /*!< Bit mask of BB_SUSPEND field. */
#define TWI_SHORTS_BB_SUSPEND_Disabled (0UL) /*!< Disable shortcut */
#define TWI_SHORTS_BB_SUSPEND_Enabled (1UL) /*!< Enable shortcut */
#define TWI_INTENSET_SUSPENDED_Pos (18UL) /*!< Position of SUSPENDED field. */
#define TWI_INTENSET_SUSPENDED_Msk (0x1UL << TWI_INTENSET_SUSPENDED_Pos) /*!< Bit mask of SUSPENDED field. */
#define TWI_INTENSET_SUSPENDED_Disabled (0UL) /*!< Read: Disabled */
#define TWI_INTENSET_SUSPENDED_Enabled (1UL) /*!< Read: Enabled */
#define TWI_INTENSET_SUSPENDED_Set (1UL) /*!< Enable */
#define TWI_INTENSET_BB_Pos (14UL) /*!< Position of BB field. */
#define TWI_INTENSET_BB_Msk (0x1UL << TWI_INTENSET_BB_Pos) /*!< Bit mask of BB field. */
#define TWI_INTENSET_BB_Disabled (0UL) /*!< Read: Disabled */
#define TWI_INTENSET_BB_Enabled (1UL) /*!< Read: Enabled */
#define TWI_INTENSET_BB_Set (1UL) /*!< Enable */
#define TWI_INTENSET_ERROR_Pos (9UL) /*!< Position of ERROR field. */
#define TWI_INTENSET_ERROR_Msk (0x1UL << TWI_INTENSET_ERROR_Pos) /*!< Bit mask of ERROR field. */
#define TWI_INTENSET_ERROR_Disabled (0UL) /*!< Read: Disabled */
#define TWI_INTENSET_ERROR_Enabled (1UL) /*!< Read: Enabled */
#define TWI_INTENSET_ERROR_Set (1UL) /*!< Enable */
#define TWI_INTENSET_TXDSENT_Pos (7UL) /*!< Position of TXDSENT field. */
#define TWI_INTENSET_TXDSENT_Msk (0x1UL << TWI_INTENSET_TXDSENT_Pos) /*!< Bit mask of TXDSENT field. */
#define TWI_INTENSET_TXDSENT_Disabled (0UL) /*!< Read: Disabled */
#define TWI_INTENSET_TXDSENT_Enabled (1UL) /*!< Read: Enabled */
#define TWI_INTENSET_TXDSENT_Set (1UL) /*!< Enable */
#define TWI_INTENSET_RXDREADY_Pos (2UL) /*!< Position of RXDREADY field. */
#define TWI_INTENSET_RXDREADY_Msk (0x1UL << TWI_INTENSET_RXDREADY_Pos) /*!< Bit mask of RXDREADY field. */
#define TWI_INTENSET_RXDREADY_Disabled (0UL) /*!< Read: Disabled */
#define TWI_INTENSET_RXDREADY_Enabled (1UL) /*!< Read: Enabled */
#define TWI_INTENSET_RXDREADY_Set (1UL) /*!< Enable */
#define TWI_INTENSET_STOPPED_Pos (1UL) /*!< Position of STOPPED field. */
#define TWI_INTENSET_STOPPED_Msk (0x1UL << TWI_INTENSET_STOPPED_Pos) /*!< Bit mask of STOPPED field. */
#define TWI_INTENSET_STOPPED_Disabled (0UL) /*!< Read: Disabled */
#define TWI_INTENSET_STOPPED_Enabled (1UL) /*!< Read: Enabled */
#define TWI_INTENSET_STOPPED_Set (1UL) /*!< Enable */
#define TWI_INTENCLR_SUSPENDED_Pos (18UL) /*!< Position of SUSPENDED field. */
#define TWI_INTENCLR_SUSPENDED_Msk (0x1UL << TWI_INTENCLR_SUSPENDED_Pos) /*!< Bit mask of SUSPENDED field. */
#define TWI_INTENCLR_SUSPENDED_Disabled (0UL) /*!< Read: Disabled */
#define TWI_INTENCLR_SUSPENDED_Enabled (1UL) /*!< Read: Enabled */
#define TWI_INTENCLR_SUSPENDED_Clear (1UL) /*!< Disable */
#define TWI_INTENCLR_BB_Pos (14UL) /*!< Position of BB field. */
#define TWI_INTENCLR_BB_Msk (0x1UL << TWI_INTENCLR_BB_Pos) /*!< Bit mask of BB field. */
#define TWI_INTENCLR_BB_Disabled (0UL) /*!< Read: Disabled */
#define TWI_INTENCLR_BB_Enabled (1UL) /*!< Read: Enabled */
#define TWI_INTENCLR_BB_Clear (1UL) /*!< Disable */
#define TWI_INTENCLR_ERROR_Pos (9UL) /*!< Position of ERROR field. */
#define TWI_INTENCLR_ERROR_Msk (0x1UL << TWI_INTENCLR_ERROR_Pos) /*!< Bit mask of ERROR field. */
#define TWI_INTENCLR_ERROR_Disabled (0UL) /*!< Read: Disabled */
#define TWI_INTENCLR_ERROR_Enabled (1UL) /*!< Read: Enabled */
#define TWI_INTENCLR_ERROR_Clear (1UL) /*!< Disable */
#define TWI_INTENCLR_TXDSENT_Pos (7UL) /*!< Position of TXDSENT field. */
#define TWI_INTENCLR_TXDSENT_Msk (0x1UL << TWI_INTENCLR_TXDSENT_Pos) /*!< Bit mask of TXDSENT field. */
#define TWI_INTENCLR_TXDSENT_Disabled (0UL) /*!< Read: Disabled */
#define TWI_INTENCLR_TXDSENT_Enabled (1UL) /*!< Read: Enabled */
#define TWI_INTENCLR_TXDSENT_Clear (1UL) /*!< Disable */
#define TWI_INTENCLR_RXDREADY_Pos (2UL) /*!< Position of RXDREADY field. */
#define TWI_INTENCLR_RXDREADY_Msk (0x1UL << TWI_INTENCLR_RXDREADY_Pos) /*!< Bit mask of RXDREADY field. */
#define TWI_INTENCLR_RXDREADY_Disabled (0UL) /*!< Read: Disabled */
#define TWI_INTENCLR_RXDREADY_Enabled (1UL) /*!< Read: Enabled */
#define TWI_INTENCLR_RXDREADY_Clear (1UL) /*!< Disable */
#define TWI_INTENCLR_STOPPED_Pos (1UL) /*!< Position of STOPPED field. */
#define TWI_INTENCLR_STOPPED_Msk (0x1UL << TWI_INTENCLR_STOPPED_Pos) /*!< Bit mask of STOPPED field. */
#define TWI_INTENCLR_STOPPED_Disabled (0UL) /*!< Read: Disabled */
#define TWI_INTENCLR_STOPPED_Enabled (1UL) /*!< Read: Enabled */
#define TWI_INTENCLR_STOPPED_Clear (1UL) /*!< Disable */
#define TWI_ERRORSRC_DNACK_Pos (2UL) /*!< Position of DNACK field. */
#define TWI_ERRORSRC_DNACK_Msk (0x1UL << TWI_ERRORSRC_DNACK_Pos) /*!< Bit mask of DNACK field. */
#define TWI_ERRORSRC_DNACK_NotPresent (0UL) /*!< Read: error not present */
#define TWI_ERRORSRC_DNACK_Present (1UL) /*!< Read: error present */
#define TWI_ERRORSRC_ANACK_Pos (1UL) /*!< Position of ANACK field. */
#define TWI_ERRORSRC_ANACK_Msk (0x1UL << TWI_ERRORSRC_ANACK_Pos) /*!< Bit mask of ANACK field. */
#define TWI_ERRORSRC_ANACK_NotPresent (0UL) /*!< Read: error not present */
#define TWI_ERRORSRC_ANACK_Present (1UL) /*!< Read: error present */
#define TWI_ERRORSRC_OVERRUN_Pos (0UL) /*!< Position of OVERRUN field. */
#define TWI_ERRORSRC_OVERRUN_Msk (0x1UL << TWI_ERRORSRC_OVERRUN_Pos) /*!< Bit mask of OVERRUN field. */
#define TWI_ERRORSRC_OVERRUN_NotPresent (0UL) /*!< Read: no overrun occured */
#define TWI_ERRORSRC_OVERRUN_Present (1UL) /*!< Read: overrun occured */
#define TWI_ENABLE_ENABLE_Pos (0UL) /*!< Position of ENABLE field. */
#define TWI_ENABLE_ENABLE_Msk (0xFUL << TWI_ENABLE_ENABLE_Pos) /*!< Bit mask of ENABLE field. */
#define TWI_ENABLE_ENABLE_Disabled (0UL) /*!< Disable TWI */
#define TWI_ENABLE_ENABLE_Enabled (5UL) /*!< Enable TWI */
#define TWI_PSEL_SCL_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define TWI_PSEL_SCL_CONNECT_Msk (0x1UL << TWI_PSEL_SCL_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define TWI_PSEL_SCL_CONNECT_Connected (0UL) /*!< Connect */
#define TWI_PSEL_SCL_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define TWI_PSEL_SCL_PORT_Pos (5UL) /*!< Position of PORT field. */
#define TWI_PSEL_SCL_PORT_Msk (0x1UL << TWI_PSEL_SCL_PORT_Pos) /*!< Bit mask of PORT field. */
#define TWI_PSEL_SCL_PIN_Pos (0UL) /*!< Position of PIN field. */
#define TWI_PSEL_SCL_PIN_Msk (0x1FUL << TWI_PSEL_SCL_PIN_Pos) /*!< Bit mask of PIN field. */
#define TWI_PSEL_SDA_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define TWI_PSEL_SDA_CONNECT_Msk (0x1UL << TWI_PSEL_SDA_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define TWI_PSEL_SDA_CONNECT_Connected (0UL) /*!< Connect */
#define TWI_PSEL_SDA_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define TWI_PSEL_SDA_PORT_Pos (5UL) /*!< Position of PORT field. */
#define TWI_PSEL_SDA_PORT_Msk (0x1UL << TWI_PSEL_SDA_PORT_Pos) /*!< Bit mask of PORT field. */
#define TWI_PSEL_SDA_PIN_Pos (0UL) /*!< Position of PIN field. */
#define TWI_PSEL_SDA_PIN_Msk (0x1FUL << TWI_PSEL_SDA_PIN_Pos) /*!< Bit mask of PIN field. */
#define TWI_RXD_RXD_Pos (0UL) /*!< Position of RXD field. */
#define TWI_RXD_RXD_Msk (0xFFUL << TWI_RXD_RXD_Pos) /*!< Bit mask of RXD field. */
#define TWI_TXD_TXD_Pos (0UL) /*!< Position of TXD field. */
#define TWI_TXD_TXD_Msk (0xFFUL << TWI_TXD_TXD_Pos) /*!< Bit mask of TXD field. */
#define TWI_FREQUENCY_FREQUENCY_Pos (0UL) /*!< Position of FREQUENCY field. */
#define TWI_FREQUENCY_FREQUENCY_Msk (0xFFFFFFFFUL << TWI_FREQUENCY_FREQUENCY_Pos) /*!< Bit mask of FREQUENCY field. */
#define TWI_FREQUENCY_FREQUENCY_K100 (0x01980000UL) /*!< 100 kbps */
#define TWI_FREQUENCY_FREQUENCY_K250 (0x04000000UL) /*!< 250 kbps */
#define TWI_FREQUENCY_FREQUENCY_K400 (0x06680000UL) /*!< 400 kbps (actual rate 410.256 kbps) */
#define TWI_ADDRESS_ADDRESS_Pos (0UL) /*!< Position of ADDRESS field. */
#define TWI_ADDRESS_ADDRESS_Msk (0x7FUL << TWI_ADDRESS_ADDRESS_Pos) /*!< Bit mask of ADDRESS field. */
#define TWIM_TASKS_STARTRX_TASKS_STARTRX_Pos (0UL) /*!< Position of TASKS_STARTRX field. */
#define TWIM_TASKS_STARTRX_TASKS_STARTRX_Msk (0x1UL << TWIM_TASKS_STARTRX_TASKS_STARTRX_Pos) /*!< Bit mask of TASKS_STARTRX field. */
#define TWIM_TASKS_STARTRX_TASKS_STARTRX_Trigger (1UL) /*!< Trigger task */
#define TWIM_TASKS_STARTTX_TASKS_STARTTX_Pos (0UL) /*!< Position of TASKS_STARTTX field. */
#define TWIM_TASKS_STARTTX_TASKS_STARTTX_Msk (0x1UL << TWIM_TASKS_STARTTX_TASKS_STARTTX_Pos) /*!< Bit mask of TASKS_STARTTX field. */
#define TWIM_TASKS_STARTTX_TASKS_STARTTX_Trigger (1UL) /*!< Trigger task */
#define TWIM_TASKS_STOP_TASKS_STOP_Pos (0UL) /*!< Position of TASKS_STOP field. */
#define TWIM_TASKS_STOP_TASKS_STOP_Msk (0x1UL << TWIM_TASKS_STOP_TASKS_STOP_Pos) /*!< Bit mask of TASKS_STOP field. */
#define TWIM_TASKS_STOP_TASKS_STOP_Trigger (1UL) /*!< Trigger task */
#define TWIM_TASKS_SUSPEND_TASKS_SUSPEND_Pos (0UL) /*!< Position of TASKS_SUSPEND field. */
#define TWIM_TASKS_SUSPEND_TASKS_SUSPEND_Msk (0x1UL << TWIM_TASKS_SUSPEND_TASKS_SUSPEND_Pos) /*!< Bit mask of TASKS_SUSPEND field. */
#define TWIM_TASKS_SUSPEND_TASKS_SUSPEND_Trigger (1UL) /*!< Trigger task */
#define TWIM_TASKS_RESUME_TASKS_RESUME_Pos (0UL) /*!< Position of TASKS_RESUME field. */
#define TWIM_TASKS_RESUME_TASKS_RESUME_Msk (0x1UL << TWIM_TASKS_RESUME_TASKS_RESUME_Pos) /*!< Bit mask of TASKS_RESUME field. */
#define TWIM_TASKS_RESUME_TASKS_RESUME_Trigger (1UL) /*!< Trigger task */
#define TWIM_EVENTS_STOPPED_EVENTS_STOPPED_Pos (0UL) /*!< Position of EVENTS_STOPPED field. */
#define TWIM_EVENTS_STOPPED_EVENTS_STOPPED_Msk (0x1UL << TWIM_EVENTS_STOPPED_EVENTS_STOPPED_Pos) /*!< Bit mask of EVENTS_STOPPED field. */
#define TWIM_EVENTS_STOPPED_EVENTS_STOPPED_NotGenerated (0UL) /*!< Event not generated */
#define TWIM_EVENTS_STOPPED_EVENTS_STOPPED_Generated (1UL) /*!< Event generated */
#define TWIM_EVENTS_ERROR_EVENTS_ERROR_Pos (0UL) /*!< Position of EVENTS_ERROR field. */
#define TWIM_EVENTS_ERROR_EVENTS_ERROR_Msk (0x1UL << TWIM_EVENTS_ERROR_EVENTS_ERROR_Pos) /*!< Bit mask of EVENTS_ERROR field. */
#define TWIM_EVENTS_ERROR_EVENTS_ERROR_NotGenerated (0UL) /*!< Event not generated */
#define TWIM_EVENTS_ERROR_EVENTS_ERROR_Generated (1UL) /*!< Event generated */
#define TWIM_EVENTS_SUSPENDED_EVENTS_SUSPENDED_Pos (0UL) /*!< Position of EVENTS_SUSPENDED field. */
#define TWIM_EVENTS_SUSPENDED_EVENTS_SUSPENDED_Msk (0x1UL << TWIM_EVENTS_SUSPENDED_EVENTS_SUSPENDED_Pos) /*!< Bit mask of EVENTS_SUSPENDED field. */
#define TWIM_EVENTS_SUSPENDED_EVENTS_SUSPENDED_NotGenerated (0UL) /*!< Event not generated */
#define TWIM_EVENTS_SUSPENDED_EVENTS_SUSPENDED_Generated (1UL) /*!< Event generated */
#define TWIM_EVENTS_RXSTARTED_EVENTS_RXSTARTED_Pos (0UL) /*!< Position of EVENTS_RXSTARTED field. */
#define TWIM_EVENTS_RXSTARTED_EVENTS_RXSTARTED_Msk (0x1UL << TWIM_EVENTS_RXSTARTED_EVENTS_RXSTARTED_Pos) /*!< Bit mask of EVENTS_RXSTARTED field. */
#define TWIM_EVENTS_RXSTARTED_EVENTS_RXSTARTED_NotGenerated (0UL) /*!< Event not generated */
#define TWIM_EVENTS_RXSTARTED_EVENTS_RXSTARTED_Generated (1UL) /*!< Event generated */
#define TWIM_EVENTS_TXSTARTED_EVENTS_TXSTARTED_Pos (0UL) /*!< Position of EVENTS_TXSTARTED field. */
#define TWIM_EVENTS_TXSTARTED_EVENTS_TXSTARTED_Msk (0x1UL << TWIM_EVENTS_TXSTARTED_EVENTS_TXSTARTED_Pos) /*!< Bit mask of EVENTS_TXSTARTED field. */
#define TWIM_EVENTS_TXSTARTED_EVENTS_TXSTARTED_NotGenerated (0UL) /*!< Event not generated */
#define TWIM_EVENTS_TXSTARTED_EVENTS_TXSTARTED_Generated (1UL) /*!< Event generated */
#define TWIM_EVENTS_LASTRX_EVENTS_LASTRX_Pos (0UL) /*!< Position of EVENTS_LASTRX field. */
#define TWIM_EVENTS_LASTRX_EVENTS_LASTRX_Msk (0x1UL << TWIM_EVENTS_LASTRX_EVENTS_LASTRX_Pos) /*!< Bit mask of EVENTS_LASTRX field. */
#define TWIM_EVENTS_LASTRX_EVENTS_LASTRX_NotGenerated (0UL) /*!< Event not generated */
#define TWIM_EVENTS_LASTRX_EVENTS_LASTRX_Generated (1UL) /*!< Event generated */
#define TWIM_EVENTS_LASTTX_EVENTS_LASTTX_Pos (0UL) /*!< Position of EVENTS_LASTTX field. */
#define TWIM_EVENTS_LASTTX_EVENTS_LASTTX_Msk (0x1UL << TWIM_EVENTS_LASTTX_EVENTS_LASTTX_Pos) /*!< Bit mask of EVENTS_LASTTX field. */
#define TWIM_EVENTS_LASTTX_EVENTS_LASTTX_NotGenerated (0UL) /*!< Event not generated */
#define TWIM_EVENTS_LASTTX_EVENTS_LASTTX_Generated (1UL) /*!< Event generated */
#define TWIM_SHORTS_LASTRX_STOP_Pos (12UL) /*!< Position of LASTRX_STOP field. */
#define TWIM_SHORTS_LASTRX_STOP_Msk (0x1UL << TWIM_SHORTS_LASTRX_STOP_Pos) /*!< Bit mask of LASTRX_STOP field. */
#define TWIM_SHORTS_LASTRX_STOP_Disabled (0UL) /*!< Disable shortcut */
#define TWIM_SHORTS_LASTRX_STOP_Enabled (1UL) /*!< Enable shortcut */
#define TWIM_SHORTS_LASTRX_SUSPEND_Pos (11UL) /*!< Position of LASTRX_SUSPEND field. */
#define TWIM_SHORTS_LASTRX_SUSPEND_Msk (0x1UL << TWIM_SHORTS_LASTRX_SUSPEND_Pos) /*!< Bit mask of LASTRX_SUSPEND field. */
#define TWIM_SHORTS_LASTRX_SUSPEND_Disabled (0UL) /*!< Disable shortcut */
#define TWIM_SHORTS_LASTRX_SUSPEND_Enabled (1UL) /*!< Enable shortcut */
#define TWIM_SHORTS_LASTRX_STARTTX_Pos (10UL) /*!< Position of LASTRX_STARTTX field. */
#define TWIM_SHORTS_LASTRX_STARTTX_Msk (0x1UL << TWIM_SHORTS_LASTRX_STARTTX_Pos) /*!< Bit mask of LASTRX_STARTTX field. */
#define TWIM_SHORTS_LASTRX_STARTTX_Disabled (0UL) /*!< Disable shortcut */
#define TWIM_SHORTS_LASTRX_STARTTX_Enabled (1UL) /*!< Enable shortcut */
#define TWIM_SHORTS_LASTTX_STOP_Pos (9UL) /*!< Position of LASTTX_STOP field. */
#define TWIM_SHORTS_LASTTX_STOP_Msk (0x1UL << TWIM_SHORTS_LASTTX_STOP_Pos) /*!< Bit mask of LASTTX_STOP field. */
#define TWIM_SHORTS_LASTTX_STOP_Disabled (0UL) /*!< Disable shortcut */
#define TWIM_SHORTS_LASTTX_STOP_Enabled (1UL) /*!< Enable shortcut */
#define TWIM_SHORTS_LASTTX_SUSPEND_Pos (8UL) /*!< Position of LASTTX_SUSPEND field. */
#define TWIM_SHORTS_LASTTX_SUSPEND_Msk (0x1UL << TWIM_SHORTS_LASTTX_SUSPEND_Pos) /*!< Bit mask of LASTTX_SUSPEND field. */
#define TWIM_SHORTS_LASTTX_SUSPEND_Disabled (0UL) /*!< Disable shortcut */
#define TWIM_SHORTS_LASTTX_SUSPEND_Enabled (1UL) /*!< Enable shortcut */
#define TWIM_SHORTS_LASTTX_STARTRX_Pos (7UL) /*!< Position of LASTTX_STARTRX field. */
#define TWIM_SHORTS_LASTTX_STARTRX_Msk (0x1UL << TWIM_SHORTS_LASTTX_STARTRX_Pos) /*!< Bit mask of LASTTX_STARTRX field. */
#define TWIM_SHORTS_LASTTX_STARTRX_Disabled (0UL) /*!< Disable shortcut */
#define TWIM_SHORTS_LASTTX_STARTRX_Enabled (1UL) /*!< Enable shortcut */
#define TWIM_INTEN_LASTTX_Pos (24UL) /*!< Position of LASTTX field. */
#define TWIM_INTEN_LASTTX_Msk (0x1UL << TWIM_INTEN_LASTTX_Pos) /*!< Bit mask of LASTTX field. */
#define TWIM_INTEN_LASTTX_Disabled (0UL) /*!< Disable */
#define TWIM_INTEN_LASTTX_Enabled (1UL) /*!< Enable */
#define TWIM_INTEN_LASTRX_Pos (23UL) /*!< Position of LASTRX field. */
#define TWIM_INTEN_LASTRX_Msk (0x1UL << TWIM_INTEN_LASTRX_Pos) /*!< Bit mask of LASTRX field. */
#define TWIM_INTEN_LASTRX_Disabled (0UL) /*!< Disable */
#define TWIM_INTEN_LASTRX_Enabled (1UL) /*!< Enable */
#define TWIM_INTEN_TXSTARTED_Pos (20UL) /*!< Position of TXSTARTED field. */
#define TWIM_INTEN_TXSTARTED_Msk (0x1UL << TWIM_INTEN_TXSTARTED_Pos) /*!< Bit mask of TXSTARTED field. */
#define TWIM_INTEN_TXSTARTED_Disabled (0UL) /*!< Disable */
#define TWIM_INTEN_TXSTARTED_Enabled (1UL) /*!< Enable */
#define TWIM_INTEN_RXSTARTED_Pos (19UL) /*!< Position of RXSTARTED field. */
#define TWIM_INTEN_RXSTARTED_Msk (0x1UL << TWIM_INTEN_RXSTARTED_Pos) /*!< Bit mask of RXSTARTED field. */
#define TWIM_INTEN_RXSTARTED_Disabled (0UL) /*!< Disable */
#define TWIM_INTEN_RXSTARTED_Enabled (1UL) /*!< Enable */
#define TWIM_INTEN_SUSPENDED_Pos (18UL) /*!< Position of SUSPENDED field. */
#define TWIM_INTEN_SUSPENDED_Msk (0x1UL << TWIM_INTEN_SUSPENDED_Pos) /*!< Bit mask of SUSPENDED field. */
#define TWIM_INTEN_SUSPENDED_Disabled (0UL) /*!< Disable */
#define TWIM_INTEN_SUSPENDED_Enabled (1UL) /*!< Enable */
#define TWIM_INTEN_ERROR_Pos (9UL) /*!< Position of ERROR field. */
#define TWIM_INTEN_ERROR_Msk (0x1UL << TWIM_INTEN_ERROR_Pos) /*!< Bit mask of ERROR field. */
#define TWIM_INTEN_ERROR_Disabled (0UL) /*!< Disable */
#define TWIM_INTEN_ERROR_Enabled (1UL) /*!< Enable */
#define TWIM_INTEN_STOPPED_Pos (1UL) /*!< Position of STOPPED field. */
#define TWIM_INTEN_STOPPED_Msk (0x1UL << TWIM_INTEN_STOPPED_Pos) /*!< Bit mask of STOPPED field. */
#define TWIM_INTEN_STOPPED_Disabled (0UL) /*!< Disable */
#define TWIM_INTEN_STOPPED_Enabled (1UL) /*!< Enable */
#define TWIM_INTENSET_LASTTX_Pos (24UL) /*!< Position of LASTTX field. */
#define TWIM_INTENSET_LASTTX_Msk (0x1UL << TWIM_INTENSET_LASTTX_Pos) /*!< Bit mask of LASTTX field. */
#define TWIM_INTENSET_LASTTX_Disabled (0UL) /*!< Read: Disabled */
#define TWIM_INTENSET_LASTTX_Enabled (1UL) /*!< Read: Enabled */
#define TWIM_INTENSET_LASTTX_Set (1UL) /*!< Enable */
#define TWIM_INTENSET_LASTRX_Pos (23UL) /*!< Position of LASTRX field. */
#define TWIM_INTENSET_LASTRX_Msk (0x1UL << TWIM_INTENSET_LASTRX_Pos) /*!< Bit mask of LASTRX field. */
#define TWIM_INTENSET_LASTRX_Disabled (0UL) /*!< Read: Disabled */
#define TWIM_INTENSET_LASTRX_Enabled (1UL) /*!< Read: Enabled */
#define TWIM_INTENSET_LASTRX_Set (1UL) /*!< Enable */
#define TWIM_INTENSET_TXSTARTED_Pos (20UL) /*!< Position of TXSTARTED field. */
#define TWIM_INTENSET_TXSTARTED_Msk (0x1UL << TWIM_INTENSET_TXSTARTED_Pos) /*!< Bit mask of TXSTARTED field. */
#define TWIM_INTENSET_TXSTARTED_Disabled (0UL) /*!< Read: Disabled */
#define TWIM_INTENSET_TXSTARTED_Enabled (1UL) /*!< Read: Enabled */
#define TWIM_INTENSET_TXSTARTED_Set (1UL) /*!< Enable */
#define TWIM_INTENSET_RXSTARTED_Pos (19UL) /*!< Position of RXSTARTED field. */
#define TWIM_INTENSET_RXSTARTED_Msk (0x1UL << TWIM_INTENSET_RXSTARTED_Pos) /*!< Bit mask of RXSTARTED field. */
#define TWIM_INTENSET_RXSTARTED_Disabled (0UL) /*!< Read: Disabled */
#define TWIM_INTENSET_RXSTARTED_Enabled (1UL) /*!< Read: Enabled */
#define TWIM_INTENSET_RXSTARTED_Set (1UL) /*!< Enable */
#define TWIM_INTENSET_SUSPENDED_Pos (18UL) /*!< Position of SUSPENDED field. */
#define TWIM_INTENSET_SUSPENDED_Msk (0x1UL << TWIM_INTENSET_SUSPENDED_Pos) /*!< Bit mask of SUSPENDED field. */
#define TWIM_INTENSET_SUSPENDED_Disabled (0UL) /*!< Read: Disabled */
#define TWIM_INTENSET_SUSPENDED_Enabled (1UL) /*!< Read: Enabled */
#define TWIM_INTENSET_SUSPENDED_Set (1UL) /*!< Enable */
#define TWIM_INTENSET_ERROR_Pos (9UL) /*!< Position of ERROR field. */
#define TWIM_INTENSET_ERROR_Msk (0x1UL << TWIM_INTENSET_ERROR_Pos) /*!< Bit mask of ERROR field. */
#define TWIM_INTENSET_ERROR_Disabled (0UL) /*!< Read: Disabled */
#define TWIM_INTENSET_ERROR_Enabled (1UL) /*!< Read: Enabled */
#define TWIM_INTENSET_ERROR_Set (1UL) /*!< Enable */
#define TWIM_INTENSET_STOPPED_Pos (1UL) /*!< Position of STOPPED field. */
#define TWIM_INTENSET_STOPPED_Msk (0x1UL << TWIM_INTENSET_STOPPED_Pos) /*!< Bit mask of STOPPED field. */
#define TWIM_INTENSET_STOPPED_Disabled (0UL) /*!< Read: Disabled */
#define TWIM_INTENSET_STOPPED_Enabled (1UL) /*!< Read: Enabled */
#define TWIM_INTENSET_STOPPED_Set (1UL) /*!< Enable */
#define TWIM_INTENCLR_LASTTX_Pos (24UL) /*!< Position of LASTTX field. */
#define TWIM_INTENCLR_LASTTX_Msk (0x1UL << TWIM_INTENCLR_LASTTX_Pos) /*!< Bit mask of LASTTX field. */
#define TWIM_INTENCLR_LASTTX_Disabled (0UL) /*!< Read: Disabled */
#define TWIM_INTENCLR_LASTTX_Enabled (1UL) /*!< Read: Enabled */
#define TWIM_INTENCLR_LASTTX_Clear (1UL) /*!< Disable */
#define TWIM_INTENCLR_LASTRX_Pos (23UL) /*!< Position of LASTRX field. */
#define TWIM_INTENCLR_LASTRX_Msk (0x1UL << TWIM_INTENCLR_LASTRX_Pos) /*!< Bit mask of LASTRX field. */
#define TWIM_INTENCLR_LASTRX_Disabled (0UL) /*!< Read: Disabled */
#define TWIM_INTENCLR_LASTRX_Enabled (1UL) /*!< Read: Enabled */
#define TWIM_INTENCLR_LASTRX_Clear (1UL) /*!< Disable */
#define TWIM_INTENCLR_TXSTARTED_Pos (20UL) /*!< Position of TXSTARTED field. */
#define TWIM_INTENCLR_TXSTARTED_Msk (0x1UL << TWIM_INTENCLR_TXSTARTED_Pos) /*!< Bit mask of TXSTARTED field. */
#define TWIM_INTENCLR_TXSTARTED_Disabled (0UL) /*!< Read: Disabled */
#define TWIM_INTENCLR_TXSTARTED_Enabled (1UL) /*!< Read: Enabled */
#define TWIM_INTENCLR_TXSTARTED_Clear (1UL) /*!< Disable */
#define TWIM_INTENCLR_RXSTARTED_Pos (19UL) /*!< Position of RXSTARTED field. */
#define TWIM_INTENCLR_RXSTARTED_Msk (0x1UL << TWIM_INTENCLR_RXSTARTED_Pos) /*!< Bit mask of RXSTARTED field. */
#define TWIM_INTENCLR_RXSTARTED_Disabled (0UL) /*!< Read: Disabled */
#define TWIM_INTENCLR_RXSTARTED_Enabled (1UL) /*!< Read: Enabled */
#define TWIM_INTENCLR_RXSTARTED_Clear (1UL) /*!< Disable */
#define TWIM_INTENCLR_SUSPENDED_Pos (18UL) /*!< Position of SUSPENDED field. */
#define TWIM_INTENCLR_SUSPENDED_Msk (0x1UL << TWIM_INTENCLR_SUSPENDED_Pos) /*!< Bit mask of SUSPENDED field. */
#define TWIM_INTENCLR_SUSPENDED_Disabled (0UL) /*!< Read: Disabled */
#define TWIM_INTENCLR_SUSPENDED_Enabled (1UL) /*!< Read: Enabled */
#define TWIM_INTENCLR_SUSPENDED_Clear (1UL) /*!< Disable */
#define TWIM_INTENCLR_ERROR_Pos (9UL) /*!< Position of ERROR field. */
#define TWIM_INTENCLR_ERROR_Msk (0x1UL << TWIM_INTENCLR_ERROR_Pos) /*!< Bit mask of ERROR field. */
#define TWIM_INTENCLR_ERROR_Disabled (0UL) /*!< Read: Disabled */
#define TWIM_INTENCLR_ERROR_Enabled (1UL) /*!< Read: Enabled */
#define TWIM_INTENCLR_ERROR_Clear (1UL) /*!< Disable */
#define TWIM_INTENCLR_STOPPED_Pos (1UL) /*!< Position of STOPPED field. */
#define TWIM_INTENCLR_STOPPED_Msk (0x1UL << TWIM_INTENCLR_STOPPED_Pos) /*!< Bit mask of STOPPED field. */
#define TWIM_INTENCLR_STOPPED_Disabled (0UL) /*!< Read: Disabled */
#define TWIM_INTENCLR_STOPPED_Enabled (1UL) /*!< Read: Enabled */
#define TWIM_INTENCLR_STOPPED_Clear (1UL) /*!< Disable */
#define TWIM_ERRORSRC_DNACK_Pos (2UL) /*!< Position of DNACK field. */
#define TWIM_ERRORSRC_DNACK_Msk (0x1UL << TWIM_ERRORSRC_DNACK_Pos) /*!< Bit mask of DNACK field. */
#define TWIM_ERRORSRC_DNACK_NotReceived (0UL) /*!< Error did not occur */
#define TWIM_ERRORSRC_DNACK_Received (1UL) /*!< Error occurred */
#define TWIM_ERRORSRC_ANACK_Pos (1UL) /*!< Position of ANACK field. */
#define TWIM_ERRORSRC_ANACK_Msk (0x1UL << TWIM_ERRORSRC_ANACK_Pos) /*!< Bit mask of ANACK field. */
#define TWIM_ERRORSRC_ANACK_NotReceived (0UL) /*!< Error did not occur */
#define TWIM_ERRORSRC_ANACK_Received (1UL) /*!< Error occurred */
#define TWIM_ERRORSRC_OVERRUN_Pos (0UL) /*!< Position of OVERRUN field. */
#define TWIM_ERRORSRC_OVERRUN_Msk (0x1UL << TWIM_ERRORSRC_OVERRUN_Pos) /*!< Bit mask of OVERRUN field. */
#define TWIM_ERRORSRC_OVERRUN_NotReceived (0UL) /*!< Error did not occur */
#define TWIM_ERRORSRC_OVERRUN_Received (1UL) /*!< Error occurred */
#define TWIM_ENABLE_ENABLE_Pos (0UL) /*!< Position of ENABLE field. */
#define TWIM_ENABLE_ENABLE_Msk (0xFUL << TWIM_ENABLE_ENABLE_Pos) /*!< Bit mask of ENABLE field. */
#define TWIM_ENABLE_ENABLE_Disabled (0UL) /*!< Disable TWIM */
#define TWIM_ENABLE_ENABLE_Enabled (6UL) /*!< Enable TWIM */
#define TWIM_PSEL_SCL_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define TWIM_PSEL_SCL_CONNECT_Msk (0x1UL << TWIM_PSEL_SCL_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define TWIM_PSEL_SCL_CONNECT_Connected (0UL) /*!< Connect */
#define TWIM_PSEL_SCL_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define TWIM_PSEL_SCL_PORT_Pos (5UL) /*!< Position of PORT field. */
#define TWIM_PSEL_SCL_PORT_Msk (0x1UL << TWIM_PSEL_SCL_PORT_Pos) /*!< Bit mask of PORT field. */
#define TWIM_PSEL_SCL_PIN_Pos (0UL) /*!< Position of PIN field. */
#define TWIM_PSEL_SCL_PIN_Msk (0x1FUL << TWIM_PSEL_SCL_PIN_Pos) /*!< Bit mask of PIN field. */
#define TWIM_PSEL_SDA_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define TWIM_PSEL_SDA_CONNECT_Msk (0x1UL << TWIM_PSEL_SDA_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define TWIM_PSEL_SDA_CONNECT_Connected (0UL) /*!< Connect */
#define TWIM_PSEL_SDA_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define TWIM_PSEL_SDA_PORT_Pos (5UL) /*!< Position of PORT field. */
#define TWIM_PSEL_SDA_PORT_Msk (0x1UL << TWIM_PSEL_SDA_PORT_Pos) /*!< Bit mask of PORT field. */
#define TWIM_PSEL_SDA_PIN_Pos (0UL) /*!< Position of PIN field. */
#define TWIM_PSEL_SDA_PIN_Msk (0x1FUL << TWIM_PSEL_SDA_PIN_Pos) /*!< Bit mask of PIN field. */
#define TWIM_FREQUENCY_FREQUENCY_Pos (0UL) /*!< Position of FREQUENCY field. */
#define TWIM_FREQUENCY_FREQUENCY_Msk (0xFFFFFFFFUL << TWIM_FREQUENCY_FREQUENCY_Pos) /*!< Bit mask of FREQUENCY field. */
#define TWIM_FREQUENCY_FREQUENCY_K100 (0x01980000UL) /*!< 100 kbps */
#define TWIM_FREQUENCY_FREQUENCY_K250 (0x04000000UL) /*!< 250 kbps */
#define TWIM_FREQUENCY_FREQUENCY_K400 (0x06400000UL) /*!< 400 kbps */
#define TWIM_RXD_PTR_PTR_Pos (0UL) /*!< Position of PTR field. */
#define TWIM_RXD_PTR_PTR_Msk (0xFFFFFFFFUL << TWIM_RXD_PTR_PTR_Pos) /*!< Bit mask of PTR field. */
#define TWIM_RXD_MAXCNT_MAXCNT_Pos (0UL) /*!< Position of MAXCNT field. */
#define TWIM_RXD_MAXCNT_MAXCNT_Msk (0xFFFFUL << TWIM_RXD_MAXCNT_MAXCNT_Pos) /*!< Bit mask of MAXCNT field. */
#define TWIM_RXD_AMOUNT_AMOUNT_Pos (0UL) /*!< Position of AMOUNT field. */
#define TWIM_RXD_AMOUNT_AMOUNT_Msk (0xFFFFUL << TWIM_RXD_AMOUNT_AMOUNT_Pos) /*!< Bit mask of AMOUNT field. */
#define TWIM_RXD_LIST_LIST_Pos (0UL) /*!< Position of LIST field. */
#define TWIM_RXD_LIST_LIST_Msk (0x7UL << TWIM_RXD_LIST_LIST_Pos) /*!< Bit mask of LIST field. */
#define TWIM_RXD_LIST_LIST_Disabled (0UL) /*!< Disable EasyDMA list */
#define TWIM_RXD_LIST_LIST_ArrayList (1UL) /*!< Use array list */
#define TWIM_TXD_PTR_PTR_Pos (0UL) /*!< Position of PTR field. */
#define TWIM_TXD_PTR_PTR_Msk (0xFFFFFFFFUL << TWIM_TXD_PTR_PTR_Pos) /*!< Bit mask of PTR field. */
#define TWIM_TXD_MAXCNT_MAXCNT_Pos (0UL) /*!< Position of MAXCNT field. */
#define TWIM_TXD_MAXCNT_MAXCNT_Msk (0xFFFFUL << TWIM_TXD_MAXCNT_MAXCNT_Pos) /*!< Bit mask of MAXCNT field. */
#define TWIM_TXD_AMOUNT_AMOUNT_Pos (0UL) /*!< Position of AMOUNT field. */
#define TWIM_TXD_AMOUNT_AMOUNT_Msk (0xFFFFUL << TWIM_TXD_AMOUNT_AMOUNT_Pos) /*!< Bit mask of AMOUNT field. */
#define TWIM_TXD_LIST_LIST_Pos (0UL) /*!< Position of LIST field. */
#define TWIM_TXD_LIST_LIST_Msk (0x7UL << TWIM_TXD_LIST_LIST_Pos) /*!< Bit mask of LIST field. */
#define TWIM_TXD_LIST_LIST_Disabled (0UL) /*!< Disable EasyDMA list */
#define TWIM_TXD_LIST_LIST_ArrayList (1UL) /*!< Use array list */
#define TWIM_ADDRESS_ADDRESS_Pos (0UL) /*!< Position of ADDRESS field. */
#define TWIM_ADDRESS_ADDRESS_Msk (0x7FUL << TWIM_ADDRESS_ADDRESS_Pos) /*!< Bit mask of ADDRESS field. */
#define UART_TASKS_STARTRX_TASKS_STARTRX_Pos (0UL) /*!< Position of TASKS_STARTRX field. */
#define UART_TASKS_STARTRX_TASKS_STARTRX_Msk (0x1UL << UART_TASKS_STARTRX_TASKS_STARTRX_Pos) /*!< Bit mask of TASKS_STARTRX field. */
#define UART_TASKS_STARTRX_TASKS_STARTRX_Trigger (1UL) /*!< Trigger task */
#define UART_TASKS_STOPRX_TASKS_STOPRX_Pos (0UL) /*!< Position of TASKS_STOPRX field. */
#define UART_TASKS_STOPRX_TASKS_STOPRX_Msk (0x1UL << UART_TASKS_STOPRX_TASKS_STOPRX_Pos) /*!< Bit mask of TASKS_STOPRX field. */
#define UART_TASKS_STOPRX_TASKS_STOPRX_Trigger (1UL) /*!< Trigger task */
#define UART_TASKS_STARTTX_TASKS_STARTTX_Pos (0UL) /*!< Position of TASKS_STARTTX field. */
#define UART_TASKS_STARTTX_TASKS_STARTTX_Msk (0x1UL << UART_TASKS_STARTTX_TASKS_STARTTX_Pos) /*!< Bit mask of TASKS_STARTTX field. */
#define UART_TASKS_STARTTX_TASKS_STARTTX_Trigger (1UL) /*!< Trigger task */
#define UART_TASKS_STOPTX_TASKS_STOPTX_Pos (0UL) /*!< Position of TASKS_STOPTX field. */
#define UART_TASKS_STOPTX_TASKS_STOPTX_Msk (0x1UL << UART_TASKS_STOPTX_TASKS_STOPTX_Pos) /*!< Bit mask of TASKS_STOPTX field. */
#define UART_TASKS_STOPTX_TASKS_STOPTX_Trigger (1UL) /*!< Trigger task */
#define UART_TASKS_SUSPEND_TASKS_SUSPEND_Pos (0UL) /*!< Position of TASKS_SUSPEND field. */
#define UART_TASKS_SUSPEND_TASKS_SUSPEND_Msk (0x1UL << UART_TASKS_SUSPEND_TASKS_SUSPEND_Pos) /*!< Bit mask of TASKS_SUSPEND field. */
#define UART_TASKS_SUSPEND_TASKS_SUSPEND_Trigger (1UL) /*!< Trigger task */
#define UART_EVENTS_CTS_EVENTS_CTS_Pos (0UL) /*!< Position of EVENTS_CTS field. */
#define UART_EVENTS_CTS_EVENTS_CTS_Msk (0x1UL << UART_EVENTS_CTS_EVENTS_CTS_Pos) /*!< Bit mask of EVENTS_CTS field. */
#define UART_EVENTS_CTS_EVENTS_CTS_NotGenerated (0UL) /*!< Event not generated */
#define UART_EVENTS_CTS_EVENTS_CTS_Generated (1UL) /*!< Event generated */
#define UART_EVENTS_NCTS_EVENTS_NCTS_Pos (0UL) /*!< Position of EVENTS_NCTS field. */
#define UART_EVENTS_NCTS_EVENTS_NCTS_Msk (0x1UL << UART_EVENTS_NCTS_EVENTS_NCTS_Pos) /*!< Bit mask of EVENTS_NCTS field. */
#define UART_EVENTS_NCTS_EVENTS_NCTS_NotGenerated (0UL) /*!< Event not generated */
#define UART_EVENTS_NCTS_EVENTS_NCTS_Generated (1UL) /*!< Event generated */
#define UART_EVENTS_RXDRDY_EVENTS_RXDRDY_Pos (0UL) /*!< Position of EVENTS_RXDRDY field. */
#define UART_EVENTS_RXDRDY_EVENTS_RXDRDY_Msk (0x1UL << UART_EVENTS_RXDRDY_EVENTS_RXDRDY_Pos) /*!< Bit mask of EVENTS_RXDRDY field. */
#define UART_EVENTS_RXDRDY_EVENTS_RXDRDY_NotGenerated (0UL) /*!< Event not generated */
#define UART_EVENTS_RXDRDY_EVENTS_RXDRDY_Generated (1UL) /*!< Event generated */
#define UART_EVENTS_TXDRDY_EVENTS_TXDRDY_Pos (0UL) /*!< Position of EVENTS_TXDRDY field. */
#define UART_EVENTS_TXDRDY_EVENTS_TXDRDY_Msk (0x1UL << UART_EVENTS_TXDRDY_EVENTS_TXDRDY_Pos) /*!< Bit mask of EVENTS_TXDRDY field. */
#define UART_EVENTS_TXDRDY_EVENTS_TXDRDY_NotGenerated (0UL) /*!< Event not generated */
#define UART_EVENTS_TXDRDY_EVENTS_TXDRDY_Generated (1UL) /*!< Event generated */
#define UART_EVENTS_ERROR_EVENTS_ERROR_Pos (0UL) /*!< Position of EVENTS_ERROR field. */
#define UART_EVENTS_ERROR_EVENTS_ERROR_Msk (0x1UL << UART_EVENTS_ERROR_EVENTS_ERROR_Pos) /*!< Bit mask of EVENTS_ERROR field. */
#define UART_EVENTS_ERROR_EVENTS_ERROR_NotGenerated (0UL) /*!< Event not generated */
#define UART_EVENTS_ERROR_EVENTS_ERROR_Generated (1UL) /*!< Event generated */
#define UART_EVENTS_RXTO_EVENTS_RXTO_Pos (0UL) /*!< Position of EVENTS_RXTO field. */
#define UART_EVENTS_RXTO_EVENTS_RXTO_Msk (0x1UL << UART_EVENTS_RXTO_EVENTS_RXTO_Pos) /*!< Bit mask of EVENTS_RXTO field. */
#define UART_EVENTS_RXTO_EVENTS_RXTO_NotGenerated (0UL) /*!< Event not generated */
#define UART_EVENTS_RXTO_EVENTS_RXTO_Generated (1UL) /*!< Event generated */
#define UART_SHORTS_NCTS_STOPRX_Pos (4UL) /*!< Position of NCTS_STOPRX field. */
#define UART_SHORTS_NCTS_STOPRX_Msk (0x1UL << UART_SHORTS_NCTS_STOPRX_Pos) /*!< Bit mask of NCTS_STOPRX field. */
#define UART_SHORTS_NCTS_STOPRX_Disabled (0UL) /*!< Disable shortcut */
#define UART_SHORTS_NCTS_STOPRX_Enabled (1UL) /*!< Enable shortcut */
#define UART_SHORTS_CTS_STARTRX_Pos (3UL) /*!< Position of CTS_STARTRX field. */
#define UART_SHORTS_CTS_STARTRX_Msk (0x1UL << UART_SHORTS_CTS_STARTRX_Pos) /*!< Bit mask of CTS_STARTRX field. */
#define UART_SHORTS_CTS_STARTRX_Disabled (0UL) /*!< Disable shortcut */
#define UART_SHORTS_CTS_STARTRX_Enabled (1UL) /*!< Enable shortcut */
#define UART_INTENSET_RXTO_Pos (17UL) /*!< Position of RXTO field. */
#define UART_INTENSET_RXTO_Msk (0x1UL << UART_INTENSET_RXTO_Pos) /*!< Bit mask of RXTO field. */
#define UART_INTENSET_RXTO_Disabled (0UL) /*!< Read: Disabled */
#define UART_INTENSET_RXTO_Enabled (1UL) /*!< Read: Enabled */
#define UART_INTENSET_RXTO_Set (1UL) /*!< Enable */
#define UART_INTENSET_ERROR_Pos (9UL) /*!< Position of ERROR field. */
#define UART_INTENSET_ERROR_Msk (0x1UL << UART_INTENSET_ERROR_Pos) /*!< Bit mask of ERROR field. */
#define UART_INTENSET_ERROR_Disabled (0UL) /*!< Read: Disabled */
#define UART_INTENSET_ERROR_Enabled (1UL) /*!< Read: Enabled */
#define UART_INTENSET_ERROR_Set (1UL) /*!< Enable */
#define UART_INTENSET_TXDRDY_Pos (7UL) /*!< Position of TXDRDY field. */
#define UART_INTENSET_TXDRDY_Msk (0x1UL << UART_INTENSET_TXDRDY_Pos) /*!< Bit mask of TXDRDY field. */
#define UART_INTENSET_TXDRDY_Disabled (0UL) /*!< Read: Disabled */
#define UART_INTENSET_TXDRDY_Enabled (1UL) /*!< Read: Enabled */
#define UART_INTENSET_TXDRDY_Set (1UL) /*!< Enable */
#define UART_INTENSET_RXDRDY_Pos (2UL) /*!< Position of RXDRDY field. */
#define UART_INTENSET_RXDRDY_Msk (0x1UL << UART_INTENSET_RXDRDY_Pos) /*!< Bit mask of RXDRDY field. */
#define UART_INTENSET_RXDRDY_Disabled (0UL) /*!< Read: Disabled */
#define UART_INTENSET_RXDRDY_Enabled (1UL) /*!< Read: Enabled */
#define UART_INTENSET_RXDRDY_Set (1UL) /*!< Enable */
#define UART_INTENSET_NCTS_Pos (1UL) /*!< Position of NCTS field. */
#define UART_INTENSET_NCTS_Msk (0x1UL << UART_INTENSET_NCTS_Pos) /*!< Bit mask of NCTS field. */
#define UART_INTENSET_NCTS_Disabled (0UL) /*!< Read: Disabled */
#define UART_INTENSET_NCTS_Enabled (1UL) /*!< Read: Enabled */
#define UART_INTENSET_NCTS_Set (1UL) /*!< Enable */
#define UART_INTENSET_CTS_Pos (0UL) /*!< Position of CTS field. */
#define UART_INTENSET_CTS_Msk (0x1UL << UART_INTENSET_CTS_Pos) /*!< Bit mask of CTS field. */
#define UART_INTENSET_CTS_Disabled (0UL) /*!< Read: Disabled */
#define UART_INTENSET_CTS_Enabled (1UL) /*!< Read: Enabled */
#define UART_INTENSET_CTS_Set (1UL) /*!< Enable */
#define UART_INTENCLR_RXTO_Pos (17UL) /*!< Position of RXTO field. */
#define UART_INTENCLR_RXTO_Msk (0x1UL << UART_INTENCLR_RXTO_Pos) /*!< Bit mask of RXTO field. */
#define UART_INTENCLR_RXTO_Disabled (0UL) /*!< Read: Disabled */
#define UART_INTENCLR_RXTO_Enabled (1UL) /*!< Read: Enabled */
#define UART_INTENCLR_RXTO_Clear (1UL) /*!< Disable */
#define UART_INTENCLR_ERROR_Pos (9UL) /*!< Position of ERROR field. */
#define UART_INTENCLR_ERROR_Msk (0x1UL << UART_INTENCLR_ERROR_Pos) /*!< Bit mask of ERROR field. */
#define UART_INTENCLR_ERROR_Disabled (0UL) /*!< Read: Disabled */
#define UART_INTENCLR_ERROR_Enabled (1UL) /*!< Read: Enabled */
#define UART_INTENCLR_ERROR_Clear (1UL) /*!< Disable */
#define UART_INTENCLR_TXDRDY_Pos (7UL) /*!< Position of TXDRDY field. */
#define UART_INTENCLR_TXDRDY_Msk (0x1UL << UART_INTENCLR_TXDRDY_Pos) /*!< Bit mask of TXDRDY field. */
#define UART_INTENCLR_TXDRDY_Disabled (0UL) /*!< Read: Disabled */
#define UART_INTENCLR_TXDRDY_Enabled (1UL) /*!< Read: Enabled */
#define UART_INTENCLR_TXDRDY_Clear (1UL) /*!< Disable */
#define UART_INTENCLR_RXDRDY_Pos (2UL) /*!< Position of RXDRDY field. */
#define UART_INTENCLR_RXDRDY_Msk (0x1UL << UART_INTENCLR_RXDRDY_Pos) /*!< Bit mask of RXDRDY field. */
#define UART_INTENCLR_RXDRDY_Disabled (0UL) /*!< Read: Disabled */
#define UART_INTENCLR_RXDRDY_Enabled (1UL) /*!< Read: Enabled */
#define UART_INTENCLR_RXDRDY_Clear (1UL) /*!< Disable */
#define UART_INTENCLR_NCTS_Pos (1UL) /*!< Position of NCTS field. */
#define UART_INTENCLR_NCTS_Msk (0x1UL << UART_INTENCLR_NCTS_Pos) /*!< Bit mask of NCTS field. */
#define UART_INTENCLR_NCTS_Disabled (0UL) /*!< Read: Disabled */
#define UART_INTENCLR_NCTS_Enabled (1UL) /*!< Read: Enabled */
#define UART_INTENCLR_NCTS_Clear (1UL) /*!< Disable */
#define UART_INTENCLR_CTS_Pos (0UL) /*!< Position of CTS field. */
#define UART_INTENCLR_CTS_Msk (0x1UL << UART_INTENCLR_CTS_Pos) /*!< Bit mask of CTS field. */
#define UART_INTENCLR_CTS_Disabled (0UL) /*!< Read: Disabled */
#define UART_INTENCLR_CTS_Enabled (1UL) /*!< Read: Enabled */
#define UART_INTENCLR_CTS_Clear (1UL) /*!< Disable */
#define UART_ERRORSRC_BREAK_Pos (3UL) /*!< Position of BREAK field. */
#define UART_ERRORSRC_BREAK_Msk (0x1UL << UART_ERRORSRC_BREAK_Pos) /*!< Bit mask of BREAK field. */
#define UART_ERRORSRC_BREAK_NotPresent (0UL) /*!< Read: error not present */
#define UART_ERRORSRC_BREAK_Present (1UL) /*!< Read: error present */
#define UART_ERRORSRC_FRAMING_Pos (2UL) /*!< Position of FRAMING field. */
#define UART_ERRORSRC_FRAMING_Msk (0x1UL << UART_ERRORSRC_FRAMING_Pos) /*!< Bit mask of FRAMING field. */
#define UART_ERRORSRC_FRAMING_NotPresent (0UL) /*!< Read: error not present */
#define UART_ERRORSRC_FRAMING_Present (1UL) /*!< Read: error present */
#define UART_ERRORSRC_PARITY_Pos (1UL) /*!< Position of PARITY field. */
#define UART_ERRORSRC_PARITY_Msk (0x1UL << UART_ERRORSRC_PARITY_Pos) /*!< Bit mask of PARITY field. */
#define UART_ERRORSRC_PARITY_NotPresent (0UL) /*!< Read: error not present */
#define UART_ERRORSRC_PARITY_Present (1UL) /*!< Read: error present */
#define UART_ERRORSRC_OVERRUN_Pos (0UL) /*!< Position of OVERRUN field. */
#define UART_ERRORSRC_OVERRUN_Msk (0x1UL << UART_ERRORSRC_OVERRUN_Pos) /*!< Bit mask of OVERRUN field. */
#define UART_ERRORSRC_OVERRUN_NotPresent (0UL) /*!< Read: error not present */
#define UART_ERRORSRC_OVERRUN_Present (1UL) /*!< Read: error present */
#define UART_ENABLE_ENABLE_Pos (0UL) /*!< Position of ENABLE field. */
#define UART_ENABLE_ENABLE_Msk (0xFUL << UART_ENABLE_ENABLE_Pos) /*!< Bit mask of ENABLE field. */
#define UART_ENABLE_ENABLE_Disabled (0UL) /*!< Disable UART */
#define UART_ENABLE_ENABLE_Enabled (4UL) /*!< Enable UART */
#define UART_PSEL_RTS_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define UART_PSEL_RTS_CONNECT_Msk (0x1UL << UART_PSEL_RTS_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define UART_PSEL_RTS_CONNECT_Connected (0UL) /*!< Connect */
#define UART_PSEL_RTS_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define UART_PSEL_RTS_PORT_Pos (5UL) /*!< Position of PORT field. */
#define UART_PSEL_RTS_PORT_Msk (0x1UL << UART_PSEL_RTS_PORT_Pos) /*!< Bit mask of PORT field. */
#define UART_PSEL_RTS_PIN_Pos (0UL) /*!< Position of PIN field. */
#define UART_PSEL_RTS_PIN_Msk (0x1FUL << UART_PSEL_RTS_PIN_Pos) /*!< Bit mask of PIN field. */
#define UART_PSEL_TXD_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define UART_PSEL_TXD_CONNECT_Msk (0x1UL << UART_PSEL_TXD_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define UART_PSEL_TXD_CONNECT_Connected (0UL) /*!< Connect */
#define UART_PSEL_TXD_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define UART_PSEL_TXD_PORT_Pos (5UL) /*!< Position of PORT field. */
#define UART_PSEL_TXD_PORT_Msk (0x1UL << UART_PSEL_TXD_PORT_Pos) /*!< Bit mask of PORT field. */
#define UART_PSEL_TXD_PIN_Pos (0UL) /*!< Position of PIN field. */
#define UART_PSEL_TXD_PIN_Msk (0x1FUL << UART_PSEL_TXD_PIN_Pos) /*!< Bit mask of PIN field. */
#define UART_PSEL_CTS_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define UART_PSEL_CTS_CONNECT_Msk (0x1UL << UART_PSEL_CTS_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define UART_PSEL_CTS_CONNECT_Connected (0UL) /*!< Connect */
#define UART_PSEL_CTS_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define UART_PSEL_CTS_PORT_Pos (5UL) /*!< Position of PORT field. */
#define UART_PSEL_CTS_PORT_Msk (0x1UL << UART_PSEL_CTS_PORT_Pos) /*!< Bit mask of PORT field. */
#define UART_PSEL_CTS_PIN_Pos (0UL) /*!< Position of PIN field. */
#define UART_PSEL_CTS_PIN_Msk (0x1FUL << UART_PSEL_CTS_PIN_Pos) /*!< Bit mask of PIN field. */
#define UART_PSEL_RXD_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define UART_PSEL_RXD_CONNECT_Msk (0x1UL << UART_PSEL_RXD_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define UART_PSEL_RXD_CONNECT_Connected (0UL) /*!< Connect */
#define UART_PSEL_RXD_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define UART_PSEL_RXD_PORT_Pos (5UL) /*!< Position of PORT field. */
#define UART_PSEL_RXD_PORT_Msk (0x1UL << UART_PSEL_RXD_PORT_Pos) /*!< Bit mask of PORT field. */
#define UART_PSEL_RXD_PIN_Pos (0UL) /*!< Position of PIN field. */
#define UART_PSEL_RXD_PIN_Msk (0x1FUL << UART_PSEL_RXD_PIN_Pos) /*!< Bit mask of PIN field. */
#define UART_RXD_RXD_Pos (0UL) /*!< Position of RXD field. */
#define UART_RXD_RXD_Msk (0xFFUL << UART_RXD_RXD_Pos) /*!< Bit mask of RXD field. */
#define UART_TXD_TXD_Pos (0UL) /*!< Position of TXD field. */
#define UART_TXD_TXD_Msk (0xFFUL << UART_TXD_TXD_Pos) /*!< Bit mask of TXD field. */
#define UART_BAUDRATE_BAUDRATE_Pos (0UL) /*!< Position of BAUDRATE field. */
#define UART_BAUDRATE_BAUDRATE_Msk (0xFFFFFFFFUL << UART_BAUDRATE_BAUDRATE_Pos) /*!< Bit mask of BAUDRATE field. */
#define UART_BAUDRATE_BAUDRATE_Baud1200 (0x0004F000UL) /*!< 1200 baud (actual rate: 1205) */
#define UART_BAUDRATE_BAUDRATE_Baud2400 (0x0009D000UL) /*!< 2400 baud (actual rate: 2396) */
#define UART_BAUDRATE_BAUDRATE_Baud4800 (0x0013B000UL) /*!< 4800 baud (actual rate: 4808) */
#define UART_BAUDRATE_BAUDRATE_Baud9600 (0x00275000UL) /*!< 9600 baud (actual rate: 9598) */
#define UART_BAUDRATE_BAUDRATE_Baud14400 (0x003B0000UL) /*!< 14400 baud (actual rate: 14414) */
#define UART_BAUDRATE_BAUDRATE_Baud19200 (0x004EA000UL) /*!< 19200 baud (actual rate: 19208) */
#define UART_BAUDRATE_BAUDRATE_Baud28800 (0x0075F000UL) /*!< 28800 baud (actual rate: 28829) */
#define UART_BAUDRATE_BAUDRATE_Baud31250 (0x00800000UL) /*!< 31250 baud */
#define UART_BAUDRATE_BAUDRATE_Baud38400 (0x009D5000UL) /*!< 38400 baud (actual rate: 38462) */
#define UART_BAUDRATE_BAUDRATE_Baud56000 (0x00E50000UL) /*!< 56000 baud (actual rate: 55944) */
#define UART_BAUDRATE_BAUDRATE_Baud57600 (0x00EBF000UL) /*!< 57600 baud (actual rate: 57762) */
#define UART_BAUDRATE_BAUDRATE_Baud76800 (0x013A9000UL) /*!< 76800 baud (actual rate: 76923) */
#define UART_BAUDRATE_BAUDRATE_Baud115200 (0x01D7E000UL) /*!< 115200 baud (actual rate: 115942) */
#define UART_BAUDRATE_BAUDRATE_Baud230400 (0x03AFB000UL) /*!< 230400 baud (actual rate: 231884) */
#define UART_BAUDRATE_BAUDRATE_Baud250000 (0x04000000UL) /*!< 250000 baud */
#define UART_BAUDRATE_BAUDRATE_Baud460800 (0x075F7000UL) /*!< 460800 baud (actual rate: 470588) */
#define UART_BAUDRATE_BAUDRATE_Baud921600 (0x0EBED000UL) /*!< 921600 baud (actual rate: 941176) */
#define UART_BAUDRATE_BAUDRATE_Baud1M (0x10000000UL) /*!< 1Mega baud */
#define UART_CONFIG_STOP_Pos (4UL) /*!< Position of STOP field. */
#define UART_CONFIG_STOP_Msk (0x1UL << UART_CONFIG_STOP_Pos) /*!< Bit mask of STOP field. */
#define UART_CONFIG_STOP_One (0UL) /*!< One stop bit */
#define UART_CONFIG_STOP_Two (1UL) /*!< Two stop bits */
#define UART_CONFIG_PARITY_Pos (1UL) /*!< Position of PARITY field. */
#define UART_CONFIG_PARITY_Msk (0x7UL << UART_CONFIG_PARITY_Pos) /*!< Bit mask of PARITY field. */
#define UART_CONFIG_PARITY_Excluded (0x0UL) /*!< Exclude parity bit */
#define UART_CONFIG_PARITY_Included (0x7UL) /*!< Include parity bit */
#define UART_CONFIG_HWFC_Pos (0UL) /*!< Position of HWFC field. */
#define UART_CONFIG_HWFC_Msk (0x1UL << UART_CONFIG_HWFC_Pos) /*!< Bit mask of HWFC field. */
#define UART_CONFIG_HWFC_Disabled (0UL) /*!< Disabled */
#define UART_CONFIG_HWFC_Enabled (1UL) /*!< Enabled */
#define UARTE_TASKS_STARTRX_TASKS_STARTRX_Pos (0UL) /*!< Position of TASKS_STARTRX field. */
#define UARTE_TASKS_STARTRX_TASKS_STARTRX_Msk (0x1UL << UARTE_TASKS_STARTRX_TASKS_STARTRX_Pos) /*!< Bit mask of TASKS_STARTRX field. */
#define UARTE_TASKS_STARTRX_TASKS_STARTRX_Trigger (1UL) /*!< Trigger task */
#define UARTE_TASKS_STOPRX_TASKS_STOPRX_Pos (0UL) /*!< Position of TASKS_STOPRX field. */
#define UARTE_TASKS_STOPRX_TASKS_STOPRX_Msk (0x1UL << UARTE_TASKS_STOPRX_TASKS_STOPRX_Pos) /*!< Bit mask of TASKS_STOPRX field. */
#define UARTE_TASKS_STOPRX_TASKS_STOPRX_Trigger (1UL) /*!< Trigger task */
#define UARTE_TASKS_STARTTX_TASKS_STARTTX_Pos (0UL) /*!< Position of TASKS_STARTTX field. */
#define UARTE_TASKS_STARTTX_TASKS_STARTTX_Msk (0x1UL << UARTE_TASKS_STARTTX_TASKS_STARTTX_Pos) /*!< Bit mask of TASKS_STARTTX field. */
#define UARTE_TASKS_STARTTX_TASKS_STARTTX_Trigger (1UL) /*!< Trigger task */
#define UARTE_TASKS_STOPTX_TASKS_STOPTX_Pos (0UL) /*!< Position of TASKS_STOPTX field. */
#define UARTE_TASKS_STOPTX_TASKS_STOPTX_Msk (0x1UL << UARTE_TASKS_STOPTX_TASKS_STOPTX_Pos) /*!< Bit mask of TASKS_STOPTX field. */
#define UARTE_TASKS_STOPTX_TASKS_STOPTX_Trigger (1UL) /*!< Trigger task */
#define UARTE_TASKS_FLUSHRX_TASKS_FLUSHRX_Pos (0UL) /*!< Position of TASKS_FLUSHRX field. */
#define UARTE_TASKS_FLUSHRX_TASKS_FLUSHRX_Msk (0x1UL << UARTE_TASKS_FLUSHRX_TASKS_FLUSHRX_Pos) /*!< Bit mask of TASKS_FLUSHRX field. */
#define UARTE_TASKS_FLUSHRX_TASKS_FLUSHRX_Trigger (1UL) /*!< Trigger task */
#define UARTE_EVENTS_CTS_EVENTS_CTS_Pos (0UL) /*!< Position of EVENTS_CTS field. */
#define UARTE_EVENTS_CTS_EVENTS_CTS_Msk (0x1UL << UARTE_EVENTS_CTS_EVENTS_CTS_Pos) /*!< Bit mask of EVENTS_CTS field. */
#define UARTE_EVENTS_CTS_EVENTS_CTS_NotGenerated (0UL) /*!< Event not generated */
#define UARTE_EVENTS_CTS_EVENTS_CTS_Generated (1UL) /*!< Event generated */
#define UARTE_EVENTS_NCTS_EVENTS_NCTS_Pos (0UL) /*!< Position of EVENTS_NCTS field. */
#define UARTE_EVENTS_NCTS_EVENTS_NCTS_Msk (0x1UL << UARTE_EVENTS_NCTS_EVENTS_NCTS_Pos) /*!< Bit mask of EVENTS_NCTS field. */
#define UARTE_EVENTS_NCTS_EVENTS_NCTS_NotGenerated (0UL) /*!< Event not generated */
#define UARTE_EVENTS_NCTS_EVENTS_NCTS_Generated (1UL) /*!< Event generated */
#define UARTE_EVENTS_RXDRDY_EVENTS_RXDRDY_Pos (0UL) /*!< Position of EVENTS_RXDRDY field. */
#define UARTE_EVENTS_RXDRDY_EVENTS_RXDRDY_Msk (0x1UL << UARTE_EVENTS_RXDRDY_EVENTS_RXDRDY_Pos) /*!< Bit mask of EVENTS_RXDRDY field. */
#define UARTE_EVENTS_RXDRDY_EVENTS_RXDRDY_NotGenerated (0UL) /*!< Event not generated */
#define UARTE_EVENTS_RXDRDY_EVENTS_RXDRDY_Generated (1UL) /*!< Event generated */
#define UARTE_EVENTS_ENDRX_EVENTS_ENDRX_Pos (0UL) /*!< Position of EVENTS_ENDRX field. */
#define UARTE_EVENTS_ENDRX_EVENTS_ENDRX_Msk (0x1UL << UARTE_EVENTS_ENDRX_EVENTS_ENDRX_Pos) /*!< Bit mask of EVENTS_ENDRX field. */
#define UARTE_EVENTS_ENDRX_EVENTS_ENDRX_NotGenerated (0UL) /*!< Event not generated */
#define UARTE_EVENTS_ENDRX_EVENTS_ENDRX_Generated (1UL) /*!< Event generated */
#define UARTE_EVENTS_TXDRDY_EVENTS_TXDRDY_Pos (0UL) /*!< Position of EVENTS_TXDRDY field. */
#define UARTE_EVENTS_TXDRDY_EVENTS_TXDRDY_Msk (0x1UL << UARTE_EVENTS_TXDRDY_EVENTS_TXDRDY_Pos) /*!< Bit mask of EVENTS_TXDRDY field. */
#define UARTE_EVENTS_TXDRDY_EVENTS_TXDRDY_NotGenerated (0UL) /*!< Event not generated */
#define UARTE_EVENTS_TXDRDY_EVENTS_TXDRDY_Generated (1UL) /*!< Event generated */
#define UARTE_EVENTS_ENDTX_EVENTS_ENDTX_Pos (0UL) /*!< Position of EVENTS_ENDTX field. */
#define UARTE_EVENTS_ENDTX_EVENTS_ENDTX_Msk (0x1UL << UARTE_EVENTS_ENDTX_EVENTS_ENDTX_Pos) /*!< Bit mask of EVENTS_ENDTX field. */
#define UARTE_EVENTS_ENDTX_EVENTS_ENDTX_NotGenerated (0UL) /*!< Event not generated */
#define UARTE_EVENTS_ENDTX_EVENTS_ENDTX_Generated (1UL) /*!< Event generated */
#define UARTE_EVENTS_ERROR_EVENTS_ERROR_Pos (0UL) /*!< Position of EVENTS_ERROR field. */
#define UARTE_EVENTS_ERROR_EVENTS_ERROR_Msk (0x1UL << UARTE_EVENTS_ERROR_EVENTS_ERROR_Pos) /*!< Bit mask of EVENTS_ERROR field. */
#define UARTE_EVENTS_ERROR_EVENTS_ERROR_NotGenerated (0UL) /*!< Event not generated */
#define UARTE_EVENTS_ERROR_EVENTS_ERROR_Generated (1UL) /*!< Event generated */
#define UARTE_EVENTS_RXTO_EVENTS_RXTO_Pos (0UL) /*!< Position of EVENTS_RXTO field. */
#define UARTE_EVENTS_RXTO_EVENTS_RXTO_Msk (0x1UL << UARTE_EVENTS_RXTO_EVENTS_RXTO_Pos) /*!< Bit mask of EVENTS_RXTO field. */
#define UARTE_EVENTS_RXTO_EVENTS_RXTO_NotGenerated (0UL) /*!< Event not generated */
#define UARTE_EVENTS_RXTO_EVENTS_RXTO_Generated (1UL) /*!< Event generated */
#define UARTE_EVENTS_RXSTARTED_EVENTS_RXSTARTED_Pos (0UL) /*!< Position of EVENTS_RXSTARTED field. */
#define UARTE_EVENTS_RXSTARTED_EVENTS_RXSTARTED_Msk (0x1UL << UARTE_EVENTS_RXSTARTED_EVENTS_RXSTARTED_Pos) /*!< Bit mask of EVENTS_RXSTARTED field. */
#define UARTE_EVENTS_RXSTARTED_EVENTS_RXSTARTED_NotGenerated (0UL) /*!< Event not generated */
#define UARTE_EVENTS_RXSTARTED_EVENTS_RXSTARTED_Generated (1UL) /*!< Event generated */
#define UARTE_EVENTS_TXSTARTED_EVENTS_TXSTARTED_Pos (0UL) /*!< Position of EVENTS_TXSTARTED field. */
#define UARTE_EVENTS_TXSTARTED_EVENTS_TXSTARTED_Msk (0x1UL << UARTE_EVENTS_TXSTARTED_EVENTS_TXSTARTED_Pos) /*!< Bit mask of EVENTS_TXSTARTED field. */
#define UARTE_EVENTS_TXSTARTED_EVENTS_TXSTARTED_NotGenerated (0UL) /*!< Event not generated */
#define UARTE_EVENTS_TXSTARTED_EVENTS_TXSTARTED_Generated (1UL) /*!< Event generated */
#define UARTE_EVENTS_TXSTOPPED_EVENTS_TXSTOPPED_Pos (0UL) /*!< Position of EVENTS_TXSTOPPED field. */
#define UARTE_EVENTS_TXSTOPPED_EVENTS_TXSTOPPED_Msk (0x1UL << UARTE_EVENTS_TXSTOPPED_EVENTS_TXSTOPPED_Pos) /*!< Bit mask of EVENTS_TXSTOPPED field. */
#define UARTE_EVENTS_TXSTOPPED_EVENTS_TXSTOPPED_NotGenerated (0UL) /*!< Event not generated */
#define UARTE_EVENTS_TXSTOPPED_EVENTS_TXSTOPPED_Generated (1UL) /*!< Event generated */
#define UARTE_SHORTS_ENDRX_STOPRX_Pos (6UL) /*!< Position of ENDRX_STOPRX field. */
#define UARTE_SHORTS_ENDRX_STOPRX_Msk (0x1UL << UARTE_SHORTS_ENDRX_STOPRX_Pos) /*!< Bit mask of ENDRX_STOPRX field. */
#define UARTE_SHORTS_ENDRX_STOPRX_Disabled (0UL) /*!< Disable shortcut */
#define UARTE_SHORTS_ENDRX_STOPRX_Enabled (1UL) /*!< Enable shortcut */
#define UARTE_SHORTS_ENDRX_STARTRX_Pos (5UL) /*!< Position of ENDRX_STARTRX field. */
#define UARTE_SHORTS_ENDRX_STARTRX_Msk (0x1UL << UARTE_SHORTS_ENDRX_STARTRX_Pos) /*!< Bit mask of ENDRX_STARTRX field. */
#define UARTE_SHORTS_ENDRX_STARTRX_Disabled (0UL) /*!< Disable shortcut */
#define UARTE_SHORTS_ENDRX_STARTRX_Enabled (1UL) /*!< Enable shortcut */
#define UARTE_INTEN_TXSTOPPED_Pos (22UL) /*!< Position of TXSTOPPED field. */
#define UARTE_INTEN_TXSTOPPED_Msk (0x1UL << UARTE_INTEN_TXSTOPPED_Pos) /*!< Bit mask of TXSTOPPED field. */
#define UARTE_INTEN_TXSTOPPED_Disabled (0UL) /*!< Disable */
#define UARTE_INTEN_TXSTOPPED_Enabled (1UL) /*!< Enable */
#define UARTE_INTEN_TXSTARTED_Pos (20UL) /*!< Position of TXSTARTED field. */
#define UARTE_INTEN_TXSTARTED_Msk (0x1UL << UARTE_INTEN_TXSTARTED_Pos) /*!< Bit mask of TXSTARTED field. */
#define UARTE_INTEN_TXSTARTED_Disabled (0UL) /*!< Disable */
#define UARTE_INTEN_TXSTARTED_Enabled (1UL) /*!< Enable */
#define UARTE_INTEN_RXSTARTED_Pos (19UL) /*!< Position of RXSTARTED field. */
#define UARTE_INTEN_RXSTARTED_Msk (0x1UL << UARTE_INTEN_RXSTARTED_Pos) /*!< Bit mask of RXSTARTED field. */
#define UARTE_INTEN_RXSTARTED_Disabled (0UL) /*!< Disable */
#define UARTE_INTEN_RXSTARTED_Enabled (1UL) /*!< Enable */
#define UARTE_INTEN_RXTO_Pos (17UL) /*!< Position of RXTO field. */
#define UARTE_INTEN_RXTO_Msk (0x1UL << UARTE_INTEN_RXTO_Pos) /*!< Bit mask of RXTO field. */
#define UARTE_INTEN_RXTO_Disabled (0UL) /*!< Disable */
#define UARTE_INTEN_RXTO_Enabled (1UL) /*!< Enable */
#define UARTE_INTEN_ERROR_Pos (9UL) /*!< Position of ERROR field. */
#define UARTE_INTEN_ERROR_Msk (0x1UL << UARTE_INTEN_ERROR_Pos) /*!< Bit mask of ERROR field. */
#define UARTE_INTEN_ERROR_Disabled (0UL) /*!< Disable */
#define UARTE_INTEN_ERROR_Enabled (1UL) /*!< Enable */
#define UARTE_INTEN_ENDTX_Pos (8UL) /*!< Position of ENDTX field. */
#define UARTE_INTEN_ENDTX_Msk (0x1UL << UARTE_INTEN_ENDTX_Pos) /*!< Bit mask of ENDTX field. */
#define UARTE_INTEN_ENDTX_Disabled (0UL) /*!< Disable */
#define UARTE_INTEN_ENDTX_Enabled (1UL) /*!< Enable */
#define UARTE_INTEN_TXDRDY_Pos (7UL) /*!< Position of TXDRDY field. */
#define UARTE_INTEN_TXDRDY_Msk (0x1UL << UARTE_INTEN_TXDRDY_Pos) /*!< Bit mask of TXDRDY field. */
#define UARTE_INTEN_TXDRDY_Disabled (0UL) /*!< Disable */
#define UARTE_INTEN_TXDRDY_Enabled (1UL) /*!< Enable */
#define UARTE_INTEN_ENDRX_Pos (4UL) /*!< Position of ENDRX field. */
#define UARTE_INTEN_ENDRX_Msk (0x1UL << UARTE_INTEN_ENDRX_Pos) /*!< Bit mask of ENDRX field. */
#define UARTE_INTEN_ENDRX_Disabled (0UL) /*!< Disable */
#define UARTE_INTEN_ENDRX_Enabled (1UL) /*!< Enable */
#define UARTE_INTEN_RXDRDY_Pos (2UL) /*!< Position of RXDRDY field. */
#define UARTE_INTEN_RXDRDY_Msk (0x1UL << UARTE_INTEN_RXDRDY_Pos) /*!< Bit mask of RXDRDY field. */
#define UARTE_INTEN_RXDRDY_Disabled (0UL) /*!< Disable */
#define UARTE_INTEN_RXDRDY_Enabled (1UL) /*!< Enable */
#define UARTE_INTEN_NCTS_Pos (1UL) /*!< Position of NCTS field. */
#define UARTE_INTEN_NCTS_Msk (0x1UL << UARTE_INTEN_NCTS_Pos) /*!< Bit mask of NCTS field. */
#define UARTE_INTEN_NCTS_Disabled (0UL) /*!< Disable */
#define UARTE_INTEN_NCTS_Enabled (1UL) /*!< Enable */
#define UARTE_INTEN_CTS_Pos (0UL) /*!< Position of CTS field. */
#define UARTE_INTEN_CTS_Msk (0x1UL << UARTE_INTEN_CTS_Pos) /*!< Bit mask of CTS field. */
#define UARTE_INTEN_CTS_Disabled (0UL) /*!< Disable */
#define UARTE_INTEN_CTS_Enabled (1UL) /*!< Enable */
#define UARTE_INTENSET_TXSTOPPED_Pos (22UL) /*!< Position of TXSTOPPED field. */
#define UARTE_INTENSET_TXSTOPPED_Msk (0x1UL << UARTE_INTENSET_TXSTOPPED_Pos) /*!< Bit mask of TXSTOPPED field. */
#define UARTE_INTENSET_TXSTOPPED_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENSET_TXSTOPPED_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENSET_TXSTOPPED_Set (1UL) /*!< Enable */
#define UARTE_INTENSET_TXSTARTED_Pos (20UL) /*!< Position of TXSTARTED field. */
#define UARTE_INTENSET_TXSTARTED_Msk (0x1UL << UARTE_INTENSET_TXSTARTED_Pos) /*!< Bit mask of TXSTARTED field. */
#define UARTE_INTENSET_TXSTARTED_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENSET_TXSTARTED_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENSET_TXSTARTED_Set (1UL) /*!< Enable */
#define UARTE_INTENSET_RXSTARTED_Pos (19UL) /*!< Position of RXSTARTED field. */
#define UARTE_INTENSET_RXSTARTED_Msk (0x1UL << UARTE_INTENSET_RXSTARTED_Pos) /*!< Bit mask of RXSTARTED field. */
#define UARTE_INTENSET_RXSTARTED_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENSET_RXSTARTED_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENSET_RXSTARTED_Set (1UL) /*!< Enable */
#define UARTE_INTENSET_RXTO_Pos (17UL) /*!< Position of RXTO field. */
#define UARTE_INTENSET_RXTO_Msk (0x1UL << UARTE_INTENSET_RXTO_Pos) /*!< Bit mask of RXTO field. */
#define UARTE_INTENSET_RXTO_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENSET_RXTO_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENSET_RXTO_Set (1UL) /*!< Enable */
#define UARTE_INTENSET_ERROR_Pos (9UL) /*!< Position of ERROR field. */
#define UARTE_INTENSET_ERROR_Msk (0x1UL << UARTE_INTENSET_ERROR_Pos) /*!< Bit mask of ERROR field. */
#define UARTE_INTENSET_ERROR_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENSET_ERROR_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENSET_ERROR_Set (1UL) /*!< Enable */
#define UARTE_INTENSET_ENDTX_Pos (8UL) /*!< Position of ENDTX field. */
#define UARTE_INTENSET_ENDTX_Msk (0x1UL << UARTE_INTENSET_ENDTX_Pos) /*!< Bit mask of ENDTX field. */
#define UARTE_INTENSET_ENDTX_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENSET_ENDTX_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENSET_ENDTX_Set (1UL) /*!< Enable */
#define UARTE_INTENSET_TXDRDY_Pos (7UL) /*!< Position of TXDRDY field. */
#define UARTE_INTENSET_TXDRDY_Msk (0x1UL << UARTE_INTENSET_TXDRDY_Pos) /*!< Bit mask of TXDRDY field. */
#define UARTE_INTENSET_TXDRDY_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENSET_TXDRDY_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENSET_TXDRDY_Set (1UL) /*!< Enable */
#define UARTE_INTENSET_ENDRX_Pos (4UL) /*!< Position of ENDRX field. */
#define UARTE_INTENSET_ENDRX_Msk (0x1UL << UARTE_INTENSET_ENDRX_Pos) /*!< Bit mask of ENDRX field. */
#define UARTE_INTENSET_ENDRX_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENSET_ENDRX_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENSET_ENDRX_Set (1UL) /*!< Enable */
#define UARTE_INTENSET_RXDRDY_Pos (2UL) /*!< Position of RXDRDY field. */
#define UARTE_INTENSET_RXDRDY_Msk (0x1UL << UARTE_INTENSET_RXDRDY_Pos) /*!< Bit mask of RXDRDY field. */
#define UARTE_INTENSET_RXDRDY_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENSET_RXDRDY_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENSET_RXDRDY_Set (1UL) /*!< Enable */
#define UARTE_INTENSET_NCTS_Pos (1UL) /*!< Position of NCTS field. */
#define UARTE_INTENSET_NCTS_Msk (0x1UL << UARTE_INTENSET_NCTS_Pos) /*!< Bit mask of NCTS field. */
#define UARTE_INTENSET_NCTS_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENSET_NCTS_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENSET_NCTS_Set (1UL) /*!< Enable */
#define UARTE_INTENSET_CTS_Pos (0UL) /*!< Position of CTS field. */
#define UARTE_INTENSET_CTS_Msk (0x1UL << UARTE_INTENSET_CTS_Pos) /*!< Bit mask of CTS field. */
#define UARTE_INTENSET_CTS_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENSET_CTS_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENSET_CTS_Set (1UL) /*!< Enable */
#define UARTE_INTENCLR_TXSTOPPED_Pos (22UL) /*!< Position of TXSTOPPED field. */
#define UARTE_INTENCLR_TXSTOPPED_Msk (0x1UL << UARTE_INTENCLR_TXSTOPPED_Pos) /*!< Bit mask of TXSTOPPED field. */
#define UARTE_INTENCLR_TXSTOPPED_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENCLR_TXSTOPPED_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENCLR_TXSTOPPED_Clear (1UL) /*!< Disable */
#define UARTE_INTENCLR_TXSTARTED_Pos (20UL) /*!< Position of TXSTARTED field. */
#define UARTE_INTENCLR_TXSTARTED_Msk (0x1UL << UARTE_INTENCLR_TXSTARTED_Pos) /*!< Bit mask of TXSTARTED field. */
#define UARTE_INTENCLR_TXSTARTED_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENCLR_TXSTARTED_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENCLR_TXSTARTED_Clear (1UL) /*!< Disable */
#define UARTE_INTENCLR_RXSTARTED_Pos (19UL) /*!< Position of RXSTARTED field. */
#define UARTE_INTENCLR_RXSTARTED_Msk (0x1UL << UARTE_INTENCLR_RXSTARTED_Pos) /*!< Bit mask of RXSTARTED field. */
#define UARTE_INTENCLR_RXSTARTED_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENCLR_RXSTARTED_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENCLR_RXSTARTED_Clear (1UL) /*!< Disable */
#define UARTE_INTENCLR_RXTO_Pos (17UL) /*!< Position of RXTO field. */
#define UARTE_INTENCLR_RXTO_Msk (0x1UL << UARTE_INTENCLR_RXTO_Pos) /*!< Bit mask of RXTO field. */
#define UARTE_INTENCLR_RXTO_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENCLR_RXTO_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENCLR_RXTO_Clear (1UL) /*!< Disable */
#define UARTE_INTENCLR_ERROR_Pos (9UL) /*!< Position of ERROR field. */
#define UARTE_INTENCLR_ERROR_Msk (0x1UL << UARTE_INTENCLR_ERROR_Pos) /*!< Bit mask of ERROR field. */
#define UARTE_INTENCLR_ERROR_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENCLR_ERROR_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENCLR_ERROR_Clear (1UL) /*!< Disable */
#define UARTE_INTENCLR_ENDTX_Pos (8UL) /*!< Position of ENDTX field. */
#define UARTE_INTENCLR_ENDTX_Msk (0x1UL << UARTE_INTENCLR_ENDTX_Pos) /*!< Bit mask of ENDTX field. */
#define UARTE_INTENCLR_ENDTX_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENCLR_ENDTX_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENCLR_ENDTX_Clear (1UL) /*!< Disable */
#define UARTE_INTENCLR_TXDRDY_Pos (7UL) /*!< Position of TXDRDY field. */
#define UARTE_INTENCLR_TXDRDY_Msk (0x1UL << UARTE_INTENCLR_TXDRDY_Pos) /*!< Bit mask of TXDRDY field. */
#define UARTE_INTENCLR_TXDRDY_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENCLR_TXDRDY_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENCLR_TXDRDY_Clear (1UL) /*!< Disable */
#define UARTE_INTENCLR_ENDRX_Pos (4UL) /*!< Position of ENDRX field. */
#define UARTE_INTENCLR_ENDRX_Msk (0x1UL << UARTE_INTENCLR_ENDRX_Pos) /*!< Bit mask of ENDRX field. */
#define UARTE_INTENCLR_ENDRX_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENCLR_ENDRX_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENCLR_ENDRX_Clear (1UL) /*!< Disable */
#define UARTE_INTENCLR_RXDRDY_Pos (2UL) /*!< Position of RXDRDY field. */
#define UARTE_INTENCLR_RXDRDY_Msk (0x1UL << UARTE_INTENCLR_RXDRDY_Pos) /*!< Bit mask of RXDRDY field. */
#define UARTE_INTENCLR_RXDRDY_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENCLR_RXDRDY_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENCLR_RXDRDY_Clear (1UL) /*!< Disable */
#define UARTE_INTENCLR_NCTS_Pos (1UL) /*!< Position of NCTS field. */
#define UARTE_INTENCLR_NCTS_Msk (0x1UL << UARTE_INTENCLR_NCTS_Pos) /*!< Bit mask of NCTS field. */
#define UARTE_INTENCLR_NCTS_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENCLR_NCTS_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENCLR_NCTS_Clear (1UL) /*!< Disable */
#define UARTE_INTENCLR_CTS_Pos (0UL) /*!< Position of CTS field. */
#define UARTE_INTENCLR_CTS_Msk (0x1UL << UARTE_INTENCLR_CTS_Pos) /*!< Bit mask of CTS field. */
#define UARTE_INTENCLR_CTS_Disabled (0UL) /*!< Read: Disabled */
#define UARTE_INTENCLR_CTS_Enabled (1UL) /*!< Read: Enabled */
#define UARTE_INTENCLR_CTS_Clear (1UL) /*!< Disable */
#define UARTE_ERRORSRC_BREAK_Pos (3UL) /*!< Position of BREAK field. */
#define UARTE_ERRORSRC_BREAK_Msk (0x1UL << UARTE_ERRORSRC_BREAK_Pos) /*!< Bit mask of BREAK field. */
#define UARTE_ERRORSRC_BREAK_NotPresent (0UL) /*!< Read: error not present */
#define UARTE_ERRORSRC_BREAK_Present (1UL) /*!< Read: error present */
#define UARTE_ERRORSRC_FRAMING_Pos (2UL) /*!< Position of FRAMING field. */
#define UARTE_ERRORSRC_FRAMING_Msk (0x1UL << UARTE_ERRORSRC_FRAMING_Pos) /*!< Bit mask of FRAMING field. */
#define UARTE_ERRORSRC_FRAMING_NotPresent (0UL) /*!< Read: error not present */
#define UARTE_ERRORSRC_FRAMING_Present (1UL) /*!< Read: error present */
#define UARTE_ERRORSRC_PARITY_Pos (1UL) /*!< Position of PARITY field. */
#define UARTE_ERRORSRC_PARITY_Msk (0x1UL << UARTE_ERRORSRC_PARITY_Pos) /*!< Bit mask of PARITY field. */
#define UARTE_ERRORSRC_PARITY_NotPresent (0UL) /*!< Read: error not present */
#define UARTE_ERRORSRC_PARITY_Present (1UL) /*!< Read: error present */
#define UARTE_ERRORSRC_OVERRUN_Pos (0UL) /*!< Position of OVERRUN field. */
#define UARTE_ERRORSRC_OVERRUN_Msk (0x1UL << UARTE_ERRORSRC_OVERRUN_Pos) /*!< Bit mask of OVERRUN field. */
#define UARTE_ERRORSRC_OVERRUN_NotPresent (0UL) /*!< Read: error not present */
#define UARTE_ERRORSRC_OVERRUN_Present (1UL) /*!< Read: error present */
#define UARTE_ENABLE_ENABLE_Pos (0UL) /*!< Position of ENABLE field. */
#define UARTE_ENABLE_ENABLE_Msk (0xFUL << UARTE_ENABLE_ENABLE_Pos) /*!< Bit mask of ENABLE field. */
#define UARTE_ENABLE_ENABLE_Disabled (0UL) /*!< Disable UARTE */
#define UARTE_ENABLE_ENABLE_Enabled (8UL) /*!< Enable UARTE */
#define UARTE_PSEL_RTS_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define UARTE_PSEL_RTS_CONNECT_Msk (0x1UL << UARTE_PSEL_RTS_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define UARTE_PSEL_RTS_CONNECT_Connected (0UL) /*!< Connect */
#define UARTE_PSEL_RTS_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define UARTE_PSEL_RTS_PORT_Pos (5UL) /*!< Position of PORT field. */
#define UARTE_PSEL_RTS_PORT_Msk (0x1UL << UARTE_PSEL_RTS_PORT_Pos) /*!< Bit mask of PORT field. */
#define UARTE_PSEL_RTS_PIN_Pos (0UL) /*!< Position of PIN field. */
#define UARTE_PSEL_RTS_PIN_Msk (0x1FUL << UARTE_PSEL_RTS_PIN_Pos) /*!< Bit mask of PIN field. */
#define UARTE_PSEL_TXD_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define UARTE_PSEL_TXD_CONNECT_Msk (0x1UL << UARTE_PSEL_TXD_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define UARTE_PSEL_TXD_CONNECT_Connected (0UL) /*!< Connect */
#define UARTE_PSEL_TXD_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define UARTE_PSEL_TXD_PORT_Pos (5UL) /*!< Position of PORT field. */
#define UARTE_PSEL_TXD_PORT_Msk (0x1UL << UARTE_PSEL_TXD_PORT_Pos) /*!< Bit mask of PORT field. */
#define UARTE_PSEL_TXD_PIN_Pos (0UL) /*!< Position of PIN field. */
#define UARTE_PSEL_TXD_PIN_Msk (0x1FUL << UARTE_PSEL_TXD_PIN_Pos) /*!< Bit mask of PIN field. */
#define UARTE_PSEL_CTS_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define UARTE_PSEL_CTS_CONNECT_Msk (0x1UL << UARTE_PSEL_CTS_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define UARTE_PSEL_CTS_CONNECT_Connected (0UL) /*!< Connect */
#define UARTE_PSEL_CTS_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define UARTE_PSEL_CTS_PORT_Pos (5UL) /*!< Position of PORT field. */
#define UARTE_PSEL_CTS_PORT_Msk (0x1UL << UARTE_PSEL_CTS_PORT_Pos) /*!< Bit mask of PORT field. */
#define UARTE_PSEL_CTS_PIN_Pos (0UL) /*!< Position of PIN field. */
#define UARTE_PSEL_CTS_PIN_Msk (0x1FUL << UARTE_PSEL_CTS_PIN_Pos) /*!< Bit mask of PIN field. */
#define UARTE_PSEL_RXD_CONNECT_Pos (31UL) /*!< Position of CONNECT field. */
#define UARTE_PSEL_RXD_CONNECT_Msk (0x1UL << UARTE_PSEL_RXD_CONNECT_Pos) /*!< Bit mask of CONNECT field. */
#define UARTE_PSEL_RXD_CONNECT_Connected (0UL) /*!< Connect */
#define UARTE_PSEL_RXD_CONNECT_Disconnected (1UL) /*!< Disconnect */
#define UARTE_PSEL_RXD_PORT_Pos (5UL) /*!< Position of PORT field. */
#define UARTE_PSEL_RXD_PORT_Msk (0x1UL << UARTE_PSEL_RXD_PORT_Pos) /*!< Bit mask of PORT field. */
#define UARTE_PSEL_RXD_PIN_Pos (0UL) /*!< Position of PIN field. */
#define UARTE_PSEL_RXD_PIN_Msk (0x1FUL << UARTE_PSEL_RXD_PIN_Pos) /*!< Bit mask of PIN field. */
#define UARTE_BAUDRATE_BAUDRATE_Pos (0UL) /*!< Position of BAUDRATE field. */
#define UARTE_BAUDRATE_BAUDRATE_Msk (0xFFFFFFFFUL << UARTE_BAUDRATE_BAUDRATE_Pos) /*!< Bit mask of BAUDRATE field. */
#define UARTE_BAUDRATE_BAUDRATE_Baud1200 (0x0004F000UL) /*!< 1200 baud (actual rate: 1205) */
#define UARTE_BAUDRATE_BAUDRATE_Baud2400 (0x0009D000UL) /*!< 2400 baud (actual rate: 2396) */
#define UARTE_BAUDRATE_BAUDRATE_Baud4800 (0x0013B000UL) /*!< 4800 baud (actual rate: 4808) */
#define UARTE_BAUDRATE_BAUDRATE_Baud9600 (0x00275000UL) /*!< 9600 baud (actual rate: 9598) */
#define UARTE_BAUDRATE_BAUDRATE_Baud14400 (0x003AF000UL) /*!< 14400 baud (actual rate: 14401) */
#define UARTE_BAUDRATE_BAUDRATE_Baud19200 (0x004EA000UL) /*!< 19200 baud (actual rate: 19208) */
#define UARTE_BAUDRATE_BAUDRATE_Baud28800 (0x0075C000UL) /*!< 28800 baud (actual rate: 28777) */
#define UARTE_BAUDRATE_BAUDRATE_Baud31250 (0x00800000UL) /*!< 31250 baud */
#define UARTE_BAUDRATE_BAUDRATE_Baud38400 (0x009D0000UL) /*!< 38400 baud (actual rate: 38369) */
#define UARTE_BAUDRATE_BAUDRATE_Baud56000 (0x00E50000UL) /*!< 56000 baud (actual rate: 55944) */
#define UARTE_BAUDRATE_BAUDRATE_Baud57600 (0x00EB0000UL) /*!< 57600 baud (actual rate: 57554) */
#define UARTE_BAUDRATE_BAUDRATE_Baud76800 (0x013A9000UL) /*!< 76800 baud (actual rate: 76923) */
#define UARTE_BAUDRATE_BAUDRATE_Baud115200 (0x01D60000UL) /*!< 115200 baud (actual rate: 115108) */
#define UARTE_BAUDRATE_BAUDRATE_Baud230400 (0x03B00000UL) /*!< 230400 baud (actual rate: 231884) */
#define UARTE_BAUDRATE_BAUDRATE_Baud250000 (0x04000000UL) /*!< 250000 baud */
#define UARTE_BAUDRATE_BAUDRATE_Baud460800 (0x07400000UL) /*!< 460800 baud (actual rate: 457143) */
#define UARTE_BAUDRATE_BAUDRATE_Baud921600 (0x0F000000UL) /*!< 921600 baud (actual rate: 941176) */
#define UARTE_BAUDRATE_BAUDRATE_Baud1M (0x10000000UL) /*!< 1 megabaud */
#define UARTE_RXD_PTR_PTR_Pos (0UL) /*!< Position of PTR field. */
#define UARTE_RXD_PTR_PTR_Msk (0xFFFFFFFFUL << UARTE_RXD_PTR_PTR_Pos) /*!< Bit mask of PTR field. */
#define UARTE_RXD_MAXCNT_MAXCNT_Pos (0UL) /*!< Position of MAXCNT field. */
#define UARTE_RXD_MAXCNT_MAXCNT_Msk (0xFFFFUL << UARTE_RXD_MAXCNT_MAXCNT_Pos) /*!< Bit mask of MAXCNT field. */
#define UARTE_RXD_AMOUNT_AMOUNT_Pos (0UL) /*!< Position of AMOUNT field. */
#define UARTE_RXD_AMOUNT_AMOUNT_Msk (0xFFFFUL << UARTE_RXD_AMOUNT_AMOUNT_Pos) /*!< Bit mask of AMOUNT field. */
#define UARTE_TXD_PTR_PTR_Pos (0UL) /*!< Position of PTR field. */
#define UARTE_TXD_PTR_PTR_Msk (0xFFFFFFFFUL << UARTE_TXD_PTR_PTR_Pos) /*!< Bit mask of PTR field. */
#define UARTE_TXD_MAXCNT_MAXCNT_Pos (0UL) /*!< Position of MAXCNT field. */
#define UARTE_TXD_MAXCNT_MAXCNT_Msk (0xFFFFUL << UARTE_TXD_MAXCNT_MAXCNT_Pos) /*!< Bit mask of MAXCNT field. */
#define UARTE_TXD_AMOUNT_AMOUNT_Pos (0UL) /*!< Position of AMOUNT field. */
#define UARTE_TXD_AMOUNT_AMOUNT_Msk (0xFFFFUL << UARTE_TXD_AMOUNT_AMOUNT_Pos) /*!< Bit mask of AMOUNT field. */
#define UARTE_CONFIG_STOP_Pos (4UL) /*!< Position of STOP field. */
#define UARTE_CONFIG_STOP_Msk (0x1UL << UARTE_CONFIG_STOP_Pos) /*!< Bit mask of STOP field. */
#define UARTE_CONFIG_STOP_One (0UL) /*!< One stop bit */
#define UARTE_CONFIG_STOP_Two (1UL) /*!< Two stop bits */
#define UARTE_CONFIG_PARITY_Pos (1UL) /*!< Position of PARITY field. */
#define UARTE_CONFIG_PARITY_Msk (0x7UL << UARTE_CONFIG_PARITY_Pos) /*!< Bit mask of PARITY field. */
#define UARTE_CONFIG_PARITY_Excluded (0x0UL) /*!< Exclude parity bit */
#define UARTE_CONFIG_PARITY_Included (0x7UL) /*!< Include even parity bit */
#define UARTE_CONFIG_HWFC_Pos (0UL) /*!< Position of HWFC field. */
#define UARTE_CONFIG_HWFC_Msk (0x1UL << UARTE_CONFIG_HWFC_Pos) /*!< Bit mask of HWFC field. */
#define UARTE_CONFIG_HWFC_Disabled (0UL) /*!< Disabled */
#define UARTE_CONFIG_HWFC_Enabled (1UL) /*!< Enabled */
`,"core_cm4.h":`#pragma once
#include <stdint.h>
#define __I volatile const
#define __O volatile
#define __IO volatile
#define __IM volatile const
#define __OM volatile
#define __IOM volatile
#define __STATIC_INLINE static inline
#define __STATIC_FORCEINLINE static inline
static inline void __NOP(void){__asm__ volatile("nop");}
static inline void __WFI(void){__asm__ volatile("wfi");}
static inline void __WFE(void){__asm__ volatile("wfe");}
static inline void __enable_irq(void){__asm__ volatile("cpsie i" ::: "memory");}
static inline void __disable_irq(void){__asm__ volatile("cpsid i" ::: "memory");}
static inline void __DMB(void){__asm__ volatile("dmb" ::: "memory");}
static inline void __DSB(void){__asm__ volatile("dsb" ::: "memory");}
static inline void __ISB(void){__asm__ volatile("isb" ::: "memory");}
static inline void NVIC_EnableIRQ(int n){if(n>=0&&n<64)((volatile uint32_t*)0xe000e100)[n/32]=1u<<(n%32);}
static inline void NVIC_DisableIRQ(int n){if(n>=0&&n<64)((volatile uint32_t*)0xe000e180)[n/32]=1u<<(n%32);}
static inline void NVIC_ClearPendingIRQ(int n){if(n>=0&&n<64)((volatile uint32_t*)0xe000e280)[n/32]=1u<<(n%32);}
static inline void NVIC_SetPriority(int n,unsigned p){if(n>=0&&n<64)((volatile uint8_t*)0xe000e400)[n]=p<<5;}
static inline void NVIC_SystemReset(void){*(volatile uint32_t*)0xe000ed0c=0x05fa0004;}
`,"system_nrf52840.h":`#pragma once
extern unsigned SystemCoreClock;void SystemInit(void);
`,"nrf.h":`#pragma once
#include "nrf52840.h"
#include "nrf52840_bitfields.h"
`};var i_=`#pragma once
#include <nrf.h>
typedef enum{NRF_GPIO_PIN_NOPULL=0,NRF_GPIO_PIN_PULLDOWN=1,NRF_GPIO_PIN_PULLUP=3}nrf_gpio_pin_pull_t;
static inline NRF_GPIO_Type* cf_port(unsigned p){return p<32?NRF_P0:NRF_P1;}
static inline void nrf_gpio_cfg_output(unsigned p){cf_port(p)->PIN_CNF[p%32]=3;}
static inline void nrf_gpio_cfg_input(unsigned p,nrf_gpio_pin_pull_t pull){cf_port(p)->PIN_CNF[p%32]=(unsigned)pull<<2;}
static inline void nrf_gpio_pin_set(unsigned p){cf_port(p)->OUTSET=1u<<(p%32);}
static inline void nrf_gpio_pin_clear(unsigned p){cf_port(p)->OUTCLR=1u<<(p%32);}
static inline unsigned nrf_gpio_pin_read(unsigned p){return(cf_port(p)->IN>>(p%32))&1;}
static inline void nrf_gpio_pin_write(unsigned p,unsigned v){if(v)nrf_gpio_pin_set(p);else nrf_gpio_pin_clear(p);}
static inline void nrf_gpio_pin_toggle(unsigned p){nrf_gpio_pin_write(p,!((cf_port(p)->OUT>>(p%32))&1));}
`;function un(n){let e=_=>+_[1]*32+ +_.slice(3);return{"wirevo_keyboard.h":Un,...Dn,...Object.fromEntries(["stdint.h","stddef.h","stdbool.h","stdio.h"].map(_=>[_,qe[_]])),"nrf_gpio.h":i_,"cf_lcd.h":t_,"nrf_delay.h":`#pragma once
#include <cf_hal.h>
#define nrf_delay_us cf_delay_us
#define nrf_delay_ms cf_delay_ms
`,"cf_hal.h":`#pragma once
#include <stdint.h>
#include <stdbool.h>
#include <nrf_gpio.h>
#define CF_INPUT 0
#define CF_OUTPUT 1
#define CF_INPUT_PULLUP 2
#define CF_INPUT_PULLDOWN 3
#define LED_BUILTIN ${e(n.ledPin)}u
#define BOARD_LED_ACTIVE_LOW ${n.ledChannels[0].activeLow?1:0}
#define BOARD_TXD ${n.txPin}u
#define BOARD_RXD ${n.rxPin}u
#define BOARD_SDA ${n.sdaPin}u
#define BOARD_SCL ${n.sclPin}u
#define BOARD_SCK ${n.sckPin}u
#define BOARD_MOSI ${n.mosiPin}u
#define BOARD_MISO ${n.misoPin}u
${Array.from({length:48},(_,E)=>"#define P"+(E>>>5)+"_"+String(E%32).padStart(2,"0")+" "+E+"u").join(`
`)}
static inline void cf_gpio_mode(unsigned p,int mode){if(mode==CF_OUTPUT)nrf_gpio_cfg_output(p);else nrf_gpio_cfg_input(p,mode==CF_INPUT_PULLUP?NRF_GPIO_PIN_PULLUP:mode==CF_INPUT_PULLDOWN?NRF_GPIO_PIN_PULLDOWN:NRF_GPIO_PIN_NOPULL);}
static inline void cf_gpio_write(unsigned p,int v){nrf_gpio_pin_write(p,v);}
static inline int cf_gpio_read(unsigned p){return nrf_gpio_pin_read(p);}
void cf_delay_us(uint32_t us);void cf_delay_ms(uint32_t ms);
void cf_uart_begin(unsigned baud);void cf_uart_write(unsigned char ch);
static inline int cf_uart_read(void){if(!NRF_UART0->EVENTS_RXDRDY)return -1;NRF_UART0->EVENTS_RXDRDY=0;return (int)NRF_UART0->RXD;}
int cf_twim_transfer(unsigned addr,const uint8_t*tx,unsigned nt,uint8_t*rx,unsigned nr);
void cf_spim_transfer(const uint8_t*tx,unsigned nt,uint8_t*rx,unsigned nr);
unsigned cf_adc_read(unsigned analog);void cf_pwm_start(unsigned pin,unsigned period,unsigned duty);
`}}var _n=["POWER_CLOCK","RADIO","UARTE0_UART0","SPIM0_SPIS0_TWIM0_TWIS0_SPI0_TWI0","SPIM1_SPIS1_TWIM1_TWIS1_SPI1_TWI1","NFCT","GPIOTE","SAADC","TIMER0","TIMER1","TIMER2","RTC0","TEMP","RNG","ECB","CCM_AAR","WDT","RTC1","QDEC","COMP_LPCOMP","SWI0_EGU0","SWI1_EGU1","SWI2_EGU2","SWI3_EGU3","SWI4_EGU4","SWI5_EGU5","TIMER3","TIMER4","PWM0","PDM","RESERVED30","RESERVED31","MWU","PWM1","PWM2","SPIM2_SPIS2_SPI2","RTC2","I2S","FPU","USBD","UARTE1","QSPI","CRYPTOCELL","RESERVED43","RESERVED44","PWM3","RESERVED46","SPIM3"],Mn=`#include <cf_hal.h>
unsigned SystemCoreClock=64000000;void SystemInit(void){*(volatile unsigned*)0xe000ed88|=0x00f00000;__DSB();__ISB();}
extern unsigned _sidata,_sdata,_edata,_sbss,_ebss,_estack;int main(void);
void Default_Handler(void){while(1){}}
void Reset_Handler(void){unsigned*s=&_sidata;for(unsigned*d=&_sdata;d<&_edata;) *d++=*s++;for(unsigned*d=&_sbss;d<&_ebss;) *d++=0;SystemInit();(void)main();while(1){}}
${["NMI","HardFault","MemManage","BusFault","UsageFault","SVC","DebugMon","PendSV","SysTick",..._n].map(n=>"void "+n+'_Handler(void)__attribute__((weak,alias("Default_Handler")));').join(`
`)}
${_n.map(n=>"void "+n+'_IRQHandler(void)__attribute__((weak,alias("Default_Handler")));').join(`
`)}
__attribute__((section(".vectors"),used)) void(*const vectors[])(void)={(void*)&_estack,Reset_Handler,NMI_Handler,HardFault_Handler,MemManage_Handler,BusFault_Handler,UsageFault_Handler,0,0,0,0,SVC_Handler,DebugMon_Handler,0,PendSV_Handler,SysTick_Handler,${_n.map(n=>n+"_IRQHandler").join(",")}};
void cf_delay_us(uint32_t us){NRF_TIMER4->TASKS_STOP=1;NRF_TIMER4->MODE=0;NRF_TIMER4->BITMODE=3;NRF_TIMER4->PRESCALER=4;NRF_TIMER4->TASKS_CLEAR=1;NRF_TIMER4->TASKS_START=1;do{NRF_TIMER4->TASKS_CAPTURE[0]=1;}while(NRF_TIMER4->CC[0]<us);NRF_TIMER4->TASKS_STOP=1;}
void cf_delay_ms(uint32_t ms){while(ms--)cf_delay_us(1000);}
void cf_uart_begin(unsigned baud){NRF_UART0->ENABLE=0;NRF_UART0->PSEL.TXD=BOARD_TXD;NRF_UART0->PSEL.RXD=BOARD_RXD;NRF_UART0->PSEL.CTS=0xffffffff;NRF_UART0->PSEL.RTS=0xffffffff;NRF_UART0->BAUDRATE=((baud*4096u)/15625u)<<10;NRF_UART0->CONFIG=0;NRF_UART0->ENABLE=4;NRF_UART0->TASKS_STARTTX=1;NRF_UART0->TASKS_STARTRX=1;}
void cf_uart_write(unsigned char ch){NRF_UART0->EVENTS_TXDRDY=0;NRF_UART0->TXD=ch;while(!NRF_UART0->EVENTS_TXDRDY){}}
int cf_twim_transfer(unsigned addr,const uint8_t*tx,unsigned nt,uint8_t*rx,unsigned nr){
NRF_TWIM0->ENABLE=0;NRF_TWIM0->PSEL.SDA=BOARD_SDA;NRF_TWIM0->PSEL.SCL=BOARD_SCL;NRF_TWIM0->FREQUENCY=0x01980000;NRF_TWIM0->ADDRESS=addr;NRF_TWIM0->ENABLE=6;NRF_TWIM0->EVENTS_ERROR=0;NRF_TWIM0->ERRORSRC=7;
NRF_TWIM0->EVENTS_STOPPED=0;NRF_TWIM0->TXD.PTR=(uint32_t)tx;NRF_TWIM0->TXD.MAXCNT=nt;NRF_TWIM0->RXD.PTR=(uint32_t)rx;NRF_TWIM0->RXD.MAXCNT=nr;
NRF_TWIM0->SHORTS=(nt&&nr)?((1u<<7)|(1u<<12)):(1u<<(nr?12:9));
if(nt)NRF_TWIM0->TASKS_STARTTX=1;else if(nr)NRF_TWIM0->TASKS_STARTRX=1;else return 0;
while(!NRF_TWIM0->EVENTS_STOPPED&&!NRF_TWIM0->EVENTS_ERROR){}
if(NRF_TWIM0->EVENTS_ERROR){NRF_TWIM0->TASKS_STOP=1;return -1;}while(!NRF_TWIM0->EVENTS_STOPPED){}NRF_TWIM0->EVENTS_STOPPED=0;return 0;}
void cf_spim_transfer(const uint8_t*tx,unsigned nt,uint8_t*rx,unsigned nr){NRF_SPIM1->ENABLE=0;NRF_SPIM1->PSEL.SCK=BOARD_SCK;NRF_SPIM1->PSEL.MOSI=BOARD_MOSI;NRF_SPIM1->PSEL.MISO=BOARD_MISO;NRF_SPIM1->FREQUENCY=0x02000000;NRF_SPIM1->CONFIG=0;NRF_SPIM1->ORC=255;NRF_SPIM1->TXD.PTR=(uint32_t)tx;NRF_SPIM1->TXD.MAXCNT=nt;NRF_SPIM1->RXD.PTR=(uint32_t)rx;NRF_SPIM1->RXD.MAXCNT=nr;NRF_SPIM1->EVENTS_END=0;NRF_SPIM1->ENABLE=7;NRF_SPIM1->TASKS_START=1;while(!NRF_SPIM1->EVENTS_END){}}
unsigned cf_adc_read(unsigned analog){int16_t v=0;NRF_SAADC->ENABLE=1;NRF_SAADC->CH[0].PSELP=analog+1;NRF_SAADC->CH[0].CONFIG=0;NRF_SAADC->RESOLUTION=2;NRF_SAADC->RESULT.PTR=(uint32_t)&v;NRF_SAADC->RESULT.MAXCNT=1;NRF_SAADC->EVENTS_END=0;NRF_SAADC->TASKS_START=1;NRF_SAADC->TASKS_SAMPLE=1;while(!NRF_SAADC->EVENTS_END){}NRF_SAADC->TASKS_STOP=1;return (unsigned)v;}
void cf_pwm_start(unsigned pin,unsigned period,unsigned duty){static uint16_t sample;sample=(uint16_t)(0x8000u|duty);NRF_PWM0->ENABLE=1;NRF_PWM0->MODE=0;NRF_PWM0->PRESCALER=4;NRF_PWM0->COUNTERTOP=period;NRF_PWM0->DECODER=0;NRF_PWM0->PSEL.OUT[0]=pin;for(unsigned i=1;i<4;i++)NRF_PWM0->PSEL.OUT[i]=0xffffffff;NRF_PWM0->SEQ[0].PTR=(uint32_t)&sample;NRF_PWM0->SEQ[0].CNT=1;NRF_PWM0->SEQ[0].REFRESH=0;NRF_PWM0->SEQ[0].ENDDELAY=0;NRF_PWM0->LOOP=0;NRF_PWM0->TASKS_SEQSTART[0]=1;}
`,t_=`#pragma once
#include <cf_hal.h>
static inline void cf_lcd_nibble(unsigned v,unsigned rs){uint8_t a=(uint8_t)(v|rs|8);uint8_t tx[]={a,(uint8_t)(a|4),a};cf_twim_transfer(0x27,tx,3,0,0);}
static inline void cf_lcd_byte(unsigned value,unsigned rs){cf_lcd_nibble(value&0xf0,rs);cf_lcd_nibble((value<<4)&0xf0,rs);cf_delay_us(50);}
static inline void cf_lcd_init(void){cf_delay_ms(40);cf_lcd_nibble(0x30,0);cf_delay_ms(5);cf_lcd_nibble(0x30,0);cf_delay_us(150);cf_lcd_nibble(0x30,0);cf_lcd_nibble(0x20,0);cf_lcd_byte(0x28,0);cf_lcd_byte(0x0c,0);cf_lcd_byte(0x06,0);cf_lcd_byte(1,0);cf_delay_ms(2);}
static inline void cf_lcd_cursor(unsigned col,unsigned row){cf_lcd_byte(0x80|(row?0x40:0)|col,0);}
static inline void cf_lcd_print(const char*s){while(*s)cf_lcd_byte((unsigned char)*s++,1);}
`;var s_=new TextDecoder,Z=class{constructor(e,_=0){this.b=e,this.p=_,this.v=new DataView(e.buffer,e.byteOffset,e.byteLength)}u8(){return this.v.getUint8(this.p++)}u16(){let e=this.v.getUint16(this.p,!0);return this.p+=2,e}u32(){let e=this.v.getUint32(this.p,!0);return this.p+=4,e}str(){let e=this.p;for(;this.u8(););return s_.decode(this.b.subarray(e,this.p-1))}leb(e=!1){let _=0,E=0,d;do if(d=this.u8(),_+=(d&127)*2**E,E+=7,E>49)throw Error("DWARF LEB s\u0131n\u0131r\u0131.");while(d&128);return e&&d&64?_-2**E:_}block(e){let _=Array.from(this.b.subarray(this.p,this.p+e));return this.p+=e,_}};function cn(n,e){let _=new Z(n),E=_.v,d={},i=E.getUint32(32,!0),t=E.getUint16(46,!0),s=E.getUint16(48,!0),T=i+E.getUint16(50,!0)*t,o=n.subarray(E.getUint32(T+16,!0),E.getUint32(T+16,!0)+E.getUint32(T+20,!0));for(let O=0;O<s;O++){let l=i+O*t,D=new Z(o,E.getUint32(l,!0)).str();d[D]=n.subarray(E.getUint32(l+16,!0),E.getUint32(l+16,!0)+E.getUint32(l+20,!0))}let I=[],a=[],R=[],r=new Map,N=d[".debug_line"]||new Uint8Array,S=(O,l)=>{let D=(O?O+"/":"")+l;return e.find(x=>D===x||D.endsWith("/"+x))||null},P=new Z(N);for(;P.p<N.length;){let O=P.u32()+P.p,l=P.u16();if(l!==4)throw Error("DWARF sat\u0131r s\xFCr\xFCm\xFC desteklenmiyor: "+l);let D=P.u32()+P.p,x=P.u8(),Y=P.u8(),k=P.u8(),ue=P.u8()<<24>>24,se=P.u8(),Q=P.u8(),y=[0];for(let M=1;M<Q;M++)y.push(P.u8());let X=[""];for(let M;M=P.str();)X.push(M);let B=[null],z=()=>{let M=P.str();if(!M)return!1;let H=X[P.leb()];return P.leb(),P.leb(),B.push(S(H,M)),!0};for(;z(););P.p=D;let h=0,F=1,Ee=1,Te=0,Me=k,de=0,Be=M=>{a.push({address:h,file:B[Ee],line:F,column:Te,end:!!M,stmt:!!Me}),M&&(a[0].address>=256&&h>a[0].address&&a.every(H=>H.address<=h)&&I.push(...a),a.length=0)},Fe=M=>{h+=x*Math.floor((de+M)/Y),de=(de+M)%Y};for(;P.p<O;){let M=P.u8();if(M)if(M>=Q){let H=M-Q;Fe(Math.floor(H/se)),F+=ue+H%se,Be(!1)}else switch(M){case 1:Be(!1);break;case 2:Fe(P.leb());break;case 3:F+=P.leb(!0);break;case 4:Ee=P.leb();break;case 5:Te=P.leb();break;case 6:Me=!Me;break;case 8:Fe(Math.floor((255-Q)/se));break;case 9:h+=P.u16(),de=0;break;default:for(let H=0;H<y[M];H++)P.leb()}else{let H=P.leb(),bn=P.p+H,He=P.u8();He===1?(Be(!0),h=0,F=1,Ee=1,Te=0,Me=k,de=0):He===2?(h=P.u32(),de=0):He===3&&z(),P.p=bn}}P.p=O}let A=d[".debug_info"]||new Uint8Array,m=d[".debug_abbrev"],u=d[".debug_str"],f=new Z(A);for(;f.p<A.length;){let O=f.p,l=f.u32()+f.p,D=f.u16(),x=f.u32(),Y=f.u8();if(D!==4||Y!==4)throw Error("DWARF bilgi profili desteklenmiyor.");let k=new Z(m,x),ue=new Map;for(let y;y=k.leb();){let X=k.leb(),B=k.u8(),z=[];for(;;){let h=k.leb(),F=k.leb();if(!h&&!F)break;z.push([h,F])}ue.set(y,{tag:X,children:B,attrs:z})}let se=y=>{switch(y){case 1:return f.u32();case 3:return f.block(f.u16());case 4:return f.block(f.u32());case 5:return f.u16();case 6:return f.u32();case 7:{let X=f.u32(),B=f.u32();return X+B*4294967296}case 8:return f.str();case 9:return f.block(f.leb());case 10:return f.block(f.u8());case 11:case 12:return f.u8();case 13:return f.leb(!0);case 14:return new Z(u,f.u32()).str();case 15:return f.leb();case 16:return f.u32();case 17:return O+f.u8();case 18:return O+f.u16();case 19:return O+f.u32();case 21:return O+f.leb();case 22:return se(f.leb());case 23:return f.u32();case 24:return f.block(f.leb());case 25:return 1;default:throw Error("DWARF formu desteklenmiyor: "+y)}},Q=[];for(;f.p<l;){let y=f.p,X=f.leb();if(!X){Q.pop();continue}let B=ue.get(X);if(!B)throw Error("DWARF abbreviation bulunamad\u0131.");let z={},h={};for(let[Ee,Te]of B.attrs)z[Ee]=se(Te),h[Ee]=Te;let F={offset:y,tag:B.tag,attrs:z,forms:h,parent:Q.at(-1)?.offset};R.push(F),r.set(y,F),B.children&&Q.push(F)}f.p=l}let c=O=>{for(let l=O;l;l=r.get(l.parent)){let D=l.attrs;if(D[17]!==void 0&&D[18]!==void 0)return[D[17],l.forms[18]===1?D[18]:D[17]+D[18]]}return null},p=(O,l=0)=>{if(l>12)return{name:"?",size:0};let D=r.get(O);if(!D)return{name:"?",size:0};let x=D.attrs;return[22,38,53,55].includes(D.tag)?p(x[73],l+1):D.tag===15?{name:"pointer",size:x[11]||4,encoding:7}:D.tag===36||D.tag===4?{name:x[3]||"enum",size:x[11]||4,encoding:x[62]||5}:{name:x[3]||"aggregate",size:x[11]||0,encoding:0}},v=R.filter(O=>[52,5].includes(O.tag)&&O.attrs[3]).flatMap(O=>{let l=r.get(O.parent),D,x=!1,Y;for(;l;)l.tag===46&&(D=l.attrs[64],x=!0),l.tag===17&&(Y=l),l=r.get(l.parent);return e.some(k=>Y?.attrs[3]===k||Y?.attrs[3]?.endsWith("/"+k))?[{name:O.attrs[3],type:p(O.attrs[73]),location:O.attrs[2],frame:D,scope:x?c(O):null,parameter:O.tag===5}]:[]}),g=I.sort((O,l)=>O.address-l.address);return{version:1,lines:g.map((O,l)=>({...O,to:g[l+1]?.address??O.address+2})).filter(O=>O.file&&!O.end&&O.line>0&&O.to>O.address),variables:v}}var Mi=new TextEncoder;function tn(n){let e=4294967295;for(let _ of n){e^=_;for(let E=0;E<8;E++)e=e>>>1^(e&1?3988292384:0)}return(e^4294967295)>>>0}function pn(n,e){let _=new Uint8Array(80+n.length),E=new DataView(_.buffer);return _.set(new TextEncoder().encode("CFNRF52\0")),_.set(new TextEncoder().encode(e),8),E.setUint32(64,n.length,!0),E.setUint32(68,tn(n),!0),_.set(n,80),E_(_,e),_}function E_(n,e){if(!ie[e]||!(n instanceof Uint8Array)||n.length<88)throw Error("nRF52 firmware hedefi/ba\u015Fl\u0131\u011F\u0131 ge\xE7ersiz.");let _=new DataView(n.buffer,n.byteOffset,n.byteLength),E=new TextDecoder,d=n.subarray(80);if(E.decode(n.subarray(0,8))!=="CFNRF52\0"||E.decode(n.subarray(8,64)).replace(/\0.*$/s,"")!==e||n.subarray(72,80).some(i=>i)||_.getUint32(64,!0)!==d.length||d.length>1048576||_.getUint32(68,!0)!==tn(d))throw Error("nRF52 firmware hedefi/boyutu/CRC ge\xE7ersiz.");if(_.getUint32(80,!0)!==537133056||!(_.getUint32(84,!0)&1)||_.getUint32(84,!0)<8||_.getUint32(84,!0)>=d.length)throw Error("nRF52840 reset vekt\xF6r\xFC ge\xE7ersiz.");return d}async function Fi(n,e,_="nrf52840-supermini",E=[],d="c"){if(!ie[_]||d!=="c")throw Error("nRF52840 yaln\u0131z C17 / main.c destekler.");let i=un(ie[_]),t=Mn,s=en([{name:"main.c",content:e},...E],{language:"c"});for(let f of s)if(Object.hasOwn(i,f.name)||["cf_nrf_runtime.c","link.ld"].includes(f.name))throw Error("nRF52840 SDK dosya ad\u0131 ayr\u0131lm\u0131\u015Ft\u0131r: "+f.name);let T=new Map(s.map(f=>[f.name,f.content]));for(let[f,c]of Object.entries(i))T.set(f,c);T.set("cf_nrf_runtime.c",t),T.set("link.ld",`ENTRY(Reset_Handler)
MEMORY { FLASH (rx) : ORIGIN = 0, LENGTH = 1024K RAM (rw) : ORIGIN = 0x20000000, LENGTH = 256K }
_estack = ORIGIN(RAM)+LENGTH(RAM);
SECTIONS { .vectors : { KEEP(*(.vectors)) } > FLASH .text : { *(.text*) *(.rodata*) } > FLASH .ARM.exidx : { *(.ARM.exidx*) } > FLASH .data : { _sdata = .; *(.data*) _edata = .; } > RAM AT> FLASH _sidata = LOADADDR(.data); .bss (NOLOAD) : { _sbss = .; *(.bss*) *(COMMON) _ebss = .; } > RAM ASSERT(_ebss <= _estack-2048,"nRF52840 SRAM: 2 KiB stack rezervi gerekli") /DISCARD/ : { *(.comment*) *(.eh_frame*) } }`);let o=new Map;for(let[f,c]of T){let p=o,v=f.split("/");for(let g of v.slice(0,-1)){if(p.has(g)||p.set(g,new Map),!(p.get(g)instanceof Map))throw Error("Kaynak yol \xE7ak\u0131\u015Fmas\u0131.");p=p.get(g)}if(p.get(v.at(-1))instanceof Map)throw Error("Kaynak yol \xE7ak\u0131\u015Fmas\u0131.");p.set(v.at(-1),new J(new TextEncoder().encode(c)))}let I=f=>new Map([...f].map(([c,p])=>[c,p instanceof Map?new w(I(p)):p])),a=I(o),R=[],r=`nRF52840 C17 / 64 MHz / 1 MiB flash / 256 KiB SRAM; Nordic register headers; bounded peripherals
`;for(let f of[...s.filter(c=>c.name.endsWith(".c")),{name:"cf_nrf_runtime.c"}]){let c="unit"+R.length+".o";r+=await nn(n,a,["clang","--target=arm-none-eabi","-mcpu=cortex-m4","-mthumb","-mfpu=fpv4-sp-d16","-mfloat-abi=hard","-std=c17","-ffreestanding","-nostdinc","-I.","-O0","-g","-gdwarf-4","-fno-omit-frame-pointer","-fno-inline","-fno-builtin","-ffunction-sections","-fdata-sections","-Werror=implicit-function-declaration","-c",f.name,"-o",c]),R.push(c)}r+=await nn(n,a,["ld.lld","--threads=1","--gc-sections","-T","link.ld",...R,"-o","firmware.elf"]);let N=a.get("firmware.elf").data,S=new DataView(N.buffer,N.byteOffset,N.byteLength),P=[],A=0,m=0;for(let f=0;f<S.getUint16(44,!0);f++){let c=S.getUint32(28,!0)+f*S.getUint16(42,!0);if(S.getUint32(c,!0)!==1)continue;let p=S.getUint32(c+12,!0),v=S.getUint32(c+8,!0),g=S.getUint32(c+16,!0),O=S.getUint32(c+20,!0),l=S.getUint32(c+4,!0);if(v>=536870912&&(m=Math.max(m,v+O-536870912)),g){if(p+g>1048576)throw Error("nRF52840 Flash segmenti ge\xE7ersiz.");P.push({p,n:g,o:l}),A=Math.max(A,p+g)}}let u=new Uint8Array(A);for(let f of P)u.set(N.subarray(f.o,f.o+f.n),f.p);return{image:pn(u,_),elf:N,debugInfo:cn(N,s.map(f=>f.name)),flashBytes:u.length,staticRamBytes:m,log:r}}export{Fi as compileNRF52};

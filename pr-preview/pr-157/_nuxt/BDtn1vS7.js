var e=`.parts.json`;async function t(e,t,n,r,i){if(!e.body)throw Error(`download has no response body`);let a=e.body.getReader(),o=0;try{for(;;){i?.throwIfAborted();let{done:e,value:s}=await a.read();if(e)break;if(n+o+s.byteLength>t.byteLength)throw Error(`download is larger than declared`);t.set(s,n+o),o+=s.byteLength,r(o)}}finally{a.releaseLock()}return o}async function n(n,r={}){let{signal:i,onProgress:a,maxBytes:o}=r,s=await fetch(n+e,{signal:i,cache:`no-store`});if(s.ok){let e=await s.json(),r=e.parts.reduce((e,t)=>e+t.size,0);if(!Number.isInteger(e.size)||r!==e.size)throw Error(`vendor manifest is inconsistent`);if(o!==void 0&&e.size>o)throw Error(`download exceeds ${o} bytes`);let c=new Uint8Array(e.size),l=n.slice(0,n.lastIndexOf(`/`)+1),u=0;for(let n of e.parts){i?.throwIfAborted();let r=await fetch(l+n.name,{signal:i,cache:`no-store`});if(!r.ok)throw Error(`download failed (${r.status})`);let o=await t(r,c,u,t=>a?.(u+t,e.size),i);if(o!==n.size)throw Error(`vendor part size mismatch`);u+=o}return c}if(s.status!==404)throw Error(`download failed (${s.status})`);let c=await fetch(n,{signal:i,cache:`no-store`});if(!c.ok)throw Error(`download failed (${c.status})`);let l=Number(c.headers.get(`content-length`))||0;if(o!==void 0&&l>o)throw Error(`download exceeds ${o} bytes`);if(l>0){let e=new Uint8Array(l),n=await t(c,e,0,e=>a?.(e,l),i);return n===l?e:e.subarray(0,n)}let u=[],d=0;if(!c.body)throw Error(`download has no response body`);let f=c.body.getReader();try{for(;;){i?.throwIfAborted();let{done:e,value:t}=await f.read();if(e)break;if(d+=t.byteLength,o!==void 0&&d>o)throw Error(`download exceeds ${o} bytes`);u.push(t),a?.(d,d)}}finally{f.releaseLock()}let p=new Uint8Array(d),m=0;for(let e of u)p.set(e,m),m+=e.byteLength;return p}var r=`
async function fetchVendorBytes(url) {
  var manifestResponse = await fetch(url + "${e}", { cache: "no-store" });
  if (manifestResponse.ok) {
    var manifest = await manifestResponse.json();
    var bytes = new Uint8Array(manifest.size);
    var base = url.slice(0, url.lastIndexOf("/") + 1);
    var offset = 0;
    for (var i = 0; i < manifest.parts.length; i++) {
      var part = await fetch(base + manifest.parts[i].name, { cache: "no-store" });
      if (!part.ok) throw new Error("download failed (" + part.status + ")");
      var chunk = new Uint8Array(await part.arrayBuffer());
      if (chunk.byteLength !== manifest.parts[i].size) throw new Error("vendor part size mismatch");
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    if (offset !== manifest.size) throw new Error("vendor manifest is inconsistent");
    return bytes;
  }
  if (manifestResponse.status !== 404) throw new Error("download failed (" + manifestResponse.status + ")");
  var response = await fetch(url);
  if (!response.ok) throw new Error("download failed (" + response.status + ")");
  return new Uint8Array(await response.arrayBuffer());
}
`;export{n,r as t};
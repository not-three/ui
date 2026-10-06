const e="lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua".split(" "),c=async(u,r)=>{const t=Number(r.count??50);if(!Number.isInteger(t)||t<1||t>1e3)throw new Error("Count must be between 1 and 1000");return r.mode==="paragraphs"?{kind:"text",text:Array.from({length:t},(n,i)=>{const o=Array.from({length:40},(d,s)=>e[(s+i*7)%e.length]).join(" ");return o[0].toUpperCase()+o.slice(1)+"."}).join(`

`)}:{kind:"text",text:Array.from({length:t},(a,n)=>e[n%e.length]).join(" ")}};export{c as run};

import{r as d}from"./DUvdlj1-.js";const x=async(c,r)=>{const n=d(c.input);if(!n)return{kind:"text",text:""};const o=n.endsWith(`
`),s=n.split(`
`);o&&s.pop();const l=r.unique?[...new Set(s)]:s,m=new Intl.Collator(void 0,{numeric:r.numeric===!0});return{kind:"text",text:l.map((e,t)=>({value:e,index:t})).sort((e,t)=>{const u=Number.parseFloat(e.value),i=Number.parseFloat(t.value),a=r.numeric&&!Number.isNaN(u)&&!Number.isNaN(i)?u-i:m.compare(e.value,t.value);return(r.reverse?-a:a)||e.index-t.index}).map(e=>e.value).join(`
`)+(o?`
`:"")}};export{x as run};

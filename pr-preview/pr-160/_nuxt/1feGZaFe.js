import{r as e}from"./BQuo0PKa.js";var t=async(t,n)=>{let r=e(t.input);if(!r)return{kind:`text`,text:``};let i=r.endsWith(`
`),a=r.split(`
`);i&&a.pop();let o=n.unique?[...new Set(a)]:a,s=new Intl.Collator(void 0,{numeric:n.numeric===!0});return{kind:`text`,text:o.map((e,t)=>({value:e,index:t})).sort((e,t)=>{let r=Number.parseFloat(e.value),i=Number.parseFloat(t.value),a=n.numeric&&!Number.isNaN(r)&&!Number.isNaN(i)?r-i:s.compare(e.value,t.value);return(n.reverse?-a:a)||e.index-t.index}).map(e=>e.value).join(`
`)+(i?`
`:``)}};export{t as run};
import{r}from"./DUvdlj1-.js";const o=async n=>{const e=r(n.input),t=e.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length??0;return{kind:"table",columns:["Metric","Value"],rows:[["Characters",[...e].length],["Words",t],["Lines",e?e.split(`
`).length:0],["UTF-8 bytes",new TextEncoder().encode(e).byteLength],["Reading time (minutes)",Math.round(t/200*100)/100]]}};export{o as run};

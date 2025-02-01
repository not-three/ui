import{m as Le}from"./BZ5c-Gzu.js";import"./Dvpf0ChU.js";import"./Nx734VEj.js";import"./DQ9T0cbp.js";/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.46.0(21007360cad28648bdf46282a2592cb47c3a7a6f)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/var je=Object.defineProperty,Ne=Object.getOwnPropertyDescriptor,We=Object.getOwnPropertyNames,Oe=Object.prototype.hasOwnProperty,Ue=(e,r,i,t)=>{if(r&&typeof r=="object"||typeof r=="function")for(let n of We(r))!Oe.call(e,n)&&n!==i&&je(e,n,{get:()=>r[n],enumerable:!(t=Ne(r,n))||t.enumerable});return e},Ve=(e,r,i)=>(Ue(e,r,"default"),i),c={};Ve(c,Le);var He=2*60*1e3,ze=class{constructor(e){this._defaults=e,this._worker=null,this._client=null,this._idleCheckInterval=window.setInterval(()=>this._checkIfIdle(),30*1e3),this._lastUsedTime=0,this._configChangeListener=this._defaults.onDidChange(()=>this._stopWorker())}_stopWorker(){this._worker&&(this._worker.dispose(),this._worker=null),this._client=null}dispose(){clearInterval(this._idleCheckInterval),this._configChangeListener.dispose(),this._stopWorker()}_checkIfIdle(){if(!this._worker)return;Date.now()-this._lastUsedTime>He&&this._stopWorker()}_getClient(){return this._lastUsedTime=Date.now(),this._client||(this._worker=c.editor.createWebWorker({moduleId:"vs/language/css/cssWorker",label:this._defaults.languageId,createData:{options:this._defaults.options,languageId:this._defaults.languageId}}),this._client=this._worker.getProxy()),this._client}getLanguageServiceWorker(...e){let r;return this._getClient().then(i=>{r=i}).then(i=>{if(this._worker)return this._worker.withSyncedResources(e)}).then(i=>r)}},J;(function(e){e.MIN_VALUE=-2147483648,e.MAX_VALUE=2147483647})(J||(J={}));var W;(function(e){e.MIN_VALUE=0,e.MAX_VALUE=2147483647})(W||(W={}));var k;(function(e){function r(t,n){return t===Number.MAX_VALUE&&(t=W.MAX_VALUE),n===Number.MAX_VALUE&&(n=W.MAX_VALUE),{line:t,character:n}}e.create=r;function i(t){var n=t;return o.objectLiteral(n)&&o.uinteger(n.line)&&o.uinteger(n.character)}e.is=i})(k||(k={}));var v;(function(e){function r(t,n,a,s){if(o.uinteger(t)&&o.uinteger(n)&&o.uinteger(a)&&o.uinteger(s))return{start:k.create(t,n),end:k.create(a,s)};if(k.is(t)&&k.is(n))return{start:t,end:n};throw new Error("Range#create called with invalid arguments["+t+", "+n+", "+a+", "+s+"]")}e.create=r;function i(t){var n=t;return o.objectLiteral(n)&&k.is(n.start)&&k.is(n.end)}e.is=i})(v||(v={}));var z;(function(e){function r(t,n){return{uri:t,range:n}}e.create=r;function i(t){var n=t;return o.defined(n)&&v.is(n.range)&&(o.string(n.uri)||o.undefined(n.uri))}e.is=i})(z||(z={}));var Y;(function(e){function r(t,n,a,s){return{targetUri:t,targetRange:n,targetSelectionRange:a,originSelectionRange:s}}e.create=r;function i(t){var n=t;return o.defined(n)&&v.is(n.targetRange)&&o.string(n.targetUri)&&(v.is(n.targetSelectionRange)||o.undefined(n.targetSelectionRange))&&(v.is(n.originSelectionRange)||o.undefined(n.originSelectionRange))}e.is=i})(Y||(Y={}));var X;(function(e){function r(t,n,a,s){return{red:t,green:n,blue:a,alpha:s}}e.create=r;function i(t){var n=t;return o.numberRange(n.red,0,1)&&o.numberRange(n.green,0,1)&&o.numberRange(n.blue,0,1)&&o.numberRange(n.alpha,0,1)}e.is=i})(X||(X={}));var Z;(function(e){function r(t,n){return{range:t,color:n}}e.create=r;function i(t){var n=t;return v.is(n.range)&&X.is(n.color)}e.is=i})(Z||(Z={}));var K;(function(e){function r(t,n,a){return{label:t,textEdit:n,additionalTextEdits:a}}e.create=r;function i(t){var n=t;return o.string(n.label)&&(o.undefined(n.textEdit)||x.is(n))&&(o.undefined(n.additionalTextEdits)||o.typedArray(n.additionalTextEdits,x.is))}e.is=i})(K||(K={}));var R;(function(e){e.Comment="comment",e.Imports="imports",e.Region="region"})(R||(R={}));var ee;(function(e){function r(t,n,a,s,u){var g={startLine:t,endLine:n};return o.defined(a)&&(g.startCharacter=a),o.defined(s)&&(g.endCharacter=s),o.defined(u)&&(g.kind=u),g}e.create=r;function i(t){var n=t;return o.uinteger(n.startLine)&&o.uinteger(n.startLine)&&(o.undefined(n.startCharacter)||o.uinteger(n.startCharacter))&&(o.undefined(n.endCharacter)||o.uinteger(n.endCharacter))&&(o.undefined(n.kind)||o.string(n.kind))}e.is=i})(ee||(ee={}));var B;(function(e){function r(t,n){return{location:t,message:n}}e.create=r;function i(t){var n=t;return o.defined(n)&&z.is(n.location)&&o.string(n.message)}e.is=i})(B||(B={}));var y;(function(e){e.Error=1,e.Warning=2,e.Information=3,e.Hint=4})(y||(y={}));var ne;(function(e){e.Unnecessary=1,e.Deprecated=2})(ne||(ne={}));var te;(function(e){function r(i){var t=i;return t!=null&&o.string(t.href)}e.is=r})(te||(te={}));var O;(function(e){function r(t,n,a,s,u,g){var d={range:t,message:n};return o.defined(a)&&(d.severity=a),o.defined(s)&&(d.code=s),o.defined(u)&&(d.source=u),o.defined(g)&&(d.relatedInformation=g),d}e.create=r;function i(t){var n,a=t;return o.defined(a)&&v.is(a.range)&&o.string(a.message)&&(o.number(a.severity)||o.undefined(a.severity))&&(o.integer(a.code)||o.string(a.code)||o.undefined(a.code))&&(o.undefined(a.codeDescription)||o.string((n=a.codeDescription)===null||n===void 0?void 0:n.href))&&(o.string(a.source)||o.undefined(a.source))&&(o.undefined(a.relatedInformation)||o.typedArray(a.relatedInformation,B.is))}e.is=i})(O||(O={}));var D;(function(e){function r(t,n){for(var a=[],s=2;s<arguments.length;s++)a[s-2]=arguments[s];var u={title:t,command:n};return o.defined(a)&&a.length>0&&(u.arguments=a),u}e.create=r;function i(t){var n=t;return o.defined(n)&&o.string(n.title)&&o.string(n.command)}e.is=i})(D||(D={}));var x;(function(e){function r(a,s){return{range:a,newText:s}}e.replace=r;function i(a,s){return{range:{start:a,end:a},newText:s}}e.insert=i;function t(a){return{range:a,newText:""}}e.del=t;function n(a){var s=a;return o.objectLiteral(s)&&o.string(s.newText)&&v.is(s.range)}e.is=n})(x||(x={}));var I;(function(e){function r(t,n,a){var s={label:t};return n!==void 0&&(s.needsConfirmation=n),a!==void 0&&(s.description=a),s}e.create=r;function i(t){var n=t;return n!==void 0&&o.objectLiteral(n)&&o.string(n.label)&&(o.boolean(n.needsConfirmation)||n.needsConfirmation===void 0)&&(o.string(n.description)||n.description===void 0)}e.is=i})(I||(I={}));var m;(function(e){function r(i){var t=i;return typeof t=="string"}e.is=r})(m||(m={}));var b;(function(e){function r(a,s,u){return{range:a,newText:s,annotationId:u}}e.replace=r;function i(a,s,u){return{range:{start:a,end:a},newText:s,annotationId:u}}e.insert=i;function t(a,s){return{range:a,newText:"",annotationId:s}}e.del=t;function n(a){var s=a;return x.is(s)&&(I.is(s.annotationId)||m.is(s.annotationId))}e.is=n})(b||(b={}));var U;(function(e){function r(t,n){return{textDocument:t,edits:n}}e.create=r;function i(t){var n=t;return o.defined(n)&&V.is(n.textDocument)&&Array.isArray(n.edits)}e.is=i})(U||(U={}));var M;(function(e){function r(t,n,a){var s={kind:"create",uri:t};return n!==void 0&&(n.overwrite!==void 0||n.ignoreIfExists!==void 0)&&(s.options=n),a!==void 0&&(s.annotationId=a),s}e.create=r;function i(t){var n=t;return n&&n.kind==="create"&&o.string(n.uri)&&(n.options===void 0||(n.options.overwrite===void 0||o.boolean(n.options.overwrite))&&(n.options.ignoreIfExists===void 0||o.boolean(n.options.ignoreIfExists)))&&(n.annotationId===void 0||m.is(n.annotationId))}e.is=i})(M||(M={}));var S;(function(e){function r(t,n,a,s){var u={kind:"rename",oldUri:t,newUri:n};return a!==void 0&&(a.overwrite!==void 0||a.ignoreIfExists!==void 0)&&(u.options=a),s!==void 0&&(u.annotationId=s),u}e.create=r;function i(t){var n=t;return n&&n.kind==="rename"&&o.string(n.oldUri)&&o.string(n.newUri)&&(n.options===void 0||(n.options.overwrite===void 0||o.boolean(n.options.overwrite))&&(n.options.ignoreIfExists===void 0||o.boolean(n.options.ignoreIfExists)))&&(n.annotationId===void 0||m.is(n.annotationId))}e.is=i})(S||(S={}));var T;(function(e){function r(t,n,a){var s={kind:"delete",uri:t};return n!==void 0&&(n.recursive!==void 0||n.ignoreIfNotExists!==void 0)&&(s.options=n),a!==void 0&&(s.annotationId=a),s}e.create=r;function i(t){var n=t;return n&&n.kind==="delete"&&o.string(n.uri)&&(n.options===void 0||(n.options.recursive===void 0||o.boolean(n.options.recursive))&&(n.options.ignoreIfNotExists===void 0||o.boolean(n.options.ignoreIfNotExists)))&&(n.annotationId===void 0||m.is(n.annotationId))}e.is=i})(T||(T={}));var $;(function(e){function r(i){var t=i;return t&&(t.changes!==void 0||t.documentChanges!==void 0)&&(t.documentChanges===void 0||t.documentChanges.every(function(n){return o.string(n.kind)?M.is(n)||S.is(n)||T.is(n):U.is(n)}))}e.is=r})($||($={}));var N=function(){function e(r,i){this.edits=r,this.changeAnnotations=i}return e.prototype.insert=function(r,i,t){var n,a;if(t===void 0?n=x.insert(r,i):m.is(t)?(a=t,n=b.insert(r,i,t)):(this.assertChangeAnnotations(this.changeAnnotations),a=this.changeAnnotations.manage(t),n=b.insert(r,i,a)),this.edits.push(n),a!==void 0)return a},e.prototype.replace=function(r,i,t){var n,a;if(t===void 0?n=x.replace(r,i):m.is(t)?(a=t,n=b.replace(r,i,t)):(this.assertChangeAnnotations(this.changeAnnotations),a=this.changeAnnotations.manage(t),n=b.replace(r,i,a)),this.edits.push(n),a!==void 0)return a},e.prototype.delete=function(r,i){var t,n;if(i===void 0?t=x.del(r):m.is(i)?(n=i,t=b.del(r,i)):(this.assertChangeAnnotations(this.changeAnnotations),n=this.changeAnnotations.manage(i),t=b.del(r,n)),this.edits.push(t),n!==void 0)return n},e.prototype.add=function(r){this.edits.push(r)},e.prototype.all=function(){return this.edits},e.prototype.clear=function(){this.edits.splice(0,this.edits.length)},e.prototype.assertChangeAnnotations=function(r){if(r===void 0)throw new Error("Text edit change is not configured to manage change annotations.")},e}(),re=function(){function e(r){this._annotations=r===void 0?Object.create(null):r,this._counter=0,this._size=0}return e.prototype.all=function(){return this._annotations},Object.defineProperty(e.prototype,"size",{get:function(){return this._size},enumerable:!1,configurable:!0}),e.prototype.manage=function(r,i){var t;if(m.is(r)?t=r:(t=this.nextId(),i=r),this._annotations[t]!==void 0)throw new Error("Id "+t+" is already in use.");if(i===void 0)throw new Error("No annotation provided for id "+t);return this._annotations[t]=i,this._size++,t},e.prototype.nextId=function(){return this._counter++,this._counter.toString()},e}();(function(){function e(r){var i=this;this._textEditChanges=Object.create(null),r!==void 0?(this._workspaceEdit=r,r.documentChanges?(this._changeAnnotations=new re(r.changeAnnotations),r.changeAnnotations=this._changeAnnotations.all(),r.documentChanges.forEach(function(t){if(U.is(t)){var n=new N(t.edits,i._changeAnnotations);i._textEditChanges[t.textDocument.uri]=n}})):r.changes&&Object.keys(r.changes).forEach(function(t){var n=new N(r.changes[t]);i._textEditChanges[t]=n})):this._workspaceEdit={}}return Object.defineProperty(e.prototype,"edit",{get:function(){return this.initDocumentChanges(),this._changeAnnotations!==void 0&&(this._changeAnnotations.size===0?this._workspaceEdit.changeAnnotations=void 0:this._workspaceEdit.changeAnnotations=this._changeAnnotations.all()),this._workspaceEdit},enumerable:!1,configurable:!0}),e.prototype.getTextEditChange=function(r){if(V.is(r)){if(this.initDocumentChanges(),this._workspaceEdit.documentChanges===void 0)throw new Error("Workspace edit is not configured for document changes.");var i={uri:r.uri,version:r.version},t=this._textEditChanges[i.uri];if(!t){var n=[],a={textDocument:i,edits:n};this._workspaceEdit.documentChanges.push(a),t=new N(n,this._changeAnnotations),this._textEditChanges[i.uri]=t}return t}else{if(this.initChanges(),this._workspaceEdit.changes===void 0)throw new Error("Workspace edit is not configured for normal text edit changes.");var t=this._textEditChanges[r];if(!t){var n=[];this._workspaceEdit.changes[r]=n,t=new N(n),this._textEditChanges[r]=t}return t}},e.prototype.initDocumentChanges=function(){this._workspaceEdit.documentChanges===void 0&&this._workspaceEdit.changes===void 0&&(this._changeAnnotations=new re,this._workspaceEdit.documentChanges=[],this._workspaceEdit.changeAnnotations=this._changeAnnotations.all())},e.prototype.initChanges=function(){this._workspaceEdit.documentChanges===void 0&&this._workspaceEdit.changes===void 0&&(this._workspaceEdit.changes=Object.create(null))},e.prototype.createFile=function(r,i,t){if(this.initDocumentChanges(),this._workspaceEdit.documentChanges===void 0)throw new Error("Workspace edit is not configured for document changes.");var n;I.is(i)||m.is(i)?n=i:t=i;var a,s;if(n===void 0?a=M.create(r,t):(s=m.is(n)?n:this._changeAnnotations.manage(n),a=M.create(r,t,s)),this._workspaceEdit.documentChanges.push(a),s!==void 0)return s},e.prototype.renameFile=function(r,i,t,n){if(this.initDocumentChanges(),this._workspaceEdit.documentChanges===void 0)throw new Error("Workspace edit is not configured for document changes.");var a;I.is(t)||m.is(t)?a=t:n=t;var s,u;if(a===void 0?s=S.create(r,i,n):(u=m.is(a)?a:this._changeAnnotations.manage(a),s=S.create(r,i,n,u)),this._workspaceEdit.documentChanges.push(s),u!==void 0)return u},e.prototype.deleteFile=function(r,i,t){if(this.initDocumentChanges(),this._workspaceEdit.documentChanges===void 0)throw new Error("Workspace edit is not configured for document changes.");var n;I.is(i)||m.is(i)?n=i:t=i;var a,s;if(n===void 0?a=T.create(r,t):(s=m.is(n)?n:this._changeAnnotations.manage(n),a=T.create(r,t,s)),this._workspaceEdit.documentChanges.push(a),s!==void 0)return s},e})();var ie;(function(e){function r(t){return{uri:t}}e.create=r;function i(t){var n=t;return o.defined(n)&&o.string(n.uri)}e.is=i})(ie||(ie={}));var ae;(function(e){function r(t,n){return{uri:t,version:n}}e.create=r;function i(t){var n=t;return o.defined(n)&&o.string(n.uri)&&o.integer(n.version)}e.is=i})(ae||(ae={}));var V;(function(e){function r(t,n){return{uri:t,version:n}}e.create=r;function i(t){var n=t;return o.defined(n)&&o.string(n.uri)&&(n.version===null||o.integer(n.version))}e.is=i})(V||(V={}));var se;(function(e){function r(t,n,a,s){return{uri:t,languageId:n,version:a,text:s}}e.create=r;function i(t){var n=t;return o.defined(n)&&o.string(n.uri)&&o.string(n.languageId)&&o.integer(n.version)&&o.string(n.text)}e.is=i})(se||(se={}));var F;(function(e){e.PlainText="plaintext",e.Markdown="markdown"})(F||(F={}));(function(e){function r(i){var t=i;return t===e.PlainText||t===e.Markdown}e.is=r})(F||(F={}));var q;(function(e){function r(i){var t=i;return o.objectLiteral(i)&&F.is(t.kind)&&o.string(t.value)}e.is=r})(q||(q={}));var l;(function(e){e.Text=1,e.Method=2,e.Function=3,e.Constructor=4,e.Field=5,e.Variable=6,e.Class=7,e.Interface=8,e.Module=9,e.Property=10,e.Unit=11,e.Value=12,e.Enum=13,e.Keyword=14,e.Snippet=15,e.Color=16,e.File=17,e.Reference=18,e.Folder=19,e.EnumMember=20,e.Constant=21,e.Struct=22,e.Event=23,e.Operator=24,e.TypeParameter=25})(l||(l={}));var Q;(function(e){e.PlainText=1,e.Snippet=2})(Q||(Q={}));var oe;(function(e){e.Deprecated=1})(oe||(oe={}));var ue;(function(e){function r(t,n,a){return{newText:t,insert:n,replace:a}}e.create=r;function i(t){var n=t;return n&&o.string(n.newText)&&v.is(n.insert)&&v.is(n.replace)}e.is=i})(ue||(ue={}));var ce;(function(e){e.asIs=1,e.adjustIndentation=2})(ce||(ce={}));var de;(function(e){function r(i){return{label:i}}e.create=r})(de||(de={}));var fe;(function(e){function r(i,t){return{items:i||[],isIncomplete:!!t}}e.create=r})(fe||(fe={}));var H;(function(e){function r(t){return t.replace(/[\\`*_{}[\]()#+\-.!]/g,"\\$&")}e.fromPlainText=r;function i(t){var n=t;return o.string(n)||o.objectLiteral(n)&&o.string(n.language)&&o.string(n.value)}e.is=i})(H||(H={}));var ge;(function(e){function r(i){var t=i;return!!t&&o.objectLiteral(t)&&(q.is(t.contents)||H.is(t.contents)||o.typedArray(t.contents,H.is))&&(i.range===void 0||v.is(i.range))}e.is=r})(ge||(ge={}));var le;(function(e){function r(i,t){return t?{label:i,documentation:t}:{label:i}}e.create=r})(le||(le={}));var he;(function(e){function r(i,t){for(var n=[],a=2;a<arguments.length;a++)n[a-2]=arguments[a];var s={label:i};return o.defined(t)&&(s.documentation=t),o.defined(n)?s.parameters=n:s.parameters=[],s}e.create=r})(he||(he={}));var P;(function(e){e.Text=1,e.Read=2,e.Write=3})(P||(P={}));var pe;(function(e){function r(i,t){var n={range:i};return o.number(t)&&(n.kind=t),n}e.create=r})(pe||(pe={}));var h;(function(e){e.File=1,e.Module=2,e.Namespace=3,e.Package=4,e.Class=5,e.Method=6,e.Property=7,e.Field=8,e.Constructor=9,e.Enum=10,e.Interface=11,e.Function=12,e.Variable=13,e.Constant=14,e.String=15,e.Number=16,e.Boolean=17,e.Array=18,e.Object=19,e.Key=20,e.Null=21,e.EnumMember=22,e.Struct=23,e.Event=24,e.Operator=25,e.TypeParameter=26})(h||(h={}));var ve;(function(e){e.Deprecated=1})(ve||(ve={}));var me;(function(e){function r(i,t,n,a,s){var u={name:i,kind:t,location:{uri:a,range:n}};return s&&(u.containerName=s),u}e.create=r})(me||(me={}));var _e;(function(e){function r(t,n,a,s,u,g){var d={name:t,detail:n,kind:a,range:s,selectionRange:u};return g!==void 0&&(d.children=g),d}e.create=r;function i(t){var n=t;return n&&o.string(n.name)&&o.number(n.kind)&&v.is(n.range)&&v.is(n.selectionRange)&&(n.detail===void 0||o.string(n.detail))&&(n.deprecated===void 0||o.boolean(n.deprecated))&&(n.children===void 0||Array.isArray(n.children))&&(n.tags===void 0||Array.isArray(n.tags))}e.is=i})(_e||(_e={}));var we;(function(e){e.Empty="",e.QuickFix="quickfix",e.Refactor="refactor",e.RefactorExtract="refactor.extract",e.RefactorInline="refactor.inline",e.RefactorRewrite="refactor.rewrite",e.Source="source",e.SourceOrganizeImports="source.organizeImports",e.SourceFixAll="source.fixAll"})(we||(we={}));var ke;(function(e){function r(t,n){var a={diagnostics:t};return n!=null&&(a.only=n),a}e.create=r;function i(t){var n=t;return o.defined(n)&&o.typedArray(n.diagnostics,O.is)&&(n.only===void 0||o.typedArray(n.only,o.string))}e.is=i})(ke||(ke={}));var Ee;(function(e){function r(t,n,a){var s={title:t},u=!0;return typeof n=="string"?(u=!1,s.kind=n):D.is(n)?s.command=n:s.edit=n,u&&a!==void 0&&(s.kind=a),s}e.create=r;function i(t){var n=t;return n&&o.string(n.title)&&(n.diagnostics===void 0||o.typedArray(n.diagnostics,O.is))&&(n.kind===void 0||o.string(n.kind))&&(n.edit!==void 0||n.command!==void 0)&&(n.command===void 0||D.is(n.command))&&(n.isPreferred===void 0||o.boolean(n.isPreferred))&&(n.edit===void 0||$.is(n.edit))}e.is=i})(Ee||(Ee={}));var be;(function(e){function r(t,n){var a={range:t};return o.defined(n)&&(a.data=n),a}e.create=r;function i(t){var n=t;return o.defined(n)&&v.is(n.range)&&(o.undefined(n.command)||D.is(n.command))}e.is=i})(be||(be={}));var xe;(function(e){function r(t,n){return{tabSize:t,insertSpaces:n}}e.create=r;function i(t){var n=t;return o.defined(n)&&o.uinteger(n.tabSize)&&o.boolean(n.insertSpaces)}e.is=i})(xe||(xe={}));var Ce;(function(e){function r(t,n,a){return{range:t,target:n,data:a}}e.create=r;function i(t){var n=t;return o.defined(n)&&v.is(n.range)&&(o.undefined(n.target)||o.string(n.target))}e.is=i})(Ce||(Ce={}));var Ae;(function(e){function r(t,n){return{range:t,parent:n}}e.create=r;function i(t){var n=t;return n!==void 0&&v.is(n.range)&&(n.parent===void 0||e.is(n.parent))}e.is=i})(Ae||(Ae={}));var ye;(function(e){function r(a,s,u,g){return new Xe(a,s,u,g)}e.create=r;function i(a){var s=a;return!!(o.defined(s)&&o.string(s.uri)&&(o.undefined(s.languageId)||o.string(s.languageId))&&o.uinteger(s.lineCount)&&o.func(s.getText)&&o.func(s.positionAt)&&o.func(s.offsetAt))}e.is=i;function t(a,s){for(var u=a.getText(),g=n(s,function(A,j){var G=A.range.start.line-j.range.start.line;return G===0?A.range.start.character-j.range.start.character:G}),d=u.length,p=g.length-1;p>=0;p--){var w=g[p],E=a.offsetAt(w.range.start),f=a.offsetAt(w.range.end);if(f<=d)u=u.substring(0,E)+w.newText+u.substring(f,u.length);else throw new Error("Overlapping edit");d=E}return u}e.applyEdits=t;function n(a,s){if(a.length<=1)return a;var u=a.length/2|0,g=a.slice(0,u),d=a.slice(u);n(g,s),n(d,s);for(var p=0,w=0,E=0;p<g.length&&w<d.length;){var f=s(g[p],d[w]);f<=0?a[E++]=g[p++]:a[E++]=d[w++]}for(;p<g.length;)a[E++]=g[p++];for(;w<d.length;)a[E++]=d[w++];return a}})(ye||(ye={}));var Xe=function(){function e(r,i,t,n){this._uri=r,this._languageId=i,this._version=t,this._content=n,this._lineOffsets=void 0}return Object.defineProperty(e.prototype,"uri",{get:function(){return this._uri},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"languageId",{get:function(){return this._languageId},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"version",{get:function(){return this._version},enumerable:!1,configurable:!0}),e.prototype.getText=function(r){if(r){var i=this.offsetAt(r.start),t=this.offsetAt(r.end);return this._content.substring(i,t)}return this._content},e.prototype.update=function(r,i){this._content=r.text,this._version=i,this._lineOffsets=void 0},e.prototype.getLineOffsets=function(){if(this._lineOffsets===void 0){for(var r=[],i=this._content,t=!0,n=0;n<i.length;n++){t&&(r.push(n),t=!1);var a=i.charAt(n);t=a==="\r"||a===`
`,a==="\r"&&n+1<i.length&&i.charAt(n+1)===`
`&&n++}t&&i.length>0&&r.push(i.length),this._lineOffsets=r}return this._lineOffsets},e.prototype.positionAt=function(r){r=Math.max(Math.min(r,this._content.length),0);var i=this.getLineOffsets(),t=0,n=i.length;if(n===0)return k.create(0,r);for(;t<n;){var a=Math.floor((t+n)/2);i[a]>r?n=a:t=a+1}var s=t-1;return k.create(s,r-i[s])},e.prototype.offsetAt=function(r){var i=this.getLineOffsets();if(r.line>=i.length)return this._content.length;if(r.line<0)return 0;var t=i[r.line],n=r.line+1<i.length?i[r.line+1]:this._content.length;return Math.max(Math.min(t+r.character,n),t)},Object.defineProperty(e.prototype,"lineCount",{get:function(){return this.getLineOffsets().length},enumerable:!1,configurable:!0}),e}(),o;(function(e){var r=Object.prototype.toString;function i(f){return typeof f<"u"}e.defined=i;function t(f){return typeof f>"u"}e.undefined=t;function n(f){return f===!0||f===!1}e.boolean=n;function a(f){return r.call(f)==="[object String]"}e.string=a;function s(f){return r.call(f)==="[object Number]"}e.number=s;function u(f,A,j){return r.call(f)==="[object Number]"&&A<=f&&f<=j}e.numberRange=u;function g(f){return r.call(f)==="[object Number]"&&-2147483648<=f&&f<=2147483647}e.integer=g;function d(f){return r.call(f)==="[object Number]"&&0<=f&&f<=2147483647}e.uinteger=d;function p(f){return r.call(f)==="[object Function]"}e.func=p;function w(f){return f!==null&&typeof f=="object"}e.objectLiteral=w;function E(f,A){return Array.isArray(f)&&f.every(A)}e.typedArray=E})(o||(o={}));var Be=class{constructor(e,r,i){this._languageId=e,this._worker=r,this._disposables=[],this._listener=Object.create(null);const t=a=>{let s=a.getLanguageId();if(s!==this._languageId)return;let u;this._listener[a.uri.toString()]=a.onDidChangeContent(()=>{window.clearTimeout(u),u=window.setTimeout(()=>this._doValidate(a.uri,s),500)}),this._doValidate(a.uri,s)},n=a=>{c.editor.setModelMarkers(a,this._languageId,[]);let s=a.uri.toString(),u=this._listener[s];u&&(u.dispose(),delete this._listener[s])};this._disposables.push(c.editor.onDidCreateModel(t)),this._disposables.push(c.editor.onWillDisposeModel(n)),this._disposables.push(c.editor.onDidChangeModelLanguage(a=>{n(a.model),t(a.model)})),this._disposables.push(i(a=>{c.editor.getModels().forEach(s=>{s.getLanguageId()===this._languageId&&(n(s),t(s))})})),this._disposables.push({dispose:()=>{c.editor.getModels().forEach(n);for(let a in this._listener)this._listener[a].dispose()}}),c.editor.getModels().forEach(t)}dispose(){this._disposables.forEach(e=>e&&e.dispose()),this._disposables.length=0}_doValidate(e,r){this._worker(e).then(i=>i.doValidation(e.toString())).then(i=>{const t=i.map(a=>qe(e,a));let n=c.editor.getModel(e);n&&n.getLanguageId()===r&&c.editor.setModelMarkers(n,r,t)}).then(void 0,i=>{console.error(i)})}};function $e(e){switch(e){case y.Error:return c.MarkerSeverity.Error;case y.Warning:return c.MarkerSeverity.Warning;case y.Information:return c.MarkerSeverity.Info;case y.Hint:return c.MarkerSeverity.Hint;default:return c.MarkerSeverity.Info}}function qe(e,r){let i=typeof r.code=="number"?String(r.code):r.code;return{severity:$e(r.severity),startLineNumber:r.range.start.line+1,startColumn:r.range.start.character+1,endLineNumber:r.range.end.line+1,endColumn:r.range.end.character+1,message:r.message,code:i,source:r.source}}var Qe=class{constructor(e,r){this._worker=e,this._triggerCharacters=r}get triggerCharacters(){return this._triggerCharacters}provideCompletionItems(e,r,i,t){const n=e.uri;return this._worker(n).then(a=>a.doComplete(n.toString(),C(r))).then(a=>{if(!a)return;const s=e.getWordUntilPosition(r),u=new c.Range(r.lineNumber,s.startColumn,r.lineNumber,s.endColumn),g=a.items.map(d=>{const p={label:d.label,insertText:d.insertText||d.label,sortText:d.sortText,filterText:d.filterText,documentation:d.documentation,detail:d.detail,command:Ye(d.command),range:u,kind:Je(d.kind)};return d.textEdit&&(Ge(d.textEdit)?p.range={insert:_(d.textEdit.insert),replace:_(d.textEdit.replace)}:p.range=_(d.textEdit.range),p.insertText=d.textEdit.newText),d.additionalTextEdits&&(p.additionalTextEdits=d.additionalTextEdits.map(L)),d.insertTextFormat===Q.Snippet&&(p.insertTextRules=c.languages.CompletionItemInsertTextRule.InsertAsSnippet),p});return{isIncomplete:a.isIncomplete,suggestions:g}})}};function C(e){if(e)return{character:e.column-1,line:e.lineNumber-1}}function Pe(e){if(e)return{start:{line:e.startLineNumber-1,character:e.startColumn-1},end:{line:e.endLineNumber-1,character:e.endColumn-1}}}function _(e){if(e)return new c.Range(e.start.line+1,e.start.character+1,e.end.line+1,e.end.character+1)}function Ge(e){return typeof e.insert<"u"&&typeof e.replace<"u"}function Je(e){const r=c.languages.CompletionItemKind;switch(e){case l.Text:return r.Text;case l.Method:return r.Method;case l.Function:return r.Function;case l.Constructor:return r.Constructor;case l.Field:return r.Field;case l.Variable:return r.Variable;case l.Class:return r.Class;case l.Interface:return r.Interface;case l.Module:return r.Module;case l.Property:return r.Property;case l.Unit:return r.Unit;case l.Value:return r.Value;case l.Enum:return r.Enum;case l.Keyword:return r.Keyword;case l.Snippet:return r.Snippet;case l.Color:return r.Color;case l.File:return r.File;case l.Reference:return r.Reference}return r.Property}function L(e){if(e)return{range:_(e.range),text:e.newText}}function Ye(e){return e&&e.command==="editor.action.triggerSuggest"?{id:e.command,title:e.title,arguments:e.arguments}:void 0}var Ze=class{constructor(e){this._worker=e}provideHover(e,r,i){let t=e.uri;return this._worker(t).then(n=>n.doHover(t.toString(),C(r))).then(n=>{if(n)return{range:_(n.range),contents:en(n.contents)}})}};function Ke(e){return e&&typeof e=="object"&&typeof e.kind=="string"}function Ie(e){return typeof e=="string"?{value:e}:Ke(e)?e.kind==="plaintext"?{value:e.value.replace(/[\\`*_{}[\]()#+\-.!]/g,"\\$&")}:{value:e.value}:{value:"```"+e.language+`
`+e.value+"\n```\n"}}function en(e){if(e)return Array.isArray(e)?e.map(Ie):[Ie(e)]}var nn=class{constructor(e){this._worker=e}provideDocumentHighlights(e,r,i){const t=e.uri;return this._worker(t).then(n=>n.findDocumentHighlights(t.toString(),C(r))).then(n=>{if(n)return n.map(a=>({range:_(a.range),kind:tn(a.kind)}))})}};function tn(e){switch(e){case P.Read:return c.languages.DocumentHighlightKind.Read;case P.Write:return c.languages.DocumentHighlightKind.Write;case P.Text:return c.languages.DocumentHighlightKind.Text}return c.languages.DocumentHighlightKind.Text}var rn=class{constructor(e){this._worker=e}provideDefinition(e,r,i){const t=e.uri;return this._worker(t).then(n=>n.findDefinition(t.toString(),C(r))).then(n=>{if(n)return[De(n)]})}};function De(e){return{uri:c.Uri.parse(e.uri),range:_(e.range)}}var an=class{constructor(e){this._worker=e}provideReferences(e,r,i,t){const n=e.uri;return this._worker(n).then(a=>a.findReferences(n.toString(),C(r))).then(a=>{if(a)return a.map(De)})}},sn=class{constructor(e){this._worker=e}provideRenameEdits(e,r,i,t){const n=e.uri;return this._worker(n).then(a=>a.doRename(n.toString(),C(r),i)).then(a=>on(a))}};function on(e){if(!e||!e.changes)return;let r=[];for(let i in e.changes){const t=c.Uri.parse(i);for(let n of e.changes[i])r.push({resource:t,versionId:void 0,textEdit:{range:_(n.range),text:n.newText}})}return{edits:r}}var un=class{constructor(e){this._worker=e}provideDocumentSymbols(e,r){const i=e.uri;return this._worker(i).then(t=>t.findDocumentSymbols(i.toString())).then(t=>{if(t)return t.map(n=>cn(n)?Me(n):{name:n.name,detail:"",containerName:n.containerName,kind:Se(n.kind),range:_(n.location.range),selectionRange:_(n.location.range),tags:[]})})}};function cn(e){return"children"in e}function Me(e){return{name:e.name,detail:e.detail??"",kind:Se(e.kind),range:_(e.range),selectionRange:_(e.selectionRange),tags:e.tags??[],children:(e.children??[]).map(r=>Me(r))}}function Se(e){let r=c.languages.SymbolKind;switch(e){case h.File:return r.File;case h.Module:return r.Module;case h.Namespace:return r.Namespace;case h.Package:return r.Package;case h.Class:return r.Class;case h.Method:return r.Method;case h.Property:return r.Property;case h.Field:return r.Field;case h.Constructor:return r.Constructor;case h.Enum:return r.Enum;case h.Interface:return r.Interface;case h.Function:return r.Function;case h.Variable:return r.Variable;case h.Constant:return r.Constant;case h.String:return r.String;case h.Number:return r.Number;case h.Boolean:return r.Boolean;case h.Array:return r.Array}return r.Function}var kn=class{constructor(e){this._worker=e}provideLinks(e,r){const i=e.uri;return this._worker(i).then(t=>t.findDocumentLinks(i.toString())).then(t=>{if(t)return{links:t.map(n=>({range:_(n.range),url:n.target}))}})}},dn=class{constructor(e){this._worker=e}provideDocumentFormattingEdits(e,r,i){const t=e.uri;return this._worker(t).then(n=>n.format(t.toString(),null,Te(r)).then(a=>{if(!(!a||a.length===0))return a.map(L)}))}},fn=class{constructor(e){this._worker=e,this.canFormatMultipleRanges=!1}provideDocumentRangeFormattingEdits(e,r,i,t){const n=e.uri;return this._worker(n).then(a=>a.format(n.toString(),Pe(r),Te(i)).then(s=>{if(!(!s||s.length===0))return s.map(L)}))}};function Te(e){return{tabSize:e.tabSize,insertSpaces:e.insertSpaces}}var gn=class{constructor(e){this._worker=e}provideDocumentColors(e,r){const i=e.uri;return this._worker(i).then(t=>t.findDocumentColors(i.toString())).then(t=>{if(t)return t.map(n=>({color:n.color,range:_(n.range)}))})}provideColorPresentations(e,r,i){const t=e.uri;return this._worker(t).then(n=>n.getColorPresentations(t.toString(),r.color,Pe(r.range))).then(n=>{if(n)return n.map(a=>{let s={label:a.label};return a.textEdit&&(s.textEdit=L(a.textEdit)),a.additionalTextEdits&&(s.additionalTextEdits=a.additionalTextEdits.map(L)),s})})}},ln=class{constructor(e){this._worker=e}provideFoldingRanges(e,r,i){const t=e.uri;return this._worker(t).then(n=>n.getFoldingRanges(t.toString(),r)).then(n=>{if(n)return n.map(a=>{const s={start:a.startLine+1,end:a.endLine+1};return typeof a.kind<"u"&&(s.kind=hn(a.kind)),s})})}};function hn(e){switch(e){case R.Comment:return c.languages.FoldingRangeKind.Comment;case R.Imports:return c.languages.FoldingRangeKind.Imports;case R.Region:return c.languages.FoldingRangeKind.Region}}var pn=class{constructor(e){this._worker=e}provideSelectionRanges(e,r,i){const t=e.uri;return this._worker(t).then(n=>n.getSelectionRanges(t.toString(),r.map(C))).then(n=>{if(n)return n.map(a=>{const s=[];for(;a;)s.push({range:_(a.range)}),a=a.parent;return s})})}};function En(e){const r=[],i=[],t=new ze(e);r.push(t);const n=(...s)=>t.getLanguageServiceWorker(...s);function a(){const{languageId:s,modeConfiguration:u}=e;Fe(i),u.completionItems&&i.push(c.languages.registerCompletionItemProvider(s,new Qe(n,["/","-",":"]))),u.hovers&&i.push(c.languages.registerHoverProvider(s,new Ze(n))),u.documentHighlights&&i.push(c.languages.registerDocumentHighlightProvider(s,new nn(n))),u.definitions&&i.push(c.languages.registerDefinitionProvider(s,new rn(n))),u.references&&i.push(c.languages.registerReferenceProvider(s,new an(n))),u.documentSymbols&&i.push(c.languages.registerDocumentSymbolProvider(s,new un(n))),u.rename&&i.push(c.languages.registerRenameProvider(s,new sn(n))),u.colors&&i.push(c.languages.registerColorProvider(s,new gn(n))),u.foldingRanges&&i.push(c.languages.registerFoldingRangeProvider(s,new ln(n))),u.diagnostics&&i.push(new Be(s,n,e.onDidChange)),u.selectionRanges&&i.push(c.languages.registerSelectionRangeProvider(s,new pn(n))),u.documentFormattingEdits&&i.push(c.languages.registerDocumentFormattingEditProvider(s,new dn(n))),u.documentRangeFormattingEdits&&i.push(c.languages.registerDocumentRangeFormattingEditProvider(s,new fn(n)))}return a(),r.push(Re(i)),Re(r)}function Re(e){return{dispose:()=>Fe(e)}}function Fe(e){for(;e.length;)e.pop().dispose()}export{Qe as CompletionAdapter,rn as DefinitionAdapter,Be as DiagnosticsAdapter,gn as DocumentColorAdapter,dn as DocumentFormattingEditProvider,nn as DocumentHighlightAdapter,kn as DocumentLinkAdapter,fn as DocumentRangeFormattingEditProvider,un as DocumentSymbolAdapter,ln as FoldingRangeAdapter,Ze as HoverAdapter,an as ReferenceAdapter,sn as RenameAdapter,pn as SelectionRangeAdapter,ze as WorkerManager,C as fromPosition,Pe as fromRange,En as setupMode,_ as toRange,L as toTextEdit};

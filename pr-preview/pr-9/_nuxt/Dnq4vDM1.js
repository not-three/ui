import{m as Ke}from"./BZ5c-Gzu.js";import"./Dvpf0ChU.js";import"./Nx734VEj.js";import"./DQ9T0cbp.js";/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.46.0(21007360cad28648bdf46282a2592cb47c3a7a6f)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/var en=Object.defineProperty,nn=Object.getOwnPropertyDescriptor,tn=Object.getOwnPropertyNames,rn=Object.prototype.hasOwnProperty,an=(e,r,i,t)=>{if(r&&typeof r=="object"||typeof r=="function")for(let n of tn(r))!rn.call(e,n)&&n!==i&&en(e,n,{get:()=>r[n],enumerable:!(t=nn(r,n))||t.enumerable});return e},sn=(e,r,i)=>(an(e,r,"default"),i),f={};sn(f,Ke);var on=2*60*1e3,un=class{constructor(e){this._defaults=e,this._worker=null,this._client=null,this._idleCheckInterval=window.setInterval(()=>this._checkIfIdle(),30*1e3),this._lastUsedTime=0,this._configChangeListener=this._defaults.onDidChange(()=>this._stopWorker())}_stopWorker(){this._worker&&(this._worker.dispose(),this._worker=null),this._client=null}dispose(){clearInterval(this._idleCheckInterval),this._configChangeListener.dispose(),this._stopWorker()}_checkIfIdle(){if(!this._worker)return;Date.now()-this._lastUsedTime>on&&this._stopWorker()}_getClient(){return this._lastUsedTime=Date.now(),this._client||(this._worker=f.editor.createWebWorker({moduleId:"vs/language/json/jsonWorker",label:this._defaults.languageId,createData:{languageSettings:this._defaults.diagnosticsOptions,languageId:this._defaults.languageId,enableSchemaRequest:this._defaults.diagnosticsOptions.enableSchemaRequest}}),this._client=this._worker.getProxy()),this._client}getLanguageServiceWorker(...e){let r;return this._getClient().then(i=>{r=i}).then(i=>{if(this._worker)return this._worker.withSyncedResources(e)}).then(i=>r)}},oe;(function(e){e.MIN_VALUE=-2147483648,e.MAX_VALUE=2147483647})(oe||(oe={}));var Y;(function(e){e.MIN_VALUE=0,e.MAX_VALUE=2147483647})(Y||(Y={}));var T;(function(e){function r(t,n){return t===Number.MAX_VALUE&&(t=Y.MAX_VALUE),n===Number.MAX_VALUE&&(n=Y.MAX_VALUE),{line:t,character:n}}e.create=r;function i(t){var n=t;return o.objectLiteral(n)&&o.uinteger(n.line)&&o.uinteger(n.character)}e.is=i})(T||(T={}));var _;(function(e){function r(t,n,a,s){if(o.uinteger(t)&&o.uinteger(n)&&o.uinteger(a)&&o.uinteger(s))return{start:T.create(t,n),end:T.create(a,s)};if(T.is(t)&&T.is(n))return{start:t,end:n};throw new Error("Range#create called with invalid arguments["+t+", "+n+", "+a+", "+s+"]")}e.create=r;function i(t){var n=t;return o.objectLiteral(n)&&T.is(n.start)&&T.is(n.end)}e.is=i})(_||(_={}));var ee;(function(e){function r(t,n){return{uri:t,range:n}}e.create=r;function i(t){var n=t;return o.defined(n)&&_.is(n.range)&&(o.string(n.uri)||o.undefined(n.uri))}e.is=i})(ee||(ee={}));var ue;(function(e){function r(t,n,a,s){return{targetUri:t,targetRange:n,targetSelectionRange:a,originSelectionRange:s}}e.create=r;function i(t){var n=t;return o.defined(n)&&_.is(n.targetRange)&&o.string(n.targetUri)&&(_.is(n.targetSelectionRange)||o.undefined(n.targetSelectionRange))&&(_.is(n.originSelectionRange)||o.undefined(n.originSelectionRange))}e.is=i})(ue||(ue={}));var ne;(function(e){function r(t,n,a,s){return{red:t,green:n,blue:a,alpha:s}}e.create=r;function i(t){var n=t;return o.numberRange(n.red,0,1)&&o.numberRange(n.green,0,1)&&o.numberRange(n.blue,0,1)&&o.numberRange(n.alpha,0,1)}e.is=i})(ne||(ne={}));var ce;(function(e){function r(t,n){return{range:t,color:n}}e.create=r;function i(t){var n=t;return _.is(n.range)&&ne.is(n.color)}e.is=i})(ce||(ce={}));var de;(function(e){function r(t,n,a){return{label:t,textEdit:n,additionalTextEdits:a}}e.create=r;function i(t){var n=t;return o.string(n.label)&&(o.undefined(n.textEdit)||R.is(n))&&(o.undefined(n.additionalTextEdits)||o.typedArray(n.additionalTextEdits,R.is))}e.is=i})(de||(de={}));var W;(function(e){e.Comment="comment",e.Imports="imports",e.Region="region"})(W||(W={}));var fe;(function(e){function r(t,n,a,s,u){var l={startLine:t,endLine:n};return o.defined(a)&&(l.startCharacter=a),o.defined(s)&&(l.endCharacter=s),o.defined(u)&&(l.kind=u),l}e.create=r;function i(t){var n=t;return o.uinteger(n.startLine)&&o.uinteger(n.startLine)&&(o.undefined(n.startCharacter)||o.uinteger(n.startCharacter))&&(o.undefined(n.endCharacter)||o.uinteger(n.endCharacter))&&(o.undefined(n.kind)||o.string(n.kind))}e.is=i})(fe||(fe={}));var te;(function(e){function r(t,n){return{location:t,message:n}}e.create=r;function i(t){var n=t;return o.defined(n)&&ee.is(n.location)&&o.string(n.message)}e.is=i})(te||(te={}));var N;(function(e){e.Error=1,e.Warning=2,e.Information=3,e.Hint=4})(N||(N={}));var le;(function(e){e.Unnecessary=1,e.Deprecated=2})(le||(le={}));var ge;(function(e){function r(i){var t=i;return t!=null&&o.string(t.href)}e.is=r})(ge||(ge={}));var $;(function(e){function r(t,n,a,s,u,l){var c={range:t,message:n};return o.defined(a)&&(c.severity=a),o.defined(s)&&(c.code=s),o.defined(u)&&(c.source=u),o.defined(l)&&(c.relatedInformation=l),c}e.create=r;function i(t){var n,a=t;return o.defined(a)&&_.is(a.range)&&o.string(a.message)&&(o.number(a.severity)||o.undefined(a.severity))&&(o.integer(a.code)||o.string(a.code)||o.undefined(a.code))&&(o.undefined(a.codeDescription)||o.string((n=a.codeDescription)===null||n===void 0?void 0:n.href))&&(o.string(a.source)||o.undefined(a.source))&&(o.undefined(a.relatedInformation)||o.typedArray(a.relatedInformation,te.is))}e.is=i})($||($={}));var V;(function(e){function r(t,n){for(var a=[],s=2;s<arguments.length;s++)a[s-2]=arguments[s];var u={title:t,command:n};return o.defined(a)&&a.length>0&&(u.arguments=a),u}e.create=r;function i(t){var n=t;return o.defined(n)&&o.string(n.title)&&o.string(n.command)}e.is=i})(V||(V={}));var R;(function(e){function r(a,s){return{range:a,newText:s}}e.replace=r;function i(a,s){return{range:{start:a,end:a},newText:s}}e.insert=i;function t(a){return{range:a,newText:""}}e.del=t;function n(a){var s=a;return o.objectLiteral(s)&&o.string(s.newText)&&_.is(s.range)}e.is=n})(R||(R={}));var O;(function(e){function r(t,n,a){var s={label:t};return n!==void 0&&(s.needsConfirmation=n),a!==void 0&&(s.description=a),s}e.create=r;function i(t){var n=t;return n!==void 0&&o.objectLiteral(n)&&o.string(n.label)&&(o.boolean(n.needsConfirmation)||n.needsConfirmation===void 0)&&(o.string(n.description)||n.description===void 0)}e.is=i})(O||(O={}));var w;(function(e){function r(i){var t=i;return typeof t=="string"}e.is=r})(w||(w={}));var P;(function(e){function r(a,s,u){return{range:a,newText:s,annotationId:u}}e.replace=r;function i(a,s,u){return{range:{start:a,end:a},newText:s,annotationId:u}}e.insert=i;function t(a,s){return{range:a,newText:"",annotationId:s}}e.del=t;function n(a){var s=a;return R.is(s)&&(O.is(s.annotationId)||w.is(s.annotationId))}e.is=n})(P||(P={}));var G;(function(e){function r(t,n){return{textDocument:t,edits:n}}e.create=r;function i(t){var n=t;return o.defined(n)&&Q.is(n.textDocument)&&Array.isArray(n.edits)}e.is=i})(G||(G={}));var H;(function(e){function r(t,n,a){var s={kind:"create",uri:t};return n!==void 0&&(n.overwrite!==void 0||n.ignoreIfExists!==void 0)&&(s.options=n),a!==void 0&&(s.annotationId=a),s}e.create=r;function i(t){var n=t;return n&&n.kind==="create"&&o.string(n.uri)&&(n.options===void 0||(n.options.overwrite===void 0||o.boolean(n.options.overwrite))&&(n.options.ignoreIfExists===void 0||o.boolean(n.options.ignoreIfExists)))&&(n.annotationId===void 0||w.is(n.annotationId))}e.is=i})(H||(H={}));var z;(function(e){function r(t,n,a,s){var u={kind:"rename",oldUri:t,newUri:n};return a!==void 0&&(a.overwrite!==void 0||a.ignoreIfExists!==void 0)&&(u.options=a),s!==void 0&&(u.annotationId=s),u}e.create=r;function i(t){var n=t;return n&&n.kind==="rename"&&o.string(n.oldUri)&&o.string(n.newUri)&&(n.options===void 0||(n.options.overwrite===void 0||o.boolean(n.options.overwrite))&&(n.options.ignoreIfExists===void 0||o.boolean(n.options.ignoreIfExists)))&&(n.annotationId===void 0||w.is(n.annotationId))}e.is=i})(z||(z={}));var B;(function(e){function r(t,n,a){var s={kind:"delete",uri:t};return n!==void 0&&(n.recursive!==void 0||n.ignoreIfNotExists!==void 0)&&(s.options=n),a!==void 0&&(s.annotationId=a),s}e.create=r;function i(t){var n=t;return n&&n.kind==="delete"&&o.string(n.uri)&&(n.options===void 0||(n.options.recursive===void 0||o.boolean(n.options.recursive))&&(n.options.ignoreIfNotExists===void 0||o.boolean(n.options.ignoreIfNotExists)))&&(n.annotationId===void 0||w.is(n.annotationId))}e.is=i})(B||(B={}));var re;(function(e){function r(i){var t=i;return t&&(t.changes!==void 0||t.documentChanges!==void 0)&&(t.documentChanges===void 0||t.documentChanges.every(function(n){return o.string(n.kind)?H.is(n)||z.is(n)||B.is(n):G.is(n)}))}e.is=r})(re||(re={}));var J=function(){function e(r,i){this.edits=r,this.changeAnnotations=i}return e.prototype.insert=function(r,i,t){var n,a;if(t===void 0?n=R.insert(r,i):w.is(t)?(a=t,n=P.insert(r,i,t)):(this.assertChangeAnnotations(this.changeAnnotations),a=this.changeAnnotations.manage(t),n=P.insert(r,i,a)),this.edits.push(n),a!==void 0)return a},e.prototype.replace=function(r,i,t){var n,a;if(t===void 0?n=R.replace(r,i):w.is(t)?(a=t,n=P.replace(r,i,t)):(this.assertChangeAnnotations(this.changeAnnotations),a=this.changeAnnotations.manage(t),n=P.replace(r,i,a)),this.edits.push(n),a!==void 0)return a},e.prototype.delete=function(r,i){var t,n;if(i===void 0?t=R.del(r):w.is(i)?(n=i,t=P.del(r,i)):(this.assertChangeAnnotations(this.changeAnnotations),n=this.changeAnnotations.manage(i),t=P.del(r,n)),this.edits.push(t),n!==void 0)return n},e.prototype.add=function(r){this.edits.push(r)},e.prototype.all=function(){return this.edits},e.prototype.clear=function(){this.edits.splice(0,this.edits.length)},e.prototype.assertChangeAnnotations=function(r){if(r===void 0)throw new Error("Text edit change is not configured to manage change annotations.")},e}(),he=function(){function e(r){this._annotations=r===void 0?Object.create(null):r,this._counter=0,this._size=0}return e.prototype.all=function(){return this._annotations},Object.defineProperty(e.prototype,"size",{get:function(){return this._size},enumerable:!1,configurable:!0}),e.prototype.manage=function(r,i){var t;if(w.is(r)?t=r:(t=this.nextId(),i=r),this._annotations[t]!==void 0)throw new Error("Id "+t+" is already in use.");if(i===void 0)throw new Error("No annotation provided for id "+t);return this._annotations[t]=i,this._size++,t},e.prototype.nextId=function(){return this._counter++,this._counter.toString()},e}();(function(){function e(r){var i=this;this._textEditChanges=Object.create(null),r!==void 0?(this._workspaceEdit=r,r.documentChanges?(this._changeAnnotations=new he(r.changeAnnotations),r.changeAnnotations=this._changeAnnotations.all(),r.documentChanges.forEach(function(t){if(G.is(t)){var n=new J(t.edits,i._changeAnnotations);i._textEditChanges[t.textDocument.uri]=n}})):r.changes&&Object.keys(r.changes).forEach(function(t){var n=new J(r.changes[t]);i._textEditChanges[t]=n})):this._workspaceEdit={}}return Object.defineProperty(e.prototype,"edit",{get:function(){return this.initDocumentChanges(),this._changeAnnotations!==void 0&&(this._changeAnnotations.size===0?this._workspaceEdit.changeAnnotations=void 0:this._workspaceEdit.changeAnnotations=this._changeAnnotations.all()),this._workspaceEdit},enumerable:!1,configurable:!0}),e.prototype.getTextEditChange=function(r){if(Q.is(r)){if(this.initDocumentChanges(),this._workspaceEdit.documentChanges===void 0)throw new Error("Workspace edit is not configured for document changes.");var i={uri:r.uri,version:r.version},t=this._textEditChanges[i.uri];if(!t){var n=[],a={textDocument:i,edits:n};this._workspaceEdit.documentChanges.push(a),t=new J(n,this._changeAnnotations),this._textEditChanges[i.uri]=t}return t}else{if(this.initChanges(),this._workspaceEdit.changes===void 0)throw new Error("Workspace edit is not configured for normal text edit changes.");var t=this._textEditChanges[r];if(!t){var n=[];this._workspaceEdit.changes[r]=n,t=new J(n),this._textEditChanges[r]=t}return t}},e.prototype.initDocumentChanges=function(){this._workspaceEdit.documentChanges===void 0&&this._workspaceEdit.changes===void 0&&(this._changeAnnotations=new he,this._workspaceEdit.documentChanges=[],this._workspaceEdit.changeAnnotations=this._changeAnnotations.all())},e.prototype.initChanges=function(){this._workspaceEdit.documentChanges===void 0&&this._workspaceEdit.changes===void 0&&(this._workspaceEdit.changes=Object.create(null))},e.prototype.createFile=function(r,i,t){if(this.initDocumentChanges(),this._workspaceEdit.documentChanges===void 0)throw new Error("Workspace edit is not configured for document changes.");var n;O.is(i)||w.is(i)?n=i:t=i;var a,s;if(n===void 0?a=H.create(r,t):(s=w.is(n)?n:this._changeAnnotations.manage(n),a=H.create(r,t,s)),this._workspaceEdit.documentChanges.push(a),s!==void 0)return s},e.prototype.renameFile=function(r,i,t,n){if(this.initDocumentChanges(),this._workspaceEdit.documentChanges===void 0)throw new Error("Workspace edit is not configured for document changes.");var a;O.is(t)||w.is(t)?a=t:n=t;var s,u;if(a===void 0?s=z.create(r,i,n):(u=w.is(a)?a:this._changeAnnotations.manage(a),s=z.create(r,i,n,u)),this._workspaceEdit.documentChanges.push(s),u!==void 0)return u},e.prototype.deleteFile=function(r,i,t){if(this.initDocumentChanges(),this._workspaceEdit.documentChanges===void 0)throw new Error("Workspace edit is not configured for document changes.");var n;O.is(i)||w.is(i)?n=i:t=i;var a,s;if(n===void 0?a=B.create(r,t):(s=w.is(n)?n:this._changeAnnotations.manage(n),a=B.create(r,t,s)),this._workspaceEdit.documentChanges.push(a),s!==void 0)return s},e})();var pe;(function(e){function r(t){return{uri:t}}e.create=r;function i(t){var n=t;return o.defined(n)&&o.string(n.uri)}e.is=i})(pe||(pe={}));var ve;(function(e){function r(t,n){return{uri:t,version:n}}e.create=r;function i(t){var n=t;return o.defined(n)&&o.string(n.uri)&&o.integer(n.version)}e.is=i})(ve||(ve={}));var Q;(function(e){function r(t,n){return{uri:t,version:n}}e.create=r;function i(t){var n=t;return o.defined(n)&&o.string(n.uri)&&(n.version===null||o.integer(n.version))}e.is=i})(Q||(Q={}));var me;(function(e){function r(t,n,a,s){return{uri:t,languageId:n,version:a,text:s}}e.create=r;function i(t){var n=t;return o.defined(n)&&o.string(n.uri)&&o.string(n.languageId)&&o.integer(n.version)&&o.string(n.text)}e.is=i})(me||(me={}));var q;(function(e){e.PlainText="plaintext",e.Markdown="markdown"})(q||(q={}));(function(e){function r(i){var t=i;return t===e.PlainText||t===e.Markdown}e.is=r})(q||(q={}));var ie;(function(e){function r(i){var t=i;return o.objectLiteral(i)&&q.is(t.kind)&&o.string(t.value)}e.is=r})(ie||(ie={}));var v;(function(e){e.Text=1,e.Method=2,e.Function=3,e.Constructor=4,e.Field=5,e.Variable=6,e.Class=7,e.Interface=8,e.Module=9,e.Property=10,e.Unit=11,e.Value=12,e.Enum=13,e.Keyword=14,e.Snippet=15,e.Color=16,e.File=17,e.Reference=18,e.Folder=19,e.EnumMember=20,e.Constant=21,e.Struct=22,e.Event=23,e.Operator=24,e.TypeParameter=25})(v||(v={}));var ae;(function(e){e.PlainText=1,e.Snippet=2})(ae||(ae={}));var _e;(function(e){e.Deprecated=1})(_e||(_e={}));var ke;(function(e){function r(t,n,a){return{newText:t,insert:n,replace:a}}e.create=r;function i(t){var n=t;return n&&o.string(n.newText)&&_.is(n.insert)&&_.is(n.replace)}e.is=i})(ke||(ke={}));var we;(function(e){e.asIs=1,e.adjustIndentation=2})(we||(we={}));var be;(function(e){function r(i){return{label:i}}e.create=r})(be||(be={}));var Ce;(function(e){function r(i,t){return{items:i||[],isIncomplete:!!t}}e.create=r})(Ce||(Ce={}));var Z;(function(e){function r(t){return t.replace(/[\\`*_{}[\]()#+\-.!]/g,"\\$&")}e.fromPlainText=r;function i(t){var n=t;return o.string(n)||o.objectLiteral(n)&&o.string(n.language)&&o.string(n.value)}e.is=i})(Z||(Z={}));var Ee;(function(e){function r(i){var t=i;return!!t&&o.objectLiteral(t)&&(ie.is(t.contents)||Z.is(t.contents)||o.typedArray(t.contents,Z.is))&&(i.range===void 0||_.is(i.range))}e.is=r})(Ee||(Ee={}));var Ae;(function(e){function r(i,t){return t?{label:i,documentation:t}:{label:i}}e.create=r})(Ae||(Ae={}));var Se;(function(e){function r(i,t){for(var n=[],a=2;a<arguments.length;a++)n[a-2]=arguments[a];var s={label:i};return o.defined(t)&&(s.documentation=t),o.defined(n)?s.parameters=n:s.parameters=[],s}e.create=r})(Se||(Se={}));var U;(function(e){e.Text=1,e.Read=2,e.Write=3})(U||(U={}));var Ie;(function(e){function r(i,t){var n={range:i};return o.number(t)&&(n.kind=t),n}e.create=r})(Ie||(Ie={}));var m;(function(e){e.File=1,e.Module=2,e.Namespace=3,e.Package=4,e.Class=5,e.Method=6,e.Property=7,e.Field=8,e.Constructor=9,e.Enum=10,e.Interface=11,e.Function=12,e.Variable=13,e.Constant=14,e.String=15,e.Number=16,e.Boolean=17,e.Array=18,e.Object=19,e.Key=20,e.Null=21,e.EnumMember=22,e.Struct=23,e.Event=24,e.Operator=25,e.TypeParameter=26})(m||(m={}));var ye;(function(e){e.Deprecated=1})(ye||(ye={}));var Te;(function(e){function r(i,t,n,a,s){var u={name:i,kind:t,location:{uri:a,range:n}};return s&&(u.containerName=s),u}e.create=r})(Te||(Te={}));var Pe;(function(e){function r(t,n,a,s,u,l){var c={name:t,detail:n,kind:a,range:s,selectionRange:u};return l!==void 0&&(c.children=l),c}e.create=r;function i(t){var n=t;return n&&o.string(n.name)&&o.number(n.kind)&&_.is(n.range)&&_.is(n.selectionRange)&&(n.detail===void 0||o.string(n.detail))&&(n.deprecated===void 0||o.boolean(n.deprecated))&&(n.children===void 0||Array.isArray(n.children))&&(n.tags===void 0||Array.isArray(n.tags))}e.is=i})(Pe||(Pe={}));var Re;(function(e){e.Empty="",e.QuickFix="quickfix",e.Refactor="refactor",e.RefactorExtract="refactor.extract",e.RefactorInline="refactor.inline",e.RefactorRewrite="refactor.rewrite",e.Source="source",e.SourceOrganizeImports="source.organizeImports",e.SourceFixAll="source.fixAll"})(Re||(Re={}));var Me;(function(e){function r(t,n){var a={diagnostics:t};return n!=null&&(a.only=n),a}e.create=r;function i(t){var n=t;return o.defined(n)&&o.typedArray(n.diagnostics,$.is)&&(n.only===void 0||o.typedArray(n.only,o.string))}e.is=i})(Me||(Me={}));var De;(function(e){function r(t,n,a){var s={title:t},u=!0;return typeof n=="string"?(u=!1,s.kind=n):V.is(n)?s.command=n:s.edit=n,u&&a!==void 0&&(s.kind=a),s}e.create=r;function i(t){var n=t;return n&&o.string(n.title)&&(n.diagnostics===void 0||o.typedArray(n.diagnostics,$.is))&&(n.kind===void 0||o.string(n.kind))&&(n.edit!==void 0||n.command!==void 0)&&(n.command===void 0||V.is(n.command))&&(n.isPreferred===void 0||o.boolean(n.isPreferred))&&(n.edit===void 0||re.is(n.edit))}e.is=i})(De||(De={}));var Le;(function(e){function r(t,n){var a={range:t};return o.defined(n)&&(a.data=n),a}e.create=r;function i(t){var n=t;return o.defined(n)&&_.is(n.range)&&(o.undefined(n.command)||V.is(n.command))}e.is=i})(Le||(Le={}));var Ne;(function(e){function r(t,n){return{tabSize:t,insertSpaces:n}}e.create=r;function i(t){var n=t;return o.defined(n)&&o.uinteger(n.tabSize)&&o.boolean(n.insertSpaces)}e.is=i})(Ne||(Ne={}));var Oe;(function(e){function r(t,n,a){return{range:t,target:n,data:a}}e.create=r;function i(t){var n=t;return o.defined(n)&&_.is(n.range)&&(o.undefined(n.target)||o.string(n.target))}e.is=i})(Oe||(Oe={}));var xe;(function(e){function r(t,n){return{range:t,parent:n}}e.create=r;function i(t){var n=t;return n!==void 0&&_.is(n.range)&&(n.parent===void 0||e.is(n.parent))}e.is=i})(xe||(xe={}));var je;(function(e){function r(a,s,u,l){return new cn(a,s,u,l)}e.create=r;function i(a){var s=a;return!!(o.defined(s)&&o.string(s.uri)&&(o.undefined(s.languageId)||o.string(s.languageId))&&o.uinteger(s.lineCount)&&o.func(s.getText)&&o.func(s.positionAt)&&o.func(s.offsetAt))}e.is=i;function t(a,s){for(var u=a.getText(),l=n(s,function(y,D){var x=y.range.start.line-D.range.start.line;return x===0?y.range.start.character-D.range.start.character:x}),c=u.length,p=l.length-1;p>=0;p--){var g=l[p],b=a.offsetAt(g.range.start),h=a.offsetAt(g.range.end);if(h<=c)u=u.substring(0,b)+g.newText+u.substring(h,u.length);else throw new Error("Overlapping edit");c=b}return u}e.applyEdits=t;function n(a,s){if(a.length<=1)return a;var u=a.length/2|0,l=a.slice(0,u),c=a.slice(u);n(l,s),n(c,s);for(var p=0,g=0,b=0;p<l.length&&g<c.length;){var h=s(l[p],c[g]);h<=0?a[b++]=l[p++]:a[b++]=c[g++]}for(;p<l.length;)a[b++]=l[p++];for(;g<c.length;)a[b++]=c[g++];return a}})(je||(je={}));var cn=function(){function e(r,i,t,n){this._uri=r,this._languageId=i,this._version=t,this._content=n,this._lineOffsets=void 0}return Object.defineProperty(e.prototype,"uri",{get:function(){return this._uri},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"languageId",{get:function(){return this._languageId},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"version",{get:function(){return this._version},enumerable:!1,configurable:!0}),e.prototype.getText=function(r){if(r){var i=this.offsetAt(r.start),t=this.offsetAt(r.end);return this._content.substring(i,t)}return this._content},e.prototype.update=function(r,i){this._content=r.text,this._version=i,this._lineOffsets=void 0},e.prototype.getLineOffsets=function(){if(this._lineOffsets===void 0){for(var r=[],i=this._content,t=!0,n=0;n<i.length;n++){t&&(r.push(n),t=!1);var a=i.charAt(n);t=a==="\r"||a===`
`,a==="\r"&&n+1<i.length&&i.charAt(n+1)===`
`&&n++}t&&i.length>0&&r.push(i.length),this._lineOffsets=r}return this._lineOffsets},e.prototype.positionAt=function(r){r=Math.max(Math.min(r,this._content.length),0);var i=this.getLineOffsets(),t=0,n=i.length;if(n===0)return T.create(0,r);for(;t<n;){var a=Math.floor((t+n)/2);i[a]>r?n=a:t=a+1}var s=t-1;return T.create(s,r-i[s])},e.prototype.offsetAt=function(r){var i=this.getLineOffsets();if(r.line>=i.length)return this._content.length;if(r.line<0)return 0;var t=i[r.line],n=r.line+1<i.length?i[r.line+1]:this._content.length;return Math.max(Math.min(t+r.character,n),t)},Object.defineProperty(e.prototype,"lineCount",{get:function(){return this.getLineOffsets().length},enumerable:!1,configurable:!0}),e}(),o;(function(e){var r=Object.prototype.toString;function i(h){return typeof h<"u"}e.defined=i;function t(h){return typeof h>"u"}e.undefined=t;function n(h){return h===!0||h===!1}e.boolean=n;function a(h){return r.call(h)==="[object String]"}e.string=a;function s(h){return r.call(h)==="[object Number]"}e.number=s;function u(h,y,D){return r.call(h)==="[object Number]"&&y<=h&&h<=D}e.numberRange=u;function l(h){return r.call(h)==="[object Number]"&&-2147483648<=h&&h<=2147483647}e.integer=l;function c(h){return r.call(h)==="[object Number]"&&0<=h&&h<=2147483647}e.uinteger=c;function p(h){return r.call(h)==="[object Function]"}e.func=p;function g(h){return h!==null&&typeof h=="object"}e.objectLiteral=g;function b(h,y){return Array.isArray(h)&&h.every(y)}e.typedArray=b})(o||(o={}));var dn=class{constructor(e,r,i){this._languageId=e,this._worker=r,this._disposables=[],this._listener=Object.create(null);const t=a=>{let s=a.getLanguageId();if(s!==this._languageId)return;let u;this._listener[a.uri.toString()]=a.onDidChangeContent(()=>{window.clearTimeout(u),u=window.setTimeout(()=>this._doValidate(a.uri,s),500)}),this._doValidate(a.uri,s)},n=a=>{f.editor.setModelMarkers(a,this._languageId,[]);let s=a.uri.toString(),u=this._listener[s];u&&(u.dispose(),delete this._listener[s])};this._disposables.push(f.editor.onDidCreateModel(t)),this._disposables.push(f.editor.onWillDisposeModel(n)),this._disposables.push(f.editor.onDidChangeModelLanguage(a=>{n(a.model),t(a.model)})),this._disposables.push(i(a=>{f.editor.getModels().forEach(s=>{s.getLanguageId()===this._languageId&&(n(s),t(s))})})),this._disposables.push({dispose:()=>{f.editor.getModels().forEach(n);for(let a in this._listener)this._listener[a].dispose()}}),f.editor.getModels().forEach(t)}dispose(){this._disposables.forEach(e=>e&&e.dispose()),this._disposables.length=0}_doValidate(e,r){this._worker(e).then(i=>i.doValidation(e.toString())).then(i=>{const t=i.map(a=>ln(e,a));let n=f.editor.getModel(e);n&&n.getLanguageId()===r&&f.editor.setModelMarkers(n,r,t)}).then(void 0,i=>{console.error(i)})}};function fn(e){switch(e){case N.Error:return f.MarkerSeverity.Error;case N.Warning:return f.MarkerSeverity.Warning;case N.Information:return f.MarkerSeverity.Info;case N.Hint:return f.MarkerSeverity.Hint;default:return f.MarkerSeverity.Info}}function ln(e,r){let i=typeof r.code=="number"?String(r.code):r.code;return{severity:fn(r.severity),startLineNumber:r.range.start.line+1,startColumn:r.range.start.character+1,endLineNumber:r.range.end.line+1,endColumn:r.range.end.character+1,message:r.message,code:i,source:r.source}}var gn=class{constructor(e,r){this._worker=e,this._triggerCharacters=r}get triggerCharacters(){return this._triggerCharacters}provideCompletionItems(e,r,i,t){const n=e.uri;return this._worker(n).then(a=>a.doComplete(n.toString(),M(r))).then(a=>{if(!a)return;const s=e.getWordUntilPosition(r),u=new f.Range(r.lineNumber,s.startColumn,r.lineNumber,s.endColumn),l=a.items.map(c=>{const p={label:c.label,insertText:c.insertText||c.label,sortText:c.sortText,filterText:c.filterText,documentation:c.documentation,detail:c.detail,command:vn(c.command),range:u,kind:pn(c.kind)};return c.textEdit&&(hn(c.textEdit)?p.range={insert:C(c.textEdit.insert),replace:C(c.textEdit.replace)}:p.range=C(c.textEdit.range),p.insertText=c.textEdit.newText),c.additionalTextEdits&&(p.additionalTextEdits=c.additionalTextEdits.map(X)),c.insertTextFormat===ae.Snippet&&(p.insertTextRules=f.languages.CompletionItemInsertTextRule.InsertAsSnippet),p});return{isIncomplete:a.isIncomplete,suggestions:l}})}};function M(e){if(e)return{character:e.column-1,line:e.lineNumber-1}}function ze(e){if(e)return{start:{line:e.startLineNumber-1,character:e.startColumn-1},end:{line:e.endLineNumber-1,character:e.endColumn-1}}}function C(e){if(e)return new f.Range(e.start.line+1,e.start.character+1,e.end.line+1,e.end.character+1)}function hn(e){return typeof e.insert<"u"&&typeof e.replace<"u"}function pn(e){const r=f.languages.CompletionItemKind;switch(e){case v.Text:return r.Text;case v.Method:return r.Method;case v.Function:return r.Function;case v.Constructor:return r.Constructor;case v.Field:return r.Field;case v.Variable:return r.Variable;case v.Class:return r.Class;case v.Interface:return r.Interface;case v.Module:return r.Module;case v.Property:return r.Property;case v.Unit:return r.Unit;case v.Value:return r.Value;case v.Enum:return r.Enum;case v.Keyword:return r.Keyword;case v.Snippet:return r.Snippet;case v.Color:return r.Color;case v.File:return r.File;case v.Reference:return r.Reference}return r.Property}function X(e){if(e)return{range:C(e.range),text:e.newText}}function vn(e){return e&&e.command==="editor.action.triggerSuggest"?{id:e.command,title:e.title,arguments:e.arguments}:void 0}var mn=class{constructor(e){this._worker=e}provideHover(e,r,i){let t=e.uri;return this._worker(t).then(n=>n.doHover(t.toString(),M(r))).then(n=>{if(n)return{range:C(n.range),contents:kn(n.contents)}})}};function _n(e){return e&&typeof e=="object"&&typeof e.kind=="string"}function Fe(e){return typeof e=="string"?{value:e}:_n(e)?e.kind==="plaintext"?{value:e.value.replace(/[\\`*_{}[\]()#+\-.!]/g,"\\$&")}:{value:e.value}:{value:"```"+e.language+`
`+e.value+"\n```\n"}}function kn(e){if(e)return Array.isArray(e)?e.map(Fe):[Fe(e)]}var $n=class{constructor(e){this._worker=e}provideDocumentHighlights(e,r,i){const t=e.uri;return this._worker(t).then(n=>n.findDocumentHighlights(t.toString(),M(r))).then(n=>{if(n)return n.map(a=>({range:C(a.range),kind:wn(a.kind)}))})}};function wn(e){switch(e){case U.Read:return f.languages.DocumentHighlightKind.Read;case U.Write:return f.languages.DocumentHighlightKind.Write;case U.Text:return f.languages.DocumentHighlightKind.Text}return f.languages.DocumentHighlightKind.Text}var Gn=class{constructor(e){this._worker=e}provideDefinition(e,r,i){const t=e.uri;return this._worker(t).then(n=>n.findDefinition(t.toString(),M(r))).then(n=>{if(n)return[Be(n)]})}};function Be(e){return{uri:f.Uri.parse(e.uri),range:C(e.range)}}var Qn=class{constructor(e){this._worker=e}provideReferences(e,r,i,t){const n=e.uri;return this._worker(n).then(a=>a.findReferences(n.toString(),M(r))).then(a=>{if(a)return a.map(Be)})}},Zn=class{constructor(e){this._worker=e}provideRenameEdits(e,r,i,t){const n=e.uri;return this._worker(n).then(a=>a.doRename(n.toString(),M(r),i)).then(a=>bn(a))}};function bn(e){if(!e||!e.changes)return;let r=[];for(let i in e.changes){const t=f.Uri.parse(i);for(let n of e.changes[i])r.push({resource:t,versionId:void 0,textEdit:{range:C(n.range),text:n.newText}})}return{edits:r}}var Cn=class{constructor(e){this._worker=e}provideDocumentSymbols(e,r){const i=e.uri;return this._worker(i).then(t=>t.findDocumentSymbols(i.toString())).then(t=>{if(t)return t.map(n=>En(n)?qe(n):{name:n.name,detail:"",containerName:n.containerName,kind:Xe(n.kind),range:C(n.location.range),selectionRange:C(n.location.range),tags:[]})})}};function En(e){return"children"in e}function qe(e){return{name:e.name,detail:e.detail??"",kind:Xe(e.kind),range:C(e.range),selectionRange:C(e.selectionRange),tags:e.tags??[],children:(e.children??[]).map(r=>qe(r))}}function Xe(e){let r=f.languages.SymbolKind;switch(e){case m.File:return r.File;case m.Module:return r.Module;case m.Namespace:return r.Namespace;case m.Package:return r.Package;case m.Class:return r.Class;case m.Method:return r.Method;case m.Property:return r.Property;case m.Field:return r.Field;case m.Constructor:return r.Constructor;case m.Enum:return r.Enum;case m.Interface:return r.Interface;case m.Function:return r.Function;case m.Variable:return r.Variable;case m.Constant:return r.Constant;case m.String:return r.String;case m.Number:return r.Number;case m.Boolean:return r.Boolean;case m.Array:return r.Array}return r.Function}var Kn=class{constructor(e){this._worker=e}provideLinks(e,r){const i=e.uri;return this._worker(i).then(t=>t.findDocumentLinks(i.toString())).then(t=>{if(t)return{links:t.map(n=>({range:C(n.range),url:n.target}))}})}},An=class{constructor(e){this._worker=e}provideDocumentFormattingEdits(e,r,i){const t=e.uri;return this._worker(t).then(n=>n.format(t.toString(),null,Je(r)).then(a=>{if(!(!a||a.length===0))return a.map(X)}))}},Sn=class{constructor(e){this._worker=e,this.canFormatMultipleRanges=!1}provideDocumentRangeFormattingEdits(e,r,i,t){const n=e.uri;return this._worker(n).then(a=>a.format(n.toString(),ze(r),Je(i)).then(s=>{if(!(!s||s.length===0))return s.map(X)}))}};function Je(e){return{tabSize:e.tabSize,insertSpaces:e.insertSpaces}}var In=class{constructor(e){this._worker=e}provideDocumentColors(e,r){const i=e.uri;return this._worker(i).then(t=>t.findDocumentColors(i.toString())).then(t=>{if(t)return t.map(n=>({color:n.color,range:C(n.range)}))})}provideColorPresentations(e,r,i){const t=e.uri;return this._worker(t).then(n=>n.getColorPresentations(t.toString(),r.color,ze(r.range))).then(n=>{if(n)return n.map(a=>{let s={label:a.label};return a.textEdit&&(s.textEdit=X(a.textEdit)),a.additionalTextEdits&&(s.additionalTextEdits=a.additionalTextEdits.map(X)),s})})}},yn=class{constructor(e){this._worker=e}provideFoldingRanges(e,r,i){const t=e.uri;return this._worker(t).then(n=>n.getFoldingRanges(t.toString(),r)).then(n=>{if(n)return n.map(a=>{const s={start:a.startLine+1,end:a.endLine+1};return typeof a.kind<"u"&&(s.kind=Tn(a.kind)),s})})}};function Tn(e){switch(e){case W.Comment:return f.languages.FoldingRangeKind.Comment;case W.Imports:return f.languages.FoldingRangeKind.Imports;case W.Region:return f.languages.FoldingRangeKind.Region}}var Pn=class{constructor(e){this._worker=e}provideSelectionRanges(e,r,i){const t=e.uri;return this._worker(t).then(n=>n.getSelectionRanges(t.toString(),r.map(M))).then(n=>{if(n)return n.map(a=>{const s=[];for(;a;)s.push({range:C(a.range)}),a=a.parent;return s})})}};function Rn(e,r){r===void 0&&(r=!1);var i=e.length,t=0,n="",a=0,s=16,u=0,l=0,c=0,p=0,g=0;function b(d,A){for(var I=0,E=0;I<d;){var k=e.charCodeAt(t);if(k>=48&&k<=57)E=E*16+k-48;else if(k>=65&&k<=70)E=E*16+k-65+10;else if(k>=97&&k<=102)E=E*16+k-97+10;else break;t++,I++}return I<d&&(E=-1),E}function h(d){t=d,n="",a=0,s=16,g=0}function y(){var d=t;if(e.charCodeAt(t)===48)t++;else for(t++;t<e.length&&L(e.charCodeAt(t));)t++;if(t<e.length&&e.charCodeAt(t)===46)if(t++,t<e.length&&L(e.charCodeAt(t)))for(t++;t<e.length&&L(e.charCodeAt(t));)t++;else return g=3,e.substring(d,t);var A=t;if(t<e.length&&(e.charCodeAt(t)===69||e.charCodeAt(t)===101))if(t++,(t<e.length&&e.charCodeAt(t)===43||e.charCodeAt(t)===45)&&t++,t<e.length&&L(e.charCodeAt(t))){for(t++;t<e.length&&L(e.charCodeAt(t));)t++;A=t}else g=3;return e.substring(d,A)}function D(){for(var d="",A=t;;){if(t>=i){d+=e.substring(A,t),g=2;break}var I=e.charCodeAt(t);if(I===34){d+=e.substring(A,t),t++;break}if(I===92){if(d+=e.substring(A,t),t++,t>=i){g=2;break}var E=e.charCodeAt(t++);switch(E){case 34:d+='"';break;case 92:d+="\\";break;case 47:d+="/";break;case 98:d+="\b";break;case 102:d+="\f";break;case 110:d+=`
`;break;case 114:d+="\r";break;case 116:d+="	";break;case 117:var k=b(4);k>=0?d+=String.fromCharCode(k):g=4;break;default:g=5}A=t;continue}if(I>=0&&I<=31)if(j(I)){d+=e.substring(A,t),g=2;break}else g=6;t++}return d}function x(){if(n="",g=0,a=t,l=u,p=c,t>=i)return a=i,s=17;var d=e.charCodeAt(t);if(K(d)){do t++,n+=String.fromCharCode(d),d=e.charCodeAt(t);while(K(d));return s=15}if(j(d))return t++,n+=String.fromCharCode(d),d===13&&e.charCodeAt(t)===10&&(t++,n+=`
`),u++,c=t,s=14;switch(d){case 123:return t++,s=1;case 125:return t++,s=2;case 91:return t++,s=3;case 93:return t++,s=4;case 58:return t++,s=6;case 44:return t++,s=5;case 34:return t++,n=D(),s=10;case 47:var A=t-1;if(e.charCodeAt(t+1)===47){for(t+=2;t<i&&!j(e.charCodeAt(t));)t++;return n=e.substring(A,t),s=12}if(e.charCodeAt(t+1)===42){t+=2;for(var I=i-1,E=!1;t<I;){var k=e.charCodeAt(t);if(k===42&&e.charCodeAt(t+1)===47){t+=2,E=!0;break}t++,j(k)&&(k===13&&e.charCodeAt(t)===10&&t++,u++,c=t)}return E||(t++,g=1),n=e.substring(A,t),s=13}return n+=String.fromCharCode(d),t++,s=16;case 45:if(n+=String.fromCharCode(d),t++,t===i||!L(e.charCodeAt(t)))return s=16;case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:return n+=y(),s=11;default:for(;t<i&&Qe(d);)t++,d=e.charCodeAt(t);if(a!==t){switch(n=e.substring(a,t),n){case"true":return s=8;case"false":return s=9;case"null":return s=7}return s=16}return n+=String.fromCharCode(d),t++,s=16}}function Qe(d){if(K(d)||j(d))return!1;switch(d){case 125:case 93:case 123:case 91:case 34:case 58:case 44:case 47:return!1}return!0}function Ze(){var d;do d=x();while(d>=12&&d<=15);return d}return{setPosition:h,getPosition:function(){return t},scan:r?Ze:x,getToken:function(){return s},getTokenValue:function(){return n},getTokenOffset:function(){return a},getTokenLength:function(){return t-a},getTokenStartLine:function(){return l},getTokenStartCharacter:function(){return a-p},getTokenError:function(){return g}}}function K(e){return e===32||e===9||e===11||e===12||e===160||e===5760||e>=8192&&e<=8203||e===8239||e===8287||e===12288||e===65279}function j(e){return e===10||e===13||e===8232||e===8233}function L(e){return e>=48&&e<=57}var We;(function(e){e.DEFAULT={allowTrailingComma:!1}})(We||(We={}));var Mn=Rn;function Dn(e){return{getInitialState:()=>new $e(null,null,!1,null),tokenize:(r,i)=>Hn(e,r,i)}}var Ue="delimiter.bracket.json",Ve="delimiter.array.json",Ln="delimiter.colon.json",Nn="delimiter.comma.json",On="keyword.json",xn="keyword.json",jn="string.value.json",Fn="number.json",Wn="string.key.json",Un="comment.block.json",Vn="comment.line.json",F=class Ye{constructor(r,i){this.parent=r,this.type=i}static pop(r){return r?r.parent:null}static push(r,i){return new Ye(r,i)}static equals(r,i){if(!r&&!i)return!0;if(!r||!i)return!1;for(;r&&i;){if(r===i)return!0;if(r.type!==i.type)return!1;r=r.parent,i=i.parent}return!0}},$e=class se{constructor(r,i,t,n){this._state=r,this.scanError=i,this.lastWasColon=t,this.parents=n}clone(){return new se(this._state,this.scanError,this.lastWasColon,this.parents)}equals(r){return r===this?!0:!r||!(r instanceof se)?!1:this.scanError===r.scanError&&this.lastWasColon===r.lastWasColon&&F.equals(this.parents,r.parents)}getStateData(){return this._state}setStateData(r){this._state=r}};function Hn(e,r,i,t=0){let n=0,a=!1;switch(i.scanError){case 2:r='"'+r,n=1;break;case 1:r="/*"+r,n=2;break}const s=Mn(r);let u=i.lastWasColon,l=i.parents;const c={tokens:[],endState:i.clone()};for(;;){let p=t+s.getPosition(),g="";const b=s.scan();if(b===17)break;if(p===t+s.getPosition())throw new Error("Scanner did not advance, next 3 characters are: "+r.substr(s.getPosition(),3));switch(a&&(p-=n),a=n>0,b){case 1:l=F.push(l,0),g=Ue,u=!1;break;case 2:l=F.pop(l),g=Ue,u=!1;break;case 3:l=F.push(l,1),g=Ve,u=!1;break;case 4:l=F.pop(l),g=Ve,u=!1;break;case 6:g=Ln,u=!0;break;case 5:g=Nn,u=!1;break;case 8:case 9:g=On,u=!1;break;case 7:g=xn,u=!1;break;case 10:const y=(l?l.type:0)===1;g=u||y?jn:Wn,u=!1;break;case 11:g=Fn,u=!1;break}switch(b){case 12:g=Vn;break;case 13:g=Un;break}c.endState=new $e(i.getStateData(),s.getTokenError(),u,l),c.tokens.push({startIndex:p,scopes:g})}return c}var S;function et(){return new Promise((e,r)=>{if(!S)return r("JSON not registered!");e(S)})}var zn=class extends dn{constructor(e,r,i){super(e,r,i.onDidChange),this._disposables.push(f.editor.onWillDisposeModel(t=>{this._resetSchema(t.uri)})),this._disposables.push(f.editor.onDidChangeModelLanguage(t=>{this._resetSchema(t.model.uri)}))}_resetSchema(e){this._worker().then(r=>{r.resetSchema(e.toString())})}};function nt(e){const r=[],i=[],t=new un(e);r.push(t),S=(...s)=>t.getLanguageServiceWorker(...s);function n(){const{languageId:s,modeConfiguration:u}=e;Ge(i),u.documentFormattingEdits&&i.push(f.languages.registerDocumentFormattingEditProvider(s,new An(S))),u.documentRangeFormattingEdits&&i.push(f.languages.registerDocumentRangeFormattingEditProvider(s,new Sn(S))),u.completionItems&&i.push(f.languages.registerCompletionItemProvider(s,new gn(S,[" ",":",'"']))),u.hovers&&i.push(f.languages.registerHoverProvider(s,new mn(S))),u.documentSymbols&&i.push(f.languages.registerDocumentSymbolProvider(s,new Cn(S))),u.tokens&&i.push(f.languages.setTokensProvider(s,Dn(!0))),u.colors&&i.push(f.languages.registerColorProvider(s,new In(S))),u.foldingRanges&&i.push(f.languages.registerFoldingRangeProvider(s,new yn(S))),u.diagnostics&&i.push(new zn(s,S,e)),u.selectionRanges&&i.push(f.languages.registerSelectionRangeProvider(s,new Pn(S)))}n(),r.push(f.languages.setLanguageConfiguration(e.languageId,Bn));let a=e.modeConfiguration;return e.onDidChange(s=>{s.modeConfiguration!==a&&(a=s.modeConfiguration,n())}),r.push(He(i)),He(r)}function He(e){return{dispose:()=>Ge(e)}}function Ge(e){for(;e.length;)e.pop().dispose()}var Bn={wordPattern:/(-?\d*\.\d\w*)|([^\[\{\]\}\:\"\,\s]+)/g,comments:{lineComment:"//",blockComment:["/*","*/"]},brackets:[["{","}"],["[","]"]],autoClosingPairs:[{open:"{",close:"}",notIn:["string"]},{open:"[",close:"]",notIn:["string"]},{open:'"',close:'"',notIn:["string"]}]};export{gn as CompletionAdapter,Gn as DefinitionAdapter,dn as DiagnosticsAdapter,In as DocumentColorAdapter,An as DocumentFormattingEditProvider,$n as DocumentHighlightAdapter,Kn as DocumentLinkAdapter,Sn as DocumentRangeFormattingEditProvider,Cn as DocumentSymbolAdapter,yn as FoldingRangeAdapter,mn as HoverAdapter,Qn as ReferenceAdapter,Zn as RenameAdapter,Pn as SelectionRangeAdapter,un as WorkerManager,M as fromPosition,ze as fromRange,et as getWorker,nt as setupMode,C as toRange,X as toTextEdit};

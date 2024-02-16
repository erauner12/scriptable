// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: reply-all;
// share-sheet-inputs: url;
const t=[{origin:["reddit.com"],redirect:"teddit.net"},{origin:["twitter.com"],redirect:"nitter.it"},{origin:["instagram.com"],redirect:"imginn.com"}];__awaiter(void 0,void 0,void 0,(function*(){!function(t){t&&Safari.open(t),Script.complete()}(function(t,i){let e;if(t&&i.forEach((i=>{const r=function(t,i){const{origin:e,redirect:r}=i;let n,o,c;if(Array(e).forEach((i=>{n=t.includes(String(i)),n&&(o=i)})),o)return c=t.replace(o,r),c}(t,i);r&&(e=r)})),e)return String(e)}(yield function(){return __awaiter(this,void 0,void 0,(function*(){let t=args.urls[0];if(!t){const i=new Alert;i.title="URL to Redirect",i.addTextField("URL",Pasteboard.paste()),i.addAction("Go"),i.addCancelAction("Cancel");let e=yield i.present();0===e&&(t=i.textFieldValue(0)),-1===e&&Script.complete()}return String(t)}))}(),t))}));

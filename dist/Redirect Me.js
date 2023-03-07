// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: reply-all;
// share-sheet-inputs: url;
const t=[{origin:["reddit.com"],alt:"teddit.net"},{origin:["twitter.com"],alt:"nitter.it"},{origin:["instagram.com"],alt:"imginn.com"}];(async()=>{!function(t){t&&Safari.open(t);Script.complete()}(function(t,i){let n;t&&i.forEach((i=>{const e=function(t,i){const{origin:n,alt:e}=i;let r,a,c;if(Array(n).forEach((i=>{r=t.includes(String(i)),r&&(a=i)})),a)return c=t.replace(a,e),c}(t,i);e&&(n=e)}));if(n)return String(n)}(await async function(){let t=args.urls[0];if(!t){const i=new Alert;i.title="URL to Redirect",i.addTextField("URL",Pasteboard.paste()),i.addAction("Go"),i.addCancelAction("Cancel");let n=await i.present();0===n&&(t=i.textFieldValue(0)),-1===n&&Script.complete()}return String(t)}(),t))})();

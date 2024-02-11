// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: reply-all;
// share-sheet-inputs: url;
const t=[{origin:["reddit.com"],redirect:"teddit.net"},{origin:["twitter.com"],redirect:"nitter.it"},{origin:["instagram.com"],redirect:"imginn.com"}];(async()=>{!function(t){t&&Safari.open(t);Script.complete()}(function(t,e){let i;t&&e.forEach((e=>{const r=function(t,e){const{origin:i,redirect:r}=e;let n,c,o;if(Array(i).forEach((e=>{n=t.includes(String(e)),n&&(c=e)})),c)return o=t.replace(c,r),o}(t,e);r&&(i=r)}));if(i)return String(i)}(await async function(){let t=args.urls[0];if(!t){const e=new Alert;e.title="URL to Redirect",e.addTextField("URL",Pasteboard.paste()),e.addAction("Go"),e.addCancelAction("Cancel");let i=await e.present();0===i&&(t=e.textFieldValue(0)),-1===i&&Script.complete()}return String(t)}(),t))})();

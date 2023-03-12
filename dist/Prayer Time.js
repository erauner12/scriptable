// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: mosque;
const t={widget:{settings:{file:"Prayer Time",directory:"Prayer Time",size:"small",offline:3}},api:{endpoint:"http://api.aladhan.com/v1/timings/",method:2,location:{latitude:38.70977051985349,longitude:-9.135920391030602}}};async function e(t){const e=new Request(t);return await e.loadJSON()}function n(t,e){const n=t.api,i=function(t){const e=t||new Date;return new Date(e).toLocaleString(void 0,{day:"2-digit",month:"2-digit",year:"numeric"}).replace(/\//g,"-")}(e);return`${n.endpoint}${i}?latitude=${n.location.latitude}&longitude=${n.location.longitude}&method=${n.method}`}function i(t){const[e,n,i]=t.split("-");return new Date(Number(i),Number(n)-1,Number(e))}function a(t){const e=`${t.widget.settings.file}.json`,n=t.widget.settings.directory,i=FileManager.iCloud(),a=i.joinPath(i.documentsDirectory(),n);return i.fileExists(a)||i.createDirectory(a),i.joinPath(a,e)}(async()=>{await async function(){const o=await async function(t){const i=t.widget.settings.offline,a=[];for(let o=0;o<i;o++){const i=new Date;i.setDate(i.getDate()+o);const r=n(t,i),s=(await e(r)).data;a.push(s)}return a}(t);await async function(t,e){const n=e,o=await async function(t){let e=FileManager.iCloud(),n=a(t);if(e.fileExists(n)){e.isFileDownloaded(n)||await e.downloadFileFromiCloud(n);const t=e.readString(n);return JSON.parse(t)}return[]}(t),r=[];(function(t){const e=[];return t.forEach((t=>{e.some((e=>JSON.stringify(e)===JSON.stringify(t)))||e.push(t)})),e})(o).filter((({date:{gregorian:{date:e}}})=>{const n=new Date;n.setHours(0,0,0,0);const a=new Date(n);a.setDate(n.getDate()+t.widget.settings.offline);const o=i(e)>=n,r=i(e)<=a;return o&&r})),n.forEach((t=>{if(!1===r.some((e=>JSON.stringify(e)===JSON.stringify(t)))){const e=r.findIndex((({date:{gregorian:{date:e}}})=>t.date.gregorian.date===e));e>=0&&(r[e]=t),-1===e&&r.push(t)}})),r.sort(((t,e)=>{const n=new Date(t.date.gregorian.date),i=new Date(e.date.gregorian.date);return n<i?-1:n>i?1:0})),function(t,e){let n=FileManager.iCloud(),i=a(t),o=JSON.stringify(e,null,2);n.writeString(i,o)}(t,r)}(t,o),console.log(o)}()})();

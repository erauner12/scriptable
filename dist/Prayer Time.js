// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: mosque;
async function t(t){let e=FileManager.iCloud();if(e.fileExists(t)){e.isFileDownloaded(t)||await e.downloadFileFromiCloud(t);const n=e.readString(t);return JSON.parse(n)}}function e(t,e,n){const r=function(t,e){let n=t.includes("?");for(const a in e)if(e.hasOwnProperty(a)){const r=e[a];null!=r&&(t+=(n?"&":"?")+encodeURIComponent(a)+"="+encodeURIComponent(r.toString()),n=!0)}return t}(`${t}${a(e)}`,n);return encodeURI(r)}function n(t){const[e,n,a]=t.split("-"),r=new Date(Number(a),Number(n)-1,Number(e));return r.setHours(0,0,0,0),r}function a(t){const e=t||new Date;return new Date(e).toLocaleString(void 0,{day:"2-digit",month:"2-digit",year:"numeric"}).replace(/\//g,"-")}async function r(t){const e=new Request(t);return await e.loadJSON()}async function i(e,a,r){const i=r,o=await t(e),s=[];(function(t){const e=[];return t.forEach((t=>{e.some((e=>JSON.stringify(e)===JSON.stringify(t)))||e.push(t)})),e})(o).filter((({date:{gregorian:{date:t}}})=>{const e=new Date;e.setHours(0,0,0,0);const r=new Date(e);r.setDate(e.getDate()+a);const i=n(t)>=e,o=n(t)<=r;return i&&o})),i.forEach((t=>{if(!1===s.some((e=>JSON.stringify(e)===JSON.stringify(t)))){const e=s.findIndex((({date:{gregorian:{date:e}}})=>t.date.gregorian.date===e));e>=0&&(s[e]=t),-1===e&&s.push(t)}})),s.sort(((t,e)=>{const n=new Date(t.date.gregorian.date),a=new Date(e.date.gregorian.date);return n<a?-1:n>a?1:0})),function(t,e){let n=FileManager.iCloud(),a=JSON.stringify(e,null,2);n.writeString(t,a)}(e,s)}function o(t,e,n){const a=new Date,r=e.map((t=>t.name.toUpperCase()));let i=t.map((t=>function(t){const{timings:e,date:{gregorian:n}}=t,a=n.date.split("-"),r=`${a[2]}-${a[1]}-${a[0]}`;return Object.entries(e).map((([t,e])=>{const n=e.split(":");return{prayer:t,dateTime:new Date(`${r}T${n[0]}:${n[1]}:00`)}}))}(t))).flat().filter((t=>r.includes(t.prayer.toUpperCase()))).filter((t=>t.dateTime>a)).sort(((t,e)=>t.dateTime.getTime()-e.dateTime.getTime()));return n&&(i=i.slice(0,n)),i}function s(t,e,n,r,i){const s=function(t){const e=new Date,n=new Date(new Date(e).setHours(0,0,0,0)),a=new Date(n.getTime()+864e5-1),r=t.findIndex((t=>t.dateTime>e));return t.map(((t,n)=>{let i="unknown",o=!1;return i=t.dateTime<e?"past":t.dateTime>e&&t.dateTime<=a?"today":"future",n===r&&(o=!0),{prayer:t.prayer,dateTime:t.dateTime,status:{state:i,next:o}}}))}(o(t,e,n)),d=new Date,l="#FFFFFF",u=new ListWidget;"accessoryCircular"!==r&&(u.setPadding(16,20,16,20),u.spacing=4);const m=u.addStack();switch(m.layoutVertically(),m.centerAlignContent(),m.spacing=4,s.forEach((t=>{const{prayer:n,dateTime:a}=t,i=function(t,e){const n=new Date(t),a=(new Date(e).getTime()-n.getTime())/864e5;return Math.abs(a)}(d,a)+1,o=new Color(l,.8/i),s=e.find((t=>t.name.toLowerCase()===n.toLowerCase()));if(!s)return;const{name:c,abbreviation:u}=s,f="medium"===r||"large"===r?c.toUpperCase():u;switch(r){case"small":case"medium":case"large":case"extraLarge":!function(t,e,n,a,r){const{dateTime:i,status:o}=n,s=14;let c,d=new Font("AvenirNext-Regular",12);o&&"future"===o.state&&(c=r);o&&o.next&&(d=new Font("AvenirNext-Bold",s));const l=t.addStack();l.spacing=a;const u=l.addText(e);u.font=d,u.lineLimit=1,l.addSpacer();const m=l.addDate(i);m.font=d,m.lineLimit=1,m.applyTimeStyle(),c&&(u.textColor=c,m.textColor=c)}(m,f,t,4,o);break;case"accessoryCircular":!function(t,e,n,a){const{dateTime:r,status:i}=n,o=14;let s,c=new Font("AvenirNext-Regular",12);i&&"future"===i.state&&(s=a);i&&i.next&&(c=new Font("AvenirNext-Bold",o));const d=t.addStack();d.layoutVertically();const l=d.addStack();l.addSpacer();const u=l.addText(e);u.font=c,u.lineLimit=1,l.addSpacer();const m=d.addStack();m.addSpacer();const f=m.addDate(r);f.font=c,f.lineLimit=1,f.minimumScaleFactor=.5,f.applyTimeStyle(),m.addSpacer(),s&&(u.textColor=s,f.textColor=s)}(m,f,t,o);break;case"accessoryInline":case"accessoryRectangular":!function(t,e,n,a){const{dateTime:r,status:i}=n,o=14;let s,c=new Font("AvenirNext-Regular",12);i&&"future"===i.state&&(s=a);i&&i.next&&(c=new Font("AvenirNext-Bold",o));const d=t.addStack(),l=d.addText(e);l.font=c,l.lineLimit=1;const u=d.addDate(r);u.font=c,u.lineLimit=1,u.applyTimeStyle(),s&&(l.textColor=s,u.textColor=s)}(m,f,t,o)}})),r){case"small":case"medium":case"large":case"extraLarge":const t=u.addStack();t.layoutVertically();const e=c(t,`${i} metres`);e.font=new Font("AvenirNext-Regular",10),e.textColor=new Color(l,.8);const n=c(t,`${a(d)} ${function(t,e={hour:"numeric",minute:"numeric",hour12:!0}){return t.toLocaleTimeString(void 0,e).toUpperCase()}(d)}`);n.font=new Font("AvenirNext-Regular",10),n.textColor=new Color(l,.8)}return u}function c(t,e){const n=t.addStack();n.addSpacer();const a=n.addText(e);return a.lineLimit=1,n.addSpacer(),a}const d={user:{settings:{file:"Prayer Time",directory:"Prayer Time",offline:5,distance:1e3},display:{prayerTimes:[{name:"fajr",display:"🌄",abbreviation:"FAJ"},{name:"dhuhr",display:"🕛",abbreviation:"DHU"},{name:"asr",display:"🌞",abbreviation:"ASR"},{name:"maghrib",display:"🌆",abbreviation:"MAG"},{name:"isha",display:"🌙",abbreviation:"ISH"},{name:"imsak",display:"⭐",abbreviation:"IMS"}]}},data:{api:{endpoint:"https://api.aladhan.com/v1/timings/"}},developer:{previewWidgetSize:"small"}};(async()=>{try{await async function(){const{user:{settings:{directory:a,file:c,offline:l,distance:u},display:{prayerTimes:m}}}=d,f=config.widgetFamily?config.widgetFamily:"small",g=function(t){switch(t){case"small":case"medium":default:return 5;case"large":case"extraLarge":return 14;case"accessoryCircular":case"accessoryInline":case"accessoryRectangular":return 1}}(f),p=function(t,e){const n=`${t}.json`,a=e,r=FileManager.iCloud(),i=r.joinPath(r.documentsDirectory(),a);return r.fileExists(i)||r.createDirectory(i),r.joinPath(i,n)}(c,a),w=await async function(){const t=new Request("https://www.google.com");t.method="HEAD",t.timeoutInterval=.25;try{return!!await t.load()}catch(t){return!1}}();let y=0;if(w){const a=new Date,s=await t(p),c=function(t,e){const a=t.filter((({date:{gregorian:{date:t}}})=>{const a=e||new Date;a.setHours(0,0,0,0);const r=n(t);return a.toDateString()===r.toDateString()}));if(a[0])return a[0]}(s,a),f=o(s,m).length,w=await Location.current();if(c){const{meta:t}=c,e=function(t,e){const n=t=>t*(Math.PI/180),a=n(e.latitude-t.latitude),r=n(e.longitude-t.longitude),i=Math.sin(a/2)*Math.sin(a/2)+Math.cos(n(t.latitude))*Math.cos(n(e.latitude))*Math.sin(r/2)*Math.sin(r/2);return 2*Math.atan2(Math.sqrt(i),Math.sqrt(1-i))*6371*1e3}(w,t);y=Math.round(100*(e+Number.EPSILON))/100}if(f<=g||y>u){const{data:t}=d;if(!t)throw new Error("No stored data found.");if(!t.api)throw new Error("No API data found.");const{endpoint:n,method:a}=t.api,o=await async function(t,n,a,i){try{const{latitude:o,longitude:s}=a,c=[];for(let a=0;a<i;a++){const i=new Date;i.setDate(i.getDate()+a);const d=e(t,i,{latitude:o,longitude:s,method:n}),l=await r(d);console.log(l);const u=l.data;c.push(u)}return c}catch(t){if("string"==typeof t)throw Error(t);throw new Error("An unknown error occurred.")}}(n,a,w,l);await i(p,l,o)}}const h=await t(p);if(h){const t=s(h,m,g,f,y);config.runsInAccessoryWidget?(t.addAccessoryWidgetBackground=!0,Script.setWidget(t),Script.complete()):(await t.presentLarge(),Script.complete())}}(),Script.complete()}catch(t){console.error(t)}})();

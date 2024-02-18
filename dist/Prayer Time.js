// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: mosque;
async function t(t){let e=FileManager.iCloud();if(e.fileExists(t)){e.isFileDownloaded(t)||await e.downloadFileFromiCloud(t);const a=e.readString(t);return JSON.parse(a)}}function e(t,e,a){const i=function(t,e){let a=t.includes("?");for(const n in e)if(e.hasOwnProperty(n)){const i=e[n];null!=i&&(t+=(a?"&":"?")+encodeURIComponent(n)+"="+encodeURIComponent(i.toString()),a=!0)}return t}(`${t}${n(e)}`,a);return encodeURI(i)}function a(t){const[e,a,n]=t.split("-"),i=new Date(Number(n),Number(a)-1,Number(e));return i.setHours(0,0,0,0),i}function n(t){const e=t||new Date;return new Date(e).toLocaleString(void 0,{day:"2-digit",month:"2-digit",year:"numeric"}).replace(/\//g,"-")}async function i(t){const e=new Request(t);return await e.loadJSON()}async function o(e,n,i){const o=i,r=await t(e),s=[];(function(t){const e=[];return t.forEach((t=>{e.some((e=>JSON.stringify(e)===JSON.stringify(t)))||e.push(t)})),e})(r).filter((({date:{gregorian:{date:t}}})=>{const e=new Date;e.setHours(0,0,0,0);const i=new Date(e);i.setDate(e.getDate()+n);const o=a(t)>=e,r=a(t)<=i;return o&&r})),o.forEach((t=>{if(!1===s.some((e=>JSON.stringify(e)===JSON.stringify(t)))){const e=s.findIndex((({date:{gregorian:{date:e}}})=>t.date.gregorian.date===e));e>=0&&(s[e]=t),-1===e&&s.push(t)}})),s.sort(((t,e)=>{const a=new Date(t.date.gregorian.date),n=new Date(e.date.gregorian.date);return a<n?-1:a>n?1:0})),function(t,e){let a=FileManager.iCloud(),n=JSON.stringify(e,null,2);a.writeString(t,n)}(e,s)}function r(t,e,a){const n=new Date,i=e.map((t=>t.name.toUpperCase()));let o=t.map((t=>function(t){const{timings:e,date:{gregorian:a}}=t,n=a.date.split("-"),i=`${n[2]}-${n[1]}-${n[0]}`;return Object.entries(e).map((([t,e])=>{const a=e.split(":");return{prayer:t,dateTime:new Date(`${i}T${a[0]}:${a[1]}:00`)}}))}(t))).flat().filter((t=>i.includes(t.prayer.toUpperCase()))).filter((t=>t.dateTime>n)).sort(((t,e)=>t.dateTime.getTime()-e.dateTime.getTime()));return a&&(o=o.slice(0,a)),o}function s(t,e,a,i,o){const s=function(t){const e=new Date,a=new Date(new Date(e).setHours(0,0,0,0)),n=new Date(a.getTime()+864e5-1),i=t.findIndex((t=>t.dateTime>e));return t.map(((t,a)=>{let o="unknown",r=!1;return o=t.dateTime<e?"past":t.dateTime>e&&t.dateTime<=n?"today":"future",a===i&&(r=!0),{prayer:t.prayer,dateTime:t.dateTime,status:{state:o,next:r}}}))}(r(t,e,a)),d=new Date,l="#FFFFFF",u=new ListWidget;"accessoryCircular"!==i&&(u.setPadding(16,20,16,20),u.spacing=4);const m=u.addStack();switch(m.layoutVertically(),m.centerAlignContent(),m.spacing=4,s.forEach((t=>{const{prayer:a,dateTime:n}=t,o=function(t,e){const a=new Date(t),n=(new Date(e).getTime()-a.getTime())/864e5;return Math.abs(n)}(d,n)+1,r=new Color(l,.8/o),s=e.find((t=>t.name.toLowerCase()===a.toLowerCase()));if(!s)return;const{name:c,abbreviation:u}=s,g="medium"===i||"large"===i?c.toUpperCase():u;switch(i){case"small":case"medium":case"large":case"extraLarge":!function(t,e,a,n,i){const{dateTime:o,status:r}=a,s=14;let c,d=new Font("AvenirNext-Regular",12);r&&"future"===r.state&&(c=i);r&&r.next&&(d=new Font("AvenirNext-Bold",s));const l=t.addStack();l.spacing=n;const u=l.addText(e);u.font=d,u.lineLimit=1,l.addSpacer();const m=l.addDate(o);m.font=d,m.lineLimit=1,m.applyTimeStyle(),c&&(u.textColor=c,m.textColor=c)}(m,g,t,4,r);break;case"accessoryCircular":!function(t,e,a,n){const{dateTime:i,status:o}=a,r=14;let s,c=new Font("AvenirNext-Regular",12);o&&"future"===o.state&&(s=n);o&&o.next&&(c=new Font("AvenirNext-Bold",r));const d=t.addStack();d.layoutVertically();const l=d.addStack();l.addSpacer();const u=l.addText(e);u.font=c,u.lineLimit=1,l.addSpacer();const m=d.addStack();m.addSpacer();const g=m.addDate(i);g.font=c,g.lineLimit=1,g.minimumScaleFactor=.5,g.applyTimeStyle(),m.addSpacer(),s&&(u.textColor=s,g.textColor=s)}(m,g,t,r)}})),i){case"small":case"medium":case"large":case"extraLarge":const t=u.addStack();t.layoutVertically();const e=c(t,`${o} metres`);e.font=new Font("AvenirNext-Regular",10),e.textColor=new Color(l,.8);const a=c(t,`${n(d)} ${function(t,e={hour:"numeric",minute:"numeric",hour12:!0}){return t.toLocaleTimeString(void 0,e).toUpperCase()}(d)}`);a.font=new Font("AvenirNext-Regular",10),a.textColor=new Color(l,.8)}return u}function c(t,e){const a=t.addStack();a.addSpacer();const n=a.addText(e);return n.lineLimit=1,a.addSpacer(),n}const d={user:{settings:{file:"Prayer Time",directory:"Prayer Time",offline:5},display:{prayerTimes:[{name:"fajr",display:"🌄",abbreviation:"FAJ"},{name:"dhuhr",display:"🕛",abbreviation:"DHU"},{name:"asr",display:"🌞",abbreviation:"ASR"},{name:"maghrib",display:"🌆",abbreviation:"MAG"},{name:"isha",display:"🌙",abbreviation:"ISH"},{name:"imsak",display:"⭐",abbreviation:"IMS"}]}},data:{},api:{endpoint:"https://api.aladhan.com/v1/timings/"},developer:{previewWidgetSize:"small"}};(async()=>{try{await async function(){const{user:{settings:{directory:n,file:c,offline:l},display:{prayerTimes:u}},data:{location:m}}=d,g=1e3,f=config.widgetFamily?config.widgetFamily:"small";let p=5;switch(f){case"small":default:p=5;break;case"medium":case"large":case"extraLarge":p=14;break;case"accessoryCircular":case"accessoryInline":case"accessoryRectangular":p=1}const w=function(t,e){const a=`${t}.json`,n=e,i=FileManager.iCloud(),o=i.joinPath(i.documentsDirectory(),n);return i.fileExists(o)||i.createDirectory(o),i.joinPath(o,a)}(c,n),y=await async function(){const t=new Request("https://www.google.com");t.method="HEAD",t.timeoutInterval=.25;try{return!!await t.load()}catch(t){return!1}}();let h=0;if(y){const n=new Date,s=await t(w),c=function(t,e){const n=t.filter((({date:{gregorian:{date:t}}})=>{const n=e||new Date;n.setHours(0,0,0,0);const i=a(t);return n.toDateString()===i.toDateString()}));if(n[0])return n[0]}(s,n),f=r(s,u).length,{latitude:y,longitude:S}=await Location.current();if(d.data&&d.data.location&&(d.data.location.latitude=y,d.data.location.longitude=S),m&&c){const{meta:t}=c,e=function(t,e){const a=t=>t*(Math.PI/180),n=a(e.latitude-t.latitude),i=a(e.longitude-t.longitude),o=Math.sin(n/2)*Math.sin(n/2)+Math.cos(a(t.latitude))*Math.cos(a(e.latitude))*Math.sin(i/2)*Math.sin(i/2);return 2*Math.atan2(Math.sqrt(o),Math.sqrt(1-o))*6371*1e3}(m,t);h=Math.round(100*(e+Number.EPSILON))/100}if(m&&(f<=p||h>g)){const t=await async function(t){const{api:{endpoint:a,method:n},data:{location:{latitude:o,longitude:r}},user:{settings:{offline:s}}}=t,c=[];for(let t=0;t<s;t++){const s=new Date;s.setDate(s.getDate()+t);const d=e(a,s,{latitude:o,longitude:r,method:n}),l=(await i(d)).data;c.push(l)}return c}(d);await o(w,l,t)}}const S=await t(w);if(S){const t=s(S,u,p,f,h);config.runsInAccessoryWidget?(t.addAccessoryWidgetBackground=!0,Script.setWidget(t)):await t.presentLarge()}}(),Script.complete()}catch(t){console.error(t)}})();

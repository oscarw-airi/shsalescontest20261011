
const SHEET_ID="13bEDi4qQHvfYnOBOQiYgD4HSxlNAK6YWWrAkCkkikOQ";
const SHEET_GID="0";
const URLS=[
 `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`,
 `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`
];
let data=[];
const $=id=>document.getElementById(id);
const money=n=>"$"+Math.round(n||0).toLocaleString("en-US");

function parseNum(v){
 if(typeof v==="number")return v;
 let s=String(v??"").trim().replace(/[\s,$HKD]/gi,"").replace(/,/g,"");
 if(!s)return 0;
 const m=s.match(/-?\d+(?:\.\d+)?/);
 return m?Number(m[0]):0;
}
function csvRows(s){
 const rows=[];let row=[],cell="",quote=false;
 for(let i=0;i<s.length;i++){const c=s[i],n=s[i+1];
  if(c=='"'&&quote&&n=='"'){cell+='"';i++;continue}
  if(c=='"'){quote=!quote;continue}
  if(c==","&&!quote){row.push(cell);cell="";continue}
  if((c=="\n"||c=="\r")&&!quote){if(c=="\r"&&n=="\n")i++;row.push(cell);cell="";if(row.some(v=>v.trim()!=""))rows.push(row);row=[];continue}
  cell+=c;
 }
 row.push(cell);if(row.some(v=>v.trim()!=""))rows.push(row);return rows;
}
function headerIndex(header, words, fallback){
 const h=String(header||"").toLowerCase().replace(/[\s_\-]/g,"");
 const i=words.findIndex(w=>h.includes(w));
 return i>=0?i:fallback;
}
function normalize(rows){
 if(!rows.length)return [];
 const h=rows[0];
 const ci=headerIndex(h[0],["centre","center","shop"],0);
 const ni=headerIndex(h[1],["individual","name","therapist"],1);
 const ti=headerIndex(h[2],["target","goal"],2);
 const ai=headerIndex(h[3],["actualsales","actual","sales","achievement"],3);
 const looksHeader = isNaN(parseNum(h[2])) || isNaN(parseNum(h[3])) || /target|actual|sales/i.test(h.join(" "));
 const body=looksHeader?rows.slice(1):rows;
 return body.map((r,i)=>({id:i+1,centre:String(r[ci]||"").trim(),name:String(r[ni]||"").trim(),target:parseNum(r[ti]),actual:parseNum(r[ai])}))
 .filter(x=>x.name && x.target>0);
}
function targetGroup(t){
 if(t>=350000)return ["🟠","400K","orange"];
 if(t>=225000)return ["🔵","250K","blue"];
 if(t>=100000)return ["🟢","100K–150K","green"];
 return ["🟣","≤100K","purple"];
}
function evo(x){
 const p=x.actual/(x.target*2);
 if(p>=1.5)return ["🔥","LEGEND 150%",p];
 if(p>=1.2)return ["🚀","ELITE 120%",p];
 if(p>=1)return ["⚡","PRO 100%",p];
 return ["🌱","START",p];
}
function reward(x){
 const threshold=x.target*3;
 if(x.actual<threshold)return 0;
 if(x.target>=350000)return 6000+Math.floor((x.actual-threshold)/100000)*2000;
 if(x.target>=225000)return 3500+Math.floor((x.actual-threshold)/100000)*1200;
 if(x.target>=100000)return 2000+Math.floor((x.actual-threshold)/50000)*500;
 return 1000+Math.floor((x.actual-threshold)/50000)*500;
}
function filtered(){
 const c=$("centre").value,t=$("target").value,q=$("search").value.toLowerCase();
 return data.filter(x=>{
  const cg=c==="ALL"||x.centre===c;
  const tg=t==="ALL"||(t==="LOW"?x.target<100000:x.target===Number(t));
  return cg&&tg&&x.name.toLowerCase().includes(q);
 }).sort((a,b)=>b.actual-a.actual);
}
function render(){
 const a=filtered();
 $("total").textContent=money(a.reduce((s,x)=>s+x.actual,0));
 $("champion").textContent=a[0]?.name||"—";$("championSales").textContent=a[0]?money(a[0].actual):"$0";
 $("legends").textContent=a.filter(x=>evo(x)[2]>=1.5).length;$("count").textContent=a.length;$("rows").textContent=a.length+" drivers";
 const max=Math.max(1500000,...a.map(x=>x.actual),1);
 $("race").innerHTML=a.map((x,i)=>{
  const e=evo(x),g=targetGroup(x.target),pos=Math.min(93,x.actual/max*93);
  return `<div class="lane"><div class="car" style="left:${pos}%">${e[0]}🏎️</div><div class="info"><b>${i+1}. ${x.name}</b> · <span style="color:${g[2]=="orange"?"#fb923c":g[2]=="blue"?"#60a5fa":g[2]=="green"?"#34d399":"#c084fc"}">${g[0]} ${g[1]}</span> · ${x.centre} · ${money(x.actual)} · ${Math.round(e[2]*100)}% · ${e[1]}</div></div>`;
 }).join("")||'<div class="empty">No matching drivers.</div>';
 $("table").innerHTML=a.map((x,i)=>{const e=evo(x),g=targetGroup(x.target),r=reward(x);return `<tr><td>${i+1}</td><td>${g[0]} ${x.name}</td><td>${x.centre}</td><td>${money(x.target)}</td><td>${money(x.target*2)}</td><td>${money(x.actual)}</td><td>${Math.round(e[2]*100)}%</td><td>${e[0]} ${e[1]}</td><td>${r?money(r):"🔒 Not unlocked"}</td></tr>`}).join("");
 if(a[0])showDriver(a[0]);
}
function showDriver(x){
 const e=evo(x),r=reward(x),next=[1,1.2,1.5].find(v=>v>e[2]),g=targetGroup(x.target);
 $("personal").innerHTML=`<div class="driver-card"><div class="driver-main"><div class="eyebrow">${g[0]} ${g[1]} TARGET · ${x.centre}</div><div class="driver-name">${e[0]} ${x.name}</div><div class="driver-sales">${money(x.actual)}</div><div>2-month goal: ${money(x.target*2)}</div><div class="progress"><i style="width:${Math.min(100,e[2]*100)}%"></i></div><b>${Math.round(e[2]*100)}% · ${e[1]}</b></div><div class="driver-next"><div class="eyebrow">NEXT UNLOCK</div><div class="next-value">${next?Math.round(next*100)+"% EVOLUTION":"🏁 ALL LEVELS UNLOCKED"}</div><p>${next?`再做 <b>${money(Math.max(0,x.target*2*next-x.actual))}</b> 就到下一級。`:"你已經到達最高 Evolution。"}</p><hr style="border-color:#293a57"><div class="eyebrow">CURRENT REWARD</div><h2>${r?money(r):"🔒 未解鎖"}</h2><p>${r?"獎勵已進入口袋。":"先跑到 150%，再開獎勵箱！"}</p></div></div>`;
}
function centres(){
 const s=$("centre"),old=s.value;s.innerHTML='<option value="ALL">ALL CENTRE</option>';
 [...new Set(data.map(x=>x.centre).filter(Boolean))].sort().forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;s.appendChild(o)});
 if([...s.options].some(o=>o.value===old))s.value=old;
}
async function load(){
 $("connection").textContent="CONNECTING TO LIVE RACE DATA…";
 for(const u of URLS){try{const r=await fetch(u,{cache:"no-store"});if(!r.ok)continue;const rows=csvRows(await r.text()),parsed=normalize(rows);if(parsed.length){data=parsed;centres();render();$("connection").textContent=`● LIVE GOOGLE SHEET · ${data.length} DRIVERS`;return}}catch(e){}}
 data=[];render();$("connection").textContent="⚠ LIVE DATA UNAVAILABLE · CHECK GOOGLE SHEET SHARING";
}
$("centre").onchange=render;$("target").onchange=render;$("search").oninput=render;$("refresh").onclick=load;load();

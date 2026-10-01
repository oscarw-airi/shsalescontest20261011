
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
  if(typeof v==="number") return v;
  const s=String(v??"").trim().replace(/[$,%\sHKD]/gi,"").replace(/,/g,"");
  if(!s) return 0;
  const m=s.match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : 0;
}

function csvRows(s){
  const rows=[]; let row=[], cell="", quote=false;
  for(let i=0;i<s.length;i++){
    const c=s[i], n=s[i+1];
    if(c=='"' && quote && n=='"'){cell+='"';i++;continue}
    if(c=='"'){quote=!quote;continue}
    if(c=="," && !quote){row.push(cell);cell="";continue}
    if((c=="\n"||c=="\r")&&!quote){
      if(c=="\r"&&n=="\n")i++;
      row.push(cell);cell="";
      if(row.some(v=>v.trim()!=""))rows.push(row);
      row=[];continue;
    }
    cell+=c;
  }
  row.push(cell);
  if(row.some(v=>v.trim()!=""))rows.push(row);
  return rows;
}

/*
  IMPORTANT DATA RULE:
  The live Google Sheet has a fixed four-column source:
  A = Centre
  B = Individual
  C = Target
  D = Actual Sales

  Column D is ALWAYS the individual's current total sales.
  We do NOT derive Actual Sales from any other column.

  Summary rows such as Grand Total / Total are ignored completely.
*/
function normalize(rows){
  if(!rows.length) return [];
  const body=rows.slice(1);

  return body.map((r,i)=>({
    id:i+1,
    centre:String(r[0]||"").trim(),
    name:String(r[1]||"").trim(),
    target:parseNum(r[2]),
    actual:parseNum(r[3]) // <-- Column D = Actual Sales
  })).filter(x=>{
    const combined=`${x.centre} ${x.name}`.toLowerCase();
    const summaryRow=/^(grand\s*total|total|grand total)\b/i.test(x.name)
      || /\b(grand\s*total|total)\b/i.test(x.centre)
      || combined.trim()==="total"
      || combined.includes("grand total");
    return x.name && x.target>0 && !summaryRow;
  });
}

function targetGroup(t){
  if(t>=350000)return ["🟠","400K","orange"];
  if(t>=225000)return ["🔵","250K","blue"];
  if(t>=100000)return ["🟢","100K–150K","green"];
  return ["🟣","BELOW 100K","purple"];
}

function evo(x){
  const p=x.target?x.actual/x.target:0;
  if(p>=3)return ["👑","CROWN",p];
  if(p>=2)return ["🥇","GOLD",p];
  if(p>=1)return ["💎","DIAMOND",p];
  return ["🐱","RUNNING",p];
}

function checkpoint(x){
  if(x.actual<x.target)return {label:"💎 鑽石",need:x.target-x.actual,sales:x.target};
  if(x.actual<x.target*2)return {label:"🥇 黃金",need:x.target*2-x.actual,sales:x.target*2};
  if(x.actual<x.target*3)return {label:"👑 皇冠",need:x.target*3-x.actual,sales:x.target*3};
  return {label:"🏁 MAX",need:0,sales:x.target*3};
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
  const achievedAll=data.reduce((sum,x)=>sum+x.actual,0);
  const missionTotal=30000000;
  const remaining=Math.max(0,missionTotal-achievedAll);
  const missionPct=Math.min(100,(achievedAll/missionTotal)*100);
  $("remaining").textContent=money(remaining);
  $("achieved").textContent=money(achievedAll);
  $("missionProgress").style.width=missionPct+"%";
  $("champion").textContent=a[0]?.name||"—";
  $("championSales").textContent=a[0]?money(a[0].actual):"$0";
  $("legends").textContent=a.filter(x=>evo(x)[2]>=1.5).length;
  $("count").textContent=a.length;
  $("rows").textContent=a.length+" drivers";

  const max=Math.max(2000000,...a.map(x=>x.actual),1);
  const stages=[0,200000,250000,400000,500000,600000,700000,800000,1000000,1200000,1500000,2000000];
  const stageMarkup=stages.map(v=>`<span class="milestone-badge" style="left:${Math.min(92,(v/max)*92)}%">${v===0?"START":"$"+(v/1000)+"K"}</span>`).join("");
  $("race").innerHTML=`<div class="lane race-scale">${stageMarkup}</div>`+
  a.map((x,i)=>{
    const e=evo(x),g=targetGroup(x.target),pos=Math.min(92,(x.actual/max)*92);
    const color=g[2]=="orange"?"#fb923c":g[2]=="blue"?"#60a5fa":g[2]=="green"?"#34d399":"#c084fc";
    return `<div class="lane"><div class="car cat-driver" style="left:${pos}%"><span class="cat-trail"></span>${e[0]}🐱<span class="driver-name-tag">${x.name} · ${money(x.actual)}</span></div><div class="info"><span style="color:${color}">${g[0]} ${g[1]}</span> · ${x.centre} · ${e[1]} · ${money(x.actual)}</div></div>`;
  }).join("")||'<div class="empty">No matching drivers.</div>';
  $("table").innerHTML=a.map((x,i)=>{
    const e=evo(x),g=targetGroup(x.target),r=reward(x);
    return `<tr>
      <td>${i+1}</td><td>${g[0]} ${x.name}</td><td>${x.centre}</td>
      <td>${money(x.target)}</td><td>${money(x.target*2)}</td><td>${money(x.actual)}</td>
      <td>${Math.round(e[2]*100)}%</td><td>${e[0]} ${e[1]}</td><td>${r?money(r):"🔒 Not unlocked"}</td>
    </tr>`;
  }).join("");

  if(a[0]) showDriver(a[0]);
}

function showDriver(x){
  const e=evo(x),r=reward(x),next=[1,1.2,1.5].find(v=>v>e[2]),g=targetGroup(x.target);
  $("personal").innerHTML=`<div class="driver-card">
    <div class="driver-main">
      <div class="eyebrow">${g[0]} ${g[1]} TARGET · ${x.centre}</div>
      <div class="driver-name">${e[0]} ${x.name}</div>
      <div class="driver-sales">${money(x.actual)}</div>
      <div>2-month goal: ${money(x.target*2)}</div>
      <div class="progress"><i style="width:${Math.min(100,e[2]*100)}%"></i></div>
      <b>${Math.round(e[2]*100)}% · ${e[1]}</b>
    </div>
    <div class="driver-next">
      <div class="eyebrow">NEXT UNLOCK</div>
      <div class="next-value">${next?Math.round(next*100)+"% EVOLUTION":"🏁 ALL LEVELS UNLOCKED"}</div>
      <p>${next?`再做 <b>${money(Math.max(0,x.target*2*next-x.actual))}</b> 就到下一級。`:"你已經到達最高 Evolution。"}</p>
      <hr style="border-color:#293a57">
      <div class="eyebrow">CURRENT REWARD</div>
      <h2>${r?money(r):"🔒 未解鎖"}</h2>
      <p>${r?"獎勵已進入口袋。":"先跑到 150%，再開獎勵箱！"}</p>
    </div>
  </div>`;
}

function centres(){
  const s=$("centre"),old=s.value;
  s.innerHTML='<option value="ALL">ALL CENTRE</option>';
  [...new Set(data.map(x=>x.centre).filter(Boolean))].sort().forEach(c=>{
    const o=document.createElement("option");
    o.value=c;o.textContent=c;s.appendChild(o);
  });
  if([...s.options].some(o=>o.value===old))s.value=old;
}

async function load(){
  $("connection").textContent="CONNECTING TO LIVE RACE DATA…";
  for(const u of URLS){
    try{
      const r=await fetch(u,{cache:"no-store"});
      if(!r.ok) continue;
      const rows=csvRows(await r.text());
      const parsed=normalize(rows);
      if(parsed.length){
        data=parsed;
        centres();
        render();
        $("connection").textContent=`● LIVE GOOGLE SHEET · ${data.length} DRIVERS`;
        return;
      }
    }catch(e){}
  }
  data=[];
  render();
  $("connection").textContent="⚠ LIVE DATA UNAVAILABLE · CHECK GOOGLE SHEET SHARING";
}

$("centre").onchange=render;
$("target").onchange=render;
$("search").oninput=render;
$("refresh").onclick=load;
load();

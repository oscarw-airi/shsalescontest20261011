const SHEET_ID="13bEDi4qQHvfYnOBOQiYgD4HSxlNAK6YWWrAkCkkikOQ";
const SHEET_GID="0";
const CSV_URL=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
const FALLBACK_URL=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`;
let data=[];

const $=id=>document.getElementById(id);
const money=n=>"¥"+Math.round(n||0).toLocaleString("zh-CN");

function num(v){
  if(typeof v==="number") return v;
  const s=String(v??"").trim().replace(/[\s,$¥HKD]/gi,"").replace(/,/g,"");
  const m=s.match(/-?\d+(?:\.\d+)?/);
  return m?Number(m[0]):0;
}
function csvRows(s){
  const rows=[];let row=[],cell="",q=false;
  for(let i=0;i<s.length;i++){
    const c=s[i],n=s[i+1];
    if(c=='"'&&q&&n=='"'){cell+='"';i++;continue}
    if(c=='"'){q=!q;continue}
    if(c==","&&!q){row.push(cell);cell="";continue}
    if((c=="\n"||c=="\r")&&!q){if(c=="\r"&&n=="\n")i++;row.push(cell);cell="";if(row.some(v=>v.trim()!=""))rows.push(row);row=[];continue}
    cell+=c;
  }
  row.push(cell);if(row.some(v=>v.trim()!=""))rows.push(row);return rows;
}
function normalize(rows){
  if(!rows.length)return [];
  return rows.slice(1).map((r,i)=>({
    id:i+1,
    centre:String(r[0]||"").trim(),
    name:String(r[1]||"").trim(),
    target:num(r[2]),
    actual:num(r[3]) // Column D = current individual total sales
  })).filter(x=>{
    const text=(x.centre+" "+x.name).toLowerCase();
    const summary=/\b(grand\s*total|total)\b/i.test(text);
    return x.name&&x.target>0&&!summary;
  });
}
function group(t){
  if(t>=350000)return ["🟠","40万组","orange"];
  if(t>=225000)return ["🔵","25万组","blue"];
  if(t>=100000)return ["🟢","10–15万组","green"];
  return ["🟣","10万以下","purple"];
}
function evolution(x){
  const p=x.target?x.actual/x.target:0;
  if(p>=3)return ["👑","皇冠",p,3];
  if(p>=2)return ["🥇","黄金",p,2];
  if(p>=1)return ["💎","钻石",p,1];
  return ["🐱","冲刺中",p,0];
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
  const c=$("centre").value,t=$("target").value,q=$("search").value.trim().toLowerCase();
  return data.filter(x=>{
    const a=c==="ALL"||x.centre===c;
    const b=t==="ALL"||(t==="LOW"?x.target<100000:x.target===Number(t));
    const d=!q||x.name.toLowerCase().includes(q);
    return a&&b&&d;
  }).sort((a,b)=>b.actual-a.actual);
}
function spritePosition(level){
  if(level>=3)return "100% 100%";   // Crown
  if(level>=2)return "0% 100%";     // Gold
  if(level>=1)return "100% 0%";     // Diamond
  return "0% 0%";                    // Coin / start
}
function renderDriverOptions(list=data){
  const selects=[$("driver"),$("evolutionDriver")];
  selects.forEach(s=>{
    const current=s.value;
    s.innerHTML='<option value="">选择一位治疗师</option>';
    list.forEach(x=>s.insertAdjacentHTML("beforeend",`<option value="${x.id}">${x.name} · ${money(x.actual)}</option>`));
    if([...s.options].some(o=>o.value===current))s.value=current;
  });
}
function render(){
  const list=filtered();
  const allSales=data.reduce((s,x)=>s+x.actual,0);
  const total=30000000;
  const remain=Math.max(0,total-allSales);
  $("remaining").textContent=money(remain);
  $("achieved").textContent="已完成 "+money(allSales);
  $("missionProgress").style.width=Math.min(100,allSales/total*100)+"%";
  $("champion").textContent=list[0]?.name||"—";
  $("championSales").textContent=list[0]?money(list[0].actual):"¥0";
  $("crownCount").textContent=data.filter(x=>evolution(x)[3]>=3).length;
  $("count").textContent=list.length;
  $("rows").textContent=list.length+" 位";

  // Fixed money scale: ¥2M is the end of the visual track.
  // A person's physical position is ALWAYS proportional to Column D Actual Sales.
  const max=2000000;
  const scaleValues=[0,200000,400000,600000,800000,1000000,1500000,2000000];
  $("moneyScale").innerHTML=scaleValues.map(v=>{
    const p=(v/max)*100;
    return `<span style="left:${p}%">${v===0?"¥0":"¥"+(v/10000).toLocaleString("zh-CN")+"万"}</span>`;
  }).join("");

  $("race").innerHTML=list.map((x,i)=>{
    const e=evolution(x),g=group(x.target),pos=Math.min(100,(x.actual/max)*100);
    const bg=g[2]=="orange"?"#fb923c":g[2]=="blue"?"#60a5fa":g[2]=="green"?"#34d399":"#c084fc";
    return `<div class="lane">
      <div class="race-cat" style="left:calc(${pos}% - 39px);background-position:${spritePosition(e[3])}">
        <span class="cat-name">${x.name}<span class="cat-sales">${money(x.actual)}</span></span>
      </div>
      <div class="race-state" style="color:${bg}">${g[0]} ${g[1]} · ${e[0]} ${e[1]}</div>
    </div>`;
  }).join("")||'<div class="empty">没有符合条件的参赛者。</div>';

  $("table").innerHTML=list.map((x,i)=>{
    const e=evolution(x),g=group(x.target),r=reward(x);
    return `<tr><td>${i+1}</td><td>${g[0]} ${x.name}</td><td>${x.centre}</td><td>${money(x.target)}</td><td>${money(x.target*2)}</td><td>${money(x.actual)}</td><td>${e[0]} ${e[1]}</td><td>${r?money(r):"🔒 未解锁"}</td></tr>`;
  }).join("");

  renderEvolution($("evolutionDriver").value);
}
function renderEvolution(id){
  const x=data.find(v=>String(v.id)===String(id));
  if(!x){
    $("evolutionEmpty").classList.remove("hidden");
    $("evolutionCard").classList.add("hidden");
    return;
  }
  $("evolutionEmpty").classList.add("hidden");
  $("evolutionCard").classList.remove("hidden");
  const e=evolution(x),g=group(x.target);
  const stages=[
    {name:"钻石",sales:x.target,pos:"diamond",level:1},
    {name:"黄金",sales:x.target*2,pos:"gold",level:2},
    {name:"皇冠",sales:x.target*3,pos:"crown",level:3}
  ];
  const cards=stages.map(s=>{
    const done=x.actual>=s.sales;
    const need=Math.max(0,s.sales-x.actual);
    return `<div class="evo-stage ${done?"active":""}">
      <div class="cat-sprite ${s.pos}"></div>
      <div class="stage-title">${s.name} ${done?"✓":"🔒"}</div>
      <div class="stage-sales">${money(s.sales)}</div>
      <div class="stage-state">${done?"已进化":"还差 "+money(need)}</div>
    </div>`;
  }).join("");
  $("evolutionCard").innerHTML=`<div class="evo-card">
    <div class="evo-driver">
      <div class="eyebrow">${g[0]} ${g[1]} · ${x.centre}</div>
      <div class="evo-driver-name">${e[0]} ${x.name}</div>
      <div class="evo-sales">${money(x.actual)}</div>
      <div>当前 Actual Sales</div>
      <div class="progress"><i style="width:${Math.min(100,x.actual/(x.target*3)*100)}%"></i></div>
      <b>下一进化：${x.actual<x.target?"💎 钻石":x.actual<x.target*2?"🥇 黄金":x.actual<x.target*3?"👑 皇冠":"🏁 全部完成"}</b>
    </div>
    <div class="evo-road">${cards}</div>
  </div>`;
}
function centres(){
  const s=$("centre"),old=s.value;
  s.innerHTML='<option value="ALL">全部中心</option>';
  [...new Set(data.map(x=>x.centre).filter(Boolean))].sort().forEach(c=>{
    const o=document.createElement("option");o.value=c;o.textContent=c;s.appendChild(o);
  });
  if([...s.options].some(o=>o.value===old))s.value=old;
}
async function load(){
  $("connection").textContent="正在连接实时赛况…";
  for(const url of [CSV_URL,FALLBACK_URL]){
    try{
      const r=await fetch(url,{cache:"no-store"});
      if(!r.ok)continue;
      const parsed=normalize(csvRows(await r.text()));
      if(parsed.length){
        data=parsed;centres();renderDriverOptions();render();
        $("connection").textContent=`● 实时数据已连接 · ${data.length} 位治疗师`;
        return;
      }
    }catch(e){}
  }
  data=[];renderDriverOptions([]);render();
  $("connection").textContent="⚠ 无法读取 Google Sheet，请检查公开查看权限";
}
$("centre").onchange=render;
$("target").onchange=render;
$("search").oninput=render;
$("driver").onchange=()=>render();
$("evolutionDriver").onchange=e=>renderEvolution(e.target.value);
$("refresh").onclick=load;
load();
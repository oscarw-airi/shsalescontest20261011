# shsalescontest20261011
from pathlib import Path

html = r"""<!DOCTYPE html>
<html lang="zh-HK">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NeoDerm Double Month Sales Derby</title>
<style>
body{margin:0;background:#070b18;color:white;font-family:Arial,"Microsoft JhengHei",sans-serif}
.header{text-align:center;padding:35px;background:linear-gradient(120deg,#111827,#1e293b)}
h1{font-size:46px;margin:0;color:#22d3ee}
.subtitle{font-size:20px;color:#cbd5e1}
.filters{padding:20px;display:flex;gap:15px;flex-wrap:wrap}
select,input{padding:12px;border-radius:10px;background:#172033;color:white;border:1px solid #475569}
.card{background:#111827;margin:20px;padding:25px;border-radius:22px;border:1px solid #334155}
.track{background:#0f172a;border-radius:25px;padding:25px;margin:20px}
.lane{height:120px;border-bottom:1px dashed #475569;position:relative}
.car{position:absolute;top:30px;font-size:45px}
.info{position:absolute;top:80px;font-size:14px}
.reward{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:15px}
.reward div{background:#1e293b;padding:20px;border-radius:15px}
table{width:100%;border-collapse:collapse}
td,th{padding:12px;border-bottom:1px solid #334155}
.badge{padding:5px 10px;border-radius:20px}
.t20{background:#2563eb}.t40{background:#f97316}.t10{background:#10b981}.t50{background:#a855f7}
</style>
</head>
<body>

<div class="header">
<h1>🏁 Double Month Sales Derby</h1>
<div class="subtitle">2 Months Target Challenge = 150% Achievement Race</div>
</div>

<div class="filters">
<select id="targetFilter" onchange="render()">
<option value="ALL">All Target Group</option>
<option value="400000">$400K Target</option>
<option value="200000">$200K Target</option>
<option value="150000">$100K-$150K Target</option>
<option value="50000">$50K-$60K Target</option>
</select>
<input id="search" placeholder="Search Individual" onkeyup="render()">
</div>

<div class="card">
<h2 id="summary"></h2>
</div>

<div class="track">
<h2>🏎️ Live Sales Evolution Track</h2>
<div id="race"></div>
</div>

<div class="card">
<h2>🎁 Reward System</h2>
<div class="reward">
<div>
<h3>$400K Target</h3>
<p>150% = $1.2M sales</p>
<p>Base Reward: $6,000</p>
<p>Every +$100K = +$2,000</p>
</div>

<div>
<h3>$200K Target</h3>
<p>150% = $600K sales</p>
<p>Base Reward: $3,500</p>
<p>Every +$100K = +$1,200</p>
</div>

<div>
<h3>$100K-$150K Target</h3>
<p>150% Achievement</p>
<p>Base Reward: $2,000</p>
<p>Every +$50K = +$500</p>
</div>

<div>
<h3>Below $100K Target</h3>
<p>150% Achievement</p>
<p>Base Reward: $1,000</p>
<p>Every +$50K = +$500</p>
</div>
</div>
</div>

<div class="card">
<h2>✈️ Travel Bonus (Team + Individual Green Light)</h2>
<p>Condition: Team 2 months green + Individual 2 months green</p>
<p>$400K Target → $6,000 | $250K Target → $3,500 | $100K-$150K → $2,000 | $50K-$60K → $1,000</p>
</div>

<div class="card">
<h2>🏆 Ranking</h2>
<table>
<thead>
<tr><th>Rank</th><th>Name</th><th>Target</th><th>Actual 2M Sales</th><th>Achievement</th><th>Level</th><th>Reward</th></tr>
</thead>
<tbody id="table"></tbody>
</table>
</div>

<script>
const data=[
{name:"Ali",target:400000,actual:1300000},
{name:"Jade",target:400000,actual:1200000},
{name:"Joanne",target:200000,actual:700000},
{name:"Venus",target:150000,actual:500000},
{name:"Miki",target:50000,actual:200000}
];

function money(x){return "$"+x.toLocaleString()}

function level(x){
let pct=x.actual/x.target;
if(pct>=1.5)return "🔥 Evolution 150%";
if(pct>=1.2)return "🚀 Evolution 120%";
if(pct>=1)return "⚡ Evolution 100%";
return "🌱 Start";
}

function reward(x){
let pct=x.actual/x.target;
if(x.target>=400000){
if(pct<1.5)return "$0";
return "$"+(6000+Math.floor((x.actual-1200000)/100000)*2000);
}
if(x.target>=200000){
if(pct<1.5)return "$0";
return "$"+(3500+Math.floor((x.actual-600000)/100000)*1200);
}
if(x.target>=100000){
if(pct<1.5)return "$0";
return "$"+(2000+Math.floor((x.actual-x.target*1.5)/50000)*500);
}
if(pct<1.5)return "$0";
return "$"+(1000+Math.floor((x.actual-x.target*1.5)/50000)*500);
}

function render(){
let filter=document.getElementById("targetFilter").value;
let search=document.getElementById("search").value.toLowerCase();

let arr=data.filter(x=>
(filter==="ALL"||x.target==filter)&&
x.name.toLowerCase().includes(search)
).sort((a,b)=>b.actual-a.actual);

document.getElementById("summary").innerHTML=
"Current Leader: "+(arr[0]?.name||"-")+" | Total Sales: "+money(arr.reduce((a,b)=>a+b.actual,0));

let race="";
arr.forEach((x,i)=>{
let p=Math.min(x.actual/1500000*90,90);
let emoji=x.actual/x.target>=1.5?"🏎️🔥":x.actual/x.target>=1.2?"🏎️🚀":x.actual/x.target>=1?"🏎️⚡":"🏎️";
race+=`<div class="lane">
<div class="car" style="left:${p}%">${emoji}</div>
<div class="info">${i+1}. ${x.name} ${money(x.actual)} | ${Math.round(x.actual/x.target*100)}% | ${level(x)} | Reward ${reward(x)}</div>
</div>`;
});
document.getElementById("race").innerHTML=race;

let table="";
arr.forEach((x,i)=>{
table+=`<tr><td>${i+1}</td><td>${x.name}</td><td>${money(x.target)}</td><td>${money(x.actual)}</td><td>${Math.round(x.actual/x.target*100)}%</td><td>${level(x)}</td><td>${reward(x)}</td></tr>`;
});
document.getElementById("table").innerHTML=table;
}
render();
</script>

</body>
</html>
"""

path=Path("/mnt/data/NeoDerm_Double_Month_Sales_Derby.html")
path.write_text(html,encoding="utf-8")
str(path)

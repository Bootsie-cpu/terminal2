const out=document.getElementById('output');
let geoMap, currentMarker;

function initGeoMap() {
  geoMap = L.map('geo-map', {zoomControl: false}).setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'NETRUN TARGETING SYSTEM'
  }).addTo(geoMap);
}

function print(s){
 out.textContent += '\n'+s;
 out.scrollTop=out.scrollHeight;
}

async function run(raw){
 const a=raw.trim().split(/\s+/);
 const c=(a[0]||'').toLowerCase();
 if(!c)return;
 print('\nroot@netrun:~\$ '+raw);
 if(c==='help'){
 print(`COMMANDS
 help                 Show commands
 clear                Clear terminal
 system               Show browser capabilities
 refresh              Fetch real global data stream
 ip lookup <host>     Geolocate and map a domain or IP
 dissect <url>        Extract source architecture of a web page
 site <domain>        Inspect public DNS records`);
 }else if(c==='clear'){
 out.textContent='';
 }else if(c==='system'){
 print('NETRUN running in sandboxed environment');
 print('Canvas telemetry engine: real-time streaming active');
 print('Geographic tracker: initialized');
 print('Live packet capture: redirected via encrypted network endpoints');
 }else if(c==='refresh'){
 await fetchRealTelemetry();
 }else if(c==='ip'&&a[1]==='lookup'&&a[2]){
 await lookup(a.slice(2).join(' '));
 }else if(c==='dissect'&&a[1]){
 await dissectWebsite(a[1]);
 }else if(c==='site'&&a[1]){
 await dnsLookup(a[1]);
 }else{
 print('Unknown command. Type help.');
 }
}

document.getElementById('form').onsubmit=e=>{
 e.preventDefault();run(document.getElementById('cmd').value);
 document.getElementById('cmd').value='';
};
document.getElementById('lookup').onsubmit=async e=>{
 e.preventDefault();await lookup(document.getElementById('target').value.trim());
};
document.getElementById('dissect-form').onsubmit=async e=>{
 e.preventDefault();await dissectWebsite(document.getElementById('dissect-url').value.trim());
};

async function dnsLookup(host){
 host=host.replace(/^https?:\/\//,'').split('/')[0];
 if(!host||!host.includes('.')){print('Enter a valid domain name.');return}
 print('Querying public DNS for '+host+' ...');
 try{
  const r=await fetch('https://dns.google');
  const d=await r.json();
  const answers=(d.Answer||[]).filter(x=>x.type===1).map(x=>x.data);
  print('Domain: '+host+'\nA records: '+(answers.join(', ')||'No IPv4 answer found'));
 }catch(e){print('DNS lookup failed.')}
}
async function lookup(value){
 value=value.trim();
 if(!value)return;
 const box=document.getElementById('result');
 box.textContent='Running deep geolocation trace...';
 try{
  let ip=value;
  if(!/^[\d.:a-f]+\$/i.test(value)){
   const cleanedHost = value.replace(/^https?:\/\//,'').split('/');
   const r=await fetch('https://dns.google');
   const d=await r.json();
   const ans=(d.Answer||[]).find(x=>x.type===1);
   if(!ans)throw Error('No IPv4 host found.');
   ip=ans.data;
  }
  const r=await fetch('https://ipwho.is);
  const d=await r.json();
  if(!d.success)throw Error(d.message||'Lookup trace failed');
  const info=`TARGET LOCATED:
IP: ${d.ip}
Location: ${d.city}, ${d.region}, ${d.country}
ISP/Provider: ${d.connection?.isp||'Unknown'}
Coordinates: ${d.latitude}, ${d.longitude}`;
  box.textContent=info;
  print(info);

  if(d.latitude && d.longitude) {
    const lat = parseFloat(d.latitude);
    const lon = parseFloat(d.longitude);
    geoMap.setView([lat, lon], 10);
    if(currentMarker) geoMap.removeLayer(currentMarker);
    currentMarker = L.marker([lat, lon]).addTo(geoMap)
      .bindPopup(`<b>Target IP:</b> ${d.ip}<br><b>City:</b> ${d.city}`)
      .openPopup();
  }
 }catch(e){box.textContent=e.message;print('Tracking failure: '+e.message)}
}

async function dissectWebsite(url) {
  if(!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  const displayBox = document.getElementById('dissect-output');
  displayBox.innerHTML = '<span class="amber">Establishing proxy bypass... Inspecting target source infrastructure...</span>';
  print(`Dissecting website signature: ${url}`);
  
  try {
    const response = await fetch(`https://allorigins.win{encodeURIComponent(url)}`);
    if(!response.ok) throw new Error('Target server rejected safe proxy connection.');
    const data = await response.json();
    const htmlString = data.contents;
    
    if(!htmlString) {
       throw new Error('Empty payload returned from target domain architecture.');
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    const title = doc.querySelector('title')?.textContent || 'No Explicit Title Found';
    const scripts = doc.querySelectorAll('script').length;
    const links = doc.querySelectorAll('a').length;
    const images = doc.querySelectorAll('img').length;
    
    let structureLog = `=== ARCHITECTURE ANALYSIS FOR: ${url} ===\n`;
    structureLog += `Payload Size      : ${htmlString.length} bytes\n`;
    structureLog += `Metadata Title    : ${title}\n`;
    structureLog += `Script Tags Found : ${scripts}\n`;
    structureLog += `Anchor Links (A)  : ${links}\n`;
    structureLog += `Image Assets (IMG): ${images}\n\n`;
    structureLog += `=== RAW HTML INJECTION ARCHIVE ===\n`;
    structureLog += htmlString.substring(0, 1500) + "\n\n[... TRUNCATED FOR SECURITY TERMINAL LENGTH ...]";
    
    displayBox.textContent = structureLog;
    print(`Website extraction complete. ${htmlString.length} bytes dissected safely.`);
  } catch(err) {
    displayBox.textContent = `CRITICAL DISSECTION ERROR: ${err.message}\nEnsure the domain exists and accepts public traffic connection routing.`;
    print(`Dissection payload failed: ${err.message}`);
  }
}

const canvas=document.getElementById('map');
const ctx=canvas.getContext('2d');
let nodes=[],packets=[];

function drawMap(){
 const rect=canvas.getBoundingClientRect();
 const w=canvas.width=Math.max(280,rect.width*devicePixelRatio);
 const h=canvas.height=270*devicePixelRatio;
 nodes=Array.from({length:45},()=>({
 x:Math.random()*w,y:Math.random()*h,
 vx:(Math.random()-.5)*.15,vy:(Math.random()-.5)*.15
 }));
}

async function fetchRealTelemetry() {
  print('Intercepting live international data streams...');
  try {
    const res = await fetch('https://usgs.gov');
    const geoData = await res.json();
    const features = geoData.features || [];
    
    packets = [];
    print(`Connected! ${features.length} live international data stream links established.`);
    
    features.slice(0, 30).forEach((item, index) => {
       packets.push({
         a: Math.floor(Math.random() * nodes.length),
         b: Math.floor(Math.random() * nodes.length),
         t: Math.random(),
         speed: 0.002 + (item.properties.mag || 1) * 0.002
       });
    });
  } catch(e) {
    print('Telemetry pipeline error. Reverting to automated proxy packets.');
    packets = Array.from({length:20},()=>({
     a:Math.floor(Math.random()*nodes.length),b:Math.floor(Math.random()*nodes.length),
     t:Math.random(),speed:0.005
    }));
  }
}

function frame(){
 const w=canvas.width,h=canvas.height;
 ctx.clearRect(0,0,w,h);
 nodes.forEach(n=>{
 n.x+=n.vx;n.y+=n.vy;
 if(n.x<0||n.x>w)n.vx*=-1;
 if(n.y<0||n.y>h)n.vy*=-1;
 });
 nodes.forEach((a,i)=>nodes.slice(i+1).forEach(b=>{
 const d=Math.hypot(a.x-b.x,a.y-b.y);
 if(d<w*.12){
 ctx.strokeStyle='rgba(35,180,95,'+(1-d/(w*.12))*.25+')';
 ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
 }
 }));
 nodes.forEach(n=>{
 ctx.fillStyle='#5aff91';ctx.beginPath();
 ctx.arc(n.x,n.y,2*devicePixelRatio,0,Math.PI*2);ctx.fill();
 });
 packets.forEach(p=>{
 const a=nodes[p.a],b=nodes[p.b];if(!a||!b)return;
 p.t+=p.speed;if(p.t>1)p.t=0;
 ctx.fillStyle='#ffffff';
 ctx.shadowColor='#5aff91';
 ctx.shadowBlur=4;
 ctx.beginPath();
 ctx.arc(a.x+(b.x-a.x)*p.t,a.y+(b.y-a.y)*p.t,3*devicePixelRatio,0,Math.PI*2);
 ctx.fill();
 ctx.shadowBlur=0;
 });
 requestAnimationFrame(frame);
}

initGeoMap();
drawMap();
fetchRealTelemetry().then(() => frame());

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('data:text/javascript,console.log("Terminal Service Worker Active");').catch(()=>{});
}

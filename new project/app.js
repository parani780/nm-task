document.addEventListener('DOMContentLoaded', ()=>{
  const simulateBtn = document.getElementById('simulate');
  const deployBtn = document.getElementById('deploy');
  const usersInput = document.getElementById('users');
  const simResult = document.getElementById('simResult');
  const commandsEl = document.getElementById('commands');
  const logEl = document.getElementById('log');

  function log(line){
    const t = new Date().toLocaleTimeString();
    logEl.textContent += `[${t}] ${line}\n`;
    logEl.scrollTop = logEl.scrollHeight;
  }

  simulateBtn.addEventListener('click', async ()=>{
    const users = Number(usersInput.value) || 100;
    simResult.textContent = 'Running simulation...';
    log(`Starting traffic simulation for ${users} users`);
    try{
      const res = await fetch('/simulate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({users})});
      const json = await res.json();
      simResult.textContent = `Peak: ${json.peakUsers} users — Recommendation: ${json.recommendation}`;
      log(`Simulation complete: ${json.peakUsers} peak, ${json.recommendation}`);
    }catch(e){
      simResult.textContent = 'Simulation failed';
      log('Simulation error: '+e.message);
    }
  });

  deployBtn.addEventListener('click', async ()=>{
    log('Preparing deployment preview...');
    commandsEl.textContent = 'Fetching deployment commands...';
    try{
      const res = await fetch('/deploy',{method:'POST'});
      const json = await res.json();
      commandsEl.textContent = json.commands.join('\n');
      log('Deployment preview fetched');

      // Simulate a staged deploy progress locally for UI
      log('Triggering simulated deploy (safe preview only)');
      for(let i=0;i<4;i++){
        await new Promise(r=>setTimeout(r,500));
        log(['Building container','Pushing image','Updating services','Verifying health'][i]);
      }
      log('Preview deploy complete — use your CI (Jenkins) to run actual pipeline');
    }catch(e){
      commandsEl.textContent = 'Failed to fetch deploy preview';
      log('Deploy preview error: '+e.message);
    }
  });
});

// Floating info panel — project details and quick references
const projectInfo = {
  overview: `This demo illustrates an automated deployment workflow designed for high-traffic events. It includes a frontend traffic simulator, a Node.js server, Docker containerization, and a sample Jenkins pipeline for CI/CD. The UI focuses on clarity, safe deploy previews, and actionable recommendations.`,
  commands: `# Docker build and push (example):\n
docker build -t registry.example.com/myteam/myapp:latest .\ndocker push registry.example.com/myteam/myapp:latest\n\n# Kubernetes rollout (example):\nkubectl set image deployment/myapp myapp=registry.example.com/myteam/myapp:latest --record\n\n# Jenkins pipeline: see Jenkinsfile in repository`,
  arch: `Architecture (example):\n- Users -> CDN -> Load Balancer -> Multiple stateless Node.js replicas behind autoscaler\n- Images stored in container registry; deployments via CI to k8s with health checks and readiness probes\n- Metrics: use Prometheus/Grafana; alerts for high latency and error rates`,
  best: `Best practices for high-traffic deploys:\n- Use canary or blue/green deployments to reduce blast radius.\n- Enable autoscaling based on request latency and custom metrics.\n- Employ connection draining and graceful shutdowns.\n- Run load tests before the event; monitor and rollback quickly if necessary.`
  ,
  contents: `
<h3>Repository contents</h3>
<ul>
  <li><strong>index.html</strong> — Frontend UI with traffic simulator, deployment preview, live log, and floating info panel.</li>
  <li><strong>styles.css</strong> — Professional navy & teal theme, layout, and floating panel styling.</li>
  <li><strong>app.js</strong> — Frontend logic: simulator calls, deploy preview fetch, log UI, and info-panel tab rendering.</li>
  <li><strong>server.js</strong> — Minimal Express server serving static files and endpoints: <code>/simulate</code> and <code>/deploy</code>.</li>
  <li><strong>package.json</strong> — Project metadata and scripts; includes Express dependency.</li>
  <li><strong>Dockerfile</strong> — Containerization steps for building the production image.</li>
  <li><strong>Jenkinsfile</strong> — Sample declarative pipeline that builds, pushes, and deploys the image (requires credentials and kubectl context).</li>
  <li><strong>README.md</strong> — Run instructions, Docker and Jenkins guidance.</li>
</ul>
<p>Each file is intentionally minimal for clarity — customize env vars, registry, and CI credentials before using in production.</p>
`
};

function $(id){return document.getElementById(id)}
const infoToggle = $('infoToggle');
const infoPanel = $('infoPanel');
const infoClose = $('infoClose');
const infoContent = $('infoContent');
const tabs = Array.from(document.querySelectorAll('.info-tabs .tab'));

function openInfo(){
  infoPanel.setAttribute('aria-hidden','false');
  renderTab('overview');
}
function closeInfo(){
  infoPanel.setAttribute('aria-hidden','true');
}

function renderTab(name){
  tabs.forEach(t=>t.classList.toggle('active', t.dataset.tab===name));
  const data = projectInfo[name] || 'No data available.';
  let html = '';
  if(name==='commands' || name==='arch' || name==='best'){
    html = `<pre>${escapeHtml(data)}</pre>`;
  } else if(name==='contents'){
    // contents holds preformatted HTML (file list)
    html = data;
  } else {
    html = `<h3>${name[0].toUpperCase()+name.slice(1)}</h3><p>${escapeHtml(data)}</p>`;
  }
  infoContent.innerHTML = html;
}

function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

infoToggle.addEventListener('click', ()=>{
  const hidden = infoPanel.getAttribute('aria-hidden') === 'false';
  if(hidden) closeInfo(); else openInfo();
});
infoClose.addEventListener('click', closeInfo);
tabs.forEach(t=>t.addEventListener('click', ()=>renderTab(t.dataset.tab)));

// close panel when clicking outside
document.addEventListener('click',(e)=>{
  if(!infoPanel.contains(e.target) && !infoToggle.contains(e.target)){
    closeInfo();
  }
});


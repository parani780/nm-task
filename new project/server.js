const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/simulate', (req, res) => {
  const users = (req.body && req.body.users) ? Number(req.body.users) : 100;
  // Very simple heuristic for demo purposes
  const baseline = 500;
  const peak = Math.max(users, baseline);
  let recommendation = 'No special action needed.';
  if (peak > 2000) recommendation = 'Enable autoscaling, drain connections gracefully, use canary deploys.';
  else if (peak > 1000) recommendation = 'Scale up replicas and enable rolling updates.';
  res.json({peakUsers: peak, recommendation});
});

app.post('/deploy', (req, res) => {
  // Provide commands you can use in CI (Jenkins) or locally.
  const image = process.env.IMAGE_NAME || 'myapp:latest';
  const registry = process.env.REGISTRY || 'registry.example.com/myteam';
  const fullImage = `${registry}/${image}`;
  const commands = [
    `# Build image locally (CI uses same): docker build -t ${fullImage} .`,
    `# Push to registry: docker push ${fullImage}`,
    `# Run container (example): docker run -d -p 3000:3000 --restart=always ${fullImage}`,
    `# Kubernetes example: kubectl set image deployment/myapp myapp=${fullImage} --record`,
    `# Jenkins: use the provided Jenkinsfile in the repo to run an automated pipeline.`
  ];
  res.json({status:'ok', commands});
});

app.listen(port, ()=>console.log(`Server running on http://localhost:${port}`));

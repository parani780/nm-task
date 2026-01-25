# Automated Deployment Demo (High Traffic)

This repository contains a small demo web page showing a safe preview workflow for automated deployments during high-traffic events. It includes a static frontend, a minimal Node.js server, a Dockerfile, and a sample `Jenkinsfile`.

Quick start (local):

Windows / PowerShell:
```powershell
cd "c:\new project"
npm install
npm start
# open http://localhost:3000 in your browser
```

Build and run with Docker:
```bash
docker build -t myapp:latest .
docker run -p 3000:3000 myapp:latest
```

Sample Jenkins usage:
- Add credentials for your container registry (example id: `registry-creds`).
- Pipeline builds with `docker build`, pushes with `docker push`, and updates your cluster with `kubectl set image` (see `Jenkinsfile`).

Notes:
- The `/deploy` endpoint only returns recommended commands and does not perform real deployments — the included `Jenkinsfile` demonstrates how to run these steps in CI.
- Customize `REGISTRY` and `IMAGE` env vars for your environment.

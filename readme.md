# 🚀 Swiggy DevSecOps - Comprehensive Deployment Pipeline
Welcome to **Swiggy DevSecOps**, a production-grade, end‑to‑end deployment pipeline using **AWS EC2**, **Docker**, **Jenkins CI/CD**, **Security Scanners**, **Monitoring Tools**, and **Kubernetes (KIND)**. This guide helps you set up a fully automated, secure, and observable system for application deployments.

---

## 📚 Table of Contents
- **Phase 1:** Development
- **Phase 2:** Security
- **Phase 3:** CI/CD Automation
- **Phase 4:** Monitoring & Visualization
- **Phase 5:** Kubernetes Deployment
- **Troubleshooting**
- **License**

---

# ✅ Phase 1 : Development

### 1. Launch EC2 (Ubuntu 22.04)
- Launch an EC2 instance with **Ubuntu 22.04**.
- Connect using SSH.

### 2. Clone Code & Update Packages
```bash\sudo apt update -y
```
Clone repository:
```bash
git clone <repo-url>
```

### 3. Install Docker
Make Docker install script executable:
```bash
chmod +x scripts/install_docker.sh
./scripts/install_docker.sh
```
Verify:
```bash
docker --version
```

### 4. Build & Run Application in Docker
```bash
docker build -t swiggy .
docker run -d --name swiggy -p 8081:80 swiggy:latest
```
Delete container:
```bash
docker stop <id> && docker rm <id>
```

---

# 🔐 Phase 2 : Security

### 1. Install SonarQube & Trivy

#### SonarQube
```bash
docker run -d --name sonar -p 9000:9000 sonarqube:lts-community
```
Access UI:
```
http://PUBLIC-IP:9000
```
(Default creds: **admin / admin**)

#### Trivy
```bash
chmod +x scripts/install_trivy.sh
./scripts/install_trivy.sh
trivy --version
```
File system scan:
```bash
trivy fs .
```
Image scan:
```bash
trivy image <image-id>
```

---

# 🤖 Phase 3 : CI/CD (Jenkins)

### 1. Install Jenkins
```bash
chmod +x scripts/install_jenkins.sh
./scripts/install_jenkins.sh
```
Access Jenkins:
```
http://YOUR-IP:8080
```
Retrieve admin password:
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 2. Install Required Plugins
✅ Eclipse Temurin Installer  
✅ SonarQube Scanner  
✅ NodeJs Plugin  
✅ Email Extension Plugin  
✅ OWASP Dependency-Check  
✅ Docker Tools Plugins

### Configure Tools
- Install JDK 17, NodeJS 16
- Configure SonarQube server & Token
- Configure DockerHub credentials

### ✅ Jenkins Pipeline Example
```groovy
pipeline {
    agent any
    tools {
        jdk 'jdk17'
        nodejs 'node16'
    }
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
    }
    stages {
        stage('clean workspace'){ steps { cleanWs() } }

        stage('Checkout from Git') {
            steps {
                git branch: 'main', url: 'https://github.com/interludevinay/Swiggy-DevSecOps.git'
            }
        }

        stage('Debug Env') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh 'echo "SONAR_HOST_URL=$SONAR_HOST_URL"'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh """
                        $SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectKey=Swiggy \
                        -Dsonar.projectName=Swiggy \
                        -Dsonar.sources=src \
                        -Dsonar.host.url=$SONAR_HOST_URL \
                        -Dsonar.login=$SONAR_AUTH_TOKEN
                    """
                }
            }
        }

        stage('Install Dependencies') { steps { sh "npm install" } }

        stage('OWASP FS SCAN') {
            steps {
                dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'DP-Check'
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }

        stage('TRIVY FS SCAN') { steps { sh "trivy fs . > trivyfs.txt" } }

        stage('Docker Build & Push') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'dockerHubCred', toolName: 'docker') {
                        sh "docker build -t swiggy ."
                        sh "docker tag swiggy <docker-hub-user>/swiggy-app:latest"
                        sh "docker push <docker-hub-user>/swiggy-app:latest"
                    }
                }
            }
        }

        stage('TRIVY IMAGE SCAN') {
            steps { sh "trivy image <docker-hub-user>/swiggy-app:latest > trivyimage.txt" }
        }

        stage('Deploy to container') {
            steps { sh 'docker run -d -p 8081:80 <docker-hub-user>/swiggy-app:latest' }
        }
    }
}
```

Fix Docker login issue:
```bash
sudo su
usermod -aG docker jenkins
systemctl restart jenkins
```

---

# 📊 Phase 4 : Monitoring

### 1. Install Prometheus
```bash
chmod +x scripts/install_prometheus.sh
./scripts/install_prometheus.sh
```
Access:
```
http://YOUR-IP:9090
```

### 2. Install Node Exporter
```bash
chmod +x scripts/install_node_exporter.sh
./scripts/install_node_exporter.sh
```

### 3. Configure Prometheus
Add in `prometheus.yml`:
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'jenkins'
    metrics_path: '/prometheus'
    static_configs:
      - targets: ['<jenkins-ip>:<port>']
```
Reload:
```bash
promtool check config /etc/prometheus/prometheus.yml
curl -X POST http://localhost:9090/-/reload
```

### 4. Install Grafana
```bash
chmod +x scripts/install_grafana.sh
./scripts/install_grafana.sh
```
Access:
```
http://YOUR-IP:3000
```
(Default: **admin/admin**)

### Add Prometheus as Data Source
- Configuration → Data Sources → Add Prometheus
- URL: `http://localhost:9090`

---

# ☸️ Phase 5 : Kubernetes (KIND + ArgoCD)

### 1. Create KIND Cluster
Create config file:
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    image: kindest/node:v1.29.0
    extraPortMappings:
      - containerPort: 30007
        hostPort: 30007
      - containerPort: 32054
        hostPort: 32054
  - role: worker
  - role: worker
```

Create cluster:
```bash
kind create cluster --name devops-cluster --config kind-config.yaml
kubectl get nodes
```

### 2. Install ArgoCD
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Expose service:
```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'
```

Get password:
```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```

### 3. Install Helm
```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version
```

### 4. Install Prometheus & Node Exporter via Helm
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl create namespace monitoring
```
Node Exporter:
```bash
helm install node-exporter prometheus-community/prometheus-node-exporter -n monitoring
```
Prometheus:
```bash
helm install prometheus prometheus-community/prometheus -n monitoring
```

### 5. Deploy App With ArgoCD
- Connect GitHub repo
- Create Application in ArgoCD
- Sync & Deploy
- Access app → `NodeIP:30007`

---

# 🛠 Troubleshooting

### Jenkins Docker Issue
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Prometheus Reload
```bash
promtool check config /etc/prometheus/prometheus.yml
curl -X POST http://localhost:9090/-/reload
```

---

# 📄 License
This project is licensed under the **MIT License**.

💬 *For issues or improvements, feel free to contribute or raise an issue!*


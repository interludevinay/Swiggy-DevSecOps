# 🚀 Swiggy DevSecOps - Comprehensive Deployment Pipeline
Welcome to **Swiggy DevSecOps**, a production-grade, end-to-end deployment pipeline using **AWS EC2**, **Docker**, **Jenkins CI/CD**, **Security Scanners**, **Monitoring Tools**, and **Kubernetes (KIND)**. This guide helps you set up a fully automated, secure, and observable system for application deployments.

---

## 📚 Table of Contents
- **Phase 1:** Development
- **Phase 2:** Security
- **Phase 3:** CI/CD Automation
- **Phase 4:** Monitoring & Visualization
- **Phase 5:** Kubernetes Deployment (KIND)
- **Note:** KIND vs EKS for ArgoCD Access
- **Phase 6:** EKS Deployment (Managed Kubernetes)
- **Troubleshooting**
- **License**

---

# ✅ Phase 1 : Development

### 1. Launch EC2 (Ubuntu 22.04)
- Launch an EC2 instance with **Ubuntu 22.04**.
- Connect using SSH.

### 2. Clone Code & Update Packages
```bash
sudo apt update -y
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
docker build \
    --build-arg VITE_SUPABASE_URL=<supabase-URL> \
    --build-arg VITE_SUPABASE_ANON_KEY=<your-anon-key> \
    -t swiggy .
docker run -d --name swiggy -p 8081:80 swiggy:latest

```
Find it on your ```.env``` file
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
            environment {
                VITE_SUPABASE_URL = "https://yourproject.supabase.co"     // Replace with your Supabase URL
                VITE_SUPABASE_ANON_KEY = credentials('supabaseAnonKey')   // Store anon key in Jenkins credentials
            }
            steps {
                script {
                    withDockerRegistry(credentialsId: 'dockerHubCred', toolName: 'docker') {

                        // Build Docker image with Supabase environment variables
                        sh """
                        docker build \
                            --build-arg VITE_SUPABASE_URL=${VITE_SUPABASE_URL} \
                            --build-arg VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY} \
                            -t swiggy .
                        """

                        // Tag and push to Docker Hub
                        sh """
                        docker tag swiggy <docker-hub-username>/swiggy-app:latest
                        docker push <docker-hub-username>/swiggy-app:latest
                        """
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

### ⚠️ Important Note
> **If you’re using local deployment with KIND**, ArgoCD runs as a containerized service inside your local cluster. This means **it may not be able to access your GitHub repository URL** (especially private repos) directly. For production-grade and external access, it’s recommended to use **Amazon EKS (Elastic Kubernetes Service)** — a managed Kubernetes service that integrates seamlessly with GitHub and CI/CD tools.

---

# ☁️ Phase 6 : EKS Deployment (Managed Kubernetes)

### 1. Create EKS Cluster using eksctl
Install `eksctl`:
```bash
curl --location "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```

Create Cluster:
```bash
eksctl create cluster --name swiggy-cluster --region ap-south-1 --nodes 2 --node-type t3.medium
```
Verify:
```bash
aws eks update-kubeconfig --region ap-south-1 --name swiggy-cluster
kubectl get nodes
```

### 2. Install ArgoCD on EKS
Create namespace:
```bash
kubectl create namespace argocd
```
Install ArgoCD:
```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```
Expose ArgoCD:
```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
```
Retrieve LoadBalancer URL:
```bash
kubectl get svc -n argocd argocd-server
```

Get ArgoCD password:
```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d; echo
```

Access UI:
```
http://<LoadBalancer-DNS>:<port>
```

### 3. Connect ArgoCD with GitHub Repository
- Login to ArgoCD UI with **admin** credentials
- Go to **Settings → Repositories → Connect Repo using HTTPS/SSH**
- Add your GitHub repository URL and credentials/token

### 4. Deploy Application via ArgoCD
- Create a new **Application** → Set name, project, and sync policy
- Provide your **GitHub repo URL**, **branch (main)**, and **manifest path**
- Destination: `https://kubernetes.default.svc`, namespace: `default`
- Click **Sync** → ArgoCD will automatically deploy the app on EKS

Access the application using LoadBalancer:
```bash
kubectl get svc -n default
```

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

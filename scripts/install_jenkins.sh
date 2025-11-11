#!/bin/bash

# ============================================================
#  Official Jenkins Installation Script for Ubuntu
#  Installs Java 17 + Jenkins LTS + Enables Service
#  Secure & production-ready setup
# ============================================================

echo "=============================="
echo " Updating system..."
echo "=============================="
sudo apt update -y

echo "=============================="
echo " Installing dependencies..."
echo "=============================="
sudo apt install -y ca-certificates curl gnupg lsb-release

echo "=============================="
echo " Installing Java 17 (required for Jenkins)..."
echo "=============================="
sudo apt install -y openjdk-17-jdk

echo "=============================="
echo " Adding Jenkins GPG key..."
echo "=============================="
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | \
  sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo "=============================="
echo " Adding Jenkins repository..."
echo "=============================="
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

echo "=============================="
echo " Updating package list..."
echo "=============================="
sudo apt update -y

echo "=============================="
echo " Installing Jenkins..."
echo "=============================="
sudo apt install -y jenkins

echo "=============================="
echo " Enabling and starting Jenkins service..."
echo "=============================="
sudo systemctl enable jenkins
sudo systemctl start jenkins

echo "=============================="
echo " ✅ Jenkins installation complete!"
echo " ✅ Jenkins is running on: http://your-server-ip:8080"
echo " ✅ To get the admin password:"
echo "     sudo cat /var/lib/jenkins/secrets/initialAdminPassword"
echo "=============================="
#!/bin/bash

# ================================================
#  Official Trivy Installation Script (Ubuntu)
#  Secure & recommended by Aqua Security
# ================================================

echo "=============================="
echo " Updating system..."
echo "=============================="
sudo apt update -y

echo "=============================="
echo " Installing dependencies..."
echo "=============================="
sudo apt install -y wget apt-transport-https gnupg lsb-release

echo "=============================="
echo " Adding Trivy GPG key..."
echo "=============================="
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -

echo "=============================="
echo " Adding Trivy repository..."
echo "=============================="
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" \
  | sudo tee /etc/apt/sources.list.d/trivy.list

echo "=============================="
echo " Updating package list..."
echo "=============================="
sudo apt update -y

echo "=============================="
echo " Installing Trivy..."
echo "=============================="
sudo apt install -y trivy

echo "=============================="
echo " ✅ Installation complete!"
echo " ✅ Trivy version:"
trivy --version
echo "=============================="

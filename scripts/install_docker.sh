#!/bin/bash

# ===========================================================
#  Official Docker Engine Installation Script (Ubuntu)
#  Installs: Docker CE, CLI, containerd, Buildx, Compose
#  Recommended & Secure Setup
# ===========================================================

echo "=============================="
echo " Removing old Docker versions..."
echo "=============================="
sudo apt remove -y docker docker-engine docker.io containerd runc

echo "=============================="
echo " Updating system..."
echo "=============================="
sudo apt update -y
sudo apt install -y ca-certificates curl gnupg lsb-release

echo "=============================="
echo " Adding Docker GPG key..."
echo "=============================="
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo "=============================="
echo " Adding Docker repository..."
echo "=============================="
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "=============================="
echo " Updating package list..."
echo "=============================="
sudo apt update -y

echo "=============================="
echo " Installing Docker Engine..."
echo "=============================="
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "=============================="
echo " Enabling Docker service..."
echo "=============================="
sudo systemctl enable docker
sudo systemctl start docker

echo "=============================="
echo " Adding current user to docker group..."
echo "=============================="
sudo usermod -aG docker $USER

echo "=============================="
echo " ✅ Docker installation complete!"
echo " ✅ Logout and login again for docker group to take effect."
echo " ✅ Test with: docker run hello-world"
echo "=============================="
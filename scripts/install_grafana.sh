#!/bin/bash

# ============================================================
#  Grafana OSS Installation Script (Ubuntu 20.04 / 22.04)
#  Uses Official Grafana APT Repository
#  Secure & production-ready setup
# ============================================================

echo "=============================="
echo " Updating system..."
echo "=============================="
sudo apt update -y
sudo apt install -y apt-transport-https software-properties-common wget

echo "=============================="
echo " Adding Grafana GPG key..."
echo "=============================="
sudo wget -q -O /usr/share/keyrings/grafana.key https://apt.grafana.com/gpg.key

echo "=============================="
echo " Adding Grafana APT repository..."
echo "=============================="
echo "deb [signed-by=/usr/share/keyrings/grafana.key] https://apt.grafana.com stable main" \
  | sudo tee /etc/apt/sources.list.d/grafana.list

echo "=============================="
echo " Updating package list..."
echo "=============================="
sudo apt update -y

echo "=============================="
echo " Installing Grafana..."
echo "=============================="
sudo apt install -y grafana

echo "=============================="
echo " Enabling & Starting Grafana service..."
echo "=============================="
sudo systemctl enable grafana-server
sudo systemctl start grafana-server

echo "=============================="
echo " ✅ Grafana Installation Complete!"
echo " ✅ Access Grafana at: http://your-server-ip:3000"
echo " ✅ Default login = admin / admin"
echo "=============================="
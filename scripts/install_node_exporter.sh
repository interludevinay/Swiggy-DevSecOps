#!/bin/bash

# ============================================================
#  Node Exporter Installation Script (Ubuntu)
#  Secure setup with systemd service
# ============================================================

NODE_VERSION="1.8.2"

echo "=============================="
echo " Creating node_exporter user..."
echo "=============================="
sudo useradd --no-create-home --shell /usr/sbin/nologin node_exporter

echo "=============================="
echo " Downloading Node Exporter..."
echo "=============================="
cd /tmp
wget https://github.com/prometheus/node_exporter/releases/download/v${NODE_VERSION}/node_exporter-${NODE_VERSION}.linux-amd64.tar.gz
tar -xvf node_exporter-${NODE_VERSION}.linux-amd64.tar.gz

echo "=============================="
echo " Installing Node Exporter..."
echo "=============================="
sudo mv node_exporter-${NODE_VERSION}.linux-amd64/node_exporter /usr/local/bin/
sudo chown node_exporter:node_exporter /usr/local/bin/node_exporter

echo "=============================="
echo " Creating systemd service..."
echo "=============================="
sudo bash -c "cat > /etc/systemd/system/node_exporter.service" <<EOF
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter
Restart=always

[Install]
WantedBy=multi-user.target
EOF

echo "=============================="
echo " Starting Node Exporter..."
echo "=============================="
sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter

echo "=============================="
echo " ✅ Node Exporter Installed Successfully!"
echo " ✅ Metrics URL: http://your-server-ip:9100/metrics"
echo "=============================="

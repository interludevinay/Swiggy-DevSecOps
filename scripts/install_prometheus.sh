#!/bin/bash

# ============================================================
#  Prometheus Installation Script (Ubuntu 20.04 / 22.04)
#  Official & Secure Setup with systemd service
# ============================================================

PROM_VERSION="2.53.0"

echo "=============================="
echo " Creating Prometheus user..."
echo "=============================="
sudo useradd --no-create-home --shell /usr/sbin/nologin prometheus

echo "=============================="
echo " Creating directories..."
echo "=============================="
sudo mkdir -p /etc/prometheus
sudo mkdir -p /var/lib/prometheus
sudo chown prometheus:prometheus /etc/prometheus /var/lib/prometheus

echo "=============================="
echo " Downloading Prometheus..."
echo "=============================="
cd /tmp
wget https://github.com/prometheus/prometheus/releases/download/v${PROM_VERSION}/prometheus-${PROM_VERSION}.linux-amd64.tar.gz
tar -xvf prometheus-${PROM_VERSION}.linux-amd64.tar.gz

echo "=============================="
echo " Installing Prometheus binaries..."
echo "=============================="
sudo mv prometheus-${PROM_VERSION}.linux-amd64/prometheus /usr/local/bin/
sudo mv prometheus-${PROM_VERSION}.linux-amd64/promtool /usr/local/bin/
sudo chown prometheus:prometheus /usr/local/bin/prometheus /usr/local/bin/promtool

echo "=============================="
echo " Copying config files..."
echo "=============================="
sudo mv prometheus-${PROM_VERSION}.linux-amd64/consoles /etc/prometheus
sudo mv prometheus-${PROM_VERSION}.linux-amd64/console_libraries /etc/prometheus
sudo mv prometheus-${PROM_VERSION}.linux-amd64/prometheus.yml /etc/prometheus
sudo chown -R prometheus:prometheus /etc/prometheus

echo "=============================="
echo " Creating systemd service..."
echo "=============================="
sudo bash -c "cat > /etc/systemd/system/prometheus.service" <<EOF
[Unit]
Description=Prometheus Monitoring
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \\
  --config.file /etc/prometheus/prometheus.yml \\
  --storage.tsdb.path /var/lib/prometheus \\
  --web.console.templates=/etc/prometheus/consoles \\
  --web.console.libraries=/etc/prometheus/console_libraries
Restart=always

[Install]
WantedBy=multi-user.target
EOF

echo "=============================="
echo " Starting Prometheus..."
echo "=============================="
sudo systemctl daemon-reload
sudo systemctl enable prometheus
sudo systemctl start prometheus

echo "=============================="
echo " ✅ Prometheus Installed Successfully!"
echo " ✅ URL: http://your-server-ip:9090"
echo "=============================="

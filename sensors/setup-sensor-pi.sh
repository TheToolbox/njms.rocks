#!/bin/sh

# meant to be run on raspbian stretch

# setup pi
#sudo apt-get update && sudo apt-get dist-upgrade

# install gitlab-runner and docker
#curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
#sudo apt-get install gitlab-runner

#curl -fsSL https://get.docker.com -o get-docker.sh
#sudo sh get-docker.sh


# set MAC
# ensure code runs for the first time

sudo touch /etc/systemd/system/sensor-daemon.service
sudo chmod 664 /etc/systemd/system/sensor-daemon.service
echo "
[Unit]
Description=Sensor Daemon that sends data to NJMS.rocks
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/njms.rocks/sensors/index.js
WorkingDirectory=/opt/njms.rocks/sensors/
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
" | sudo tee /etc/systemd/system/sensor-daemon.service
sudo systemctl daemon-reload
sudo systemctl start sensor-daemon
sudo systemctl enable sensor-daemon



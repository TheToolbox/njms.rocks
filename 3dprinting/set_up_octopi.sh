#!/bin/sh
set +x

# set up 'service' on the pi, so that it automatically starts and restarts if it crashes
echo "[Unit]
Description=ssh connection to njmsrocks to expose octopi webserver
After=multi-user.target
 
[Service]
Type=simple
ExecStart=/usr/bin/sh /opt/ssh-reverse-proxy.sh
Restart=on-abort
 
[Install]
WantedBy=multi-user.target" > /lib/systemd/system/ssh-reverse-proxy.service
sudo chmod 644 /lib/systemd/system/ssh-reverse-proxy.service

# set up the command that the service calls, opening a Remote ssh proxy
# NOTE: 
echo "#!/bin/sh 
ssh -v -i id_rsa ssh-user@njms.rocks -p 2222 -N -R 80:localhost:8080
" > /opt/ssh-reverse-proxy.sh
chmod +x /opt/ssh-reverse-proxy.sh

# tell the system to reload services and start our new one
sudo systemctl daemon-reload
sudo systemctl enable ssh-reverse-proxy.service
sudo systemctl start ssh-reverse-proxy.service
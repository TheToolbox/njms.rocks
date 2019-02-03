#!/bin/sh
set -eux

# install docker
echo "Installing docker"
sudo apt-get remove docker docker-engine docker.io || echo "docker wasn't previously installed"
sudo apt-get update
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo apt-get update
sudo apt-get install -y docker-ce 

# install docker-compose
echo "Installing docker-compose"
sudo curl -L "https://github.com/docker/compose/releases/download/1.23.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version

# install Gitlab-Runner
echo "Installing Gitlab Runner"
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt-get install -y gitlab-runner
echo "------------------------"
echo "About to register the Gitlab Runner"
echo "This software allows Gitlab to directly push code changes and do build/test/deploy on the server, controlled by .gitlab-ci.yml."
echo "The registration information will ask for a 'registration token', found here, under 'runners':"
echo "https://gitlab.com/njms-tech-in-med/njms-rocks/settings/ci_cd"
echo "------------------------"
read -p "token: " GITLAB_RUNNER_TOKEN
sudo gitlab-runner register \
  --non-interactive \
  --url "https://gitlab.com/" \
  --registration-token $GITLAB_RUNNER_TOKEN \
  --executor "shell" \
  --description "njms.rocks server" \
  --tag-list "server" \
  --run-untagged \
  --locked="false" 

# open ports
echo "Opening ports"
sudo apt-get install -y ufw
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 2222
yes | sudo ufw enable

mkdir -p /db
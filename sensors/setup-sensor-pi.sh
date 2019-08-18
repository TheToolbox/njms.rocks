#!/bin/sh

# meant to be run on raspbian stretch

# setup pi
sudo apt-get update && sudo apt-get dist-upgrade

# install gitlab-runner and docker
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt-get install gitlab-runner

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh


# set MAC
# ensure code runs for the first time
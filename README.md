# NJMS.rocks

This repo contains all of the code that powers NJMS.rocks, a site dedicated to simplifying and improving student life at NJMS.

# Architecture
A major goal of the project is to be sustainable over the long term and to require little maintainance. 

The system is supposed to be able to stand itself up by running ./install.sh on a new server. It will install docker, docker-compose, and gitlab-runner. Gitlab-runner will be responsible for acquiring secrets from Gitlab, and running build/test/deploy. Each directory should represent a single Docker container, which will be run on deployment. Docker-compose will be responsible for deploying the containers and exposing their resources to each other, as well as bringing up Apache/PostGres/Certbot to forward requests on to the appropriate containers (ex: /api/... requests forwarded to api).


Currently, we've only got the calendar-generation code running (and barely at that!), but soon a full web frontend should appear, and its code will be here as well.


## TODO
 - Make calendar interpretation more resiliant
 - Better generalize iCal.ts to allow for more features/robustness
 - Deal more intelligently with DST (use geographic info to reduce assumptions?)
 - Add front-end, set up calendar for clubs, set up anonymous survey platform, set up blog/newsletter
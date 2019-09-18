# NJMS.rocks

This repo contains all of the code that powers NJMS.rocks, a site dedicated to simplifying and improving student life at NJMS. Click 'edit' to edit this page!

# Architecture
A major goal of the project is to be sustainable over the long term and to require little maintainance. 

The system is supposed to be able to stand itself up by running ./install.sh on a new server. It will install docker, docker-compose, and gitlab-runner. Gitlab-runner will be responsible for acquiring secrets from Gitlab, and running build/test/deploy. Each directory should represent a single Docker container, which will be run on deployment. Docker-compose will be responsible for deploying the containers and exposing their resources to each other, as well as bringing up Apache/PostGres/Certbot to forward requests on to the appropriate containers (ex: /api/... requests forwarded to api).

Currently, we've just got the calendar-generation and temperature monitoring running (and barely at that!), but soon a full web frontend should appear, and its code will be here as well.

## TODO
 - Automate deployment via GitLab (done!)
 - Investigate 3d printer integration (Octoprint?) (done-ish?)

### API
 - Store temperatures, allow paginated pulling of sensor data
 - Investigate value of using websockets to push sensor data as it comes in
 - Expose OpenAPI/Swagger API document
 - Expose OpenAPI/Swagger API UI

### Calendars
 - Make calendar interpretation more resiliant
 - Better generalize iCal.ts to allow for more features/robustness
 - Deal more intelligently with DST (use geographic info to reduce assumptions?)
 - Add front-end, set up calendar for clubs, set up anonymous survey platform, set up blog/newsletter
 - Add tests to validate things

### Sensors
 - Automate firmware deployment (now raspis, so more software than firmware)
    - set up to deploy automatically from gitlab

### Webserver
 - Allow browsing of historical sensor data, graphing, etc.
 - TLS via LetsEncrypt (done! I think.)

## Cool Ideas

Place any cool new project ideas here!
 - NJMS game servers
 - NJMS wiki or knowledge base so M1's can get up to speed more easily
 - GroupMe replacement

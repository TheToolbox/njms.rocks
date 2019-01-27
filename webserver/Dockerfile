#build calendars
FROM node:10-alpine as calendar-build
COPY ./calendars /calendars
WORKDIR /calendars
RUN npm install && npm run-script build

FROM httpd
RUN apt-get update \
    && apt-get install -y openssl cron \
    && rm -rf /var/lib/apt/lists/* \
    && openssl req -x509 -new -newkey rsa:4096 -nodes -keyout conf/server.key -out conf/server.crt \
        -days 365 -subj '/CN=localhost' \
    && cp conf/server.crt conf/server-ca.crt
# add crontab to get certificates
COPY --from=calendar-build /calendars/calendars/ ./htdocs/calendars
COPY lecture-hall-temperature.html ./htdocs
COPY httpd.conf ./conf/

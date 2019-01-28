#build calendars
FROM node:10-alpine as calendar-build
COPY ./calendars /calendars
WORKDIR /calendars
RUN npm install && npm run-script build

FROM httpd
RUN apt-get update \
    && apt-get install -y openssl cron \
    && rm -rf /var/lib/apt/lists/*
RUN mkdir -p conf/certs/ \
    && openssl req -x509 -new -newkey rsa:4096 -nodes -keyout conf/certs/server.key -out conf/certs/server.crt \
        -days 365 -subj '/CN=njms.rocks' \
    && cp conf/certs/server.crt conf/certs/server-ca.crt
# add crontab to get certificates
COPY --from=calendar-build /calendars/calendars/ ./htdocs/calendars
COPY lecture-hall-temperature.html ./htdocs
COPY httpd.conf ./conf/

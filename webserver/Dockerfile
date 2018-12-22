#build calendars
FROM node:10-alpine as calendar-build
COPY ./calendars /calendars
WORKDIR /calendars
RUN npm install && npm run-script build

FROM httpd
RUN echo "deb http://ftp.debian.org/debian stretch-backports main" >> /etc/apt/sources.list.d/backports.list \
    && apt-get update \
    && apt-get install -y python-certbot-apache openssl cron \
    && rm -rf /var/lib/apt/lists/* \
    && openssl req -x509 -new -newkey rsa:4096 -nodes -keyout conf/server.key -out conf/server.crt \
        -days 365 -subj '/CN=localhost' \
    && cp conf/server.crt conf/server-ca.crt
# add crontab to get certificates
RUN echo "08 2 * * * " | crontab - 
COPY --from=calendar-build /calendars/calendars/ ./htdocs/calendars
COPY lecture-hall-temperature.html ./htdocs
COPY httpd.conf ./conf/
#acme.sh –install-cert -d <domain> \
#–ert-file /usr/local/apache2/conf/server.crt    \
#–key-file  /usr/local/apache2/conf/server.key    \
#–fullchain-file /usr/local/apache2/server-ca.crt \
#–reloadcmd “service apache2 force-reload”
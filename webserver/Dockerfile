#build calendars
FROM node:10-alpine as calendar-build
COPY ./calendars /calendars
WORKDIR /calendars
RUN npm install && npm run-script build

FROM httpd
RUN echo "deb http://ftp.debian.org/debian stretch-backports main" | tee /etc/apt/sources.list.d/backports.list \
    && apt-get update \
    && apt-get install -y openssl cron \
    && apt-get install -y certbot python-certbot-apache -t stretch-backports \
    && rm -rf /var/lib/apt/lists/*
RUN mkdir -p conf/certs/ \
    && openssl req -x509 -new -newkey rsa:4096 -nodes -keyout conf/certs/privkey.pem -out conf/certs/fullchain.pem \
        -days 365 -subj '/CN=njms.rocks' \
    && echo "08 2 * * * certbot renew" | crontab - 
COPY --from=calendar-build /calendars/calendars/ ./htdocs/calendars
COPY lecture-hall-temperature.html ./htdocs
COPY httpd.conf ./conf/

CMD certbot certonly --apache \
        --non-interactive \
        --domain $DOMAIN \
        --email $EMAIL \
        --agree-tos \
        --cert-name server; \
    cp -f /etc/letsencrypt/live/server/* /usr/local/apache2/conf/certs/; \
    cron \
    && httpd-foreground
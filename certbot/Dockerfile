FROM ubuntu:18.04
# install certbot, cron
RUN apt-get update && \
    apt-get install -y software-properties-common && \
    add-apt-repository universe && add-apt-repository ppa:certbot/certbot && \
    apt-get update && \
    apt-get install -y certbot cron \
    && rm -rf /var/lib/apt/lists/*
RUN echo "08 2 * * * certbot renew" | crontab - \
    && mkdir -p /webroot/.well-known/acme-challenge

#start cron, get certificate if we don't have one, and start the server
CMD if [ ! -f "/certificates/server.key" ]; then \
        openssl req -x509 -new -newkey rsa:4096 -nodes -keyout /certificates/server.key -out certificates/server.crt \
            -days 365 -subj '/CN=njms.rocks'; \
        cp /certificates/server.crt /certificates/server-ca.crt; \
    fi \
    && certbot certonly --webroot \
        --non-interactive \
        -w /webroot \
        -d $DOMAIN \
        --email $EMAIL \
        --agree-tos \
        --cert-path /certificates \
        --cert-name server \
    && crond -f
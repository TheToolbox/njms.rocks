FROM alpine:3.9

RUN apk add --no-cache vlc \
    && adduser -D stream-user

USER stream-user

CMD while :; \
    do \
        vlc -v --intf dummy $STREAM_SOURCE_URL --sout http/mpjpeg://:8080; \
        echo "Connection Failed. Trying again..."; \
        sleep 3; \
    done
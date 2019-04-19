FROM alpine:3.9

RUN apk add --no-cache vlc \
    && adduser -D stream-user

USER stream-user
EXPOSE 8080

CMD while :; \
    do \
        vlc $STREAM_SOURCE_URL --sout '#standard{access=http,mux=ogg,dst=localhost:8080}'; \
        echo "Connection Failed. Trying again..."; \
        sleep 3; \
    done
FROM alpine:3.9

RUN apk add --no-cache vlc \
    && adduser -D stream-user

USER stream-user
EXPOSE 8080

CMD vlc $STREAM_SOURCE_URL \
        --sout '#standard{access=http,mux=ogg,dst=localhost:8080}'
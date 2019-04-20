FROM alpine:3.9

RUN apk add --no-cache vlc \
    && adduser -D stream-user

USER stream-user
EXPOSE 8080

CMD while :; \
    do \
        vlc -v --intf dummy $STREAM_SOURCE_URL --sout '#transcode{vcodec=mp4v,vb=750}:standard{access=http{mime=video/mp4},mux=ps,dst=:8080}'; \
        echo "Connection Failed. Trying again..."; \
        sleep 3; \
    done
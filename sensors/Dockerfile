FROM ubuntu:18.04
RUN apt-get update && apt-get install -y bash sudo python curl dfu-util openssl gnupg build-essential && \
    rm -rf /var/lib/apt/lists/*
# build firmware
RUN curl -sL https://particle.io/install-cli > ./install && \
    chmod +x ./install && \
    ./install
# push it to devices
RUN apt-get remove -y python curl && \
    apt-get clean -y && \
    apt-get autoremove -y
ADD temperature-probes/* .
CMD particle login && \
    particle compile photon --target=0.8.0-rc.11 temperature-probe && \
    particle flash all-stuff with-the-result

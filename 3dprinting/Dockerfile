FROM alpine:3.8

RUN apk add --no-cache openssh \
    && adduser -h /home/ssh-user -s /sbin/nologin -D ssh-user \
    && < /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c6 | passwd ssh-user -u \
    && echo -e "Port 22\nPasswordAuthentication no\n"               >> /etc/ssh/sshd_config \
    && echo -e "HostKey /etc/ssh/host_keys/ssh_host_rsa_key \n"     >> /etc/ssh/sshd_config \
    && echo -e "HostKey /etc/ssh/host_keys/ssh_host_dsa_key \n"     >> /etc/ssh/sshd_config \
    && echo -e "HostKey /etc/ssh/host_keys/ssh_host_ecdsa_key \n"   >> /etc/ssh/sshd_config \
    && echo -e "HostKey /etc/ssh/host_keys/ssh_host_ed25519_key \n" >> /etc/ssh/sshd_config \
    && echo -e "AllowUsers ssh-user \n"                             >> /etc/ssh/sshd_config \ 
    && echo -e "AllowTCPForwarding yes \n"                          >> /etc/ssh/sshd_config

EXPOSE 22

COPY authorized_keys /home/ssh-user/.ssh/
RUN chown -R ssh-user:ssh-user /home/ssh-user/.ssh/ \
    && chmod 700 /home/ssh-user/.ssh \
    && chmod 600 /home/ssh-user/.ssh/authorized_keys
#/.ssh/authorized_keys

VOLUME /etc/ssh/host_keys

CMD if [ ! -f "/etc/ssh/host_keys/ssh_host_rsa_key" ]; then \
        echo "building host keys..."; \
        ssh-keygen -f /etc/ssh/host_keys/ssh_host_rsa_key -N '' -t rsa; \
        ssh-keygen -f /etc/ssh/host_keys/ssh_host_dsa_key -N '' -t dsa; \
        ssh-keygen -f /etc/ssh/host_keys/ssh_host_ecdsa_key -N '' -t ecdsa; \
        ssh-keygen -f /etc/ssh/host_keys/ssh_host_ed25519_key -N '' -t ed25519; \
    fi \
    && /usr/sbin/sshd -D -f /etc/ssh/sshd_config

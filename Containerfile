FROM registry.access.redhat.com/ubi8/nginx-120

# Install & update packages
# IMPORTANT: need to exclude filesystem due to https://bugzilla.redhat.com/show_bug.cgi?id=1708249#c31
USER root
RUN dnf update -y --allowerasing --nobest --exclude=filesystem && \
    dnf clean all && \
    rm -rf /var/cache /var/log/dnf* /var/log/yum.*

# switch back to user used by registry.access.redhat.com/ubi8/nginx-120
USER 1001

RUN rm -rf /opt/app-root/src/*
COPY dist .

VOLUME /opt/nginx-config

# Run script uses standard ways to run the application
CMD nginx -g "daemon off;" -c /opt/nginx-config/nginx.conf

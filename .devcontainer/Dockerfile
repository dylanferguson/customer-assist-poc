FROM node:22-bullseye

# Install basic development tools
RUN apt update && apt install -y less git procps curl

# Ensure default `node` user has access to `npm global`
RUN mkdir -p /home/node/.npm-global
RUN chown -R node:node /home/node/.npm-global

# Set up non-root user
USER node

# Set npm global prefix to user home directory
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

# Set working directory
WORKDIR /workspace

# The ENTRYPOINT allows our container to start with the appropriate environment
ENTRYPOINT [ "/bin/bash", "-c" ] 
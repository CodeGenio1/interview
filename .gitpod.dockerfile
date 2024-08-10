FROM gitpod/workspace-mongodb

RUN bash -c 'VERSION="20.11.1" \
    && source $HOME/.nvm/nvm.sh && nvm install $VERSION \
    && nvm use $VERSION && nvm alias default $VERSION' \
    && npm i -g ts-node
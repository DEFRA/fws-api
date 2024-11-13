FROM postgres:17.0-alpine
ARG FWS_DB_BRANCH=master
RUN wget https://raw.githubusercontent.com/DEFRA/fws-db/refs/heads/${FWS_DB_BRANCH}/fws-setup.sql -O /tmp/fws-setup.sql && \
    mkdir /fws_tables && mkdir /fws_indexes && chown postgres:postgres /fws_tables && chown postgres:postgres /fws_indexes

FROM postgres:17.0-alpine
ARG FWS_DB_BRANCH=master
ADD --chown=root:postgres --chmod=444 https://raw.githubusercontent.com/DEFRA/fws-db/refs/heads/${FWS_DB_BRANCH}/fws-setup.sql /tmp/fws-setup.sql
RUN mkdir /fws_tables && \
    mkdir /fws_indexes && \
    chown postgres:postgres /fws_tables && \
    chown postgres:postgres /fws_indexes
USER postgres

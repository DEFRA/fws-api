FROM postgres:16.5-alpine
ARG FWS_DB_BRANCH=master
ADD --chown=root:postgres --chmod=444 https://raw.githubusercontent.com/DEFRA/fws-db/refs/heads/${FWS_DB_BRANCH}/fws-setup.sql /tmp/fws-setup.sql
ADD --chown=root:postgres --chmod=444 https://raw.githubusercontent.com/DEFRA/fws-db/refs/heads/${FWS_DB_BRANCH}/target_area/target_area_load.sql /tmp/target_area_load.sql
ADD --chown=root:postgres --chmod=444 https://raw.githubusercontent.com/DEFRA/fws-db/refs/heads/${FWS_DB_BRANCH}/target_area/target_areas.csv /tmp/target_areas.csv
COPY --chown=root:postgres --chmod=444 ./populate-api-keys.sql /tmp/populate-api-keys.sql
RUN mkdir /fws_tables && \
    mkdir /fws_indexes && \
    chown postgres:postgres /fws_tables && \
    chown postgres:postgres /fws_indexes
USER postgres

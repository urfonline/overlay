FROM nodecg/nodecg

COPY --chown=nodecg:nodecg vendor dashboard extension graphics package.json /opt/nodecg/bundles/urf/
WORKDIR /opt/nodecg/bundles/urf

RUN npm install --production

VOLUME /opt/nodecg/db /opt/nodecg/log /opt/nodecg/cfg

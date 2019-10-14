FROM nodecg/nodecg

COPY . /usr/src/app/bundles/urf/

RUN cd bundles/urf && npm install --production
RUN cd bundles/urf && bower install --allow-root

VOLUME /usr/src/app/db /usr/src/app/log /usr/src/app/cfg

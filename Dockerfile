FROM nodecg/nodecg:v1.6.1

COPY . /usr/src/app/bundles/urf/

RUN cd bundles/urf && npm install --production

VOLUME /usr/src/app/db /usr/src/app/log /usr/src/app/cfg

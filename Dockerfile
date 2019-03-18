FROM nodecg/nodecg

COPY . /usr/src/app/bundles/urf/

VOLUME /usr/src/app/db /usr/src/app/log /usr/src/app/cfg

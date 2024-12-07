
FROM alpine:3.20 AS build

RUN apk add --update --no-cache --no-progress make g++ gcc linux-headers

RUN apk add --update --no-cache --no-progress python3 py3-pip py3-wheel \
   python3-dev

RUN mkdir /root/wheels

RUN pip wheel -w /root/wheels --no-deps jsonnet

COPY config-ui /root/config-ui/

RUN (cd /root/config-ui && pip wheel -w /root/wheels --no-deps .)

FROM alpine:3.20

ENV PIP_BREAK_SYSTEM_PACKAGES=1

COPY --from=build /root/wheels /root/wheels

RUN apk add --update --no-cache --no-progress python3 py3-pip \
      py3-aiohttp

RUN pip install /root/wheels/* && \
    pip cache purge && \
    rm -rf /root/wheels

CMD service
EXPOSE 8080


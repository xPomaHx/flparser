FROM python:3.7-alpine

RUN apk add -U --no-cache gcc  python3-dev libffi-dev build-base && \
  pip install proxybroker 

CMD proxybroker find  --types  SOCKS5 --lvl High  --strict -l 10

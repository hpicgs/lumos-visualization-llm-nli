FROM node:22.9.0-alpine

RUN apk add --no-cache curl-dev libzip-dev autoconf build-base gmp-dev coreutils python3

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm i

EXPOSE 3000

ENV DB_HOST mongodb://database/valas

CMD ["npm", "start"]
FROM node:latest

WORKDIR /usr/src/app

RUN yarn install

EXPOSE 8080

CMD [ "yarn", "start" ]

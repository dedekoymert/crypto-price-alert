FROM node:latest

WORKDIR /app

COPY notification-api/. ./notification-api
COPY shared ./shared

WORKDIR /app/shared
RUN npm install

WORKDIR /app/notification-api
RUN npm install

RUN npm run build
CMD ["node", "dist/notification-api/app.js"]
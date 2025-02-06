FROM node:latest

WORKDIR /app

COPY alert-api/. ./alert-api
COPY shared ./shared

WORKDIR /app/shared
RUN npm install

WORKDIR /app/alert-api
RUN npm install

RUN npm run build
CMD ["node", "dist/alert-api/app.js"]
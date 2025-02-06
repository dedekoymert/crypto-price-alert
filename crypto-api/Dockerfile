FROM node:latest

WORKDIR /app

COPY crypto-api/. ./crypto-api
COPY shared ./shared

WORKDIR /app/shared
RUN npm install

WORKDIR /app/crypto-api
RUN npm install


RUN npm run build
CMD ["node", "dist/crypto-api/app.js"]
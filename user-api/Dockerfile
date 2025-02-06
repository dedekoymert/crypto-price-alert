FROM node:latest

WORKDIR /app

COPY user-api/. ./user-api
COPY shared ./shared

WORKDIR /app/shared
RUN npm install

WORKDIR /app/user-api
RUN npm install

RUN npm run build
CMD ["node", "dist/user-api/app.js"]
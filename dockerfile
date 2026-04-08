FROM node:22-alpine

COPY ./server .

RUN npm install

CMD ["node", "index.js"]    
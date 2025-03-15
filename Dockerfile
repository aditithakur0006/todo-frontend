FROM node:12-alpine

COPY package.json package.json

RUN npm install

ENV NODE_ENV=production

COPY index.js index.js

CMD ["npm", "start"]

EXPOSE 3001
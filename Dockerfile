FROM node:12-alpine AS builder

WORKDIR /app


COPY package.json package.json

RUN npm install

COPY . .
RUN mkdir -p /var/log/frontend-logs/ && chmod -R 777 /var/log/frontend-logs/

RUN npm run build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder /app/build .


CMD ["bash", "-c", "nginx -g 'daemon off;' > /var/log/frontend-logs/access.log"]

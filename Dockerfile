# BUILDANDO A MINHA APLICACAO
FROM node:22-alpine AS builder
WORKDIR /app
COPY . /app/
RUN npm install
RUN npm run build

# CONFIGURACAO NGINX
FROM nginx:alpine
COPY --from=builder /app/dist/front-meu-barzinho/browser usr/share/nginx/html/
COPY /nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


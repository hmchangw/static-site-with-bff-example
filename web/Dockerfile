# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
# Inline the BFF URL into the static bundle at build time.
ARG NEXT_PUBLIC_BFF_URL=http://localhost:4000
ENV NEXT_PUBLIC_BFF_URL=$NEXT_PUBLIC_BFF_URL
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80

FROM node:22

WORKDIR /build
COPY frontend .
RUN npm install

EXPOSE 3000
ENTRYPOINT ["npm", "run", "dev"]

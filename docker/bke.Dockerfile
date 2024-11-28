FROM node:22

WORKDIR /build
COPY backend .
RUN npm -f install

EXPOSE 5001
ENTRYPOINT ["npm", "run", "dev"]

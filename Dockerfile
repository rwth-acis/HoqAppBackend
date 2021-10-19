FROM node:latest
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
ENTRYPOINT ["npm", "start"]
EXPOSE 3000
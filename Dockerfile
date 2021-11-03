FROM node:16.0.0
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
ENTRYPOINT ["npm", "start"]
EXPOSE 3000
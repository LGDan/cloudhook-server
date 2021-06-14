FROM node:16

# Create app directory
WORKDIR /opt/cloudhook

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install
#RUN npl ci --only=production

COPY . .

EXPOSE 3000
CMD [ "node", "app.js" ]
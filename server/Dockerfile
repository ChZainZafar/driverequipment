FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm install -g puppeteer && puppeteer browsers install chrome
EXPOSE 8080
ENV PORT=8080
CMD ["npm", "start"]
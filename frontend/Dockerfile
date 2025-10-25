FROM node:18-alpine

# Verify Node.js version meets requirements (14+)
RUN node --version && npm --version

WORKDIR /usr/src/app

# Install dependencies
COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
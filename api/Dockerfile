FROM node:10-alpine as builder
WORKDIR /home/
COPY src src
COPY test test
COPY package.json package-lock.json tsconfig.json ./
RUN ls .
RUN npm install
RUN npm run-script build

FROM node:10-alpine
WORKDIR /home/
COPY --from=builder /home/package.json /home/package-lock.json /home/compiled/src ./
RUN npm install --prod
CMD ["node", "index.js"]
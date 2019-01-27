FROM node:10-alpine as builder
WORKDIR /home/
COPY package.json package-lock.json tsconfig.json ./
RUN npm install
COPY src src
COPY test test
RUN ls .
RUN npm run-script build

FROM node:10-alpine
WORKDIR /home/
COPY --from=builder /home/package.json /home/package-lock.json ./
RUN npm install --prod
COPY --from=builder /home/compiled/src ./
CMD ["node", "index.js"]
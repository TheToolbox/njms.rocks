#build calendars
FROM node:10-alpine as calendar-build
COPY ./calendars /calendars
WORKDIR /calendars
RUN npm install && npm run-script build

FROM httpd:alpine
RUN apk add --no-cache apache2-proxy
COPY --from=calendar-build /calendars/calendars/ ./htdocs/calendars
COPY lecture-hall-temperature.html ./htdocs
COPY httpd.conf ./conf/

#build calendars
FROM node:10 as calendar-build
COPY ./calendars /calendars
WORKDIR /calendars
RUN npm install && npm run-script build

FROM php:7-apache
COPY --from=calendar-build /calendars/calendars/ ./calendars
COPY config.apache /etc/apache/config
# or whatever, forward /api/ to api container

#set up certbot?
#that's not going to be fun
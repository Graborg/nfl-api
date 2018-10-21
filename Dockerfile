FROM node:9

WORKDIR /app
COPY /lib /app/lib
COPY config.* /app/
COPY /database.json /app/database.json
COPY /index.js /app/index.js
COPY /migrations /app/migrations
COPY /routes.js /app/routes.js
COPY /validateTokenMiddleware.js /app/validateTokenMiddleware.js

COPY package.json /app/package.json
RUN npm install --quiet
CMD npm run migrate && npm run start-prod

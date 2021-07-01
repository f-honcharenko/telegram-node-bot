FROM node:11
COPY index.js .
CMD npm i; node index.js

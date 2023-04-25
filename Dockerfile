FROM node:18-alpine
ARG USERNAME=user
ENV APP_ROOT /home/${USERNAME}/src
RUN apk add shadow
RUN useradd -ms /bin/sh $USERNAME
USER $USERNAME
RUN mkdir -p $APP_ROOT
WORKDIR $APP_ROOT
COPY package.json ./
RUN npm ci
COPY . .
RUN npm run prestart
CMD ["npm", "run", "start"]

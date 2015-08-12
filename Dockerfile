FROM node:latest
ADD . /root/knab
WORKDIR /root/knab
EXPOSE 5000
CMD make boot
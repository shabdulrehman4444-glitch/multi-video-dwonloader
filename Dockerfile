# Node.js ka official version use kar rahe hain
FROM node:20

# System me Python aur wget install karna (yt-dlp ke liye zaroori hai)
RUN apt-get update && apt-get install -y python3 wget curl && rm -rf /var/lib/apt/lists/*

# Latest yt-dlp download aur install karna Linux server ke liye
RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Project folder setup
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD [ "node", "server.js" ]
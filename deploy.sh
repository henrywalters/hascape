#!/bin/bash

docker system prune -y

cd /root/hgts
git pull

cd /root/hascape
git pull
docker-compose build --no-cache

cd /root/hagameonline
git pull
docker-compose build --no-cache

cd /root/hascape
git pull
docker-compose down --remove-orphans
docker-compose up -d

cd /root/hagameonline
docker-compose down --remove-orphans
docker-compose up -d

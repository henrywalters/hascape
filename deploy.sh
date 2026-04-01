#!/bin/bash

cd /root/hgts
git pull

cd /root/hascape
git pull
docker-compose build

cd /root/hagameonline
git pull
docker-compose build

cd /root/hascape
git pull
docker-compose down --remove-orphans
docker-compose up -d

cd /root/hagameonline
docker-compose down --remove-orphans
docker-compose up -d

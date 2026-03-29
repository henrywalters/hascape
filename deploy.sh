#!/bin/bash

cd /root/hascape
docker-compose build

cd /root/hagameonline
docker-compose build

cd /root/hascape
docker-compose down --remove-orphans
docker-compose up -d

cd /root/hagameonline
docker-compose down --remove-orphans
docker-compose up -d

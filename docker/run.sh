#!/bin/bash

docker rm -f ielts-fre ielts-bke ielts-bke_pro

git pull
docker build -f docker/fre.Dockerfile -t fre .
docker build -f docker/bke.Dockerfile -t bke .
docker build -f docker/bke_pro.Dockerfile -t bke_pro .

docker run -d -p3000:3000 --name=ielts-fre fre
docker run -d -p5001:5001 --name=ielts-bke bke
docker run -d -p5002:5002 --name=ielts-bke_pro bke_pro

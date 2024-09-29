#!/bin/bash

docker rm -f ielts-fre ielts-bke

docker build -f docker/fre.Dockerfile -t fre .
docker build -f docker/bke.Dockerfile -t bke .

docker run -d -p3000:3000 --name=ielts-fre fre
docker run -d -p5001:5001 --name=ielts-bke bke
docker build --pull --rm -f 'Dockerfile' -t 'dwedwed23/winnersapp:latest' '.'
docker push dwedwed23/winnersapp:latest
ssh root@77.105.161.65 "cd /root/apps/WinnersApp && docker-compose pull && docker-compose up -d"
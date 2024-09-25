FROM python:3.10

WORKDIR /build
COPY backend_pronounce .
RUN python3.10 -m pip install --no-cache-dir -r requirements.txt 

EXPOSE 5002
ENTRYPOINT ["python3.10", "server.py"]

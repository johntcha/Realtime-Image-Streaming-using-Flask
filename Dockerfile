FROM python:3.9-slim-buster

WORKDIR ./

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y
COPY . .
COPY env.example .env

EXPOSE 5000

CMD [ "flask", "run" ]
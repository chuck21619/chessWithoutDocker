FROM golang:1.19
#FROM debian:stable-slim

RUN apt update
RUN apt upgrade -y

RUN apt-get install -y python3
RUN apt-get install -y python3-numpy
RUN apt-get install -y pip
RUN pip install tensorflow --break-system-packages
RUN pip install chess --break-system-packages
    
COPY . .

COPY chessAIfullstack /bin/chessAIfullstack


CMD ["/bin/chessAIfullstack"]
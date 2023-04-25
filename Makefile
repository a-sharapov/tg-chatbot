.DEFAULT_GOAL:=build
PROJECT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
CONTAINER_DIR:=/home/user/src
IMAGE_NAME:=telegram_bot

PHOHY: build run-dev exec stop

build:
		docker build -t $(IMAGE_NAME):latest ./
rebuild:
		docker build -t $(IMAGE_NAME):latest ./ --no-cache
run-dev:
		docker run --rm \
		--name $(IMAGE_NAME) \
		-it \
		-v "$(PROJECT_DIR)/src:$(CONTAINER_DIR)/src" \
		-v "$(PROJECT_DIR)/public:$(CONTAINER_DIR)/public" \
		-e CHOKIDAR_USEPOLLING=true $(IMAGE_NAME)
exec:
		docker exec -it $(IMAGE_NAME) sh
stop:
		docker stop $(IMAGE_NAME)

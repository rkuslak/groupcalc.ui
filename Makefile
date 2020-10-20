PODNAME ?= website
CONTAINER_NAME ?= groupcalc
PUBLIC_URL ?= http://ronkuslak.com/groupcalc/
INSTALL_DIR ?= $(realpath ../../)/public_html/groupcalc/
PWD ?= $(shell pwd)
DOCKER ?= podman

build: .
	${DOCKER} run --rm \
		-v ${PWD}:/workspace:Z \
		-e "PUBLIC_URL=${PUBLIC_URL}" \
		-t node:14 \
		sh -c "cd workspace && yarn install && yarn build"

install: build
	mkdir ${INSTALL_DIR}
	cp -rv build/* ${INSTALL_DIR}

clean:
	rm -rf build

start:
	podman pod exists ${PODNAME}
	podman container exists ${CONTAINER_NAME} || \
		podman run --rm --pod ${PODNAME} --name ${CONTAINER_NAME} \
			-v ./:/workspace:Z \
			-t nodebuilder \
			sh -c "cd workspace && yarn start"

stop:
	podman container exists ${CONTAINER_NAME} && \
		podman container rm -f ${CONTAINER_NAME} || \
		true

shell:
	podman exec -it ${CONTAINER_NAME} bash

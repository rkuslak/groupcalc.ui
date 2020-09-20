PODNAME ?= test_site
CONTAINER_NAME ?= index
PUBLIC_URL ?= http://ronkuslak.com/groupcalc/
INSTALL_DIR ?= $(realpath ../../)/public_html/groupcalc/

build: .
	podman run --rm \
		-v ./:/workspace:Z \
		-e "PUBLIC_URL=${PUBLIC_URL}" \
		-t node:14 \
		sh -c "cd workspace && yarn install && yarn build"

install: build
	mkdir ${INSTALL_DIR}
	cp -rv build/* ${INSTALL_DIR}

clean:
	rm -rf build

start:
	podman pod exists ${PODNAME} || \
		podman pod create -p 3001:3000 --name ${PODNAME}
	podman container exists index || \
		podman run --rm --pod ${PODNAME} --name ${CONTAINER_NAME} \
			-v ./:/workspace:Z \
			-t node:14 \
			sh -c "cd workspace &&yarn start"

stop:
	podman pod exists ${PODNAME} && podman pod rm -f ${PODNAME} || true

shell:
	podman exec -it ${CONTAINER_NAME} bash

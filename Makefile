
PACKAGE_VERSION=0.0.0
VERSION=0.0.0

all: service-package container

ui:
	npm run build
	rm -rf config-ui/config_ui/ui/
	cp -r dist/ config-ui/config_ui/ui/
	cp public/*.png config-ui/config_ui/ui/
	cp public/*.svg config-ui/config_ui/ui/

template-data:
	rm -rf config-ui/config_ui/templates
	mkdir -p config-ui/config_ui/templates
	find templates -name '*.jsonnet' | cpio -pdm config-ui/config_ui/

resources-data:
	rm -rf config-ui/config_ui/resources
	mkdir -p config-ui/config_ui/resources
	cp -r grafana config-ui/config_ui/resources/
	cp -r prometheus config-ui/config_ui/resources/

service-package: ui template-data resources-data update-package-versions
	cd config-ui && python3 setup.py sdist --dist-dir ../pkgs/

update-package-versions:
	echo __version__ = \"${PACKAGE_VERSION}\" > config-ui/config_ui/version.py

CONTAINER=localhost/config-ui
DOCKER=podman

container:
	${DOCKER} build -f Containerfile -t ${CONTAINER}:${VERSION} \
	    --format docker


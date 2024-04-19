.PHONY: build run

TAG="estrannaise"
BASE_CMD=@docker run --rm -it -v ${PWD}:/usr/src/app -p5757:5757 ${TAG}

build:
	@docker build . -t ${TAG}

shell:
	 ${BASE_CMD} /bin/sh

lint:
	 ${BASE_CMD} npx eslint src/*.js

serve:
	 ${BASE_CMD} npx http-server -p 5757 -o /usr/src/app
	
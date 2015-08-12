APPNAME ?= knab
RUNPORT ?= 5000
RUNMODE ?= local
DKRUSER ?= knab
MNTDIR  ?= /root/$(APPNAME)
APPDIR = $(shell pwd)
DKRIMAGE = $(DKRUSER)/$(APPNAME)
DKRBUILD = docker build -t
DKRVARS = APPNAME RUNMODE RUNPORT
DKRUNOPTS = --name=$(APPNAME) -p $(RUNPORT):$(RUNPORT) -v $(APPDIR):$(MNTDIR)
DKRUNARGS = $(DKIMAGE)
DKRUNENVS = $(foreach key,$(DKRVARS),-e $(key)=$($(key)))
DKRUNCMD  = docker run -d
DKRUNFULL  = $(DKRUNCMD) $(DKRUNOPTS) $(DKRUNENVS) $(DKRUNARGS) $(DKRIMAGE)
DKRLOGS = docker logs -f $(APPNAME)
help:
	@echo "install - Install the code and dependencies"
	@echo "local - Build image for local runtime"
	@echo "deploy - Build image for deploy mode"
	@echo "docker - Run container in (local|test|prod) RUNMODE=$(RUNMODE)"
	@echo "config - Confgure the application"
	@echo "boot - Run application in RUNMODE=$(RUNMODE) mode"

install:
	@npm install

clean-install:
	-@rm -rf $(APPDIR)/node_modules
boot: install clean-boot
	@npm start
clean-boot:
	-@rm -rf $(APPDIR)/npm-debug.log
	-@rm -rf $(APPDIR)/db.sqlite
clean-docker:
	-@docker ps | grep $(APPNAME) | awk '{ print $$1 }' | xargs docker kill > /dev/null
	-@docker ps -a | grep $(APPNAME) | awk '{ print $$1 }' | xargs docker rm > /dev/null

clean-docker-image:
	-@docker images | grep $(DKRIMAGE) | awk '{ print $$3 }' | xargs docker rmi

clean: clean-install clean-boot clean-docker clean-docker-image

local:
	@echo "Running in $(RUNMODE)"
	@$(DKRBUILD) $(DKRIMAGE) $(APPDIR)

docker: clean-docker $(RUNMODE)
	$(DKRUNFULL)
	@$(DKRLOGS)

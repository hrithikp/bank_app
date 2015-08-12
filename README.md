#Knab - Sample Banking Application

A sample banking application

##Technologies
* Angular and Bootsrap - Fully responsive
* Node.js and Express - Asynchornous application server
* Any SQL(default: SQLite) based database using Sequelize ORM

##Installation

###You have `make` and `docker` installed
This is the prefered method of installation, since docker provides a standard runtime accross any platform.

To build the and run the docker image:

```
$ make docker
```

For additional help:
```
$ make
```

###You have `node` and `npm` installed
```
$ npm install
$ npm start
```

##Usage
* Start the app either via make or npm
* Open browser and goto: http://localhost:5000
*  Note: Use Docker VM IP when on Mac or Windows
* Click on Register and sign up for the app
* Note: Accounts can go into negative.
* All data is stored inside of db.sqlite file

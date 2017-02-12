# Data hub investment prototype

A prototype to show users ideas and propopsals for the future of datahub

This prototype is a simple Node/Express based application that allows the user to search for a company 
and edit data related to a companies, their relationships and ongoing projects to encourage investment
 into the UK.

The application archictecture is simple, tha application applies the GDS Elements design principles to 
deliver an express application that fetches data from a back end JSON based api and renders it to the screen. 
This front end layer is primarily turning requests from the browser into back end API calls and then 
rendering them using Nunjucks template language.

The client layer applies the ideals of progressive enhancement so that a wide range of devices can 
access it, no matter what their limitation.

In order to use the application the front end layer must be ran, with a small number of settings, 
and be provided with a back end server to provide the API, data storage and search engine capabilities.

The back end for this project can be found at 
[https://github.com/uktrade/data-hub-zorg](https://github.com/uktrade/data-hub-zorg)

If you wish to see this project in action, a version of hosted on Heroku 
[here](https://data-hub-invest-fe.herokuapp.com/). Just search for Marriot Hotels.

## Getting started

### Docker
The project comes with docker compose files, this means if you have docker you can start 
the app with a single command.

There are 2 docker files

#### docker-compose.yml
This will run the front end server locally, but will point to a remote backend. This file expects 
2 environment variables:

| Name | Description |
|:-----|:------------|
| API_ROOT | The url for a back end server instance for the service, e.g. https://data-hub-zorg.herokuapp.com |
| POSTCODE_KEY | Part of the frontend looks up addresses for postcodes using [getaddress.io](https://getaddress.io/). Obtain a key for the service and set it here |

Either set these variables manually or why not look at [autoenv](https://github.com/kennethreitz/autoenv). 
To start the server just:

    docker-compose up

The server starts in developer mode, which means that when you make local changes it will auto-compile 
sass or javavscript, and will restart nodejs when server side changes are made.

You can access the server on port 3000, [http://localhost:3000](http://localhost:3000). You can also run 
a remote debug session over port 5858 if using webstorm or Visual Studio Code

### docker-compose-full-yml  
The "full" variation of the docker compose file runs both the frontend and backend locally, especially 
usefull if you want to make changes to the data scheme or api.

In order for the full version to run and build you must also checkout 
[https://github.com/uktrade/data-hub-zorg](https://github.com/uktrade/data-hub-zorg) 
so that it shares the same parent folder as the front end:

/stuff/
  /data-hub-invest/fe
  /data-hub-zorg

Just like the basic docker compose file you must provide the POSTCODE_KEY, but you do not need to 
provide an API_ROOT, as the API root is known. If you want to read more about the components of 
Zorg, go [look at the repo](https://github.com/uktrade/data-hub-zorg).

### Native install

#### Dependencies

* [Node.js](https://nodejs.org/en/) (>= 6.9.1)

### Installation

1. Clone repository:

  ```
  git clone https://github.com/UKTradeInvestment/data-hub-invest-fe
  ```

2. Install node dependencies:

  ```
  npm install
  ```

Run the server in either production mode or develop mode

  
#### Production
Builds static assets and runs a server using node

```
npm run build
npm start
```


#### Development
Server watches for changes and rebuilds sass or compiles js using webpack as needed. Changes to server side
code will result in the server autorestarting. The server will run with the node debug flag so you can
 debug with Webstorm or Visual Studio Code
```
npm run develop
```

### Other Scripts
The package.json file includes a number of useful scripts for other tasks such as

- test: Run BDD tests using Mocha
- lint: Lint both SASS and JS to make sure it conforms to rules

## Making changes
When working on a new feature the convention is to follow 
[Github Flow](https://guides.github.com/introduction/flow/).
Branch from master and work on changes in your branch. Once you are happy the feature is ready then make 
sure you have linted the code and ran the tests. Make sure your commits don't 
contain extranous entries (such as wip) using rebase interactive and create a pull request. The 
pull request title should briefly say what the change is, and the description describe how you did the change 
and why you chose to do it the way you did.

Once a pull request is made it will be tested using [CircleCI](https://circleci.com/) and, if successful, 
deployed to a heroku instance. Links to the Circle build and deployed address will be 
shown in the github pull request.

When a pull request is approved it can be merged to master.

## Deployment
All changes merged to master are auto deployed to Heroku and almost instantly available to the user.

# APROPLAN API

## Introduction

You can communicate with APROPLAN by using REST functions provided by the API at the https://api.aproplan.com/rest url.
This nodejs module will show us some sample to interact with our API to create, modify or delete data into the platform in a programmatic way.

## Testing

Instead of to make your development with our API directly on the production, you can test first your development by using the following API address: https://api-tst.aproplan.com/ url. When you have validated your developent, you can redirect to the production url.

## Quick start

1. To use APROPLAN, you need to have a requester to identify your application. Please contact the support if you don't have a requester id yet.
1. Clone the repository

### Nodejs

* Go to nodejs folder
* Fill parameters with your requester id, the API url and credentials to use in the config.js file
* Run `npm install` to install packages (you need to have nodejs installed)
* Run `node index.js` to run the program to show some sample

There are samples

* To make a login into APROPLAN and renew the token (Services/authService.js)
* To get entities with filters (index.js)
* To retrieve the list of projects and then, to select one to work on it (Services/projectService.js)
* Update a point by changing its status (Services/pointService.js)

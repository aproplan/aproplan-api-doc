# APROPLAN API

## Introduction

You can communicate with APROPLAN by using REST functions provided by the API at the <https://api.aproplan.com/rest> url.
This nodejs module will show us some sample to interact with our API to create, modify or delete data into the platform in a programmatic way.

## Testing

Instead of to make your development with our API directly on the production, you can test first your development by using the following API address: https://api-tst.aproplan.com/ url. When you have validated your development, you can redirect to the production url.

## Documentation

We do not have yet an online documentation but we have an OpenApi document that you can open in the online swagger editor.
Upload the `swagger.yaml` file in <https://editor.swagger.io/>

## Quick start

1. To use APROPLAN, you need to have a requester to identify your application. Please contact the support if you don't have a requester id yet.
1. Clone the repository

The application shows you how to use the api with several samples:

* Login (Services/authService.js)
  * To make a login into APROPLAN
  * To renew the token
* To get entities with filters (index.js)
* Projects (Services/projectService.js)
  * To retrieve the list of projects and then, to select one to work on it
  * To retrieve the folder structure of the selected project
* Points (Services/pointService.js)
  * Retrieve the list of points (max 15) of the selected project
  * Update a point by changing its status6
  * Create a new point by selecting list, due date, subject and the first comment

To work on objects related to a projects (lists, points, forms...), you need first to select a project with the related sample. Then, you need to run the sample "Select a working project by its id".

### Nodejs

* Go to nodejs folder
* Fill parameters with your requester id, the API url and credentials to use in the config.js file
* Run `npm install` to install packages (you need to have nodejs installed)
* Run `node index.js` to run the program to show some sample

## API Using

When you use APROPLAN API it is better to make first your test on the following url "https://api-tst.aproplan.com/rest" (application url: https://app-tst.aproplan.com).
Before to use the API, you need to have a **requesterid** supplied by us. To get one requester, please contact the support. When you have it, you can start to call the APROPLAN API.
For each call of the API, you need to have 3 mandatory parameters:

* **v** specifying the version of the API to use. Actual version = 13 (v=13)
* **requesterid** to specify your requester id
* **t** to specify the token your receive while you call the **loginsecure** method to identify the user making the call. This parameter is not always mandatory, some calls doet not require to be authentified.
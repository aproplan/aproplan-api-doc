# API Documentation (OpenAPI)

## Introduction

The definition of our API is defined with OpenAPI in a swagger file. Swagger files are splitted by section of the API definition and each module of the application.
The output is swagger.yaml that you can open in the swagger editor to see the API definitions in a HTML View

## Installation

To generate the swagger file it is necessary to install multi-swagger file <https://github.com/mohsen1/multi-file-swagger-example>
`npm install -g multi-file-swagger`

and then, you can run the following command to generate the final swagger file:
`multi-file-swagger -o yaml index.yaml > ./../swagger.yaml`

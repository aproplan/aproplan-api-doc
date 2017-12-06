"use strict"

const Promise = require("bluebird");
const request = require("request-promise");
//const colors = require("colors");
const config = require("../config");


/**
 * This class is to make request on APROPLAN API to get/update/create/delete entities
 * It will be used to build the good url and to call the api with good parameter
 */
class ApiAproplan {    

    /**
     * If a user is connected, this is the token to use while an api call to identify it
     */
    get userToken(){
        return this._token;
    }

    set userToken(token){
        this._token = token;
    }

    /**
     * 
     * @param {String} url The relative url to make the API call. Eg: /rest/countries
     * @param {String} method The method to use for the API call. GET, POST, PUT, DELETE
     * @param {Object} data If data must be sent, it is the object to send
     * @param {String} options Options, parameters to send to the API call
     */
    makeRequest(url, method, data, options){
        if(!options){
            options = {
                
            }
        }

        const requestMetadata = {
            method: method,
            url: url,
            data: data,
            options: options
        };

        let requestParam = buildRequest(requestMetadata, this._token);

        console.log(("Request " + requestParam.method + " - url: " + requestParam.url).debug);
        return request(requestParam).then(function(response, err) {
            let data = JSON.parse(response);
            return data;
        }).catch(function(err){
            console.log("An error occured in the request: " + url);
            console.log(err.response.body);
            return Promise.reject(
                {
                    statusCode: err,
                    responseError: err.response.body
                });
        });
    }

    /**
     * This method will count the number of an type of entity visible to the user
     * Ex for Country: http://api.aproplan.com/rest/countrycount
     * @param {String} entityName This is the entity name for which a count is requested
     * @param {String} filter The filter to apply before to make the count
     * @param {String} options Options, parameters to send to the API call
     */
    getEntityCount(entityName, filter, options){
        let url = "rest/" + getRestEntityUrl(entityName, "count");
        if (filter) {
            url += "?filter=" + encodeURIComponent(filter);
        }
        return this.makeRequest(url, "GET", null, options);
    }

    /**
     * This method returns the list of entities visible to the user
     * Ex for Country: http://api.aproplan.com/rest/countries
     * @param {String} entityName This is the entity name for which a count is requested
     * @param {String} filter The filter to apply before to make the count
     * @param {String} pathtoload The pathtoload value to specify which related entity of the root one must be loaded
     * @param {String} options Options, parameters to send to the API call
     */
    getEntityList(entityName, filter, pathtoload, options) {
        let url = "rest/" + getRestEntityUrl(entityName, "entities");
        if (filter)
        url += "?filter=" + encodeURIComponent(filter);
        if (pathtoload) {
            url += filter ? "&" : "?";
            url += "pathtoload=" + pathtoload;
        }

        return this.makeRequest(url, "GET", null, options);
    }

    /**
     * This method returns the entity corresponding to specified Id
     * @param {String} entityName This is the entity name for which a count is requested 
     * @param {String} id This is the id of the entity to retrieve
     * @param {String} pathToLoad The pathtoload value to specify which related entity of the root one must be loaded
     * @param {object} options Options, parameters to send to the API call
     */
    getEntityById(entityName, id, pathToLoad, options) {
        let filter = "Filter.Eq(Id," + id + ")";
        return this.getEntityList(entityName, filter, pathToLoad, null, options).then(function(data){
            return data[0];
        });
    }

    constructor(){
        this._token = null;
    }
}

/**
 * This method transforms the name of the entity in the correct url depending of the get. For example to work on Project entity it will return for:
 * - entities: projects
 * - ids: projectids
 * - count: projectcount
 * @param {String} entityName This is the name of entity on which a API method will be applied
 * @param {String} getType To know which kind of request is done on the specific entity: ids, entities, count
 */
function getRestEntityUrl(entityName, getType){
    let lowerEntity = entityName.toLowerCase();
    let len = lowerEntity.length;

    switch (getType) {
        case "entities":
            if (lowerEntity[len - 1] === "y")
                lowerEntity = lowerEntity.substring(0, len - 1) + "ie";
            else if (lowerEntity[len - 1] === "s")
                lowerEntity = lowerEntity.substring(0, len - 1);
            return lowerEntity + "s";
        case "ids":
            if (lowerEntity[len - 1] === "y")
                lowerEntity = lowerEntity.substring(0, len - 1) + "ie";
            else if (lowerEntity[len - 1] === "s")
                lowerEntity = lowerEntity.substring(0, len - 1);
            return lowerEntity + "sids";
        case "count":
            return entityName.toLowerCase() + "count";
        case "idscustom":
            return lowerEntity;
    }
}

/**
 * This method builds the parameter to send to the request regarding options of the call.
 * @param {Object} requestMetadata 
 * @param {String} token This is the token to identify the user who makes the api request 
 */
function buildRequest(requestMetadata, token) {
    let defaultContentType = undefined;

    let serializedData = undefined;
    if(requestMetadata.data){
        serializedData = JSON.stringify(requestMetadata.data);
    }

    if(requestMetadata.method !== "GET")
        defaultContentType = "application/json";
    let requestParam = {
        method: requestMetadata.method,
        url: buildFinalUrl(requestMetadata.url, token),
        body: serializedData,
        responseType: requestMetadata.options.responseType,
        headers: requestMetadata.options.contentType ? { "Content-Type": requestMetadata.options.contentType }: {"Content-Type": defaultContentType },
        responseType: requestMetadata.options.responseType
    }
    return requestParam;
}



/**
 * This method is to build the url usabled by APROPLAN API. Ex: https://api.aproplan.com/rest/countries?requesterid={requesterid}&v={apiVersion}
 * It will use the config file in the root to get values.
 * @param {String} url This is the relative url /rest/... to complete
 * @param {String} token This is the token to identify the user received just after the login
 */
function buildFinalUrl(url, token){
    let apiUrl = config.apiUrl;
    
    // If for the API call, the user needs to be authenticated, it sets the token receives from the login method
    if(!!token){
        let apiLogin = "t=" + encodeURIComponent(token);
        let idx = url.indexOf("?");
        if (idx < 0)
            url += "?" + apiLogin;
        else
            url = url.slice(0, idx + 1) + apiLogin + "&" + url.slice(idx + 1);
    }
    if (apiUrl[apiUrl.length - 1] === "/") {
        apiUrl = apiUrl.substr(0, apiUrl.length - 1);
    }
    if (url[0] === "/")
        url = url.substr(1);
    let finalUrl = apiUrl + "/" + url;

    // Set the requesterid to identify the application using the API
    if (!!config.requesterId  && finalUrl.indexOf(config.requesterId) < 0) {
        let requesteridParam = "requesterid=" + encodeURIComponent(config.requesterId);
        let idx = finalUrl.indexOf("?");
        if (finalUrl.indexOf("?") < 0) {
            // this case is for the login
            // there is no t=xxx append to the url and we don't want the url to be ?&
            finalUrl += "?" + requesteridParam;
        } else {
            finalUrl += "&" + requesteridParam;
        }
    }
    // Set the version of the API to use
    let apiVersion = "v=" + encodeURIComponent(config.apiVersion);
    if (finalUrl.indexOf(apiVersion) < 0){
        let idx = finalUrl.indexOf("?");
        if (idx < 0)
            finalUrl += "?" + apiVersion;
        else
            finalUrl += "&" + apiVersion;
    }
    finalUrl += "&dateformat=iso"
    return finalUrl;
}

let instance = new ApiAproplan();
module.exports = instance;
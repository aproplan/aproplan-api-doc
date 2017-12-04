"use strict"

let config = require("../config.js");
let api = require("../Api/aproplanApi");
let Promise = require("bluebird");


let userInfo = undefined;
let validityEndDate = new Date();

class authService {
    /**
     * Property that specify if the user has a login valid. Login done with a token still valid
     */
    get isConnected(){
        return !!userInfo && new Date(userInfo.ValidityLimit) < new Date();
    }

    /**
     * This method is to check if the user is already connected and if the token is already valid. 
     * If user is not yet connected, a login is done.
     * If the token will becomes invalid in the next 3 minutes, a renew of the token is requested.
     */
    checkLogin(){
        let promise = undefined;
        let self = this;
        return new Promise(function(resolve, reject) {
            if(!!!userInfo){ // no login has been done yet
                console.log("Make login".info);
                promise = self.login();
            }
            else{
                let endToken = new Date(userInfo.ValidityLimit);
                let now = new Date();
                // Token will become invalid
                if(endToken <= now.setMinutes(now.getMinutes() - 3)) {
                    console.log("Renew token".info);
                    promise = self.renewToken();
                }
                else
                    resolve();
            }

            if(!!promise){                
                promise.then(function(){
                    resolve();
                })
                .catch(function(err){
                    reject(err);
                });
            }
        });
    }

    /**
     * This method is to make a login in the APROPLAN API and to retrieve information about the user + the token to use for authentified api calls.
     * POST on: https://api.aproplan.com/rest/loginsecure with json containing 2 properties
     * - Alias: the email to use to log in to APROPLAN
     * - Pass: the password to log in to APROPLAN
     */
    login() {
        let loginData = {
            Alias: config.login,
            Pass: config.password
        }
        return api.makeRequest("/rest/loginsecure", "POST", loginData).then(function(result){
            console.log(("Token: " + result.Token + " alias: " + result.UserInfo.Alias).result);
            userInfo = result;
            api.userToken = userInfo.Token;
        });
    }

    /**
     * The token received while the login has a validity date. This method is necessary to retrieve a new token before the end of the validity of the current one.
     */
    renewToken(){        
        return api.makeRequest("/rest/renewtoken", "GET").then(function(tokenInfo){
            console.log(("Token: " + tokenInfo.Token).result);
            api.userToken = tokenInfo.Token;
        });
    }

}


let authServiceInstance = new authService();

module.exports = authServiceInstance;
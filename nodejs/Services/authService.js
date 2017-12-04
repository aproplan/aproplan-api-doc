"use strict"

let config = require("../config.js");
let api = require("../Api/aproplanApi");

class authService {
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
        api.makeRequest("/rest/loginsecure", "POST", loginData).then(function(userInfo){
            console.log("Token: " + userInfo.Token + " alias: " + userInfo.UserInfo.Alias);
            api.userToken = userInfo.Token;
        });
    }

    /**
     * The token received while the login has a validity date. This method is necessary to retrieve a new token before the end of the validity of the current one.
     */
    renewToken(){        
        api.makeRequest("/rest/renewtoken", "GET").then(function(tokenInfo){
            console.log("Token: " + tokenInfo.Token);
            api.userToken = tokenInfo.Token;
        });
    }
}
let authServiceInstance = new authService();

module.exports = authServiceInstance;

function test() {
    authServiceInstance.login();
}

test();
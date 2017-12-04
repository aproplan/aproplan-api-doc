"use strict"

let authService = require("../Services/authService");
let api = require("../Api/aproplanApi");
let prompt = require("prompt");
let Promise = require("bluebird");

class projectService {
    
    getProjects(code){
        return authService.checkLogin().then(function(){
            
            let filter = "Filter.IsTrue(IsActive)";
            if(code){
                filter = "Filter.And(Filter.Eq(Code," + code + ")," + filter + ")";
            }
            return api.getEntityList("Project", filter)
                .then(function(result){
                    return result;
                });
        });        
    }

    test(){
        let schema = {
            description: "Please put the code of a project to get a specific project and leave empty to get all active projects",
            name: "codeProject",
            required: false
        };
        let self = this;
        return new Promise(function(resolve, reject){
            prompt.get(schema, function(err, result){
                if(err) {
                    reject(err);
                    return;
                }

                self.getProjects(result.codeProject)
                    .then(function(data){
                        console.log(("\r\nProjects retrieved: " + data.length).info);
                        
                        for(let i = 0; i < data.length; i++){
                            console.log((data[i].Id + " " + data[i].Name + " /" + data[i].Code).result);
                        }
                        resolve(data);
                    })
                    .catch(function(err){
                        console.log(err);
                        reject(err);
                    });
            });
        });
        
        

    }
}

let projectServiceInstance = new projectService();

module.exports = projectServiceInstance;
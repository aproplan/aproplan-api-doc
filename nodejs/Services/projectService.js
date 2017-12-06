"use strict"

let authService = require("./authService");
let api = require("../Api/aproplanApi");
let prompt = require("prompt");
let Promise = require("bluebird");
let appUtility = require("../appUtility");

class projectService {
    get project(){
        return project;
    }


    /**
     * This method is to retrieve a list of active projects -- all projects or projects corresponding to a code
     * @param {String} code The code of projects to retrieve
     */
    getProjects(code){
        //Check first if the user is authentified
        return authService.checkLogin().then(function(){
            // Make the filter
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

    /**
     * This method will retrieve on project with its Id and to select it then, some tests on objects related to a project can be done
     * @param {*String} id The id of the project to select.
     */
    selectProjectById(id){
        let schema = {
            description: "Specify the project id on which you want to work",
            name: "selectProject",
            required: true
        };
        let self = this;
        return new Promise(function(resolve, reject){
            prompt.get(schema, function(err, result){
                if(err) {
                    reject(err);
                    return;
                }

                authService.checkLogin().then(function(){
                    let filter = "Filter.And(Filter.Eq(Id," + result.selectProject + "),Filter.IsTrue(IsActive))";
                    api.getEntityList("Project", filter).then(function(data){
                        if(data.length > 0) {
                            project = data[0];
                            console.log(("\r\nProject selected").info);
                            console.log((project.Id + " " + project.Name + " /" + project.Code).result);
                        }
                        else {
                            console.log(("\r\nNo project found").warn);
                        }
                        
                        resolve(data.length > 0 ? data[0]: null);
                    }).catch(function(err){
                        console.log(err);
                        reject(err);
                    });;
                });
            });
        });
    }

    /**
     * To load the enabled statuses of defined for a specific project
     * @param {*String} projectId the id of the project for which statuses are requested
     */
    getProjectStatus(projectId){
        let filter = "Filter.And(Filter.Eq(Project.Id,{{projectId}}),Filter.IsFalse(IsDisabled))";
        filter = filter.replace("{{projectId}}", projectId);
        return api.getEntityList("NoteProjectStatus", filter);
    }

    getProjectsTest(){
        
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

    getSampleChoices(){
        return [
            { choice: "Find a project or display the list of projects", fnPromise: this.getProjectsTest, caller: this },
            { choice: "Select a working project by its id", fnPromise: this.selectProjectById, caller: this },
        ];
    }    
}

let project = undefined;
let projectServiceInstance = new projectService();

module.exports = projectServiceInstance;
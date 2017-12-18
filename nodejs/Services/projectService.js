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
     * To retrieve the list of folders
     * @param {*String[]} parentFolderId The array id of the parent folder to retrieve. If the value is null, it means root folder only - undefined means all folder structure
     */
    getCustomFolders(parentFolderId){
        
        let parentFilter = null;
        let filter = "Filter.And(Filter.Eq(Project.Id," + project.Id + "),Filter.Eq(FolderType,\"Custom\"))";
        if(parentFolderId == null) // To retrieve root folder only
            parentFilter = "Filter.IsNull(ParentFolderId)";
        else if(parentFolderId != undefined) {// To retrieve children of a specific folder            
            parentFilter = "Filter.In(ParentFolderId,"+ parentFolderId.join(",") +")";
        }
        
        if(parentFilter)
             filter = "Filter.And(Filter.Eq(Project.Id," + project.Id + "),Filter.Eq(FolderType,\"Custom\"),"+ parentFilter +")";
        

        return authService.checkLogin().then(function(){
            return api.getEntityList("Folders", filter).then(function(result){
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
     * To retrieve a part of the folder structure of the selected project. 
     */
    getFolderStructure(){
        let self = this;
        return new Promise(function(resolve, reject){
            if(!self.project) { // if no project selected - request a to select a project first
                console.log("Please select first a project before to work on it".warn);
                resolve();
            }
            else {
                let folders = [];
                // This method is to retrieve all folders of a specific level. Used for recursive call. 
                // Max level is to avoid to retrieve all levels for sample if too big
                function getFolders(parentFolders, level, maxLevel){
                    let parentFoldersId = null;
                    if(parentFolders)
                    {
                        parentFoldersId = [];
                        for(let iParent = 0; iParent < parentFolders.length; iParent++){
                            parentFoldersId.push(parentFolders[iParent].Id);
                        }
                    }

                    // Get folder linked to a list of parent (one level)
                    return self.getCustomFolders(parentFoldersId).then(function(results) {
                        let childrenFolders = {};
                        let newParents = [];
                        for(let i = 0; (i < results.length && i < 10); i++){ // We don't take more than 10 items for our example
                            if(results[i].ParentFolderId){
                                let parent = childrenFolders[results[i].ParentFolderId];
                                if(!parent){
                                    parent = [];         
                                    childrenFolders[results[i].ParentFolderId] = parent;
                                }
                                parent.push(results[i]);
                            }
                            newParents.push(results[i]);
                        }
                        
                        // Keep the value to return
                        if(level == 0){
                            folders = folders.concat(newParents);
                        }
                            
                        // Set the children collection to each parent having children folders.
                        if(parentFolders){
                            for(let j = 0; j < parentFolders.length; j++){
                                parentFolders[j].Children = childrenFolders[parentFolders[j].Id];
                            }
                        }

                        // Do not get more level than expected.
                        if(newParents.length > 0 && level < maxLevel)
                            return getFolders(newParents, level + 1, maxLevel); // Recursive calls
                    });
                }

                // Get folder structure from level 0 to max 3 levels
                getFolders(null, 0, 3).then(function(){
                    console.log(("Folder structure of the project " + project.Name + ":").info);
                    for(let i = 0; i < folders.length; i++){
                        let folder = folders[i];
                        self.writeFolder(folder);
                        
                    }
                    resolve(folders);
                });
                
            }
        });        
    }

    /**
     * To write a folder in the console (name + id) and all chidren folders.
     * @param {*Folder} folder This is the folder to write
     * @param {number} level Specify the level of the folder in the structure. To display correct indentation
     */
    writeFolder(folder, level) {
        if(!level) level = 0;
        let prefix = "";
        for(let i = 0; i < level; i++)
            prefix += "   ";
        console.log((prefix + folder.Name + " - " + folder.Id).result);
        if(folder.Children){
            for(let i = 0; i < folder.Children.length; i++){
                this.writeFolder(folder.Children[i], ++level);
            }            
        }
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
            { choice: "List folders of selected project", fnPromise: this.getFolderStructure, caller: this },
        ];
    }    
}

let project = undefined;
let projectServiceInstance = new projectService();

module.exports = projectServiceInstance;
"use strict"

let authService = require("./authService");
let api = require("../Api/aproplanApi");
let projectService = require("./projectService");
let prompt = require("prompt");
let Promise = require("bluebird");
let appUtility = require("../appUtility");
let pad = require("pad");

class documentService {

    /**
     * To retrieve the list of documents of the selected projects
     */
    getDocumentsOfSelectedProject(){
        let self = this;
        return new Promise(function(resolve, reject){
            if(!projectService.project){ // if no project selected - request a to select a project first
                console.log("Please select first a project before to work on it".warn);
                resolve();
            }
            else{
                authService.checkLogin().then(function(){                    
                    let filter = "Filter.Eq(Folder.Project.Id," + projectService.project.Id + ")"; // build the filter on the selected project
                    let pathToLoad = "Folder,UploadedBy";
                    api.getEntityList("Documents", filter, pathToLoad).then(function(data){                        
                        console.log(("Documents retrieved: "+ data.length).info);
                        for(let i = 0; (i < data.length && i < 15); i++){
                            let document = data[i];
                            // Display information about documents retrieved
                            self.writeDocument(document);
                        }
                        resolve(data);
                    });
                })
            }
        });
    }

    writeDocument(document){
        if(document){
            console.log((pad(30, document.Name.substring(0, 30)) + " uploaded by: " + pad(document.UploadedBy.Alias.substring(0,35), 35)+ " - folder: " 
            + pad(document.Folder.Name.substring(0, 15), 15) + " (" + document.Folder.Id + ") - versions: " +  pad(document.VersionCount, 3) 
            + " path: " + pad(document.FolderPath, 50) + " id: " + document.Id).result);
        }
    }

    getSampleChoices(){
        return [
            { choice: "List first 15 documents of the selected project", fnPromise: this.getDocumentsOfSelectedProject, caller: this },            
        ];
    }

}


let instance = new documentService();
module.exports = instance;
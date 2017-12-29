

let projectService = require("../Services/projectService");
let prompt = require("prompt");
let appUtility = require("../appUtility");

class projectUseCases
{
    /**
     * This method will list the list of projects of the user or the one corresponding to the code of user selection
     */
    listProjects(){
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

                projectService.getProjects(result.codeProject)
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

    projectSelection(){
        let self = this;
        return new Promise((resolve, reject) => {
            let schema = {
                description: "Find the project to select - please enter a criteria to search a project or keep empty to list all active projects",
                name: "projectCriteria",
                required: false
            };
            prompt.get(schema, (err, result) => {
                if(err) {
                    resolve(null);
                    return;
                }
                let filter = "Filter.IsTrue(IsActive)";
                if(result.projectCriteria){
                    filter = "Filter.And(" + filter + ",Filter.Or(Filter.Contains(Code,\"" + result.projectCriteria + "\"),Filter.Contains(Name,\"" + result.projectCriteria + "\")))";
                }
                projectService.getProjectsByFilter(filter).then((result) => {
                    if(result.length === 0) {
                        console.log("No projects found".info);
                        resolve(null);
                        return;
                    }
                    let choices = [];
                    for(let i = 0; i < result.length; i++){
                        let project = result[i];
                        choices.push({
                            choice: "(" + project.Code + ") " + project.Name,
                            entity: project
                        });
                    }
                    let projectSchema = {
                        description: "Select the project that you want as working project",
                        name: "selectedProject",
                        required: true
                    };
                    appUtility.promptUserChoices(projectSchema, choices, "Select the working project").then((selectedProject) => {
                        let project = choices[--selectedProject].entity;
                        projectService.selectProjectById(project.Id).then((result) => {
                            resolve(result);
                        });                            
                    });
                });
            });        
        });
    }

    /**
     * This method will get folder structure (public) of the selected project and display them.
     */
    listFolderStructure(){
        let self = this;        
        return projectService.getFolderStructure().then((folders) => {
            console.log(("Folder structure of the project " + projectService.project.Name + ":").info);
            for(let i = 0; i < folders.length; i++){
                let folder = folders[i];                    
                projectService.writeFolder(folder);                
            }
            return folders;
            
        });
    }

    getSampleChoices(){
        return [
            { choice: "Find a project or display the list of projects", fnPromise: this.listProjects, caller: this },
            { choice: "Select a working project by its id", fnPromise: this.projectSelection, caller: this },
            { choice: "List folders of selected project", fnPromise: this.listFolderStructure, caller: this },
        ];
    }    

}

let projectUseCasesInstance = new projectUseCases();
module.exports = projectUseCasesInstance;
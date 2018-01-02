let authService = require("./authService");
let api = require("../Api/aproplanApi");
let projectService = require("./projectService");

class listService {

    /**
     * This method is to retrieve the list of list of the selected project. 
     */
    getListOfSelectedProject(){
        let self = this;
        return new Promise(function(resolve, reject){
            if(!projectService.project){ // if no project selected - request a to select a project first
                console.log("Please select first a project before to work on it".warn);
                resolve();
            }
            else{
                authService.checkLogin().then(function(){                    
                    let filter = "Filter.Eq(Project.Id," + projectService.project.Id + ")"; // build the filter on the selected project
                    api.getEntityList("Meeting", filter).then(function(data){                                                
                        resolve(data);
                    });
                });
            }
        });
    }
}

let instance = new listService();
module.exports = instance;
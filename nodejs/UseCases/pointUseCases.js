

let projectService = require("../Services/projectService");
let pointService = require("../Services/pointService");
let appUtility = require("../appUtility");

class pointUseCases{

    getPointsOfSelectedProject(){
        return pointService.getPointsOfSelectedProject().then((data) => {
            console.log(("Points retrieved: " + data.length).info);
            for(let i = 0; (i < data.length && i < 15); i++){
                let point = data[i];                       

                // Display information about points retrieved
                pointService.writePoint(point);
            }
            return data;
        });
    }

    /**
     * To modify the status of specific point. It will prompt the user to have the id of the point to update + to select the status to use.
     */
    changeStatus(){
        let self = this;
        return new Promise(function(resolve, reject){
            if(!projectService.project){ // if no project selected - request a to select a project first
                console.log("Please select first a project before to work on it".warn);
                resolve();
            }
            else {

                let choices = [];
                pointService.getPointsOfSelectedProject().then((result) => {
                    for(let i = 0; i < result.length; i++){
                        let point = result[i];
                        choices.push({
                            choice: point.Id + " - (" + point.Code + ") " + point.Subject + " - status: "+ point.Status.Name,
                            entity: point
                        });
                    }
                    // Request the id of the point to check
                    appUtility.promptUserChoices({
                        name: "selectPoint",
                        description: "Select the point you want to update its status",
                        required: true,
                        type: "number"
                    }, choices, "We need a point first").then(function(result){
                        // Request the point trhough the API
                        pointService.getPointById(choices[--result].entity.Id).then(function(thePoint){
                            if(thePoint){
                                //Get the status of the point's project
                                projectService.getProjectStatus(thePoint.Project.Id).then(function(projectStatuses){
                                    let choices = [];
                                    for(let i = 0; i < projectStatuses.length; i++){
                                        let projectStatus = projectStatuses[i];
                                        if(projectStatus.Id !== thePoint.Status.Id)
                                            choices.push({choice: projectStatus.Name, originalIndex: i});
                                    }
                                        
                                    appUtility.promptUserChoices({                                    
                                        name: "selectStatus",
                                        description: "Select the new status you want to apply to the point",
                                        type: "number",
                                        required: true
                                    }, choices, "We need now to know what is the new status").then(function(statusChosen){
                                        let selectedStatus = projectStatuses[choices[statusChosen - 1].originalIndex]; // Get the chosen status
                                        console.log(("You selected the status: "+ selectedStatus.Id + " "+ selectedStatus.Name).info);
                                        
                                        pointService.updatePointStatus(thePoint, selectedStatus).then(() => {
                                            pointService.writePoint(thePoint);
                                            resolve(thePoint);
                                        });                                    
                                    });
                                    
                                });    
            
                            }
                            else{ 
                                console.log("No point found with the specified id".warn);
                                resolve();
                            }
                        });
                    }); 
                });
            }
        });
    }

    getSampleChoices(){
        return [
            { choice: "List first 15 points of the selected project", fnPromise: this.getPointsOfSelectedProject, caller: this },            
            { choice: "Change the status of a point (need to have an id of point first)", fnPromise: this.changeStatus, caller: this },            
        ];
    }
}

let instance = new pointUseCases();
module.exports = instance;
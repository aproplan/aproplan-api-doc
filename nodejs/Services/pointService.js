"use strict"

let authService = require("./authService");
let projectService = require("./projectService");
let api = require("../Api/aproplanApi");
let prompt = require("prompt");
let Promise = require("bluebird");
let appUtility = require("../appUtility");
let pad = require("pad");
let Guid = require("guid");

class pointService {
    
    /**
     * To retrieve the list of points of the selected project.
     */
    getPointsOfSelectedProject(){
        let self = this;
        return new Promise(function(resolve, rejet){
            
            if(!projectService.project){ // if no project selected - request a to select a project first
                console.log("Please select first a project before to work on it".warn);
                resolve();
            }
            else{
                authService.checkLogin().then(function(){ // check if the user is connected
                    let filter = "Filter.Eq(Project.Id," + projectService.project.Id + ")"; // build the filter on the selected project
                    let pathToLoad = "IssueType.ParentChapter,NoteInCharge,From,Code,Status,Meeting"; // specify which data to load
                    api.getEntityList("Notes", filter, pathToLoad).then(function(data) { // make the request to the API                        
                        resolve(data);
                    });
                });
            }
        });
    }

    /**
     * This method will get a point from its ID through the API. A check of user connected is done first.
     * @param {*String} id This is the id of the point to retrieve
     */
    getPointById(id){
        let self = this;
        return new Promise(function(resolve, reject){
            authService.checkLogin().then(function(){ // check if the user is connected
                
                let pathToLoad = "IssueType.ParentChapter,NoteInCharge,From,Code,Status,Meeting,Project"; // specify which data to load
                api.getEntityById("Notes", id, pathToLoad).then(function(point) { // make the request to the API
                    if(point)
                        console.log(("Points retrieve").info);
                    // Display information about points retrieved
                    self.writePoint(point);
                    resolve(point);
                });
            }).catch(function(err){
                reject(err);
            });
        });
    }

    /**
     * This method will update the status of a point with optimize data sent to APROPLAN Api
     * @param {*Notes} point The point to update the status through API
     * @param {*} newStatus THe new status to put to the point
     */
    updatePointStatus(point, newStatus){
        let updatePoint = { // Create the object to update through the API with the minimum of information needed for the updated
            Id: point.Id, // Id to identify the object to update
            EntityVersion: point.EntityVersion, // The current version of the entity then, the API knows you are modifying the same version of the object
            Status: { // For the new status, it is just necessary to specify its ID
                Id: newStatus.Id
            },
            ModifiedProperties: ["Status"] // As we don't send the complete object, we need to specify the properties to update then, API doesn't take care about other properties
        };
        return api.updateEntity("Notes", updatePoint).then(function(updatedPoint){ // Call the api for the update
            if(updatedPoint.Status.Id != newStatus.Id) 
                throw Error("A problem occured when updating the status");
                point.EntityVersion = updatedPoint.EntityVersion; // Take the new version of the object
                point.Status = newStatus;
            return point;
        });
    }

    /**
     * To create a new point throught the API
     * @param {*Meeting} list The list where the point must be created
     * @param {*string} subject The subject to use for the new point
     * @param {string} firstComment The comment to use for the first comment created. If not defined, it uses the same value as the subject
     * @param {IssueType} subcategory The sub-category to use for the new point
     * @param {Date} dueDate This is the due date to put in the new point.
     */
    createPoint(list, subject, firstComment, subcategory, dueDate){
        let newPoint = {
            Id: Guid.raw(), // We generate a new id for the new point
            Subject: subject,
            EntityVersion: 0, 
            DueDate: dueDate,
            From: { // we sent minimum info to optimize data sent
                Id: authService.user.Id
            },
            Project: { // we sent minimum info to optimize data sent
                Id: projectService.project.Id
            },
            Meeting: { // we sent minimum info to optimize data sent
                Id: list.Id
            },
            Date: new Date(), 
            Comments: [ // We generate the first comment
                {
                    Id: Guid.raw(), 
                    IsFirst: true, 
                    Date: new Date(),
                    From: {
                        Id: authService.user.Id
                    },
                    Comment: !firstComment ? subject: firstComment
                }
            ]
        };
        if(subcategory){
            newPoint.IssueType = {
                Id: subcategory
            };
        }
        // We need to put a status for the created point. Then, we get status configured to the project
        return projectService.getProjectStatus(projectService.project.Id).then((statuses) => {
            // By default, we set the status with the code "InProgress"
            for(let i = 0; i < statuses.length; i++){
                let status = statuses[i];
                if(status.Code === "InProgress"){
                    newPoint.Status = status;
                    break;
                }
            }
            // We can call the API method to create the point with the build point object
            return api.createEntity("Notes", newPoint).then((result)=> {
                if(result.Id !== newPoint.Id){
                    console.log("An error occured while the saving of the point");
                }
                // As we don't send full object for related entity, we fill tehm after the save to display them
                result.IssueType = subcategory;
                result.From = authService.user;
                result.Project = projectService.project;
                result.Meeting = list;                
                return result;
            });
        });
        

    }

    /**
     * To write the point in the console
     * @param {*Notes} point The point to write in the console
     */
    writePoint(point){
        if(point){
        let issueType = (!!point.IssueType) ? point.IssueType.Code + "/" + point.IssueType.ParentChapter.Code : "none";
        console.log((pad(15, point.Status.Name) + " - " + pad(5, point.Code) + " " + pad(30, point.Subject.substring(0, 30)) 
            + " by: " + pad(point.From.Alias.substring(0, 35), 35)
            + " - subcat: " + pad(issueType.substring(0, 15), 15) 
            + " - list: " + pad(point.Meeting.Title.substring(0, 15), 15)
            + " (id: " + point.Id + ")").result );
        }
    }
}    

let instance = new pointService();
module.exports = instance;
"use strict"

let authService = require("./authService");
let api = require("../Api/aproplanApi");
let projectService = require("./projectService");
let prompt = require("prompt");
let Promise = require("bluebird");
let appUtility = require("../appUtility");
let pad = require("pad");
let fs = require("fs");
let mime = require('mime-types')
const path = require('path');

class documentService {

    /**
     * To retrieve the list of documents of the selected project.
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

    /**
     * This method is to upload a new document/version in the project structure     
     * @param {*string} filePath The path of the file to upload
     * @param {*string} folderId The folderId where the document must be uploaded
     * @param {string} documentType to know if user is downloading working file or source file for the document
     * @param {string} target doc or version - to know if user is uploading new version of existing doc or uploading a new document - default = doc
     * @param {string} parentDocId If uploading new version, it is necessary to specify the document id for which the new version is
     * @param {string} documentName If the document needs a custom name, we can specify it else, it takes the name of the file by default
     */
    uploadDocument(filePath, folderId, documentType, target, parentDocId, documentName){
        /**
         * Need to add following parameter in the POST call: 
         * - folderid
         * - file (working or source)
         * - target (doc or version)
         * - parentdocid (when new version of existing doc)
         */
        if(!target)
            target = "doc";
        if(!folderId){
            console.log("The folderId where the document must be uploaded is required".error);
            resolve(null);
        }
        if(documentType && documentType !== "working" && documentType !== "source"){
            console.log("documentType can be only 'working' or 'source'".error);
            resolve(null);
        }
        if(target !== "doc" && target !== "version"){
            console.log("target can be only 'doc' or 'version' ".error);
            resolve(null);
        }
        if(target === "version" && !parentDocId){
            console.log("if the target is version, the parentDocId is required".error);
            resolve(null);
        }
        
        return new Promise((resolve, reject) => {
            fs.exists(filePath, (isExists) => {
                console.log("The file is found? " + isExists);
                let options = {
                    contentType: mime.lookup(filePath),                            
                    isFile: true,
                    customParams: []
                };
                if(!documentType){
                    switch(options.contentType){
                        case "application/pdf":
                        case "application/png":
                        case "application/jpg":
                        case "application/jpeg":
                        case "application/gif":
                        case "application/bmp":
                            documentType = "working";
                            break;
                        default:
                            documentType = "source";
                            break;
                    }
                }
                if(!documentName){ // We get a default name for the document based on the file name
                    documentName = path.basename(filePath, path.extname(filePath)).substring(0, 50); 
                }
                options.customParams.push({name: "folderid", value: folderId});
                options.customParams.push({name: "target", value: target});
                options.customParams.push({name: "file", value: documentType});
                options.customParams.push({name: "name", value: documentName});
                
                authService.checkLogin().then(function(){
                    api.makeRequest("/rest/uploaddocument", "POST", fs.createReadStream(filePath), options).then((result) => {                        
                        resolve(result);
                    })
                    .catch((err) => {
                        console.log("An error occured while uploading the file".info);
                        //console.log(err);
                        resolve(null);
                    });                        
                });
            });
            
        });        
    }


    /**
     * To write a document in the console with relevants properties
     * @param {Document} document The document entity to write in the console.
     */
    writeDocument(document){
        if(document){
            console.log((pad(30, document.Name.substring(0, 30)) + " uploaded by: " + pad(document.UploadedBy.Alias.substring(0,35), 35)+ " - folder: " 
            + pad(document.Folder.Name.substring(0, 15), 15) + " (" + document.Folder.Id + ") - versions: " +  pad((document.VersionCount + ""), 3) 
            + " path: " + pad(document.FolderPath, 50) + " id: " + document.Id).result);
        }
    }
}


let instance = new documentService();
module.exports = instance;
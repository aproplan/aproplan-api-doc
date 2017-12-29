
let documentService = require("../Services/documentService");
let projectService = require("../Services/projectService");
let prompt = require("prompt");
let Promise = require("bluebird");
let appUtility = require("../appUtility");

class documentUseCases{
    /**
     * To retrieve the list of documents of the selected project.
     */
    getDocumentsOfSelectedProject(){
        return documentService.getDocumentsOfSelectedProject();
    }    

    /**
     * This method is to upload a new document through aproplan in the selected project.
     * It will asks first to the user the path of the file to upload + the folder where the file must be uploaded into APROPLAN
     */
    uploadNewDocument(){

        if(!projectService.project){ // if no project selected - request a to select a project first
            console.log("Please select first a project before to work on it".warn);
            resolve();
        }

        let schema = {
            description: "Specify the path of the file to upload", 
            name: "selectedFile",
            required: true
        };
        let self = this;
        return new Promise((resolve, reject) => {
            prompt.get(schema, (err, result)=> {
                if(err){
                    reject(err);
                    return;
                }
                // Get the folders to let the user to select where the document must be uploaded
                projectService.getFolderStructure().then((folders) => {
                    let folderSelectionSchema = {
                        description: "Select the folder where you want to upload your file",
                        name: "selectedFolder",
                        required: true
                    };

                    function createFolderChoices(childrenFolders, level, choices){
                        if(childrenFolders){
                            let spaces = "";
                            for(let i = 0; i < level; i++){
                                spaces += " ";
                            }
                            for(let i = 0; i < childrenFolders.length; i++){
                                let folder = childrenFolders[i];
                                choices.push({
                                    choice: spaces + folder.Name + " - " + folder.Id,
                                    entity: folder,
                                });
                                if(folder.Children)
                                    createFolderChoices(folder.Children, ++level, choices);
                            }
                        }
                    }
                    let choices = [];
                    createFolderChoices(folders, 0, choices);

                    //Prompt to the user where the upload must be done
                    appUtility.promptUserChoices(folderSelectionSchema, choices, "Folder selection").then((folderChosen) => {
                        let folderForUpload = choices[--folderChosen].entity;
                        console.log(("Upload will be done in: " + folderForUpload.Name).info);

                        // Make the upload of the document
                        documentService.uploadDocument(result.selectedFile, folderForUpload.Id).then((newDocument) => {
                            console.log("The document is uploaded".info);
                            documentService.writeDocument(newDocument);
                            resolve(newDocument);
                        });
                    });


                });


                
            });
        });
    }


    getSampleChoices(){
        return [
            { choice: "List first 15 documents of the selected project", fnPromise: this.getDocumentsOfSelectedProject, caller: this },            
            { choice: "Upload a new document", fnPromise: this.uploadNewDocument, caller: this }
        ];
    }

}


let instance = new documentUseCases();
module.exports = instance;
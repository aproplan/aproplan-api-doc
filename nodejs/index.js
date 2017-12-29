let api = require("./Api/aproplanApi");
let authService = require("./Services/authService");
let pointService = require("./Services/pointService");

let documentUseCases = require("./UseCases/documentUseCases");
let projectUseCases = require("./UseCases/projectUseCases");

let colors = require("colors");
let prompt = require("prompt");
let appUtility = require("./appUtility");

/**
 * Simple example to get data for which it is not necessary to be connected
 * The list of countries available on APROPLAN
 */

function testCountries(){
    // Retrieve the list of countries starting with "Bel"
    return api.getEntityList("Country", "Filter.StartsWith(Name,\"Bel\")")
        .then(function(data){
            console.log(("Countries starting with 'Bel'").info);
            for(let i = 0; i < data.length; i++) {
                let country = data[i];
                console.log(("(" + country.Iso + "/" + country.Iso2 + ") " + country.Name).result);
            }
            return data;
        })
        .then(function(countriesBel){

            // Retrieve the country by its Id        
            return api.getEntityById("Country", countriesBel[1].Id).then(function(country){
                console.log(("Country with Id: " + countriesBel[1].Id + " -> " + country.Name).result);
            });
        }).then(function(){
            // Retrieve the number of countries available in APROPLAN
            return api.getEntityCount("Country").then(function(cpt){
                console.log(("Countries number: " + cpt).result);
            });
        })
        .catch(function(err){
            console.log("err throw:" + err);

        });
}

/**
 * This method will prompt to the user the sample to run
 */
function promptUserChoices(){
    
    let choices = [
        { choice: "Simple use of API without login - to retrieve country list", fnPromise: testCountries, caller: this } ,
        { choice: "Simple use of the loginsecure method", fnPromise: authService.login, caller: authService },        
    ];
    choices = choices.concat(projectUseCases.getSampleChoices());
    choices = choices.concat(documentUseCases.getSampleChoices());
    choices = choices.concat(pointService.getSampleChoices());
    choices.push({ choice: "Exit", fnPromise: undefined });

    let schema = {
        name: "choice",
        description: "Select the sample to run",
        pattern: /^[1-9]|(10)$/,
        message: "You need to select the number corresponding to your choice",
        type: "string",
        required: true
    }

    appUtility.promptUserChoices(schema, choices);
}

colors.setTheme({
    info: 'green',
    warn: 'yellow',
    debug: 'grey',
    error: 'red',
    result: 'cyan'
});

prompt.start();

promptUserChoices();

    



let api = require("./Api/aproplanApi");
let authService = require("./Services/authService");
let projectService = require("./Services/projectService");
let colors = require("colors");
let prompt = require("prompt");

/**
 * Simple example to get data for which it is not necessary to be connected
 * The list of countries available on APROPLAN
 */

function testCountries(){
    // Retrieve the list of countries starting with "Bel"
    return api.getEntityList("Country", "Filter.StartsWith(Name,\"Bel\")")
        .then(function(data){
            console.log("Countries starting with 'Bel'")
            console.log(data);
            return data;
        })
        .then(function(countriesBel){

            // Retrieve the country by its Id        
            return api.getEntityById("Country", countriesBel[1].Id).then(function(country){
                console.log("Country with Id: " + countriesBel[1].Id + " -> " + country.Name);
            });
        }).then(function(){
            // Retrieve the number of countries available in APROPLAN
            return api.getEntityCount("Country").then(function(cpt){
                console.log("Countries number: " + cpt)
            });
        })
        .catch(function(err){
            console.log("err throw:" + err);

        });
}

/**
 * This method will prompt to the user the sample to run
 */
function promptUserChoice(){
    let schema = {
        name: "choice",
        description: "Select the sample to run",
        pattern: /^[1-4]$/,
        message: "You need to select the number corresponding to your choice",
        type: "string",
        required: true
    }

    console.log("");
    console.log("Which sample do you want to run:");
    console.log("1. Simple use of API without login - to retrieve country list");
    console.log("2. Simple use of the loginsecure method");
    console.log("3. Sample on projects");
    console.log("4. Exit");
    prompt.get(schema, function(err, result){
        if(err) {
            console.log("An error occurred");        
            return;
        }
        console.log("");
        let choice = parseInt(result.choice);
        switch(choice){
            case 1:
                testCountries().finally(function(){
                    promptUserChoice();
                });
                break;
            case 2:
                authService.login().finally(function(){
                    promptUserChoice();
                });
            case 3: 
                projectService.test().finally(function(){
                    promptUserChoice();
                });
        }
        
    });
}

colors.setTheme({
    info: 'green',
    warn: 'yellow',
    debug: 'grey',
    error: 'red',
    result: 'cyan'
});

prompt.start();

promptUserChoice();

    



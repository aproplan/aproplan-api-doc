let api = require("./Api/aproplanApi");

/**
 * Simple example to get data for which it is not necessary to be connected
 * The list of countries available on APROPLAN
 */


// Retrieve the list of countries starting with "Bel"
api.getEntityList("Country", "Filter.StartsWith(Name,\"Bel\")")
    .then(function(data){
        console.log("Countries starting with 'Bel'")
        console.log(data);
        return data;
    })
    .then(function(countriesBel){

        // Retrieve the country by its Id        
        api.getEntityById("Country", countriesBel[1].Id).then(function(country){
            console.log("Country with Id: " + countriesBel[1].Id + " -> " + country.Name);
        });
    }).then(function(){
        // Retrieve the number of countries available in APROPLAN
        api.getEntityCount("Country").then(function(cpt){
            console.log("Countries number: " + cpt)
        });
    })
    .catch(function(err){
        console.log("err throw:" + err);
    });




    



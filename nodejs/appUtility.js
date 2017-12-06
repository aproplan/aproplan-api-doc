

let Promise = require("bluebird");
const colors = require("colors");
const prompt = require("prompt");

class AppUtility {

    promptUserChoices(schema, choices, title){
        let self = this;
        console.log("");
        if(!title)
            title = "Which sample to you want to run";
        console.log(title);
        if(choices){
            for(let i = 0; i < choices.length; i++){
                console.log((i + 1) + "." + " " + choices[i].choice);
            }
        }
        return new Promise(function(resolve, result){
            prompt.get(schema, function(err, result){
                if(err) {
                    console.log("An error occurred");        
                    return;
                }
                console.log("");
                if(choices){
                    let nbChoice = parseInt(result[schema.name]);
                    let choiceItem = choices[nbChoice - 1];
                    let fnPromise = choiceItem.fnPromise;
                    if(fnPromise){
                        let promise;
                        if(choiceItem.caller)
                            promise = fnPromise.call(choiceItem.caller);
                        else
                            promise = fnPromise();
                        promise.then(function(result){                        
                            if(result !== "stop")
                            {
                                return self.promptUserChoices(schema, choices, title);    
                            }
                        });
                        promise.catch(function(result){
                            return self.promptUserChoices(schema, choices, title);
                        });                
                    }                    
                    resolve(nbChoice);
                }
                else    
                {
                    resolve(result[schema.name]);
                }
            });
        });
        
    }
}

let instance = new AppUtility();
module.exports = instance;
'use strict';

var AWS = require('aws-sdk'),
    documentClient = new AWS.DynamoDB.DocumentClient();


module.exports.route = (event, context, callback) => {
	
	 var eventText = JSON.stringify(event, null, 2);
	 console.log("Received event:", eventText);
	 
	 if (event.request.type == "LaunchRequest")
		 console.log("LaunchRequest");
	 else if (event.request.type == "IntentRequest") {
		 if (event.request.intent.name == "MakeNote")
			 console.log("MakeNote");
     else if (event.request.type == "SessionEndedRequest") 
    	 console.log("SessionEndedRequest");
		 
	 }
};

'use strict';

var AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const Alexa = require('ask-sdk-core');
const skillBuilder = Alexa.SkillBuilders.custom();

const LaunchRequestHandler = {
    canHandle: (handlerInput) => {
	    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
	},
	handle: (handlerInput) => {
	    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
		const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

		const speakOutput = 'Welcome. To get a note, say \"Get a note.\"';
		
		handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

		return handlerInput.responseBuilder
				.withShouldEndSession(false)
		        .speak(speakOutput)
		        .getResponse();

	}
		
};

const GetNoteIntentHandler = {
	canHandle: (handlerInput) => {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
               handlerInput.requestEnvelope.request.intent.name === 'GetNote';
	},
	handle: (handlerInput) => {
		const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
	    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

		console.log(handlerInput.requestEnvelope);
		
		var params = {
	        TableName: process.env.DYNAMODB_TABLE,
	        IndexName: 'userIndex', // You have to add an index for this column if you want to query on it.
	        KeyConditionExpression: "#user = :u",
	        ExpressionAttributeNames:{
	            "#user": "user"
	        },
	        ExpressionAttributeValues: {
	            ":u": "jason" // TODO: Make this something real.
	        }
	    };	
		
		var speakOutput;
		return new Promise((resolve, reject) => {

		    dynamoDb.query(params, (error, result) => {
		    	if (error || result.Items.length == 0) {
				    console.error(error);
				    speakOutput = "Couldn\'t find a note.";
				} else {
					console.log(result.Items.length);
					
					// Randomly choose one of the notes, for now.
					var item = result.Items[Math.floor(Math.random() * result.Items.length)];
					
					speakOutput = item.noteText.join(' ');
					
				}

				console.log(speakOutput);

				handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

				resolve(handlerInput.responseBuilder
						    .speak(speakOutput)
							.withShouldEndSession(false)
						    .withSimpleCard('A note', 'cardText')
						    .getResponse()
				);
		    });

			
		});


	     
	}
			
};



const SessionEndedRequestHandler = {
	canHandle: (handlerInput) => {
		console.log(handlerInput.requestEnvelope);
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest' ||
               (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
	            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
	},
	handle: (handlerInput) => {
		console.log("Goodbye");
			
		return handlerInput.responseBuilder
				.withShouldEndSession(true)
			    .getResponse();

	}
			
};



module.exports.route = skillBuilder
.addRequestHandlers(
  LaunchRequestHandler,
  GetNoteIntentHandler,
  SessionEndedRequestHandler
)
//.addRequestInterceptors(LocalizationInterceptor)
//.addErrorHandlers(ErrorHandler)
.lambda();


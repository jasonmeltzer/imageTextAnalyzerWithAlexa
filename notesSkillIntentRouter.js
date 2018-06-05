'use strict';

var AWS = require('aws-sdk'),
    documentClient = new AWS.DynamoDB.DocumentClient();

const Alexa = require('ask-sdk-core');
const skillBuilder = Alexa.SkillBuilders.custom();


const LaunchRequestHandler = {
    canHandle(handlerInput) {
	    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
	},
	handle(handlerInput) {
	    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
		const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

		const speakOutput = 'Welcome. To get a note, say \"Get one.\"';
		
		handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

		return handlerInput.responseBuilder
				.withShouldEndSession(false)
		        .speak(speakOutput)
		        .getResponse();

	}
		
};

const GetNoteIntentHandler = {
	canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
               handlerInput.requestEnvelope.request.intent.name === 'GetNote';
	},
	handle(handlerInput) {
		const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
	    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

		console.log(handlerInput.requestEnvelope);
			
		const speakOutput = 'I\'m still working on that. More soon.';
			
		handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

		return handlerInput.responseBuilder
			    .speak(speakOutput)
				.withShouldEndSession(false)
			    .withSimpleCard('title', 'cardText')
			    .getResponse();

	}
			
};



const SessionEndedRequestHandler = {
	canHandle(handlerInput) {
		console.log(handlerInput.requestEnvelope);
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest' ||
               (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
	            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
	},
	handle(handlerInput) {
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


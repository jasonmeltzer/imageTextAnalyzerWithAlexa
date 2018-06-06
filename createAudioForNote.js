'use strict';

const AWS = require('aws-sdk'); 
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const S3_BUCKET = process.env.S3_BUCKET;

/*const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: process.env.REGION
})*/

var PollyS3 = require('polly-s3');


module.exports.create = (event, context, callback) => {

	var p = new PollyS3({ s3Bucket : S3_BUCKET });

	console.log(event);
	
	var eventName = event.Records[0].eventName;
	if (eventName.toUpperCase() === "INSERT") {
		var noteText = event.Records[0].dynamodb.NewImage.noteText;
		var originalS3Key = event.Records[0].dynamodb.NewImage.originalS3Key.S;
		var sentence = "";
		for (var i in noteText.L) {
			sentence = sentence.concat(noteText.L[i].S);
			sentence = sentence.concat(" ");
		}
		
		p.renderSentence( sentence, "Emma", function( err, url ){
		    if( err )
		    	console.log(err);
		    else {
		    	console.log( "Rendered speech is at URL:", url );
		    	
		    	// One problem with this library is it doesn't give you an opportunity to name the file.
				// This will rename after the fact.
				var emmaKey = url.split("/").slice("-1");
				var newEmmaKey = originalS3Key + ".emma.mp3";
				moveS3File(S3_BUCKET, emmaKey, newEmmaKey);
		    }
		});
		
		p.renderSentence( sentence, "Brian", function( err, url ){
		    if( err )
		    	console.log(err);
		    else {
		    	console.log( "Rendered speech is at URL:", url );
		    	
		    	// One problem with this library is it doesn't give you an opportunity to name the file.
				// This will rename after the fact.
				var brianKey = url.split("/").slice("-1");
				var newBrianKey = originalS3Key + ".brian.mp3";
				moveS3File(S3_BUCKET, brianKey, newBrianKey);
		    }
		});		
	}
   
};

function moveS3File(s3Bucket, oldKey, newKey) {
	console.log("moveS3File: oldKey=" + oldKey + ", newKey=" + newKey);
	var copyParams = {
		Bucket: s3Bucket, 
		CopySource: s3Bucket + "/" + oldKey, 
		Key: newKey
	};
	var deleteParams = {
		Bucket: s3Bucket, 
		Key: oldKey + "" // force this to be a string
	};
	
	var myPromise = new Promise((resolve, reject) => {
		s3.copyObject(copyParams, function(err, data) {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				console.log("Copied " + oldKey + " to " + newKey);
				resolve();
			}
		});
	});
	
	myPromise.then(function(result) {
		console.log("Attempting to delete " + oldKey + " using params " + deleteParams + " with key " + deleteParams.Key);
		s3.deleteObject(deleteParams, function(err, data) {
			if (err) {
				console.log(err);
			} else {
				console.log("Deleted " + oldKey);
			}
		});
	}).catch(function(reject) {
		console.log("Could not delete " + oldKey);
	});

}



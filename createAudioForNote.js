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
		var originalS3Key = event.Records[0].dynamodb.NewImage.originalS3Key;
		var sentence = "";
		for (var i in noteText.L) {
			sentence = sentence.concat(noteText.L[i].S);
			sentence = sentence.concat(" ");
		}
		
		var emmaUrl;
		p.renderSentence( sentence, "Emma", function( err, url ){
		    if( err )
		    	console.log(err);
		    else {
		    	console.log( "Rendered speech is at URL:", url );
		    	emmaUrl = url;
		    }
		});
		
		var brianUrl;
		p.renderSentence( sentence, "Brian", function( err, url ){
		    if( err )
		    	console.log(err);
		    else {
		    	console.log( "Rendered speech is at URL:", url );
		    	brianUrl = url;
		    }
		});		
		
		console.log("EmmaURL: " + emmaUrl);
		console.log("BrianURL: " + brianUrl);
		
		// One problem with this library is it doesn't give you an opportunity to name the file.
		// This will rename after the fact.
		var emmaKey = emmaUrl.split("/").slice("-1");
		var brianKey = brianUrl.split("/").slice("-1");
		
		var newEmmaKey = originalS3Key + ".emma.mp3";
		var newBrianKey = originalS3Key + ".brian.mp3";
		
		moveS3File(S3_BUCKET, emmaKey, newEmmaKey);
		moveS3File(S3_BUCKET, brianKey, newBrianKey);
	}
   
};


function moveS3File(s3Bucket, oldKey, newKey) {
	s3.copyObject({
		Bucket: s3Bucket, 
		CopySource: s3Bucket + "/" + oldKey, 
		Key: newKey
	})
	.promise()
	.then(() => 
		// Delete the old object
		s3.deleteObject({
			Bucket: s3Bucket, 
		    Key: oldKey
		}).promise()
	)
	.catch((e) => console.error(e))	
}

'use strict';

const AWS = require('aws-sdk'); 
var rekognition = new AWS.Rekognition({apiVersion: '2016-06-27'});
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');

module.exports.parse = (event, context, callback) => {

	console.log(event);
	
	// Derive the bucket and filename from the event
    var bucket = event.Records[0].s3.bucket.name;
    var key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    var params = {
        Bucket: bucket,
        Key: key,
    }
    console.log(bucket);
    console.log(key);
 
    var params = {
        Image: {
    		S3Object: {
    		    Bucket: bucket,
    		    Name: key
    		}
        }
    };
    
    console.log(params);
    rekognition.detectText(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {								  // successful response
        	console.log(data);   

        	var textLines = [];
        	
        	for (var i = 0, len = data.TextDetections.length; i < len; i++) {
        	    var textDetection = data.TextDetections[i];
        	    console.log(textDetection);
        	
        	    // Only interested in LINE types right now, which should include all of the WORD types
        	    if (textDetection.Type === 'LINE') {
        	    	textLines.push(textDetection.DetectedText);
        	    }
        	}
        	
        	if (textLines.length == 0) {
        		console.log("No text found in image");
        		return;
        	}
        	
        	var dynamoParams = {
        	    TableName: process.env.DYNAMODB_TABLE,
        	    Item: {
        	      id: uuid.v1(),
        	      noteText: textLines,
        	      user: 'jason', // TODO: Do something real here.
        	      originalS3Key: key
        	    }
        	};   
        	// write the note to the database
        	dynamoDb.put(dynamoParams, (error) => {
        	    // handle potential errors
        	    if (error) {
        	        console.error(error);
        	    }
        	});
        }
    });    
    
    
};

// Embedded datastore for node.js
// https://github.com/louischatriot/nedb


var Datastore = require('nedb')
  , db = new Datastore({ filename: 'serialPool.db', autoload: true });
//----------------------------------------


var controller = {};

var DIGIT_NUMBER = 12;// 序號幾碼
var vvv = 0;


//----------------------------------------

// 產生一組序號
controller.generateNewSerial = function(){
	var uuid = require('node-uuid');
	var unique_str = uuid.v4();
	unique_str = unique_str.replace(/-/g, "");
	unique_str = unique_str.substring(0, DIGIT_NUMBER);// 12碼
	unique_str = unique_str.toUpperCase();// 轉大寫字母

	return unique_str;
}

controller.setSerialUsed = function(serial_str,callback){
	db.update({ serial: serial_str }, { $set: { isUsed: true } }, { multi: true }, function (err, numReplaced) {
	  // numReplaced = 3
	  // Field 'system' on Mars, Earth, Jupiter now has value 'solar system'
	  callback();
	});
}

// 插入序號進序號池
controller.addSerialToPool = function(i, end, callback){
	if(i >= end){
		callback(i);
		return;
	}
	console.log(i);
	var unique_str = controller.generateNewSerial();
		
	db.findOne({serial:unique_str},function(err, docs){
		// console.log(docs);
		if(docs === null){
			// console.log("serial : "+unique_str);
			var data = { serial:unique_str, isUsed:false };
			controller.insert(data, function(){
				console.log(vvv++);
				controller.addSerialToPool(i+1, end, callback);
			});
		}else{
			controller.addSerialToPool(i, end, callback);
		}
	});
}

// CRUD
controller.insert = function(doc, callback){
	// var doc = { hello: 'world'
 //               , n: 5
 //               , today: new Date()
 //               , nedbIsAwesome: true
 //               , notthere: null
 //               , notToBeSaved: undefined  // Will not be saved
 //               , fruits: [ 'apple', 'orange', 'pear' ]
 //               , infos: { name: 'nedb' }
 //               };

	db.insert(doc, function (err, newDoc) {   // Callback is optional
	  // newDoc is the newly inserted document, including its _id
	  // newDoc has no key called notToBeSaved since its value was undefined
	  if(err){
	  	console.log(err);
	  }else{
	  	// console.log(newDocs);	
	  }
	  callback();
	});
}

// controller.isPoolEmpty = function(callback){
// 	var isEmpty = false;
// 	db.findOne({}, function (err, docs) {
// 		if(docs === null){
// 			isEmpty = true;
// 		}
// 		callback(isEmpty);
// 	}
// }


controller.findHaveNotUsedSerial = function(callback){
	db.findOne({ isUsed: false }, function (err, doc) {
	  // docs is an array containing documents Mars, Earth, Jupiter
	  // If no document is found, docs is equal to []
	  if(err){
	  	console.log(err);
	  	callback(null);
	  }else{
	  	// console.log(doc);
	  	if(doc === null){
	  		var addNum = 1000;
		  	
			controller.addSerialToPool(0, addNum, function(){
				db.findOne({ isUsed: false }, function (err, doc2) {
					callback(doc2);
				});
			});
	  	}else{
	  		callback(doc);
	  	}
	  }
	});

}

module.exports = controller;
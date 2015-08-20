
var DATA_COUNT = 1000;
var GROUP_NUM = 100;

//----------------------------------------
var util = require('util');
var async = require('async');
var uuid = require('node-uuid');
var xlsx = require('xlsx-writestream');
var fs = require('fs');

var db_controller = require('./db_controller.js');


//----------------------------------------
var uid_list = [];

var data_list = [];

var filename_list = [ 
	'TK0001.xlsx',
];

//----------------------------------------



function read_xlsx(){
	for(var i = 0; i < filename_list.length; i++){
		var filename = filename_list[i];
		var read_obj = nodexlsx.parse(filename);
		//console.log(JSON.stringify(read_obj));
		//console.log(JSON.stringify(read_obj[0].data[0]));
		//console.log(JSON.stringify(read_obj[0].data[1]));
		
		
		var data = [];
		for(var k = 0; k < 10; k++){
		//for(var k = 0; k < read_obj[0].data[0].length; k++){
			var obj = {};
			for(var j = 0; j < read_obj[0].data[0].length; j++){
				var title = JSON.stringify(read_obj[0].data[0][k]);
				console.log(JSON.stringify(read_obj[0].data[0][k]));
				obj[title] = read_obj[0].data[j][k];
			}
			data.push(obj);
		}

		//data.push(o);

		xlsx.write('mySpreadsheet.xlsx', data, function (err) {
			// Error handling here
			//callback();
		})
	}
}

function output_txt(callback){	
	var text_content = "";
	for(var i = 0; i< uid_list.length; i++){
		text_content += uid_list[i]+"\r\n";
	}
	
	fs.writeFile("uid_list.txt", text_content, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("The file was saved!");
		}
		callback();
	});
}


function getLabel_1(num){
	var tmp = "";
	if(num > 999){
		return undefined;
	}else{
		tmp += Math.floor(num/100);
		tmp += Math.floor((num%100)/10);
		tmp += Math.floor(num%10);
	}	
	tmp = "TK"+tmp;
	return tmp;
}

function getLabel_2(num){
	var tmp = "";
	if(num > 999){
		return undefined;
	}else{
		tmp += Math.floor(num/100);
		tmp += Math.floor((num%100)/10);
		tmp += Math.floor(num%10);
	}		
	return tmp;
}
var data = [];	



function output_xlst(i, end, group, data, callback){	
	if(i >= end){
		// console.log(i);
		xlsx.write('堂口虛寶序號_TK'+getLabel_2(group)+'.xlsx', data, function (err) {
			// Error handling here
			if(err) console.log("ERROR!!\n"+err);

			callback(group);
			
		});
		return;
	}
	
	db_controller.findHaveNotUsedSerial(function(doc){
		db_controller.setSerialUsed(doc.serial, function(){
			var obj = {};
			obj["NO"] = util.format("%s.%s",getLabel_1(group), getLabel_2(i+1));
			obj["serialid"] = ""+doc.serial;
			obj["type"] = '3';
			obj["itemid_1"] = '7';
			obj["itemid_2"] = '0';
			obj["itemid_3"] = '0';
			obj["group"] = ""+group;
			data.push(obj);
			output_xlst(i+1, end, group, data, callback);
		});
	});
}

function output_xlst_grouptimes(i, end, callback){
	if(i >= end){
		console.log(i);
		callback();
		return;
	}

	var group = i+1;
	var data = [];
	output_xlst(0,DATA_COUNT, group, data, function(index){
	
		output_xlst_grouptimes(i+1, end, callback);
	});

}

function output_text(cb){
	async.series([
		// function(callback){
		// 	output_txt(function(){
		// 		callback();
		// 	})
		// },
		function(callback){
			
			output_xlst_grouptimes(0, GROUP_NUM, function(){
				callback();
			});
		},
		
	], function(err, results) {
		cb();
		//console.log('Done !!');
	});
}

//----------------------------------------




async.series([
    function(callback){
		db_controller.addSerialToPool(0, DATA_COUNT*GROUP_NUM, function(i){
			callback();
		});
	},
	// function(callback){
	// 	output_text(function(){
	// 		callback();
	// 	})		
	// }
], function(err, results) {
    console.log('Done !!');
});
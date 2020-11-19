
const path = require('path');
var http = require('http');
var https = require('https');
var fs = require('graceful-fs');
var utils = require('./utils.js');


//console.log("id ", process.argv[2]);

if (undefined === process.argv[2]) {
	console.log('Please provide a resourceId as argument (e.g. 5acf0cf7333441b4b518bb3125253a131d)');
	process.exit(1);
}

var resourceId = process.argv[2];
var rootPath = path.join(__dirname,'/../../lectures/');



var basePath = rootPath + resourceId;
var size = 0;
var cur = 0;
var listFile = rootPath + 'list.json';
var tried = false;



var getPlayerOptionsRequest = {
	'getPlayerOptionsRequest': {
		'ResourceId': resourceId,
		'QueryString': '',
		'UseScreenReader': false,
		'UrlReferrer': ''
	}
};

var getPlayerOptionsRequestString = JSON.stringify(getPlayerOptionsRequest);

var headers = {
	'Content-Type': 'application/json',
	'Content-Length': getPlayerOptionsRequestString.length
};

var options = {
	host: 'collegerama.tudelft.nl',
	port: 80,
	path: '/Mediasite/PlayerService/PlayerService.svc/json/GetPlayerOptions',
	method: 'POST',
	headers: headers
};

var createDataDirs = (callback) => {

	fs.mkdir(rootPath, () => {
		fs.mkdir(basePath, () => {
			fs.mkdir(basePath + '/data', () => {
				fs.mkdir(basePath + '/slides', callback)
			})
		})
	})

	
	
}




try {
	testReq(rootPath);
} catch (err) {
   console.log("error",err);
   process.exit(1);
}


// checks if id exists
function testReq(rootPath) {

	var testRequest = http.request(options, (Incomming) => {
		//console.log("status",Incomming.statusCode);

		if (Incomming.statusCode === 200) {
			//console.log("Success");
			req.write(getPlayerOptionsRequestString);
			req.end();

		} else {
			console.log("Server couldn't find id");
			process.exit(1);
		}
	
	});

	testRequest.write(getPlayerOptionsRequestString);
	testRequest.end();


}




// meat of application
// will download the data.json file
var req = http.request(options, function(res) {


	createDataDirs(function () {

		// Save data file
		var file = fs.createWriteStream(basePath + '/data/data.json');
		res.pipe(file);

		file.on('error', (err) => {
			console.log(err);
			process.exit(1);

		})

		

		// On finishing, download slides
		file.on('finish', function () {
			fs.readFile(file.path, (err, data) => {
				if (err !== null) {
					console.log("data.json error:", err);
					console.log("path: ", file.path);
					process.exit(1);
					
				} else {	
					var resultObject = JSON.parse(data);
					console.log("Starting download",resourceId);

					slides(resultObject);

					var nVideos = numVideos(resultObject);

					for (let i =0; i<nVideos; i++){
						video(resultObject, i);
					}
				}

			});
		
		



		});
	});

	
	return;	
});





var slides = function (data) {
	var stream = data.d.Presentation.Streams[0];
	var slideBaseURL = stream.SlideBaseUrl;
	var slideImageFileNameTemplate = stream.SlideImageFileNameTemplate;
	
	stream.Slides.forEach(function (slide) {
		var padded = utils.pad(slide.Number.toString(), 4);
		var fileName = slideImageFileNameTemplate.replace('{0:D4}', padded);

		var file = fs.createWriteStream(basePath + '/slides/' + fileName);
		var request = https.get(slideBaseURL + fileName, function (res) {
		  res.pipe(file);
		});
	});
};

var numVideos = function (data) {
	let i = 0;
	while (data.d.Presentation.Streams[i] !== undefined){
		i++;
	}
	return i;
}

var video = function (data, i) {
	var stream = data.d.Presentation.Streams[i];


	var file = fs.createWriteStream(basePath + '/video' + i.toString() +'.mp4');


	var request = https.get(stream.VideoUrls[0].Location, function (res) {
		res.pipe(file);

		let size = parseInt(res.headers['content-length'], 10);
		let cur = 0;
		let total = size / 1048576;

		let interval = setInterval(() => {
			console.log("Downloading " + (100.0 * cur / size).toFixed(2) + "% " + (cur / 1048576).toFixed(2) + " MB" + " Total size: " + total.toFixed(2) + " MB");
		},1000);

		res.on("data", function(chunk) {
			cur += chunk.length;
		});

		res.on("error", () => {
			console.log("No video "+i.toString()+" available");
			return;
		});

        res.on('end', function () {
			console.log("done");
			clearInterval(interval);
			return;
	     });
	});
};







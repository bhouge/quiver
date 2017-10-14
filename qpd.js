/**
 * 
 */

var app = require('express')();
var fs = require('fs');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var listenerCount = 0;
var supremeLeaderCount = 0;
var mysteryUserCount = 0;

//ok, instead of an array with arbitrary indices, give each file a handy instrument name
//that way, if you add or replace samples here, you don't need to change it on the receiving end
var fileNames = {
		vibes: "BowedVibesC#5d.mp3",
        clarinet: "CL_Swell_B4.mp3",
        nyatiti: "Kora1_F3_a.mp3",
        piano: "AplombPR_F01.mp3",
        windchimes: "windchimes.mp3",
        marimba: "Marimba_D5.mp3",
        rattle: "rattle.mp3",
        vlaZing: "Viola_Zing_C5.mp3",
        voice: "Voice_Ah_C#4.mp3",
        accordionLow: "Accordion_Bass_C3.mp3",
        accordionHigh: "Accordion_Thin_C3.mp3",
        testing1: "testing1.mp3",
        testing2: "testing2.mp3",
        testing3: "testing3.mp3",
        testing4: "testing4.mp3"
};

var buttonStates = {
		button1: true,
		button2: true,
		button3: true,
		button4: true
}

var directoryPrefix = '/sounds/compressed/';

app.get('/controller', function(req, res){
	res.sendFile(__dirname + '/qpdCommand.html');
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/qpd.html');
});

app.get(/^(.*)$/, function(req, res){
	//if a specific file is requested, pass it on through...
	res.sendFile(__dirname + req.params[0]);
});


io.on('connection', function(socket){
  //console.log('a user connected');
  socket.on('disconnect', function(){
	  if (socket.category == "listener") {
		  listenerCount--;
		  console.log('listener disconnected; listeners remaining: ' + listenerCount);
	  } else if (socket.category == "supreme leader") {
		  supremeLeaderCount--;
		  console.log('supreme leader disconnected; supreme leaders remaining: ' + supremeLeaderCount);
	  } else {
		  console.log('mystery user disconnected; mystery users remaining: ' + mysteryUserCount);
		  mysteryUserCount--;
	  }
  });
  /*
  socket.on('say to someone', function(id, msg){
	    socket.broadcast.to(id).emit('my message', msg);
  });
  */
  socket.on('control message', function(msg){
	  //these are coming from the controller and going to all listeners
	  //actually going to controllers, too; don't think this matters, but could potentially only target listeners
	  console.log('control message: ' + msg);
	  var splitMSG = msg.split('/');
	  var buttonID;
	  var buttonValue;
	  for (var i = 0; i < splitMSG.length; i++) {
		  //avert your eyes!
		  if (splitMSG[i] == 'button') {
			  buttonID = splitMSG[i+1][0];
			  buttonValue = splitMSG[i+1][2];
			  break;
		  }
	  }
	  //console.log('no splitMSG? ' + splitMSG);
	  if (buttonID) {
		  var buttonName = 'button' + buttonID;
		  var buttonYesOrNo;
		  if (buttonValue == '1') {
			  buttonYesOrNo = true;
		  } else {
			  buttonYesOrNo = false;
		  }
		  buttonStates[buttonName] = buttonYesOrNo;
		  //console.log('gonna send button states!');
		  io.emit('button states', buttonStates);
	  } else {
		  io.emit('control message', msg);
	  }
  });
  socket.on('i am', function(msg){
	    //console.log(msg);
	    //io.emit('message', msg);
	  	//you could add a property that is name, so we can know who's disconnecting as well
	  	var splitMSG = msg.split(' ');
	    if (splitMSG[0] == 'listener') {
	    	//console.log(msg);
	    	socket.category = splitMSG[0];
	    	//socket.dinerID = deviceIDs[splitMSG[1]];
	    	//connections[socket.dinerID] = socket.id;
	    	//socket.currentCourse = 0;
	    	//socket.emit('you are', socket.dinerID);
	    	listenerCount++;
	    	console.log("listener connected; listeners: " + listenerCount);
	    	//socket.emit('table connection', socket.dinerID);
	    	//io.emit('table connection', "hi mom");
	    	//socket.broadcast.to(tableID).emit('table connection', socket.dinerID);
	    	
	    	//var fileToPush = __dirname + '/sounds/yooo.mp3';
    		//pushSoundToClient(fileToPush, 0, socket);
	    	
	    	//tell listener how many audio files to expect
	    	
	    	var numberOfFilesToSend = Object.keys(fileNames).length
	    	
	    	//don't change this format! 'sending audio' is a specially formatted command!
	    	socket.emit('sending audio', Object.keys(fileNames).length);
	    	
	    	//send button active state
	    	socket.emit('button states', buttonStates);
	    	
	    	//send the audio files
	    	for (var instrument in fileNames) {
	    		//console.log(fileNames[instrument]);
	    		var fileToPush = __dirname + directoryPrefix + fileNames[instrument];
	    		//console.log(fileToPush + ' is a ' + instrument);
	    		pushSoundToClient(fileToPush, instrument, socket);
	    	}
	    	
	    		    	
	    } else if (msg == 'supreme leader') {
	    	socket.category = msg;
	    	supremeLeaderCount++;
	    	console.log("supreme leader connected; supreme leaders: " + supremeLeaderCount);
	    } else {
	    	console.log("mystery user connected; mystery users: " + mysteryUserCount);
	    	mysterUserCount++;
	    }
  });
  socket.emit('get type', 'because you just connected!');
});

function pushSoundToClient(filename, bufferIndex, socket) {
	//console.log('Pushing ' + filename + ' to buffer index ' + bufferIndex + ' on socket ' + socket);
	fs.readFile(filename, function(err, buf){
		if (err) {
			console.log("Error: " + err);
		} else {
			//console.log('audio index:' + bufferIndex);
			//note: now sending instrument name instead of numerical index, but should still work...
		    socket.emit('audio', { audio: true, buffer: buf, index: bufferIndex });
		}
	});
}

// is it possible that we could start listening and someone could connect before referenceTone is loaded?
// let's start being systematic about this; 8300 for qpd, increments of 10 from there?
http.listen(8300, function(){
  console.log('listening on *:8300');
});


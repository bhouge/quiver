/**
 * Evolve
 * by Ben Houge
 * Some kind of behavior that plays some notes...
 * It will be neato.
 */

// creating an intermittentSound object with an object constructor
function Evolve(instrumentArray, minPause, maxPause, minReps, maxReps, completionCallback) {
	//alert(this);
	this.piano = instrumentArray[0];
	this.nyatiti = instrumentArray[1];
	this.minPause = minPause;
	this.maxPause = maxPause;
	this.minReps = minReps;
	this.maxReps = maxReps;
	this.completionCallback = completionCallback;
	
	
	// private variables
	
	// Douglas Crockford told me to do this: http://www.crockford.com/javascript/private.html
	// It's a convention that allows private member functions to access the object
	// due to an error in the ECMAScript Language Specification
	var that = this;
	
	var timerID;
	
	function playBuffer(bufferIndex, volume, pitch) {
		//somewhere in here we should probably error check to make sure an outputNode with an audioContext is connected
		//var newNow = that.outputNode.context.currentTime + 0.1;
		var audioBufferSource = that.outputNode.context.createBufferSource();
		audioBufferSource.buffer = bufferIndex;
		audioBufferSource.playbackRate.value = pitch;
		audioBufferGain = that.outputNode.context.createGain();
		//audioBufferGain.gain.value = volume;
		//audioBufferGain.gain.setValueAtTime(0., newNow);
		//audioBufferGain.gain.setValueAtTime(0., that.outputNode.context.currentTime);
		audioBufferSource.connect(audioBufferGain);
		audioBufferGain.connect(that.outputNode);
		try {
			//audioBufferSource.start(newNow, that.startTime, that.dur);
			
			//alert(that.outputNode.context.currentTime);
			//audioBufferGain.gain.linearRampToValueAtTime(volume, newNow + 0.05);
			
			audioBufferGain.gain.linearRampToValueAtTime(0.0, that.outputNode.context.currentTime);
			audioBufferGain.gain.linearRampToValueAtTime(volume, that.outputNode.context.currentTime + 0.05);
			audioBufferGain.gain.linearRampToValueAtTime(volume, that.outputNode.context.currentTime + that.dur - 0.05);
			audioBufferGain.gain.linearRampToValueAtTime(0.0, that.outputNode.context.currentTime + that.dur);
			
			audioBufferSource.start(that.outputNode.context.currentTime, that.startTime, that.dur);
		} catch(e) {
			alert(e);
		}		
	}
	
	
	
	// making this a private member function
	function tickDownIntermittentSound() {
		var possibleNotes = [77, 75, 79, 77.5, 76.5];
		var note2Play = possibleNotes[Math.floor(5 * Math.random())];
		var octave = (Math.floor(4 * Math.random()) - 1) * 12;
		var offset1 = Math.random() * 0.125;
		var offset2 = Math.random() * 0.125;
		var pianoVol = Math.random();
		var nyatitiVol = 1. - pianoVol;
		//var offset = 0;
		
		var piano = this.piano;
		var nyatiti = this.nyatiti;
		piano.playNote(note2Play+ octave, pianoVol, 1., offset1);
		//54.093589 is the base MIDI note for 186Hz baseFreq of kora
		nyatiti.playNote(note2Play + octave, nyatitiVol, 1., offset2);
		//var bufferDur = that.buffer.duration;
		// not anymore, now I'm specifying this, right?
		var bufferDur = that.dur;
		if (that.numberOfReps > 0 && that.isPlaying) {
			var pauseDur = (that.maxPause - that.minPause) * Math.random() + that.minPause;
			timerID = window.setTimeout(tickDownIntermittentSound, (pauseDur) * 1000.);
		} else {
			//fix this later
			//timerID = window.setTimeout(finishedPlaying, (bufferDur/pitch) * 1000.);
		}
		that.numberOfReps--;
	}
	
	function finishedPlaying() {
		//alert(that);
		that.isPlaying = false;
		//console.log("this is how we know an intermittent sound is done, right?");
		if (that.completionCallback) {
			that.completionCallback();
		}
	}
	
	function pitchClassToMultiplier(octave, interval) {
		var multiplier = Math.pow(2., (12. * octave + interval) / 12.);
		return multiplier;
	}
	
	this.play = function() {
		this.isPlaying = true;
		this.numberOfReps = Math.floor(((this.maxReps - this.minReps) + 1) * Math.random() + this.minReps);
		if (this.startWithPause) {
			var pauseDur = (that.maxPause - that.minPause) * Math.random() + that.minPause;
			timerID = window.setTimeout(tickDownIntermittentSound, pauseDur * 1000.);
		} else {
			tickDownIntermittentSound();
		}
	}
	
	var envelope = [[0,0]];
	//attack time to 1
	//decay time to sustain level
	//sustain level
	//release time
	
	
	this.playNote = function(pitch, volume, duration, startTime) {
		//somewhere in here we should probably error check to make sure an outputNode with an audioContext is connected
		//var newNow = that.outputNode.context.currentTime + 0.1;
		//var pitchMultiplier = pitchClassToMultiplier(that.pitchArray[pitchIndex][0], that.pitchArray[pitchIndex][1]);
		var audioBufferSource = that.outputNode.context.createBufferSource();
		audioBufferSource.buffer = that.buffer;
		audioBufferSource.playbackRate.value = pitch;
		audioBufferGain = that.outputNode.context.createGain();
		//audioBufferGain.gain.value = volume;
		//audioBufferGain.gain.setValueAtTime(0., newNow);
		//audioBufferGain.gain.setValueAtTime(0., that.outputNode.context.currentTime);
		audioBufferSource.connect(audioBufferGain);
		audioBufferGain.connect(that.outputNode);
		//seems goofy, but by scheduling everything slightly into the future (voluntarily adding latency),
		//I was able to get rid of an ugly intermittent click (which randomly occurred even with no randomnessin parameters)
		//Keep an eye on this value as you test on other devices...
		//you could use this as a way to have different timing offsets for different devices...
		//console.log("User-agent header sent: " + navigator.userAgent;);
		//maybe this could help? https://source.android.com/devices/audio/latency_measurements
		var timeToStart = that.outputNode.context.currentTime + 0.05;
		try {
			//audioBufferSource.start(newNow, that.startTime, that.dur);
			
			//alert(that.outputNode.context.currentTime);
			//audioBufferGain.gain.linearRampToValueAtTime(volume, newNow + 0.05);
			
			audioBufferGain.gain.linearRampToValueAtTime(0.0, timeToStart);
			audioBufferGain.gain.linearRampToValueAtTime(volume, timeToStart + 0.05);
			//audioBufferGain.gain.linearRampToValueAtTime(volume, that.outputNode.context.currentTime + (duration - 0.05));
			audioBufferGain.gain.linearRampToValueAtTime(0.0, timeToStart + duration);
			//unless there's something I'm missing here, duration gets scaled with pitch
			//so if you want duration to not scale with pitch, you should multiply it by pitch, which I was not doing before.
			//audioBufferSource.start(that.outputNode.context.currentTime, startTime, duration * pitch);
			audioBufferSource.start(timeToStart, startTime);
			//console.log('duration * pitch is ' + (duration * pitch));
			//console.log('startTime is ' + startTime);
			//console.log('duration is ' + duration);
		} catch(e) {
			alert(e);
		}
		//timerID = window.setTimeout(finishedPlaying, (duration/pitch) * 1000.);
	}
	
	this.stop = function() {
		if (this.isPlaying) {
			window.clearTimeout(timerID);
			this.isPlaying = false;
			finishedPlaying();
		}
	}
	
	this.connect = function(nodeToConnectTo) {
		try {
			if (nodeToConnectTo.destination) {
				this.outputNode = nodeToConnectTo.destination;
			} else {
				this.outputNode = nodeToConnectTo;
			}
		} catch(e) {
			alert("It seems you have not specified a valid node.");
		}
		// baseFreq 698.456463 is MIDI note 77 (a high F)
		//piano = new MIDIInstrument(this.buffer, 698.456463, 0.01, 0.5, 0.7, 0.1);
		//piano.connect(that.outputNode);
		//nyatiti = new MIDIInstrument(this.buffer, 186., 0.01, 0.5, 0.7, 0.1);
		//nyatiti.connect(that.outputNode);
	}
	
	this.estimateDuration = function() {
		var midiPitchArray = [];
		for (var i = 0; i < this.pitchArray.length; i++) {
			var midiPitch = this.pitchArray[i][0] * 12;
			midiPitch += this.pitchArray[i][1];
			midiPitchArray.push(midiPitch);
		}
		var averagePitch = 0;
		for (var i = 0; i < midiPitchArray.length; i++) {
			averagePitch += midiPitchArray[i];
		}
		averagePitch = averagePitch / midiPitchArray.length;
		averagePitch = pitchClassToMultiplier(0, averagePitch);
		var averageDur = ((this.minDur + this.maxDur) / 2.0) / averagePitch;
		var averageReps = (this.minReps + this.maxReps) / 2.0; 
		var averagePause = (this.minPause + this.maxPause) / 2.0;
		var estimate = averageDur * (averageReps + 1.0) + averagePause * averageReps;
		if (this.startWithPause) {
			estimate += averagePause;
		}
		return estimate;
	}
}

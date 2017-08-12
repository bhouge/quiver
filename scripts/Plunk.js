/**
 * Plunk
 * by Ben Houge
 * Simple arpeggiation of a dyad with high level control over parameters...
 * It will be neato.
 */

// creating an intermittentSound object with an object constructor
function Plunk(instrument1, instrument2, bpm, ticksPerBeat, minPause, maxPause, minReps, maxReps, completionCallback) {
	//alert(this);
	this.instrument1 = instrument1;
	this.instrument2 = instrument2;
	this.msPerBeat = (60000. / (bpm * ticksPerBeat));
	//in beats, ok?
	this.minPause = minPause;
	this.maxPause = maxPause;
	//
	this.minReps = minReps;
	this.maxReps = maxReps;
	this.isPlaying = false;
	//I don't think I need this...
	this.completionCallback = completionCallback;
	
	var isPausing = false;
	
	// private variables
	
	// Douglas Crockford told me to do this: http://www.crockford.com/javascript/private.html
	// It's a convention that allows private member functions to access the object
	// due to an error in the ECMAScript Language Specification
	var that = this;
	
	var timerID;
	var schedulerTimerID;
	
	var startTimeInContext = 0;
	
	//just for testing
	var currentNote = 60;
	//let's define notes as pitch (MIDI), volume (0-1), duration (in beats)
	var phrases = [
	               [[60, 1., 1], [62, 0.8, 1], [64, 0.5, 2], [60, 0.35, 1], [67, 1., 2], [59, 0.65, 1]],
	               [[72, 1., 1], [71, 0.8, 1], [69, 0.5, 2], [71, 0.35, 1], [67, 1., 2], [62, 0.65, 1]],
	               [[65, 0.8, 2], [64, 0.5, 1], [62, 0.9, 1], [61, 0.25, 1], [60, 1., 1], [59, 1., 1], [67, 0.65, 1]],
	               [[65, 0.7, 2], [64, 0.5, 1], [62, 0.8, 2]],
	               [[64, 0.8, 2], [65, 0.3, 1], [66, 0.7, 1], [67, 0.6, 1], [66, 0.7, 1], [67, 0.6, 1], [66, 0.7, 1], [67, 0.6, 1]],
	               ];
	var phrase1 = [[60, 1., 1], [62, 0.8, 1], [64, 0.5, 2], [60, 0.35, 1], [67, 1., 2], [59, 0.65, 1]];
	var phrase2 = [[72, 1., 1], [71, 0.8, 1], [69, 0.5, 2], [71, 0.35, 1], [67, 1., 2], [62, 0.65, 1]];
	var phrase3 = [[65, 0.8, 2], [64, 0.5, 1], [62, 0.9, 1], [61, 0.25, 1], [60, 1., 1], [59, 1., 1], [67, 0.65, 1]];
	//var phrase4 = 
	
	var phrase2Play;
	
	var noteIndex = 0;
	//this is in beats
	var durationOfSecondNote = 3;

	var lookAheadTime = 500;
	
	var beats = [];
	
	var beatCountdown = 0;
	//var countdownToEndOfCurrentNote = 0;
	//var countdownToEndOfCurrentPause = 0;

	function pitchClassToMultiplier(octave, interval) {
		var multiplier = Math.pow(2., (12. * octave + interval) / 12.);
		return multiplier;
	}
	
	function scheduler() {
		if (that.isPlaying) {
			//I feel like I should be doing this for every note that falls within  lookAheadTime
			//I am not, and yet it still works; at some point investigate why...
			//console.log("ms since context created:" + Math.floor(that.instrument1.outputNode.context.currentTime * 1000.));
			var msSincePlay = (Math.floor(that.instrument1.outputNode.context.currentTime * 1000.) - startTimeInContext);
			console.log("ms since behavior started:" + msSincePlay);
			if (msSincePlay >= 0) {
				var msSinceLastBeat = msSincePlay % that.msPerBeat;
				if (msSinceLastBeat + lookAheadTime > that.msPerBeat) {
					var beatCount = Math.floor(msSincePlay / that.msPerBeat) % 10;
					var timeToNextBeat = that.msPerBeat - msSinceLastBeat;
					if (beats[beatCount] != msSincePlay + timeToNextBeat) {
						console.log("beat " + beatCount + " in " + timeToNextBeat + " ms!");
						beat(that.msPerBeat - (msSincePlay % that.msPerBeat));
						beats[beatCount] = msSincePlay + timeToNextBeat;
					} 				
				}
			}
			//console.log("msSincePlay % that.msPerBeat:" + msSincePlay % that.msPerBeat);
			//if (msSincePlay % that.msPerBeat)
			schedulerTimerID = window.setTimeout(scheduler, 100);
		}
	}
	
	function beat(msUntilBeat) {
		if (!isPausing) {
			beatCountdown--;
			if (beatCountdown <= 0) {
				var note2Play = phrase2Play[noteIndex][0];
				//var octave = (Math.floor(2 * Math.random()) + 1) * 12;
				var octave = 0;
				var offset1 = Math.random() * 0.125;
				var offset2 = Math.random() * 0.125;
				
				var vol = phrase2Play[noteIndex][1];
				var pianoVol = Math.random();
				var nyatitiVol = 1. - pianoVol;
				
				beatCountdown = phrase2Play[noteIndex][2];
				
				var piano = this.piano;
				var nyatiti = this.nyatiti;
				piano.playNote(msUntilBeat, note2Play + octave, vol * pianoVol, 0.5, offset1);
				//54.093589 is the base MIDI note for 186Hz baseFreq of kora
				nyatiti.playNote(msUntilBeat, note2Play + octave, vol * nyatitiVol, 0.5, offset2);
				
				noteIndex++;
				if (noteIndex >= phrase2Play.length) {
					var phraseID = Math.floor(Math.random() * phrases.length);
					console.log('next phrase: ' + phraseID);
					phrase2Play = phrases[phraseID];
					noteIndex = 0;
					beatCountdown = Math.floor((1 + that.maxPause - that.minPause) * Math.random()) + that.minPause;
					if (beatCountdown > 0) {
						isPausing = true;
					}
				}
				
			}
		} else {
			beatCountdown--;
			if (beatCountdown <= 0) {
				isPausing = false;
			}
		}
	}
	
	this.play = function() {
		this.isPlaying = true;
		
		var phraseID = Math.floor(Math.random() * phrases.length);
		console.log('initial phrase: ' + phraseID);
		phrase2Play = phrases[phraseID];
		
		var nextBeatSinceEpoch = this.msPerBeat - (Date.now() % this.msPerBeat);
		beat(nextBeatSinceEpoch);
		startTimeInContext = Math.floor(this.instrument1.outputNode.context.currentTime * 1000.) + nextBeatSinceEpoch;
		console.log(startTimeInContext);
		
		this.numberOfReps = Math.floor(((this.maxReps - this.minReps) + 1) * Math.random() + this.minReps);
		if (this.startWithPause) {
			//var pauseDur = (that.maxPause - that.minPause) * Math.random() + that.minPause;
			//timerID = window.setTimeout(tickDownIntermittentSound, pauseDur * 1000.);
		} else {
			//tickDownIntermittentSound();
		}
		schedulerTimerID = window.setTimeout(scheduler, nextBeatSinceEpoch);
	}
	
	this.stop = function() {
		if (this.isPlaying) {
			window.clearTimeout(timerID);
			window.clearTimeout(schedulerTimerID);
			this.isPlaying = false;
			//before you had this in a separate private function, don't see a benefit, but fyi
			//finishedPlaying();
			if (this.completionCallback) {
				this.completionCallback();
			}
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
}

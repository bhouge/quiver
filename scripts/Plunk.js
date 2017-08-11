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
	
	
	// private variables
	
	// Douglas Crockford told me to do this: http://www.crockford.com/javascript/private.html
	// It's a convention that allows private member functions to access the object
	// due to an error in the ECMAScript Language Specification
	var that = this;
	
	var timerID;
	
	//just for testing
	var currentNote = 60;
	//let's define notes as pitch (MIDI), volume (0-1), duration (in beats)
	var phrase2Play = [[60, 1., 1], [62, 0.8, 1], [64, 0.5, 2], [60, 0.35, 1], [67, 1., 2], [59, 0.65, 1]];
	var noteIndex = 0;
	//this is in beats
	var durationOfSecondNote = 3;
	var counter = 0;
	
	// making this a private member function
	function tickDownIntermittentSound() {
		if (counter <= 0) {
			var note2Play = phrase2Play[noteIndex][0];
			//var octave = (Math.floor(4 * Math.random()) - 1) * 12;
			var octave = 0;
			//note2Play = currentNote;
			var offset1 = Math.random() * 0.125;
			var offset2 = Math.random() * 0.125;
			
			var vol = phrase2Play[noteIndex][1];
			//var pianoVol = Math.random();
			//var nyatitiVol = 1. - pianoVol;
			//var offset = 0;
			
			var piano = this.piano;
			var nyatiti = this.nyatiti;
			piano.playNote(note2Play + octave, vol, 1., offset1);
			//54.093589 is the base MIDI note for 186Hz baseFreq of kora
			nyatiti.playNote(note2Play + octave, vol, 1., offset2);

			noteIndex++;
			if (noteIndex >= phrase2Play.length) {
				noteIndex = 0;
			}
			//counter = Math.floor(5 * Math.random()) + 3;
			counter = phrase2Play[noteIndex][2];
			//counter = 3;
		}
		//if (that.numberOfReps > 0 && that.isPlaying) {
		if (that.isPlaying) {
			timerID = window.setTimeout(tickDownIntermittentSound, that.msPerBeat);
		} else {
			//fix this later
			//timerID = window.setTimeout(finishedPlaying, (bufferDur/pitch) * 1000.);
		}
		that.numberOfReps--;
		
		counter--;
		
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
	
	this.stop = function() {
		if (this.isPlaying) {
			window.clearTimeout(timerID);
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

/**
 * Plunk
 * by Ben Houge
 * Playing some phrases...
 * It will be neato.
 */

// creating an intermittentSound object with an object constructor
function Plunk(instrument, bpm, ticksPerBeat, minPause, maxPause, minReps, maxReps, completionCallback) {
	//alert(this);
	this.instrument = instrument;
	this.msPerBeat = (60000. / (bpm * ticksPerBeat));

	this.isPlaying = false;
	
	//I don't think I need this...
	this.completionCallback = completionCallback;
	
	// private variables
	// Douglas Crockford told me to do this: http://www.crockford.com/javascript/private.html
	// It's a convention that allows private member functions to access the object
	// due to an error in the ECMAScript Language Specification
	var that = this;
	
	//scheduler variables
	var schedulerTimerID;
	var startTimeInContext = 0;
	var lookAheadTime = 500;
	var schedulerInterval = 100;
	var beats = [];

	//layer 1 variables
	//let's define notes as metric duration (in beats), pitch (MIDI), volume (0-1), sounding duration
	
	var layer1Phrases = [
	               [[1, 60, 1., 1], [1, 62, 0.8, 1], [2, 64, 0.5, 2], [1, 60, 0.35, 1], [2, 67, 1., 2], [1, 59, 0.65, 1]],
	               [[1, 72, 1., 1], [1, 71, 0.8, 1], [2, 69, 0.5, 2], [1, 71, 0.35, 1], [2, 67, 1., 2], [1, 62, 0.65, 1]],
	               [[2, 65, 0.8, 2], [1, 64, 0.5, 1], [1, 62, 0.9, 1], [1, 61, 0.25, 1], [1, 60, 1., 1], [1, 59, 1., 1], [1, 67, 0.65, 1]],
	               [[2, 65, 0.7, 2], [1, 64, 0.5, 1], [2, 62, 0.8, 2]],
	               [[2, 64, 0.8, 2], [1, 65, 0.3, 1], [1, 66, 0.7, 1], [1, 67, 0.6, 1], [1, 66, 0.7, 1], [1, 67, 0.6, 1], [1, 66, 0.7, 1], [1, 67, 0.6, 1]],
	               [[1, 69, 0.8, 1], [1, 67, 0.7, 1], [1, 64, 0.5, 1], [2, 67, 0.85, 2], [1, 69, 0.5, 1], [2, 64, 0.75, 2]]
	               ];
	               
	
	//ok, potentially very stupid, but let's give it a quick go...
	//but first, get this synced response to button press working...
	
	var layer1 = new PhrasePlayer(layer1Phrases, 0, 0, 0, 0, 8, 12);
	
	var layer2Phrases = [
	               [[1, 48, 1., 1], [2, 50, 0.8, 1]],
	               [[1, 47, 1., 1], [2, 48, 0.8, 1]],
	               [[1, 48, 1., 1], [2, 52, 0.8, 1]]
	               ];
	
	var layer2 = new PhrasePlayer(layer2Phrases, 2, 5, 3, 5, 5, 8);

	
	function scheduler() {
		if (that.isPlaying) {
			//I feel like I should be doing this for every note that falls within lookAheadTime
			//I am not, and yet it still works; at some point investigate why...
			//console.log("ms since context created:" + Math.floor(that.instrument1.outputNode.context.currentTime * 1000.));
			var msSincePlay = (Math.floor(that.instrument.outputNode.context.currentTime * 1000.) - startTimeInContext);
			//console.log("ms since behavior started:" + msSincePlay);
			if (msSincePlay >= 0) {
				var msSinceLastBeat = msSincePlay % that.msPerBeat;
				if (msSinceLastBeat + lookAheadTime > that.msPerBeat) {
					var beatCount = Math.floor(msSincePlay / that.msPerBeat) % 10;
					var timeToNextBeat = that.msPerBeat - msSinceLastBeat;
					if (beats[beatCount] != msSincePlay + timeToNextBeat) {
						//console.log("beat " + beatCount + " in " + timeToNextBeat + " ms!");
						beat(that.msPerBeat - (msSincePlay % that.msPerBeat));
						beats[beatCount] = msSincePlay + timeToNextBeat;
					} 				
				}
			}
			//console.log("msSincePlay % that.msPerBeat:" + msSincePlay % that.msPerBeat);
			//if (msSincePlay % that.msPerBeat)
			schedulerTimerID = window.setTimeout(scheduler, schedulerInterval);
		}
	}
	
	function beat(msUntilBeat) {
		//do this for each layer
		//layer 1
		var noteToPlay;
		noteToPlay = layer1.beat();
		if (noteToPlay) {
			var note2Play = noteToPlay[1];
			//var octave = (Math.floor(2 * Math.random()) + 1) * 12;
			var octave = 0;
			var offset = Math.random() * 0.125;
			//var offset2 = Math.random() * 0.125;
			var vol = noteToPlay[2];
			instrument.playNote(msUntilBeat, note2Play + octave, vol, 0.5, offset);
			if (noteToPlay.length >= 5) {
				console.log('end of phrase, time to stop!');
				that.stop();
			}
		}
		/*
		//layer 2
		noteToPlay = layer2.beat();
		if (noteToPlay) {
			var note2Play = noteToPlay[1];
			//var octave = (Math.floor(2 * Math.random()) + 1) * 12;
			var octave = 0;
			var offset = Math.random() * 0.125;
			//var offset2 = Math.random() * 0.125;
			var vol = noteToPlay[2];
			instrument.playNote(msUntilBeat, note2Play + octave, vol, 0.5, offset);
		}
		*/
	}
	
	this.play = function() {
		this.isPlaying = true;
		
		var timeToNextBeatSinceEpoch = this.msPerBeat - (Date.now() % this.msPerBeat);
		beat(timeToNextBeatSinceEpoch);
		startTimeInContext = Math.floor(this.instrument.outputNode.context.currentTime * 1000.) + timeToNextBeatSinceEpoch;
		console.log(startTimeInContext);
		
		schedulerTimerID = window.setTimeout(scheduler, timeToNextBeatSinceEpoch);
	}
	
	//a better implementation would keep calling beat() until all layers report the end of a phrase
	this.stop = function() {
		if (this.isPlaying) {
			window.clearTimeout(schedulerTimerID);
			this.isPlaying = false;
			//before you had this in a separate private function, don't see a benefit, but fyi
			//finishedPlaying();
			if (this.completionCallback) {
				this.completionCallback();
			}
		}
	}
}

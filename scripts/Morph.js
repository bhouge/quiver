/**
 * Morph
 * by Ben Houge
 * Music for the second course of QPD
 * Highlighting the morphology of tastes within one (in this case quite complex) bite
 */

// creating an intermittentSound object with an object constructor
function Morph(buffers) {
	//alert(this);
	//omg, is this the dumbest thing ever? 
	//Everything's by reference, so why not just pass in the whole audioBuffers object?
	//You save nothing by only passing in the buffers you think you need
	//(in fact, you actually create extra unnecessary references by doing so!
	//why didn't you think of this much sooner?
	this.buffers = buffers;
	
	//you know what? I'm going to delete all this and start over...
	
	this.isPlaying = false;
	
	
	// private variables
	// Douglas Crockford told me to do this: http://www.crockford.com/javascript/private.html
	// It's a convention that allows private member functions to access the object
	// due to an error in the ECMAScript Language Specification
	var that = this;
	
	//scheduler variables
	var schedulerTimerID;
	
	//baseFreq 523.251131 Hz is MIDI note 72 (C above middle C, not sure why wave file is mislabeled)
	//that's fade in, fade out, right? Right
	count = new MIDIInstrument(this.buffers.accordionLow, 440.0, 5., 5.);
	count.Q = 10.;
	//count.filterGain = 25.0;
	//console.log(leadingToneTuning);
	//this is kind of scary, relying not only on the definition of MIDIInstrument
	//but also the definition of leadingToneTuning from the parent object...
	//maybe there's a better way, but for now, let's just get it done!
	count.retuningMap = leadingToneTuning;
	count.basePitchForRetuning = 0;
	count.connect(gainNode);
	
	this.play = function() {
		this.isPlaying = true;
		
		console.log('playing!');
		//ok, pick this up later, encapsulate it...
		//something wrong with envelope...
		//also with multiple button presses (decide if this should be possible)
		//function(msUntilStart, midiNote, volume, duration, startTime)
		var noteToPlay = Math.random() * 24.0 + 69.0;
		count.playNoteWithFilter(100, noteToPlay, 0.4, 30., 1.45);
		
		//schedulerTimerID = window.setTimeout(scheduler, timeToNextBeatSinceEpoch);
	}
	
	//a better implementation would keep calling beat() until all layers report the end of a phrase
	this.stop = function() {
		if (this.isPlaying) {
			console.log('stopping!');
			//window.clearTimeout(schedulerTimerID);
			this.isPlaying = false;
		}
	}
}

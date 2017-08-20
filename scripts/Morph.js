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
	
	
	
	this.play = function() {
		this.isPlaying = true;
		
		//baseFreq 523.251131 Hz is MIDI note 72 (C above middle C, not sure why wave file is mislabeled)
		//that's fade in, fade out, right? Right
		//go back to accordionLow
		accordion = new MIDIInstrument(this.buffers.accordionLow, 440.0, 5., 5.);
		accordion.Q = 10.;
		//count.filterGain = 25.0;
		//console.log(leadingToneTuning);
		//this is kind of scary, relying not only on the definition of MIDIInstrument
		//but also the definition of leadingToneTuning from the parent object...
		//maybe there's a better way, but for now, let's just get it done!
		accordion.retuningMap = leadingToneTuning;
		accordion.basePitchForRetuning = 0;
		accordion.connect(gainNode);
		
		accordion.pitchCurve = generateRandomCurve(4, 8, 0.9, 1.2, 0.2);
		//console.log('accordion pitchCurve: ' + accordion.pitchCurve);
		
		accordion.volumeCurve = generateRandomCurve(3, 6, 0.2, 1., 0.25, 0.);
		//console.log('accordion volumeCurve: ' + accordion.volumeCurve);
		
		accordion.filterCurve = generateRandomCurve(3, 9, 500., 20000., 0.5, 500.);
		
		//console.log('playing!');
		//ok, pick this up later, encapsulate it...
		//something wrong with envelope...
		//also with multiple button presses (decide if this should be possible)
		//function(msUntilStart, midiNote, volume, duration, startTime)
		var noteToPlay = Math.random() * 24.0 + 69.0;
		
		//generate envelopes and attach them to count
		
		accordion.playNoteWithFilter(100, noteToPlay, 0.4, 30., 1.45);
		
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
	
	function generateRandomCurve(minStages, maxStages, minValue, maxValue, stepPercent, startValue) {
		//var newCurve = [[0.0, Math.random() * (maxValue - minValue) + minValue], 
		//                [1.0, Math.random() * (maxValue - minValue) + minValue]];
		console.log('minValue: ' + minValue + '; maxValue: ' + maxValue + '; stepPercent: ' + stepPercent);
		var stepSize = stepPercent * (maxValue - minValue);
		console.log('stepSize: ' + stepSize);
		var newCurve = [];
		var drunkValue;
		if (typeof startValue != 'undefined') {
			drunkValue = startValue;
		} else {
			drunkValue = Math.random() * (maxValue - minValue) + minValue;
		}
		console.log('initial drunkValue: ' + drunkValue);
		var numberOfStages = Math.floor(Math.random() * (1 + maxStages - minStages)) + minStages;
		for (var i = 0; i <= numberOfStages; i++) {
			//console.log('i ' + i + ' is less than numberOfStages ' + numberOfStages);
			var newX = i / numberOfStages;
			var newY = drunkValue;
			newCurve.push([newX, newY]);
			var newDrunkValue = drunkValue + (2 * stepSize * Math.random()) - stepSize;
			console.log('newDrunkValue: ' + newDrunkValue);
			if (newDrunkValue > maxValue) {
				drunkValue = maxValue - stepSize * Math.random();
			} else if (newDrunkValue < minValue) {
				drunkValue = minValue + stepSize * Math.random();
			} else {
				drunkValue = newDrunkValue;
			}
			console.log('drunkValue: ' + drunkValue);
		}
		newCurve.sort();
		if (typeof startValue != 'undefined') {
			newCurve[0][1] = startValue;
			newCurve[newCurve.length-1][1] = startValue;
		}
		return newCurve;
	}
}

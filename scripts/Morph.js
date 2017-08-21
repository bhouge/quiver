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
	var timeAtStart;
	var totalDurationInSecs;
	
	//high level probabilities
	var midiNoteCurve = [[0, 96], [1, 36]];
	var bufferProbsMax = [[0.0, 3],[0.25, 3],[0.55, 2],[0.85, 1],[1.0, 0]];
	var bufferProbsMin = [[0.0, 3],[0.45, 2],[0.65, 1],[0.75, 0],[1.0, 0]];
	
	function tickDownIntermittentSound() {
		if (gainNode.context.currentTime < (timeAtStart + totalDurationInSecs)) {
			playPhrase();
			//var pauseDur = (that.maxPause - that.minPause) * interpolate(percentDone, that.pauseCurve) + that.minPause;
			//console.log('pauseDur: ' + pauseDur);
			var timeUntilNextPhrase = Math.random() * 10000. + 10000.;
			schedulerTimerID = window.setTimeout(tickDownIntermittentSound, timeUntilNextPhrase);
		} else {
			console.log('stopping!');
			window.clearTimeout(schedulerTimerID);
			this.isPlaying = false;
		}
	}
	
	function playPhrase() {
		var percentDone = (gainNode.context.currentTime - timeAtStart) / totalDurationInSecs;
		//baseFreq 523.251131 Hz is MIDI note 72 (C above middle C, not sure why wave file is mislabeled)
		//that's fade in, fade out, right? Right
		//go back to accordionLow
		
		var buffer;
		var interpolatedBufferValue = tendencyMask(percentDone, bufferProbsMax, bufferProbsMin);
		var roundedBufferValue = Math.floor(interpolatedBufferValue + 0.5);
		console.log('percentDone: ' + percentDone + '; interpolatedValue: ' + interpolatedBufferValue + '; roundedBufferValue: ' + roundedBufferValue);
		
		switch(roundedBufferValue) {
		case 0:
			buffer = 'accordionLow';
			break;
		case 1:
			buffer = 'accordionHigh';
			break;
		case 2:
			buffer = 'rattle';
			break;
		case 3:
			buffer = 'windchimes';
			break;
		}
		
		phrase = new MIDIInstrument(that.buffers[buffer], 440.0, 5., 5.);
		
		//console.log('buffer duration: ' + that.buffers[buffer].duration);
		//totally arbitrarily capping at 75% of the buffer, some get quiet at the end
		
		phrase.loopStart = Math.random() * that.buffers[buffer].duration * 0.75 + 1.0;
		//console.log('loopStart: ' + phrase.loopStart);
		phrase.loopDur = Math.random() * 0.1 + 0.025;
		
		phrase.Q = 10.;
		//count.filterGain = 25.0;
		//console.log(leadingToneTuning);
		//this is kind of scary, relying not only on the definition of MIDIInstrument
		//but also the definition of leadingToneTuning from the parent object...
		//ooh, and also the definition of gainNode!
		//maybe there's a better way, but for now, let's just get it done!
		phrase.retuningMap = leadingToneTuning;
		phrase.basePitchForRetuning = 0;
		phrase.connect(gainNode);
		
		phrase.pitchCurve = generateRandomCurve(4, 8, 0.9, 1.2, 0.2);
		//console.log('accordion pitchCurve: ' + accordion.pitchCurve);
		
		phrase.volumeCurve = generateRandomCurve(3, 6, 0.2, 1., 0.25, 0.);
		//console.log('accordion volumeCurve: ' + accordion.volumeCurve);
		
		phrase.filterCurve = generateRandomCurve(3, 9, 500., 10000., 0.5, 500.);
		
		//console.log('playing!');
		//ok, pick this up later, encapsulate it...
		//something wrong with envelope...
		//also with multiple button presses (decide if this should be possible)
		//function(msUntilStart, midiNote, volume, duration, startTime)
		
		//var noteToPlay = Math.random() * 24.0 + 69.0;
		var noteToPlay = interpolate(percentDone, midiNoteCurve);
		console.log('noteToPlay: ' + noteToPlay);
		
		//generate envelopes and attach them to count
		var phraseDur = Math.random() * 15. + 30.;
		
		phrase.playNoteWithFilter(100, noteToPlay, 1.0, phraseDur, 1.45);
	}
	
	this.play = function(dur) {
		this.isPlaying = true;
		totalDurationInSecs = dur;
		timeAtStart = gainNode.context.currentTime;
		playPhrase();
		var timeUntilNextPhrase = Math.random() * 10000. + 10000.;
		schedulerTimerID = window.setTimeout(tickDownIntermittentSound, timeUntilNextPhrase);
	}
	
	//a better implementation would keep calling beat() until all layers report the end of a phrase
	this.stop = function() {
		if (this.isPlaying) {
			console.log('stopping!');
			window.clearTimeout(schedulerTimerID);
			this.isPlaying = false;
		}
	}
	
	function generateRandomCurve(minStages, maxStages, minValue, maxValue, stepPercent, startValue) {
		//var newCurve = [[0.0, Math.random() * (maxValue - minValue) + minValue], 
		//                [1.0, Math.random() * (maxValue - minValue) + minValue]];
		//console.log('minValue: ' + minValue + '; maxValue: ' + maxValue + '; stepPercent: ' + stepPercent);
		var stepSize = stepPercent * (maxValue - minValue);
		//console.log('stepSize: ' + stepSize);
		var newCurve = [];
		var drunkValue;
		if (typeof startValue != 'undefined') {
			drunkValue = startValue;
		} else {
			drunkValue = Math.random() * (maxValue - minValue) + minValue;
		}
		//console.log('initial drunkValue: ' + drunkValue);
		var numberOfStages = Math.floor(Math.random() * (1 + maxStages - minStages)) + minStages;
		for (var i = 0; i <= numberOfStages; i++) {
			//console.log('i ' + i + ' is less than numberOfStages ' + numberOfStages);
			var newX = i / numberOfStages;
			var newY = drunkValue;
			newCurve.push([newX, newY]);
			var newDrunkValue = drunkValue + (2 * stepSize * Math.random()) - stepSize;
			//console.log('newDrunkValue: ' + newDrunkValue);
			if (newDrunkValue > maxValue) {
				drunkValue = maxValue - stepSize * Math.random();
			} else if (newDrunkValue < minValue) {
				drunkValue = minValue + stepSize * Math.random();
			} else {
				drunkValue = newDrunkValue;
			}
			//console.log('drunkValue: ' + drunkValue);
		}
		newCurve.sort();
		if (typeof startValue != 'undefined') {
			newCurve[0][1] = startValue;
			newCurve[newCurve.length-1][1] = startValue;
		}
		return newCurve;
	}
	
	//these should not be copied! Put them somewhere global!
	function interpolate(value, curve) {
		//remember, expecting curve to be an array of breakpoints (i.e., two-element arrays)
		//we should clip it on the ends...
		//console.log('value: ' + value + '; curve: ' + curve + '; curve.length: ' + curve.length);
		var interpolatedValue;
		if (value < curve[0][0]) {
			interpolatedValue = curve[0][1];
		} else if (value > curve[curve.length - 1][0]) {
			interpolatedValue = curve[curve.length - 1][1];
		} else {
			for (var i = 0; i < curve.length; i++) {
				if (value < curve[i][0]) {
					//console.log('value ' + value + ' is less than curve[i][0] ' + curve[i][0]);
					//console.log('value - curve[i-1][0] is ' + (value - curve[i-1][0]));
					//console.log('curve[i][0] - curve[i-1][0] is ' + (curve[i][0] - curve[i-1][0]));
					var percentageThroughStage = (value - curve[i-1][0]) / (curve[i][0] - curve[i-1][0]);
					//console.log('percentage through stage: ' + percentageThroughStage);
					interpolatedValue = (percentageThroughStage * (curve[i][1] - curve[i-1][1])) + curve[i-1][1];
					//console.log('interpolated value: ' + interpolatedValue);
					return interpolatedValue;
				}
			}
		}
		return interpolatedValue;
	}
	
	function tendencyMask(value, curve1, curve2) {
		var val1 = interpolate(value, curve1);
		var val2 = interpolate(value, curve2);
		var result = (Math.random() * (val1 - val2)) + val2;
		return result;
	}
}

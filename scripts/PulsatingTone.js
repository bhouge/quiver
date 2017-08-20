/**
 * PulsatingTone
 * by Ben Houge
 * Variation of IntermittentSound
 */

// think about what we want to define
//buffer, duration, min/max duration of pulses, min/max pause between pulses, min/max offset percentage into buffer
//that would give us the texture, but also need to give it shape
//min/max detune
//maybe rather than in time, out time, let's pass in breakpoint envelopes
//can be different for each one, some nice variation
//min/max detune envelopes, min/max vol, min/max duration
//could even do envelopes
//is this insane? what can we actually do with the IntermittentSound as is?

//ok, this is a horrible, bastard thing, but it will kind of make the sound I want to hear
//I PROMISE to clean it up later!

function PulsatingTone(buffer, minPause, maxPause, minVol, maxVol, minDur, maxDur, minDetune, maxDetune, pitchArray, startWithPause, completionCallback) {
	//alert(this);
	this.buffer = buffer;
	this.minPause = minPause;
	this.maxPause = maxPause;
	this.minVol = minVol;
	this.maxVol = maxVol;
	this.minDur = minDur;
	this.maxDur = maxDur;
	this.outputNode;
	this.isPlaying = false;
	this.minDetune = minDetune;
	this.maxDetune = maxDetune;
	this.pitchArray = pitchArray;
	this.startWithPause = startWithPause;
	this.completionCallback = completionCallback;
	
	
	
	
	//this.volCurve = [[0.0, 0.0], [0.5, 1.0], [1.0, 0.0]];
	//this.detuneCurve = [[0.0, 0.0], [0.4, 0.0], [0.5, 1.0], [0.6, 0.0], [1.0, 0.0]];
	//minStages, maxStages, minValue, maxValue
	this.volCurve = generateRandomCurve(3, 7, 0., 1.);
	//console.log('volume curve: ' + this.volCurve);
	this.volCurve[0] = [0.0, 0.0];
	this.volCurve[this.volCurve.length-1] = [1.0, 0.0];
	//console.log('volume curve: ' + this.volCurve);
	this.detuneCurve = generateRandomCurve(2, 6, 0., 1.);
	//console.log('detune curve: ' + this.detuneCurve);
	this.durationCurve = generateRandomCurve(2, 4, 0., 1.);
	this.pauseCurve = generateRandomCurve(2, 7, 0., 1.);
	
	
	
	this.dur = Math.random() * (this.maxDur - this.minDur) + this.minDur;
	if (this.dur > this.buffer.duration) {
		this.dur = this.buffer.duration;
		this.startTime = 0;
	} else {
		this.startTime = Math.random() * (this.buffer.duration - this.dur);
	}
	
	// private variables
	var timerID;
	// Douglas Crockford told me to do this: http://www.crockford.com/javascript/private.html
	// It's a convention that allows private member functions to access the object
	// due to an error in the ECMAScript Language Specification
	var that = this;
	
	var startTimeInContext;
	
	function generateRandomCurve(minStages, maxStages, minValue, maxValue) {
		var newCurve = [[0.0, Math.random() * (maxValue - minValue) + minValue], 
		                [1.0, Math.random() * (maxValue - minValue) + minValue]];
		var numberOfStages = Math.floor(Math.random() * (1 + maxStages - minStages)) + minStages;
		for (var i = 1; i < numberOfStages; i++) {
			//console.log('i ' + i + ' is less than numberOfStages ' + numberOfStages);
			var newX = Math.random();
			var newY = Math.random() * (maxValue - minValue) + minValue;
			newCurve.push([newX, newY]);
		}
		return newCurve.sort();
	}
	
	function playBuffer(bufferIndex, volume, pitch, startTime, dur) {
		//somewhere in here we should probably error check to make sure an outputNode with an audioContext is connected
		var newNow = that.outputNode.context.currentTime + 0.1;
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
			
			audioBufferGain.gain.linearRampToValueAtTime(0.0, newNow);
			audioBufferGain.gain.linearRampToValueAtTime(volume, newNow + 0.05);
			audioBufferGain.gain.linearRampToValueAtTime(volume, newNow + dur - 0.05);
			audioBufferGain.gain.linearRampToValueAtTime(0.0, newNow + dur);
			
			audioBufferSource.start(newNow, startTime, dur);
		} catch(e) {
			alert(e);
		}		
	}
	
	// making this a private member function
	function tickDownIntermittentSound() {
		//calculate how far we are into overall tone
		var percentDone = (that.outputNode.context.currentTime - startTimeInContext) / that.duration;
		//console.log('this far through: ' + percentDone);
		var interpolatedVolume = interpolate(percentDone, that.volCurve);
		//console.log('interpolated volume: ' + interpolatedVolume);
		var volume = ((that.maxVol - that.minVol) * Math.random() + that.minVol) * interpolatedVolume;
		var pitchIndex = Math.floor(Math.random() * that.pitchArray.length); 
		var pitch = pitchClassToMultiplier(that.pitchArray[pitchIndex][0], that.pitchArray[pitchIndex][1]);
		var interpolatedDetune = interpolate(percentDone, that.detuneCurve);
		var randomDetune = Math.random() * (that.maxDetune - that.minDetune) + that.minDetune; 
		var detuneAmount = (interpolatedDetune * (randomDetune - 1.0)) + 1.0;
		pitch *= detuneAmount;
		var dur = Math.random() * interpolate(percentDone, that.durationCurve) * (that.maxDur - that.minDur) + that.minDur;
		var startTime = Math.random() * (that.buffer.duration - dur * pitch);
		playBuffer(that.buffer, volume, pitch, startTime, dur);
		//var bufferDur = that.buffer.duration;
		// not anymore, now I'm specifying this, right?
		var bufferDur = dur;
		//console.log('startTimeInContext: ' + startTimeInContext + '; elapsed time: ' + that.outputNode.context.currentTime);
		if (that.outputNode.context.currentTime < (startTimeInContext + that.duration)) {
			var pauseDur = (that.maxPause - that.minPause) * interpolate(percentDone, that.pauseCurve) + that.minPause;
			//console.log('pauseDur: ' + pauseDur);
			timerID = window.setTimeout(tickDownIntermittentSound, (pauseDur + bufferDur/pitch) * 1000.);
		} else {
			timerID = window.setTimeout(finishedPlaying, (bufferDur/pitch) * 1000.);
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
	
	this.play = function(duration) {
		startTimeInContext = this.outputNode.context.currentTime;
		console.log('startTimeInContext: ' + startTimeInContext);
		this.duration = duration;
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

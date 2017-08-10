/**
 * MIDIInstrument
 * by Ben Houge
 * A basic Web Audio, sample-based MIDI instrument
 * Set the buffer, base frequency, and envelope (fade in/fade out)
 * Send play requests with MIDI note, volume (0-1), and duration 
 * Designed for generative use, when duration is known at note inception, not live MIDI performance 
 * Optionally specify how far into the sample buffer to start reading (in percentage of overall duration) 
 * Supports microtonality with fractional MIDI notes, also with a remapping look-up table
 * Mono only for now (as this is designed to play back on a mobile phone)
 * Optional completion callback when note is finished
 */

// creating an intermittentSound object with an object constructor
function MIDIInstrument(buffer, baseFreq, fadeIn, fadeOut, completionCallback) {
	//alert(this);
	this.buffer = buffer;
	this.baseFreq = baseFreq;
	this.fadeIn = fadeIn;
	this.fadeOut = fadeOut;
	this.completionCallback = completionCallback;
	this.basePitchForRetuning = 0;
	this.retuningMap = [];
	
	// private variables
	// Douglas Crockford told me to do this: http://www.crockford.com/javascript/private.html
	// It's a convention that allows private member functions to access the object
	// due to an error in the ECMAScript Language Specification
	var that = this;
	var timerID;
	
	function midiNoteToMultiplier(midiNote) {
		var multiplier;
		//var scaleDegree = midiNote % 12;
		var scaleDegree = ((midiNote + 12) - that.basePitchForRetuning) % 12;
		console.log('MIDI note ' + midiNote + ' is scale degree ' + scaleDegree);
		var octave = Math.floor((midiNote - that.basePitchForRetuning) / 12);
		console.log('octave: ' + octave);
		
		var ratioToBaseNote;
		if (that.retuningMap[scaleDegree]) {
			ratioToBaseNote = that.retuningMap[scaleDegree];
		} else {
			ratioToBaseNote = Math.pow(2., scaleDegree / 12.);
		}
		console.log('ratio of desired note to base note: ' + ratioToBaseNote);
		
		var scaleDegreeOfReferenceNote = (69 - that.basePitchForRetuning) % 12;
		var octaveOfReferenceNote = Math.floor((69. - that.basePitchForRetuning) / 12.);
		
		var ratioOfReferenceToBaseNote;
		if (that.retuningMap[scaleDegreeOfReferenceNote]) {
			ratioOfReferenceToBaseNote = that.retuningMap[scaleDegreeOfReferenceNote];
		} else {
			ratioOfReferenceToBaseNote = Math.pow(2., scaleDegreeOfReferenceNote / 12.);
		}
		
		console.log('ratio of reference note to base note: ' + ratioOfReferenceToBaseNote);
		
		multiplier = ratioToBaseNote * ((440. / that.baseFreq) / ratioOfReferenceToBaseNote) * Math.pow(2., octave - octaveOfReferenceNote);
		
		//multiplier = Math.pow(2., (midiNote - 69.) / 12.) * (440. / that.baseFreq);
		return multiplier;
	}
	
	/*
	function midiNoteToMultiplier(midiNote) {
		var multiplier;
		if (that.retuningMap.length > 0) {
			console.log('There is a retuning map.');
			var scaleDegree = (midiNote + that.basePitchForRetuning) % 12;
			console.log('MIDI note ' + midiNote + ' is scale degree ' + scaleDegree + '.');
			if (that.retuningMap[scaleDegree]) {
				var scaleDegreeMultiplier = that.retuningMap[scaleDegree]; 
				console.log('The multiplier is ' + scaleDegreeMultiplier + '.');
				//this needs to get multiplied by
				var octave = Math.floor(midiNote + that.basePitchForRetuning / 12.);
				//multiplier = Math.pow(2., (midiNote - 69.) / 12.) * (440. / that.baseFreq);
			} else {
				multiplier = Math.pow(2., (midiNote - 69.) / 12.) * (440. / that.baseFreq);
			}
		} else {
			multiplier = Math.pow(2., (midiNote - 69.) / 12.) * (440. / that.baseFreq);
		}
		return multiplier;
	}
	*/
	
	//Should fire when all notes are done?
	function finishedPlaying() {
		//console.log("Done!");
		if (that.completionCallback) {
			that.completionCallback();
		}
	}
	
	this.playNote = function(midiNote, volume, duration, startTime) {
		//somewhere in here we should probably error check to make sure an outputNode with an audioContext is connected
		//var newNow = that.outputNode.context.currentTime + 0.1;
		//var pitchMultiplier = pitchClassToMultiplier(that.pitchArray[pitchIndex][0], that.pitchArray[pitchIndex][1]);
		var audioBufferSource = that.outputNode.context.createBufferSource();
		audioBufferSource.buffer = that.buffer;
		var pitch = midiNoteToMultiplier(midiNote);
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
		//console.log("User-agent header sent: " + navigator.userAgent);
		//maybe this could help? https://source.android.com/devices/audio/latency_measurements
		var timeToStart = that.outputNode.context.currentTime + 0.05;
		
		//if duration is less than sum of fade times, scale fade times down proportionately
		var fadeIn;
		var fadeOut;
		if ((that.fadeIn + that.fadeOut) > duration) {
			var scalePercent = duration / (that.fadeIn + that.fadeOut);
			fadeIn = that.fadeIn * scalePercent;
			fadeOut = that.fadeOut * scalePercent;
		} else {
			fadeIn = that.fadeIn;
			fadeOut = that.fadeOut;
		}
		
		try {
			audioBufferGain.gain.linearRampToValueAtTime(0.0, timeToStart);
			audioBufferGain.gain.linearRampToValueAtTime(volume, timeToStart + fadeIn);
			audioBufferGain.gain.linearRampToValueAtTime(volume, timeToStart + (duration - fadeOut));
			audioBufferGain.gain.linearRampToValueAtTime(0.0, timeToStart + duration);
			//unless there's something I'm missing here, duration (in start call) gets scaled with pitch, i.e., duration of buffer
			//so if you want duration to not scale with pitch, you should multiply it by pitch, which I was not doing before.
			audioBufferSource.start(timeToStart, startTime, duration * pitch);
		} catch(e) {
			alert(e);
		}
		timerID = window.setTimeout(finishedPlaying, duration * 1000.);
	}
	
	//think about this...do you need a stop function?
	//if you do, you need to hang on to every note you've launched keep track of when it ends to know what's playing
	//so that you can send it a stop message
	//you could do this in an array
	//maybe this is not important...you're not going to get stuck MIDI notes, since you're specifying duration at note start
	//it would only be useful when you stupidly ask for a really long note, in which case, just refresh the page, no? 
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
}

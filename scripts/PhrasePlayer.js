/**
 * PhrasePlayer
 * by Ben Houge
 * A basic sequencer sort of thing.
 * It will pick one of its phrases and play it, pausing in between
 * Phrases are arrays of notes, and notes are also arrays of flexible note parameters
 * The only requirement of note parameters is that the first element must be duration in beats
 */

// creating a PhrasePlayer object with an object constructor
function PhrasePlayer(phrases, minPause, maxPause) {
	this.phrases = phrases;
	this.minPause = minPause;
	this.maxPause = maxPause;
	
	//you could add a pause beat multiple if you wanted to add a sense of meter, which I typically don't
	
	// private variables
	// Douglas Crockford told me to do this: http://www.crockford.com/javascript/private.html
	// It's a convention that allows private member functions to access the object
	// due to an error in the ECMAScript Language Specification
	var that = this;
	
	var beatCountdown = 0;
	var currentPhraseIndex = 0;
	var noteIndex = 0;
	var isPausing = 0;
	
	this.beat = function() {
		console.log('beat');
		if (!isPausing) {
			beatCountdown--;
			if (beatCountdown <= 0) {
				var noteToPlay = this.phrases[currentPhraseIndex][noteIndex];
				console.log('currentNote: ' + noteToPlay);
				
				//all of this goes in the parent musical behavior:
				//var note2Play = this.phrases[currentPhraseIndex][noteIndex][0];
				//var octave = (Math.floor(2 * Math.random()) + 1) * 12;
				//var octave = 0;
				//var offset = Math.random() * 0.125;
				//var offset2 = Math.random() * 0.125;
				//var vol = phrase2Play[noteIndex][1];
				
				//will change this to be 0, not 2
				beatCountdown = this.phrases[currentPhraseIndex][noteIndex][0];
				
				noteIndex++;
				if (noteIndex >= this.phrases[currentPhraseIndex].length) {
					currentPhraseIndex = Math.floor(Math.random() * this.phrases.length);
					//console.log('next phrase: ' + phraseID);
					noteIndex = 0;
					beatCountdown = Math.floor((1 + that.maxPause - that.minPause) * Math.random()) + that.minPause;
					if (beatCountdown > 0) {
						isPausing = true;
					}
				}
				return noteToPlay;
			}
		} else {
			beatCountdown--;
			if (beatCountdown <= 0) {
				isPausing = false;
			}
		}
	}
}

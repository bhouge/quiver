/**
 * PhrasePlayer
 * by Ben Houge
 * A basic sequencer sort of thing.
 * It will pick one of its phrases and play it, pausing in between
 * Phrases are arrays of notes, and notes are also arrays of flexible note parameters
 * The only requirement of note parameters is that the first element must be duration in beats
 */

// creating a PhrasePlayer object with an object constructor
function PhrasePlayer(phrases, minPause, maxPause, minReps, maxReps, minVolleyPause, maxVolleyPause) {
	this.phrases = phrases;
	this.minPause = minPause;
	this.maxPause = maxPause;
	this.minReps = minReps;
	this.maxReps = maxReps;
	this.minVolleyPause = minVolleyPause;
	this.maxVolleyPause = maxVolleyPause;
	
	//you could add a pause beat multiple if you wanted to add a sense of meter, which I typically don't
	//you could also add a startWithPause flag
	
	// private variables
	// Douglas Crockford told me to do this: http://www.crockford.com/javascript/private.html
	// It's a convention that allows private member functions to access the object
	// due to an error in the ECMAScript Language Specification
	var that = this;
	
	//I'm sure with some restructuring, you could avoid having to set all of these params on initialization
	//instead, set things up so first time through the test, it would need to pick a new phrase...
	var beatCountdown = 0;
	var pauseBetweenPhrasesForCurrentVolley = Math.floor((1 + that.maxPause - that.minPause) * Math.random()) + that.minPause;
	var volleyCountdown = Math.floor(Math.random() * (1 + this.maxReps - this.minReps)) + this.minReps;
	console.log('volleyCountdown: ' + volleyCountdown);
	var currentPhraseIndex = Math.floor(Math.random() * this.phrases.length);
	var currentReps = Math.floor(Math.random() * (1 + this.maxReps - this.minReps)) + this.minReps;
	var noteIndex = 0;
	var isPausing = false;
	
	this.beat = function() {
		console.log('beat');
		if (!isPausing) {
			beatCountdown--;
			if (beatCountdown <= 0) {
				//play the current note
				var noteToPlay = this.phrases[currentPhraseIndex][noteIndex];
				console.log('currentNote: ' + noteToPlay);
				//set beatCountdown to the current note's duration
				beatCountdown = this.phrases[currentPhraseIndex][noteIndex][0];
				//advance to the next note 
				noteIndex++;
				if (noteIndex >= this.phrases[currentPhraseIndex].length) {
					//if the next note doesn't exist, then decrement the number of phrase repeats 
					volleyCountdown--;
					if (volleyCountdown < 0) {
						//if repeat count has been exceeded, then pick a new phrase
						//could add a check here to avoid repeats if that's important to you...
						currentPhraseIndex = Math.floor(Math.random() * this.phrases.length);
						volleyCountdown = Math.floor(Math.random() * (1 + this.maxReps - this.minReps)) + this.minReps;
						console.log('new volleyCountdown: ' + volleyCountdown);
						//and set the pause to the pause between volleys
						beatCountdown = Math.floor((1 + that.maxVolleyPause - that.minVolleyPause) * Math.random()) + that.minVolleyPause;
						//and also set the pause to the pause between phrases, since that stays steady for the whole volley
						//you could add a flag if this wasn't always designed to be the case...
						pauseBetweenPhrasesForCurrentVolley = Math.floor((1 + that.maxPause - that.minPause) * Math.random()) + that.minPause;
					} else {
						beatCountdown = pauseBetweenPhrasesForCurrentVolley;
					}
					console.log('beatCountdown: ' + beatCountdown);
					//regardless, reset noteIndex to the beginning
					noteIndex = 0;
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

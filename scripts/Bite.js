/**
 * Bite
 * by Ben Houge
 * Play one of three bite behaviors (one shot sound aggregates)
 */

// creating a PhrasePlayer object with an object constructor
function Bite(instruments, currentScale) {
	//let's let this be an array, contents tbd
	this.instruments = instruments;
	this.currentScale = currentScale;
	
	
	// private variables
	// Douglas Crockford told me to do this: http://www.crockford.com/javascript/private.html
	// It's a convention that allows private member functions to access the object
	// due to an error in the ECMAScript Language Specification
	var that = this;
	
	this.play = function(buttonID) {
		switch (buttonID) {
		case 1:
			console.log('button ' + buttonID + ' pressed.');
			var notes = [84, 91, 95, 98];
			for (var i = 0; i < notes.length * 2; i++) {
				var delay = Math.random() * 1000;
				var octave = (i > 4) * 12;
				this.instruments[0].playNote(i * 40, notes[i % notes.length] + octave, 1.0, 0.5, 0.1);
			}
			break;
		case 2:
			
			
			break;
		case 3:
			
			break;
		}
	}
}

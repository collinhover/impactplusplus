ig.module(
	'plusplus.core.sound'
)
.requires(

)
.defines(function(){ "use strict";

	ig.AudioSource = ig.global.AudioSource = ig.Class.extend({
		//the position of sounds on this audiosource
		pos: {x: 0, y: 0},

		//instances of ig.Sound can be added here and played by simply calling myAudioSource.sounds.kaboom.play()
		sounds: {},

		//specifies at which distance these sounds can be heard from (smoothly fades from 0 to 1)
		radius: 250,

		//updates volume levels on all sound clips
		update: function() {
			if (ig.AudioListener.current) {
				//get the currently active listener
				var listener = ig.AudioListener.current;

				var xd = (this.pos.x + this.size.x/2) - (listener.pos.x);
				var yd = (this.pos.y + this.size.y/2) - (listener.pos.y);
				var distance = Math.sqrt(xd*xd + yd*yd);

				/*
				distance is 200 pixels
				when distance is 500, volume is 1
				when distance is 250, volume should be 0.5
				at distance 0, volume is 0
				etc
				*/
				
				var volume = distance / this.radius;
				volume = 1 - volume;
				if (volume < 0) volume = 0;
				if (volume > 1) volume = 1;

				//loop through all sounds and set their volume on their clips
				var i;
				for(i in this.sounds) {
					if (this.sounds[i].currentClip) {
						//we set the volume of the clips themselves
						//take into account the volume of the ig.Sound instance as well to provide for some level of control for individual sounds.
						this.sounds[i].currentClip.volume = this.sounds[i].volume * volume;
					}
				}
			}
		},
	});

	ig.AudioListener = ig.global.AudioListener = ig.Class.extend({
		pos: {x: 0, y: 0},
		active: false,

		init: function() {
			//set the current listener
			//is there a listener already?
			if (!ig.AudioListener.current) {
				//if not, we'll activate this one
				this.activate();
			}
		},

		//activate this listener such that sound will now be heard from this listener
		activate: function() {
			//is there already a listener active?
			if (ig.AudioListener.current) {
				//deactivate it
				ig.AudioListener.current.deactivate();
			}

			ig.AudioListener.current = this;

			this.active = true;
		},

		deactivate: function() {
			this.active = false;
		},
	});

});
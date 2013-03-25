/**
 * Fixes and enhancements for animations.
 * @injects ig.Animation
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'game.core.animation'
).requires(
	'impact.animation'
)
.defines(function(){'use strict';

ig.Animation.inject( {
	
	/**
	 * @returns total duration of animation.
	 **/
	getDuration: function () {
		
		return this.frameTime * this.sequence.length;
		
	},
	
	/**
	 * See ig.Animation.
	 **/
	update: function() {
		
		var loopCountLast = this.loopCount;
		
		if ( this.sequence.length > 1 ) {
			
			var frameTotal = Math.floor(this.timer.delta() / this.frameTime);
			this.loopCount = Math.floor(frameTotal / this.sequence.length);
			if( this.stop && this.loopCount > 0 ) {
				this.frame = this.sequence.length - 1;
			}
			else {
				this.frame = frameTotal % this.sequence.length;
			}
			
			// check if completed
			
			if ( this.loopCount > loopCountLast ) {
				
				// callback to execute on one completion
				
				if ( typeof this.oneComplete === 'function' ) {
					
					this.oneComplete();
					delete this.oneComplete;
					
				}
				
				// callback to execute on each completion
				
				if ( typeof this.onComplete === 'function' ) {
					
					this.onComplete();
					
				}
				
			}
			
		}
		else {
			
			this.frame = 0;
			
		}
		
		this.tile = this.sequence[ this.frame ];
		
	},

} );

} );
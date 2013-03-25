/**
 * Trigger calling the activate function of each of its targets when a checked against entity enters it.
 * @extends ig.EntityExtended
 * @author Collin Hover - collinhover.com
 * @author Dominic Szablewski
 **/
ig.module(
	'game.entities.trigger'
)
.requires(
	'impact.timer',
	'game.core.entity'
)
.defines( function(){ "use strict";

ig.global.EntityTrigger = ig.EntityTrigger = ig.EntityExtended.extend( {
	
	// editor properties
	
	_wmScalable: true,
	_wmDrawBox: true,
	_wmBoxColor: 'rgba( 196, 255, 0, 0.7 )',
	
	size: {x: 16, y: 16},
	
	frozen: true,
	
	// names of target entities to activate when triggered
	
	target: {},
	
	// time in seconds before this trigger can be triggered again
	// set to -1 to specify the trigger can only be triggered once
	
	wait: -1,
	
	// duration in seconds to delay activation of targets
	
	delay: 0,
	
	// whether trigger can be triggered
	
	triggerable: true,
	
	// do not modify
	
	delaying: false,
	
	/**
	 * See ig.EntityExtended.
	 **/
	init: function( x, y, settings ) {
		
		this.parent.apply( this, arguments );
		
		this.waitTimer = new ig.Timer();
		this.delayTimer = new ig.Timer();
		
	},
	
	/*
	 * See ig.EntityExtended.
	 */
	updateTypes: function () {
	
		this.parent();
		
		ig.Entity.addType( this, "TRIGGER" );
		ig.Entity.addCheckAgainst( this, "CHARACTER" );
		
	},
	
	/**
	 * See ig.EntityExtended.
	 **/
	check: function( other ) {
		
		if ( this.triggerable && this.waitTimer.delta() > this.wait ) {
			
			// init delay
			
			if ( this.delay > 0 && !this.delaying ) {
				
				this.delaying = true;
				this.delayTimer.set( this.delay );
				
			}
			
			// trigger
			
			if ( this.delayTimer.delta() >= 0 ) {
				
				this.delaying = false;
				
				// activate self
				
				this.activate( other, this );
				
				// activate all targets
				
				for( var name in this.target ) {
					
					var entity = ig.game.getEntityByName( this.target[ name ] );
					
					if( entity ) {
						
						entity.activate( other, this );
						
					}
					
				}
				
				// disable self
				
				if( this.wait === -1 ) {
					
					this.triggerable = false;
					
				}
				else {
					
					this.waitTimer.set( this.wait );
					
				}
				
			}
			
		}
	},
	
});

});
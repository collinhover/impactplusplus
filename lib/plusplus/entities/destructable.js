/**
 * Entity that is destroyed on activation.
 * @extends ig.EntityTrigger
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'game.entities.destructable'
)
.requires(
	'game.entities.trigger'
)
.defines(function(){ "use strict";
	
ig.global.EntityDestructable = ig.EntityDestructable = ig.EntityTrigger.extend({
	
	// editor properties
	
	_wmBoxColor: 'rgba( 100, 255, 0, 0.7 )',
    
	collides: ig.Entity.COLLIDES.FIXED,
	
	/**
	 * See ig.EntityExtended.
	 **/
	activate: function( target, trigger ) {
		console.log( 'destructable destroyed' );
		this.kill();
		
	}
	
});

});
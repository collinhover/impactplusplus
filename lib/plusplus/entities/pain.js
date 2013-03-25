/**
 * Entity that does damage to another entity upon activation.
 * @extends ig.EntityTrigger
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'game.entities.pain'
)
.requires(
	'game.entities.trigger'
)
.defines(function(){ "use strict";
	
ig.global.EntityPain = ig.EntityPain = ig.EntityTrigger.extend({
	
	// editor properties
	
	_wmBoxColor: 'rgba( 255, 0, 100, 0.7 )',
	
	// damage done
	
	damage: 1,
	
	// damage in pct of other's health
	
	damageAsPct: false,
	
	// force damage through all defenses
	
	damageUnblockable: false,
	
	wait: 0,
	
	/**
	 * See ig.EntityExtended.
	 **/
	activate: function( target, trigger ) {
		
		var damage;
		
		if ( this.damageAsPct ) {
			
			damage = target.health * this.damage;
			
		}
		else {
			
			damage = this.damage;
			
		}
		
		target.receiveDamage( damage, this, this.damageUnblockable );
		
	}
	
});

});
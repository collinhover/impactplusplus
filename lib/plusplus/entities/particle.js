/**
 * Abstract entity class for particle entities.
 * @extends ig.EntityExtended
 * @author Collin Hover - collinhover.com
 * @author Dominic Szablewski
 * @author Jesse Freeman
 **/
ig.module(
	'game.entities.particle'
)
.requires(
	'game.core.shared',
	'game.core.entity',
	'game.helpers.utilsvector2'
)
.defines(function(){ "use strict";

var _s = ig.shared;
var _utv2 = ig.utilsvector2;

ig.global.EntityParticle = ig.EntityParticle = ig.EntityExtended.extend({
	
	performance: _s.KINEMATIC,
	
	size: _utv2.vector( 1, 1 ),
	
	// speed of particle
	
	maxVel: _utv2.vector( 150, 150 ),
	friction: _utv2.vector( 20, 0 ),
	
	// bounce at all times
	
	minBounceVelocity: 0,
	bounciness: 0.6,
	
	// total time from birth until death
	
	lifetime: 2,
	
	// duration after birth at which particle will start to fade
	
	fadetime: 1,
	
	// starting alpha of particle
	
	alpha: 1,
	
	// if should kill self when hitting something
	
	collisionKills: false,
	
	// if should sticky when hitting something
	
	collisionSticky: false,
	
	/**
	 * See ig.EntityExtended.
	 **/
	init: function() {
		
		this.parent.apply( this, arguments );
		
		this.idleTimer = new ig.Timer();
		
	},
	
	/**
	 * See ig.EntityExtended.
	 **/
	ready: function () {
		
		this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
		this.vel.y = (Math.random() * 2 - 1) * this.vel.y;
		
		if ( this.currentAnim ) {
			
			this.currentAnim.alpha = this.alpha;
			this.currentAnim.flip.x = (Math.random() > 0.5);
			this.currentAnim.flip.y = (Math.random() > 0.5);
			this.currentAnim.gotoRandomFrame();
			
		}
		
	},
	
	/**
	 * See ig.EntityExtended.
	 **/
	update: function() {
		
		if( this.idleTimer.delta() > this.lifetime ) {
			
			this.kill();
			return;
			
		}
		
		this.currentAnim.alpha = this.idleTimer.delta().map(
			this.lifetime - this.fadetime, this.lifetime,
			this.alpha, 0
		);
		
		this.parent.apply( this, arguments );
		
	},
	
	/**
	 * See ig.EntityExtended.
	 **/
	handleMovementTrace: function ( res ) {
		
		this.parent.apply( this, arguments );
		
		// did we hit something
		
		if ( res.collision.x || res.collision.y || res.slope ) {
			
			// kill at the first thing we hit
			
			if ( this.collisionKills ) {
				
				this.kill();
				
			}
			// sticky to first thing we hit
			else if ( this.collisionSticky ) {
				
				this.collides = ig.Entity.COLLIDES.NONE;
				this.performance = _s.STATIC;
				
			}
			
		}
		
	}
	
});


});
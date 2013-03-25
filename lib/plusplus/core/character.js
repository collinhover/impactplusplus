/**
 * Abstract Entity for use as a character.
 * @extends ig.EntityExtended
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'game.core.character'
)
.requires(
	'game.core.shared',
	'game.core.entity',
	'game.entities.particle-color',
	'game.entities.death',
	'game.helpers.utils',
	'game.helpers.utilsmath',
	'game.helpers.utilsvector2',
	'game.helpers.utilstile'
)
.defines(function(){ "use strict";

var _s = ig.shared;
var _ut = ig.utils;
var _utm = ig.utilsmath;
var _utv2 = ig.utilsvector2;
var _utt = ig.utilstile;

ig.Character = ig.EntityExtended.extend( {
	
    collides: ig.Entity.COLLIDES.ACTIVE,
	
	performance: _s.KINEMATIC,
	
	flip: false,
	
	maxVelUngrounded: _utv2.vector( 100, 200 ),
	maxVelGrounded: _utv2.vector( 100, 100 ),
	maxVelClimbing: _utv2.vector( 75, 75 ),
	
	frictionUngrounded: _utv2.vector(),
	frictionGrounded: _utv2.vector( 1600, 1600 ),
	
	speed: _utv2.vector( 750, 750 ),
	
	// speed on slopes
	
	slopeSpeed: 0.75,
	
	// slope standing fix
	
	slopeStanding: {min: (-136).toRad(), max: (-44).toRad() },
	
	moving: false,
	movingToSpeed: false,
	movingToWithoutJump: false,
	moveToPos: { x: 0, y: 0 },
	moveToPosAt: { x: 0, y: 0 },
	moveToStuckFor: 0,
	moveToStuckForThreshold: 0.5,
	
	jumping: false,
	jumpPushing: false,
	jumpAscend: false,
	jumpWhileClimbing: false,
	jumpForce: 10,
	jumpSteps: 4,
	jumpCooldown: 500,
	jumpControl: 0.75,
	
	grounded: 0,
	groundedFor: 0,
	groundingFactor: 1,
	ungroundedFor: 0,
	ungroundedForThreshold: 0.1,
	
	climbing: false,
	climbingIntentDown: false,
	climbingIntentUp: false,
	climbingControl: 1,
	canClimb: 0,
	climbingOn: [],
	
	// on death
	
	explodingDeath: true,
	explodeCount: 10,
	explodeVel: _utv2.vector( 200, 200 ),
	explodeColorOffset: ig.EntityParticleColor.colorOffsets.RED,
	
    /**
	 * See ig.EntityExtended.
	 **/
    init: function () {
		
		this.utilVec2Jump1 = _utv2.vector();
		this.utilVec2Jump2 = _utv2.vector();
		
		this.utilVec2UpdateMove1 = _utv2.vector();
		
	    this.parent.apply( this, arguments );
		
		// could be a better way to do cooldowns?
		
		this.jump = _ut.cooldown( this.jump, this.jumpCooldown, this );
		
	},
	
	/*
	 * See ig.EntityExtended.
	 */
	updateTypes: function () {
	
		this.parent();
		
		ig.Entity.addType( this, "CHARACTER" );
		ig.Entity.addCheckAgainst( this, "SHAPE-CLIMBABLE" );
		
	},
	
	/**
	 * See ig.EntityExtended.
	 **/
	applyAntiVelocity: function () {
		
		_utv2.zero( this.vel );
		
	},
	
	/**
	 * See ig.EntityExtended.
	 **/
	applyAntiVelocityX: function () {
		
		this.vel.x = 0;
		
	},
	
	/**
	 * See ig.EntityExtended.
	 **/
	applyAntiVelocityY: function () {
		
		this.vel.y = 0;
		
	},
	
	/**
	 * See ig.EntityExtended.
	 **/
	applyAntiGravity: function () {
		
		if ( this.gravityFactor !== 0 ) {
			
			this.vel.y -= ig.game.gravity * ig.system.tick * this.gravityFactor;
			
		}
		
	},
	
	/**
	 * Attempts to move to position, and stops if position reached or stuck in place for too long.
	 * TODO: improve with A* or other path finding.
	 * @param {Object} Position to move to.
	 * @param {Boolean} (optional, default false) Do not jump if stuck or in air.
	 **/
	moveToPosition: function ( pos, withoutJump ) {
		
		if ( pos ) {
			
			var targetUpdated;
			
			if ( _ut.isNumber( pos.x ) && this.moveToPos.x !== pos.x ) {
				
				this.moveToPos.x = pos.x;
				targetUpdated = true;
				
			}
			
			if ( _ut.isNumber( pos.y ) && this.moveToPos.y !== pos.y ) {
				
				this.moveToPos.y = pos.y;
				targetUpdated = true;
				
			}
			
			if ( targetUpdated === true ) {
				
				this.moveToPosAt.x = this.pos.x;
				this.moveToPosAt.y = this.pos.y;
				this.movingTo = true;
				this.moveToStuckFor = 0;
				this.movedTo = false;
				
			}
			
		}
		
		if ( typeof withoutJump === 'boolean' && this.movingToWithoutJump !== withoutJump ) {
			
			this.movingToWithoutJump = withoutJump;
			
		}
		
	},
    
	/*
	 * Moves character left.
	 */
	moveToLeft: function ( mod ) {
		
		this.movingToSpeed = true;
		if ( mod ) {
			this.accel.x = -this.speed.x * mod;
		}
		else {
			this.accel.x = -this.speed.x;
		}
		this.flip = true;
		
	},
	
	/*
	 * Moves character right.
	 */
	moveToRight: function ( mod ) {
		
		this.movingToSpeed = true;
		if ( mod ) {
			this.accel.x = this.speed.x * mod;
		}
		else {
			this.accel.x = this.speed.x;
		}
		this.flip = false;
		
	},
    
	/*
	 * Moves character up at move speed.
	 */
	moveToUp: function ( mod ) {
		
		this.movingToSpeed = true;
		if ( mod ) {
			this.accel.y = -this.speed.y * mod;
		}
		else {
			this.accel.y = -this.speed.y;
		}
		
	},
	
	/*
	 * Moves character down at move speed.
	 */
	moveToDown: function ( mod ) {
		
		this.movingToSpeed = true;
		if ( mod ) {
			this.accel.y = this.speed.y * mod;
		}
		else {
			this.accel.y = this.speed.y;
		}
		
	},
	
	/**
	* Ends any moveTo in progress.
	**/
	moveToHere: function () {
		
		this.parent.apply( this, arguments );
		
		this.movingToSpeed = false;
		
	},
	
	/*
	 * Sets horizontal movement speed to 0.
	 */
	moveToStopHorizontal: function () {
		
		this.moveToHere();
		this.accel.x = 0;
		
	},
	
	/*
	 * Sets vertical movement speed to 0.
	 */
	moveToStopVertical: function () {
		
		this.moveToHere();
		this.accel.y = 0;
		
	},
	
	/*
	 * Sets all movement speed to 0.
	 */
	moveToStop: function () {
		
		this.moveToStopHorizontal();
		this.moveToStopVertical();
		
	},
	
	/**
	* Updates any moveTo in progress.
	**/
	moveToUpdate: function () {
		
		if ( this.movingTo === true ) {
			
			var dx = this.moveToPos.x - this.pos.x;
			
			// at target position
			
			if ( _utm.almostEqual( dx, 0, 1 ) ) {
				
				this.movedTo = true;
				this.moveToStop();
				
			}
			// continue to position
			else {
				
				if ( dx < 0 ) {
					
					this.moveToLeft();
					
				}
				else {
					
					this.moveToRight();
					
				}
				
			}
			
			// check if stuck
			
			if ( this.movedTo !== true ) {
				
				if ( _utm.almostEqual( this.moveToPosAt.x, this.pos.x, _s.PRECISION_ZERO ) && _utm.almostEqual( this.moveToPosAt.y, this.pos.y, _s.PRECISION_ZERO ) ) {
					
					this.moveToStuckFor += ig.system.tick;
					
					// stuck for too long, stop trying
					
					if ( this.moveToStuckFor >= this.moveToStuckForThreshold ) {
						
						this.moveToStop();
						
					}
					
				}
				// not stuck, update position at
				else {
					
					this.moveToStuckFor = 0;
					this.moveToPosAt.x = this.pos.x;
					this.moveToPosAt.y = this.pos.y;
					
				}
				
			}
			
		}
		
	},
	
	/**
	 * Attempts to flag character for jumping.
	 **/
	jump: function () {
		
		if ( this.climbing ) {
			
			this.jumpWhileClimbing = true;
			this.climbEnd();
			
		}
		
		if ( ( this.grounded || this.canClimb || this.ungroundedFor < this.ungroundedForThreshold ) && this.jumping !== true ) {
			
			this.jumping = this.jumpPushing = true;
			this.jumpStepsRemaining = this.jumpSteps;
			
		}
		// unsuccessful, don't cooldown
		else {
			
			return false;
			
		}
		
	},
	
	/**
	 * Updates jump in progress.
	 **/
	jumpUpdate: function () {
		
		if ( this.jumping === true ) {
			
			this.jumpPush();
		
			if ( this.vel.y >= 0 ) {
				
				this.jumpAscend = false;
				
			}
			
			if ( !this.jumpPushing && !this.jumpAscend ) {
				
				this.jumpEnd();
				
			}
			
		}
		
	},
	
	/**
	 * Does jump push for number of jump steps.
	 **/
	jumpPush: function () {
		
		if ( this.jumpStepsRemaining > 0 ) {
			
			if ( this.jumpStepsRemaining === this.jumpSteps ) {
				
				// zero out vertical velocity so jumping is always consistent, even after falling
				
				this.groundedFor = this.ungroundedFor = 0;
				this.applyAntiVelocityY();
				
			}
			
			this.jumpAscend = true;
			this.jumpStepsRemaining--;
			
			this.moveToUp( this.jumpForce );
			
			if ( this.jumpStepsRemaining <= 0 ) {
				
				this.jumpPushing = false;
				this.moveToStopVertical();
				
			}
			
		}
		
	},
	
	/**
	 * Stops any jump in progress.
	 **/
	jumpEnd: function () {
		
		this.jumping = this.jumpPushing = false;
		this.jumpStepsRemaining = 0;
		
		if ( this.jumpWhileClimbing ) {
			
			this.jumpWhileClimbing = false;
			
			this.climb();
			
		}
		
	},
	
	/**
	 * Attempts to start climbing.
	 **/
	climb: function () {
		
		if ( this.jumping ) {
			
			this.jumpEnd();
			
		}
		
		if ( this.canClimb && this.climbing !== true && !( this.climbingIntentDown && this.grounded ) ) {
			
			this.climbing = true;
			this.climbingFor = this.grounded = this.groundedFor = this.ungroundedFor = 0;
			
			if ( !this.jumping ) {
				
				this.applyAntiVelocityY();
				
			}
			
		}
		
	},
	
	/**
	 * Attempts to start climbing and climb up.
	 **/
	climbUp: function () {
		
		this.climbingIntentUp = true;
		
		this.climb();
		
		if ( this.climbing ) {
			
			this.moveToUp();
			
		}
		
	},
	
	/**
	 * Attempts to start climbing and climb down.
	 **/
	climbDown: function () {
		
		this.climbingIntentDown = true;
		
		this.climb();
		
		if ( this.climbing ) {
			
			this.moveToDown();
			
		}
		
	},
	
	/**
	 * Updates climb in progress.
	 **/
	climbUpdate: function () {
		
		if ( this.climbing ) {
			
			this.climbingFor += ig.system.tick;
			
			if ( !this.canClimb || this.grounded ) {
				
				this.climbEnd();
				
			}
			else {
				
				this.applyAntiGravity();
				
			}
				
		}
		
		// have to force can climb off each update cycle to end climbing properly
		
		this.canClimb = 0;
		
	},
	
	/**
	 * Stops climb in progress.
	 **/
	climbEnd: function () {
		
		if ( this.climbing !== false ) {
			
			this.climbing = false;
			
			if ( !this.jumping && this.vel.y < 0 ) {
				
				this.applyAntiVelocityY();
				
			}
			
		}
		
	},
	
	/**
	* See ig.EntityExtended.
	**/
	kill: function() {
		
		ig.game.spawnEntity( ig.EntityDeath, this.pos.x, this.pos.y, {
			entity: this
		} );
		
		ig.game.removeEntity( this );
		
	},
	
	/**
	 * Changes entity
	 **/
	updateChanges: function () {
		
		this.parent();
		
		// jumping
		
		this.jumpUpdate();
		
		// climbing
		
		this.climbUpdate();
		
		// grounded
		
		if ( this.grounded ) {
			
			this.ungroundedFor = 0;
			this.groundedFor += ig.system.tick;
			
		}
		else {
			
			this.groundedFor = 0;
			this.ungroundedFor += ig.system.tick;
			
		}
		
	},
	
	/**
	 * See ig.EntityExtended
	 **/
	updateVelocity: function () {
		
		var control;
		
		// control and and max velocity
		
		if ( this.climbing ) {
			
			_utv2.copy( this.maxVel, this.maxVelClimbing );
			control = this.climbingControl;
			
		}
		else if ( this.grounded ) {
			
			_utv2.copy( this.maxVel, this.maxVelGrounded );
			control = 1;
			
		}
		else {
			
			_utv2.copy( this.maxVel, this.maxVelUngrounded );
			control = this.jumpControl;
			
		}
		
		// change friction based on standing instead of grounding for correct behavior
		
		if ( this.standing || this.climbing ) {
			
			_utv2.copy( this.friction, this.frictionGrounded );
			
		}
		else {
			
			_utv2.copy( this.friction, this.frictionUngrounded );
			
		}
		
		this.vel.x = this.getNewVelocity( this.vel.x, this.accel.x * control, this.friction.x, this.maxVel.x );
		this.vel.y = this.getNewVelocity( this.vel.y, this.accel.y * control, this.friction.y, this.maxVel.y );
		
	},
	
	/**
	 * See ig.EntityExtended
	 **/
	updateCleanup: function () {
		
		// climbing intent
		
		this.climbingIntentDown = this.climbingIntentUp = false;
		
		// animation
		
		var playAnim = this.moving;
		
		if ( this.jumping === true && this.anims.jump ) {
			
			this.currentAnim = this.anims.jump;
			
		}
		else if ( this.climbing === true && this.anims.climb ) {
			
			this.currentAnim = this.anims.climb;
			
		}
		else if ( this.movingX && this.anims.run ) {
			
			this.currentAnim = this.anims.run;
			
		}
		else {
			
			playAnim = true;
			this.currentAnim = this.anims.idle;
			
		}
		
		this.currentAnim.stop = !playAnim;
        this.currentAnim.flip.x = this.flip;
		
		this.parent();
		
	},
	
    /**
	 * See ig.EntityExtended.
	 **/
	check: function( other ) {
		
		this.canClimb = other.climbable | 0;
		
	},
	
	/**
	 * See ig.Entity
	 **/
	collideWith: function( other, axis ) {
		
		this.parent.apply( this, arguments );
		
		// ground character if standing on a fixed or active entity
		
		if ( other.collides >= ig.Entity.COLLIDES.ACTIVE ) {
			
			this.standing = this.grounded = 1;
			
		}
		
	},
	
	/**
	 * Overriding handle movement trace for better slope behavior.
	 **/
	handleMovementTrace: function( res ) {
		
		this.standing = 0;
		
		if ( this.vel.y !== 0 ) {
			
			this.grounded = 0;
			
		}
		
		if( res.collision.y ) {
			if( this.bounciness > 0 && Math.abs(this.vel.y) > this.minBounceVelocity ) {
				this.vel.y *= -this.bounciness;				
			}
			else {
				if ( this.vel.y > 0 ) {
					this.standing = this.grounded = 1;
				}
				this.vel.y = 0;
			}
		}
		
		if( res.collision.x ) {
			if( this.bounciness > 0 && Math.abs(this.vel.x) > this.minBounceVelocity ) {
				this.vel.x *= -this.bounciness;				
			}
			else {
				this.vel.x = 0;
			}
		}
		
		if( res.collision.slope ) {
			
			var s = this.slope = res.collision.slope;
			
			s.angle = Math.atan2( s.ny, s.nx );
			
			if( s.angle > this.slopeStanding.min && s.angle < this.slopeStanding.max ) {
				
				this.standing = this.grounded = 1;
				
				// special case for one way climbable tile
				
				if ( _utt.isTileClimbableOneWay( res.tile.y ) ) {
					
					this.pos.x = res.pos.x;
					
					if ( !this.climbing ) {
						
						// allow climbing only if we'll be going down
						
						if ( this.climbingIntentDown ) {
							
							this.standing = this.grounded = 0;
							this.canClimb = 1;
							this.climbDown();
							
						}
						
					}
					
					// if climbing, we have to force the position change to bypass the collision result
					
					if ( this.climbing ) {
						
						this.standing = this.grounded = 0;
						this.pos.y = this.pos.y + this.vel.y * ig.system.tick;
						
					}
					
					return;
					
				}
				
				// add a bit of force upwards if moving up a slope, based on slope angle
				// ideally we would just rotate the velocity itself to run with the slope but that breaks the collision tracing
				
				if ( s.nx * this.vel.x < 0 ) {
					
					this.vel.y = -Math.abs( ( s.angle + _utm.HALFPI ) * this.vel.x ) * this.slopeSpeed;
					
				}
				
			}
			
		}
		else {
			
			this.slope = false;
			
		}
		
		// check if can use result position
		
		if ( !( this.slope && this.grounded && this.vel.x === 0 ) ) {
			
			this.pos = res.pos;
			
		}

	}
    
} );

} );
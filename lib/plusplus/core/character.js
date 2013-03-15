/**
 * Abstract Entity for use as a character.
 * @extends ig.EntityPhysics
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'plusplus.core.character'
)
.requires(
	'plusplus.helpers.shared',
	'plusplus.helpers.utils',
	'plusplus.helpers.utilsmath',
	'plusplus.helpers.utilsphysics',
	'plusplus.physics.box2d',
	'plusplus.physics.entity'
)
.defines(function(){ "use strict";

var _s = ig.shared;
var _u = ig.utils;
var _um = ig.utilsmath;
var _up = ig.utilsphysics;
var _b2 = ig.Box2D;

ig.Character = ig.EntityPhysics.extend( {
	
	type: ig.Entity.TYPE.B,
	
	flip: false,
	
	fixedRotation: true,
	ignoreBodyRotation: true,
	
    bodySizePct: { x: 1, y: 1 },
	bodyOffsetPct: { x: 0, y: -0.25 },
	bodyType: 'dynamic',
	bodyShape: 'circle',
	
	friction: 0, // friction is 0 on body so that it doesn't stick to walls
	
	legsRadiusPct: 0.9,
	legsOffsetPct: { x: 0, y: 0.25 },
	legsBullet: false,
	legsFriction: 10,
    
	moveVelocity: 4.5,
	moveSpeedTargetX: 0,
	moveSpeedTargetY: 0,
	
	movingToSpeed: false,
	movingToWithoutJump: false,
	moveToPos: { x: 0, y: 0 },
	moveToPosAt: { x: 0, y: 0 },
	moveToStuckFor: 0,
	moveToStuckForThreshold: 0.5,
	
	jumping: false,
	jumpPushing: false,
	jumpAscend: false,
	jumpForce: 1.3,
	jumpForceInv: 0.001,
	jumpSteps: 5,
	jumpCooldown: 500,
	jumpControl: 0.5,
	
	grounded: 0,
	groundedFor: 0,
	groundedForThreshold: 0.15,
	ungroundedFor: 0,
	ungroundedForThreshold: 0.1,
	groundedOn: [],
	groundingSize: { x: 0.75, y: 0.3 },
	groundingOffset: { x: 0, y: 0.5 },
	groundingForce: 0.15,
	
	climbing: false,
	climbable: 0,
	climbingFor: 0,
	climbingOn: [],
	climbingControl: 1,
	
    /**
	 * See ig.Character.
	 **/
    init: function () {
		
		this.utilVec2Jump1 = new _b2.Vec2();
		this.utilVec2Jump2 = new _b2.Vec2();
		
		this.utilVec2UpdateMove1 = new _b2.Vec2();
		
		this.utilVec2UpdateAntiGrav1 = new _b2.Vec2();
		this.utilVec2UpdateAntiGrav2 = new _b2.Vec2();
		
	    this.parent.apply( this, arguments );
		
		// could be a better way to do cooldowns?
		
		this.jump = _u.cooldown( this.jump.bind( this ), this.jumpCooldown );
	    
	},
	
    /**
	 * See ig.Character.
	 **/
	defineBody: function () {
		
		// set radius to slightly less than body
		
		if ( _u.isNumber( this.radius ) !== true ) {
			
			this.radius = Math.min( this.size.x, this.size.y ) * 0.5;
			
		}
		
		// approximately convert move velocity to move speed
		
		if ( _u.isNumber( this.moveSpeed ) !== true && _u.isNumber( this.moveVelocity ) ) {
			
			this.moveSpeed = _up.getSpeedFromVelocity( this.moveVelocity, this.radius );
			
		}
		
		// set acceleration ( if not already set ) to be high enough to match speed needed
		
		if ( _u.isNumber( this.acceleration ) !== true ) {
			
			this.acceleration = this.moveSpeed * 3;
			
		}
		
		this.parent();
		
		// create legs as a circle body
		// set high friction to roll and not slide
		
		this.legsDef = new _b2.BodyDef();
		
		this.legsDef.position.Set(
			( this.getCenterX() + this.size.x * this.legsOffsetPct.x ) * _b2.SCALE,
			( this.getCenterY() + this.size.y * this.legsOffsetPct.y ) * _b2.SCALE
		);
		
		this.legsDef.type = _b2.Body.b2_dynamicBody;
		
		this.legsShapeDef = new _b2.CircleShape();
		this.legsShapeDef.SetRadius( this.radius * this.legsRadiusPct * _b2.SCALE );
		
	},
	
    /**
	 * See ig.Character.
	 **/
	createBody: function() {
		
	    this.parent();
		
		var totalOffsetX = this.totalOffsetX();
		var totalOffsetY = this.totalOffsetY();
		
		// create legs
		
		this.legs = this.getWorld().CreateBody( this.legsDef );
		this.legs.SetUserData( this );
		
		// friction is high on legs so that it rolls, climbs slopes, and stops on slopes properly
		// density needs to be higher on legs than body, or stopping will be a wobble
		
		this.legs.CreateFixture2( this.legsShapeDef, 2 );
		_up.forEachFixture( this.legs, function () {
			this.SetFriction( this.legsFriction );
			this.SetRestitution( 0 );
			this.SetUserData( 'legs' );
		} );
		
		// motorize legs with revolute joint
		
		this.bodyLegsJointDef = new _b2.RevoluteJointDef();
		
		this.bodyLegsJointDef.Initialize( this.body, this.legs, this.legs.GetWorldCenter() );
		this.bodyLegsJointDef.localAnchorA.Set(
			totalOffsetX * _b2.SCALE,
			totalOffsetY * _b2.SCALE
		);
		
		this.bodyLegsJoint = this.getWorld().CreateJoint( this.bodyLegsJointDef );
		this.bodyLegsJoint.SetMaxMotorTorque( this.acceleration );
		this.bodyLegsJoint.SetMotorSpeed( 0 );
		this.bodyLegsJoint.EnableMotor( true );
		
		//add sensor to bottom to detect grounded
		
		var groundSensor = new _b2.PolygonShape();
		
		groundSensor.SetAsOrientedBox(
			this.size.x * this.groundingSize.x * 0.5 * _b2.SCALE,
			this.size.y * this.groundingSize.y * 0.5 * _b2.SCALE,
			new _b2.Vec2(
				( totalOffsetX * this.groundingOffset.x + totalOffsetX ) * _b2.SCALE,
				( totalOffsetY * this.groundingOffset.y + totalOffsetY ) * _b2.SCALE
			),
			0
		);
		
		var fixture = this.body.CreateFixture2( groundSensor, 0 );
		fixture.SetSensor( true );
		fixture.SetUserData( 'grounding' );
		
	},
	
    /**
	 * See ig.Character.
	 **/
	destroyPhysicsInstantly: function () {
		
		var world = this.getWorld();
		world.DestroyBody( this.legs );
		world.DestroyJoint( this.bodyLegsJoint );
		this.legs = this.bodyLegsJoint = undefined;
		
		this.parent.apply( this, arguments );
		
	},
	
    /**
	 * See ig.Character.
	 **/
	totalOffsetX: function () {
		
		return this.size.x * ( this.legsOffsetPct.x - this.bodyOffsetPct.x );
		
	},
	
    /**
	 * See ig.Character.
	 **/
	totalOffsetY: function () {
		
		return this.size.y * ( this.legsOffsetPct.y - this.bodyOffsetPct.y );
		
	},
	
    /**
	 * See ig.Character.
	 **/
	beginContact: function ( entityTarget, manifold, fixtureSelf, fixtureTarget, contactRecord ) {
		
		var selfData = fixtureSelf.GetUserData();
		var targetData = fixtureTarget.GetUserData();
		var i, il;
		
		if ( targetData === 'climbable' && selfData !== 'grounding' ) {
			
			this.climbingOn.push( fixtureTarget );
			this.climbable = this.climbingOn.length;
			
			// get average climbing control
			
			var numClimbingControlTargets = 1;
			this.climbingControlApplied = this.climbingControl;
			
			for ( i = 0, il = this.climbingOn.length; i < il; i++ ) {
				
				var climbingFixture = this.climbingOn[ i ];
				var climbingEntity = climbingFixture.GetBody().GetUserData();
				
				if ( climbingEntity && climbingEntity.climbingControl ) {
					
					numClimbingControlTargets++;
					this.climbingControlApplied += climbingEntity.climbingControl;
					
				}
				
			}
			
			this.climbingControlApplied /= numClimbingControlTargets;
			
		}
		
		// grounding sensor and target is not climbable, or is on top of one-way
		
		if ( ( selfData === 'grounding' && targetData !== 'climbable' ) || ( contactRecord && contactRecord.enabled && this.collidingWithOneWay ) ) {
			
			this.ground( fixtureTarget );
			
		}
		
	},
	
    /**
	 * See ig.Character.
	 **/
	endContact: function ( entityTarget, manifold, fixtureSelf, fixtureTarget, contactRecord ) {
		
		var selfData = fixtureSelf.GetUserData();
		var targetData = fixtureTarget.GetUserData();
		
		if ( targetData === 'climbable' && selfData !== 'grounding' ) {
			
			_u.arrayCautiousRemove( this.climbingOn, fixtureTarget );
			
			if ( this.climbingOn.length !== this.climbable ) {
				
				this.climbable = this.climbingOn.length;
				
				if ( this.climbable === 0 ) {
					
					this.climbEnd();
					
				}
				
			}
			
		}
		
		// grounding sensor and target is not climbable, or is on top of one-way
		if ( ( selfData === 'grounding' && targetData !== 'climbable' ) || ( contactRecord && contactRecord.enabled && this.collidingWithOneWay ) ) {
			
			this.unground( fixtureTarget );
			
		}
		
	},
	
    /**
	 * Grounds character to a fixture.
	 * @param {Object} fixture.
	 **/
	ground: function ( fixtureTarget ) {
		
		this.grounded++;
		this.groundedOn.push( fixtureTarget );
		
		if ( this.grounded === 1 ) {
			
			this.groundedFor = 0;
			
		}
		
	},
	
    /**
	 * Ungrounds character from a fixture.
	 * @param {Object} fixture.
	 **/
	unground: function ( fixtureTarget ) {
		
		if ( fixtureTarget ) {
		
			this.grounded = Math.max( 0, this.grounded - 1 );
			_u.arrayCautiousRemove( this.groundedOn, fixtureTarget );
			
			if ( this.grounded === 0 ) {
				
				this.ungroundedFor = 0;
				
				_up.forEachFixture( this.legs, function () {
					this.SetFriction( 0 );
				} );
				
			}
		
		}
		
	},
	
    /**
	 * See ig.Character.
	 **/
	getTotalMass: function () {
		
		return this.body.GetMass() + this.legs.GetMass();
		
	},
	
	/**
	 * See ig.Character.
	 **/
	applyAntiVelocity: function () {
		
		this.parent.apply( this, arguments );
		
		var legsVelocity = this.legs.GetLinearVelocity();
		var legsMass = this.legs.GetMass();
		
		this.legs.ApplyImpulse( this.utilVec2Zero1.Set( legsMass * -legsVelocity.x, legsMass * -legsVelocity.y ), this.legs.GetPosition() );
		
	},
	
	/**
	 * See ig.Character.
	 **/
	applyAntiVelocityX: function () {
		
		this.parent.apply( this, arguments );
		
		this.legs.ApplyImpulse( this.utilVec2Zero1.Set( this.legs.GetMass() * -this.legs.GetLinearVelocity().x, 0 ), this.legs.GetPosition() );
		
	},
	
	/**
	 * See ig.Character.
	 **/
	applyAntiVelocityY: function () {
		
		this.parent.apply( this, arguments );
		
		this.legs.ApplyImpulse( this.utilVec2Zero1.Set( 0, this.legs.GetMass() * -this.legs.GetLinearVelocity().y ), this.legs.GetPosition() );
		
	},
	
	/**
	 * See ig.Character.
	 **/
	applyAntiGravity: function () {
		
		var pct = this.parent.apply( this, arguments );
		
		var gravity = this.getWorld().GetGravity();
		var massLegs = this.legs.GetMass();
		
		this.legs.ApplyForce( this.utilVec2UpdateAntiGrav2.Set( massLegs * -gravity.x * pct, massLegs * -gravity.y * pct ), this.legs.GetPosition() );
		
	},
	
	/**
	 * Stops motor joint and makes frictionless.
	 **/
	stopMotor: function () {
		
		this.bodyLegsJoint.SetMotorSpeed( 0 );
		
		_up.forEachFixture( this.legs, function () {
			this.SetFriction( 0 );
		} );
		
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
			
			if ( _u.isNumber( pos.x ) && this.moveToPos.x !== pos.x ) {
				
				this.moveToPos.x = pos.x;
				targetUpdated = true;
				
			}
			
			if ( _u.isNumber( pos.y ) && this.moveToPos.y !== pos.y ) {
				
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
	 * Moves character left at move speed.
	 */
	moveToLeft: function () {
		
		this.movingToSpeed = true;
        this.moveSpeedTargetXLast = this.moveSpeedTargetX;
		this.moveSpeedTargetX = -this.moveSpeed;
		this.flip = true;
		
	},
	
	/*
	 * Moves character right at move speed.
	 */
	moveToRight: function () {
		
		this.movingToSpeed = true;
        this.moveSpeedTargetXLast = this.moveSpeedTargetX;
		this.moveSpeedTargetX = this.moveSpeed;
		this.flip = false;
		
	},
    
	/*
	 * Moves character up at move speed.
	 */
	moveToUp: function () {
		
		this.movingToSpeed = true;
        this.moveSpeedTargetYLast = this.moveSpeedTargetY;
		this.moveSpeedTargetY = -this.moveSpeed;
		
	},
	
	/*
	 * Moves character down at move speed.
	 */
	moveToDown: function () {
		
		this.movingToSpeed = true;
        this.moveSpeedTargetYLast = this.moveSpeedTargetY;
		this.moveSpeedTargetY = this.moveSpeed;
		
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
        this.moveSpeedTargetXLast = this.moveSpeedTargetX;
		this.moveSpeedTargetX = 0;
		
	},
	
	/*
	 * Sets vertical movement speed to 0.
	 */
	moveToStopVertical: function () {
		
		this.moveToHere();
        this.moveSpeedTargetYLast = this.moveSpeedTargetY;
		this.moveSpeedTargetY = 0;
		
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
		
		var dx = this.moveToPos.x - this.pos.x;
		
		// at target position
		
		if ( _um.almostEqual( dx, 0, 1 ) ) {
			
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
			
			if ( _um.almostEqual( this.moveToPosAt.x, this.pos.x, _s.zeroPrecision ) && _um.almostEqual( this.moveToPosAt.y, this.pos.y, _s.zeroPrecision ) ) {
				
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
		
	},
	
	/**
	 * Attempts to flag character for jumping.
	 **/
	jump: function () {
		
		if ( ( this.grounded || this.climbable || this.ungroundedFor < this.ungroundedForThreshold ) && this.jumping !== true ) {
			
			this.jumping = this.jumpPushing = true;
			this.jumpStepsRemaining = this.jumpSteps;
			
		}
		// unsuccessful, don't cooldown
		else {
			
			return false;
			
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
				this.stopMotor();
				this.applyAntiVelocityY();
				
			}
			
			this.jumpAscend = true;
			this.jumpStepsRemaining--;
			
			var impulse = this.utilVec2Jump1.Set( 0, this.getTotalMass() * -this.jumpForce );
			var position = this.legs.GetPosition();
			this.body.ApplyImpulse( impulse, position );
			
			// apply some of jump force down into whatever character is standing on
			
			var worldPosition = this.legs.GetWorldPoint( position );
			var impulseInv = this.utilVec2Jump2.Set( -impulse.x, -impulse.y );
			impulseInv.x *= this.jumpForceInv;
			impulseInv.y *= this.jumpForceInv;
			
			for ( var i = 0, il = this.groundedOn.length; i < il; i++ ) {
				
				this.groundedOn[ i ].GetBody().ApplyForce( impulseInv, worldPosition );
				
			}
			
			if ( this.jumpStepsRemaining <= 0 ) {
				
				this.jumpPushing = false;
				
			}
			
		}
		
	},
	
	/**
	 * Stops any jump in progress.
	 **/
	jumpEnd: function () {
		
		this.jumping = this.jumpPushing = false;
		this.jumpStepsRemaining = 0;
		
	},
	
	/**
	 * Attempts to flag character for climbing.
	 **/
	climb: function () {
		
		if ( this.climbable && this.climbing !== true ) {
			
			this.climbing = true;
			this.climbingFor = this.grounded = this.groundedFor = this.ungroundedFor = 0;
			
			if ( !this.jumping ) {
				
				this.applyAntiVelocityY();
				
			}
			
		}
		
	},
	
	/**
	 * Stops any climb in progress.
	 **/
	climbEnd: function () {
		
		if ( this.climbing !== false ) {
			
			this.climbing = false;
			
			if ( !this.jumping && _um.oppositeSidesOfZero( this.legs.GetLinearVelocity().y, this.getWorld().GetGravity().y ) ) {
				
				this.applyAntiVelocityY();
				
			}
			
		}
		
	},
	
	/**
	* See ig.Character
	**/
	updatePreStep: function () {
		
		// apply anti-grav if climbing
		
		if ( this.climbing && !this.jumping ) {
			
			this.applyAntiGravity();
			
		}
		
	},
	
	/**
	* See ig.Character
	**/
	update: function () {
		
		var i, il;
		var legsVelocity = this.legs.GetLinearVelocity();
		var vx = legsVelocity.x;
		var vy = legsVelocity.y;
		
		// move to
		
		if ( this.movingTo === true ) {
			
			this.moveToUpdate();
			
		}
		
		// jumping
		
		if ( this.jumping === true ) {
			
			this.jumpPush();
		
			if ( vy >= 0 ) {
				
				this.jumpAscend = false;
				
			}
			
			if ( !this.jumpPushing && !this.jumpAscend ) {
				
				this.jumpEnd();
				
			}
			
		}
		
		// grounded duration
		
		if ( this.grounded && !this.jumping ) {
			
			this.groundedFor += ig.system.tick;
			
		}
		else {
			
			this.ungroundedFor += ig.system.tick;
		
		}
		
		// movement forces
		
		if ( this.climbing && !this.jumping ) {
			
			this.stopMotor();
			
			var tx = _up.getVelocityFromSpeed( this.moveSpeedTargetX, this.radius );
			var ty = _up.getVelocityFromSpeed( this.moveSpeedTargetY, this.radius );
			
			// apply force instead of relying on motor
			
			if ( vx !== tx || vy !== ty ) {
				
				var mass = this.getTotalMass();
				var force = this.utilVec2UpdateMove1.Set(
					mass * ( tx - vx ) * ( tx === 0 ? 1 : this.climbingControlApplied ) * 0.5 / ig.system.tick,
					mass * ( ty - vy ) * ( ty === 0 ? 1 : this.climbingControlApplied ) * 0.5 / ig.system.tick
				);
				this.legs.ApplyForce( force, this.legs.GetPosition() );
				
			}
			
			this.climbingFor += ig.system.tick;
			
		}
		else if ( this.grounded === 0 || this.jumping ) {
			
			this.stopMotor();
			
			var tx = _up.getVelocityFromSpeed( this.moveSpeedTargetX, this.radius );
			
			// apply force instead of relying on motor
			
			if ( vx !== tx ) {
				
				this.jumpControlApplied = this.jumpControl;
				
				var velocityDeltaX = ( tx - vx ) * this.jumpControl;
				var mass = this.getTotalMass();
				var force = this.utilVec2UpdateMove1.Set(
					mass * ( tx - vx ) * this.jumpControlApplied * 0.5 / ig.system.tick,
					0
				);
				this.legs.ApplyForce( force, this.legs.GetPosition() );
				
			}
			
		}
		else {
			
			// roll legs while on ground
			
			this.bodyLegsJoint.SetMotorSpeed( this.moveSpeedTargetX );
			
			if ( this.groundedFor >= this.groundedForThreshold && this.jumping !== true ) {
				
				_up.forEachFixture( this.legs, function () {
					this.SetFriction( this.legsFriction );
				} );
				/*
				// apply extra gravity to stick to ground better
				// else slopes make the character fly
				// TODO: why is this causing character to jitter?
				var groundingMagnitude = this.legs.GetMass() * Math.max( 1, this.moveSpeed * this.groundingForce );
				
				this.legs.ApplyImpulse( new _b2.Vec2( 0, groundingMagnitude ), this.body.GetPosition() );
				*/
				
			}
			
		}
		
		// animation
		
		this.currentAnim.stop = false;
		
		if ( this.jumpPushing === true && this.anims.jump ) {
			
			this.currentAnim = this.anims.jump;
			
		}
		else if ( this.climbing === true && this.anims.climb ) {
			
			if ( _um.almostEqual( vx, 0, _s.zeroPrecision ) && _um.almostEqual( vy, 0, _s.zeroPrecision ) ) {
				
				this.currentAnim.stop = true;
			
			}
			
			this.currentAnim = this.anims.climb;
			
		}
		else if ( vx !== 0 && this.anims.run ) {
			
			this.currentAnim = this.anims.run;
			
		}
		else {
			
			this.currentAnim = this.anims.idle;
			
		}
		
        this.currentAnim.flip.x = this.flip;
		
		this.parent();
		
	}
    
} );

} );
/**
 * Abstract Entity for use as a character in physics world.
 * @extends ig.EntityPhysics
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'plusplus.physics.character'
)
.requires(
	'plusplus.core.shared',
	'plusplus.helpers.utils',
	'plusplus.helpers.utilsmath',
	'plusplus.helpers.utilsphysics',
	'plusplus.physics.box2d',
	'plusplus.physics.entity'
)
.defines(function(){ "use strict";

var _s = ig.shared;
var _ut = ig.utils;
var _utm = ig.utilsmath;
var _utp = ig.utilsphysics;
var _b2 = ig.Box2D;

ig.CharacterPhysics = ig.EntityPhysics.extend( {
	
	performance: _s.DYNAMIC,
	
	flip: false,
	
	fixedRotation: true,
	ignoreBodyRotation: true,
	
	//bodyShape: 'none',
	
	friction: 0, // friction is 0 on body so that it doesn't stick to walls
	
	legs: [],
	legRadiusPct: 0.975,
	legsBullet: false,
	legsFriction: 10,
	legsDensity: 4,
	
	motors: [],
    accelerationMod: 10,
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
	groundingSizePct: { x: 0.75, y: 0.3 },
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
		
	    this.parent.apply( this, arguments );
		
		// could be a better way to do cooldowns?
		
		this.jump = _ut.cooldown( this.jump.bind( this ), this.jumpCooldown );
		
		// legs properties
		
		this.legCount = this.legCount || Math.max( 1, Math.ceil( this.size.x / this.size.y - 0.25 ) );
		this.legRadius = this.legRadius || Math.min( this.size.y, ( ( this.size.x * this.legRadiusPct ) / this.legCount ) ) * 0.5;
		
		// approximately convert move velocity to move speed
		
		if ( _ut.isNumber( this.moveSpeed ) !== true && _ut.isNumber( this.moveVelocity ) ) {
			
			this.moveSpeed = _utp.getSpeedFromVelocity( this.moveVelocity, this.legRadius );
			
		}
		
		// set acceleration ( if not already set ) to be high enough to match speed needed
		
		if ( _ut.isNumber( this.acceleration ) !== true ) {
			
			this.acceleration = this.moveSpeed * this.accelerationMod * ( this.legRadius / ( 4 / this.legCount ) );
			
		}
		
		this.bodySize.x = this.size.x;
		this.bodySize.y = Math.max( 0, this.size.y - this.legRadius );
		
	},
	
    /**
	 * See ig.Character.
	 **/
	defineBody: function () {
		
	    this.parent.apply( this, arguments );
		
		var localX = this.legRadius - this.size.x * 0.5 + ( this.size.x - this.size.x * this.legRadiusPct ) * 0.5;
		var localY = this.bodySize.y;
		var i, il;
		
		for ( i = 0, il = this.legCount; i < il; i++ ) {
			
			var leg = {
				bodyDef: new _b2.BodyDef(),
				shapeDef: new _b2.CircleShape(),
				localX: localX,
				localY: localY
			};
			
			// body def
			
			leg.bodyDef.position.Set(
				( this.pos.x + localX ) * _s.SCALE_PHYSICS,
				( this.pos.y + localY ) * _s.SCALE_PHYSICS
			);
			leg.bodyDef.type = _b2.Body.b2_dynamicBody;
			
			// shape def
			
			leg.shapeDef.SetRadius( this.legRadius * _s.SCALE_PHYSICS );
			
			this.legs.push( leg );
			
			localX += this.legRadius * 2;
			
		}
		
	},
	
    /**
	 * See ig.Character.
	 **/
	createBody: function() {
		
	    this.parent.apply( this, arguments );
		
		var me = this;
		var i, il;
		
		this.legsMass = 0;
		
		for ( i = 0, il = this.legCount; i < il; i++ ) {
			
			var legDef = this.legs[ i ];
			
			var leg = this.getWorld().CreateBody( legDef.bodyDef );
			
			leg.SetUserData( this );
			
			// friction is high on legs so that it rolls, climbs slopes, and stops on slopes properly
			// density should be higher on legs than body, or stopping will be a wobble
			
			leg.CreateFixture2( legDef.shapeDef, this.legsDensity );
			_utp.forEachInStack( leg.GetFixtureList(), function () {
				
				// negative filter groupIndex ensures no fixtures in this entity will collide
				
				var filter = this.GetFilterData();
				filter.groupIndex = -me.id;
				this.SetFilterData( filter );
				
				this.SetFriction( this.legsFriction );
				this.SetRestitution( 0 );
				this.SetUserData( 'leg' );
				
			} );
			
			this.legsMass += leg.GetMass();
			
			// motorize legs with revolute joint
			
			var motorJointDef = new _b2.RevoluteJointDef();
			
			motorJointDef.Initialize( this.body, leg, leg.GetWorldCenter() );
			motorJointDef.localAnchorA.Set(
				legDef.localX * _s.SCALE_PHYSICS,
				legDef.localY * 0.5 * _s.SCALE_PHYSICS
			);
			
			var motorJoint = this.getWorld().CreateJoint( motorJointDef );
			motorJoint.SetMaxMotorTorque( this.acceleration );
			motorJoint.SetMotorSpeed( 0 );
			motorJoint.EnableMotor( true );
			
			this.motors[ i ] = motorJoint;
			
			// replace and store
			
			this.legs[ i ] = leg;
			
		}
		
		this.totalMass = this.body.GetMass() + this.legsMass;
		
		//add sensor to bottom to detect grounded
		
		var groundSensor = new _b2.PolygonShape();
		var groundSensorWidth = this.size.x * this.groundingSizePct.x;
		var groundSensorHeight = this.size.y * this.groundingSizePct.y;
		
		groundSensor.SetAsOrientedBox(
			groundSensorWidth * 0.5 * _s.SCALE_PHYSICS,
			groundSensorHeight * 0.5 * _s.SCALE_PHYSICS,
			new _b2.Vec2(
				0,
				( this.bodySize.y * 0.5 + this.legRadius ) * _s.SCALE_PHYSICS
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
	destroyBody: function () {
		
		var world = this.getWorld();
		
		_ut.forEach( this.motors, function () {
			
			world.DestroyJoint( this );
			
		} );
		_ut.forEach( this.legs, function () {
			
			world.DestroyBody( this );
			
		} );
		this.legs = [];
		this.motors = [];
		
		this.parent.apply( this, arguments );
		
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
			
			_ut.arrayCautiousRemove( this.climbingOn, fixtureTarget );
			
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
			_ut.arrayCautiousRemove( this.groundedOn, fixtureTarget );
			
			if ( this.grounded === 0 ) {
				
				this.ungroundedFor = 0;
				
				_ut.forEach( this.legs, function () {
					
					_utp.forEachInStack( this.GetFixtureList(), function () {
						this.SetFriction( 0 );
					} );
					
				} );
				
			}
		
		}
		
	},
	
	/**
	 * See ig.Character.
	 **/
	applyAntiVelocity: function () {
		
		this.parent.apply( this, arguments );
		
		var me = this;
		
		_ut.forEach( this.legs, function () {
			
			var velocity = this.GetLinearVelocity();
			var mass = this.GetMass();
			
			this.ApplyImpulse( me.utilVec2Zero1.Set( mass * -velocity.x, mass * -velocity.y ), this.GetPosition() );
			
		} );
		
	},
	
	/**
	 * See ig.Character.
	 **/
	applyAntiVelocityX: function () {
		
		this.parent.apply( this, arguments );
		
		var me = this;
		
		_ut.forEach( this.legs, function () {
			
			this.ApplyImpulse( me.utilVec2Zero1.Set( this.GetMass() * -this.GetLinearVelocity().x, 0 ), this.GetPosition() );
			
		} );
		
	},
	
	/**
	 * See ig.Character.
	 **/
	applyAntiVelocityY: function () {
		
		this.parent.apply( this, arguments );
		
		var me = this;
		
		_ut.forEach( this.legs, function () {
			
			this.ApplyImpulse( me.utilVec2Zero1.Set( 0, this.GetMass() * -this.GetLinearVelocity().y ), this.GetPosition() );
			
		} );
		
	},
	
	/**
	 * See ig.Character.
	 **/
	applyAntiGravity: function () {
		
		var pct = this.parent.apply( this, arguments );
		
		var gravity = this.getWorld().GetGravity();
		var me = this;
		
		_ut.forEach( this.legs, function () {
			
			var mass = this.GetMass();
			
			this.ApplyForce( me.utilVec2UpdateAntiGrav1.Set( mass * -gravity.x * pct, mass * -gravity.y * pct ), this.GetPosition() );
		
		} );
		
	},
	
	/**
	 * Stops motor joint and makes frictionless.
	 **/
	stopMotor: function () {
		
		_ut.forEach( this.motors, function () {
			
			this.SetMotorSpeed( 0 );
			
		} );
		
		_ut.forEach( this.legs, function () {
			
			_utp.forEachInStack( this.GetFixtureList(), function () {
				this.SetFriction( 0 );
			} );
			
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
			
			var impulse = this.utilVec2Jump1.Set( 0, this.totalMass * -this.jumpForce );
			var position = this.body.GetPosition();
			this.body.ApplyImpulse( impulse, position );
			
			// apply some of jump force down into whatever character is standing on
			
			var worldPosition = this.body.GetWorldPoint( position );
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
			
			if ( !this.jumping && _utm.oppositeSidesOfZero( this.body.GetLinearVelocity().y, this.getWorld().GetGravity().y ) ) {
				
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
		
		var me = this;
		var i, il;
		var velocity = this.body.GetLinearVelocity();
		var vx = velocity.x;
		var vy = velocity.y;
		
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
			
			var tx = _utp.getVelocityFromSpeed( this.moveSpeedTargetX, this.legRadius );
			var ty = _utp.getVelocityFromSpeed( this.moveSpeedTargetY, this.legRadius );
			
			// apply force instead of relying on motor
			
			if ( vx !== tx || vy !== ty ) {
				
				var force = this.utilVec2UpdateMove1.Set(
					this.totalMass * ( tx - vx ) * ( tx === 0 ? 1 : this.climbingControlApplied ) * 0.5 / ig.system.tick,
					this.totalMass * ( ty - vy ) * ( ty === 0 ? 1 : this.climbingControlApplied ) * 0.5 / ig.system.tick
				);
				this.body.ApplyForce( force, this.body.GetPosition() );
				
			}
			
			this.climbingFor += ig.system.tick;
			
		}
		else if ( this.grounded === 0 || this.jumping ) {
			
			this.stopMotor();
			
			var tx = _utp.getVelocityFromSpeed( this.moveSpeedTargetX, this.legRadius );
			
			// apply force instead of relying on motor
			
			if ( vx !== tx ) {
				
				this.jumpControlApplied = this.jumpControl;
				
				var velocityDeltaX = ( tx - vx ) * this.jumpControl;
				var force = this.utilVec2UpdateMove1.Set(
					this.totalMass * ( tx - vx ) * this.jumpControlApplied * 0.5 / ig.system.tick,
					0
				);
				this.body.ApplyForce( force, this.body.GetPosition() );
				
			}
			
		}
		else {
			
			// roll legs while on ground
			
			_ut.forEach( this.motors, function () {
				
				this.SetMotorSpeed( me.moveSpeedTargetX );
				
			} );
			
			_ut.forEach( this.legs, function () {
				
				_utp.forEachInStack( this.GetFixtureList(), function () {
					this.SetFriction( me.legsFriction );
				} );
				
			} );
			
			if ( this.groundedFor >= this.groundedForThreshold && this.jumping !== true ) {
				
				// apply extra gravity to stick to ground better
				// else slopes make the character fly
				
				var groundingMagnitude = this.totalMass * Math.max( 1, this.moveSpeed * this.groundingForce );
				
				this.body.ApplyImpulse( new _b2.Vec2( 0, groundingMagnitude ), this.body.GetPosition() );
				
				
			}
			
		}
		
		// animation
		
		this.currentAnim.stop = false;
		
		if ( this.jumpPushing === true && this.anims.jump ) {
			
			this.currentAnim = this.anims.jump;
			
		}
		else if ( this.climbing === true && this.anims.climb ) {
			
			if ( _utm.almostEqual( vx, 0, _s.PRECISION_ZERO ) && _utm.almostEqual( vy, 0, _s.PRECISION_ZERO ) ) {
				
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
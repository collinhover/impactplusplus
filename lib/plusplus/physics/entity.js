/**
 * Entity for integration with physics system and collisions.
 * @extends ig.EntityExtended
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'plusplus.physics.entity'
)
.requires(
	'plusplus.core.entity',
	'plusplus.helpers.utils',
	'plusplus.helpers.utilsphysics',
	'plusplus.physics.box2d'
)
.defines(function(){ "use strict";

var _u = ig.utils;
var _up = ig.utilsphysics;
var _b2 = ig.Box2D;

ig.EntityPhysics = ig.EntityExtended.extend({
	
	/* default no type */
	type: ig.Entity.TYPE.NONE,
	
	/* unused */
	checkAgainst: ig.Entity.TYPE.NONE,
	
	/* unused */
	collides: ig.Entity.COLLIDES.NEVER,
	
	/* types to fully ignore collisions with */
	typesPassThrough: [],
	
	bodyType: 'static',
	bodySizePct: { x: 1, y: 1 },
	bodyOffsetPct: { x: 0, y: 0 },
	bodyAngle: 0,
	bodyBullet: false,
	
	density: 1,
	friction: 0.3,
	restitution: 0,
	
	/* true if this should note collision overlap but not cause collision response */
	sensor: false,
	
	/* true if this is a one-way body */
	oneWay: false,
	
	/* direction of normal to trigger one-way collision ( default = up ) */
	oneWayFacing: { x: 0, y: -1 },
	
	/* do not change, used for contacts with one-way bodies */
	contactingOneWay: [],
	collidingWithOneWay: 0,
	
	/* true if this is climbable */
	climbable: false, 
	
	/* amount to modify speed of object climbing on this */
	climbingControl: 1, 
	
	/* physics body can rotate */
	fixedRotation: false,
	
	/* sprite ignores physics body rotation */
	ignoreBodyRotation: false, 
	
	init: function() {
		
		this.utilVec2Zero1 = new _b2.Vec2();
		
	    this.parent.apply( this, arguments );
	    
	    // when not in editor
		
	    if( !ig.global.wm ) {
			
			this.createBody();
			
	    }
		
	},
	
	/**
	* Defines physics system body, based on settings passed to init.
	**/
	defineBody: function() {
		
		// body = meta properties
		
		this.bodyDef = new _b2.BodyDef();
		
		this.bodyDef.position.Set(
			this.getCenterX() * _b2.SCALE,
			this.getCenterY() * _b2.SCALE
		);
		
		// body type (defaults to static)
		
		// kinematic 
		if ( this.bodyType === 'kinematic' ) {
			
			this.bodyDef.type = _b2.Body.b2_kinematicBody;
			
		}
		// dynamic
		else if ( this.bodyType === 'dynamic' ) {
			
			this.bodyDef.type = _b2.Body.b2_dynamicBody;
			
		}
		
		// fixture = shape
		
		this.shapeDefs = [];
		
		var baseShapeDef;
		var i, il, v1, v2, shapeVertices;
		
		if ( this.bodyShape === 'circle' ) {
			
			baseShapeDef = new _b2.CircleShape();
			
			baseShapeDef.SetRadius( ( this.radius || Math.max( this.size.x, this.size.y ) * 0.5 ) * Math.max( this.bodySizePct.x, this.bodySizePct.y ) * _b2.SCALE );
			
			this.shapeDefs.push( baseShapeDef );
			
		}
		else if ( this.bodyShape === 'edge' ) {
			
			this.b2vertices = _up.getb2Vectors( this.vertices );
			
			// add vertices as a polygon edge shape
			
			v1 = this.b2vertices[ this.b2vertices.length - 1 ];
			
			for ( i = 0, il = this.b2vertices.length; i < il; i++, v1 = v2 ) {
				
				v2 = this.b2vertices[ i ];
				
				baseShapeDef = new _b2.PolygonShape();
				baseShapeDef.SetAsEdge( v1, v2 ); 
				this.shapeDefs.push( baseShapeDef );
				
			}
			
		}
		else if ( this.bodyShape !== 'none' ) {
			
			baseShapeDef = new _b2.PolygonShape();
			
			// polygon
			
			if ( this.vertices && this.vertices.length > 2 ) {
				
				this.b2vertices = _up.getb2Vectors( this.vertices );
				
				baseShapeDef.SetAsArray( this.b2vertices, this.b2vertices.length );
				
			}
			// default to box
			else {
				
				baseShapeDef.SetAsOrientedBox(
					this.size.x * 0.5 * this.bodySizePct.x * _b2.SCALE,
					this.size.y * 0.5 * this.bodySizePct.y * _b2.SCALE,
					new _b2.Vec2(
						this.totalOffsetX() * _b2.SCALE,
						this.totalOffsetY() * _b2.SCALE
					),
					this.bodyAngle
				);
				
				// generate vertices
				
				this.vertices = [];
				shapeVertices = baseShapeDef.m_vertices;
				
				for ( i = 0, il = shapeVertices.length; i < il; i++ ) {
					
					v1 = shapeVertices[ i ];
					this.vertices[ i ] = { x: v1.x / _b2.SCALE, y: v1.y / _b2.SCALE };
					
				}
				
				this.b2vertices = _up.getb2Vectors( this.vertices, this.size.x * 0.5, this.size.y * 0.5 );
				
			}
			
			this.shapeDefs.push( baseShapeDef );
			
		}
		
		
	},
	
	/**
	* Create entity's physics body.
	**/
	createBody: function() {
		
		var me = this;
		
		if ( !this.bodyDef ) {
			
			this.defineBody();
			
		}
		
		if ( !this.body ) {
			
			this.body = this.getWorld().CreateBody( this.bodyDef );
			
			// initial properties
			
			this.body.SetLinearVelocity( new _b2.Vec2( 0, 0 ) );
			this.body.SetAngle( this.angle );
			this.body.SetFixedRotation( this.fixedRotation );
			this.body.SetUserData( this );
			
			// define as 'bullet' to improve collision detection and eliminate tunneling issues
			
			this.body.SetBullet( this.bodyBullet ); 
			
			// fixtures
			
			for ( var i = 0, il = this.shapeDefs.length; i < il; i++ ) {
				
				this.body.CreateFixture2( this.shapeDefs[ i ], this.density );
				
			}
			
			_up.forEachFixture( this.body, function () {
				this.SetRestitution( me.restitution );
				this.SetFriction( me.friction );
				this.SetSensor( me.sensor );
				
				if ( me.climbable ) {
					this.SetUserData( 'climbable' );
				}
				
			} );
			
		}
		
	},
	
	/**
	* Deferred removal of entity's physics body.
	**/
	destroyPhysics: function () {
		
		ig.game.removeEntityPhysics( this );
		
	},
	
	/**
	* Instant removal of entity's physics objects. It is not recommended to call this function.
	**/
	destroyPhysicsInstantly: function () {
		
		this.getWorld().DestroyBody( this.body );
		this.body = undefined;
		
	},
	
	/**
	 * @returns {PhysicsWorld} physics world this entity is in.
	 **/
	getWorld: function () {
		
		return ig.game.layers[ this.layerName ].world;
		
	},
	
	/**
	 * @returns {Number} horizontal offset.
	 **/
	totalOffsetX: function () {
		
		return this.size.x * this.bodyOffsetPct.x;
		
	},
	
	/**
	 * @returns {Number} vertical offset.
	 **/
	totalOffsetY: function () {
		
		return this.size.y * this.bodyOffsetPct.y;
		
	},
	
	/**
	 * Zeroes out velocities.
	 **/
	applyAntiVelocity: function () {
		
		var bodyVelocity = this.body.GetLinearVelocity();
		var bodyMass = this.body.GetMass();
		
		this.body.ApplyImpulse( this.utilVec2Zero1.Set( bodyMass * -bodyVelocity.x, bodyMass * -bodyVelocity.y ), this.body.GetPosition() );
		
	},
	
	/**
	 * Zeroes out x velocities.
	 **/
	applyAntiVelocityX: function () {
		
		this.body.ApplyImpulse( this.utilVec2Zero1.Set( this.body.GetMass() * -this.body.GetLinearVelocity().x, 0 ), this.body.GetPosition() );
		
	},
	
	/**
	 * Zeroes out y velocities.
	 **/
	applyAntiVelocityY: function () {
		
		this.body.ApplyImpulse( this.utilVec2Zero1.Set( 0, this.body.GetMass() * -this.body.GetLinearVelocity().y ), this.body.GetPosition() );
		
	},
	
	/**
	 * Applys anti gravity based on factor.
	 * @param {Number} (optional, default = 1 ) Amount of anti-gravity to apply from.
	 **/
	applyAntiGravity: function ( pct ) {
		
		if ( !_u.isNumber( pct ) ) {
			
			pct = 1;
			
		}
		
		var gravity = this.getWorld().GetGravity();
		var massBody = this.body.GetMass();
		
		this.body.ApplyForce( this.utilVec2UpdateAntiGrav1.Set( massBody * -gravity.x * pct, massBody * -gravity.y * pct ), this.body.GetPosition() );
		
		return pct;
		
	},
	
	/**
	* Called when contact starts with any entity (use instead of collidesWith).
	* @param {EntityPhysics} Contacted entity
	* @param {Object} Contact manifold, with manifold.m_localPlaneNormal and manifold.m_localPoint
	* @param {Object} Fixture (shape) of this entity
	* @param {Object} Fixture (shape) of contacted entity
	* @param {Object} Contact Record for when contacting a special type such as a one-way platform, only passed for non-sensors.
	**/
	beginContact: function ( entityTarget, manifold, fixtureSelf, fixtureTarget, contactRecord ) {},
	
	/**
	* Called when contact ends with any entity (use instead of collidesWith).
	* @params See beginContact
	**/
	endContact: function ( entityTarget, manifold, fixtureSelf, fixtureTarget, contactRecord ) {},
	
	/**
	* Called just before world step. Useful for applying anti-grav, as all forces are cleared after world step.
	**/
	updatePreStep: function () {},
	
	update: function() {
		
		// no need to update unless body is awake
		
		if ( this.body && this.body.IsAwake() ) {
			
			this.recordLast();
			
			var p = this.body.GetPosition();
			
			this.pos = {
				x:	( p.x / _b2.SCALE - this.getSizeX() * 0.5 + this.totalOffsetX() * 0.5 ),
				y: ( p.y / _b2.SCALE - this.getSizeY() * 0.5 + this.totalOffsetY() * 0.5 )
			};
			
			if ( this.ignoreBodyRotation !== true ) {
				this.angle = this.body.GetAngle().round(2);
			}
			
			this.recordChanges();
			
		}
		else {
			
			this.changed = false;
			
		}
		
		if ( this.currentAnim ) {
			
			this.currentAnim.update();
			this.currentAnim.angle = this.angle;
			
		}
		
	}
	
});
    
});
/**
 * Entity for integration with physics system and collisions.
 * @extends ig.EntityExtended
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.physics.entity'
)
.requires(
	'game.core.entity',
	'game.helpers.utils',
	'game.helpers.utilsphysics',
	'game.physics.box2d'
)
.defines(function(){ "use strict";

var _u = ig.utils;
var _up = ig.utilsphysics;
var _b2 = ig.Box2D;

ig.EntityPhysics = ig.EntityExtended.extend({
	
	type: ig.Entity.TYPE.NONE, // default no type
	checkAgainst: ig.Entity.TYPE.NONE, // still used for impact style collisions after physics checks
	collides: ig.Entity.COLLIDES.NEVER, // not used as collision detection is handled by physics
	
	body: null,
	bodySizePct: { x: 1, y: 1 },
	bodyOffsetPct: { x: 0, y: 0 },
	bodyAngle: 0,
	bodyBullet: false,
	
	density: 1,
	friction: 0.3,
	restitution: 0,
	
	fixedRotation: false,
	ignoreBodyRotation: false,
	
	init: function() {
		
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
		
		// body type
		
		// kinematic 
		if ( this.bodyType === 'kinematic' ) {
			
			this.bodyDef.type = _b2.Body.b2_kinematicBody;
			
		}
		// static
		else if ( this.bodyType === 'static' ) {
			
			this.bodyDef.type = _b2.Body.b2_staticBody;
			
		}
		// default dynamic
		else {
			
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
	* Called when contact starts with any entity (use instead of collidesWith).
	* @param {EntityPhysics} Contacted entity
	* @param {Object} Contact manifold, with manifold.m_localPlaneNormal and manifold.m_localPoint
	* @param {Object} Fixture (shape) of this entity
	* @param {Object} Fixture (shape) of contacted entity
	**/
	beginContact: function ( entityTarget, manifold, fixtureSelf, fixtureTarget ) {},
	
	/**
	* Called when contact ends with any entity (use instead of collidesWith).
	* @params See beginContact
	**/
	endContact: function ( entityTarget, manifold, fixtureSelf, fixtureTarget ) {},
	
	/**
	* Called when contact starts with a checked against type (use instead of collidesWith).
	* @params See beginContact
	**/
	beginContactWithChecked: function ( entityTarget, manifold, fixtureSelf, fixtureTarget ) {},
	
	/**
	* Called when contact ends with a checked against type (use instead of collidesWith).
	* @params See beginContact
	**/
	endContactWithChecked: function ( entityTarget, manifold, fixtureSelf, fixtureTarget ) {},
	
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
				x:	( p.x / _b2.SCALE - this.size.x * 0.5 + this.totalOffsetX() * 0.5 ),
				y: ( p.y / _b2.SCALE - this.size.y * 0.5 + this.totalOffsetY() * 0.5 )
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
/**
 * Entity for world collision map shapes.
 * @extends ig.EntityPhysics
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.physics.collision-shape'
)
.requires(
	'game.helpers.utilsmath',
	'game.physics.entity',
	'game.physics.box2d'
)
.defines(function(){ "use strict";

var _um = ig.utilsmath;
var _b2 = ig.Box2D;

ig.EntityCollisionShape = ig.EntityPhysics.extend( {
	
	// block light at edges but not inside
	
	opaque: true,
	hollow: true,
	diffuse: 1,
	
	bodyType: 'static',
	bodyShape: 'edge',
	
	fixedRotation: true,
	ignoreBodyRotation: true
	
} );

} );
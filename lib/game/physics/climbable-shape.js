/**
 * Entity for climbing areas, generated automatically by collision map conversion.
 * @extends ig.EntityPhysics
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.physics.climbable-shape'
)
.requires(
	'game.physics.entity',
	'game.helpers.utilsphysics'
)
.defines(function(){ "use strict";

var _up = ig.utilsphysics;

ig.EntityClimbableShape = ig.EntityPhysics.extend( {
	
	fixedRotation: true,
	ignoreBodyRotation: true,
	
	climbable: true,
	climbingControl: 0.1
	
} );

} );
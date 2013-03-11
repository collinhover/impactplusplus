/**
 * Entity for climbing areas, generated automatically by collision map conversion.
 * @extends ig.EntityPhysics
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'plusplus.physics.climbable-shape'
)
.requires(
	'plusplus.physics.entity',
	'plusplus.helpers.utilsphysics'
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
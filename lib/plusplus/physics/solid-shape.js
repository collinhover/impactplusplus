/**
 * Entity for world collision map shapes, generated automatically by collision map conversion.
 * @extends ig.EntityPhysics
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'plusplus.physics.solid-shape'
)
.requires(
	'plusplus.physics.entity'
)
.defines(function(){ "use strict";

ig.EntitySolidShape = ig.EntityPhysics.extend( {
	
	/* block light */
	
	opaque: true,
	diffuse: 1,
	
	fixedRotation: true,
	ignoreBodyRotation: true
	
} );

} );
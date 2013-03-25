/**
 * Entity for light blocking, generated automatically by collision map conversion.
 * @extends ig.EntityShapePhysics
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.shapes.shape-physics-solid'
)
.requires(
	'game.shapes.shape-physics'
)
.defines(function(){ "use strict";

ig.EntityShapePhysicsSolid = ig.EntityShapePhysics.extend( {
	
	// block light
	
	opaque: true,
	diffuse: 1,
	
	// block light at edges but not inside
	
	hollow: true
	
} );

} );
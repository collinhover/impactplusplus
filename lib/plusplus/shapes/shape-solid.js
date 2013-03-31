/**
 * Entity for light blocking, generated automatically by collision map conversion.
 * @extends ig.EntityShape
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'plusplus.shapes.shape-solid'
)
.requires(
	'plusplus.shapes.shape'
)
.defines(function(){ "use strict";

ig.EntityShapeSolid = ig.EntityShape.extend( {
	
	// block light
	
	opaque: true,
	diffuse: 1,
	
	// block light at edges but not inside
	
	hollow: true
	
} );

} );
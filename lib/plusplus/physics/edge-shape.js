/**
 * Entity for world edge map shapes, generated automatically by collision map conversion.
 * @extends ig.EntitySolidShape
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'plusplus.physics.edge-shape'
)
.requires(
	'plusplus.physics.solid-shape'
)
.defines(function(){ "use strict";

ig.EntityEdgeShape = ig.EntitySolidShape.extend( {
	
	/* block light at edges but not inside */
	
	hollow: true,
	
	bodyShape: 'edge'
	
} );

} );
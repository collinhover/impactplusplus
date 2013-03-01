/**
 * Entity for world edge map shapes, generated automatically by collision map conversion.
 * @extends ig.EntitySolidShape
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.physics.edge-shape'
)
.requires(
	'game.physics.solid-shape'
)
.defines(function(){ "use strict";

ig.EntityEdgeShape = ig.EntitySolidShape.extend( {
	
	/* block light at edges but not inside */
	
	hollow: true,
	
	bodyShape: 'edge'
	
} );

} );
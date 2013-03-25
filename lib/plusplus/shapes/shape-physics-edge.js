/**
 * Entity for world edge map shapes, generated automatically by collision map conversion.
 * @extends ig.EntityShapePhysicsSolid
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.shapes.shape-physics-edge'
)
.requires(
	'game.shapes.shape-physics-solid'
)
.defines(function(){ "use strict";

ig.EntityShapePhysicsEdge = ig.EntityShapePhysicsSolid.extend( {
	 
	// compose as collection of edges
	
	bodyShape: 'edge'
	
} );

} );
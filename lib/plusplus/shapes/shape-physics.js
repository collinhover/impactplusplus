/**
 * Entity for world collision map shapes, generated automatically by collision map conversion.
 * @extends ig.EntityPhysics
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.shapes.shape-physics'
)
.requires(
	'game.physics.entity'
)
.defines(function(){ "use strict";

ig.EntityShapePhysics = ig.EntityPhysics.extend( {
	
	// no rotation
	
	fixedRotation: true,
	ignoreBodyRotation: true,
	
	/*
	 * See ig.EntityExtended.
	 */
	updateTypes: function () {
	
		this.parent();
		
		ig.Entity.addType( this, "SHAPE" );
		
	}
	
} );

} );
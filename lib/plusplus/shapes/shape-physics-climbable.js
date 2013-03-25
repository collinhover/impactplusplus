/**
 * Entity for climbing areas, generated automatically by collision map conversion.
 * @extends ig.EntityShapePhysics
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.shapes.shape-physics-climbable'
)
.requires(
	'game.shapes.shape-physics'
)
.defines(function(){ "use strict";

ig.EntityShapePhysicsClimbable = ig.EntityShapePhysics.extend( {
	
	// can be climbed
	
	climbable: true,
	
	/*
	 * See ig.EntityExtended.
	 */
	updateTypes: function () {
	
		this.parent();
		
		ig.Entity.addType( this, "SHAPE-CLIMBABLE" );
		
	}
	
} );

} );
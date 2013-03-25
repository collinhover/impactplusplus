/**
 * Entity for climbing areas, generated automatically by collision map conversion.
 * @extends ig.EntityShape
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.shapes.shape-climbable'
)
.requires(
	'game.shapes.shape'
)
.defines(function(){ "use strict";

ig.EntityShapeClimbable = ig.EntityShape.extend( {
	
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
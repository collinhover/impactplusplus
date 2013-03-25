/**
 * Entity for world collision map shapes, generated automatically by collision map conversion.
 * @extends ig.EntityExtended
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.shapes.shape'
)
.requires(
	'game.core.entity'
)
.defines(function(){ "use strict";

ig.EntityShape = ig.EntityExtended.extend( {
	 
	// should not collide, use as a sensor and for lighting
	
	collides: ig.Entity.COLLIDES.NEVER,
	
	/*
	 * See ig.EntityExtended.
	 */
	updateTypes: function () {
	
		this.parent();
		
		ig.Entity.addType( this, "SHAPE" );
		
	}
	
} );

} );
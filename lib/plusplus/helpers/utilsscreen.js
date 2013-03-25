/**
 * Static utilities for screen.
 * @author Collin Hover - collinhover.com
 **/
 ig.module( 
	'game.helpers.utilsscreen' 
)
.requires(
	'game.helpers.utilsintersection'
)
.defines( function(){ "use strict";

var _uti = ig.utilsintersection;
var _uts = ig.utilsscreen = {};

/**
 * Gets if an axis aligned bounding box is in the screen.
 **/
_uts.getIsAABBInScreen = function ( x, y, width, height ) {
	
	var adjustedX = x - ig.game.screen.x;
	var adjustedY = y - ig.game.screen.y;
	
	return _uti.AABBIntersectsAABB( adjustedX, adjustedY, adjustedX + width, adjustedY + height, 0, 0, ig.system.width, ig.system.height );
	
};

/*
* Finds all entities intersecting an axis aligned bounding box.
* @param {Number} left.
* @param {Number} top.
* @param {Number} right.
* @param {Number} bottom.
* @param {Object} ( optional, default = all entity layers ) layer to search.
* @param {Boolean} ( optional, default = false ) whether to sort by the game's sort method.
* @returns {Array} All entities intersecting box.
*/
_uts.entitiesInAABB = function ( left, top, right, bottom, layer, sort ) {
   
	var intersected = [];
	var i, il;
   
	if ( typeof layer === 'undefined' ) {
		
		for ( i = 0, il = ig.game.layerOrder.length; i < il; i++ ) {
			
			var layerName = ig.game.layerOrder[ i ];
			layer = ig.game.layers[layerName];
			
			if ( layer.entityLayer ) {
				
			   intersected = intersected.concat( _uts.entitiesInAABB( left, top, right, bottom, layer ) );
				
			}
			
		}
		
	}
	else {
		
		var entities = layer.items;
		
		// find if touch intersects bounding box of each entity
		
		for ( i = 0, il = entities.length; i < il; i++ ) {
			
		   var entity = entities[ i ];
		   
		   if ( _uti.AABBIntersectsAABB( left, top, right, bottom, entity.pos.x, entity.pos.y, entity.pos.x + entity.size.x, entity.pos.y + entity.size.y ) ) {
			   
			  intersected.push( entity );
			   
		   }
			
		}
		
	}
	
	if ( sort ) {
		
		intersected.sort( ig.game.sortBy );
		
	}
	
	return intersected;
   
}

} );
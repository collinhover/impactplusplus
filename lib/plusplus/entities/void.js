/**
 * Entity that does nothing and can be used as a target.
 * @extends ig.EntityExtended
 * @author Collin Hover - collinhover.com
 * @author Dominic Szablewski
 **/
ig.module(
	'game.entities.void'
)
.requires(
	'game.core.entity'
)
.defines(function(){
	
ig.global.EntityVoid = ig.EntityVoid = ig.EntityExtended.extend({
	
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(128, 28, 230, 0.7)',
	
	size: {x: 8, y: 8},
	
	update: function(){}
	
});

});
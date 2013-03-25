/**
 * Entity that instantly kills any targetted entity.
 * @extends ig.EntityPain
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'game.entities.pain-instagib'
)
.requires(
	'game.entities.pain'
)
.defines(function(){ "use strict";
	
ig.global.EntityPainInstagib = ig.EntityPainInstagib = ig.EntityPain.extend({
	
	damageAsPct: true,
	damageUnblockable: true
	
});

});
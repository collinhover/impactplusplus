/**
 * Abstract Entity for use as a character.
 * @extends ig.EntityPhysics
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
    'game.core.character'
)
.requires(
	'game.helpers.utils',
	'game.helpers.utilsmath',
	'game.helpers.utilsphysics',
    'game.physics.entity',
	'game.physics.box2d',
	'game.abilities.ability'
)
.defines( function(){ "use strict";
	
var _u = ig.utils;
var _um = ig.utilsmath;
var _up = ig.utilsphysics;
var _b2 = ig.Box2D;

ig.Character = ig.EntityPhysics.extend( {
	
	type: ig.Entity.TYPE.B,
	
	flip: false,
	
	fixedRotation: true,
	ignoreBodyRotation: true,
	
	/**
	 * See ig.EntityPhysics.
	 **/
	init: function () {
		
		this.parent.apply( this, arguments );
		
		this.abilities = this.abilitiesOriginal = new ig.Ability( 'abilities', this );
		
	},
    
	/**
	 * Starts mimicking the abilities of a target.
	 * @param {Character} character to mimic.
	 **/
	mimic: function ( target ) {
		
		var me = this;
		
		if ( target instanceof ig.Character ) {
			
			this.unmimic();
			
			this.abilities = target.abilities.clone();
			this.abilities.fallback = this.abilitiesOriginal;
			
			this.abilities.forAll( function () {
				this.setEntity( me );
				this.setEntityOptions( target );
			} );
            
        }
		
	},
    
	/**
	 * Stops mimicry.
	 **/
    unmimic: function () {
        
		if ( this.abilities !== this.abilitiesOriginal ) {
			
			// clean up clone
			
			this.abilities.executeCleanup();
			
			// revert to original
			
			this.abilities = this.abilitiesOriginal;
			
		}
        
    },
	
	/**
	* Unmimics and does own ability cleanup.
	**/
	cleanup: function () {
		
		this.unmimic();
		
		this.abilities.executeCleanup();
		
	}
	
} );

} );
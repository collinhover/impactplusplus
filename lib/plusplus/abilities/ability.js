/**
 * Ability system based on hierarchical structure.
 * @extends ig.Hierarchy
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'plusplus.abilities.ability'
)
.requires(
	'plusplus.helpers.utils',
	'plusplus.core.hierarchy'
)
.defines(function(){ "use strict";

var _u = ig.utils;

ig.Ability = ig.Hierarchy.extend( {
	
	bindings: [],
	bindingsCleanup: [],
	
	descendantsMap: {},
	
	enabled: true,
    
	init: function( name, entity, settings ) {
		
		settings = settings || {};
		
		// intercept bindings
		
		if ( settings.bindings ) {
			
			this.bind( settings.bindings );
			delete settings.bindings;
			
		}
		
		if ( settings.bindingsCleanup ) {
			
			this.bindCleanup( settings.bindingsCleanup );
			delete settings.bindingsCleanup;
			
		}
		
		this.parent.call( this, name, settings );
		
		this.entity = entity;
		
	},
    
	/**
	 * See ig.Hierarchy
	 **/
    addDescendant: function ( descendant ) {
        
		var numDescendants = this.descendants.length;
		
		this.parent( descendant );
		
		if ( numDescendants !== this.descendants.length ) {
			
			if ( descendant.entity instanceof ig.Entity !== true ) {
				
				descendant.setEntity( this.entity );
				
			}
			
		}
        
		return this;
        
    },
	
	/**
	 * Adds functions to call on execute.
	 * @param {Function|Array} function to call on execute or array of functions.
	 * @returns {Ability} this for chaining.
	 **/
	bind: function ( bindings ) {
		
		_u.arrayCautiousAddMulti( this.bindings, bindings );
		
		return this;
		
	},
	
	/**
	 * Removes functions to call on execute.
	 * @param {Function|Array} function to call on execute or array of functions.
	 * @returns {Ability} this for chaining.
	 **/
	unbind: function ( bindings ) {
		
		_u.arrayCautiousRemoveMulti( this.bindings, bindings );
		
		return this;
		
	},
	
	/**
	 * Adds functions to call on cleanup. Use cleanup to end any active or channeled abilities.
	 * @param {Function|Array} function to call on cleanup or array of functions.
	 * @returns {Ability} this for chaining.
	 **/
	bindCleanup: function ( bindings ) {
		
		_u.arrayCautiousAddMulti( this.bindingsCleanup, bindings );
		
		return this;
		
	},
	
	/**
	 * Adds functions to call on cleanup. Use cleanup to end any active or channeled abilities.
	 * @param {Function|Array} function to call on cleanup or array of functions.
	 * @returns {Ability} this for chaining.
	 **/
	unbindCleanup: function ( bindings ) {
		
		_u.arrayCautiousRemoveMulti( this.bindingsCleanup, bindings );
		
		return this;
		
	},
	
	/**
	 * Executes all bindings from this until last descendant, passing entityOptions or entity as options.
	 * @returns {Ability} this for chaining.
	 **/
	execute: function () {
		
		this.executeBindings.apply( this, [ this.bindings, this.entityOptions || this.entity ].concat( arguments ) );
		
		for ( var i = 0, il = this.descendants.length; i < il; i++ ) {
			
			var descendant = this.descendants[ i ];
			
			descendant.execute.apply( descendant, arguments );
			
		}
		
		return this;
		
	},
	
	/**
	 * Executes all cleanup bindings from this until last descendant, passing entityOptions or entity as options.
	 * @returns {Ability} this for chaining.
	 **/
	executeCleanup: function () {
		
		this.executeBindings.apply( this, [ this.bindingsCleanup, this.entityOptions || this.entity ].concat( arguments ) );
		
		for ( var i = 0, il = this.descendants.length; i < il; i++ ) {
			
			var descendant = this.descendants[ i ];
			
			descendant.executeCleanup.apply( descendant, arguments );
			
		}
		
		return this;
		
	},
	
	/**
	 * Executes an array of bindings for this only in the context of entity.
	 * @param {Array} array of bindings.
	 * @returns {Ability} this for chaining.
	 **/
	executeBindings: function ( bindings ) {
	
		if ( this.enabled === true ) {
			
			var args = Array.prototype.slice.call( arguments, 1 );
			
			for ( var i = 0, il = bindings.length; i < il; i++ ) {
				
				var binding = bindings[ i ];
				
				binding.apply( this.entity, args );
				
			}
			
		}
		
		return this;
		
	},
	
	/**
	 * Sets the entity for bindings execution context.
	 * @param {Entity} entity object.
	 * @returns {Ability} this for chaining.
	 **/
	setEntity: function ( entity ) {
		
		this.entity = entity;
		
		for ( var i = 0, il = this.descendants.length; i < il; i++ ) {
			
			this.descendants[ i ].setEntity( entity );
			
		}
		
		return this;
		
	},
	
	/**
	 * Sets the entity for passing to bindings as options object.
	 * @param {Entity} entity object.
	 * @returns {Ability} this for chaining.
	 **/
	setEntityOptions: function ( entity ) {
		
		this.entityOptions = entity;
		
		for ( var i = 0, il = this.descendants.length; i < il; i++ ) {
			
			this.descendants[ i ].setEntityOptions( entity );
			
		}
		
		return this;
		
	},
	
	/**
	 * Enables or disables execution.
	 * @param {Boolean} true if enabled.
	 * @returns {Ability} this for chaining.
	 **/
	setEnabled: function ( enabled ) {
		
		this.enabled = enabled;
		
		for ( var i = 0, il = this.descendants.length; i < il; i++ ) {
			
			this.descendants[ i ].setEnabled( enabled );
			
		}
		
		return this;
		
	},
	
	/**
	 * Clones this ability object.
	 * @param {Ability} (optional) ability object to clone into.
	 * @returns {Ability} copy of this.
	 **/
	clone: function ( c ) {
		
		if ( c instanceof ig.Ability !== true ) {
            
            c = new ig.Ability();
            
        }
		
		c.enabled = this.enabled;
		c.entity = this.entity;
		c.entityOptions = this.entityOptions;
		c.bindings = this.bindings.slice( 0 );
		c.bindingsCleanup = this.bindingsCleanup.slice( 0 );
		
        return this.parent( c );
		
	}
    
} );

/**
 * Ability types for easy mimicking between characters.
 **/
ig.Ability.TYPE = {
	PRIMARY: 1,
	SECONDARY: 2,
	TERTIARY: 3
};

/**
 * Ability types as list for faster iteration.
 **/
ig.Ability.TYPES = [];

for ( var type in ig.Ability.TYPE ) {
	
	ig.Ability.TYPES.push( ig.Ability.TYPE[ type ] );
	
}

} );
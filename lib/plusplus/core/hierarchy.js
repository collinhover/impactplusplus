/**
 * Abstract hierarchy structure using ancestor/descendant instead of child/parent.
 * Parent is avoided because it is the ancestor function of every function in any module extending Impact's Class.
 * @extends ig.Class
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'plusplus.core.hierarchy'
)
.requires(
    'plusplus.helpers.utils'
)
.defines(function(){ "use strict";

var _u = ig.utils;

var count = 0;

ig.Hierarchy = ig.Class.extend( {
	
    id: count++,
    name: '',
    
	descendants: [],
    descendantsMap: {},
    
	/**
	 * See ig.Class
	 **/
	init: function( name, settings ) {
        
        this.id = count++;
        this.name = name;
        
		ig.merge( this, settings );
        
    },
    
	/**
	 * Sets the ancestor of this.
	 * @param {Hierarchy} hierarchy object.
	 * @returns {Hierarchy} this for chaining.
	 **/
    setAncestor: function ( ancestor ) {
        
        this.ancestor = ancestor;
        
		return this;
        
    },
    
	/**
	 * Sets the name of this and remaps this within ancestor for quick by-name lookups.
	 * @param {String} name of this.
	 * @returns {Hierarchy} this for chaining.
	 **/
    setName: function ( name ) {
        
        if ( this.name !== name ) {
            
            if ( this.ancestor instanceof ig.Hierarchy ) {
                
                this.ancestor.unmapDescendant( this );
                
            }
            
            this.name = name;
            
            if ( this.ancestor instanceof ig.Hierarchy ) {
                
                this.ancestor.mapDescendant( this );
                
            }
            
        }
        
        return this;
        
    },
    
	/**
	 * Sets the fallback hierarchy of this for when a lookup by name is done and nothing found.
	 * @param {Hierarchy} hierarchy object.
	 * @returns {Hierarchy} this for chaining.
	 **/
    setFallback: function ( fallback ) {
        
        this.fallback = fallback;
        
        return this;
        
    },
    
	/**
	 * Adds one or more descendants.
	 * @param {Hierarchy|Array} hierarchy object or array of objects.
	 * @returns {Hierarchy} this for chaining.
	 **/
    addDescendants: function ( descendants ) {
		
        descendants = _u.toArray( descendants );
        
        for ( var i = 0, il = descendants.length; i < il; i++ ) {
            
            this.addDescendant( descendants[ i ] );
            
        }
        
		return this;
		
	},
    
	/**
	 * Adds a descendant.
	 * @param {Hierarchy} hierarchy object.
	 * @returns {Hierarchy} this for chaining.
	 **/
    addDescendant: function ( descendant ) {
        
        if ( descendant instanceof ig.Hierarchy && this.isAncestor( descendant ) !== true ) {
            
            if ( descendant.ancestor !== undefined ) {
                
				descendant.ancestor.removeDescendant( descendant );
                
			}
            
			descendant.setAncestor( this );
            this.mapDescendant( descendant );
			this.descendants.push( descendant );
            
        }
        
		return this;
        
    },
	
    /**
	 * Removes one or more descendants.
	 * @param {Hierarchy|Array} hierarchy object or array of objects.
	 * @returns {Hierarchy} this for chaining.
	 **/
    removeDescendants: function ( descendants ) {
		
		descendants = _u.toArray( descendants );
        
        for ( var i = 0, il = descendants.length; i < il; i++ ) {
            
            this.removeDescendant( descendants[ i ] );
            
        }
        
		return this;
        
    },
    
	/**
	 * Removes a descendant.
	 * @param {Hierarchy} hierarchy object.
	 * @returns {Hierarchy} this for chaining.
	 **/
    removeDescendant: function ( descendant ) {
        
        var index = _u.indexOfValue( this.descendants, descendant );
        
        if ( index !== -1 ) {
            
            descendant.setAncestor();
            this.descendants.splice( index, 1 );
            this.unmapDescendant( descendant );
            
        }
        else {
            
            for ( var i = 0, il = this.descendants.length; i < il; i++ ) {
                
                this.descendants[ i ].removeDescendant( descendant );
                
            }
            
        }
        
		return this;
        
    },
    
	/**
	 * Removes all descendants.
	 * @returns {Hierarchy} this for chaining.
	 **/
    clearDescendants: function () {
        
        for ( var i = this.descendants.length - 1; i >= 0; i-- ) {
            
            var descendant = this.descendants[ i ];
            
            descendant.setAncestor();
            this.descendants.length--;
            this.unmapDescendant( descendant );
            
        }
        
        return this;
        
    },
    
	/**
	 * Maps a descendant by name for faster lookups.
	 * @param {Hierarchy} hierarchy object.
	 * @returns {Hierarchy} this for chaining.
	 **/
    mapDescendant: function ( descendant ) {
        
        var existing = this.descendantsMap[ descendant.name ];
        
        if ( existing instanceof ig.Hierarchy ) {
            
            existing.ancestor.removeDescendant( existing );
            
        }
        
        this.descendantsMap[ descendant.name ] = descendant;
        
        return this;
        
    },
    
	/**
	 * Unmaps a descendant by name.
	 * @param {Hierarchy} hierarchy object.
	 * @returns {Hierarchy} this for chaining.
	 **/
    unmapDescendant: function ( descendant ) {
        
        var mapped = this.descendantsMap[ descendant.name ];
        
        if ( descendant === mapped ) {
            
            delete this.descendantsMap[ descendant.name ];
            
        }
        
        return this;
        
    },
    
	/**
	 * Searches for a descendant by name and, optionally, searches recursively.
	 * @param {String} name of hierarchy.
	 * @param {Boolean} (optional, default = false ) search recursively.
	 * @returns {Hierarchy} descendant if found.
	 **/
    getDescendantByName: function ( name, recursive ) {
        
        var descendant = this._getDescendantByName( name, recursive );
        
        if ( !descendant && this.fallback instanceof ig.Hierarchy ) {
            
            descendant = this.fallback._getDescendantByName( name, recursive );
            
        }
        
        return descendant;
        
    },
    
	/**
	 * Internal search by name method, do not use.
	 * @returns {Hierarchy} descendant if found.
	 **/
    _getDescendantByName: function ( name, recursive ) {
        
        var descendant = this.descendantsMap[ name ];
        
        if ( recursive === true && !descendant ) {
            
            for ( var i = 0, il = this.descendants.length; i < il; i++ ) {
                
                descendant = this.descendants[ i ].getDescendantByName( name, recursive );
                
                if ( descendant ) {
                    
                    break;
                    
                }
                
            }
            
        }
        
        return descendant;
        
    },
	
	/**
	 * Gets all descendants from here to last descendant.
	 * @returns {Array} array of all descendants.
	 **/
	getDescendants: function ( array ) {
        
        array = _u.toArray( array ).concat( this.descendants );
        
        for ( var i = 0, il = this.descendants.length; i < il; i++ ) {
            
            array = this.descendants[ i ].getDescendants( array );
            
        }
        
        return array;
        
	},
    
	/**
	 * Gets root ancestor.
	 * @returns {Hierarchy} root if found.
	 **/
    getRoot: function () {
        
        var ancestor = this;
        var root;
        
        while ( ancestor ) {
            
            root = ancestor;
            ancestor = ancestor.ancestor;
            
        }
        
        return root;
        
    },
    
	/**
	 * Gets if a target is an ancestor.
	 * @param {Hierarchy} hierarchy object.
	 * @returns {Boolean} true if ancestors, false if not.
	 **/
    isAncestor: function ( target ) {
      
        var ancestor = this.ancestor;
        
        while ( ancestor ) {
            
            if ( ancestor === target ) {
                
                return true;
                
            }
            
            ancestor = ancestor.ancestor;
            
        }
        
        return false;
        
    },
    
	/**
	 * Executes a function in the context of each descendant.
	 * @param {Function} callback function.
	 * @returns {Hierarchy} this for chaining.
	 **/
    forAll: function ( callback ) {
        
        var args = Array.prototype.slice.call( arguments, 1 );
        
        callback.apply( this, args );
        
        for ( var i = 0, il = this.descendants.length; i < il; i++ ) {
            
            var descendant = this.descendants[ i ];
            
            descendant.forAll.apply( descendant, arguments );
            
		}
        
		return this;
        
    },
    
	/**
	 * Executes a function in the context of each descendant that has a function with a matching name.
	 * @param {String} callback function name.
	 * @returns {Hierarchy} this for chaining.
	 **/
    forAllWithCallback: function ( callbackName ) {
        
        var callback = this[ callbackName ];
        
        if ( callback ) {
            
            var args = Array.prototype.slice.call( arguments, 1 );
            callback.apply( this, args );
            
            for ( var i = 0, il = this.descendants.length; i < il; i++ ) {
                
                var descendant = this.descendants[ i ];
                
                descendant.forAllWithCallback.apply( descendant, arguments );
                
            }
            
        }
        
		return this;
        
    },
    
	/**
	 * Executes a function in the context of each immediate descendant.
	 * @param {Function} callback function.
	 * @returns {Hierarchy} this for chaining.
	 **/
    forImmediate: function ( callback ) {
        
        var args = Array.prototype.slice.call( arguments, 1 );
        
        callback.apply( this, args );
        
        for ( var i = 0, il = this.descendants.length; i < il; i++ ) {
            
            callback.apply( this.descendants[ i ], args );
            
		}
        
		return this;
        
    },
    
	/**
	 * Executes a function in the context of each immediate descendant that has a function with a matching name.
	 * @param {String} callback function name.
	 * @returns {Hierarchy} this for chaining.
	 **/
    forImmediateWithCallback: function ( callbackName ) {
        
        var callback = this[ callbackName ];
        
        if ( callback ) {
            
            var args = Array.prototype.slice.call( arguments, 1 );
            callback.apply( this, args );
            
            for ( var i = 0, il = this.descendants.length; i < il; i++ ) {
                
                var descendant = this.descendants[ i ];
                
                descendant.forImmediateWithCallback.apply( descendant, arguments );
                
            }
            
        }
        
		return this;
        
    },
    
	/**
	 * Clones this hierarchy object.
	 * @param {Hierarchy} (optional) hierarchy object to clone into.
	 * @returns {Hierarchy} copy of this.
	 **/
    clone: function ( c ) {
        
        if ( c instanceof ig.Hierarchy !== true ) {
            
            c = new ig.Hierarchy();
            
        }
        
        c.name = this.name;
        
        for ( var i = 0, il = this.descendants.length; i < il; i++ ) {
            
			c.addDescendant( this.descendants[ i ].clone() );
            
		}
        
        return c;
        
    }
    
} );

} );
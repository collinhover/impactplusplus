/**
 * Shims to ensure support for shaky functions.
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.helpers.shims' 
)
.defines( function(){ "use strict";

if ( typeof Date.now !== 'function' ) {
    
    Date.now = function () {
        return +(new Date);
    };
    
}

} );
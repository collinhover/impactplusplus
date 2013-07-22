ig.module(
        'plusplus.helpers.utilsclass'
    )
    .defines(function () {
        "use strict";

        /**
         * Utilities to enhance Impact's class.
         * @memberof ig
         * @namespace ig.utilsclass
         * @author Collin Hover - collinhover.com
         */
        ig.utilsclass = {};

        /**
         * Generic pooling to avoid constantly creating new objects.
         * <span class="alert"><strong>IMPORTANT:</strong> this will only add pooling methods once to a prototype, so if you override them make sure to call parent()!</span>
         * @param {ig.Class} classObject class to modify.
         * @example
         * // to utilize pooling in any class extending from ig.Class
         * var myClass = ig.Class.extend({
         *      // optionally, you can add a use method
         *      // which will be called automatically
         *      // when an object is taken from the pool
         *      use: function () {...}
         * });
         * // after defining the class, add pooling
         * ig.utilsclass.addPooling( myClass );
         * // then make objects as normal
         * myObject = new ig.MyClass(...);
         * // make sure to release pooled objects
         * // after you're done using them
         * myObject.releaseToPool();
         * // then the next time you create a new pooled object
         * // it will reuse any released objects
         * var myOtherObject = new ig.MyClass(...);
         * myOtherObject === myObject; // true
         * // when you want to clear the pool
         * // call empty on any pooled object
         * myObject.emptyPool();
         * // for a direct reference to the pool
         * myObject.pool;
         */
        ig.utilsclass.addPooling = function ( classObject) {

            if ( !classObject.prototype.staticInstantiate || classObject.prototype.staticInstantiate !== ig.utilsclass._instantiateFromPool ) {

                classObject.inject( {

                    staticInstantiate: ig.utilsclass._instantiateFromPool,

                    releaseToPool: function () {

                        this.pool.push( this );

                    },

                    emptyPool: function () {

                        this.pool.length = 0;

                    }

                } );

            }

            /**
             * Pool to add and remove objects from.
             * @type Array
             * @memberof ig.utilsclass.startPooling
             */
            Object.defineProperty( classObject.prototype, 'pool', { value: [] } );

        };

        /**
         * Attempts to get an object from its class pool.
         * @private
         */
        ig.utilsclass._instantiateFromPool = function () {

            var obj;

            // get from pool

            if ( this.pool.length > 0 ) {

                obj = this.pool.pop();

                if ( obj.use ) {

                    obj.use.apply( obj, arguments );

                }

            }

            return obj;

        };

    });
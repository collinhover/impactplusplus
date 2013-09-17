ig.module(
        'game.entities.holo-bridge'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.core.entity'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Holographic bridge that fades in on activate and out on deactivate.
         * @class
         * @extends ig.EntityExtended
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityHoloBridge = ig.global.EntityHoloBridge = ig.EntityExtended.extend(/**@lends ig.EntityHoloBridge.prototype */{

            // we need an offset to give space for the light glow
            // and still ensure the collision box is correct

            size: { x: 176, y: 16 },
            offset: { x: 9, y: 8 },

            // animations

            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'holo_bridge.png', 192, 32),

            animInit: "idleX",

            animSettings: {
                idleX: {
                    sequence: [ 0 ],
                    frameTime: 1,
                    stop: true
                }
            },

            /**
             * Holo bridge changes collides property during gameplay.
             * @override
             */
            collidesChanges: true,

            /**
             * @override
             */
            alpha: 0,

            /**
             * @override
             */
            activate: function ( entity ) {

                // only activate if not activated already

                if ( !this.activated ) {

                    this.parent( entity );

                    this.fadeIn();

                    this.collides = ig.EntityExtended.COLLIDES.FIXED;

                }

            },

            /**
             * @override
             */
            deactivate: function ( entity ) {

                // only deactivate if activated already

                if ( this.activated ) {

                    this.parent( entity );

                    this.fadeOut();

                    this.collides = ig.EntityExtended.COLLIDES.NEVER;

                }

            }

        });

    });
ig.module(
        'game.entities.title-alt'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.core.entity'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Alt title for Impact++.
         * @class
         * @extends ig.EntityExtended
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityTitleAlt = ig.global.EntityTitleAlt = ig.EntityExtended.extend(/**@lends ig.EntityTitleAlt.prototype */{

            size: { x: 256, y: 44 },

            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'title_alt.png', 256, 44 ),

            animInit: "blinkX",

            animSettings: {
                idleX: {
                    sequence: [3],
                    frameTime: 1,
                    stop: true
                },
                blinkX: {
                    sequence: [
                        0, 1,
                        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
                        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
                        1, 0, 0, 0, 0, 0, 1,
                        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
                        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
                        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
                        1, 0, 1, 2, 1, 0, 0, 0, 0, 0
                    ],
                    frameTime: 0.05
                }
            },

            /**
             * When title activated, change animation to idle.
             * @override
             */
            activate: function ( entity ) {

                this.parent( entity );

                this.currentAnim = this.anims[ "idleX" ];

            }

        });

    });
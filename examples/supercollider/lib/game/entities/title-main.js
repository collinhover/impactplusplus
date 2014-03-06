ig.module(
    'game.entities.title-main'
)
    .requires(
        'plusplus.core.config',
        'plusplus.core.entity'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Main title for Impact++.
         * @class
         * @extends ig.EntityExtended
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityTitleMain = ig.global.EntityTitleMain = ig.EntityExtended.extend( /**@lends ig.EntityTitleMain.prototype */ {

            size: {
                x: 74,
                y: 74
            },

            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'title_main.png', 74, 74),

            animInit: "idleX",

            animSettings: {
                idleX: {
                    sequence: [0],
                    frameTime: 1,
                    stop: true
                }
            }

        });

    });

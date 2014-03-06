ig.module(
    'game.entities.title-banner'
)
    .requires(
        'plusplus.core.config',
        'plusplus.core.entity'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Banner title for Impact++.
         * @class
         * @extends ig.EntityExtended
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityTitleBanner = ig.global.EntityTitleBanner = ig.EntityExtended.extend( /**@lends ig.EntityTitleBanner.prototype */ {

            size: {
                x: 256,
                y: 96
            },

            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'title_banner.png', 256, 96),

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

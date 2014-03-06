ig.module(
    'game.entities.villain-working'
)
    .requires(
        'plusplus.core.config',
        'game.entities.villain'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Villain in working mode.
         * @class
         * @extends ig.EntityVillain
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityVillainWorking = ig.global.EntityVillainWorking = ig.EntityVillain.extend({

            // never moves

            performance: ig.EntityExtended.PERFORMANCE.STATIC,

            // start with typing animation

            animInit: "typeX",

            // since villain is static and should not be targeted
            // we'll remove any types so nothing checks against the villain

            initTypes: function() {

                this.type = 0;

            },

            // since working villain never changes animations
            // we don't need the update current anim to do anything

            updateCurrentAnim: function() {}

        });

    });

ig.module(
    'game.entities.villain-friendly'
)
    .requires(
        'game.entities.villain',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _ut = ig.utils;

        /**
         * Villain in friendly mode.
         * @class
         * @extends ig.EntityVillain
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityVillainFriendly = ig.global.EntityVillainFriendly = ig.EntityVillain.extend({

            // does collide

            collides: ig.EntityExtended.COLLIDES.ACTIVE,

            // no wandering

            canWanderX: false,
            canWanderY: false,

            // react to prey anywhere on map

            reactionDistance: Infinity,

            // does not need line of sight to prey

            needsLineOfSightPrey: false,

            // search as far as needed to find path to prey

            moveToPreySettings: {
                searchDistance: Infinity
            },

            // since villain is friendly we'll add him to the FRIEND group
            // so projectiles created by the player don't hurt him
            // and so that he doesn't collide with player while colliding with other things
            // (the player is also part of the FRIEND group)

            /**
             * @override
             */
            initTypes: function() {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'group', "FRIEND", "GROUP");

            },

            /**
             * Friendly villain will follow player when activated.
             * @override
             */
            activate: function(entity) {

                this.parent(entity);

                this.preyName = "player";

            },

            /**
             * Friendly villain will stop following player when deactivated.
             * @override
             */
            deactivate: function(entity) {

                this.parent(entity);

                // clear prey and name so player is no longer tracked

                this.preyName = "";
                this.removePrey();

            }

        });

    });

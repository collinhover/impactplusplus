ig.module(
        'game.entities.villain-clone'
    )
    .requires(
        'game.entities.villain',
        'plusplus.helpers.utils'
    )
    .defines(function () {
        "use strict";

        var _ut = ig.utils;

        /**
         * Villain's evil clones!
         * @class
         * @extends ig.EntityVillain
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityVillainClone = ig.global.EntityVillainClone = ig.EntityVillain.extend({

            // special name

            name: 'clone',

            // does not collide

            collides: ig.EntityExtended.COLLIDES.NEVER,

            // stats

            health : 1,

            // always tries to path to player
            // but use default creature pathing settings from config
            // i.e. short reaction and search distance (more efficient)

            preyName: "player",

            // lets make clone villain damageable
            // so we can hit him with abilities that target DAMAGEABLE types

            /**
             * @override
             **/
            initTypes: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "DAMAGEABLE");

            },

            /**
             * @override
             */
            attack: function( entity ){

                var closeEnough = this.parent( entity );

                // now lets hit our prey!

                if ( closeEnough ) {

                    this.abilityMelee.activate();

                }

                return closeEnough;

            }

        });

    });
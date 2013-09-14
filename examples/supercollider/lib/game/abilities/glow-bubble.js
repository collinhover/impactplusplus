ig.module(
        'game.abilities.glow-bubble'
    )
    .requires(
        'plusplus.core.input',
        'game.entities.bubble',
        'plusplus.abilities.ability-shoot',
        'plusplus.helpers.utils'
    )
    .defines(function () {
        "use strict";

        var _ut = ig.utils;

        /**
         * Ability to shoot bubbles.
         * @class
         * @extends ig.AbilityShoot
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.AbilityGlowBubble = ig.AbilityShoot.extend(/**@lends ig.AbilityGlowBubble.prototype */{

            /**
             * Glow bubble has an activation cost.
             * @type Number
             * @default
             */
            costActivate: 4,

            /**
             * Entity spawned as projectile.
             * @type ig.EntityExtended
             * @default
             */
            spawningEntity: ig.EntityBubble,

            /**
             * Bubbles have extra velocity towards offset.
             * @type Number
             * @default
             */
            offsetVelX: 60,

            /**
             * Bubbles have extra velocity towards offset.
             * @type Number
             * @default
             */
            offsetVelY: 20,

            /**
             * Bubbles have extra velocity with entity horizontal motion.
             * @type Number
             * @default
             */
            relativeVelPctX: 0.75,

            /**
             * Bubbles have extra velocity with entity vertical motion.
             * @type Number
             * @default
             */
            relativeVelPctY: 0.25,

            /**
             * Cast activate pass by animation 'throwPass'.
             * @type Object
             */
            activatePassCastSettings: {
                animName: 'throwPass'
            },

            /**
             * Cast activate by animation 'throwActivate'.
             * @type Object
             */
            activateCastSettings: {
                animName: 'throwActivate'
            },

            /**
             * @see ig.AbilityShoot
             **/
            initTypes: function () {

                this.parent();

                _ut.addType(ig.Ability, this, 'type', "SPAMMABLE");

            },

            /**
             *
             * @see ig.AbilityShoot.
             **/
            activate: function (settings) {

                settings = settings || {};

                var entityOptions = this.entityOptions || this.entity;

                settings.projectileSettings = {
                    glowSettings: entityOptions.glowBubbleSettings || entityOptions.glowSettings
                };

                var bubble = this.parent(settings);

                return bubble;

            },

            /**
             * @see ig.AbilityShoot.
             **/
            clone: function (c) {

                if (c instanceof ig.AbilityGlowBubble !== true) {

                    c = new ig.AbilityGlowBubble();

                }

                return this.parent(c);

            }

        });

    });
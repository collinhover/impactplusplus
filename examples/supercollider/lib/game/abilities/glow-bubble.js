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
			 * @override
             */
            costActivate: 4,

            /**
             * Entity spawned as projectile.
			 * @override
             */
            spawningEntity: ig.EntityBubble,

            /**
             * Bubbles have extra velocity towards offset.
			 * @override
             */
            offsetVelX: 60,

            /**
             * Bubbles have extra velocity towards offset.
			 * @override
             */
            offsetVelY: 20,

            /**
             * Bubbles have extra velocity with entity horizontal motion.
			 * @override
             */
            relativeVelPctX: 0.75,

            /**
             * Bubbles have extra velocity with entity vertical motion.
			 * @override
             */
            relativeVelPctY: 0.25,

            /**
             * Bubbles can be shot in any direction.
			 * @override
             */
			shootLocationMinPctY: 0,

            /**
             * Bubbles can be shot in any direction.
			 * @override
             */
			shootLocationMaxPctY: 1,

            /**
             * Cast activate pass by animation 'throwPass'.
			 * @override
             */
            activatePassCastSettings: {
                animName: 'throwPass'
            },

            /**
             * Cast activate by animation 'throwActivate'.
			 * @override
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
            activateComplete: function (settings) {

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
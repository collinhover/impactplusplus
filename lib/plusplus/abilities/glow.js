ig.module(
        'plusplus.abilities.glow'
    )
    .requires(
        'plusplus.abilities.ability',
        'plusplus.helpers.utils'
    )
    .defines(function () {
        "use strict";

        var _ut = ig.utils;

        /**
         * Ability to glow with light.
         * @class
         * @extends ig.Ability
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.AbilityGlow = ig.Ability.extend(/**@lends ig.AbilityGlow.prototype */{

            /**
             * Light red value from 0 to 1.
             * @type Number
             * @default
             */
            r: 1,

            /**
             * Light green value from 0 to 1.
             * @type Number
             * @default
             */
            g: 1,

            /**
             * Light blue value from 0 to 1.
             * @type Number
             * @default
             */
            b: 1,

            /**
             * Light alpha value from 0 to 1.
             * @type Number
             * @default
             */
            alpha: 0.25,

            /**
             * Duration of fade in when activated.
             * @type Number
             * @default
             */
            fadeInDuration: 125,

            /**
             * Duration of fade out when deactivated.
             * @type Number
             * @default
             */
            fadeOutDuration: 125,

            /**
             * Multiplier on ability user size to affect size of glow.
             * @type Number
             * @default
             */
            sizeMod: 5,

            /**
             * Initializes glow types.
             * <br>- adds {@link ig.Ability.TYPE.PASSIVE} to {@link ig.Ability#type}
             * @override
             **/
            initTypes: function () {

                this.parent();

                _ut.addType(ig.Ability, this, 'type', "PASSIVE");

            },

            /**
             * Adds simple size increasing upgrades.
             * @override
             **/
            initUpgrades: function () {

                this.parent();

                this.addUpgrades([
                    {
                        sizeMod: this.sizeMod
                    },
                    {
                        sizeMod: this.sizeMod * 2
                    }
                ]);

            },

            /**
             * Creates light as needed, sets it to auto follow ability users, and fades light in.
             * @override
             **/
            activate: function () {

                var me = this;

                // properties

                var entityOptions = this.entityOptions || this.entity;
                var gs = entityOptions.glowSettings || {};

                // create new light as needed

                if (!this.light) {

                    this.light = ig.game.spawnEntity(ig.EntityLight, this.entity.bounds.minX + this.entity.bounds.width * 0.5, this.entity.bounds.minY + this.entity.bounds.height * 0.5, ig.merge({
                        radius: Math.max(this.entity.totalSizeX, this.entity.totalSizeY) * 0.5 * ( gs.sizeMod || this.sizeMod ),
                        r: this.r,
                        g: this.g,
                        b: this.b,
                        alpha: 0
                    }, gs.light));

                    // light follows this automatically

                    this.light.moveToEntity(this.entity, {
                        matchPerformance: true
                    });

                }

                // tween to target alpha

                this.light.fadeTo(_ut.isNumber(gs.alpha) ? gs.alpha : this.alpha, {
                    duration: _ut.isNumber(gs.fadeInDuration) ? gs.fadeInDuration : this.fadeInDuration,
                    tween: this.lightTween,
                    onComplete: function () {

                        me.lightTween = undefined;

                    }
                });

                this.parent();

                return this.light;

            },

            /**
             * Fades light out and destroys it.
             * @override
             **/
            deactivate: function () {

                var light = this.light;
                var lightTween = this.lightTween;
                var entityOptions = this.entityOptions || this.entity;
                var gs = entityOptions.glowSettings || {};

                // remove light

                this.light = this.lightTween = undefined;

                if (light) {

                    // tween out and remove when complete

                    light.fadeOut({
                        tween: lightTween,
                        duration: _ut.isNumber(gs.fadeOutDuration) ? gs.fadeOutDuration : this.fadeOutDuration,
                        onComplete: function () {

                            ig.game.removeEntity(light);

                        }
                    });

                }

                this.parent();

            },

            /**
             * @override
             **/
            clone: function (c) {

                if (c instanceof ig.AbilityGlow !== true) {

                    c = new ig.AbilityGlow();

                }

                c.r = this.r;
                c.g = this.g;
                c.b = this.b;
                c.alpha = this.alpha;
                c.fadeDuration = this.fadeDuration;
                c.sizeMod = this.sizeMod;

                return this.parent(c);

            }

        });

    });
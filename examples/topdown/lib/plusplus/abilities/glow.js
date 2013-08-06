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

                var entityOptions = this.entityOptions || this.entity;
                var gs = entityOptions.glowSettings || {};

                // create light

               this.light = ig.game.spawnEntity(ig.EntityLight, this.entity.bounds.minX + this.entity.bounds.width * 0.5, this.entity.bounds.minY + this.entity.bounds.height * 0.5, ig.merge({
					radius: Math.max(this.entity.totalSizeX, this.entity.totalSizeY) * 0.5 * ( gs.sizeMod || this.sizeMod ),
					r: _ut.isNumber(gs.r) ? gs.r : this.r,
					g: _ut.isNumber(gs.g) ? gs.g : this.g,
					b: _ut.isNumber(gs.b) ? gs.b : this.b,
					alpha: _ut.isNumber(gs.alpha) ? gs.alpha : this.alpha
				}, gs.light));

                // show light
				
				if ( !this.light.added ) {
					
					this.light.onAdded.addOnce( this.showLight, this );
					
				}
				else {
					
					this.showLight();
					
				}
				

                this.parent();

                return this.light;

            },
			
			/**
			 * Shows light after it is added to game.
			 */
			showLight: function () {

                var entityOptions = this.entityOptions || this.entity;
                var gs = entityOptions.glowSettings || {};
				
				if ( this.light ) {

					// light follows entity automatically

					this.light.moveToEntity(this.entity, {
						matchPerformance: true
					});
					
					// fade light
					
					this.light.alpha = 0;
					this.light.fadeTo(this.light.resetState.alpha, {
						duration: _ut.isNumber(gs.fadeInDuration) ? gs.fadeInDuration : this.fadeInDuration
					});
					
				}
				
			},

            /**
             * Fades light out and destroys it.
             * @override
             **/
            deactivate: function () {

                var light = this.light;
                var entityOptions = this.entityOptions || this.entity;
                var gs = entityOptions.glowSettings || {};

                // remove light

                this.light = undefined;

                if (light) {

                    // tween out and remove when complete

                    light.fadeToDeath({
                        duration: _ut.isNumber(gs.fadeOutDuration) ? gs.fadeOutDuration : this.fadeOutDuration
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
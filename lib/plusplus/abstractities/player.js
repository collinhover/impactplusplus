ig.module(
    'plusplus.abstractities.player'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.character',
        'plusplus.abilities.interact',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsmath'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        /**
         * Base player entity.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * <span class="alert alert-info"><strong>Tip:</strong> input is used to control the player character through the {@link ig.GameExtended#playerManager}.</span>
         * @class
         * @extends ig.Character
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // normally, you'll want to extend the player abstract
         * // to create your own player character
         * myPlayerClass = ig.Player.extend({...});
         * // but it is not necessary, as all you really need
         * // is to give your player entity a name of "player"
         * // and extend the ig.Character abstract
         * // so the game can easily find and manage it
         * myPlayerClass = ig.Character.extend({
         *      name: "player"
         * });
         * // in fact, you don't even need to do that
         * // as long as you override the game's getPlayer method
         * // with a way to find your game's player so the player manager can find it
         * // because the only notable things the player abstract adds are
         * // a unique name, zIndex, performance, collides, persistent, and ability to interact
         **/
        ig.Player = ig.Character.extend( /**@lends ig.Player.prototype */ {

            /**
             * Player has player name by default for easier searches.
             * @override
             * @default
             */
            name: "player",

            /**
             * Player should be rendered above most other entities.
             * @override
             * @see ig.CONFIG.Z_INDEX_PLAYER
             */
            zIndex: _c.Z_INDEX_PLAYER,

            /**
             * Player performance is dynamic.
             * @override
             * @default dynamic
             */
            performance: ig.EntityExtended.PERFORMANCE.DYNAMIC,

            /**
             * @override
             * @default lite
             */
            collides: ig.EntityExtended.COLLIDES.LITE,

            /**
             * Player entity should be persistent across levels.
             * @override
             */
            persistent: true,

            /**
             * Player has a slight delay when taking damage.
             * @override
             * @default
             */
            damageDelay: 1,

            /**
             * Initializes Player types.
             * <br>- adds {@link ig.EntityExtended.TYPE.PLAYER} to {@link ig.EntityExtended#type}
             * <br>- adds {@link ig.EntityExtended.TYPE.DAMAGEABLE} to {@link ig.EntityExtended#type}
             * <br>- adds {@link ig.EntityExtended.TYPE.MIMICABLE} to {@link ig.EntityExtended#type}
             * <br>- adds {@link ig.EntityExtended.TYPE.PLAYER} to {@link ig.EntityExtended#group}
             * <br>- adds {@link ig.EntityExtended.TYPE.FRIEND} to {@link ig.EntityExtended#group}
             * @override
             **/
            initTypes: function() {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "PLAYER DAMAGEABLE MIMICABLE");
                _ut.addType(ig.EntityExtended, this, 'group', "PLAYER FRIEND", "GROUP");

            },

            /**
             * Initializes Player properties.
             * @override
             **/
            initProperties: function() {

                this.parent();

                if (!ig.global.wm) {

                    // add interact ability

                    this.abilityInteract = new ig.AbilityInteract(this);
                    this.abilities.addDescendant(this.abilityInteract);

                }

            },

            /**
             * When player spawns, it {@link ig.Player#checkAutomaticUtilities}.
             * @override
             */
            spawn: function() {

                this.parent();

                this.checkAutomaticUtilities();

            },

            /**
             * Hook into auto follow and auto manage so camera and manager don't need to constantly search for player (which is slow).
             */
            checkAutomaticUtilities: function() {

                if (ig.game.playerManager && !ig.game.playerManager.entity && ig.game.playerManager.autoManagePlayer) {

                    ig.game.playerManager.managePlayer();

                }

                if (ig.game.camera && !ig.game.camera.entity && ig.game.camera.autoFollowPlayer) {

                    ig.game.camera.followPlayer();

                }

            },

            /**
             * Handles input and translates it into actions.
             * <span class="alert"><strong>IMPORTANT:</strong> general movement input is now handled by {@link ig.PlayerManager}!</span>
             */
            handleInput: function() {

                var i, il;
                var inputPoints;
                var inputPoint;

                // tapping

                if (!this.jumping && ig.input.released('tap')) {

                    // find all inputs that are tapping

                    inputPoints = ig.input.getInputPoints(['tapped'], [true]);

                    for (i = 0, il = inputPoints.length; i < il; i++) {

                        inputPoint = inputPoints[i];

                        // try to interact

                        this.abilityInteract.setEntityTargetFirst(inputPoint.targets);

                        // interact with any interactive that is not UI or is UI and not fixed

                        if (this.abilityInteract.entityTarget && (!(this.abilityInteract.entityTarget.type & ig.EntityExtended.TYPE.UI) || !this.abilityInteract.entityTarget.fixed)) {

                            this.abilityInteract.activate();

                        }

                    }

                }

            }

        });

    });

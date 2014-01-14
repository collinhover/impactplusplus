ig.module(
    'plusplus.entities.levelchange'
)
    .requires(
        'plusplus.entities.trigger'
)
    .defines(function() {

        /**
         * Entity that loads a level on activation.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @author Dominic Szablewski
         **/
        ig.EntityLevelchange = ig.global.EntityLevelchange = ig.EntityTrigger.extend( /**@lends ig.EntityLevelchange.prototype */ {

            // editor properties

            _wmBoxColor: 'rgba(0, 0, 255, 0.7)',

            /**
             * Name of the level to load.
             * @type String
             * @default
             * @example
             * // these will all load the 'LevelTest1' level
             * levelchange.level = "LevelTest1";
             * levelchange.level = "Test1";
             * levelchange.level = "test1";
             */
            levelName: '',

            /**
             * Name of entity in new level to set as player spawn location.
             * <span class="alert alert-info><strong>Tip:</strong> this should probably be a checkpoint, so that if the player dies they always have somewhere to respawn!</span>
             * @type String
             * @default
             */
            playerSpawnerName: '',

            /**
             * Whether persistent player should be cleared from game cache.
             * <span class="alert alert-info><strong>Tip:</strong> use this if you want a level change to make sure the player does not auto spawn.</span>
             * @type Boolean
             * @default
             */
            clearPersistentPlayer: false,

            /**
             * Whether all persistent entities should be cleared from game cache.
             * <span class="alert alert-info><strong>Tip:</strong> use this if you want a level change to reset the game.</span>
             * @type Boolean
             * @default
             */
            clearPersistentEntities: false,

            /**
             * Formats level name and attempts to load deferred.
             * @override
             **/
            activate: function(entity) {

                this.parent(entity);

                if (this.clearPersistentEntities) {

                    ig.game.clearPersistentEntities();

                } else if (this.clearPersistentPlayer) {

                    var player = ig.game.getPlayer();
                    var playerName = "player";

                    if (player) {

                        playerName = player.name || playerName;

                    }

                    ig.game.clearPersistentEntity(playerName);

                }

                ig.game.loadLevelDeferred(this.levelName, this.playerSpawnerName);

            }

        });

    });

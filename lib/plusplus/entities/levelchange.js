ig.module(
        'plusplus.entities.levelchange'
    )
    .requires(
        'plusplus.entities.trigger'
    )
    .defines(function () {

        /**
         * Entity that loads a level on activation.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @author Dominic Szablewski
         **/
        ig.EntityLevelchange = ig.global.EntityLevelchange = ig.EntityTrigger.extend(/**@lends ig.EntityLevelchange.prototype */{

            // editor properties

            _wmBoxColor: 'rgba(0, 0, 255, 0.7)',

            /**
             * Name of the level to load.
             * <br>- "LevelTest1" or just "test1" will load the 'LevelTest1' level.
             * @type String
             */
            level: '',

            /**
             * @override
             **/
            activate: function (entity) {

                this.parent( entity );

                if (this.level) {

                    var levelName = this.level.replace(/^(Level)?(\w)(\w*)/, function (m, l, a, b) {
                        return a.toUpperCase() + b;
                    });

                    ig.game.loadLevelDeferred(ig.global[ 'Level' + levelName ]);

                }

            }

        });

    });
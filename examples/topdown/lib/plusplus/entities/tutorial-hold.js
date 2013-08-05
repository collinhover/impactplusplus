ig.module(
        'plusplus.entities.tutorial-hold'
    )
    .requires(
        'plusplus.abstractities.tutorial',
        'plusplus.entities.demo-hold',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {

        var _utv2 = ig.utilsvector2;

        /**
         * Tutorial for holding.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * @class
         * @extends ig.Tutorial
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityTutorialHold = ig.global.EntityTutorialHold = ig.Tutorial.extend(/**@lends ig.EntityTutorialHold.prototype */{

            /**
             * Tutorial uses hold demo.
             * @override
             * @default ig.EntityDemoHold
             */
            spawningEntity: ig.EntityDemoHold,

            /**
             * Tutorial checks for player action to complete.
             * @override
             */
            actions: [ 'hold' ],

            /**
             * Tutorial should explain action to player.
             * @override
             * @property {String} text hold!
             */
            textSettings: {
                text: 'hold!'
            },

            /**
             * Demo should be offset slightly to account for finger position.
             * @override
             * @property {Vector2} offsetPct 0.35 x 0.5
             */
            spawnAndMoveToSettings: {
                offsetPct: _utv2.vector(0.35, 0.5)
            }

        });

    });


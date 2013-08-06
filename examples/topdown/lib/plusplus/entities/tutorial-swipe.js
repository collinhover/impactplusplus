ig.module(
        'plusplus.entities.tutorial-swipe'
    )
    .requires(
        'plusplus.abstractities.tutorial',
        'plusplus.entities.demo-swipe'
    )
    .defines(function () {

        /**
         * Tutorial for swiping.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * @class
         * @extends ig.Tutorial
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityTutorialSwipe = ig.global.EntityTutorialSwipe = ig.Tutorial.extend(/**@lends ig.EntityTutorialSwipe.prototype */{

            /**
             * Tutorial uses swipe demo.
             * @override
             * @default ig.EntityDemoSwipe
             */
            spawningEntity: ig.EntityDemoSwipe,

            /**
             * Tutorial checks for player action to complete.
             * @override
             */
            actions: [ 'swipe' ],

            /**
             * Tutorial should explain action to player.
             * @override
             * @property {String} text swipe!
             */
            textSettings: {
                text: 'swipe!'
            }

        });

    });


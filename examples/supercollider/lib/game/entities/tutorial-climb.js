ig.module(
        'game.entities.tutorial-climb'
    )
    .requires(
        'plusplus.entities.tutorial-hold',
        'plusplus.ui.ui-overlay'
    )
    .defines(function () {

        /**
         * Tutorial for climbing.
         * @class
         * @extends ig.EntityTutorialHold
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.global.EntityTutorialClimb = ig.EntityTutorialClimb = ig.EntityTutorialHold.extend({

            // don't look for action

            actions: [],

            // looking for player properties

            properties: [ 'climbing' ],

            // overlay

            overlayEntity: ig.UIOverlay,

            // explain action to player in text also

            textSettings: {
                text: 'hold to climb!'
            }

        });

    });


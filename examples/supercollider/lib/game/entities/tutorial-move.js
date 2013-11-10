ig.module(
        'game.entities.tutorial-move'
    )
    .requires(
        'plusplus.entities.tutorial-hold',
        'plusplus.ui.ui-text'
    )
    .defines(function () {

        /**
         * Tutorial for moving.
         * @class
         * @extends ig.EntityTutorialHold
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.global.EntityTutorialMove = ig.EntityTutorialMove = ig.EntityTutorialHold.extend({

            // longer delay for movement tutorial to kick in

            delay: 5,

            // don't look for action

            actions: [],

            // looking for player properties

            properties: [ 'moving' ],

            // don't isolate

            layerNameIsolation: '',

            // show text only instead of overlay

            textEntity: ig.UIText,

            // explain action to player in text also
            // and position a little below center of screen

            textSettings: {
                text: 'hold to move!',
				posPct: {x: 0.5, y: 0.75}
            }

        });

    });


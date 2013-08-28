ig.module(
        'plusplus.entities.narrative'
    )
    .requires(
        'plusplus.entities.conversation',
        'plusplus.ui.ui-text-box',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {

        var _utv2 = ig.utilsvector2;

        /**
         * Trigger to start narration, similar in style to a comic book.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityNarrative = ig.global.EntityNarrative = ig.EntityConversation.extend(/**@lends ig.EntityNarrative.prototype */{

            /**
             * @override
             */
            messageContainerEntity: ig.UITextBox,

            /**
             * @override
             */
            messageSettings: {
                posPct: _utv2.vector(0.5, 0.1),
                align: _utv2.vector(0.5, 0),
                linkAlign: _utv2.vector(0.5, 0)
            },

            /**
             * @override
             * @default
             */
            messageFollowsSpeaker: false,

            /**
             * @override
             */
            messageMoveToSettings: {
                matchPerformance: true,
                offsetPct: _utv2.vector( 0, 2 )
            }

        } );

    });
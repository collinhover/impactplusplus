ig.module(
        'plusplus.core.image'
    ).requires(
        'impact.image',
        'plusplus.helpers.signals'
    )
    .defines(function () {
        'use strict';

        /**
         * Fixes and enhancements for images.
         * @class ig.Image
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.Image.inject(/**@lends ig.Image.prototype */{

            /**
             * Signal dispatched when image finishes loading.
             * <br>- created on init.
             * @type ig.Signal
             */
            onLoaded: null,

            init: function (path) {

                this.onLoaded = new ig.Signal();

                this.parent(path);

            },

            onload: function (event) {

                this.parent(event);

                this.onLoaded.dispatch(this);
                this.onLoaded.removeAll();
                this.onLoaded.forget();

            }

        });

    });
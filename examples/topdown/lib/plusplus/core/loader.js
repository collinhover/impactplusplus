ig.module(
        'plusplus.core.loader'
    )
    .requires(
        'impact.loader',
        'plusplus.core.config'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Enhanced loader for Impact++.
         * <br>- draws an optional main logo in top center
         * <br>- draws an optional progress bar in center
         * <br>- draws an optional alternative logo in bottom center
         * @class
         * @extends ig.Loader
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @author Dominic Szablewski
         **/
        ig.LoaderExtended = ig.Loader.extend(/**@lends ig.LoaderExtended.prototype */{

            // internal properties, do not modify

            _endTime: 0,

            /**
             * Initializes loader.
             * @param {ig.Game} gameClass
             * @param {Array} resources list of resources.
             * @see ig.Loader.
             */
            init: function (gameClass, resources) {

                this.logoMain = ig.$new('img');
                this.logoMain.src = _c.LOADER_LOGO_SRC_MAIN;

                this.logoAlt = ig.$new('img');
                this.logoAlt.src = _c.LOADER_LOGO_SRC_ALT;

                this.parent(gameClass, resources);

            },

            /**
             * Finish loading.
             * @see ig.Loader.
             */
            end: function () {

                this.parent();
                this._endTime = Date.now();

                // This is a bit of a hack - set this class instead of ig.game as the delegate.
                // The delegate will be set back to ig.game after the screen fade is complete.

                ig.system.setDelegate(this);

            },

            /**
             * Proxy for ig.game.run to show the screen fade after everything is loaded.
             * @see ig.Loader.
             */
            run: function () {

                var t = Date.now() - this._endTime;
                var alpha = 1;

                if (t < _c.DURATION_FADE) {
                    // Draw the logo -> fade to white
                    this.draw();
                    alpha = t.map(0, _c.DURATION_FADE, 0, 1);
                }
                else if (t < _c.DURATION_FADE * 2) {
                    // Draw the game -> fade from white
                    ig.game.run();
                    alpha = t.map(_c.DURATION_FADE, _c.DURATION_FADE * 2, 1, 0);
                }
                else {
                    // All done! Dismiss the preloader completely, set the delegate
                    // to ig.game
                    ig.system.setDelegate(ig.game);
                    return;
                }

                var context = ig.system.context;

                context.globalAlpha = alpha;

                context.fillStyle = _c.LOADER_FADE_COLOR;
                context.fillRect(0, 0, ig.system.realWidth, ig.system.realHeight);

                context.globalAlpha = 1;

            },

            /**
             * Draws loader.
             * @see ig.Loader.
             */
            draw: function () {

                // some damping for the status bar

                this._drawStatus += (this.status - this._drawStatus) / 5;

                // context and canvas size

                var context = ig.system.context;
                var w = ig.system.realWidth;
                var h = ig.system.realHeight;

                // loader properties

                var spacing = Math.min(w, h) * _c.LOADER_SPACE_PCT;
                var barWidth;
                var barHeight;
                var barSpacing;

                if (_c.LOADER_BAR) {

                    barWidth = w * _c.LOADER_BAR_WIDTH_PCT;
                    barHeight = h * _c.LOADER_BAR_HEIGHT_PCT;
                    barSpacing = Math.min(w, h) * _c.LOADER_BAR_SPACE_PCT;

                }
                else {

                    barWidth = barHeight = barSpacing = 0;

                }

                // logo game properties

                var logoMainWidth = this.logoMain.width;
                var logoMainHeight = this.logoMain.height;

                // logo impact properties

                var logoAltWidth = this.logoAlt.width;
                var logoAltHeight = this.logoAlt.height;

                var totalWidth = Math.max(barWidth, logoMainWidth, logoAltWidth);
                var totalHeight = logoMainHeight + spacing + barHeight + spacing + logoAltHeight;

                // scale and center

                var pctX = totalWidth / w;
                var pctY = totalHeight / h;
                var scaleX = 1;
                var scaleY = 1;

                if (pctX > _c.LOADER_MAX_WIDTH_PCT) {

                    scaleX = 1 - ( pctX - _c.LOADER_MAX_WIDTH_PCT );

                }

                if (pctY > _c.LOADER_MAX_HEIGHT_PCT) {

                    scaleY = 1 - ( pctY - _c.LOADER_MAX_HEIGHT_PCT );

                }

                var scale = Math.min(1, scaleX, scaleY);

                var centerX = ( w - totalWidth * scale ) / 2;
                var centerY = ( h - totalHeight * scale ) / 2;

                // clear

                context.fillStyle = _c.LOADER_BG_COLOR;
                context.clearRect(0, 0, w, h);

                // translate and scale

                context.save();

                context.translate(centerX, centerY);
                context.scale(scale, scale);

                // draw main logo

                context.drawImage(this.logoMain, ( totalWidth - logoMainWidth ) * 0.5, 0);

                // draw loading bar

                if (_c.LOADER_BAR) {

                    context.lineWidth = _c.LOADER_BAR_LINE_WIDTH;
                    context.strokeStyle = _c.LOADER_BAR_COLOR;
                    context.strokeRect(( totalWidth - barWidth ) * 0.5, logoMainHeight + spacing, barWidth, barHeight);

                    context.fillStyle = _c.LOADER_BAR_COLOR;
                    context.fillRect(( totalWidth - barWidth ) * 0.5 + barSpacing, logoMainHeight + spacing + barSpacing, Math.max(0, barWidth * this._drawStatus - barSpacing * 2), barHeight - barSpacing * 2);

                }

                // draw alt logo

                context.drawImage(this.logoAlt, ( totalWidth - logoAltWidth ) * 0.5, totalHeight - logoAltHeight);

                context.restore();

            }

        });

    });

ig.module(
        'plusplus.core.background-map'
    ).requires(
        'impact.background-map',
        'plusplus.core.image-drawing'
    )
    .defines(function () {
        'use strict';

        /**
         * Fixes and enhancements for background-maps.
         * @class ig.BackgroundMap
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.BackgroundMap.inject({

            // handles when tileset is an image drawing

            setTileset: function (tileset) {

                if (tileset instanceof ig.ImageDrawing) {

                    // should we copy image?
                    this.tiles = tileset;

                }
                else {
                    this.tilesetName = tileset instanceof ig.Image ? tileset.path : tileset;
                    this.tiles = new ig.Image(this.tilesetName);
                }

                this.preRenderedChunks = null;

            },

            // add .setScreenPos to the draw method to make the game-wide drawing method much simpler
            draw: function () {
                this.setScreenPos(ig.game.screen.x, ig.game.screen.y);
                if (!this.tiles.loaded || !this.enabled) return;
                if (this.preRender) this.drawPreRendered();
                else this.drawTiled();
            }

        });

    });
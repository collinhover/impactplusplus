ig.module(
        'plusplus.core.background-map'
    ).requires(
        'impact.background-map',
        'plusplus.core.image-drawing',
        'plusplus.helpers.utils'
    )
    .defines(function () {
        'use strict';

        var _ut = ig.utils;

        /**
         * Fixes and enhancements for background-maps.
         * <span class="alert"><strong>IMPORTANT:</strong> to greatly improve performance by reducing draw calls, all prerendered maps on a layer will be merged into as few maps as possible!</span>
         * @class
         * @extends ig.BackgroundMap
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.BackgroundMapExtended = ig.BackgroundMap.extend({

            /**
             * Scale at which maps were pre rendered.
             * @type {Number}
             * @default
             */
            preRenderedScale: 0,

            /**
             * List of maps merged into this map.
             * @type {Array}
             * @default
             */
            mergedMaps: [],

            /**
             * @override
             */
            setTileset: function (tileset) {

                // handle when tileset is an image drawing

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

            /**
             * Merge another map into this map.
             * <span class="alert"><strong>IMPORTANT:</strong> only maps with {@link ig.BackgroundMap#preRender} set to true can be merged.</span>
             * @param {ig.BackgroundMap} map map to be merged.
             */
            merge: function ( map ) {

                if ( this.preRender && !this.repeat && map instanceof ig.BackgroundMap && map.preRender && !map.repeat ) {

                    // store map

                    _ut.arrayCautiousAdd( this.mergedMaps, map );

                    // reset prerendered chunks to force another render

                    this.preRenderedChunks = null;

                }

            },

            /**
             * @override
             */
            preRenderMapToChunks: function() {

                // store current scale

                this.preRenderedScale = ig.system.scale;

                // handle merged prerender

                if ( this.mergedMaps.length > 0 ) {

                    this.preRenderedChunks = [];

                    // combine merged maps with this map first

                    var maps = [ this ].concat( this.mergedMaps );

                    // find largest chunk values from maps

                    var totalWidth = 0;
                    var totalHeight = 0;
                    var totalSize = 0;
                    var chunkSize = 0;

                    for ( var i = 0, il = maps.length; i < il; i++ ) {

                        var map = maps[ i ];

                        totalWidth = Math.max( totalWidth, map.width * map.tilesize * ig.system.scale );
                        totalHeight = Math.max( totalHeight, map.height * map.tilesize * ig.system.scale );
                        totalSize = Math.max( totalWidth, totalHeight );
                        chunkSize = Math.max( chunkSize, Math.min( totalSize, map.chunkSize ) );

                    }

                    var chunkCols = Math.ceil(totalWidth / chunkSize);
                    var chunkRows = Math.ceil(totalHeight / chunkSize);

                    for( var y = 0; y < chunkRows; y++ ) {

                        var chunkRow = this.preRenderedChunks[y] = this.preRenderedChunks[y] || [];

                        for( var x = 0; x < chunkCols; x++ ) {

                            var chunkWidth = (x === chunkCols-1) ? totalWidth - x * chunkSize : chunkSize;
                            var chunkHeight = (y === chunkRows-1) ? totalHeight - y * chunkSize : chunkSize;

                            chunkRow[x] = this.preRenderMergedChunk( maps, chunkSize, x, y, chunkWidth, chunkHeight );

                        }

                    }

                }
                // default to unmerged prerender
                else {

                    this.parent();

                }

            },

            /**
             * Prerenders a merged chunk of a map from a list of maps.
             * @param {Array} maps maps to render from
             * @param {Number} chunkSize size of chunk
             * @param {Number} cx x position of chunk
             * @param {Number} cy y position of chunk
             * @param {Number} w width of chunk
             * @param {Number} h height of chunk
             * @returns {*}
             */
            preRenderMergedChunk: function( maps, chunkSize, cx, cy, w, h ) {

                var chunk = ig.$new( 'canvas' );
                chunk.width = w;
                chunk.height = h;

                var oldContext = ig.system.context;
                ig.system.context = chunk.getContext("2d");

                for ( var i = 0, il = maps.length; i < il; i++ ) {

                    this.preRenderChunk( cx, cy, w, h, maps[ i ], chunkSize, chunk );

                }

                ig.system.context = oldContext;

                return chunk;

            },

            /**
             * Prerenders a chunk of a map.
             * @override
             */
            preRenderChunk: function( cx, cy, w, h, map, chunkSize, chunk ) {

                map = map || this;
                chunkSize = chunkSize || this.chunkSize;

                var oldContext;

                if ( !chunk ) {

                    chunk = ig.$new( 'canvas');
                    chunk.width = w;
                    chunk.height = h;

                    oldContext = ig.system.context;
                    ig.system.context = chunk.getContext("2d");

                }

                var tw = w / map.tilesize / ig.system.scale + 1,
                    th = h / map.tilesize / ig.system.scale + 1;

                var nx = (cx * chunkSize / ig.system.scale) % map.tilesize,
                    ny = (cy * chunkSize / ig.system.scale) % map.tilesize;

                var tx = Math.floor(cx * chunkSize / map.tilesize / ig.system.scale),
                    ty = Math.floor(cy * chunkSize / map.tilesize / ig.system.scale);

                for( var x = 0; x < tw; x++ ) {

                    for( var y = 0; y < th; y++ ) {

                        if( x + tx < map.width && y + ty < map.height ) {

                            var tile = map.data[y+ty][x+tx];

                            if( tile ) {
                                map.tiles.drawTile(
                                    x * map.tilesize - nx,	y * map.tilesize - ny,
                                    tile - 1, map.tilesize
                                );
                            }

                        }

                    }

                }

                if ( oldContext ) {

                    ig.system.context = oldContext;

                }

                return chunk;

            },

            /**
             * Draw background map.
             * @override
             */
            draw: function () {

                // add .setScreenPos to the draw method to make the game-wide drawing method much simpler

                this.setScreenPos(ig.game.screen.x, ig.game.screen.y);

                if (!this.tiles.loaded || !this.enabled) return;

                // draw prerendered or by tile

                if (this.preRender) {

                    if ( this.preRenderedScale !== ig.system.scale ) {

                        // reset prerendered chunks to force another render to scale

                        this.preRenderedChunks = null;

                    }

                    this.drawPreRendered();

                }
                else {

                    this.drawTiled();

                }

            }

        });

    });
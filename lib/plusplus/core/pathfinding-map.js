ig.module(
        'plusplus.core.pathfinding-map'
    )
    .requires(
        'impact.map',
        'plusplus.core.config',
		'plusplus.core.image'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Map for pathfinding.
		 * <br>- set a layer's name to "pathfinding" to have the game automatically set it as the pathfinding map.
		 * <br>- use the "media/pathfindingtiles_plusplus_*.png" as the layer tileset, or define your own custom one.
		 * <span class="alert alert-danger"><strong>IMPORTANT:</strong> collision map and pathfinding map must have the same tilesize!</span>
         * @class
         * @extends ig.Map
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.PathfindingMap = ig.Map.extend(/**@lends ig.PathfindingMap.prototype */{

            /**
             * Tile definition mapping tiles to settings such as weight.
             * @type {Object}
             * @see ig.CONFIG.PATHFINDING.TILE_DEF
             */
            tiledef: null,

            /**
             * Initializes pathfinding map.
             * @param {Number} tilesize size of tiles
             * @param {Array} data tile data in a 2D array of rows x columns
             * @param {Object} [tiledef=ig.PathfindingMap.defaultTileDef] tile definition mapping tiles to settings such as weight.
             */
            init: function( tilesize, data, tiledef ) {

                this.parent( tilesize, data );

                this.tiledef = tiledef || _c.PATHFINDING.TILE_DEF;

            }

        });

    });
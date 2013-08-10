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
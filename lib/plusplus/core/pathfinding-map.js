ig.module(
    'plusplus.core.pathfinding-map'
)
    .requires(
        'impact.map',
        'plusplus.core.config',
        'plusplus.core.image'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Map for pathfinding, drawn in the editor on a separate layer (just like the collision map).
         * <br>- set a layer's name to "pathfinding" to have the game automatically set it as the pathfinding map.
         * <br>- use the "media/pathfindingtiles_plusplus_*.png" as the layer tileset, or define your own custom one.
         * <span class="alert"><strong>Tip:</strong> base pathfinding works best when entity size is &lt;= 3x the tilesize. For larger entities, add a {@link ig.PathfindingMap} with green tiles around the middle of your entity's path of travel for best results!</span>
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> if using a {@link ig.PathfindingMap}, the tilesize must match the {@link ig.CollisionMap}'s tilesize!</span>
         * @class
         * @extends ig.Map
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.PathfindingMap = ig.Map.extend( /**@lends ig.PathfindingMap.prototype */ {

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
            init: function(tilesize, data, tiledef) {

                this.parent(tilesize, data);

                this.tiledef = tiledef || _c.PATHFINDING.TILE_DEF;

            }

        });

    });

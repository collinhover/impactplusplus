ig.module(
        'plusplus.core.collision-map'
    ).requires(
        'impact.collision-map'
    )
    .defines(function () {
        'use strict';

        /**
         * Fixes and enhancements for collision-maps.
         * @class ig.CollisionMap
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.CollisionMap.inject({

            _traceStep: function (res, x, y, vx, vy, width, height, rvx, rvy, step) {

                res.pos.x += vx;
                res.pos.y += vy;

                var t = 0;

                // Horizontal collision (walls)
                if (vx) {
                    var pxOffsetX = (vx > 0 ? width : 0);
                    var tileOffsetX = (vx < 0 ? this.tilesize : 0);

                    var firstTileY = Math.max(Math.floor(y / this.tilesize), 0);
                    var lastTileY = Math.min(Math.ceil((y + height) / this.tilesize), this.height);
                    var tileX = Math.floor((res.pos.x + pxOffsetX) / this.tilesize);

                    // We need to test the new tile position as well as the current one, as we
                    // could still collide with the current tile if it's a line def.
                    // We can skip this test if this is not the first step or the new tile position
                    // is the same as the current one.
                    var prevTileX = Math.floor((x + pxOffsetX) / this.tilesize);
                    if (step > 0 || tileX == prevTileX || prevTileX < 0 || prevTileX >= this.width) {
                        prevTileX = -1;
                    }

                    // Still inside this collision map?
                    if (tileX >= 0 && tileX < this.width) {
                        for (var tileY = firstTileY; tileY < lastTileY; tileY++) {
                            if (prevTileX != -1) {
                                t = this.data[tileY][prevTileX];
                                if (
                                    t > 1 && t <= this.lastSlope
                                        && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, prevTileX, tileY)
                                        && res.collision.slope.ny !== 0 // check that this is not a one-way slope, else may have jitters
                                    ) {
                                    break;
                                }
                            }

                            t = this.data[tileY][tileX];
                            if (
                                t == 1 || t > this.lastSlope || // fully solid tile?
                                    (t > 1 && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, tileY)) // slope?
                                ) {

                                // we should know tile at all times

                                res.tile.x = t;

                                if (t > 1 && t <= this.lastSlope && res.collision.slope) {
                                    break;
                                }

                                // full tile collision!
                                res.collision.x = true;
                                x = res.pos.x = tileX * this.tilesize - pxOffsetX + tileOffsetX;
                                rvx = 0;
                                break;
                            }
                        }
                    }
                }

                // Vertical collision (floor, ceiling)
                if (vy) {
                    var pxOffsetY = (vy > 0 ? height : 0);
                    var tileOffsetY = (vy < 0 ? this.tilesize : 0);

                    var firstTileX = Math.max(Math.floor(res.pos.x / this.tilesize), 0);
                    var lastTileX = Math.min(Math.ceil((res.pos.x + width) / this.tilesize), this.width);
                    var tileY = Math.floor((res.pos.y + pxOffsetY) / this.tilesize);

                    var prevTileY = Math.floor((y + pxOffsetY) / this.tilesize);
                    if (step > 0 || tileY == prevTileY || prevTileY < 0 || prevTileY >= this.height) {
                        prevTileY = -1;
                    }

                    // Still inside this collision map?
                    if (tileY >= 0 && tileY < this.height) {
                        for (var tileX = firstTileX; tileX < lastTileX; tileX++) {
                            if (prevTileY != -1) {
                                t = this.data[prevTileY][tileX];
                                if (
                                    t > 1 && t <= this.lastSlope
                                        && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, prevTileY)
                                        && res.collision.slope.nx !== 0 // check that this is not a one-way slope, else may have jitters
                                    ) {
                                    break;
                                }
                            }

                            t = this.data[tileY][tileX];
                            if (
                                t == 1 || t > this.lastSlope || // fully solid tile?
                                    (t > 1 && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, tileY)) // slope?
                                ) {

                                // we should know tile at all times

                                res.tile.y = t;

                                if (t > 1 && t <= this.lastSlope && res.collision.slope) {
                                    break;
                                }

                                // full tile collision!
                                res.collision.y = true;
                                res.pos.y = tileY * this.tilesize - pxOffsetY + tileOffsetY;
                                break;
                            }
                        }
                    }
                }
            }

        });

        var H = 1 / 2;
        var N = 1 / 3;
        var M = 2 / 3;
        var P = 1 / 4;
        var Q = 3 / 4;
        var R = 11 / 64;
        var S = 53 / 64;
        var SOLID = true;
        var NON_SOLID = false;

         /**
         * Additions to default Slope Tile definition.
         * <br>- added half tiles
         * <br>- added ladder tiles
         * @see ig.CollisionMap
         **/
        var dtd = ig.CollisionMap.defaultTileDef;

// climbable one way

        dtd[ 100 ] = [0, 0, 1, 0, NON_SOLID];

// half solid horizontal
        dtd[ 56 ] = [ 0, H, 1, H, SOLID ];
        dtd[ 67 ] = [ 1, H, 0, H, SOLID ];

// half solid vertical
        dtd[ 78 ] = [ H, 0, H, 1, SOLID ];
        dtd[ 89 ] = [ H, 1, H, 0, SOLID ];

// 15 NE
        dtd[ 71 ] = [ 0, H, 1, R, SOLID ];
        dtd[ 72 ] = [ 0, R, H, 0, SOLID ];
        dtd[ 61 ] = [ H, 1, 1, S, SOLID ];
        dtd[ 62 ] = [ 0, S, 1, H, SOLID ];

// 22 NE
        dtd[ 69 ] = [ 0, H, 1, 0, SOLID ];
        dtd[ 59 ] = [ 0, 1, 1, H, SOLID ];

// 45 NE
        dtd[ 68 ] = [ 0, H, H, 0, SOLID ];
        dtd[ 57 ] = [ H, 1, 1, H, SOLID ];

// 67 NE
        dtd[ 87 ] = [ 0, H, P, 0, SOLID ];
        dtd[ 76 ] = [ P, 1, Q, 0, SOLID ];
        dtd[ 65 ] = [ Q, 1, 1, H, SOLID ];

// 75 NE
        dtd[ 142 ] = [ 0, H, P, 0, SOLID ];
        dtd[ 131 ] = [ P, 1, H, 0, SOLID ];
        dtd[ 120 ] = [ H, 1, Q, 0, SOLID ];
        dtd[ 109 ] = [ Q, 1, 1, H, SOLID ];

// 15 SE
        dtd[ 104 ] = [ 0, H, 1, S, SOLID ];
        dtd[ 105 ] = [ 0, S, H, 1, SOLID ];
        dtd[ 116 ] = [ H, 0, 1, R, SOLID ];
        dtd[ 117 ] = [ 0, R, 1, H, SOLID ];

// 22 SE
        dtd[ 102 ] = [ 0, H, 1, 1, SOLID ];
        dtd[ 114 ] = [ 0, 0, 1, H, SOLID ];

// 45 SE
        dtd[ 101 ] = [ 0, H, H, 1, SOLID ];
        dtd[ 112 ] = [ H, 0, 1, H, SOLID ];

// 67 SE
        dtd[ 66 ] = [ 0, H, P, 1, SOLID ];
        dtd[ 77 ] = [ P, 0, Q, 1, SOLID ];
        dtd[ 88 ] = [ Q, 0, 1, H, SOLID ];

// 75 SE
        dtd[ 110 ] = [ 0, H, R, 1, SOLID ];
        dtd[ 121 ] = [ R, 0, H, 1, SOLID ];
        dtd[ 132 ] = [ H, 0, S, 1, SOLID ];
        dtd[ 143 ] = [ S, 0, 1, H, SOLID ];

// 15 NW
        dtd[ 95 ] = [ 1, H, 0, R, SOLID ];
        dtd[ 94 ] = [ 1, R, H, 0, SOLID ];
        dtd[ 83 ] = [ H, 1, 0, S, SOLID ];
        dtd[ 82 ] = [ 1, S, 0, H, SOLID ];

// 22 NW
        dtd[ 92 ] = [ 1, H, 0, 0, SOLID ];
        dtd[ 80 ] = [ 1, 1, 0, H, SOLID ];

// 45 NW
        dtd[ 90 ] = [ 1, H, H, 0, SOLID ];
        dtd[ 79 ] = [ H, 1, 0, H, SOLID ];

// 67 NW
        dtd[ 85 ] = [ 1, H, Q, 0, SOLID ];
        dtd[ 74 ] = [ Q, 1, P, 0, SOLID ];
        dtd[ 63 ] = [ P, 1, 0, H, SOLID ];

// 75 NW
        dtd[ 140 ] = [ 1, H, S, 0, SOLID ];
        dtd[ 129 ] = [ S, 1, H, 0, SOLID ];
        dtd[ 118 ] = [ H, 1, R, 0, SOLID ];
        dtd[ 107 ] = [ R, 1, 0, H, SOLID ];

// 15 SW
        dtd[ 128 ] = [ 1, H, 0, S, SOLID ];
        dtd[ 127 ] = [ 1, S, H, 1, SOLID ];
        dtd[ 138 ] = [ H, 0, 0, R, SOLID ];
        dtd[ 137 ] = [ 1, R, 0, H, SOLID ];

// 22 SW
        dtd[ 125 ] = [ 1, H, 0, 1, SOLID ];
        dtd[ 135 ] = [ 1, 0, 0, H, SOLID ];

// 45 SW
        dtd[ 123 ] = [ 1, H, H, 1, SOLID ];
        dtd[ 134 ] = [ H, 0, 0, H, SOLID ];

// 67 SW
        dtd[ 64 ] = [ 1, H, Q, 1, SOLID ];
        dtd[ 75 ] = [ Q, 0, P, 1, SOLID ];
        dtd[ 86 ] = [ P, 0, 0, H, SOLID ];

// 75 SW
        dtd[ 108 ] = [ 1, H, S, 1, SOLID ];
        dtd[ 119 ] = [ S, 0, H, 1, SOLID ];
        dtd[ 130 ] = [ H, 0, R, 1, SOLID ];
        dtd[ 141 ] = [ R, 0, 0, H, SOLID ];

    });
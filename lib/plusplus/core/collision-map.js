ig.module(
        'plusplus.core.collision-map'
    ).requires(
        'impact.collision-map',
        'plusplus.core.config'
    )
    .defines(function () {
        'use strict';

        var _c = ig.CONFIG;

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

        // add new tiles that collide

        var NON_SOLID = false;

        ig.CollisionMap.defaultTileDef[ _c.COLLISION.TILE_CLIMBABLE_WITH_TOP ] = [0,0, 1,0, NON_SOLID];
        ig.CollisionMap.defaultTileDef[ _c.COLLISION.TILE_CLIMBABLE_STAIRS_WITH_TOP ] = [0,0, 1,0, NON_SOLID];

    });
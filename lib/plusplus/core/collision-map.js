ig.module(
    'plusplus.core.collision-map'
).requires(
    'impact.collision-map',
    'plusplus.core.config'
)
    .defines(function() {
        'use strict';

        var _c = ig.CONFIG;

        /**
         * Fixes and enhancements for collision-maps.
         * @class ig.CollisionMap
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.CollisionMap.inject({

            trace: function(x, y, vx, vy, objectWidth, objectHeight, res) {

                // each entity has its own res object
                // to avoid constantly creating new ones

                res.collision.x = res.collision.y = res.collision.slope = false;
                res.pos.x = x;
                res.pos.y = y;
                res.tile.x = res.tile.y = 0;

                // Break the trace down into smaller steps if necessary
                var steps = Math.ceil(Math.max(Math.abs(vx), Math.abs(vy)) / this.tilesize);
                if (steps > 1) {
                    var sx = vx / steps;
                    var sy = vy / steps;

                    for (var i = 0; i < steps && (sx || sy); i++) {
                        this._traceStep(res, x, y, sx, sy, objectWidth, objectHeight, vx, vy, i);

                        x = res.pos.x;
                        y = res.pos.y;
                        if (res.collision.x) {
                            sx = 0;
                            vx = 0;
                        }
                        if (res.collision.y) {
                            sy = 0;
                            vy = 0;
                        }
                        if (res.collision.slope) {
                            break;
                        }
                    }
                }

                // Just one step
                else {
                    this._traceStep(res, x, y, vx, vy, objectWidth, objectHeight, vx, vy, 0);
                }

                return res;

            },

            _traceStep: function(res, x, y, vx, vy, width, height, rvx, rvy, step) {

                res.pos.x += vx;
                res.pos.y += vy;

                var t = 0;
                var slope;
                var sx;
                var sy;
                var snx;
                var sny;

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
                                    t > 1 && t <= this.lastSlope && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, prevTileX, tileY) && res.slope.ny !== 0 // BUG FIX? check that this is not a one-way slope, else may have jitters
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
                                res.tile.xPos.x = tileX;
                                res.tile.xPos.y = tileY;

                                if (t > 1 && t <= this.lastSlope && res.collision.slope) {

                                    slope = true;
                                    sx = res.slope.x;
                                    sy = res.slope.y;
                                    snx = res.slope.nx;
                                    sny = res.slope.ny;

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
                                    t > 1 && t <= this.lastSlope && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, prevTileY) && res.slope.nx !== 0 // BUG FIX? check that this is not a one-way slope, else may have jitters
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
                                res.tile.yPos.x = tileX;
                                res.tile.yPos.y = tileY;

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

                // reset slope to x slope when present

                if (slope) {

                    res.slope.x = sx;
                    res.slope.y = sy;
                    res.slope.nx = snx;
                    res.slope.ny = sny;

                }

            },

            _checkTileDef: function(res, t, x, y, vx, vy, width, height, tileX, tileY) {
                var def = this.tiledef[t];
                if (!def) {
                    return false;
                }

                var lx = (tileX + def[0]) * this.tilesize,
                    ly = (tileY + def[1]) * this.tilesize,
                    lvx = (def[2] - def[0]) * this.tilesize,
                    lvy = (def[3] - def[1]) * this.tilesize,
                    solid = def[4];

                // Find the box corner to test, relative to the line
                var tx = x + vx + (lvy < 0 ? width : 0) - lx,
                    ty = y + vy + (lvx > 0 ? height : 0) - ly;

                // Is the box corner behind the line?
                if (lvx * ty - lvy * tx > 0) {

                    // Lines are only solid from one side - find the dot product of
                    // line normal and movement vector and dismiss if wrong side
                    if (vx * -lvy + vy * lvx < 0) {
                        return solid;
                    }

                    // Find the line normal
                    var length = Math.sqrt(lvx * lvx + lvy * lvy);
                    var nx = lvy / length,
                        ny = -lvx / length;

                    // Project out of the line
                    var proj = tx * nx + ty * ny;
                    var px = nx * proj,
                        py = ny * proj;

                    // If we project further out than we moved in, then this is a full
                    // tile collision for solid tiles.
                    // For non-solid tiles, make sure we were in front of the line.

                    if (px * px + py * py >= vx * vx + vy * vy) {

                        // BUG FIX? double subtract velocity to avoid falling through one way tiles
                        // this generally only happens when moving down a slope into a one way tile
                        // downside is this tends to cause false positives on one way tiles
                        //return solid || (lvx * (ty-vy * 2) - lvy * (tx-vx * 2) < 0.5);
                        return solid || (lvx * (ty - vy) - lvy * (tx - vx) < 0.5);

                    }

                    res.pos.x = x + vx - px;
                    res.pos.y = y + vy - py;
                    res.collision.slope = true;
                    res.slope.x = lvx;
                    res.slope.y = lvy;
                    res.slope.nx = nx;
                    res.slope.ny = ny;

                    return true;
                }

            }

        });

        // add some extra tile definitions

        var dtd = ig.CollisionMap.defaultTileDef;
        var SOLID = true;
        var NON_SOLID = false;

        for (var tileId in _c.COLLISION.TILES_HASH_WALKABLE_STRICT) {

            dtd[tileId] = null;

        }

        dtd[_c.COLLISION.TILE_SOLID] = [0, 0, 1, 0, SOLID];
        dtd[_c.COLLISION.TILE_CLIMBABLE_WITH_TOP] = [0, 0, 1, 0, NON_SOLID];
        dtd[_c.COLLISION.TILE_CLIMBABLE_STAIRS_WITH_TOP] = [0, 0, 1, 0, NON_SOLID];

    });

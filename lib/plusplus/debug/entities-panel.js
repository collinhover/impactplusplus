ig.module(
    'plusplus.debug.entities-panel'
)
    .requires(
        'plusplus.core.game',
        'plusplus.core.entity',
        'plusplus.debug.menu'
)
    .defines(function() {
        "use strict";

        ig.EntityExtended.inject({

            handleMovementTrace: function(res) {

                this.parent(res);

                this._res = res;

            }

        });

        ig.GameExtended.inject({

            draw: function() {

                this.parent();

                this._debugDraw();

            },

            _debugDraw: function() {

                for (var i = 0, il = this.layers.length; i < il; i++) {

                    var layer = this.layers[i];
                    var items = layer.items;

                    for (var j = 0, jl = items.length; j < jl; j++) {

                        var item = items[j];
                        var k, kl;

                        var context = ig.system.context;

                        var screenX;
                        var screenY;

                        if (item.fixed) {

                            screenX = 0;
                            screenY = 0;

                        } else {

                            screenX = this.screen.x;
                            screenY = this.screen.y;

                        }

                        var x;
                        var y;
                        var vertices;

                        if (item.pos && item.size) {

                            x = item.pos.x + item.size.x * 0.5;
                            y = item.pos.y + item.size.y * 0.5;

                        } else {

                            x = y = 0;

                        }

                        // collision map result
                        if (ig.EntityExtended._debugShowCollisionMapRes && item._res) {

                            var res = item._res;
                            var tilesize = ig.game.collisionMap && ig.game.collisionMap.tilesize;

                            if (res.tile.x) {

                                vertices = ig.utilstile.defaultTileVerticesDef[res.tile.x];

                                if (vertices && tilesize) {

                                    for (k = 0, kl = vertices.length; k < kl; k++) {

                                        this._debugDrawLine(false, this._debugColors.collisionMap, (res.tile.xPos.x + vertices[k].x) * tilesize, (res.tile.xPos.y + vertices[k].y) * tilesize, (res.tile.xPos.x + vertices[k === kl - 1 ? 0 : k + 1].x) * tilesize, (res.tile.xPos.y + vertices[k === kl - 1 ? 0 : k + 1].y) * tilesize);

                                    }

                                }

                            }

                            if (res.tile.y) {

                                vertices = ig.utilstile.defaultTileVerticesDef[res.tile.y];

                                if (vertices && tilesize) {

                                    for (k = 0, kl = vertices.length; k < kl; k++) {

                                        this._debugDrawLine(false, this._debugColors.collisionMap, (res.tile.yPos.x + vertices[k].x) * tilesize, (res.tile.yPos.y + vertices[k].y) * tilesize, (res.tile.yPos.x + vertices[k === kl - 1 ? 0 : k + 1].x) * tilesize, (res.tile.yPos.y + vertices[k === kl - 1 ? 0 : k + 1].y) * tilesize);

                                    }

                                }

                            }

                        }

                        // vertices
                        if (ig.EntityExtended._debugShowVertices && item.vertices) {

                            vertices = item.vertices;

                            for (k = 0, kl = vertices.length; k < kl; k++) {

                                this._debugDrawLine(item.fixed, this._debugColors.vertices,
                                    x + vertices[k].x, y + vertices[k].y,
                                    x + vertices[k === kl - 1 ? 0 : k + 1].x, y + vertices[k === kl - 1 ? 0 : k + 1].y
                                );

                            }

                        }

                        // bounds
                        if (ig.EntityExtended._debugShowBounds && item.pos) {

                            context.strokeStyle = this._debugColors.boxes;
                            context.lineWidth = 1.0;
                            context.strokeRect(
                                ig.system.getDrawPos(item.pos.x - screenX) - 0.5,
                                ig.system.getDrawPos(item.pos.y - screenY) - 0.5,
                                item.size.x * (item.scale || ig.system.scale),
                                item.size.y * (item.scale || ig.system.scale)
                            );

                        }
                        // bounds draw
                        if (ig.EntityExtended._debugShowBoundsDraw && item.posDraw) {

                            context.strokeStyle = this._debugColors.boxesDraw;
                            context.lineWidth = 1.0;
                            context.strokeRect(
                                ig.system.getDrawPos(item.posDraw.x - screenX) - 0.5,
                                ig.system.getDrawPos(item.posDraw.y - screenY) - 0.5,
                                item.sizeDraw.x * (item.scale || ig.system.scale),
                                item.sizeDraw.y * (item.scale || ig.system.scale)
                            );

                        }

                        // Velocities
                        if (ig.EntityExtended._debugShowVelocities && item.pos && item.size) {

                            this._debugDrawLine(item.fixed, this._debugColors.velocities, x, y, x + item.vel.x, y + item.vel.y);

                        }

                        // Names & Targets
                        if (ig.EntityExtended._debugShowNames && item.pos && item.size) {

                            context.fillStyle = this._debugColors.names;
                            context.fillText(
                                "[ " + item.layerName + ' | ' + item.id + " ]" + (item.name ? " " + item.name : ''),
                                ig.system.getDrawPos(item.pos.x - screenX),
                                ig.system.getDrawPos(item.pos.y - screenY)
                            );

                            if (typeof(item.target) == 'object') {
                                for (var t in item.target) {
                                    var ent = ig.game.namedEntities[item.target[t]];
                                    if (ent) {
                                        this._debugDrawLine(item.fixed, this._debugColors.names,
                                            x, y,
                                            ent.pos.x + ent.size.x * 0.5, ent.pos.y + ent.size.y * 0.5
                                        );
                                    }
                                }
                            }
                        }

                    }

                }

            },

            _debugColors: {
                names: '#fff',
                velocities: '#0f0',
                boxes: '#0066FF',
                boxesDraw: '#00FF77',
                vertices: '#00f',
                collisionMap: "#f00"
            },

            _debugDrawLine: function(fixed, color, sx, sy, dx, dy) {

                var screenX;
                var screenY;

                if (fixed) {

                    screenX = 0;
                    screenY = 0;

                } else {

                    screenX = this.screen.x;
                    screenY = this.screen.y;

                }

                ig.system.context.strokeStyle = color;
                ig.system.context.lineWidth = 1.0;

                ig.system.context.beginPath();
                ig.system.context.moveTo(
                    ig.system.getDrawPos(sx - screenX),
                    ig.system.getDrawPos(sy - screenY)
                );
                ig.system.context.lineTo(
                    ig.system.getDrawPos(dx - screenX),
                    ig.system.getDrawPos(dy - screenY)
                );
                ig.system.context.stroke();
                ig.system.context.closePath();

            }

        });

        ig.EntityExtended._debugEnableChecks = true;
        ig.EntityExtended._debugShowVelocities = false;
        ig.EntityExtended._debugShowNames = false;
        ig.EntityExtended._debugShowVertices = false;
        ig.EntityExtended._debugShowBounds = false;
        ig.EntityExtended._debugShowBoundsDraw = false;
        ig.EntityExtended._debugShowCollisionMapRes = false;

        ig.EntityExtended.oldCheckPair = ig.EntityExtended.checkPair;
        ig.EntityExtended.checkPair = function(a, b) {
            if (!ig.EntityExtended._debugEnableChecks) {
                return;
            }
            ig.EntityExtended.oldCheckPair(a, b);
        };

        ig.debug.addPanel({
            type: ig.DebugPanel,
            name: 'entities',
            label: 'Entities',
            options: [{
                name: 'Show Names & Targets',
                object: ig.EntityExtended,
                property: '_debugShowNames'
            }, {
                name: 'Checks & Collisions',
                object: ig.EntityExtended,
                property: '_debugEnableChecks'
            }, {
                name: 'Show Collision Map Result',
                object: ig.EntityExtended,
                property: '_debugShowCollisionMapRes'
            }, {
                name: 'Show Velocities',
                object: ig.EntityExtended,
                property: '_debugShowVelocities'
            }, {
                name: 'Show Collision Boxes',
                object: ig.EntityExtended,
                property: '_debugShowBounds'
            }, {
                name: 'Show Drawing Boxes',
                object: ig.EntityExtended,
                property: '_debugShowBoundsDraw'
            }, {
                name: 'Show Vertex Boxes',
                object: ig.EntityExtended,
                property: '_debugShowVertices'
            }]
        });

    });

ig.module(
    'plusplus.abstractities.particle-fast'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.particle'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Base entity class for high performance particles, that don't change animations (but can animate), don't collide with map or entities, don't check against entities, etc.
         * <span class="alert"><strong>IMPORTANT:</strong> this removes most, if not all, of the extra functionality built into entities to try and speed up performance!</span>
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.Particle
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // fast particles are meant for particles that
         * // - move with velocity, but ignore accel, friction, and gravity
         * // - don't use offsets (posDraw = pos and sizeDraw = size)
         * // - only ever use one animation and dont use overriding animations
         * // - ignore animSettings (set the animation in the initProperties)
         * // - don't need to flip or face different directions
         * // - don't need a full refresh
         * // - don't collide with the map or other entities
         * // - are always moving and changed (changed check is skipped)
         * // - does not link to another entity
         * // - does not resize except for once when added to game
         **/
        ig.ParticleFast = ig.Particle.extend( /**@lends ig.ParticleFast.prototype */ {

            /**
             * Fast particles have no type.
             * @override
             * @default never
             */
            type: ig.EntityExtended.TYPE.NONE,

            /**
             * Fast particles collide with nothing.
             * @override
             * @default never
             */
            collides: ig.EntityExtended.COLLIDES.NEVER,

            /**
             * Fast particles check against nothing.
             * @override
             * @default none
             */
            checkAgainst: ig.EntityExtended.TYPE.NONE,

            /**
             * Fast particles are dynamic but do not collide with map.
             * @override
             * @default never
             */
            performance: ig.EntityExtended.PERFORMANCE.DYNAMIC,

            /**
             * Fast particles are high performance entities.
             * @override
             * @default never
             */
            highPerformance: true,

            /**
             * Fast particles have an abbreviated init where some methods, such as initTypes and initProperties, are skipped.
             * @override
             */
            init: function(x, y, settings) {

                this.id = ++ig.Entity._lastId;

                this.lifeTimer = new ig.Timer();

                this.onAdded = new ig.Signal();
                this.onRemoved = new ig.Signal();
                this.onMovedTo = new ig.Signal();

                this.reset(x, y, settings);

            },

            /**
             * Fast particles are always changed and moving, and have an abbreviated reset.
             * @override
             */
            reset: function(x, y, settings) {

                this.pos.x = x;
                this.pos.y = y;

                this.posDraw = this.pos;
                this.sizeDraw = this.size;

                ig.merge(this, settings);

                this._killed = false;

                // changed and moving are never set again

                this.changed = true;
                this.moving = this.movingX = this.movingY = true;

                // refresh

                if (!this.ignoreSystemScale) {

                    var scale = Math.min(Math.max(Math.round(ig.system.scale * this.scaleOfSystemScale), this.scaleMin), this.scaleMax);

                    if (this.scale !== scale) {

                        this.scale = scale;

                    }

                }

                this.scaleMod = this.scale / ig.system.scale;

                // invert fades so we can multiply instead of dividing

                if (this.fadeAfterSpawnDuration) {

                    this._fadeAfterInv = 1 / (this.fadeAfterSpawnDuration);

                }

                if (this.fadeBeforeDeathDuration) {

                    this._fadeBeforeInv = 1 / (this.fadeBeforeDeathDuration);
                    this._fadeBeforeDiff = this.lifeDuration - this.fadeBeforeDeathDuration;

                }

            },

            /**
             * Fast particles do refresh scale, but do not resize, reposition, or rebuild, and refresh is done only once in reset method.
             */
            refresh: function() {},

            /**
             * Fast particles do reset all in reset method.
             * @override
             **/
            resetCore: function() {},

            /**
             * Fast particles do reset all in reset method.
             * @override
             **/
            resetExtras: function() {},

            /**
             * Fast particles don't record reset state.
             * @override
             */
            recordResetState: function() {},

            /**
             * Fast particles have an abbreviated ready.
             * @override
             **/
            ready: function() {

                this.lifeTimer.set(this.lifeDuration);

                if (this.randomVel) {

                    if (this.randomDoubleVel) {

                        this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
                        this.vel.y = (Math.random() * 2 - 1) * this.vel.y;

                    } else {

                        this.vel.x *= Math.random();
                        this.vel.y *= Math.random();

                    }

                }

                if (this.currentAnim) {

                    if (this.randomFlip) {

                        this.flip.x = (Math.random() > 0.5);
                        this.flip.y = (Math.random() > 0.5);

                    } else {

                        // flip based on starting velocity

                        if (this.canFlipX) {

                            this.flip.x = this.vel.x < 0 ? true : false;

                        }

                        if (this.canFlipY) {

                            this.flip.y = this.vel.y < 0 ? true : false;

                        }

                    }

                }

            },

            /**
             * Fast particles don't call the spawn method (use ready instead).
             * @override
             **/
            spawn: function() {},

            /**
             * Fast particles don't tween.
             * @override
             */
            tween: function() {
                throw new Error("Attempting to TWEEN fast particle but fast particle does not tween!");
            },

            /**
             * Fast particles don't collide with other entities.
             * @override
             **/
            collideWith: function() {
                throw new Error("Attempting to COLLIDE fast particle but fast particle does not collide!");
            },

            /**
             * Fast particles don't collide with collision map.
             * @override
             **/
            handleMovementTrace: function() {
                throw new Error("Attempting to TRACE COLLISION MAP fast particle but fast particle ignore collision map!");
            },

            /**
             * Fast particles always die silently.
             * @override
             */
            kill: function() {

                if (!this._killed) {

                    ig.game.removeEntity(this);

                }

            },

            /**
             * Fast particles don't call die method, use kill instead.
             * @override
             */
            die: function() {},

            /**
             * Fast particle has an abbreviated cleanup.
             **/
            cleanup: function() {

                // stop moving to

                this.moveToStop();

                // signals

                this.onRemoved.dispatch(this);

                // clean signals when game has no level

                if (!ig.game.hasLevel) {

                    this.onAdded.removeAll();
                    this.onAdded.forget();
                    this.onRemoved.removeAll();
                    this.onRemoved.forget();
                    this.onMovedTo.removeAll();
                    this.onMovedTo.forget();

                    for (var name in this.anims) {

                        var anim = this.anims[name];

                        anim.onCompleted.removeAll();
                        anim.onCompleted.forget();

                    }

                }

            },

            /**
             * Fast particles condense entire update flow into a single method.
             * @override
             **/
            update: function() {

                if (!this.paused) {

                    if (!this._killed) {

                        // check life time and set alpha

                        var delta = this.lifeTimer.delta();

                        if (delta >= 0) {

                            return this.kill();

                        } else {

                            var deltaInv = delta + this.lifeDuration;

                            this.alpha = (this.fadeAfterSpawnDuration !== 0 ? Math.min(1, deltaInv * this._fadeAfterInv) : 1) - (this.fadeBeforeDeathDuration !== 0 ? Math.max(0, (deltaInv - this._fadeBeforeDiff) * this._fadeBeforeInv) : 0);

                        }

                        if (this.movingTo) {

                            this.moveToUpdate();

                        } else {

                            this.pos.x += this.vel.x * ig.system.tick;
                            this.pos.y += this.vel.y * ig.system.tick;

                        }

                        if (this.getIsVisible()) {

                            this.visible = true;
                            this.currentAnim.update();

                        } else {

                            this.visible = false;

                        }

                    }

                }
                // check visible when paused but camera is not
                else if (ig.game.camera && !ig.game.camera.paused) {

                    this.visible = this.getIsVisible();

                }

            },

            /**
             * Fast particles are never fixed and have a simpler visible check.
             * @override
             **/
            getIsVisible: function() {

                if (this.alpha <= 0) return false;
                else {

                    var minX = this.posDraw.x - ig.game.screen.x;
                    var minY = this.posDraw.y - ig.game.screen.y;

                    if (minX < 0 || minY < 0 || minX + this.sizeDraw.x > ig.system.width || minY + this.sizeDraw.y > ig.system.height) return false;

                }

                return true;

            },

            /**
             * Fast particles never records changes.
             * @override
             */
            recordChanges: function() {
                throw new Error("Attempting to RECORD CHANGES in fast particle but fast particle is always changed!");
            },

            /**
             * Fast particles never records last.
             * @override
             */
            recordLast: function() {
                throw new Error("Attempting to RECORD LAST of fast particle but fast particle doesn't record last!");
            },

            /**
             * Fast particles never records last.
             * @override
             */
            updateBounds: function() {
                throw new Error("Attempting to UPDATE BOUNDS of fast particle but fast particle does not update bounds!");
            },

            /**
             * Fast particles draw assuming animation exists, not fixed, no flipping, no texturing, and no angle change.
             * <span class="alert alert-error"><strong>IMPORTANT:</strong> all important animation and image draw code is pulled into this single method!</span>
             **/
            draw: function() {

                if (this.visible) {

                    var anim = this.currentAnim;
                    var sheet = anim.sheet;
                    var image = sheet.image;

                    if (image.loaded) {

                        if (image._scale !== this.scale) {

                            image.resize(this.scale);

                        }

                        var scale = this.scale;
                        var tileWidth = sheet.width;
                        var tileHeight = sheet.height;
                        var tileWidthScaled = Math.floor(tileWidth * scale);
                        var tileHeightScaled = Math.floor(tileHeight * scale);

                        if (this.alpha !== 1) {

                            ig.system.context.globalAlpha = this.alpha;

                            ig.system.context.drawImage(
                                image.data, (Math.floor(anim.tile * tileWidth) % image.width) * scale, (Math.floor(anim.tile * tileWidth / image.width) * tileHeight) * scale,
                                tileWidthScaled,
                                tileHeightScaled,
                                ig.system.getDrawPos(this.posDraw.x - ig.game.screen.x),
                                ig.system.getDrawPos(this.posDraw.y - ig.game.screen.y),
                                tileWidthScaled,
                                tileHeightScaled
                            );

                            ig.system.context.globalAlpha = 1;

                        } else {

                            ig.system.context.drawImage(
                                image.data, (Math.floor(anim.tile * tileWidth) % image.width) * scale, (Math.floor(anim.tile * tileWidth / image.width) * tileHeight) * scale,
                                tileWidthScaled,
                                tileHeightScaled,
                                ig.system.getDrawPos(this.posDraw.x - ig.game.screen.x),
                                ig.system.getDrawPos(this.posDraw.y - ig.game.screen.y),
                                tileWidthScaled,
                                tileHeightScaled
                            );

                        }

                        ig.Image.drawCount++;

                    }

                }

            }

        });

    });

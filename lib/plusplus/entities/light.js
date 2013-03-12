/**
 * Dynamic light with inspiration from illuminated.js.
 * @extends ig.EntityExtended
 * @defines ig.global.EntityLight, ig.EntityLight
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'plusplus.entities.light'
)
.requires(
	'plusplus.core.entity',
	'plusplus.helpers.shared',
	'plusplus.helpers.utils',
	'plusplus.helpers.utilsmath',
	'plusplus.helpers.utilscolor',
	'plusplus.core.image-drawing',
    'plusplus.physics.box2d'
)
.defines(function(){ "use strict";
    
	var _s = ig.shared;
	var _u = ig.utils;
	var _um = ig.utilsmath;
	var _uc = ig.utilscolor;
    var _b2 = ig.Box2D;
	
	var STATIC = 1;
	var DYNAMIC = 2;
	
    ig.global.EntityLight = ig.EntityLight = ig.EntityExtended.extend({
		
		// backgroundLights layer is rendered before all other entities
		// foregroundLights layer is rendered after all other entities
		// generally we want lights behind all other entities in layer
		
		layerName: 'backgroundLights',
		
		// we need a big enough handle to grab in editor
		
		size: { x: ig.global.wm ? 10 : 1, y: ig.global.wm ? 10 : 1 },
		
		performance: STATIC,
		forceCompute: true,
		
		// color
		
		r: 1,
		g: 1,
		b: 1,
		alpha: 0.25,
		
		// by default, rgb is set on init and alpha can change dynamically
		// dynamicColor allows fpr color to change dynamically too
		
		dynamicColor: false,
		
		// for when the style of the game is very obviously pixelated
		// note: pixelPerfect + dynamic light will destroy your framerate
		
		pixelPerfect: false,
		
		// gradient or flat shaded
		
		gradient: true,
		
		// cast shadows on opaque objects
		
		castsShadows: true,
		
        radius: 10,
        diffuse: 0.9,
		samples: 1,
		
		// do not modify, used to record changes
		
		rLast: 0,
		gLast: 0,
		bLast: 0,
		alphaLast: 0,
		radiusLast: 0,
		
		rDelta: 0,
		gDelta: 0,
		bDelta: 0,
		alphaDelta: 0,
		radiusDelta: 0,
        
		/**
		 * See ig.EntityExtended
		 **/
        init: function () {
			
			this.utilVec2Samples1 = new _b2.Vec2();
			this.utilVec2Samples2 = new _b2.Vec2();
			
            this.items = [];
            
            this.parent.apply( this, arguments );
			
			if ( ig.global.wm ) {
				
				this.update();
				
			}
            
        },
		
		/**
		 * See ig.EntityExtended
		 **/
		getBounds: function () {
			
			return {
				minX: this.pos.x - this.radius,
				minY: this.pos.y - this.radius,
				maxX: this.pos.x + this.radius,
				maxY: this.pos.y + this.radius,
				width: this.radius * 2,
				height: this.radius * 2
			};
			
		},
		
		/**
		 * See ig.EntityExtended
		 **/
		getBoundsDraw: function () {
			
			var radius = this.radius;
			var diameter = radius * 2;
			var minX = this.pos.x - this.offset.x - radius;
			var minY = this.pos.y - this.offset.y - radius;
			
			return {
				minX: minX,
				minY: minY,
				maxX: minX + diameter,
				maxY: minY + diameter,
				width: diameter,
				height: diameter
			};
			
		},
		
		/**
		 * See ig.EntityExtended
		 **/
		getSizeX: function () {
			
			return this.radius;
			
		},
		
		/**
		 * See ig.EntityExtended
		 **/
		getSizeY: function () {
			
			return this.radius;
			
		},
		
        /**
        * Computes the light and casted shadows.
		* @param {Boolean} force compute even if unchanged.
        **/
		compute: function ( force ) {
			
			if ( ( this.visible && this.performance === DYNAMIC ) || force ) {
				
				// find all items to cast first, as can change
				
				if ( this.castsShadows ) {
					
					this.findItems();
					
				}
				
				if ( this.changed || force ) {
					
					// redraw basic light if scale changed
					
					if ( this.scaleComputedAt !== ig.system.scale || force ) {
						
						this.forceCompute = false;
						this.changed = true;
						this.scaleComputedAt = ig.system.scale;
						
						// new caches
						
						this.createCache();
						
						// create image of light
						
						this.createLight();
						
					}
					
					if ( this.castsShadows ) {
						
						// cast all shadows
						
						this.cast();
						
						// combine base with cast
						
						var context = this.image.dataContext;
						
						context.save();
						context.clearRect( 0, 0, this.image.dataWidth, this.image.dataHeight );
						
						context.drawImage( this.imageBase.data, 0, 0 );
						
						context.globalCompositeOperation = "destination-out";
						context.drawImage( this.imageCast.data, 0, 0 );
	
						context.restore();
						
					}
				
				}
				
			}
			
		},
        
        /**
         * Create cache images for drawing.
         **/
        createCache: function () {
            
			var diameter = this.radius * 2;
			
			this.image = new ig.ImageDrawing( diameter, diameter );
			this.imageBase = new ig.ImageDrawing( diameter, diameter );
			this.imageCast = new ig.ImageDrawing( diameter, diameter );
			this.imageColor = new ig.ImageDrawing( diameter, diameter );
			
        },
		
        /**
         * Draws base light.
         **/
		createLight: function () {
			
			var width = this.radius * 2;
			var height = width;
			var image = this.castsShadows ? this.imageBase : this.image;
			var context, base;
			var r, g, b;
			
			// if not dynamic color, draw color directly into final image
			
			if ( !this.dynamicColor ) {
				
				r = this.r;
				g = this.g;
				b = this.b;
				
			}
			else {
				
				r = 1;
				g = 1;
				b = 1;
				
			}
			
			// directly write the pixels or the light will not be pixel perfect when scaled to game scale
			
			if ( this.pixelPerfect ) {
				
				context = image.context;
				base = context.createImageData( width, height );
				
				for ( var x = 0; x < width; x++ )  {
					for ( var y = 0; y < height; y++ )  {
						
						if ( _um.pointInCircle( x, y, this.radius, this.radius, this.radius ) ) {
							
							var index = (x + y * width) * 4;
							
							base.data[ index ] = ( r * 255 ) | 0;
							base.data[ index + 1 ] = ( g * 255 ) | 0;
							base.data[ index + 2 ] = ( b * 255 ) | 0;
							
							if ( this.gradient ) {
								
								var dx = this.radius - x;
								var dy = this.radius - y;
								var invDistPct = 1 - ( Math.sqrt( dx * dx + dy * dy ) / this.radius );
								
								base.data[ index + 3 ] = ( invDistPct * 255 ) | 0;
								
							}
							else {
								
								base.data[ index + 3 ] = 255;
								
							}
							
						}
						
					}
				}
				
				context.putImageData( base, 0, 0 );
				
				// finalize the pixels from the unscaled to the scaled
				
				image.finalize();
				
			}
			// when pixel perfect is not needed, it is much faster to use native methods
			else {
				
				var radiusScaled = ig.system.getDrawPos( this.radius );
				
				context = image.dataContext;
				
				if ( this.gradient ) {
					
					var diameterScaled = radiusScaled * 2;
					var gradient = context.createRadialGradient( radiusScaled, radiusScaled, 0, radiusScaled, radiusScaled, radiusScaled );
					
					gradient.addColorStop( 0, _uc.RGBToCSS( r, g, b ) );
					gradient.addColorStop( 1, _uc.RGBAToCSS( r, g, b, 0 ) );
					
					context.fillStyle = gradient;
					context.fillRect( 0, 0, diameterScaled, diameterScaled );
					
				}
				else {
					
					context.fillStyle = _uc.RGBToCSS( r, g, b );
					context.arc( radiusScaled, radiusScaled, radiusScaled, 0, _um.TWOPI );
					context.fill();
					
				}
				
			}
			
		},
		
		/**
		 * Find all opaque items within bounds
		 **/
		findItems: function () {
			
			var bounds = this.bounds;
			var numItemsPrefind = this.items.length;
			var i, il, layerName, layer;
			
			if ( ig.game.layerOrder ) {
				
				for ( i = 0, il = ig.game.layerOrder.length; i < il; i++) {
					
					layerName = ig.game.layerOrder[ i ];
					layer = ig.game.layers[layerName];
					
					if ( layer.entityLayer ) {
						
						var itemsOpaque = layer.itemsOpaque;
						var j, jl, item, itemBounds;
						
						for ( j = 0, jl = itemsOpaque.length; j < jl; j++ ) {
							
							item = itemsOpaque[ j ];
							itemBounds = item.bounds;
							
							// under and within light
							
							if ( item._killed !== true && item.zIndex <= this.zIndex && _um.AABBIntersectsAABB( itemBounds.minX, itemBounds.minY, itemBounds.maxX, itemBounds.maxY, bounds.minX, bounds.minY, bounds.maxX, bounds.maxY ) ) {
								
								_u.arrayCautiousAdd( this.items, item );
								
								this.changed |= item.changed;
								
							}
							// out of light
							else {
								
								_u.arrayCautiousRemove( this.items, item );
								
							}
							
						}
						
					}
					
				}
				
				// items changed, light is changed
				
				this.changed |= numItemsPrefind !== this.items.length;
				
			}
			
		},
        
        /**
         * Draw the shadows that are cast by items.
         **/
        cast: function () {
			
			// draw shadows for each light sample and item
			
			var contextCast;
			
			// always faster to avoid pixel perfect
			
			if ( this.pixelPerfect ) {
				
				contextCast = this.imageCast.context;
				contextCast.clearRect( 0, 0, this.imageCast.width, this.imageCast.height );
				
				var bounds = this.bounds;
				var items = this.items;
				var i, il, item;
				var me = this;
				
				this.forEachSample( function ( position ) {
					
					for ( i = 0, il = items.length; i < il; i++ ) {
						
						items[ i ].cast( me, contextCast, position, bounds );
						
					}
					
				} );
				
				// finalize the pixels from the unscaled to the scaled
				
				this.imageCast.finalize();
				
			}
			else {
				
				contextCast = this.imageCast.dataContext;
				contextCast.clearRect( 0, 0, this.imageCast.dataWidth, this.imageCast.dataHeight );
				
				var bounds = this.bounds;
				var items = this.items;
				var i, il, item;
				var me = this;
				
				this.forEachSample( function ( position ) {
					
					for ( i = 0, il = items.length; i < il; i++ ) {
						
						items[ i ].cast( me, contextCast, position, bounds );
						
					}
					
				} );
				
			}
			
        },
		
        /**
         * See ig.EntityExtended.
         **/
		recordChanges: function ( force ) {
			
			// record last here instead of in recordLast
			// radius, alpha, and color will likely never change in update
			
			this.radiusDelta = this.radius - this.radiusLast;
			this.alphaDelta = this.alpha - this.alphaLast;
			this.radiusLast = this.radius;
			this.alphaLast = this.alpha;
			
			if ( this.radiusDelta !== 0 || this.alphaDelta !== 0 ) {
				
				force = true;
				
			}
			
			if ( this.dynamicColor ) {
				
				this.rDelta = this.r - this.rLast;
				this.gDelta = this.g - this.gLast;
				this.bDelta = this.b - this.bLast;
				this.rLast = this.r;
				this.gLast = this.g;
				this.bLast = this.b;
			
				if ( this.rDelta !== 0 || this.gDelta !== 0 || this.bDelta !== 0 ) {
					
					force = true;
					
				}
				
			}
			
			this.parent( force );
			
			if ( this.alpha === 0 ) {
				
				this.visible = false;
				
			}
			
		},
		
        /**
         * See ig.EntityExtended.
         **/
        update: function ( force ) {
			
			this.recordLast();
			
			this.moveToUpdate();
			
			this.compute( force || this.forceCompute );
			
			this.recordChanges( force );
			
		},
        
        /**
         * See ig.EntityExtended.
         **/
        draw: function () {
			
			var image = this.image;
			
			// fully recompute only in editor
			
			if ( ig.global.wm ) {
				
				this.update( true );
				
			}
			// not in screen
			else if ( !this.visible || !image ) {
				
				return;
				
			}
			
			if ( this.dynamicColor ) {
				
				var diameterScaled = ig.system.getDrawPos( diameter );
				
				// create final light image by combining light with tint
				// this allows dynamic changing of color, but slower performance
				
				var contextColor = this.imageColor.dataContext;
				
				contextColor.fillStyle = _uc.RGBToCSS( this.r, this.g, this.b );
				contextColor.fillRect( 0, 0, diameterScaled, diameterScaled );
				contextColor.save();
				contextColor.globalCompositeOperation = "destination-atop";
				contextColor.drawImage( this.image.data, 0, 0 );
				contextColor.restore();
				
				image = this.imageColor;
				
			}
			
			var context = ig.system.context;
			
			context.save();
			
			context.globalCompositeOperation = "lighter";
			context.globalAlpha = this.alpha;
			
			image.draw( this.boundsDraw.minX - ig.game.screen.x, this.boundsDraw.minY - ig.game.screen.y );
			
			context.restore();
			context.globalAlpha = 1;
			
        },
		
		/**
		 * Invoke a function for every sample generated by light using a "spiral" algorithm.
		 * @param {Function} function to be called for every sample.
		 **/
		forEachSample: function ( callback ) {
			
			if ( this.samples === 1 ) {
				
				callback( this.pos );
				
			}
			else {
				
				for ( var s = 0; s < this.samples; ++s ) {
					
					var a = s * _um.GOLDEN_ANGLE;
					var r = Math.sqrt( s / this.samples ) * this.radius;
					var delta = this.utilVec2Samples1.Set( Math.cos(a) * r, Math.sin(a) * r );
					
					callback( this.utilVec2Samples2.SetV( this.pos ).Add( delta ) );
					
				}
				
			}

		}
        
    } );
	
	// types for light variability
	
	ig.EntityLight.PERFORMANCE = {
		STATIC: STATIC,
		DYNAMIC: DYNAMIC
	};
    
} );
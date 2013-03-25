/**
 * Dynamic light with inspiration from illuminated.js.
 * @extends ig.EntityExtended
 * @defines ig.global.EntityLight, ig.EntityLight
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.entities.light'
)
.requires(
	'game.core.entity',
	'game.core.shared',
	'game.helpers.utils',
	'game.helpers.utilsmath',
    'game.helpers.utilsvector2',
	'game.helpers.utilsintersection',
	'game.helpers.utilscolor',
	'game.core.image-drawing'
)
.defines(function(){ "use strict";

var _s = ig.shared;
var _ut = ig.utils;
var _utm = ig.utilsmath;
var _utv2 = ig.utilsvector2;
var _uti = ig.utilsintersection;
var _utc = ig.utilscolor;

ig.global.EntityLight = ig.EntityLight = ig.EntityExtended.extend({
	
	// backgroundLights layer is rendered before all other entities (best for static lights)
	// foregroundLights layer is rendered after all other entities (best for dynamic lights)
	
	layerName: 'backgroundLights',
	
	// whether to allow layer swapping based on performance level
	
	layerLinkedToPerformance: true,
	
	// TODO: can we prerender static lights much like background maps?
	
	performance: _s.STATIC,
	
	// we need a big enough handle to grab in editor
	
	size: { x: ig.global.wm ? 10 : 1, y: ig.global.wm ? 10 : 1 },
	
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
	
	// cast shadows on dynamic opaque objects
	
	castsShadowsDynamic: false,
	
	radius: 10,
	diffuse: 0.9,
	samples: 1,
	
	// do not modify, used to record changes
	
	rLast: 0,
	gLast: 0,
	bLast: 0,
	alphaLast: 0,
	radiusLast: 0,
	
	/**
	 * See ig.EntityExtended
	 **/
	init: function () {
		
		this.utilVec2Samples1 = _utv2.vector();
		this.utilVec2Samples2 = _utv2.vector();
		
		this.items = [];
		
		this.parent.apply( this, arguments );
		
		// do not allow kinematic light
		
		if ( this.performance === _s.KINEMATIC || ig.global.wm ) {
			
			this.performance = _s.DYNAMIC;
			
		}
		
	},
	
	/**
	* See ig.Entity
	**/
	ready: function () {
		
		this.parent();
		
		this.compute( true );
		
	},
	
	/**
	* See ig.EntityExtended
	**/
	changePerformanceStatic: function () {
		
		if ( this.layerLinkedToPerformance && this.layerName !== 'backgroundLights' ) {
			
			ig.game.removeItem( this, this.layerName );
			
			this.layerName = 'backgroundLights';
			
			ig.game.addItem( this );
			
		}
		
	},
	
	/**
	* See ig.EntityExtended
	**/
	changePerformanceDynamic: function () {
		
		if ( this.layerLinkedToPerformance && this.layerName !== 'foregroundLights' ) {
			
			ig.game.removeItem( this, this.layerName );
			
			this.layerName = 'foregroundLights';
			
			ig.game.addItem( this );
			
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
		
		if ( ( this.visible && this.performance === _s.DYNAMIC ) || force ) {
			
			// find all items to cast first, as can change
			
			if ( this.castsShadows ) {
				
				this.findItems();
				
			}
			
			if ( this.changed || force ) {
				
				// redraw basic light if scale changed
				
				if ( this.scaleComputedAt !== ig.system.scale || force ) {
					
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
					var compositeOperation = context.globalCompositeOperation;
					
					context.clearRect( 0, 0, this.image.dataWidth, this.image.dataHeight );
					
					context.drawImage( this.imageBase.data, 0, 0 );
					
					context.globalCompositeOperation = "destination-out";
					
					context.drawImage( this.imageCast.data, 0, 0 );
					
					context.globalCompositeOperation = compositeOperation;
					
				}
			
			}
			
		}
		
	},
	
	/**
	 * Create cache images for drawing.
	 **/
	createCache: function () {
		
		var diameter = this.radius * 2;
		var settings = {
			width: diameter,
			height: diameter
		};
		
		this.image = new ig.ImageDrawing( settings );
		this.imageBase = new ig.ImageDrawing( settings );
		this.imageCast = new ig.ImageDrawing( settings );
		this.imageColor = new ig.ImageDrawing( settings );
		
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
					
					if ( _uti.pointInCircle( x, y, this.radius, this.radius, this.radius ) ) {
						
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
				
				gradient.addColorStop( 0, _utc.RGBToCSS( r, g, b ) );
				gradient.addColorStop( 1, _utc.RGBAToCSS( r, g, b, 0 ) );
				
				context.fillStyle = gradient;
				context.fillRect( 0, 0, diameterScaled, diameterScaled );
				
			}
			else {
				
				context.fillStyle = _utc.RGBToCSS( r, g, b );
				context.arc( radiusScaled, radiusScaled, radiusScaled, 0, _utm.TWOPI );
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
			
			// faster to reset items list each time we find than to cautious add/remove
			
			this.items.length = 0;
			
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
						
						if ( item._killed !== true && ( item.performance === _s.STATIC || this.castsShadowsDynamic ) && _uti.AABBIntersectsAABBBounds( itemBounds, bounds ) ) {
							
							this.items.push( item );
							this.changed |= item.changed;
							
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
		
		if ( this.alpha === 0 ) {
			
			this.visible = false;
			
		}
		else {
			
			var alphaDelta = this.alpha - this.alphaLast;
			var radiusDelta = this.radius - this.radiusLast;
			
			if ( radiusDelta !== 0 || alphaDelta !== 0 ) {
				
				force = true;
				
			}
			
			if ( this.dynamicColor ) {
				
				var rDelta = this.r - this.rLast;
				var gDelta = this.g - this.gLast;
				var bDelta = this.b - this.bLast;
			
				if ( rDelta !== 0 || gDelta !== 0 || bDelta !== 0 ) {
					
					force = true;
					
				}
				
				this.rLast = this.r;
				this.gLast = this.g;
				this.bLast = this.b;
				
			}
			
			// record last here instead of in recordLast
			// radius, alpha, and color will likely never change in update
			
			this.radiusLast = this.radius;
			this.alphaLast = this.alpha;
			
		}
		
		this.parent( force );
		
	},
	
	/**
	 * See ig.EntityExtended.
	 **/
	updateCleanup: function ( force ) {
		
		this.parent();
		
		this.compute( force );
		
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
		if ( !this.visible || !image ) {
			
			return;
			
		}
		
		if ( this.dynamicColor ) {
			
			var diameterScaled = ig.system.getDrawPos( this.radius * 2 );
			
			// create final light image by combining light with tint
			// this allows dynamic changing of color, but slower performance
			
			var contextColor = this.imageColor.dataContext;
			
			contextColor.fillStyle = _utc.RGBToCSS( this.r, this.g, this.b );
			contextColor.fillRect( 0, 0, diameterScaled, diameterScaled );
			
			contextColor.globalCompositeOperation = "destination-atop";
			contextColor.drawImage( this.image.data, 0, 0 );
			
			image = this.imageColor;
			
		}
		
		var context = ig.system.context;
		
		if ( this.alpha !== 1 ) {
			context.globalAlpha = this.alpha;
		}
		
		image.draw( this.boundsDraw.minX - ig.game.screen.x, this.boundsDraw.minY - ig.game.screen.y );
		
		if ( this.alpha !== 1 ) {
			context.globalAlpha = 1;
		}
		
	},
	
	/**
	 * Invoke a function for every sample generated by light using a spiral algorithm.
	 * @param {Function} function to be called for every sample.
	 **/
	forEachSample: function ( callback ) {
		
		if ( this.samples === 1 ) {
			
			callback( this.pos );
			
		}
		else {
			
			for ( var s = 0; s < this.samples; ++s ) {
				
				var a = s * _utm.GOLDEN_ANGLE;
				var r = Math.sqrt( s / this.samples ) * this.radius;
				var delta = this.utilVec2Samples1.set( Math.cos(a) * r, Math.sin(a) * r );
				
				callback( this.utilVec2Samples2.copy( this.pos ).add( delta ) );
				
			}
			
		}

	}
	
} );

} );
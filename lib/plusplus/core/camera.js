/**
 * Camera object for following objects and controlling screen.
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'game.core.camera'
)
.requires(
    'game.core.shared',
	'game.core.image-drawing',
    'game.helpers.utils',
    'game.helpers.utilsmath',
    'game.helpers.utilsintersection',
	'game.helpers.utilscolor',
	'game.extras.tweens'
)
.defines(function(){ "use strict";

var _s = ig.shared;
var _ut = ig.utils;
var _utm = ig.utilsmath;
var _uti = ig.utilsintersection;
var _utc = ig.utilscolor;
var _tw = ig.tweens;

ig.Camera = ig.Class.extend( {
	
	// atmosphere color and alpha
	
	r: 0,
	g: 0,
	b: 0,
	alpha: 0,
	alphaBase: 0.9,
	
	alphaDuration: 1000,
	
	// amount to amplify light alpha when removing from atmosphere
	
	lightAmplification: 3,
	
	// whether to draw light base shape or with shadows cut out
	// be careful when using this with characters that cast shadows
	
	lightBaseOnly: false,
	
	// use to ignore lights
	
	ignoreLights: false,
	
	// follow bounds
	
	bounds: _uti.boundsMinMax( 0, 0, 0, 0 ),
	boundsPct: _uti.boundsMinMax( -0.2, -0.3, 0.2, 0.3 ),
	
	// whether to always try to keep target centered
	
	keepCentered: false,
	
	// how quickly to move
	
	lerp: 0.025,
	
	// do not modify
	
	atmosphere: false,
	changed: false,
	
	boundsScreen: _uti.boundsMinMax( 0, 0, 0, 0 ),
	
	screenLast: { x: 0, y: 0 },
	rLast: 0,
	gLast: 0,
	bLast: 0,
	alphaLast: 0,
	
	init: function ( settings ) {
		
		ig.merge( this, settings );
		
	},
	
	/**
	 * Resets this camera and game screen.
	 **/
	reset: function () {
		
		this.screenLast.x = ig.game.screen.x = 0;
		this.screenLast.y = ig.game.screen.y = 0;
		
		delete this.target;
		
	},
	
	toggleAtmosphere: function ( duration ) {
		
		if ( !this.atmosphere ) {
			
			this.addAtmosphere( duration );
			
		}
		else {
			
			this.removeAtmosphere( duration );
			
		}
		
	},
	
	addAtmosphere: function ( duration ) {
		
		if ( !this.atmosphere ) {
			
			var me = this;
			
			this.atmosphere = true;
			this.atmosphereMap = new ig.ImageDrawing( {
				ignoreScale: true
			} );
			
			this.resize();
				
			this.atmosphereTween = _tw.tween(
				this,
				{ alpha: this.alphaBase },
				{
					duration: _ut.isNumber( duration ) ? 0 : this.alphaDuration,
					tween: this.atmosphereTween,
					onComplete: function () {
						
						delete me.atmosphereTween;
						
					}
				}
			);
			
			this.updateAtmosphere();
			
		}
		
	},
	
	removeAtmosphere: function ( duration ) {
		
		var me = this;
		
		this.atmosphereTween = _tw.tween(
			this,
			{ alpha: 0 },
			{
				duration: _ut.isNumber( duration ) ? 0 : this.alphaDuration,
				tween: this.atmosphereTween,
				onComplete: function () {
					
					me.cleanAtmosphere();
					
				}
			}
		);
		
	},
	
	cleanAtmosphere: function () {
		
		this.alpha = 0;
		this.atmosphere = false;
		delete this.atmosphereTween;
		delete this.atmosphereMap;
		
	},
	
	updateAtmosphere: function () {
		
		if ( this.atmosphere ) {
			
			// check if changed
			
			var alphaDelta = this.alpha - this.alphaLast;
			var rDelta = this.r - this.rLast;
			var gDelta = this.g - this.gLast;
			var bDelta = this.b - this.bLast;
		
			if ( alphaDelta !== 0 || rDelta !== 0 || gDelta !== 0 || bDelta !== 0 ) {
				
				this.changed = true;
				
			}
			
			// redraw
			
			if ( ( this.changed || ig.game.dirtyLights || ig.game.changedLights ) && this.alpha ) {
			
				// record last
				
				this.rLast = this.r;
				this.gLast = this.g;
				this.bLast = this.b;
				this.alphaLast = this.alpha;
				
				// fill in atmosphere
				
				var context = this.atmosphereMap.dataContext;
				
				if ( this.alpha !== 1 ) {
					
					context.clearRect( 0, 0, ig.system.realWidth, ig.system.realHeight );
					
				}
				
				context.globalAlpha = this.alpha;
				context.fillStyle = _utc.RGBToCSS( this.r, this.g, this.b );
				context.fillRect( 0, 0, ig.system.realWidth, ig.system.realHeight );
				
				// cut each light out of atmosphere
				// only cut the light base, not the shadows
				
				if ( !this.ignoreLights ) {
					
					context.globalCompositeOperation = "destination-out";
					
					var lights = ig.game.lights;
					var i, il;
					
					for ( i = 0, il = lights.length; i < il; i++ ) {
						
						var light = lights[ i ];
						
						if ( light.visible && light.image ) {
							
							context.globalAlpha = Math.min( 1, light.alpha * this.lightAmplification );
							
							context.drawImage(
								( this.lightBaseOnly ? light.imageBase.data : light.image.data ),
								ig.system.getDrawPos( light.boundsDraw.minX - ig.game.screen.x ),
								ig.system.getDrawPos( light.boundsDraw.minY - ig.game.screen.y )
							);
							
						}
						
					}
					
					context.globalCompositeOperation = "source-over";
					
				}
				
				
			}
			
		}
		
	},
	
	/**
	 * Starts following a target.
	 **/
	follow: function ( target ) {
		
		if ( this.target !== target ) {
			
			this.target = target;
			
		}
		
	},
	
	/**
	 * Updates a follow in progress.
	 **/
	updateFollow: function () {
		
		if ( this.target ) {
			
			var screen = ig.game.screen;
			
			this.screenLast.x = screen.x;
			this.screenLast.y = screen.y;
			
			var screenNextX = this.target.getCenterX() - ig.system.width * 0.5;
			var screenNextY = this.target.getCenterY() - ig.system.height * 0.5;
			var safeX, safeY;
			
			// check if last and next are near equal
			// this helps to avoid jittery screen
			
			if ( !_utm.almostEqual( screenNextX, this.screenLast.x, _s.PRECISION_ZERO ) ) {
				
				this.changed = safeX = true;
				
			}
			
			
			if ( !_utm.almostEqual( screenNextY, this.screenLast.y, _s.PRECISION_ZERO ) ) {
				
				
				this.changed = safeY = true;
				
			}
			
			// if new position is outside bounds
			
			if ( safeX ) {
				
				if ( screenNextX < this.boundsScreen.minX ) {
					
					screen.x += screenNextX - this.boundsScreen.minX;
					
				}
				else if ( screenNextX > this.boundsScreen.maxX ) {
					
					screen.x += screenNextX - this.boundsScreen.maxX;
					
				}
				else if ( this.keepCentered ) {
					
					screen.x += ( screenNextX - screen.x ) * this.lerp;
					
				}
				
				// update bounds
				
				_uti.boundsCopyX( this.boundsScreen, this.bounds, screen.x );
				
			}
			
			if ( safeY ) {
				
				if ( screenNextY < this.boundsScreen.minY ) {
					
					screen.y += screenNextY - this.boundsScreen.minY;
					
				}
				else if ( screenNextY > this.boundsScreen.maxY ) {
					
					screen.y += screenNextY - this.boundsScreen.maxY;
					
				}
				else if ( this.keepCentered ) {
					
					screen.y += ( screenNextY - screen.y ) * this.lerp;
					
				}
				
				// update bounds
				
				_uti.boundsCopyY( this.boundsScreen, this.bounds, screen.y );
				
			}
			
			
		}
		
	},
	
	update: function () {
		
		this.changed = false;
		
		// target
		
		this.updateFollow();
		
		// atmosphere
		
		this.updateAtmosphere();
		
	},
	
	draw: function () {
		
		// atmosphere
		
		if ( this.atmosphere ) {
			
			this.atmosphereMap.draw( 0, 0 );
			
		}
		
	},
	
	resize: function () {
		
		// bounds pct to bounds
		
		_uti.boundsCopy( this.bounds, this.boundsPct, 0, 0, ig.system.width * 0.5, ig.system.height * 0.5 );
		_uti.boundsCopy( this.boundsScreen, this.bounds, ig.game.screen.x, ig.game.screen.y );
		
		// atmosphere
		
		if ( this.atmosphere ) {
			
			this.atmosphereMap.setDimensions( ig.system.realWidth, ig.system.realHeight );
			
		}
		
	}
	
} );

} );
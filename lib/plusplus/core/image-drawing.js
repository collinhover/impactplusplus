/**
 * Image for pixel perfect scaled drawing.
 * @extends ig.Image
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'plusplus.core.image-drawing'
)
.requires(
	'impact.image'
)
.defines(function(){ "use strict";
	
	ig.ImageDrawing = ig.Image.extend( {
		
		width: 1,
		height: 1,
		loaded: true,
		
		/**
		 * Creates cache canvases, one at original size and one scaled to system scale.
		 * @param {Number} width of original size.
		 * @param {Number} height of original size.
		 **/
		init: function ( width, height ) {
			
			// base canvas for drawing on
			
			this.canvas = ig.$new('canvas');
			this.context = this.canvas.getContext('2d');
			this.width = this.canvas.width = width || 1;
			this.height = this.canvas.height = height || 1;
			
			// final canvas
			
			this.data = ig.$new('canvas');
			this.dataContext = this.data.getContext('2d');
			this.dataWidth = this.data.width = ig.system.getDrawPos( this.width );
			this.dataHeight = this.data.height = ig.system.getDrawPos( this.height );
			
		},
		
		load: function () {},
		
		reload: function () {},
		
		/**
		 * Set width of image. Use instead of directly modifying property so image is finalized correctly.
		 * @param {Number} width of original size.
		 **/
		setWidth: function ( width ) {
			
			this.setDimensions( width, this.canvas.height );
			
		},
		
		/**
		 * Set height of image. Use instead of directly modifying property so image is finalized correctly.
		 * @param {Number} height of original size.
		 **/
		setHeight: function ( height ) {
			
			this.setDimensions( this.canvas.width, height );
			
		},
		
		/**
		 * Set width and height of image. Use instead of directly modifying property so image is finalized correctly.
		 * @param {Number} width of original size.
		 * @param {Number} height of original size.
		 **/
		setDimensions: function ( width, height ) {
			
			this.width = this.canvas.width = width;
			this.height = this.canvas.height = height;
			
			this.finalize();
			
		},
		
		/**
		 * Draws the canvas into data at the requested scale ( usually the system scale ) to prepare for final drawing in the game.
		 * @param {Number} scale of final drawing.
		 **/
		finalize: function() {
			
			var scale = ig.system.scale;
			
			// Nearest-Neighbor scaling
			
			// The original image is copied into another canvas with the new size. 
			// The scaled offscreen canvas becomes the image (data) of this object.
			
			if ( scale === 1 ) {
				
				this.data = this.canvas;
				this.dataContext = this.context;
				this.dataWidth = this.width;
				this.dataHeight = this.height;
				
			}
			else {
				
				var origPixels = this.context.getImageData( 0, 0, this.width, this.height );
				
				var widthScaled = ig.system.getDrawPos( this.width );
				var heightScaled = ig.system.getDrawPos( this.height );

				var scaled = this.data = ig.$new('canvas');
				this.dataWidth = scaled.width = widthScaled;
				this.dataHeight = scaled.height = heightScaled;
				var scaledCtx = this.dataContext = scaled.getContext('2d');
				var scaledPixels = scaledCtx.getImageData( 0, 0, widthScaled, heightScaled );
					
				for( var y = 0; y < heightScaled; y++ ) {
					for( var x = 0; x < widthScaled; x++ ) {
						var index = (Math.floor(y / scale) * this.width + Math.floor(x / scale)) * 4;
						var indexScaled = (y * widthScaled + x) * 4;
						scaledPixels.data[ indexScaled ] = origPixels.data[ index ];
						scaledPixels.data[ indexScaled+1 ] = origPixels.data[ index+1 ];
						scaledPixels.data[ indexScaled+2 ] = origPixels.data[ index+2 ];
						scaledPixels.data[ indexScaled+3 ] = origPixels.data[ index+3 ];
					}
				}
				scaledCtx.putImageData( scaledPixels, 0, 0 );
				
			}
			
		}
		
	} );
	
} );
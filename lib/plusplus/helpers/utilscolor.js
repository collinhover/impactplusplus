/**
 * Static utilities for color conversions.
 * @author Collin Hover - collinhover.com
 **/
 ig.module( 
	'game.helpers.utilscolor' 
)
.defines( function(){ "use strict";

var _utc = ig.utilscolor = {};

/**
 * Converts between hex and RGBA values.
 **/
_utc.hexToRGBA = function ( hex ) {

	hex = Math.floor( hex );
	
	var rgba = {};
	
	rgba.r = ( hex >> 24 & 255 ) / 255;
	rgba.g = ( hex >> 16 & 255 ) / 255;
	rgba.b = ( hex >> 8 & 255 ) / 255;
	rgba.a = ( hex & 255 ) / 255;

	return rgba;

};

_utc.RGBAToHex = function ( r, g, b, a ) {
	
	return ( r * 255 ) << 24 ^ ( g * 255 ) << 16 ^ ( b * 255 ) << 8 ^ ( a * 255 ) << 0;

};

_utc.RGBToHex = function ( r, g, b ) {
	
	return ( r * 255 ) << 16 ^ ( g * 255 ) << 8 ^ ( b * 255 ) << 0;

};

/**
 * Converts between style, i.e. rgb()/rgba()/etc, and RGBA values.
 **/
_utc.CSSToRGBA = ( function(){
	
	var canvas = ig.$new("canvas");
	canvas.width = canvas.height = 1;
	var ctx = canvas.getContext("2d");
	
	return function ( color, alpha ) {
		
		ctx.clearRect(0,0,1,1);
		ctx.fillStyle = color;
		ctx.fillRect(0,0,1,1);
		
		var data = ctx.getImageData(0,0,1,1).data;
		var rgba = {};
		
		rgba.r = data[0] / 255;
		rgba.g = data[1] / 255;
		rgba.b = data[2] / 255;
		rgba.a = alpha;
		
		return rgba;
		
	}
	
}() );

_utc.RGBAToCSS = function ( r, g, b, a ) {

	return 'rgba(' + ( ( r * 255 ) | 0 ) + ',' + ( ( g * 255 ) | 0 ) + ',' + ( ( b * 255 ) | 0 ) + ',' + a + ')';

};

_utc.RGBToCSS = function ( r, g, b ) {

	return 'rgb(' + ( ( r * 255 ) | 0 ) + ',' + ( ( g * 255 ) | 0 ) + ',' + ( ( b * 255 ) | 0 ) + ')';

};

} );
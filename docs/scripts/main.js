$( function () {
	
	// grab all the inherited elements
	
	var $inherited = $( '.inherited' );
	var $inheritedToggle = $( '[data-toggle="inherited"]' );
	var $scrollSpy = $('[data-spy="scroll"]');
	
	// whenever inherited toggle is clicked, toggle inherited hidden state
	
	$inheritedToggle.click( function () {
		
		$inherited.toggleClass( 'hidden' );
		
		// update navigation spy
		
		$scrollSpy.each(function () {
			var $spy = $(this).scrollspy('refresh')
		});
		
		$( document ).trigger( 'scroll' );
		
	} );
	
	// add pretty print classes to all code
	
	$( 'pre' )
		.addClass( 'prettyprint' )
		.addClass( 'linenums' );
		
	prettyPrint();
	
	// get the demo
	
	var $demo = $( '#demo' );
	var $demoBtn = $( '#demoBtn button' );
	var path = $demoBtn.data( 'path' );
	
	if ( $demo.length && $demoBtn.length && path.length ) {
		
		$demoBtn.on( 'click', function () {
				
			$demo
				.attr( 'src', path )
				.removeClass( 'hidden' )
				.focus();
			
			$demoBtn
				.off( 'click' )
				.css( 'pointer', 'default' );
			
		} );
		
	}
	
	// affix the docs nav
	
	var $header = $( '#header' );
	var $navdocs = $( '#navdocs' );
	
	if ( $navdocs.length && $header.length ) {
		
		$navdocs.affix( {
			offset: {
				left: 0,
				top: function () {
					
					return $header.outerHeight( true ) + 60;
					
				}
			}			
		} ); 
		
	}
	
} );
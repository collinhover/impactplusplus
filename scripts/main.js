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
	
} );
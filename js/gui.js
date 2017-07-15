var gui = ( function () {

	'use strict';

	var content, menu, topText, debug;
	var t = { now:0, delta:0, then:0, inter:0, tmp:0, n:0 };

	var demos = [ 'index', 'index_draw', '2d_basic', '2d_bitmap', '2d_bitmap2', '2d_bitmap3', '2d_dungeon', '2d_gridmaze', '2d_pathfinder', '2d_dynamics', 'SOURCE' ];
	var txt = [];

	gui = {

		init: function () {
			
			content = document.createElement( 'div' );
	        content.style.cssText = 'position: absolute; top:0; left:0; pointer-events:none; width:100%; height:100%;';
	        document.body.appendChild( content );

	        menu = document.createElement( 'div' );
            menu.style.cssText = 'position: absolute; top:0px; left:0px; height:40px; width:100%; pointer-events:none; background:rgba(181,181,181,0.5);';
            content.appendChild( menu );

            topText = document.createElement( 'div' );
            topText.style.cssText = 'position: absolute; top:0px; right:0px; color:#000; font-size: 14px; margin:0px 0px; padding: 0px 15px; line-height:40px; pointer-events:none; width:90px; height:40px; text-align: center; ';
            topText.innerHTML = t.n + ' fps';
            content.appendChild( topText );

            debug = document.createElement( 'div' );
            debug.style.cssText = 'position: absolute; bottom:10px; left:10px; color:#0c0; font-size: 10px; margin:0px 0px; padding: 3px 10px; pointer-events:none; width:180px; height:200px; text-align: left; border:1px solid rgba(0,200,0,0.3); overflow:hidden; display: inline-block; vertical-align: bottom; ';
            //debug.innerHTML = t.n + ' fps';
            content.appendChild( debug );

            this.log()

            for( var i = 0; i < demos.length; i++ ) this.addButton(i);

		},

	    log: function ( s ) {
	    	if(s) txt.push( s + '<br>' );
	    	if(txt.length > 16 ) txt.shift();
	    	//debug.innerHTML += s + '<br>';
	    	if(debug)debug.innerHTML = txt.join( "\n" );
	    },

		addButton: function ( i ) {

			var a = document.createElement('a');
			a.href = demos[i] + '.html';
		    a.target = '_self';

		    if( demos[i] === 'SOURCE' ){ 
		    	a.href = 'https://github.com/lo-th/Dedal.lab/';
		    	a.target = '_blanc';
		    }

	        var b = document.createElement('div');
	        b.style.cssText =  'color:#000;  font-size: 14px;  margin:0px 0px; padding: 0px 15px; line-height:40px; position:relative; pointer-events:auto; height:40px; display:inline-block; text-align:center; cursor:pointer; transition:all 0.3s ease; ';
	        b.textContent = demos[i].replace('_', '.');
	        b.id = i;

	        a.appendChild( b );

	        b.addEventListener( 'mouseover', function(e){ this.style.color = '#F00'; this.style.background = 'rgba(181,181,181,1)'; }, false );
	        b.addEventListener( 'mouseout', function(e){ this.style.color = '#000';this.style.background = 'none';}, false );
	        //b.addEventListener( 'mousedown', function(e){ gui.select( this.id ); }, false );

	        menu.appendChild( a );

	    },

	    update: function () {
	    	
	    	t.now = ( typeof performance === 'undefined' ? Date : performance ).now();

            if ( t.now - 1000 > t.tmp ){ 
                t.tmp = t.now; 
                topText.innerHTML = t.n + ' fps';
                t.n = 0;
            }

            t.n++;

	    },

	}

	return gui;

})();
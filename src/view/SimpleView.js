//var DDLS = DDLS || {};

DDLS.SimpleView = function( world ) {



    //this.w = w || 512;
    //this.h = h || 512;

    this.g0 = new DDLS.BasicCanvas( world.w, world.h )
    this.g = new DDLS.BasicCanvas( world.w, world.h );

    this.g.canvas.style.pointerEvents = 'none';



    this.entitiesWidth = 1;
    this.entitiesColor = {r:0, g:255, b:0, a:0.75};
    this.entitiesColor2 = {r:255, g:255, b:255, a:0.75};
    this.entitiesField = {r:0, g:255, b:0, a:0.1};
    this.entitiesField2 = {r:255, g:255, b:255, a:0.1};
    this.pathsWidth = 2;
    this.pathsColor = {r:255, g:255, b:0, a:0.75};
    this.verticesRadius = 1;
    this.verticesColor = {r:255, g:120, b:0, a:0.5};
    this.constraintsWidth = 2;
    this.constraintsColor = {r:255, g:0, b:0, a:1};
    this.edgesWidth = 1;
    this.edgesColor = {r:190, g:190, b:190, a:0.25};
    this.edgesColor2 = {r:0, g:190, b:0, a:0.25};
    //this.graphics = new DDLS.DrawContext( canvas );
    //this.g = this.graphics.g;
    this.mesh_data = null;

    this.domElement = this.g0.canvas;

    DDLS.VIEW = this;

};

DDLS.SimpleView.prototype = {

    drawImage : function ( img, w, h ) {

        this.g0.drawImage( img, w, h );

    },

    drawMesh: function ( mesh, clean ) {

        var c = clean === undefined ? false : clean;
        if(c) this.g0.clear();

        mesh.compute_Data();

        var edge = mesh.AR_edge;
        var vertex = mesh.AR_vertex;

        var i = edge.length;
        var n = 0;
        while(i--){
            n = i * 5;
            if(edge[n+4]) {
                this.g0.lineStyle( this.constraintsWidth, this.constraintsColor );
            }else{
                //if( edge[n+4] ) this.g.lineStyle( this.edgesWidth, this.edgesColor2 );
                //else 
                this.g0.lineStyle( this.edgesWidth, this.edgesColor );
            }
            this.g0.moveTo(edge[n],edge[n+1]);
            this.g0.lineTo(edge[n+2],edge[n+3]);
            this.g0.stroke();
            this.g0.closePath()
        }

        
        this.g0.lineStyle( this.verticesRadius, this.verticesColor );
        i = vertex.length;
        while(i--){
            n = i * 2;
            this.g0.beginFill( this.verticesColor, this.verticesAlpha );
            this.g0.drawCircle(vertex[n],vertex[n+1],this.verticesRadius);
            this.g0.endFill();
        }
    },

    drawEntity: function( entity, clean ) {

        var g = this.g;
        g.lineStyle();

        var see = entity.isSee;

        var c = clean === undefined ? false : clean;
        if(c) g.clear();

        if( see ) g.beginFill( this.entitiesField );
        else g.beginFill( this.entitiesField2 );
        g.moveTo( entity.position.x, entity.position.y );
        g.drawCircle( entity.position.x, entity.position.y, entity.radiusFOV, (entity.angle-(entity.angleFOV*0.5)), (entity.angle+(entity.angleFOV*0.5)) );
        g.lineTo( entity.position.x, entity.position.y );
        g.endFill();

        //g.lineStyle( this.entitiesWidth, this.entitiesColor );
        if( see ) g.beginFill(this.entitiesColor);
        else g.beginFill(this.entitiesColor2);
        g.drawCircle( entity.position.x, entity.position.y, entity.radius );
        //console.log(entity.direction)
        g.endFill();

        
    },

    /*drawEntities: function( vEntities, clean ) {

        var c = clean === undefined ? false : clean;
        if(c) this.g.clear();

        var _g1 = 0;
        var _g = vEntities.length;
        while(_g1 < _g) {
            var i = _g1++;
            this.drawEntity( vEntities[i], false );
        }
    },*/

    drawPath: function( path, clean ) {

        var c = clean === undefined ? false : clean;
        if(c) this.g.clear();

        if(path.length === 0) return;
        this.g.lineStyle( this.pathsWidth, this.pathsColor );
        this.g.moveTo( path[0], path[1] );
        var i = 2;
        while(i < path.length) {
            this.g.lineTo(path[i],path[i + 1]);
            this.g.moveTo(path[i],path[i + 1]);
            i += 2;
        }
        this.g.endFill();
    },

    clear : function(){

        this.g.clear();

    }

};

// CANVAS

DDLS.BasicCanvas = function( w, h ) {

    this.w = w || 200;
    this.h = h || 200;

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.ctx = this.canvas.getContext("2d");
    document.body.appendChild( this.canvas );

};

DDLS.BasicCanvas.prototype = {

    clear: function() {
        this.ctx.clearRect(0,0,this.w,this.h);
    },
    drawImage : function(img, w, h){
        this.ctx.drawImage( img, 0, 0, w || this.w, h || this.h );
    },
    drawCircle: function(x,y,radius, s, e) {
        s = s || 0;
        e = e || DDLS.TwoPI;
        this.ctx.beginPath();
        this.ctx.arc(x,y,radius, s, e, false);
        //this.ctx.stroke();
        //this.ctx.closePath();
    },
    drawRect: function(x,y,width,height) {
        this.ctx.beginPath();
        this.ctx.moveTo(x,y);
        this.ctx.lineTo(x + width,y);
        this.ctx.lineTo(x + width,y + height);
        this.ctx.lineTo(x,y + height);
        this.ctx.stroke();
        this.ctx.closePath();
    },
    lineStyle: function(wid,c) {

        if( wid && c ){
            this.ctx.lineWidth = wid;
            this.ctx.strokeStyle = "rgba(" + c.r + "," + c.g + "," + c.b + "," + c.a + ")";
    } else {
        this.ctx.lineWidth = 0;
        this.ctx.strokeStyle = "none";
    }

        
    },
    moveTo: function(x,y) {
        this.ctx.beginPath();
        this.ctx.moveTo(x,y);
    },
    lineTo: function(x,y) {
        this.ctx.lineTo(x,y);
        //this.ctx.stroke();
       // this.ctx.closePath();
        
    },
    stroke: function() {
        this.ctx.stroke();
        //this.ctx.stroke();
       // this.ctx.closePath();
        
    },
    closePath: function() {
        this.ctx.closePath();
        //this.ctx.stroke();
       // this.ctx.closePath();
        
    },
    beginFill: function(c) {
        this.ctx.fillStyle = "rgba(" + c.r + "," + c.g + "," + c.b + "," + c.a + ")";
        this.ctx.beginPath();
    },
    endFill: function() {
        //this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.fill();
    }
};

// DRAW CONTEXT

DDLS.DrawContext = function(g) {
    this.g = g;
};

DDLS.DrawContext.prototype = {
    clear: function() { this.g.clear(); },
    lineStyle: function(thickness,c) { this.g.lineStyle(thickness,c); },
    beginFill: function(c) { this.g.beginFill(c);},
    endFill: function() { this.g.endFill(); },
    moveTo: function(x,y) { this.g.moveTo(x,y); },
    lineTo: function(x,y) { this.g.lineTo(x,y);},
    drawCircle: function(cx,cy,r) { this.g.drawCircle(cx,cy,r); },
    drawRect: function(x,y,w,h) { this.g.drawRect(x,y,w,h); }
};
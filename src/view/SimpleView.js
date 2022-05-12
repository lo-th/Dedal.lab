import { Main, TwoPI } from '../constants.js';

export class SimpleView {

    constructor ( world, target, css ) {

        //this.w = w || 512;
        //this.h = h || 512;

        this.g0 = new BasicCanvas( world.w, world.h, target, css )
        this.g = new BasicCanvas( world.w, world.h, target, css );

        this.g.canvas.style.pointerEvents = 'none';
        this.g0.canvas.style.pointerEvents = 'auto';



        this.entitiesWidth = 2;
        this.entitiesColor = {r:0, g:0, b:255, a:0.75};
        this.entitiesColor2 = {r:255, g:255, b:255, a:0.75};
        this.entitiesField = {r:0, g:0, b:255, a:0.1};
        this.entitiesField2 = {r:255, g:255, b:255, a:0.1};
        this.pathsWidth = 2;
        this.pathsColor = {r:255, g:255, b:0, a:0.75};
        this.verticesRadius = 1;
        this.verticesColor = {r:255, g:120, b:0, a:0.5};
        this.constraintsWidth = 2;
        this.constraintsColor = {r:0, g:255, b:0, a:1};
        this.edgesWidth = 1;
        this.edgesColor = {r:190, g:190, b:190, a:0.25};
        this.edgesColor2 = {r:0, g:190, b:0, a:0.25};
        //this.graphics = new DDLS.DrawContext( canvas );
        //this.g = this.graphics.g;
        this.mesh_data = null;

        this.domElement = this.g0.canvas;

        this.extraEdge = function( p1, p2 ){}

        Main.set( this );

    }


    drawImage ( img, w, h ) {

        this.g0.drawImage( img, w, h );

    }

    drawMesh ( mesh, clean ) {

        let g = this.g0;

        let c = clean === undefined ? false : clean;
        if(c) this.g0.clear();

        mesh.compute_Data();

        let edge = mesh.AR_edge;
        let vertex = mesh.AR_vertex;

        let i = edge.length;
        let n = 0;
        while(i--){
            n = i * 5;
            if(edge[n+4]) {
                g.lineStyle( this.constraintsWidth, this.constraintsColor );
                this.extraEdge( [edge[n],edge[n+1]], [ edge[n+2],edge[n+3] ] )
            }else{
                //if( edge[n+4] ) this.g.lineStyle( this.edgesWidth, this.edgesColor2 );
                //else 
                g.lineStyle( this.edgesWidth, this.edgesColor );
            }
            g.moveTo(edge[n],edge[n+1]);
            g.lineTo(edge[n+2],edge[n+3]);
            g.stroke();
            g.closePath();
        }

        
        g.lineStyle( this.verticesRadius, this.verticesColor );
        i = vertex.length;
        while(i--){
            n = i * 2;
            g.beginFill( this.verticesColor, this.verticesAlpha );
            g.drawCircle(vertex[n],vertex[n+1],this.verticesRadius);
            g.endFill();
        }
    }

    drawEntity( entity, clean ) {

        let g = this.g;

        let see = entity.isSee;

        let c = clean === undefined ? false : clean;
        if(c) g.clear();

        if( see ) g.beginFill( this.entitiesField );
        else g.beginFill( this.entitiesField2 );
        g.moveTo( entity.position.x, entity.position.y );
        g.drawCircle( entity.position.x, entity.position.y, entity.radiusFOV, (entity.angle-(entity.angleFOV*0.5)), (entity.angle+(entity.angleFOV*0.5)) );
        g.lineTo( entity.position.x, entity.position.y );
        g.endFill();

        g.beginFill( see ? entity.color2 : entity.color );

        g.lineStyle( this.entitiesWidth, this.entitiesColor2 );
       // g.stroke();
       // if( see ) 
        //else g.beginFill(this.entitiesColor2);
        g.drawCircle( entity.position.x, entity.position.y, entity.radius );
        //console.log(entity.direction)
        g.stroke();
        g.endFill();
        //

        
    }

    /*drawEntities: function( vEntities, clean ) {

        let c = clean === undefined ? false : clean;
        if(c) this.g.clear();

        let _g1 = 0;
        let _g = vEntities.length;
        while(_g1 < _g) {
            let i = _g1++;
            this.drawEntity( vEntities[i], false );
        }
    },*/

    drawPath ( path, clean ) {

        let g = this.g;

        let c = clean === undefined ? false : clean;
        if(c) this.g.clear();

        if(path.length === 0) return;
        g.lineStyle( this.pathsWidth, this.pathsColor );
        g.moveTo( path[0], path[1] );
        let i = 2;
        while(i < path.length) {
            g.lineTo(path[i],path[i + 1]);
            //g.moveTo(path[i],path[i + 1]);
            i += 2;
        }
        g.stroke();
    }

    clear (){

        this.g.clear();

    }

}


// CANVAS

export class BasicCanvas {

    constructor ( w, h, target, css ) {

        this.w = w || 200;
        this.h = h || 200;

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.w;
        this.canvas.height = this.h;
        this.ctx = this.canvas.getContext("2d");

        this.canvas.style.cssText = css || 'position:absolute; left:50%; top:50%; margin-left:'+(-this.w*0.5)+'px; margin-top:'+(-this.h*0.5)+'px;';


        if( target === undefined ) target = document.body

        target.appendChild( this.canvas );

    }

    clear () {
        this.ctx.clearRect(0,0,this.w,this.h);
    }
    
    drawImage (img, w, h){
        this.ctx.drawImage( img, 0, 0, w || this.w, h || this.h );
    }

    drawCircle (x,y,radius, s, e) {
        s = s || 0;
        e = e || TwoPI;
        this.ctx.beginPath();
        this.ctx.arc(x,y,radius, s, e, false);
        //this.ctx.stroke();
        //this.ctx.closePath();
    }

    drawRect (x,y,width,height) {
        this.ctx.beginPath();
        this.ctx.moveTo(x,y);
        this.ctx.lineTo(x + width,y);
        this.ctx.lineTo(x + width,y + height);
        this.ctx.lineTo(x,y + height);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    lineStyle (wid,c) {

        this.ctx.lineWidth = wid;
        this.ctx.strokeStyle = "rgba(" + c.r + "," + c.g + "," + c.b + "," + c.a + ")";

    }

    moveTo (x,y) {
        this.ctx.beginPath();
        this.ctx.moveTo(x,y);
    }

    lineTo (x,y) {
        this.ctx.lineTo(x,y);
        //this.ctx.stroke();
       // this.ctx.closePath();
        
    }

    stroke () {
        this.ctx.stroke();
        //this.ctx.stroke();
       // this.ctx.closePath();
        
    }

    closePath () {
        this.ctx.closePath();
        //this.ctx.stroke();
       // this.ctx.closePath();
        
    }

    beginFill(c) {
        this.ctx.fillStyle = "rgba(" + c.r + "," + c.g + "," + c.b + "," + c.a + ")";
        this.ctx.beginPath();
    }

    endFill() {
        //this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.fill();
    }
}

// DRAW CONTEXT
/*
function DrawContext(g) {
    this.g = g;
};

DrawContext.prototype = {
    clear: function() { this.g.clear(); },
    lineStyle: function(thickness,c) { this.g.lineStyle(thickness,c); },
    beginFill: function(c) { this.g.beginFill(c);},
    endFill: function() { this.g.endFill(); },
    moveTo: function(x,y) { this.g.moveTo(x,y); },
    lineTo: function(x,y) { this.g.lineTo(x,y);},
    drawCircle: function(cx,cy,r) { this.g.drawCircle(cx,cy,r); },
    drawRect: function(x,y,w,h) { this.g.drawRect(x,y,w,h); }
};*/
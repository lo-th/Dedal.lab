import { Main } from '../constants';
import { Mesh2D } from '../core/Mesh2D';
import { Entity } from '../ai/Entity';


//var TH;

function ThreeView( scene, world, THREE ) {

    var TH = THREE;

    this.world = world;

    this.maxVertices = 30000;
    this.currentVertex = 0;

    var geometry = new TH.BufferGeometry();
    geometry.addAttribute('position', new TH.BufferAttribute( new Float32Array( this.maxVertices * 3 ), 3 ));
    geometry.addAttribute('color', new TH.BufferAttribute( new Float32Array( this.maxVertices * 3 ), 3 ));
    this.positions = geometry.attributes.position.array;
    this.colors = geometry.attributes.color.array;
    geometry.computeBoundingSphere();

    this.buffer = new TH.LineSegments(geometry, new TH.LineBasicMaterial({ vertexColors: true }));
    this.buffer.frustumCulled = false;
    scene.add(this.buffer);

    // PATH

    this.maxPathVertices = 1000;
    this.currentPathVertex = 0;

    var geometryPath = new TH.BufferGeometry();
    geometryPath.addAttribute('position', new TH.BufferAttribute( new Float32Array( this.maxPathVertices * 3 ), 3 ));
    geometryPath.addAttribute('color', new TH.BufferAttribute( new Float32Array( this.maxPathVertices * 3 ), 3 ));
    this.positionsPath = geometryPath.attributes.position.array;
    this.colorsPath = geometryPath.attributes.color.array;
    geometry.computeBoundingSphere();
    
    this.bufferPath = new TH.LineSegments(geometryPath, new TH.LineBasicMaterial({ vertexColors: true }));
    this.bufferPath.frustumCulled = false;
    scene.add(this.bufferPath);

    Main.set( this );

}

ThreeView.prototype = {

    constructor: ThreeView,

    drawMesh: function ( mesh, clean ) {
        
    },

    collapseBuffer : function() {

        var i = this.maxVertices;
        var min = this.currentVertex;
        var n = 0;
        while(i>=min){
            n = i * 3;
            this.positions[n] = 0;
            this.positions[n+1] = 0;
            this.positions[n+2] = 0;
            this.colors[n] = 0;
            this.colors[n+1] = 0;
            this.colors[n+2] = 0;
            i--;
        }
    },
    collapsePathBuffer : function() {

        var i = this.maxPathVertices;
        var min = this.currentPathVertex;
        var n = 0;
        while(i>=min){
            n = i * 3;
            this.positionsPath[n] = 0;
            this.positionsPath[n+1] = 0;
            this.positionsPath[n+2] = 0;
            this.colorsPath[n] = 0;
            this.colorsPath[n+1] = 0;
            this.colorsPath[n+2] = 0;
            i--;
        }
    },

    update : function() {

        //

        //var redraw = this.world.mesh.updateObjects();
        //if(redraw){
        if( this.world.mesh.isRedraw ){
            this.currentVertex = 0;
            
            this.world.mesh.draw();

            this.collapseBuffer();
            this.buffer.geometry.attributes.position.needsUpdate = true;
            this.buffer.geometry.attributes.color.needsUpdate = true;
        }

        this.world.update();

        var i = this.world.heroes.length, h;

        while(i--){

            h = this.world.heroes[i];

            //this.world.heroes[i].update();
            
            if( h.isSelected && h.tmppath.length > 0 ){
                this.currentPathVertex = 0;
                var p = this.world.heroes[i].tmppath;
                //if( p.length === 0 ) return;
                var prevX = p[0];
                var prevY = p[1];
                var j = 2;

                while(j < p.length) {
                    this.insertPath(prevX, prevY, p[j], p[j+1], 1,0,0);
                    prevX = p[j];
                    prevY = p[j+1];
                    j += 2;
                }


                /*var j = p.length*0.25, n;
                while(j--){
                    n = j*4;
                    this.insertPath(p[n], p[n+1], p[n+2], p[n+3], 1,0,0);
                }*/

                this.collapsePathBuffer();
                this.bufferPath.geometry.attributes.position.needsUpdate = true;
                this.bufferPath.geometry.attributes.color.needsUpdate = true;

            }
        }

        
    },

    insertLine : function(x1, y1, x2, y2, r, g, b) {

        var i = this.currentVertex;
        var n = i * 3;
        this.positions[n] = x1;
        this.positions[n + 1] = 0;
        this.positions[n + 2] = y1;
        this.colors[n] = r;
        this.colors[n + 1] = g;
        this.colors[n + 2] = b;
        i++;
        n = i * 3;
        this.positions[n] = x2;
        this.positions[n + 1] = 0;
        this.positions[n + 2] = y2;
        this.colors[n] = r;
        this.colors[n + 1] = g;
        this.colors[n + 2] = b;
        this.currentVertex += 2;
    },

    insertPath : function(x1, y1, x2, y2, r, g, b) {

        var i = this.currentPathVertex;
        var n = i * 3;
        this.positionsPath[n] = x1;
        this.positionsPath[n + 1] = 0;
        this.positionsPath[n + 2] = y1;
        this.colorsPath[n] = r;
        this.colorsPath[n + 1] = g;
        this.colorsPath[n + 2] = b;
        i++;
        n = i * 3;
        this.positionsPath[n] = x2;
        this.positionsPath[n + 1] = 0;
        this.positionsPath[n + 2] = y2;
        this.colorsPath[n] = r;
        this.colorsPath[n + 1] = g;
        this.colorsPath[n + 2] = b;
        this.currentPathVertex += 2;
    }
}

export { ThreeView };

Mesh2D.prototype.draw = function(){

    //console.log('meshdraw')
    this.compute_Data();

    var view = Main.get();

    var edge = this.AR_edge;
    var i = edge.length;
    var n = 0;
    while(i--){
        n = i * 5;
        if(edge[n+4]) {
            view.insertLine( edge[n], edge[n+1], edge[n+2], edge[n+3], 0,0,0 );
        }else{
            view.insertLine( edge[n], edge[n+1], edge[n+2], edge[n+3], 0.4,0.4,0.4 );
        }
    }
    this.isRedraw = false;

}

/*Entity.prototype.draw = function(){

}*/
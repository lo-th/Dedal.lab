import { Main, IDX } from '../constants';
import { RectMesh } from '../factories/RectMesh';
import { BitmapObject } from '../factories/BitmapObject';
import { BitmapMesh } from '../factories/BitmapMesh';
import { PathFinder } from '../ai/PathFinder';
import { Object2D } from '../core/Object2D';
import { Entity } from '../ai/Entity';
import { fromImageData } from '../core/Tools';

function World ( w, h ) {

    IDX.reset();

    this.heroes = [];
    this.shapes = [];
    this.segments = [];
    this.objects = [];
    
    this.w = w || 512;
    this.h = h || 512;

    this.mesh = new RectMesh( this.w, this.h );

    this.pathFinder = new PathFinder();
    this.pathFinder.mesh = this.mesh;

};

World.prototype = {

    constructor: World,

    getMesh: function () {

        return this.mesh;

    },

    update: function () {

        var lng = this.heroes.length;

        var i = lng, j, h;

        while( i-- ){

            h = this.heroes[i];

            h.update();

            if(h.testSee){
                j = lng;
                while( j-- ){
                    if( i !== j ) {
                        //this.heroes[i].entity.isSee = this.heroes[i].fov.isInField( this.heroes[j].entity );
                        this.heroes[i].isSee = this.heroes[i].fov.isInField( this.heroes[j] );
                    }
                }
            }

        }

    },

    updateMesh: function () {

       this.mesh.updateObjects();

    },
    
    add: function ( o ) {

        this.mesh.insertObject(o);
        this.objects.push(o);

    },

    addHeroe: function ( s ) {

        //var h = new Heroe( s, this );
        var h = new Entity( s, this );
        this.heroes.push( h );
        return h;
        
    },

    addObject: function ( s ) {

        s = s || {};
        var o = new Object2D();
        o.coordinates = s.coord || [-1,-1,1,-1,  1,-1,1,1,  1,1,-1,1,  -1,1,-1,-1];
        o.position(s.x || 1,s.y || 1);
        o.scale(s.w || 1, s.h || 1);
        o.pivot( s.px || 0, s.py || 0);
        o.rotation = s.r || 0;

        this.mesh.insertObject(o);
        this.objects.push(o);
        return o;

    },

    reset: function ( w, h ) {

        this.mesh.dispose();
        if(w) this.w = w;
        if(h) this.h = h;
        this.mesh = new RectMesh( this.w, this.h );
        this.pathFinder.mesh = this.mesh;
    
    },

    rebuild: function ( mesh ) {

        this.mesh.clear( true );
        if( mesh !== undefined ) this.mesh = mesh;
        else this.mesh = new RectMesh( this.w, this.h );
        this.pathFinder.mesh = this.mesh;
        //this.mesh._objects = [];
        var i = this.objects.length;
        while(i--){
            this.objects[i]._constraintShape = null;
            this.mesh.insertObject(this.objects[i]);
        }

    },

    addBitmapZone: function ( o ) {

        o = o || {};

        if( o.url ){ // by image url

            var img = document.createElement( 'img' );

            img.onload = function(){

                o.pixel = fromImageData( img );
                o.w = img.width;
                o.h = img.height;
                this.updateBitmapZone( o );

            }.bind( this )

            img.src = o.url;

        }

        if( o.canvas ){ // by canvas 

            o.w = o.canvas.width;
            o.h = o.canvas.height;
            o.pixel = fromImageData( null, o.canvas.getContext('2d').getImageData( 0, 0, o.w, o.h ) );
            this.updateBitmapZone( o );

        }

        if( o.img ){ // by direct image

            o.w = o.img.width;
            o.h = o.img.height;
            o.pixel = fromImageData( o.img );
            this.updateBitmapZone( o );

        }

    },

    updateBitmapZone: function ( o ) {

        o = o || {};

        this.mesh.dispose();
        this.mesh = BitmapMesh.buildFromBmpData( o.pixel, o.precision || 1.8, o.color );
        this.pathFinder.mesh = this.mesh;

        //var obj = BitmapObject.buildFromBmpData( o.pixel, o.precision || 1.8, o.color );
        //this.reset( o.w, o.h );
        //this.mesh.insertObject( obj );
        //this.add( obj );

        var view = Main.get();
        if( view ) view.drawMesh( this.mesh );

    }
    


};

export { World };
import { RectMesh } from '../factories/RectMesh';
import { PathFinder } from '../ai/PathFinder';
import { Object2D } from '../core/Object2D';
import { Entity } from '../ai/Entity';


function World ( w, h ) {
    
    this.w = w || 512;
    this.h = h || 512;

    this.mesh = RectMesh( this.w, this.h );

    this.pathFinder = new PathFinder();
    this.pathFinder.mesh = this.mesh;

    this.heroes = [];
    this.shapes = [];
    this.segments = [];
    this.objects = [];

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
        this.mesh = RectMesh( this.w, this.h );
        this.pathFinder.mesh = this.mesh;
    
    },

    rebuild: function ( mesh ) {

        this.mesh.clear( true );
        if( mesh !== undefined ) this.mesh = mesh;
        else this.mesh = RectMesh( this.w, this.h );
        this.pathFinder.mesh = this.mesh;
        //this.mesh._objects = [];
        var i = this.objects.length;
        while(i--){
            this.objects[i]._constraintShape = null;
            this.mesh.insertObject(this.objects[i]);
        }

    },
    


};

export { World };
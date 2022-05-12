import { Main, IDX } from '../constants.js'
import { RectMesh } from '../factories/RectMesh.js'
import { BitmapMesh } from '../factories/BitmapMesh.js'
import { PathFinder } from '../ai/PathFinder.js'
import { fromImageData } from '../core/Tools.js'
import { Object2D } from '../core/Object2D.js'
import { Entity } from '../ai/Entity.js'

//https://github.com/hxDaedalus/hxDaedalus/tree/master/src/hxDaedalus

export class World {

    constructor ( w = 512, h = 512 ) {

        IDX.reset()

        this.heroes = []
        this.shapes = []
        this.segments = []
        this.objects = []
        
        this.w = w;
        this.h = h;

        this.mesh = new RectMesh( this.w, this.h )

        this.pathFinder = new PathFinder()
        this.pathFinder.mesh = this.mesh

    }

    getMesh() {

        return this.mesh

    }

    update() {

        let lng = this.heroes.length

        let i = lng, j, h

        while( i-- ){

            h = this.heroes[i]
            h.update()

            if(h.testSee){
                j = lng;
                while( j-- ){
                    if( i !== j ) {
                        //this.heroes[i].entity.isSee = this.heroes[i].fov.isInField( this.heroes[j].entity );
                        this.heroes[i].isSee = this.heroes[i].fov.isInField( this.heroes[j] )
                    }
                }
            }

        }

    }

    updateMesh() {

       this.mesh.updateObjects()

    }
    
    add( o ) {

        this.mesh.insertObject(o)
        this.objects.push(o)

    }

    addHeroe( s ) {

        let h = new Entity( s, this )
        this.heroes.push( h )
        return h
        
    }

    addObject( s ) {

        s = s || {};
        let o = new Object2D()
        o.coordinates = s.coord || [-1,-1,1,-1,  1,-1,1,1,  1,1,-1,1,  -1,1,-1,-1]
        o.position(s.x || 1,s.y || 1)
        o.scale(s.w || 1, s.h || 1)
        o.pivot( s.px || 0, s.py || 0)
        o.rotation = s.r || 0

        this.mesh.insertObject(o)
        this.objects.push(o)
        return o

    }

    reset( w, h ) {

        this.mesh.dispose();
        if(w) this.w = w;
        if(h) this.h = h;
        this.mesh = new RectMesh( this.w, this.h );
        this.pathFinder.mesh = this.mesh;
    
    }

    rebuild( mesh ) {

        this.mesh.clear( true )
        if( mesh !== undefined ) this.mesh = mesh
        else this.mesh = new RectMesh( this.w, this.h )
        this.pathFinder.mesh = this.mesh
        //this.mesh._objects = [];
        let i = this.objects.length
        while(i--){
            this.objects[i]._constraintShape = null
            this.mesh.insertObject(this.objects[i])
        }

    }

    addBitmapZone( o = {} ) {

        if( o.url ){ // by image url

            let img = document.createElement( 'img' );

            img.onload = function(){

                o.pixel = fromImageData( img )
                this.updateBitmapZone( o )

            }.bind( this )

            img.src = o.url

        }

        if( o.canvas ){ // by canvas 

            let w = o.canvas.width
            let h = o.canvas.height
            o.pixel = fromImageData( null, o.canvas.getContext('2d').getImageData( 0, 0, w, h ), w, h )
            this.updateBitmapZone( o )

        }

        if( o.img ){ // by direct image

            o.pixel = fromImageData( o.img )
            this.updateBitmapZone( o )

        }

    }

    updateBitmapZone( o = {} ) {
        
        this.mesh.dispose()
        this.mesh = BitmapMesh.buildFromBmpData( o.pixel, o.precision, o.color )
        this.pathFinder.mesh = this.mesh
        

        /*
        let obj = BitmapObject.buildFromBmpData( o.pixel, o.precision, o.color );
        obj._constraintShape = null;
        this.reset( o.w, o.h );
        this.mesh.insertObject( obj );
        //this.add( obj );
        */

        let view = Main.get()
        if( view ) view.drawMesh( this.mesh )

    }
    
}
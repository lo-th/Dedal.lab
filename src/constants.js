/*
 * A list of constants built-in for
 * the dedal engine.
 */

export const REVISION = '1.0.0';

// MATH

export const TTIER = 0.3333333333333333;
export const torad = Math.PI / 180;
export const todeg = 180 / Math.PI;
export const EPSILON_NORMAL = 0.01;
export const EPSILON_SQUARED = 0.0001;
export const INFINITY = Infinity;
export const TwoPI = Math.PI * 2;

// INTERSECTION

export const VERTEX = 0;
export const EDGE = 1;
export const FACE = 2;
export const NULL = 3;

// MAIN

var Main = {

    view: null,

    get: function (){

        return this.view;

    },

    set: function ( o ){

        this.view = o;

    }
    
}

export { Main };

export const IDX = {

    id: { segment:0, shape:0, edge:0, face:0, mesh2D:0, object2D:0, vertex:0, graph:0, graphEdge:0, graphNode:0 },

    get: function ( type ){

        this.id[type] ++;
        return this.id[type];

    },

    reset: function (){

        this.id = { segment:0, shape:0, edge:0, face:0, mesh2D:0, object2D:0, vertex:0, graph:0, graphEdge:0, graphNode:0 };

    }

}




// LOG

var Debug = {

    callback: function( s ){
        console.log( s );
    },

    log: function ( s ) {

        this.callback( s );
        
    }
} 

export { Debug };

//export var Log = function Log ( str ){ Debug.log( str ); };

export const Log = ( str ) => { Debug.log( str ) }


// DICTIONARY
export class Dictionary {

    constructor ( type = 0 ) {

        this.type = type
        this.m = new Map()

    }

    set ( key, value ) {

        this.m.set( this.type === 1 ? key.id : key, value )
        
    }

    get ( key ) {

        if ( !this.m.has( this.type === 1 ? key.id : key ) ) return null;
        return this.m.get( this.type === 1 ? key.id : key );

    }

    remove ( key ) {

        this.m.delete( this.type === 1 ? key.id : key );

    }

    dispose () {

        this.m.clear()
        //this.m = null

    }

}


/*

function Dictionary ( type ){

    this.type = type || 0;

    if( this.type === 0 ){

        this.k = [];
        this.v = [];

    } else {

        this.h = {};

    }

};

Dictionary.prototype = {

    set: function ( key, value ) {

        var t = this.type;

        if( t === 0 ){

            this.k.push(key);
            this.v.push(value);

        }

        if( t === 1 ) this.h[ key.id ] = value;
        if( t === 2 ) this.h[ key ] = value;

    },

    get: function ( key ) {

        var t = this.type, i;

        if( t === 0 ){

            i = this.k.indexOf( key );
            if(i != -1) return this.v[ i ];

        }

        if( t === 1 ) return this.h[ key.id ];
        if( t === 2 ) return this.h[ key ];

    },

    dispose: function () {

        var t = this.type;

        if( t === 0 ){

            while( this.k.length > 0 ) this.k.pop();
            while( this.v.length > 0 ) this.v.pop();
            this.k = null;
            this.v = null;

        }

        if( t === 1 ){ 

            for ( var key in this.h ) this.h[ key.id ] = undefined;
            this.h = null;

        }

        if( t === 2 ){ 

            for ( var key in this.h ) this.h[ key ] = undefined;
            this.h = null;

        }

    }

}

export { Dictionary };*/
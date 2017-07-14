/*
 * A list of constants built-in for
 * the dedal engine.
 */

export var REVISION = '1.0.0';

// MATH

export var TTIER = 0.3333333333333333;
export var torad = 0.0174532925199432957;
export var todeg = 57.295779513082320876;
export var EPSILON = 0.01;
export var EPSILON_SQUARED = 0.0001;
export var INFINITY = Infinity;
export var TwoPI = Math.PI * 2;

// INTERSECTION

export var VERTEX = 0;
export var EDGE = 1;
export var FACE = 2;
export var NULL = 3;

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

var IDX = {

    id: { segment:0, shape:0, edge:0, face:0, mesh2D:0, object2D:0, vertex:0, graph:0, graphEdge:0, graphNode:0 },

    get: function ( type ){

        this.id[type] ++;
        return this.id[type];

    },

    reset: function (){

        this.id = { segment:0, shape:0, edge:0, face:0, mesh2D:0, object2D:0, vertex:0, graph:0, graphEdge:0, graphNode:0 };

    }

}

export { IDX };



// LOG

export var Log = function Log ( str ){ console.log( str ); };

// DICTIONARY

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

export { Dictionary };
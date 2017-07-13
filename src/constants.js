/*
 * A list of constants built-in for
 * the dedal engine.
 */

export var REVISION = '1.0.0';

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
        this.id = { segment:0, shape:0, edge:0, face:0, mesh2D:0, object2D:0, vertex:0, graph:0, graphEdge:0, graphNode:0 }
    }

}

export { IDX };



// LOG

function Log ( str ){ console.log( str ); };

export { Log };

// DICTIONARY

function Dictionary ( type, overwrite ){

    this.type = type || 0;

    if(this.type===0){
        //this.overwrite = overwrite == true;
        this.k = [];
        this.v = [];

    }else{
        this.h = {};
    }
}

Dictionary.prototype = {

    set: function ( key, value ) {

        if(this.type===2){
            this.h[key] = value;
        }else if(this.type===1){
            this.h[key.id] = value;
        }else{
            //if(!this.overwrite || this.k.indexOf(key) == -1){
                this.k.push(key);
                this.v.push(value);
            //}
        }

    },

    get: function ( key ) {

        if( this.type===2 ){
            return this.h[key];
        }else if(this.type===1){
            return this.h[key.id];
        }else{
            var i = this.k.indexOf(key);
            if(i != -1) return this.v[i];
        }

    },

    dispose: function () {

        if(this.type===0){
            while( this.k.length > 0 ) this.k.pop();
            while( this.v.length > 0 ) this.v.pop();
            this.k = null;
            this.v = null;
        }else{
            this.h = null;
        }
    }

}

export { Dictionary };
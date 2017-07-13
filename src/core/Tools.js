import { Dictionary, Log } from '../constants';
import { Geom2D } from '../math/Geom2D';
import { Point } from '../math/Point';

// MATH function

export var rand = function ( low, high ){ return low + Math.random() * ( high - low ); };
export var randInt = function ( low, high ){ return low + Math.floor( Math.random() * ( high - low + 1 ) ); };

export var Squared = function ( a, b ) { return a * a + b * b; };
export var SquaredSqrt = function ( a, b ) { return Math.sqrt( a * a + b * b ); };

export var nearEqual = function ( a, b, e ) { return Math.abs( a - b ) < e; };

export var Integral = function(x) { return Math.floor(x); };
export var fix = function(x, n) { return x.toFixed(n || 3) * 1; };

export var ARRAY = (typeof Float32Array !== 'undefined') ? Float32Array : Array;

//export { randInt };



function ShapeSimplifier ( coords, epsilon ) {

    epsilon = epsilon || 1;
    var len = coords.length;
    //DDLS.Debug.assertFalse((len & 1) != 0,"Wrong size",{ fileName : "ShapeSimplifier.hx", lineNumber : 18, className : "DDLS.ShapeSimplifier", methodName : "simplify"});
    if(len <= 4) return [].concat(coords);
    var firstPointX = coords[0];
    var firstPointY = coords[1];
    var lastPointX = coords[len - 2];
    var lastPointY = coords[len - 1];
    var index = -1;
    var dist = 0.;
    var _g1 = 1;
    var _g = len >> 1;
    while(_g1 < _g) {
        var i = _g1++;
        var currDist = Geom2D.distanceSquaredPointToSegment( new Point(coords[i << 1],coords[(i << 1) + 1]), new Point(firstPointX,firstPointY), new Point(lastPointX,lastPointY) );
        //var currDist = DDLS.Geom2D.distanceSquaredPointToSegment(coords[i << 1],coords[(i << 1) + 1],firstPointX,firstPointY,lastPointX,lastPointY);
        if(currDist > dist) {
            dist = currDist;
            index = i;
        }
    }
    if(dist > epsilon * epsilon) {
        var l1 = coords.slice(0,(index << 1) + 2);
        var l2 = coords.slice(index << 1);
        var r1 = ShapeSimplifier(l1,epsilon);
        var r2 = ShapeSimplifier(l2,epsilon);
        var rs = r1.slice(0,r1.length - 2).concat(r2);
        return rs;
    } else return [firstPointX,firstPointY,lastPointX,lastPointY];

};

export { ShapeSimplifier };

// PIXEL DATA

function PixelsData(w,h) {

    this.length = w * h;
    this.bytes = new ARRAY( this.length << 2 );
    this.width = w;
    this.height = h;

};

// IMAGE DATA

function fromImageData ( image, imageData ) {

    if(image){

        var w = image.width;
        var h = image.height;

        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;

        var ctx = canvas.getContext( "2d" );
        ctx.drawImage( image, 0, 0, w, h );
        imageData = ctx.getImageData( 0, 0, w, h );
        
    }

    var pixels = new PixelsData( imageData.width, imageData.height );
    var data = imageData.data;
    var l = data.byteLength, n=0, i=0;
    while(n < l) {
        i = n++;
        pixels.bytes[i] = data[i] & 255;
    }

    if(image){
        ctx.clearRect(0,0,w,h);
        canvas = null;
        ctx = null;
    }

    return pixels;

};

export { fromImageData };

// IMG LOADER

function ImageLoader ( imageNames, loaded_ ) {

    this.images = new Dictionary(2);
    this.loaded = loaded_;
    this.count = imageNames.length;
    var _g = 0;
    while(_g < imageNames.length) {
        var name = imageNames[_g];
        ++_g;
        this.load(name);
    }
};

ImageLoader.prototype = {
    load: function(img) {
        var image;
        var _this = window.document;
        image = _this.createElement("img");
        image.style.cssText = 'position:absolute;';
        image.onload = function(){
            this.store( image, img.split("/").pop() );
        }.bind(this);
        image.src = img;
    },
    store: function(image,name) {
        this.count--;
        Log("store " + name + " " + this.count);
        this.images.set(name,image);
        if(this.count == 0) this.loaded();
    }
};

export { ImageLoader };
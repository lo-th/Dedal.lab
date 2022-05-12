
// MATH function
export const rand = ( low, high ) => ( low + Math.random() * ( high - low ) )
export const randInt = ( low, high ) => ( low + Math.floor( Math.random() * ( high - low + 1 ) ) )
export const unwrap = ( r ) => ( r - (Math.floor((r + Math.PI)/(2*Math.PI)))*2*Math.PI )
export const SquaredSqrt = ( a, b ) => ( Math.sqrt( a * a + b * b ) )
export const nearEqual = ( a, b, e ) => ( Math.abs( a - b ) < e )
export const fix = ( x, n ) => ( x.toFixed(n || 3) * 1 )
export const Squared = ( a, b ) => ( a * a + b * b )
export const Integral = ( x ) => ( Math.floor(x) )

//export const ARRAY = (typeof Float32Array !== 'undefined') ? Float32Array : Array;

// IMAGE DATA

export const fromImageData = ( image, imageData, w, h ) => {

    let canvas, ctx

    if( image ){

        w = image.width
        h = image.height

        canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;

        ctx = canvas.getContext( "2d" );
        ctx.drawImage( image, 0, 0, w, h );
        imageData = ctx.getImageData( 0, 0, w, h );
        
    }

    const pixels = {
        bytes: imageData.data,
        width: w,
        height: h
    }

    if( image ){
        ctx.clearRect(0,0,w,h)
        canvas = null
        ctx = null
    }

    return pixels

}

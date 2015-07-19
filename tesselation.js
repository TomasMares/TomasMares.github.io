"use strict";

var canvas;
var gl;
var rotationAngleInput;
var recursionDepthInput;

var rotationDegreesUniformLocation;

var points = [];

window.onload = function init()
{   
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );

    // Associate out shader variables with our data buffer
    
    rotationDegreesUniformLocation = gl.getUniformLocation(program, "angleDegrees");
    gl.uniform1f(rotationDegreesUniformLocation, 15);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    rotationAngleInput = document.getElementById("angle");
    rotationAngleInput.value = 15;
    rotationAngleInput.addEventListener("change", updateAngle);
    
    recursionDepthInput = document.getElementById("depth");
    recursionDepthInput.value = 3;
    recursionDepthInput.addEventListener("change", updateDepth);
    
    updateDepth()    
};

function updateAngle()
{
    gl.uniform1f(rotationDegreesUniformLocation, Number(rotationAngleInput.value));
    render();
}

function updateDepth()
{
    var depth = Number(recursionDepthInput.value);
    if (depth > 10)
    {
        recursionDepthInput.value = 10;
    }
    
    points = [];
    
    function triangle( a, b, c )
    {
        points.push(a, b, c);
    }
    
    function divideTriangle( a, b, c, count )
    {
        if ( count === 0 ) {
            triangle( a, b, c);
        }
        else {
            var ab = mix( a, b, 0.5 );
            var ac = mix( a, c, 0.5 );
            var bc = mix( b, c, 0.5 );
            
            count--;
            
            divideTriangle( a, ab, ac, count );
            divideTriangle( c, ac, bc, count );
            divideTriangle( b, bc, ab, count );
        }
    }
    
    divideTriangle( vec2( -0.6, -0.45 ), vec2(  0,  0.75 ), vec2(  0.6, -0.45 ), depth);
    
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
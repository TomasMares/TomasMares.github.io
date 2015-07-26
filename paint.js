var canvas;
var gl;

var drawModeOn = false;
var curvePoints = [];
var colorData = [];
var curvesEndPointIndicies = [];

var vertexBuffer;
var vPosition;

var colorBuffer;
var vColor;


function getPointData(x, y)
{
    var adjustedX = Math.min(Number(x)/canvas.width, 1.0)*2 - 1;
    var adjustedY = -Math.min(Number(y)/canvas.height, 1.0)*2 + 1;
    
    return vec2(adjustedX, adjustedY);
}

function getColor()
{
    var red = Number(document.getElementById("redComponent").value);
    var green = Number(document.getElementById("greenComponent").value);
    var blue = Number(document.getElementById("blueComponent").value);
    
    return vec3(red, green, blue);
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    vertexBuffer = gl.createBuffer();
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );
    
    colorBuffer = gl.createBuffer();
    vColor = gl.getAttribLocation( program, "vColor" );
    gl.enableVertexAttribArray(vColor);
    
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUpOrOut);
    canvas.addEventListener("mouseout", onMouseUpOrOut);
    document.getElementById("clearButton").addEventListener("click", clear);
    document.getElementById("undoButton").addEventListener("click", undo);
    
    document.getElementById("redComponent").value = 0;
    document.getElementById("greenComponent").value = 0;
    document.getElementById("blueComponent").value = 0;
};

function onMouseMove(event)
{
    console.log("onMouseMove");
    
    if (!drawModeOn)
    {
        return;
    }
    
    curvePoints.push(getPointData(event.clientX, event.clientY));
    colorData.push(getColor());
    
    render();
}

function render()
{
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorData), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(curvePoints), gl.STATIC_DRAW);
    
    for (var i = 1; i < curvesEndPointIndicies.length; ++i)
    {
        gl.drawArrays(gl.LINE_STRIP, curvesEndPointIndicies[i - 1], curvesEndPointIndicies[i] - curvesEndPointIndicies[i - 1]);
    }
    
    var lastStripFirstIndex = curvesEndPointIndicies.length > 0 ? curvesEndPointIndicies[curvesEndPointIndicies.length - 1] : 0;
    gl.drawArrays(gl.LINE_STRIP, lastStripFirstIndex, curvePoints.length - lastStripFirstIndex);
}

function onMouseDown(event)
{
    console.log("onMouseDown");

    drawModeOn = true;
    
    curvesEndPointIndicies.push(curvePoints.length);
    curvePoints.push(getPointData(event.clientX, event.clientY));
    colorData.push(getColor());
}

function onMouseUpOrOut(event)
{
    console.log("onMouseUpOrOut");
    
    drawModeOn = false;
}

function clear()
{
    curvePoints = [];
    colorData = [];
    curvesEndPointIndicies = [];
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function undo()
{
    if (curvesEndPointIndicies.length === 0 )
    {
        //nothing to do
    }
    if (curvesEndPointIndicies.length === 1)
    {
        clear();
    }
    else
    {
        var lastStripeStart = curvesEndPointIndicies[curvesEndPointIndicies.length - 1];
        curvePoints.splice(lastStripeStart, curvePoints.length - lastStripeStart);
        colorData.splice(lastStripeStart, colorData.length - lastStripeStart);
        curvesEndPointIndicies.pop();
        render();
    }
}
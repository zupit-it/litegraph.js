var webgl_canvas = null;

LiteGraph.node_images_path = "../nodes_data/";

var editor = new LiteGraph.Editor("main",{miniwindow:false});
window.graphcanvas = editor.graphcanvas;
window.graph = editor.graph;
if (LiteGraph.applyWaterjadeTheme) {
	LiteGraph.applyWaterjadeTheme(editor.graphcanvas);
}
updateEditorHiPPICanvas();
window.addEventListener("resize", function() { 
  editor.graphcanvas.resize();
  updateEditorHiPPICanvas();
} );
//window.addEventListener("keydown", editor.graphcanvas.processKey.bind(editor.graphcanvas) );
window.onbeforeunload = function(){
	var data = JSON.stringify( graph.serialize() );
	localStorage.setItem("litegraphg demo backup", data );
}

function updateEditorHiPPICanvas() {
  const ratio = window.devicePixelRatio;
  if(ratio == 1) { return }
  const rect = editor.canvas.parentNode.getBoundingClientRect();
  const { width, height } = rect;
  editor.canvas.width = width * ratio;
  editor.canvas.height = height * ratio;
  editor.canvas.style.width = width + "px";
  editor.canvas.style.height = height + "px";
  editor.canvas.getContext("2d").scale(ratio, ratio);
  return editor.canvas;
}

//enable scripting
LiteGraph.allow_scripts = true;

//test
//editor.graphcanvas.viewport = [200,200,400,400];

//create scene selector
var elem = document.createElement("span");
elem.id = "LGEditorTopBarSelector";
elem.className = "selector";
elem.innerHTML = "";
elem.innerHTML += "Demo <select><option>Empty</option></select> <button class='btn' id='save'>Save</button><button class='btn' id='load'>Load</button><button class='btn' id='download'>Download</button> | <button class='btn' id='webgl'>WebGL</button> <button class='btn' id='multiview'>Multiview</button>";
editor.tools.appendChild(elem);
var select = elem.querySelector("select");
select.addEventListener("change", function(e){
	var option = this.options[this.selectedIndex];
	var url = option.dataset["url"];
	
	if(url)
		graph.load( url );
	else if(option.callback)
		option.callback();
	else
		graph.clear();
});

elem.querySelector("#save").addEventListener("click",function(){
	console.log("saved");
	localStorage.setItem( "graphdemo_save", JSON.stringify( graph.serialize() ) );
});

elem.querySelector("#load").addEventListener("click",function(){
	var data = localStorage.getItem( "graphdemo_save" );
	if(data)
		graph.configure( JSON.parse( data ) );
	console.log("loaded");
});

elem.querySelector("#download").addEventListener("click",function(){
	var data = JSON.stringify( graph.serialize() );
	var file = new Blob( [ data ] );
	var url = URL.createObjectURL( file );
	var element = document.createElement("a");
	element.setAttribute('href', url);
	element.setAttribute('download', "graph.JSON" );
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
	setTimeout( function(){ URL.revokeObjectURL( url ); }, 1000*60 ); //wait one minute to revoke url	
});

elem.querySelector("#webgl").addEventListener("click", enableWebGL );
elem.querySelector("#multiview").addEventListener("click", function(){ editor.addMultiview()  } );


function addDemo( name, url )
{
	var option = document.createElement("option");
	if(url.constructor === String)
		option.dataset["url"] = url;
	else
		option.callback = url;
	option.innerHTML = name;
	select.appendChild( option );
}

//some examples
addDemo("Features", "examples/features.json");
addDemo("Benchmark", "examples/benchmark.json");
addDemo("Subgraph", "examples/subgraph.json");
addDemo("Audio", "examples/audio.json");
addDemo("Audio Delay", "examples/audio_delay.json");
addDemo("Audio Reverb", "examples/audio_reverb.json");
addDemo("MIDI Generation", "examples/midi_generation.json");
addDemo("Copy Paste", "examples/copypaste.json");
addDemo("Waterjade", function(){
	graph.clear();
	var T = "wj";
	var W = 450, GAP = 80;
	var col = [40, 40 + W + GAP, 40 + (W + GAP) * 2];

	// helpers
	function source(title, x, y) {
		var n = LiteGraph.createNode("waterjade/node");
		n.title = title;
		n.pos = [x, y];
		n.removeInput(0);
		n.outputs[0].name = "OUTPUT";
		graph.add(n);
		return n;
	}
	function joiner(title, x, y, inCount) {
		var n = LiteGraph.createNode("waterjade/node");
		n.title = title;
		n.pos = [x, y];
		n.inputs[0].name = "INPUT";
		for (var k = 1; k < inCount; k++) n.addInput("INPUT", T);
		n.outputs[0].name = "OUTPUT";
		graph.add(n);
		return n;
	}

	// geometry: node visual height = title(54) + body(63) = 117 for 1-slot
	// space rows so mid nodes sit between their two sources
	var srcH = 117, srcGap = 24;
	var srcY = [];
	for (var i = 0; i < 4; i++) srcY.push(40 + i * (srcH + srcGap));

	var midH = 123; // 1-slot body auto-grows for 2 inputs → ~69px body
	var mid0Y = Math.round((srcY[0] + srcY[1]) / 2 - midH / 2 + srcH / 2);
	var mid1Y = Math.round((srcY[2] + srcY[3]) / 2 - midH / 2 + srcH / 2);
	var aggY  = Math.round((mid0Y + mid1Y) / 2);

	// --- nodes ---
	var s0 = source("HRU1", col[0], srcY[0]);
	var s1 = source("HRU2", col[0], srcY[1]);
	var s2 = source("HRU3", col[0], srcY[2]);
	var s3 = source("HRU4", col[0], srcY[3]);

	var m0 = joiner("DAM1", col[1], mid0Y, 2);
	var m1 = joiner("DAM2", col[1], mid1Y, 2);

	var agg = joiner("RESERVOIR", col[2], aggY, 2);

	// --- connections ---
	s0.connect(0, m0, 0);
	s1.connect(0, m0, 1);
	s2.connect(0, m1, 0);
	s3.connect(0, m1, 1);
	m0.connect(0, agg, 0);
	m1.connect(0, agg, 1);

	// --- HRU input → internal → HRU output at bottom ---
	var hruY = srcY[3] + srcH + 80;

	var hruIn = LiteGraph.createNode("waterjade/hru_input");
	hruIn.pos = [col[0], hruY];
	graph.add(hruIn);

	var internal = LiteGraph.createNode("waterjade/internal_node");
	internal.title = "Precipitation Phase";
	internal.pos = [col[1], hruY];
	internal.onEditClick = function(node, gc) {
		console.log("[waterjade] edit clicked:", node.title);
	};
	graph.add(internal);

	var hruOut = LiteGraph.createNode("waterjade/hru_output");
	hruOut.pos = [col[2], hruY];
	graph.add(hruOut);

	hruIn.connect(0, internal, 0);
	internal.connect(0, hruOut, 0);
});

addDemo("autobackup", function(){
	var data = localStorage.getItem("litegraphg demo backup");
	if(!data)
		return;
	var graph_data = JSON.parse(data);
	graph.configure( graph_data );
});

//allows to use the WebGL nodes like textures
function enableWebGL()
{
	if( webgl_canvas )
	{
		webgl_canvas.style.display = (webgl_canvas.style.display == "none" ? "block" : "none");
		return;
	}

	var libs = [
		"js/libs/gl-matrix-min.js",
		"js/libs/litegl.js",
		"../src/nodes/gltextures.js",
		"../src/nodes/glfx.js",
		"../src/nodes/glshaders.js",
		"../src/nodes/geometry.js"
	];

	function fetchJS()
	{
		if(libs.length == 0)
			return on_ready();

		var script = null;
		script = document.createElement("script");
		script.onload = fetchJS;
		script.src = libs.shift();
		document.head.appendChild(script);
	}

	fetchJS();

	function on_ready()
	{
		console.log(this.src);
		if(!window.GL)
			return;
		webgl_canvas = document.createElement("canvas");
		webgl_canvas.width = 400;
		webgl_canvas.height = 300;
		webgl_canvas.style.position = "absolute";
		webgl_canvas.style.top = "0px";
		webgl_canvas.style.right = "0px";
		webgl_canvas.style.border = "1px solid #AAA";

		webgl_canvas.addEventListener("click", function(){
			var rect = webgl_canvas.parentNode.getBoundingClientRect();
			if( webgl_canvas.width != rect.width )
			{
				webgl_canvas.width = rect.width;
				webgl_canvas.height = rect.height;
			}
			else
			{
				webgl_canvas.width = 400;
				webgl_canvas.height = 300;
			}
		});

		var parent = document.querySelector(".editor-area");
		parent.appendChild( webgl_canvas );
		var gl = GL.create({ canvas: webgl_canvas });
		if(!gl)
			return;

		editor.graph.onBeforeStep = ondraw;

		console.log("webgl ready");
		function ondraw ()
		{
			gl.clearColor(0,0,0,0);
			gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
			gl.viewport(0,0,gl.canvas.width, gl.canvas.height );
		}
	}
}

// Tests
// CopyPasteWithConnectionToUnselectedOutputTest();
// demo();
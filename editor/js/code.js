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

	var internal = LiteGraph.createNode("waterjade/node");
	internal.title = "Precipitation Phase";
	internal.pos = [col[1], hruY];
	internal.icon = new Path2D(
		"M22.1217 19.2256V20.9199L23.5719 20.0732L24.3102 21.3662L22.86 22.2129L24.3102 23.0596L23.5719 24.3525L22.1217 23.5059V25.1992H20.6451V23.5059L19.1949 24.3525L18.4566 23.0596L19.9068 22.2129L18.4566 21.3662L19.1949 20.0732L20.6451 20.9199V19.2256H22.1217Z" +
		"M10.0611 21.7275L8.7955 25.0889L7.41562 24.5576L8.68124 21.1953L10.0611 21.7275Z" +
		"M14.4908 21.7246L13.2252 25.0869L11.8443 24.5547L13.11 21.1934L14.4908 21.7246Z" +
		"M11.0465 2.7998C12.2541 2.7998 13.4149 3.16764 14.4029 3.86328C15.0985 4.35294 15.6768 4.98028 16.106 5.70703C16.7988 5.27249 17.5977 5.04011 18.4293 5.04004C20.6384 5.04004 22.4754 6.68349 22.8062 8.8252C23.732 8.96859 24.5901 9.40195 25.273 10.0801C26.1286 10.9297 26.6001 12.0567 26.6002 13.2529C26.6002 14.4492 26.1286 15.5761 25.273 16.4258C24.4241 17.2687 23.3044 17.7334 22.1207 17.7334H17.4615L16.5182 20.2393L15.1383 19.707L15.8814 17.7334H13.0318L12.0885 20.2393L10.7086 19.707L11.4518 17.7334H8.60214L7.65878 20.2393L6.2789 19.707L7.02206 17.7334H5.87851C4.69503 17.7333 3.57595 17.2686 2.72714 16.4258C1.87153 15.5761 1.39999 14.4492 1.39999 13.2529C1.40003 12.0567 1.87156 10.9297 2.72714 10.0801C3.39715 9.4148 4.23564 8.98538 5.1412 8.83398C5.14082 8.81393 5.14023 8.79373 5.14023 8.77344C5.14023 5.47989 7.78995 2.80001 11.0465 2.7998Z" +
		"M11.0465 4.29297C8.60412 4.29317 6.61679 6.3033 6.61679 8.77344C6.61683 8.94975 6.64451 9.13947 6.67343 9.33984L6.80527 10.2666H5.87851C4.22322 10.2668 2.87664 11.6063 2.87656 13.2529C2.87656 14.8996 4.22317 16.2391 5.87851 16.2393H22.1207C23.7762 16.2393 25.1236 14.8998 25.1236 13.2529C25.1235 11.6062 23.7762 10.2666 22.1207 10.2666H21.3824V9.51953C21.3823 7.8728 20.0576 6.5332 18.4293 6.5332C17.6536 6.5333 16.9197 6.83773 16.3629 7.39062L15.568 8.18066L15.1588 7.13281C14.4851 5.40797 12.8706 4.29297 11.0465 4.29297Z"
	);
	internal.icon_viewbox = 28;
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
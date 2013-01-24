//-------------------------------------
// const
var ANIME_MSEC = 250;
var X_MARGIN = 30;
var Y_MARGIN = 100;
var SCALE_MIN = 0.1;
var SCALE_MAX = 6.0;

//-------------------------------------
// global
var shiftX = 0;
var shiftY = 0;
var dragX = 0;
var dragY = 0;
var scale = 1.0;
var moving = false;

//-------------------------------------
function createNodeFromURL(url) {
	var a = $.ajax({
		type: "GET",
		url : url,
		async: false,
		dataType: "json",
	});
	return createNodeFromJson(JSON.parse(a.responseText));
}

function createNodeFromJson(json) {
	console.log(json);
	var nodes = [];
	for(var i=0; i<json.nodes.length; i++) {
		var c = json.nodes[i];
		nodes[c.name] = c;
	}
	function createRec(l, node) {
		for(var i=0; i<l.children.length; i++) {
			var child = l.children[i];
			var n = nodes[child.name];
			var newNode = new Node(0, n.name, n.DBNodeType, n.description);
			node.addChild(newNode);
			createRec(child, newNode);
		}
	}
	var n = nodes[json.links.name];
	var topNode = new Node(0, n.name, n.DBNodeType, n.description);
	createRec(json.links, topNode);
	return topNode;
}

//function createBinNode(n) {
//	if(n > 0) {
//		var node = new Node(0, "Goal", "Goal", "description");
//		node.addChild(createBinNode(n-1));
//		node.addChild(createBinNode(n-1));
//		return node;
//	} else {
//		return new Node(0, "Goal", "Goal", "description");
//	}
//}

function createNode() {
	var topNode = new Node(0, "TopGoal", "Goal",
			"Connected");
	var str = new Node(1, "Strategy", "Strategy", "Avoid Error Messages");
	topNode.addChild(new Node(2, "Context", "Context", "Network Cable is connected. Checked by Connection.ds"));
	topNode.addChild(str);
	str.addChild(new Node(1, "SubGoal 1", "Goal", "Request Timed Out"));//Server doesn't allow ping or cable is cut. IP Address is incorrect.
	str.addChild(new Node(1, "SubGoal 2", "Goal", "Unknown Host"));
	str.addChild(new Node(1, "SubGoal 3", "Goal", "Destination Host Unreachable"));
	str.addChild(new Node(1, "SubGoal 4", "Goal", "Destination Net Unreachable"));
	str.addChild(new Node(1, "SubGoal 5", "Goal", "Operation not Permitted"));
	str.addChild(new Node(1, "SubGoal 6", "Goal", "Time to live exceed"));
	str.children[0].addChild(new Node(1, "Strategy", "Strategy", "firewall settings"));
	str.children[0].children[0].addChild(new Node(1, "SubGoal", "Goal", "Client drops all packet INPUT"));
	str.children[0].children[0].addChild(new Node(1, "SubGoal", "Goal", "Client's icmp-reply acceptable"));
	str.children[0].children[0].children[0].addChild(new Node(1, "Evidence", "Evidence", "firewall_input.ds"));
	str.children[0].children[0].children[1].addChild(new Node(1, "Evidence", "Evidence", "firewall_input.ds"));
	str.children[1].addChild(new Node(2, "SubGoalContext", "Context", "Given HostName as intended. Checked by GivenHost_Check.ds"));
//	str.children[1].addChild(new Node(1, "Strategy", "Strategy", "name resolution Success"));
//	str.children[1].children[0].addChild(new Node(1, "SubGoal", "Goal", "DNS is set properly"));
//	str.children[1].children[0].addChild(new Node(1, "SubGoal", "Goal", "DNS is on"));
	str.children[1].addChild(new Node(1, "Evidence", "Evidence", "Nslookup.ds"));
//	str.children[1].children[0].state = "error";
//	str.children[2].addChild(new Node(1, "SubGoal 3.1", "Goal", "Host is not found"));//Host Unreachable. Host part of IP Address is wrong.
//	str.children[2].addChild(new Node(1, "SubGoalContext", "Context", "Given IP Address as intended. Checked by GivenIP_Check.ds"));
	str.children[4].addChild(new Node(1, "Strategy", "Strategy", "firewall settings"));
	str.children[4].children[0].addChild(new Node(1, "SubGoal", "Goal", "Client drops all packet OUTPUT"));
	str.children[4].children[0].addChild(new Node(1, "SubGoal", "Goal", "Host's icmp-request acceptable"));
	str.children[4].children[0].children[0].addChild(new Node(1, "Evidence", "Evidence", "firewall_output.ds"));
	str.children[4].children[0].children[1].addChild(new Node(1, "Evidence", "Evidence", "firewall_output.ds"));
	return topNode;
}

function createDCaseViewer(url) {
	var root = document.getElementById("viewer-root");

	var svgroot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svgroot.id = "svgroot";
	svgroot.style.position = "absolute";
	svgroot.style.left = 0;
	svgroot.style.top  = 0;
	svgroot.style.width  = "100%";
	svgroot.style.height = "100%";
	root.appendChild(svgroot);

	//var D = document.createElement("div");//for debug
	//D.style.left = 0;
	//D.style.top = 0;
	//D.innerHTML = "";
	//document.body.appendChild(D);

	var node = typeof url === "undefined" ?
			createNode() : createNodeFromURL(url);
	View.prototype.repaintAll = function(ms) {
		node.view.updateLocation((shiftX + dragX) / scale, (shiftY + dragY) / scale);
		node.view.animateSec(ms);
	}
	shiftX = ($(root).width() - node.view.updateLocation(0, 0).x * scale)/2;
	shiftY = 20;
	node.view.repaintAll(0);

	setEventHandler(node.view);
}


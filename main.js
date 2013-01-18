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
			"ネットワークに繋がっている <br>pingが通る");
	var str = new Node(1, "Strategy", "Strategy", "要因場所により分類");
	topNode.addChild(new Node(2, "Context", "Context", "IP Address<br>Hostname<br>OS Ver"));
	topNode.addChild(str);

	str.addChild(new Node(1, "SubGoal 1", "Goal", "PCからパケットが出ている"));
	str.children[0].addChild(new Node(1, "Strategy1", "Strategy", "物理的な配線の問題"));
	str.children[0].addChild(new Node(1, "Strategy2", "Strategy", "firewallの設定を考慮する"));
	str.children[0].addChild(new Node(1, "Strategy3", "Strategy", "名前解決"));
	str.children[0].addChild(new Node(1, "Strategy4", "Strategy", "ルーティングテーブル設定"));
	str.children[0].children[0].addChild(new Node(1, "SubGoal", "Goal", "NICが無効にされていない"));
	str.children[0].children[0].children[0].addChild(new Node(1, "Evidence", "Evidence", "Connection.ds"));
	str.children[0].children[1].addChild(new Node(1, "SubGoal", "Goal", "Firewall設定でパケットを破棄していない"));
	str.children[0].children[1].children[0].addChild(new Node(1, "Evidence", "Evidence", "Firewall_output.ds, Firewall_input.ds"));
	str.children[0].children[2].addChild(new Node(1, "SubGoal", "Goal", "DNSから返答がある"));
	str.children[0].children[2].children[0].addChild(new Node(1, "Evidence", "Evidence", "CheckDNS.ds, Ping_to_DNS.ds"));
	str.children[0].children[2].addChild(new Node(1, "SubGoal", "Goal", "DNSに問い合わせ、IP Addressを取得できる"));
	str.children[0].children[2].children[1].addChild(new Node(1, "Evidence", "Evidence", "Nslookup.ds"));
	str.children[0].children[3].addChild(new Node(1, "SubGoal", "Goal", "ルーティングテーブルにIP Addressが登録されている"));
	str.children[0].children[3].children[0].addChild(new Node(1, "Evidence", "Evidence", "Routing_directly.ds"));
	str.children[0].children[3].addChild(new Node(1, "SubGoal", "Goal", "ルーティングテーブルにデフォルトゲートウェイが登録されている"));
	str.children[0].children[3].children[1].addChild(new Node(1, "Evidence", "Evidence", "Routing_default.ds"));
//	str.children[0].children[4].addChild(new Node(1, "SubGoal", "Goal", "Time to Live exceeded"));

	str.addChild(new Node(1, "SubGoal 2", "Goal", "PCからRouterまでパケットが届く"));
	str.children[1].addChild(new Node(1, "Strategy1", "Strategy", "ゲートウェイの認識"));
	str.children[1].children[0].addChild(new Node(1, "SubGoal", "Goal", "Ping_to_gateway.ds"));
	str.children[1].addChild(new Node(1, "Strategy2", "Strategy", "ルーティングの設定"));
	str.children[1].children[1].addChild(new Node(1, "SubGoal", "Goal", "ルータのルーティングテーブルの設定が正しい(人による確認)"));
	str.children[1].children[1].children[0].addChild(new Node(1, "Evidence", "Evidence", "Undeveloped"));
//	str.children[0].children[0].children[0].addChild(new Node(1, "Evidence", "Evidence",
//																				"Firewall_input.ds<br>Retry.ds"));
	str.addChild(new Node(1, "SubGoal 3", "Goal", "RouterからHostまでパケットが届く"));
//	str.children[0].children[0].children[1].addChild(new Node(1, "Evidence", "Evidence", "Firewall_output.ds"));
//	str.children[0].children[0].children[2].addChild(new Node(1, "Evidence", "Evidence", "Host_unreachable.ds"));
//	str.children[0].children[0].children[3].addChild(new Node(1, "Evidence", "Evidence", "Router.ds"));
//	str.children[0].children[0].children[4].addChild(new Node(1, "Evidence", "Evidence", "TTL.ds"));
//	str.children[1].children[0].children[0].addChild(new Node(1, "Evidence", "Evidence", "Nslookup.ds"));
//	str.children[1].children[0].children[1].addChild(new Node(1, "Evidence", "Evidence", "Connection.ds"));
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


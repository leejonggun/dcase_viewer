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
			"通信可能である<br>pingが通る");
	var str = new Node(1, "Strategy", "Strategy", "要因場所により分類");
	topNode.addChild(new Node(2, "Static Context", "Context", "@IP:192.68.59.94<br>@OS:ubuntu12.04LTS 64bit"));
	topNode.addChild(new Node(2, "Dinamic Context", "Context", "@Hostname:www.google.com"));
	topNode.addChild(str);

	str.addChild(new Node(1, "SubGoal 1", "Goal", "PCからパケットを送信&受信可能である"));
	str.children[0].addChild(new Node(1, "Strategy1", "Strategy", "物理的な問題"));
	str.children[0].addChild(new Node(1, "Strategy2", "Strategy", "firewallの設定を考慮する"));
	str.children[0].addChild(new Node(1, "Strategy3", "Strategy", "名前解決"));
	str.children[0].addChild(new Node(1, "Strategy4", "Strategy", "ルーティングテーブル設定"));
	str.children[0].children[0].addChild(new Node(1, "SubGoal1", "Goal", "NICが認識されている"));
	str.children[0].children[0].children[0].addChild(new Node(1, "Evidence", "Evidence", "CheckNIC.ds"));
	str.children[0].children[0].addChild(new Node(1, "SubGoal1", "Goal", "ネットワークインターフェースが有効になっている"));
	str.children[0].children[0].children[1].addChild(new Node(1, "Evidence", "Evidence", "Connection.ds"));
	str.children[0].children[1].addChild(new Node(1, "SubGoal1", "Goal", "Firewall設定で送信するパケットを破棄していない"));
	str.children[0].children[1].children[0].addChild(new Node(1, "Evidence", "Evidence", "FirewallOutput.ds"));
	str.children[0].children[1].addChild(new Node(1, "SubGoal2", "Goal", "Firewall設定で受信するパケットを破棄していない"));
	str.children[0].children[1].children[1].addChild(new Node(1, "Evidence", "Evidence", "FirewallInput.ds"));
	str.children[0].children[2].addChild(new Node(1, "SubGoal1", "Goal", "DNSが設定されている"));
	str.children[0].children[2].children[0].addChild(new Node(1, "Evidence", "Evidence", "CheckDNS.ds"));
	str.children[0].children[2].addChild(new Node(1, "SubGoal2", "Goal", "DNSから返答がある"));
	str.children[0].children[2].children[1].addChild(new Node(1, "Evidence", "Evidence", "PingDNS.ds"));
	str.children[0].children[2].addChild(new Node(1, "SubGoal3", "Goal", "DNSに問い合わせ、IP Addressを取得できる"));
	str.children[0].children[2].children[2].addChild(new Node(1, "Evidence", "Evidence", "Nslookup.ds"));
	str.children[0].children[3].addChild(new Node(1, "SubGoal1", "Goal", "ルーティングテーブルにIP Addressが登録されている"));
	str.children[0].children[3].children[0].addChild(new Node(1, "Evidence", "Evidence", "RoutingDirectly.ds"));
	str.children[0].children[3].addChild(new Node(1, "SubGoal2", "Goal", "ルーティングテーブルにデフォルトゲートウェイが登録されている"));
	str.children[0].children[3].children[1].addChild(new Node(1, "Evidence", "Evidence", "RoutingDefault.ds"));

	str.addChild(new Node(1, "SubGoal 2", "Goal", "PCとRouter間でパケットのやり取りが可能である"));
	str.children[1].addChild(new Node(1, "Strategy1", "Strategy", "ゲートウェイの動作確認"));
	str.children[1].children[0].addChild(new Node(1, "SubGoal1", "Goal", "ゲートウェイが認識されている"));
	str.children[1].children[0].children[0].addChild(new Node(1, "Evidence", "Evidence", "RecognitionGW.ds"));
	str.children[1].children[0].addChild(new Node(1, "SubGoal2", "Goal", "ゲートウェイから返答がある"));
	str.children[1].children[0].children[1].addChild(new Node(1, "Evidence", "Evidence", "PingGW.ds"));
	str.children[1].addChild(new Node(1, "Strategy2", "Strategy", "ルーティングの設定"));
	str.children[1].children[1].addChild(new Node(1, "SubGoal1", "Goal", "ルータのルーティングテーブルの設定が正しい(人による確認が必要)"));
	str.children[1].children[1].children[0].addChild(new Node(1, "Evidence", "Evidence", "設定を確認済み"));

	str.addChild(new Node(1, "SubGoal 4", "Goal", "Host側のRouterとHost間でパケットのやり取りが可能である"));
	str.children[2].addChild(new Node(1, "Strategy1", "Strategy", "ルータの設定を考慮する"));
	str.children[2].children[0].addChild(new Node(1, "SubGoal1", "Goal", "経路の各ルータのルーティング設定が正しい"));
	str.children[2].children[0].children[0].addChild(new Node(1, "Evidence", "Evidence", "Undeveloped"));
	str.children[2].children[0].addChild(new Node(1, "SubGoal2", "Goal", "Host側のルータが稼動している"));
	str.children[2].children[0].children[1].addChild(new Node(1, "Evidence", "Evidence", "担当者に確認済み"));
	str.children[2].children[0].addChild(new Node(1, "SubGoal3", "Goal", "Host側のルータのルーティング設定が正しい"));
	str.children[2].children[0].children[2].addChild(new Node(1, "Evidence", "Evidence", "Undeveloped"));
	str.children[2].addChild(new Node(1, "Strategy2", "Strategy", "Hostの状態を確認する"));
	str.children[2].children[1].addChild(new Node(1, "SubGoal1", "Goal", "Hostが稼動している"));
	str.children[2].children[1].children[0].addChild(new Node(1, "Evidence", "Evidence", "担当者に確認済み"));
	str.children[2].children[1].addChild(new Node(1, "SubGoal2", "Goal", "Hostがネットワークに繋がっている"));
	str.children[2].children[1].children[1].addChild(new Node(1, "Evidence", "Evidence", "担当者に確認済み"));
	str.children[2].children[1].addChild(new Node(1, "SubGoal3", "Goal", "Hostのルーティング設定が正しい"));
	str.children[2].children[1].children[2].addChild(new Node(1, "Evidence", "Evidence", "Undeveloped"));
	str.children[2].children[1].addChild(new Node(1, "SubGoal4", "Goal", "Hostのfirewall設定が正しい"));
	str.children[2].children[1].children[3].addChild(new Node(1, "Evidence", "Evidence", "Undeveloped"));
//	str.children[2].children[0].children[3].addChild(new Node(1, "", "", ""));
//	str.children[2].children[0].children[4].addChild(new Node(1, "", "", ""));
//	str.children[2].children[0].children[0].addChild(new Node(1, "", "", ""));
//	str.children[2].children[0].children[1].addChild(new Node(1, "", "", ""));
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


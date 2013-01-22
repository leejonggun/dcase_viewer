/* class Node */
var Node = function(id, name, type, text) {
	this.id = id;
	this.name = name;
	this.text = text;
	this.type = type;
	this.state = "normal";
	this.children = [];
	this.contexts = [];
	this.parents = [];
}

Node.prototype.addChild = function(node) {
	if(node.type != "Context") {
		this.children.push(node);
	} else {
		this.contexts.push(node);
	}
	node.parents.push(this);
}

Node.prototype.isArgument = function() {
	return this.contexts.length != 0 && this.type == "Goal";
}

Node.prototype.isUndevelop = function() {
	return this.children.length == 0 && this.type == "Goal";
}

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
	function createChildren(l, node) {
		for(var i=0; i<l.children.length; i++) {
			var child = l.children[i];
			var n = nodes[child.name];
			var newNode = new Node(0, n.name, n.DBNodeType, n.description);
			node.addChild(newNode);
			createChildren(child, newNode);
		}
	}
	var n = nodes[json.links.name];
	var topNode = new Node(0, n.name, n.DBNodeType, n.description);
	createChildren(json.links, topNode);
	return topNode;
}

function createBinNode(n) {
	if(n > 0) {
		var node = new Node(0, "Goal", "Goal", "description");
		node.addChild(createBinNode(n-1));
		node.addChild(createBinNode(n-1));
		return node;
	} else {
		return new Node(0, "Goal", "Goal", "description");
	}
}

function createNodeFromJson2(json) {
	var node = new Node(0, json.name, json.type, json.desc);
	if(json.children != null) {
		for(var i=0; i<json.children.length; i++) {
			var child = createNodeFromJson2(json.children[i]);
			node.addChild(child);
		}
	}
	return node;
}

function createSampleNode() {
	var strategy_children = [
		{ name: "SubGoal 1", type: "Goal", desc: "Phsical layerは正常である",
			children: [
						{ name: "Context 1.1", type: "Context", desc: "@IP Address:192.168.59.101" },
						{ name: "Strategy", type: "Strategy", desc: "接続方式により議論" ,
						  children: [
									  { name: "SubGoal 1.1", type: "Goal",  desc: "イーサネットで接続している" ,
										children: [
													{ name: "Strategy", type: "Strategy", desc: "PCや周辺機器の状態により判断" ,
													  children: [
																  { name: "SubGoal 1.1.1", type: "Goal",  desc: "PCに繋がっているLANケーブルが途切れていない" },
																  { name: "SubGoal 1.1.2", type: "Goal",  desc: "イーサネットカードが認識されている" ,
																	children: [
																				{ name: "Evidence", type: "Evidence", dexc: "CheckNIC.ds" }
																			  ] }
																] }
												  ] },
									  { name: "SubGoal 1.2", type: "Goal",  desc: "無線LANで接続している" ,
										children: [
													{ name: "Strategy", type: "Strategy", desc: "PCや周辺機器の状態により判断" ,
													  children: [
																  { name: "SubGoal 1.1.1", type: "Goal",  desc: "電波信号が十分に強い" },
																  { name: "SubGoal 1.1.2", type: "Goal",  desc: "電波干渉がない" },
																  { name: "SubGoal 1.1.3", type: "Goal",  desc: "無線LANカードが認識されている" ,
																	children: [
																				{ name: "Evidence", type: "Evidence", dexc: "CheckNIC.ds" }
																			  ] }
																] }
												  ] }
									] }
					  ] },
		{ name: "SubGoal 2", type: "Goal", desc: "Data Link layerは正常である",
			children: [
						{ name: "Context 2.1", type: "Context",  desc: "@IP Address:192.168.59.101" },
						{ name: "SubGoal 2.1", type: "Goal",  desc: "PCでイーサネットが有効になっている" },
						{ name: "SubGoal 2.1", type: "Goal",  desc: "PCで無線LANが有効になっている" }
					  ]
		},
		{ name: "SubGoal 3", type: "Goal", desc: "Network layerは正常である",
			children: [
						{ name: "Evidence 3.1", type: "Evidence", desc: "RoutingDirectly.ds" },
					  ]
		},
		{ name: "SubGoal 4", type: "Goal", desc: "Transport layerは正常である",
			children: [
						{ name: "Evidence 3.1", type: "Evidence", desc: "RoutingDefault.ds" },
					  ]
		},
		{ name: "SubGoal 5", type: "Goal", desc: "Session layerは正常である",
			children: [
						{ name: "Evidence2.1", type: "Evidence", desc: "FirewallOutput.ds" }
					  ]
		},
		{ name: "SubGoal 6", type: "Goal", desc: "Presentation layerは正常である",
			children: [
						{ name: "Evidence2.1", type: "Evidence", desc: "FirewallInput.ds" }
					  ]
		},
		{ name: "SubGoal 7", type: "Goal", desc: "Application layerは正常である",
			children: [
						{ name: "Evidence 2.1", type: "Evidence", desc: "Nslookup.ds" }
					  ]
		}
	];
	return createNodeFromJson2({
		name: "TopGoal", type: "Goal",
		desc: "通信可能である<br>pingが通る",
		children: [
			{
			  name: "Static Context", type: "Context", desc: "@IP:192.168.59.100<br>@OS:ubuntu12.04LTS 64bit<br>"+
			  "@Net Topology:ring<br>@IP Address list:192.168.59.101~106<br>@Hostname list:...<br>OS list:..."
			},
			{ name: "Dynamic Context", type: "Context", desc: "@Destination:192.168.59.102" },
			{
				name: "Strategy", type: "Strategy", desc: "レイヤーレベルで議論",
				children: strategy_children
			}
		]
	});
}


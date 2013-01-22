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
		{ name: "SubGoal 1", type: "Goal", desc: "Link layerは正常である",
		children: [
					{ name: "Context 1.1", type: "Context", desc: "@接続方法:イーサネット、無線LAN" },
					{ name: "Strategy", type: "Strategy", desc: "接続方式により議論" ,
					children: [
								{ name: "SubGoal 1.1(or)", type: "Goal",  desc: "イーサネットで接続している" ,
								children: [
											{ name: "Strategy", type: "Strategy", desc: "PCや周辺機器の状態により判断" ,
											children: [
														{ name: "SubGoal 1.1.1", type: "Goal",  desc: "PCに繋がっているネットワークケーブルが途切れていない" },
														{ name: "SubGoal 1.1.2", type: "Goal",  desc: "ハブが壊れていない" },
														{ name: "SubGoal 1.1.3", type: "Goal",  desc: "イーサネットカードが認識されている" ,
														children: [
																	{ name: "Evidence", type: "Evidence", desc: "CheckNIC.ds" }
																			]
														},
														{ name: "SubGoal 1.1.4", type: "Goal",  desc: "PCでイーサネットインターフェースが有効になっている" ,
														children: [
																	{ name: "Evidence", type: "Evidence", desc: "Connection.ds" }
																			]
														}
																]
											}
													]
								},
								{ name: "SubGoal 1.2(or)", type: "Goal",  desc: "無線LANで接続している" ,
								children: [
											{ name: "Strategy", type: "Strategy", desc: "PCや周辺機器の状態により判断" ,
											children: [
														{ name: "SubGoal 1.2.1", type: "Goal",  desc: "電波信号が十分に強い" },
														{ name: "SubGoal 1.2.2", type: "Goal",  desc: "電波干渉がない" },
														{ name: "SubGoal 1.2.3", type: "Goal",  desc: "無線LANカードが認識されている" ,
														children: [
																	{ name: "Evidence", type: "Evidence", desc: "CheckNIC.ds" }
																			]
														},
														{ name: "SubGoal 2.2", type: "Goal",  desc: "PCで無線LANインターフェースが有効になっている" ,
														children: [
																	{ name: "Evidence 2.1", type: "Evidence", desc: "Connection.ds" }
																			]
														}
																]
											}
													]
								}
										]
					}
							]
		},

//		{ name: "SubGoal 2", type: "Goal", desc: "Data Link layerは正常である",
//		children: [
//					{ name: "Context 2.1", type: "Context",  desc: "@IP Address:192.168.59.101" },
//					{ name: "Strategy", type: "Strategy",  desc: "接続方式により議論" ,
//					children: [
//								{ name: "Context 2.1", type: "Context",  desc: "@接続方法:イーサネット、無線LAN" },
//								{ name: "SubGoal 2.1", type: "Goal",  desc: "PCでイーサネットインターフェースが有効になっている" ,
//								children: [
//											{ name: "Evidence 2.1", type: "Evidence", desc: "Connection.ds" }
//													]
//								},
//								{ name: "SubGoal 2.2", type: "Goal",  desc: "PCで無線LANインターフェースが有効になっている" ,
//								children: [
//											{ name: "Evidence 2.1", type: "Evidence", desc: "Connection.ds" }
//													]
//								}
//										]
//					}
//							]
//		},

			//パケットを送信元から宛先まで届ける全工程を担っている。
			//仮想的なパケット交換ネットワークを構築、ホストとホスト間の通信を実現。ICMP(Internet Control Message Protocol)等もここ。つまり、pingによるチェックはここまで。
			//同じネットワーク媒体上に接続されているコンピュータ間同士だけではなく、異なるネットワーク媒体上に接続されているコンピュータの間でも通信を行えるようにする。(IP)アドレス付け。(ゲートウェイ内外の)ルーティングプロトコル。
		{ name: "SubGoal 2", type: "Goal", desc: "Internet layerは正常である",
		children: [
						{ name: "Context 1.1", type: "Context", desc: "@IP Address:192.168.59.101" },
						{ name: "Strategy", type: "Strategy", desc: "Internet layerの持つ役割を基に議論" ,
						children: [
									{ name: "SubGoal 2.1", type: "Goal", desc: "IP Addressが割り当てられている" },
									{ name: "SubGoal 2.2", type: "Goal", desc: "ルーティングができる" },
									{ name: "SubGoal 2.3", type: "Goal", desc: "firewall設定によりパケット情報が破棄されない" },
									{ name: "SubGoal 2.4", type: "Goal", desc: "pingが通る" }
											]
						}
//					{ name: "Evidence 2.1", type: "Evidence", desc: "CheckIPAddress.ds" },
//					{ name: "Evidence 2.5", type: "Evidence", desc: "FirewallIPOutput.ds" },//IP Level
//					{ name: "Evidence 2.6", type: "Evidence", desc: "FirewallIPInput.ds" }//IP Level
//					{ name: "Evidence 2.2", type: "Evidence", desc: "RoutingDirectly.ds" },
//					{ name: "Evidence 2.3", type: "Evidence", desc: "RoutingDirectly.ds" },
//					{ name: "Evidence 2.4", type: "Evidence", desc: "Ping.ds" },
							]
		},

//データ伝送の信頼性を保証するための機能を物理的ネットワークから独立して提供。つまり、「仮想的な回線」を提供。データが正しく相手にまで届いたかどうかを確認し、問題があれば、データの再送信などを行う。(TCP,UDPなどがここ)
//任意のサイズのデータを送るために、データの分割と再構築を行う。アプリケーションにパケットを渡すときにPort番号で識別している
		{ name: "SubGoal 4", type: "Goal", desc: "Transport layerは正常である",
			children: [
						{ name: "Evidence 3.1", type: "Evidence", desc: "FirewallPortOutput.ds" },// TCP/UDP Port
						{ name: "Evidence 3.2", type: "Evidence", desc: "FirewallPortInput.ds" }// TCP/UDP Port
					  ]
		},
		{ name: "SubGoal 5", type: "Goal", desc: "Application layerは正常である",
			children: [
						{ name: "Evidence 2.1", type: "Evidence", desc: "Nslookup.ds" }
					  ]
		}
//		{ name: "SubGoal 6", type: "Goal", desc: "Presentation layerは正常である",
//			children: [
//						{ name: "Evidence2.1", type: "Evidence", desc: "FirewallInput.ds" }
//					  ]
//		},
//		{ name: "SubGoal 7", type: "Goal", desc: "Application layerは正常である",
//			children: [
//						{ name: "Evidence 2.1", type: "Evidence", desc: "Nslookup.ds" }
//					  ]
//		}
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
				name: "Strategy", type: "Strategy", desc: "レイヤーレベルで議論",//TCP/IPの階層でアプリケーション層(アプリケーション、プレゼンテーション、セッション)、トランスポート層(トランスポート)、インターネット層(インターネット)、ネットワークインターフェイス層(データリンク、物理)に分ける
				children: strategy_children
			}
		]
	});
}


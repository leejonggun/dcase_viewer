/* class DNode */
var DNode = function(id, name, type, text) {
	this.id = id;
	this.name = name;
	this.text = text;
	this.type = type;
	this.state = "normal";
	this.children = [];
	this.contexts = [];
	this.parents = [];
}

DNode.prototype.addChild = function(node) {
	if(node.type != "Context") {
		this.children.push(node);
	} else {
		this.contexts.push(node);
	}
	node.parents.push(this);
}

DNode.prototype.isArgument = function() {
	return this.contexts.length != 0 && this.type == "Goal";
}

DNode.prototype.isUndevelop = function() {
	return this.children.length == 0 && this.type == "Goal";
}

DNode.getTypes = function() {
	return [
			"Goal", "Context", "Strategy", "Evidence", "Monitor", "DScript"
	];
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
			var newNode = new DNode(0, n.name, n.DBNodeType, n.description);
			node.addChild(newNode);
			createChildren(child, newNode);
		}
	}
	var n = nodes[json.links.name];
	var topNode = new DNode(0, n.name, n.DBNodeType, n.description);
	createChildren(json.links, topNode);
	return topNode;
}

function createBinNode(n) {
	if(n > 0) {
		var node = new DNode(0, "Goal", "Goal", "description");
		node.addChild(createBinNode(n-1));
		node.addChild(createBinNode(n-1));
		return node;
	} else {
		return new DNode(0, "Goal", "Goal", "description");
	}
}

function createNodeFromJson2(json) {
	var node = new DNode(0, json.name, json.type, json.desc);
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
		{ name: "SubGoal 1", type: "Goal", desc: "ネットワークアクセスは正常である",
		children: [
//			{ name: "Strategy", type: "Strategy", desc: "接続方式により議論" ,
//			children: [
//				{ name: "Context 1.1", type: "Context", desc: "@接続方法:イーサネット、無線LAN" },
//				{ name: "SubGoal 1.1(or)", type: "Goal",  desc: "イーサネットで接続している" ,
//				children: [
					{ name: "Strategy", type: "Strategy", desc: "PCや周辺機器の状態により判断" ,
					children: [
						{ name: "SubGoal 1.1.1", type: "Goal",  desc: "PCに繋がっているネットワークケーブルが途切れていない" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "人による確認" }
											]
						},
						{ name: "SubGoal 1.1.2", type: "Goal",  desc: "ハブが壊れていない" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "人による確認" }
											]
						},
						{ name: "SubGoal 1.1.3", type: "Goal",  desc: "イーサネットカードが認識されている" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "CheckNIC.ds" }
											]
						},
						{ name: "SubGoal 1.1.4", type: "Goal",  desc: "PCでイーサネットインターフェースが有効になっている" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "Connection.ds" }
											]
//						}
//										]
//					}
//									]
				},

//				{ name: "SubGoal 1.2(or)", type: "Goal",  desc: "無線LANで接続している" ,
//				children: [
//					{ name: "Strategy", type: "Strategy", desc: "PCや周辺機器の状態により判断" ,
//					children: [
//						{ name: "SubGoal 1.2.1", type: "Goal",  desc: "電波信号が十分に強い" },
//						{ name: "SubGoal 1.2.2", type: "Goal",  desc: "電波干渉がない" },
//						{ name: "SubGoal 1.2.3", type: "Goal",  desc: "無線LANカードが認識されている" ,
//						children: [
//							{ name: "Evidence", type: "Evidence", desc: "CheckNIC.ds" }
//											]
//							},
//							{ name: "SubGoal 2.2", type: "Goal",  desc: "PCで無線LANインターフェースが有効になっている" ,
//							children: [
//								{ name: "Evidence 2.1", type: "Evidence", desc: "Connection.ds" }
//												]
//							}
//										]
//					}
//									]
//				}
								]
			}
							]
		},

			//パケットを送信元から宛先まで届ける全工程を担っている。
			//仮想的なパケット交換ネットワークを構築、ホストとホスト間の通信を実現。ICMP(Internet Control Message Protocol)等もここ。つまり、pingによるチェックはここまで。
			//同じネットワーク媒体上に接続されているコンピュータ間同士だけではなく、異なるネットワーク媒体上に接続されているコンピュータの間でも通信を行えるようにする。(IP)アドレス付け。(ゲートウェイ内外の)ルーティングプロトコル。
		{ name: "SubGoal 2", type: "Goal", desc: "インターネット層は正常である",
		children: [
//			{ name: "Context 1.1", type: "Context", desc: "@IP Address:192.168.59.101" },
			{ name: "Strategy", type: "Strategy", desc: "Internet layerの持つ役割を基に議論" ,
			children: [
				{ name: "SubGoal 2.1", type: "Goal", desc: "IP Addressが割り当てられている" ,//IP AddressがLAN外かLAN内か?
				children: [
					{ name: "Evidence 2.1", type: "Evidence", desc: "CheckIPAddress.ds" }
									]
				},

				{ name: "SubGoal 2.2", type: "Goal", desc: "ルーティング可能" ,
				children: [
					{ name: "Strategy", type: "Strategy", desc: "ルーティングテーブルを基に議論" ,
					children: [
						{ name: "SubGoal 2.2.1", type: "Goal", desc: "直接ルーティングできる" ,
						children: [
							{ name: "Evidence 2.2.1", type: "Evidence", desc: "RoutingDirectly.ds" }
											]
						},
						{ name: "SubGoal 2.2.2", type: "Goal", desc: "ゲートウェイを通してルーティングできる" ,
						children: [
							{ name: "Evidence 2.2.2", type: "Evidence", desc: "RoutingDefault.ds" }
											]
							},
						{ name: "SubGoal 2.2.3", type: "Goal", desc: "ルータが壊れていない" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "人による確認" }
											]
						},
										]
					}
									]
				},

				{ name: "SubGoal 2.3", type: "Goal", desc: "firewall設定によりIP Addressレベルでパケット情報が破棄されない" ,
				children: [
					{ name: "Strategy", type: "Strategy", desc: "INPUT, FORWARD, OUTPUT別に確認する" ,
					children: [
						{ name: "SubGoal 2.3.1", type: "Goal", desc: "INPUTチェーンではパケットを受け入れている" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "FirewallIPInput.ds" }
											]
							},
							{ name: "SubGoal 2.3.2", type: "Goal", desc: "FORWARDチェーンではパケットを受け入れている" ,
							children: [
								{ name: "Evidence", type: "Evidence", desc: "FirewallIPForward.ds" }
												]
								},
								{ name: "SubGoal 2.3.3", type: "Goal", desc: "OUTPUTチェーンではパケットを受け入れている" ,
								children: [
									{ name: "Evidence", type: "Evidence", desc: "FirewallIPOutput.ds" }
													]
									}
										]
					}
									]
				},

//				{ name: "SubGoal 2.4", type: "Goal", desc: "pingが通る" ,
//				children: [
//					{ name: "Context 2.1", type: "Context", desc: "@IP Address:192.168.59.101<br>@OS:ubuntu12.04LTS 64bit" },
//					{ name: "Context 2.2", type: "Context", desc: "@Destination:192.168.59.102" },
//					{ name: "Evidence", type: "Evidence", desc: "Ping.ds" }
//									]
//				}
								]
			}
							]
		},

//データ伝送の信頼性を保証するための機能を物理的ネットワークから独立して提供。つまり、「仮想的な回線」を提供。データが正しく相手にまで届いたかどうかを確認し、問題があれば、データの再送信などを行う。(TCP,UDPなどがここ)
//任意のサイズのデータを送るために、データの分割と再構築を行う。アプリケーションにパケットを渡すときにPort番号で識別している
		{ name: "SubGoal 4", type: "Goal", desc: "トランスポート層は正常である",
			children: [
//				{ name: "Strategy", type: "Strategy", desc: "プロトコルにより判断する" ,
//				children: [
//					{ name: "Context 4.1", type: "Context", desc: "@プロトコル:TCP, UDP" },
//					{ name: "SubGoal 4.1", type: "Goal", desc: "TCPについて議論(or)" ,// TCP/UDP Port,再送制御、順序制御、フロー制御、輻輳制御
//					children: [
						{ name: "Strategy", type: "Strategy", desc: "firewall設定を考慮する" ,
						children: [
							{ name: "SubGoal 4.1.1", type: "Goal", desc: "受信するTCPプロトコルのパケットを破棄しない" ,
							children: [
								{ name: "Evidence 4.1.1", type: "Evidence", desc: "FirewallTCPInput.ds" }// TCP/UDP
												]
							},
							{ name: "SubGoal 4.1.2", type: "Goal", desc: "中継するTCPプロトコルのパケットを破棄しない" ,
							children: [
								{ name: "Evidence 4.1.2", type: "Evidence", desc: "FirewallTCPForward.ds" }// TCP/UDP
												]
							},
							{ name: "SubGoal 4.1.3", type: "Goal", desc: "送信するTCPプロトコルのパケットを破棄しない" ,
							children: [
								{ name: "Evidence 4.1.3", type: "Evidence", desc: "FirewallTCPOutput.ds" }// TCP/UDP
												]
							},
//							{ name: "SubGoal 4.1.4", type: "Goal", desc: "その他TCPプロトコルに関しての設定を確認する" ,//ポート指定、IP Address指定、オプション等
//							children: [
//								{ name: "Evidence", type: "Evidence", desc: "人による確認" }
//												]
//							},
//											]
//						}
//										]
//					},

//					{ name: "SubGoal 4.2", type: "Goal", desc: "UDPについて議論(or)" ,// TCP/UDP Port
//					children: [
//						{ name: "Strategy", type: "Strategy", desc: "firewall設定を考慮する" ,
//						children: [
//							{ name: "SubGoal", type: "Goal", desc: "受信するUDPプロトコルのパケットを破棄しない" ,
//							children: [
//						{ name: "Evidence 4.2.1", type: "Evidence", desc: "FirewallUDPOutput.ds" },// TCP/UDP Port
//												]
//							},
//							{ name: "SubGoal", type: "Goal", desc: "中継するUDPプロトコルのパケットを破棄しない" ,
//							children: [
//						{ name: "Evidence 4.2.2", type: "Evidence", desc: "FirewallUDPForward.ds" },// TCP/UDP Port
//												]
//							},
//							{ name: "SubGoal", type: "Goal", desc: "送信するUDPプロトコルのパケットを破棄しない" ,
//							children: [
//						{ name: "Evidence 4.2.3", type: "Evidence", desc: "FirewallUDPInput.ds" }// TCP/UDP Port
//												]
//							},
//							{ name: "SubGoal 4.2.4", type: "Goal", desc: "その他UDPプロトコルに関しての設定を確認する" }
//											]
//						}
//										]
//					}
									]
				}
								]
		},

//Presentation layer->ネットワークに流れるデータの意味を統一。コードの変換以外にデータの暗号化や、データの圧縮なども。TCP/IP layerのApplication layer。
//		{ name: "SubGoal 5", type: "Goal", desc: "Application layerは正常である",
//		children: [
//			{ name: "Context 5.1", type: "Context", desc: "@IP Address:192.168.59.101<br>@Hostname list:...<br>@Destination:192.168.59.102" },
			{ name: "SubGoal 5.1", type: "Goal", desc: "アプリケーション層は正常である(名前解決できる)" ,
			children: [
				{ name: "Evidence 5.1", type: "Evidence", desc: "Nslookup.ds" }
								]
			},
//			{ name: "Strategy", type: "Strategy", desc: "サービス別に議論する" ,
//			children: [
//				{ name: "Context 5.1", type: "Context", desc: "@Service:File Transfer, Send Message, Web, Telnet" },
//				{ name: "SubGoal 5.1", type: "Goal", desc: "電子メール(SMTP)の送受信が可能(or)" },
//				{ name: "SubGoal 5.2", type: "Goal", desc: "ワールドワイドウェブ(HTTP)の閲覧が可能(or)" },
//				{ name: "SubGoal 5.3", type: "Goal", desc: "ファイル転送が可能" ,
//				children: [
//					{ name: "Context", type: "Context", desc: "@Port:20,21" },
//					{ name: "Strategy", type: "Strategy", desc: "サービスの特性を踏まえて議論" ,
//					children: [
//						{ name: "SubGoal 5.3.1", type: "Goal", desc: "コントロールコネクションが成功する" ,
//						children: [
//							{ name: "Context", type: "Context", desc: "@Port:21" },
//							{ name: "SubGoal 5.3.2", type: "Goal", desc: "firewallによりパケットを破棄していない" ,
//							children: [
//								{ name: "Evidence", type: "Evidence", desc: "FTPControlConnect.ds" }
//												]
//							},
//							{ name: "SubGoal 5.3.3", type: "Goal", desc: "ユーザ名、パスワード名が正しい" ,
//							children: [
//								{ name: "Evidence", type: "Evidence", desc: "ユーザの確認" },
//												]
//							}
//											]
//						},
//						{ name: "SubGoal 5.3.2", type: "Goal", desc: "データコネクションが成功する" ,
//						children: [
//							{ name: "Context", type: "Context", desc: "@Port:20" },
//							{ name: "SubGoal 5.3.2.1", type: "Goal", desc: "firewallによりパケットを破棄していない" ,
//							children: [
//								{ name: "Evidence", type: "Evidence", desc: "FTPDataConnect.ds" }
//												]
//							},
//							{ name: "Strategy", type: "Strategy", desc: "通信方式により議論" ,
//							children: [
//								{ name: "Context", type: "Context", desc: "@Mode:アクティブモード、パッシブモード" },
//								{ name: "SubGoal 5.3.2.2", type: "Goal", desc: "アクティブモードで通信できる" ,
//								children: [
//									{ name: "Evidence", type: "Evidence", desc: "人による確認" }
//													]
//								},
//								{ name: "SubGoal 5.3.2.3", type: "Goal", desc: "パッシブモードで通信できる" },
//												]
//							},
//											]
//						}
//										]
//						}
//									]
//				},
//				{ name: "SubGoal 5.4", type: "Goal", desc: "Telnetが可能(or)" }
//								]
//			}
//							]
//		}
	];
	return createNodeFromJson2({
		name: "TopGoal", type: "Goal",
		desc: "通信可能である",
		children: [
			{ name: "Context", type: "Context", desc: "@Machine list:{@IP:101@Hostname:A@OS:ubuntu12.04 64bit},{@IP:102@Hostname:B@OS:ubuntu12.04 64bit}<br>"+
				"@Net Topology:ring<br>@Service:FTP<br>@Used Ports:20,21<br>@Connect Method:Ethernet" },
//			{ name: "Dynamic Context", type: "Context", desc: "@Destination:192.168.59.102" },
			{
				name: "Strategy", type: "Strategy", desc: "レイヤーレベルで議論",//TCP/IPの階層でアプリケーション層(アプリケーション、プレゼンテーション、セッション)、トランスポート層(トランスポート)、インターネット層(インターネット)、ネットワークインターフェイス層(データリンク、物理)に分ける
				children: strategy_children
			}
		]
	});
}


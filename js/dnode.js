/* class DNode */
var DNode = function(id, name, type, text) {
	this.id = id;
	this.name = name;
	this.text = text;
	this.type = type;
	this.children = [];
	this.context = null;
	this.parents = [];
	this.prevVersion = null;
	this.nextVersion = null;
}

DNode.prototype.addChild = function(node) {
	if(node.type != "Context") {
		this.children.push(node);
	} else {
		this.context = node;
	}
	node.parents.push(this);
}

DNode.prototype.isArgument = function() {
	return this.context != null && this.type == "Goal";
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
// FIXME?
var DSCRIPT_PREF = "D-Script:";
var DSCRIPT_PREF_CONTEXT = "D-Script.Name:";
DNode.prototype.isDScript = function() {
	return this.type === "Evidence" && this.text.indexOf(DSCRIPT_PREF) == 0;
}

DNode.prototype.getDScriptNameInEvidence = function() {
	return this.text.substr(DSCRIPT_PREF.length);
}

DNode.prototype.getDScriptNameInContext = function() {
	if(this.type == "Context" && this.text.indexOf(DSCRIPT_PREF_CONTEXT) == 0) {
		return this.text.substr(DSCRIPT_PREF_CONTEXT.length);
	} else {
		return null;
	}
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
		nodes[c.node_id] = c;
	}
	function createChildren(l, node) {
		for(var i=0; i<l.children.length; i++) {
			var child = l.children[i];
			var n = nodes[child.node_id];
			n.name = n.type.charAt(0) + n.node_id;
			var newNode = new DNode(n.node_id, n.name, n.type,
					n.type != "Context" ? n.description : JSON.stringify(n.properties));
			newNode.isEvidence = n.isEvidence;
			node.addChild(newNode);
			createChildren(child, newNode);
		}
	}
	var n = nodes[json.links.node_id];
	var topNode = new DNode(0, "TopGoal", n.type, n.description);
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

var id_count = 1;
function createNodeFromJson2(json) {
	var id = json.id != null ? parseInt(json.id) : id_count++;
	var node = new DNode(0, json.name, json.type, json.desc);
	if(json.prev != null) {
		node.prevVersion = createNodeFromJson2(json.prev);
		node.prevVersion.nextVersion = node;
	}
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
		{ name: "SubGoal 1", type: "Goal", desc: "Physical Layerは正常である",
		children: [
			{ name: "Strategy", type: "Strategy", desc: "PCや周辺機器の状態により判断する" ,
			children: [
				{ name: "SubGoal 1.1", type: "Goal", desc: "PC機器は障害要因ではない",
				children:[
					{name: "Strategy", type: "Strategy", desc: "PCとネットワークケーブルとの接続状態を考慮する",
					children:[
						{ name: "SubGoal 1.1.1", type: "Goal",  desc: "PCにネットワークケーブルが繋がっている" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "人による確認結果" }
											]
						},
						{ name: "SubGoal 1.1.2", type: "Goal",  desc: "ネットワークケーブルがPCに半差しになっていない" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "人による確認結果" }
											]
						}
									]
					},
					{name: "Strategy", type: "Strategy", desc: "PCとネットワークケーブルとの接続状態を考慮する",
					children:[
						{ name: "SubGoal 1.1.3", type: "Goal",  desc: "ネットワークドライバは壊れていない" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "人による確認結果" }
											]
						}
									]
					}
								]
				},
				{ name: "SubGoal 1.2", type: "Goal", desc: "周辺機器は障害要因ではない",
				children: [
					{ name: "Strategy", type: "Strategy", desc: "ネットワークケーブルの状態に関して議論する",
					children: [
						{ name: "SubGoal 1.2", type: "Goal",  desc: "ネットワークケーブルは断線されていない" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "人による確認結果" }
											]
						}
										]
					},
					{ name: "Strategy", type: "Strategy", desc: "ハブの状態に関して議論する",
					children: [
						{ name: "SubGoal 1.3", type: "Goal",  desc: "ハブが壊れていない" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "人による確認結果" }
											]
						},
						{ name: "SubGoal 1.4", type: "Goal",  desc: "ハブの電源が切られていない" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "人による確認結果" }
											]
						},
										]
					},
					{ name: "Strategy", type: "Strategy", desc: "ルータの状態に関して議論する",
					children: [
						{ name: "SubGoal 1.5", type: "Goal",  desc: "ルータが壊れていない" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "人による確認結果" }
											]
						},
						{ name: "SubGoal 1.6", type: "Goal",  desc: "ルータの電源が切られていない" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "人による確認結果" }
											]
						},
										]
					}
									]
				}
								]
			}
							]
		},

		{ name: "SubGoal 2", type: "Goal", desc: "Date Link layerは正常である",
		children: [
					{ name: "Strategy", type: "Strategy", desc: "PCの構成状況により議論する" ,
					children: [
						{ name: "SubGoal 2.1", type: "Goal",  desc: "イーサネットカードが認識されている" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "CheckNIC.ds" }
											]
						},
						{ name: "SubGoal 2.2", type: "Goal",  desc: "正しいドライバがインストールされている" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "CheckDriver.ds" }
											]
						},
						{ name: "SubGoal 2.2", type: "Goal",  desc: "カーネルモジュールがアンロードされていない" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "CheckMOD.ds" }
											]
						},
						{ name: "SubGoal 2.2", type: "Goal",  desc: "interfaces設定ファイルが間違っていない" ,
//						children: [
//							{ name: "Evidence", type: "Evidence", desc: "CheckSetting.ds" }
//											]
						},
						{ name: "SubGoal 2.3", type: "Goal",  desc: "PCでイーサネットインターフェースが有効になっている" ,
						children: [
							{ name: "Evidence", type: "Evidence", desc: "Connection.ds" }
											]
						}
									]
					}
							]
		},

			//パケットを送信元から宛先まで届ける全工程を担っている。
			//仮想的なパケット交換ネットワークを構築、ホストとホスト間の通信を実現。ICMP(Internet Control Message Protocol)等もここ。つまり、pingによるチェックはここまで。
			//同じネットワーク媒体上に接続されているコンピュータ間同士だけではなく、異なるネットワーク媒体上に接続されているコンピュータの間でも通信を行えるようにする。(IP)アドレス付け。(ゲートウェイ内外の)ルーティングプロトコル。
		{ name: "SubGoal 2", type: "Goal", desc: "Internet layerは正常である",
		children: [
			{ name: "Strategy", type: "Strategy", desc: "Internet layerの持つ役割を基に議論する" ,
			children: [
				{ name: "SubGoal 2.1", type: "Goal", desc: "IP Addressが割り当てられている" ,
				children: [
					{ name: "Evidence 2.1", type: "Evidence", desc: "CheckIPAddress.ds" }
									]
				},

//				{ name: "SubGoal 2.2", type: "Goal", desc: "ルーティングには問題がない" ,
//				children: [
//					{ name: "Strategy", type: "Strategy", desc: "ルーティングテーブルを基に議論" ,
//					children: [
/*Router BにおいてのD-Case
						{ name: "SubGoal 2.2.1", type: "Goal", desc: "ルータBのルーティングテーブルにサーバが登録されている" ,
						children: [
							{ name: "Evidence 2.2.1", type: "Evidence", desc: "人による確認結果" }
											]
						},
*/
						{ name: "SubGoal 2.2.2", type: "Goal", desc: "ゲートウェイが登録されている" ,
						children: [
							{ name: "Evidence 2.2.2", type: "Evidence", desc: "RoutingDefault.ds" }
											]
							},
//						{ name: "SubGoal 2.2.3", type: "Goal", desc: "ルータAのルーティングテーブルにサーバまでの経路、ルータAまでの経路がある" ,
//						children: [
//							{ name: "Evidence 2.2.3", type: "Evidence", desc: "人による確認結果" }
//											]
//							},
//										]
//					}
//									]
//				},

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
								]
			}
							]
		},

//データ伝送の信頼性を保証するための機能を物理的ネットワークから独立して提供。つまり、「仮想的な回線」を提供。データが正しく相手にまで届いたかどうかを確認し、問題があれば、データの再送信などを行う。(TCP,UDPなどがここ)
//任意のサイズのデータを送るために、データの分割と再構築を行う。アプリケーションにパケットを渡すときにPort番号で識別している
// TCP/UDP Port,再送制御、順序制御、フロー制御、輻輳制御
		{ name: "SubGoal 4", type: "Goal", desc: "Transport layerは正常である",
			children: [
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
							{ name: "SubGoal 4.1.3", type: "Goal", desc: "パケットトラフィックが多すぎない" ,
							children: [
								{ name: "Evidence 4.1.3", type: "Evidence", desc: "調査結果" }// TCP/UDP
												]
							},
//							{ name: "SubGoal 4.1.4", type: "Goal", desc: "その他TCPプロトコルに関しての設定を確認する" ,//ポート指定、IP Address指定、オプション等
									]
				}
								]
		},

//Presentation layer->ネットワークに流れるデータの意味を統一。コードの変換以外にデータの暗号化や、データの圧縮なども。TCP/IP layerのApplication layer。
		{ name: "SubGoal 5", type: "Goal", desc: "Application layerは正常である",
		children: [
			{ name: "Strategy", type: "Strategy", desc: "サービス別に議論する" ,
			children: [
				{ name: "SubGoal 5.1", type: "Goal", desc: "名前解決できる" ,
				children: [
					{ name: "Evidence 5.1", type: "Evidence", desc: "Nslookup.ds" }
									]
				},
				{ name: "SubGoal 5.2", type: "Goal", desc: "ファイル転送(FTP)が可能" ,
				children: [
					{ name: "Strategy", type: "Strategy", desc: "サービスの性質を踏まえて議論" ,
					children: [
						{ name: "SubGoal 5.2.1", type: "Goal", desc: "コントロールコネクションが失敗しない" ,
						children: [
							{ name: "SubGoal 5.2.1.1", type: "Goal", desc: "firewallによりポート21番のOUTPUTパケットを破棄していない" ,
							children: [
								{ name: "Evidence", type: "Evidence", desc: "Firewall21Output.ds" },
												]
							},
							{ name: "SubGoal 5.2.1.2", type: "Goal", desc: "ユーザ名、パスワード名が間違っていない" ,
							children: [
								{ name: "Evidence", type: "Evidence", desc: "ユーザの確認結果" },
												]
							},
											]
						},
						{ name: "SubGoal 5.2.2", type: "Goal", desc: "FTP設定が間違っていない" ,
						children: [
							{ name: "SubGoal 5.2.2.1", type: "Goal", desc: "firewallによりポート20番のINPUTパケットを破棄していない" ,
							children: [
								{ name: "Evidence", type: "Evidence", desc: "Firewall20Input.ds" },
												]
							},
//							{ name: "Strategy", type: "Strategy", desc: "通信方式により議論" ,
//							children: [
//								{ name: "Context", type: "Context", desc: "@Mode:アクティブモード、パッシブモード" },
///								{ name: "SubGoal 5.2.2.2", type: "Goal", desc: "アクティブモードで通信できる" },
								{ name: "SubGoal 5.3.3.3", type: "Goal", desc: "パッシブモードで通信できる" },
//												]
//							},
											]
						}
										]
						}
									]
				}
								]
			}
							]
		}
	];
	return createNodeFromJson2({
		name: "TopGoal", type: "Goal",
		desc: "通信可能である",
		children: [
			{ name: "Context", type: "Context", desc: "@IP:192.168.59.100<br>@OS:ubuntu12.04LTS 64bit<br>"+
			  "@Service:FTP<br>Connection Type:Passive Mode<br>@Net Topology:star<br>@IP Address list:192.168.59.101,192.168.59.102<br>@OS list:ubuntu12.04LTS 64bit, ubuntu12.10 64bit"
			},
			{
				name: "Strategy", type: "Strategy", desc: "レイヤーレベルで議論",//TCP/IPの階層でアプリケーション層(アプリケーション、プレゼンテーション、セッション)、トランスポート層(トランスポート)、インターネット層(インターネット)、ネットワークインターフェイス層(データリンク、物理)に分ける
				children: strategy_children
			}
		]
	});
}


/*  Tree UI Class Definitions */
  
		/**
		 * ColumnTree 
		 * Extends a regular Ext Tree Panel adding columns and segregated
		 * header, body and footer text fields for each tree node
		 * @class lore.anno.ui.ColumnTree
		 * @extends Ext.tree.TreePanel
		 * @xtype columntreepanel
		 */
		lore.anno.ui.ColumnTree = Ext.extend(Ext.tree.TreePanel, {
		    lines : false,
		    borderWidth : Ext.isBorderBox ? 0 : 2, // the combined left/right border for each cell
		    cls : 'x-column-tree',
			expandBefore: true,
			scrollOffset: 19,
			
			initComponent: function(){
				try {
					Ext.apply(this, {
						root: new Ext.tree.TreeNode({
							'draggable': false
						}),
						header: true,
					 	rootVisible: false,
	 					columns: this.columns ? this.columns:[ {'header': "Default",
						'width': 280
						}]
					});
					lore.anno.ui.ColumnTree.superclass.initComponent.apply(this, arguments);
				} catch(e){
					lore.debug.anno("ColumnTree:initComponent() - " + e, e);
				}
			},
			
		    onRender : function(){
			
		        lore.anno.ui.ColumnTree.superclass.onRender.apply(this, arguments);
					
				this.headers = this.header.createChild({cls:'x-tree-headers'});
				
		        var cols = this.columns, c;
				var totalWidth = 0;
		        
		        
				//// prevent floats from wrapping when clipped
		        for(var i = 0, len = cols.length; i < len; i++){
		             c = cols[i];
		             totalWidth += c.width;
					 
		             this.headers.createChild({
		                 cls:'x-tree-hd ' + (c.cls?c.cls+'-hd':''),
		                 cn: {
		                     cls:'x-tree-hd-text',
		                     html: c.header
		                 },
		                 style:'width:'+(c.width-this.borderWidth) +'px;'
		             });
					 
		        }
		        this.headers.createChild({cls:'x-clear'});
				
				
				this.headers.setWidth(totalWidth+ this.borderWidth);
		        this.innerCt.setWidth(totalWidth);
				this.headers.totalWidth = totalWidth;
		    },
			
			onResize : function(cmp, bWidth, bHeight, width, height) {
				var newwidth = this.getWidth();
				lore.anno.ui.ColumnTree.superclass.onResize.apply(this, arguments);

				var cols = this.columns;
				var index = this.expandBefore ? 0: cols.length-1;
				var c = cols[index];
				var totalWidth = this.headers.totalWidth ;
				c.width = c.width + ( newwidth - totalWidth);
				this.headers.dom.childNodes[index].style.width = c.width;
				this.headers.totalWidth = totalWidth = newwidth;
			
					this.headers.setWidth(totalWidth + this.borderWidth);
					this.innerCt.setWidth(totalWidth);
					
				try {		
						var f = function (node) {
							if (node.isExpanded()) {
								var n = node.childNodes;
								for (var i = 0; i < n.length; i++) {
									if ( n[i].ui.refresh)
										n[i].ui.refresh(n[i]);
									f(n[i]);
								}
							}
						}
						 
						f(this.getRootNode());
						
						
					
				} catch(e){
					lore.debug.anno(e,e);
				}
				
			}
		});

		/**
		 * Construct a column tree node
		 * @constructor
		 * @param {Object} attributes
		 */
		lore.anno.ui.ColumnTreeNode = function(attributes){
		
			this.title = attributes.title || '';
			this.bheader = attributes.bheader || '';
			this.bfooter = attributes.bfooter || '';
			this.links = attributes.links || [];
			this.nodeType = attributes.nodeType;
			
			lore.anno.ui.ColumnTreeNode.superclass.constructor.call(this, attributes);
		}
    
		/**
		 * ColumnTreeNode extends regular treenode and provides
		 * separate fields for title, header, body, and footer information per node
		 * @class lore.anno.ui.ColumnTreeNode
		 * @extends Ext.tree.TreeNode
		 */
		Ext.extend(lore.anno.ui.ColumnTreeNode, Ext.tree.TreeNode, {
			
			setText: function(_title,bh,bf,_text) {
				var oldText = this.text;
				var oldTitle = this.title;
				var oldBh = this.bheader;
				var oldBf = this.bfooter;
		        this.title = _title;
				this.text = _text;
				this.bheader = bh;
				this.bfooter = bf;
				this.attributes.title = _title;
				this.attributes.bheader = bh;
				this.attributes.bfooter = bf;
				this.attributes.text = _text;
        		
				if(this.rendered){ // event without subscribing
            		this.ui.onTextChange(this, { title:_title,
												 bheader:bh,
												 bfooter:bf,
												 text:_text,
												 oldTitle: oldTitle,
												 oldBHeader: bh,
												 oldBFooter: bf,
												 oldText: oldText });
												 
												 
        		}
        		this.fireEvent('textchange', this,  { title:_title,
												 bheader:bh,
												 bfooter:bf,
												 text:_text,
												 oldTitle: oldTitle,
												 oldBHeader: bh,
												 oldBFooter: bf,
												 oldText: oldText });
			}
			

		});
		
		
		/**
		 * Extends regular TreeNodeUI by supporting columns and more text fields
		 * per node
		 * @class lore.anno.ui.ColumnTreeNodeUI
		 * @extends Ext.tree.TreeNodeUI
		 */
		lore.anno.ui.ColumnTreeNodeUI = Ext.extend(Ext.tree.TreeNodeUI, {
			// private
			
			focus : Ext.emptyFn,
			onTextChange : function( txtfield) {
				 if(this.rendered){
           			 this.textNode.innerHTML = txtfield.text;
					 
					 this.titleNode.innerHTML = txtfield.title;
					 if ( txtfield.bheader) this.bHeaderNode.innerHTML = txtfield.bheader;
					 if ( txtfield.bfooter) this.bFooterNode.innerHTML = txtfield.bfooter;
       			 }
			},
			
			refresh : function (n) {
				var t = n.getOwnerTree();
				var cols = t.columns;
				for (var i =0; i < cols.length; i++ ){
					this.columnNodes[i].style.width = cols[i].width - t.borderWidth - ( i == (cols.length-1)? t.scrollOffset: 0);
				}
				this.bodyNode.style.width= cols[0].width - t.borderWidth -(32 + n.getDepth() * 16);
			},
			
			renderElements : function(n, a, targetNode, bulkRender){
				// add some indent caching, this helps performance when rendering a large tree
				this.indentMarkup = n.parentNode ? n.parentNode.ui.getChildIndent() : '';
				
				var t = n.getOwnerTree();
				var cols = t.columns;
				var bw = t.borderWidth;
				var c = cols[0];
				
				
				var cb = typeof a.checked == 'boolean';
				
				var href = a.href ? a.href : Ext.isGecko ? "" : "#";
				var linksBuf = "";
				for (var i = 0; i < n.links.length; i++) {
						linksBuf += "<a title=\"" + n.links[i].title + "\" href=\"#\" onclick=\"" + n.links[i].jscript + "\"><img  src='" + this.emptyIcon + "' class='x-tree-node-icon x-tree-node-inline-icon anno-view " + n.links[i].iconCls + "' /></a><span class='left-spacer4' />";
				}
				
				// Hack to bypass the default tree node model's interception of child node clicks.
				var txt = n.text.replace(/<A /g,'<A onclick="window.open(this.href);" ');
				
				var buf = ['<li class="x-tree-node"><div ext:tree-node-id="', n.id, 
				'" class="x-tree-node-el x-tree-node-leaf ', a.cls, '" >',
				 '<div class="x-tree-col" style="width:', c.width-bw,'px;">',
				 '<span style="padding-left:', (n.getDepth()-1)*16,'" class="x-tree-node-indent"></span>', 
				 '<img src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow" />', 
				 '<img src="', a.icon || this.emptyIcon, '" class="x-tree-node-icon', (a.icon ? " x-tree-node-inline-icon" : ""), (a.iconCls ? " " + a.iconCls : ""), 
				 '" />', 
				 '<div style="display:inline-block;width:', c.width-bw-(32 + n.getDepth() * 16),'"><div class="x-tree-col-div-general">',  n.title, '</div>','<div class="x-tree-node-bheader x-tree-col-div-general">', (n.bheader ?  n.bheader:''),'</div>',
				'<div class="x-tree-col-text x-tree-col-div-general">',txt, '</div>', (n.bfooter ? '<div class="x-tree-node-bfooter x-tree-col-div-general">' + n.bfooter + '</div>': '<span></span>'), '</div></div>'];
				
				 for(var i = 1, len = cols.length; i < len; i++){
             		c = cols[i];

            		 buf.push('<div class="x-tree-col ',(c.cls?c.cls:''),'" style="width:',c.width-bw- t.scrollOffset,'px;">',
                       // '<div class="x-tree-col-text">','blah'(c.renderer ? c.renderer(a[c.dataIndex], n, a) : a[c.dataIndex]),"</div>",
					    ( (n.columns && n.columns[i]) ? '<div class="x-tree-col-text">' + n.columns.text + '</div>':''), 
					    (c.links ? '<div class="x-tree-col-text">' + linksBuf + "</div>":''),"</div>");
         		}
				  buf.push(
            	'<div class="x-clear"></div></div>',
            	'<ul class="x-tree-node-ct" style="display:none;"></ul>',
            	"</li>");
			
				var nel;
				 if(bulkRender !== true && n.nextSibling && n.nextSibling.ui.getEl()){
           			 this.wrap = Ext.DomHelper.insertHtml("beforeBegin",
                                n.nextSibling.ui.getEl(), buf.join(''));
        		}else{
          			  this.wrap = Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf.join(""));
       			 }
				
				this.elNode = this.wrap.childNodes[0];
				this.ctNode = this.wrap.childNodes[1];
				this.columnNodes = this.elNode.childNodes;
				var cs = this.elNode.firstChild.childNodes;
				this.indentNode = cs[0];
				this.ecNode = cs[1];
				this.iconNode = cs[2];
				this.bodyNode = cs[3];
				this.titleNode = cs[3].firstChild;
				this.bHeaderNode = this.titleNode.nextSibling;
				this.anchor = this.textNode = this.bHeaderNode.nextSibling;
				this.bFooterNode = this.textNode.nextSibling;
				
			}
		});
		


/**
		 * ColumnTreeNode extends regular treenode and provides
		 * separate fields for title, header, body, and footer information per node
		 * @class lore.anno.ui.ColumnTreeNode
		 * @extends Ext.tree.TreeNode
		 */
		lore.anno.ui.AnnoColumnTree = Ext.extend(lore.anno.ui.ColumnTree, {
		
		initComponent: function(){
      	  	try {
				Ext.apply(this, {
					animate    	: true,
		          	autoScroll	: true,
					rootVisible: false,
					containerScroll: true,
					split: true,
					border: false,
					pathSeparator: " ",
					root: new Ext.tree.TreeNode({
						'draggable': false
					}),
					columns		: [{
								'header': "Annotations",
								'width': 280
								}, {
								'header': "Views",
								'width': 80,
								'links':true
								}],
			header: true,
			dropConfig: {
				appendOnly: true
			},
			bbar: { xtype: 'toolbar', //TODO: Turn this into a separate class
				items: [ 
				{
					xtype: "combo",
					id: "sorttypecombo",
					name: 'sorttypecombo',
					hiddenName: 'sorttypecombo',
					store: new Ext.data.SimpleStore({
						fields: ['type', 'typename', 'direction'],
						data: [['title', 'Title(Ascending)','asc'], ['title','Title(Descending)','desc'],
							   ['creator', 'Creator(Ascending)', 'asc'], ['creator', 'Creator(Descending)', 'desc'],
							   ['created', 'Creation Date(Ascending)','asc'], ['created', 'Creation Date(Descending)', 'desc'],
							   ['modified','Modified Date(Ascending)', 'asc' ],['modified','Modified Date(Descending)', 'desc' ],
							   ['type', 'Type(Ascending)', 'asc'],['type', 'Type(Descending)','desc']]
					}),
					valueField: 'type',
					displayField: 'typename',
					typeAhead: true,
					emptyText: "Sort by...",
					triggerAction: 'all',
					mode: 'local',
					forceSelection: true,
					selectOnFocus: true
				},
				/*{
					xtype: 'button',
					id: 'gleanrdfbtn',
					iconCls: 'rdficon',
					tooltip: 'Extract rdfa from the page',
					handler : function (){
						try {
							lore.anno.ui.gleanRDFa();
							if (lore.anno.ui.rdfa && (lore.anno.ui.rdfa.work || lore.anno.ui.rdfa.agent)) {
								lore.anno.ui.loreInfo("RDFa extracted from current page.");
							}
						} catch (e) {
							lore.debug.anno(e,e);
						}
	        		}
				}*/
			]	
		},
				});
				lore.anno.ui.AnnoColumnTree.superclass.initComponent.apply(this, arguments);
			} catch(e){
				lore.debug.anno("AnnoColumnTree:initComponent() - " + e, e);
			}
		},
		});
		
		lore.anno.ui.handleSortTypeChange = function (combo, rec, index) {
			//lore.anno.ui.addTreeSorter(rec.data.type, rec.data.direction);
			
			lore.anno.ui.treesorter.sortField = rec.data.type;
			lore.anno.ui.treesorter.direction  = rec.data.direction;
			try {
				lore.anno.ui.updateUIOnRefresh(lore.anno.annods);
			} catch (e ) {
				lore.debug.anno("Error occurred changing sort type: " + e,e);
			}
		}
		
		lore.anno.ui.addTreeSorter = function(field, direction){
			var tree = 	Ext.getCmp("annosourcestree");
			lore.anno.ui.treesorter = {};
			lore.anno.ui.treesorter.sortField  = field;
			lore.anno.ui.treesorter.direction = direction;
			
			// taken from TreeSorter Ext, and modified so that
			// direction can be dynamically changed
			var sortType =  function(node){
					try {
						var r = lore.global.util.findRecordById(lore.anno.annods, lore.anno.ui.recIdForNode(node));
						if (r) {
							return r.data[lore.anno.ui.treesorter.sortField] || r.data.created;
						}
					} 
					catch (e) {
						lore.debug.anno(e, e);
					}
					return "";
				}
				
			var sortFn = function(n1, n2){
       		 	if(n1.attributes["leaf"] && !n2.attributes["leaf"]){
	            	    return 1;
	          	  }
	           	 if(!n1.attributes["leaf"] && n2.attributes["leaf"]){
	           	     return -1;
	            }
      	  	
	    		var v1 = sortType(n1).toUpperCase();
	    		var v2 = sortType(n2).toUpperCase() ;
				var dsc = lore.anno.ui.treesorter.direction == 'desc';
	    		if(v1 < v2){
					return dsc ? +1 : -1;
				}else if(v1 > v2){
				return dsc ? -1 : +1;
	       		 }else{
		    		return 0;
	       	 	}
			 };
			 
			var doSort = function(node){
     		   node.sort(sortFn);
    		}
			var compareNodes = function(n1, n2){
        		return (n1.text.toUpperCase() > n2.text.toUpperCase() ? 1 : -1);
    		}
    
    		var updateSort  = function(tree, node){
        		if(node.childrenRendered){
            		doSort.defer(1, this, [node]);
        		}
    		}
			tree.on("beforechildrenrendered", doSort, this);
   			tree.on("append", updateSort, this);
    		tree.on("insert", updateSort, this);
    
	};
		
		 			 
				
					
/** Tree node for representing Compound objects 
 * @class lore.ore.ui.AnnoColumnTreeNode
 * @extends Ext.tree.TreeNode */
lore.anno.ui.AnnoColumnTreeNode = Ext.extend(lore.anno.ui.ColumnTreeNode,{
   constructor: function(config){
        this.config = config || {};
        /** 
         * @cfg {lore.ore.model.CompoundObjectSummary} The compound object represented by this tree node 
         * @property 
         * */
        this.model = config.model;
        this.initConfig(this.model);
        // listen for model property changes
		//TODO: move handeUpdateUI on handlers to here... yay!
        //this.model.on("propertiesChanged", this.handleModelPropertiesChanged, this);
        //this.addEvents('detailschange');
        lore.anno.ui.AnnoColumnTreeNode.superclass.constructor.call(this, this.config); 
   },
     /**
    * Set the intial config values for text, uri etc from the model object
    * @param {lore.ore.model.CompoundObjectSummary} coSummary Model object for this tree node
    */
   initConfig: function( model){
         /*tmpNode = new lore.anno.ui.AnnoColumnTreeNode ( {
					id: anno.id + nodeid,
					nodeType: anno.type,
					title: lore.anno.ui.getAnnoTitle(anno),
					text: anno.body || '',
					iconCls: iCls,
					uiProvider: lore.anno.ui.ColumnTreeNodeUI,
					// links: nodeLinks,
					qtip:  lore.anno.ui.genAnnotationCaption(anno, 't by c, d')
				});
				
				var args = {
					id: anno.id + nodeid,
					nodeType: anno.type,
					text: lore.anno.ui.genTreeNodeText(anno, store ),
					title: anno.title,
					bheader: lore.anno.ui.genAnnotationCaption(anno, 'by c, d r'),
					iconCls: iCls,
					uiProvider: lore.anno.ui.ColumnTreeNodeUI,
					links: nodeLinks,
					qtip: lore.anno.ui.genAnnotationCaption(anno, 't by c, d')
				};
				
				
				
        Ext.apply(this.config,{
            'iconCls'    : 'oreresult',
            'leaf'       : true,
            'draggable'  : true,
            'uiProvider' : Ext.ux.tree.MultilineTreeNodeUI,
            'text'       : coProps.title || "Untitled",
            'details'    : this.generateDetails(coProps),
            'uri'        : coProps.uri,
            'qtip'       : "Compound Object: " + coProps.uri
        });*/
   },
  });
  
					
				 
				
				
		
Ext.reg('columntreepanel', lore.anno.ui.ColumnTree);
Ext.reg('annocolumntreepanel', lore.anno.ui.AnnoColumnTree);


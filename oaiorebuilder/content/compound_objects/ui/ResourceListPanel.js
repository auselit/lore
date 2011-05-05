Ext.namespace("lore.ore.ui");

/**
 * @class lore.ore.ui.SummaryPanel Display the list of resources aggregated by the compound object and allow editing
 * @extends Ext.Panel
 */
lore.ore.ui.ResourceListPanel = Ext.extend(Ext.grid.GridPanel,{
    initComponent: function(){
    	try{
	    	this.defaultCM = new Ext.grid.ColumnModel([
	    	     new Ext.grid.RowNumberer(),
	  	         {header: 'Title', dataIndex: 'title', renderer: this.titleRenderFunction},
	  	         {header: 'URI', dataIndex:'uri'}    
	  	    ]);
	    	Ext.apply(this,{
	 		    columnLines : true,
	            autoScroll: true, 
	  		    header: false,
	   		    enableHdMenu: false,
	            store: new Ext.data.Store({}), 
	   		    ddGroup:'resgridDD',
	   		    enableDragDrop: true, 
	   		    keys: {
	   		    	key: [46,8],
	   		    	scope: this,
	   		    	fn: function(){
	   		    		var sel = this.getSelectionModel().getSelected();
	   		    		if (sel){
	   		    			lore.ore.controller.removeResource(sel.data.uri);
	   		    		} 
	   		    	}
	   		    },
	   		    sm: new Ext.grid.RowSelectionModel({
		   		    singleSelect:true,
		   		    listeners: {
		   		        'rowselect': function(sm,i,rec){    	
		   		        	try{  		        		
			   		            sm.grid.ddText = rec.data.title + " (" + rec.data.uri + ")";
			   		            lore.ore.controller.updateSelection(rec.data.uri, this.grid);
		   		        	} catch (e){
		   		        		lore.debug.ore("ResourceListPanel: row select",e);
		   		        	}
		   		        }
		   		    }
		   		}),
	   		    viewConfig: {
	                deferEmptyText: false,
		    		emptyText: 'Empty compound object',
		    		forceFit: true
	   		    }, 
	   		    colModel: this.defaultCM
	 	    });
	    	
	    	lore.ore.ui.ResourceListPanel.superclass.initComponent.call(this);
	    	
	    	this.on("activate", this.updateContent);  		     	    		   
	    	this.on("rowcontextmenu", this.showContextMenu,this);
            
            // enable autoscrolling of list during drag and drop
	    	this.on("render",function(){Ext.dd.ScrollManager.register(this.getView().getEditorParent())},this);
	    	this.on("beforedestroy",function(){Ext.dd.ScrollManager.unregister(this.getView().getEditorParent());},this);
    	} catch (e){
    		lore.debug.ore("ResourceListPanel: init",e);
    	}
    	
    	
    },
    titleRenderFunction: function(val, cell, rec){
      var props = rec.get('properties');
      var iconcls = "";
      if (props){
        if (rec.get('representsAnno')){
            iconcls = "annoicon";
        } else if (rec.get('representsCO')){
            iconcls = "oreicon";
        } else {
            var dc = lore.constants.NAMESPACES["dc"];
            var dctype = props.getProperty(dc+"type",0);
            iconcls = lore.ore.controller.lookupIcon((dctype? dctype: props.getProperty(dc+"format",0)),dctype);
        }
      }
      return "<ul><li" 
        + ((iconcls && iconcls != 'pageicon')? " class='remlisticon " + iconcls + "'" : "") 
        + "><span>" + (val? val : "Untitled Resource") + "</span></li></ul>";
      
            
    },
    /**
     * Sets the compound object
     * @param {} co The compound object model object
     */
    bindModel: function(){
    	if (this.model) {
            this.model.un("add", this.addResourceHandler,this);
            this.model.un("remove", this.removeResourceHandler,this);
        }
    	var currentCO = lore.ore.cache.getLoadedCompoundObject();
        var resstore = currentCO.aggregatedResourceStore;
        this.model = resstore;
    	this.reconfigure(resstore, this.defaultCM);
    	// make sure all loaded resources have an order index starting from 1, no gaps, no duplicates
    	// resources have already been sorted by the store according to their loaded order index values
    	var orderIndex = 1;
    	resstore.each(function (rec){
    		rec.set('index',orderIndex++);
    	});
    	// listen for add/remove events to reorder resources  
        this.model.on("add", this.addResourceHandler, this);
        this.model.on("remove", this.removeResourceHandler, this);
     },
     /** Update layout order index when resources are added  */
     addResourceHandler : function(store, records, idx){
    	 var last = store.getTotalCount();
		 // TODO: check that idx is correct (records should always be added at end)
    	 for (var j = 0; j < records.length; j++){
    		 records[j].set('index',idx + j + 1);
    		 records[j].commit();
    	 }
     },
     /** Update layout order index when a resource is removed */
     removeResourceHandler : function(store, record, idx){   	 
    	 var last = store.getTotalCount();
    	 if (idx != last){ // deleted item was not last in list     	  
             for (var j = idx; j <= (last - 1); j++){
          	   // update the orderIndex (add one as orderIndex starts from 1 not 0)
            	var r = store.getAt(j);
          	   	r.set('index',j + 1);
          	   	r.commit();   	    
             }
    	 }
     },
    /** Temporary function to update selection each time the panel is activated 
     * @param {} p The panel
     */
    updateContent : function (p) {
    	if (!p.ddrow) {
    		/* Supports resource re-ordering via drag and drop */
    		p.ddrow = new Ext.dd.DropTarget(p.getView().scroller.dom, {
	            ddGroup : 'resgridDD',             
	            copy: false,
	            notifyDrop : function(dd, e, data){
	            	try{
	                    var sm = p.getSelectionModel();
	                    var selrows = sm.getSelections();
	                    if(dd.getDragData(e)) {
	                          var cindex=dd.getDragData(e).rowIndex;
	                          if(typeof(cindex) != "undefined") {
	                        	  //sm.clearSelections();
	                        	  var rs = p.model;
	                        	  // This code handles multiple rows selected
	                        	  // but at present we only allow single selection
	                              for(i = 0; i <  selrows.length; i++) {               	  
	                            	  rs.remove(rs.getById(selrows[i].id));
	                            	  rs.insert(cindex,selrows[i]);
	                            	  // select the dragged resource
	                            	  if (i == 0){
	                            		  p.selectResource(selrows[i].id);
	                            	  }
	                              }          
	  	  	                     var startidx = Math.min(cindex, data.rowIndex);           
	  	  	                     var endidx = rs.getTotalCount() - 1;
	  	  	                     if (startidx != endidx){      	  
		  	  	                       for (var j = startidx; j <= endidx; j++){
		  	  	                    	   var r = rs.getAt(j);
		  	  	                    	   // update the orderIndex (add one as orderIndex starts from 1 not 0)
		  	  	                    	   r.set('index',j + 1); 
		  	  	                    	   r.commit();
		  	  	                       }
	  	  	                     } 
	  	  	                     
	                           }
	                    }
	            	} catch (e){
	            		lore.debug.ore("ResourceListPanel: notifyDrop",e);
	            	}
	        	 }
	          });
    	}
        try{
        	p.getSelectionModel().clearSelections();
        	var sfig = lore.ore.ui.graphicalEditor.getSelectedFigure();
        	if (sfig) {
        		p.selectResource(sfig.url);
        	}
        	// focus on the grid view to enable key navigation/deletion to work
        	if (p.getView().focusEl){
        		p.getView().focusEl.focus();
        	}
        } catch (e){
            lore.debug.ore("ResourceListPanel: updateContent",e);
        }
    },
    showContextMenu: function(grid, rowIndex, e){
    	try{
    	this.tmpurl = this.store.getAt(rowIndex).data.uri;
    	if (!this.contextmenu) {
            this.contextmenu = new Ext.menu.Menu({
                id : this.id + "-context-menu",
                showSeparator: false
            });
            this.contextmenu.add({
                text: "Copy URI to clipboard",
                icon: "chrome://lore/skin/icons/page_white_paste.png",
                scope: this,
                handler: function(evt){
                	lore.global.util.copyToClip(this.tmpurl);
					lore.ore.ui.vp.info("URI copied to clipboard: " + this.tmpurl);
                }
             });
            
        	this.contextmenu.add({
                text: "Show in browser",
                icon: "chrome://lore/skin/icons/page_go.png",
                scope: this,
                handler: function(evt){
                	lore.global.util.launchTab(this.tmpurl, window);
                }
             });
    		
            this.contextmenu.add({
            	text: "Delete resource from Compound Object",
            	icon: "chrome://lore/skin/icons/delete.png",
                scope: this,
                handler: function(evt){
                	lore.ore.controller.removeResource(this.tmpurl);
                }
            });
            this.contextmenu.add("-");
            this.contextmenu.add({
                text: "Show in Graphical Editor",
                icon: "chrome://lore/skin/icons/layout_pencil.png",
                scope: this,
                handler: function(evt){
                	lore.ore.ui.graphicalEditor.showResource(this.tmpurl);			
                }
            });
            this.contextmenu.add({
                text: "Show in Details view",
                icon: "chrome://lore/skin/icons/application_view_detail.png",
                scope: this,
                handler: function(evt){
                	Ext.getCmp("remdetailsview").showResource(this.tmpurl);				
                }
            });
            this.contextmenu.add({
                text: "Show in Slideshow view",
                icon: "chrome://lore/skin/icons/picture_empty.png",
                scope: this,
                handler: function(evt){			
					Ext.getCmp("newss").showResource(this.tmpurl);
                }
            });
            this.contextmenu.add({
                text: "Show in Explore view",
                icon: "chrome://lore/skin/icons/network.png",
                scope: this,
                handler: function(evt){
                    var title = this.tmpurl;
                    var propR = lore.ore.cache.getLoadedCompoundObject().getAggregatedResource(this.tmpurl);
                    if (propR) {
                        title = propR.get('properties').getTitle() || title;
                    }
                    var isCO = propR.get('representsCO');
					
					lore.ore.explorePanel.showInExploreView(this.tmpurl, title, isCO);
                }
            });
            
    	}
    	this.contextmenu.showAt(e.xy);
        e.stopEvent();
        return false;
    	} catch (ex){
    		lore.debug.ore("ResourceListPanel: showContextMenu",ex);
    	}
    },
    showResource : function(uri){
    	Ext.getCmp("loreviews").activate(this.id);
    	this.selectResource(uri);
    },
    selectResource: function(uri){
    	try{
    		var sm = this.getSelectionModel();
    		if (!uri){
    			sm.clearSelections();
    		} else {
    			var idx = this.store.findExact('uri',uri);
    			var rec = this.store.getAt(idx);
    			var selrec = sm.getSelected();
				if (rec && (selrec != rec)){
					sm.selectRow(idx);
				} 
    		}
    	} catch (e){
    		lore.debug.ore("ResourceListPanel: selectResource " + uri,e);
    	}
    }
});
Ext.reg('resourcepanel',lore.ore.ui.ResourceListPanel);
Ext.namespace("lore.ore.ui");

/**
 * @class lore.ore.ui.SummaryPanel Display a text-based summary of the entire compound object
 * @extends Ext.Panel
 */
lore.ore.ui.ResourceListPanel = Ext.extend(Ext.grid.GridPanel,{ 
    initComponent: function(){
    	try{
    	this.defaultCM = new Ext.grid.ColumnModel([
    	     new Ext.grid.RowNumberer(),
  	         {header: 'Title', dataIndex: 'title'},
  	         {header: 'URI', dataIndex:'uri'}    
  	    ]);
    	Ext.apply(this,{
 		    columnLines : true,
            autoScroll: true, 
  		    header: false,
   		    enableHdMenu: false,
            store: new Ext.data.Store({}), 
   		    ddGroup:'resgridDD',
   		    // enableDragDrop: true, 
   		    sm: new Ext.grid.RowSelectionModel({
	   		    singleSelect:true,
	   		    listeners: {
	   		        'rowselect': function(sm,i,rec){    	
	   		        	try{  		        		
		   		            sm.grid.ddText = rec.data.title + " (" + rec.data.uri + ")";
		   		            lore.ore.controller.updateSelection(rec.data.uri, this.grid);
	   		        	} catch (e){
	   		        		lore.debug.ore("problem in row select",e);
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

    	} catch (e){
    		lore.debug.ore("problem",e);
    	}
    	
    	
    },
    /** Temporary function to regenerate content each time the panel is activated 
     * @param {} p The panel
     */
    updateContent : function (p) {
        try{
        	// TODO: check whether compound object has changed
        	p.getSelectionModel().clearSelections();
        	// temporarily reload entire store until MVC complete
        	var currentCO = lore.ore.cache.getLoadedCompoundObject();
            var currentREM = currentCO.uri;
            var coContents = currentCO.serialize('rdfquery');
            var tmpCO = new lore.ore.model.CompoundObject();
            tmpCO.load({format: 'rdfquery',content: coContents});
            
        	//var resstore = lore.ore.cache.getLoadedCompoundObject().aggregatedResourceStore;
            var resstore = tmpCO.aggregatedResourceStore;
            
        	p.reconfigure(resstore, this.defaultCM);
        	var ddrow = new Ext.dd.DropTarget(p.getView().scroller.dom, {
                ddGroup : 'resgridDD',             
                copy: false,
                notifyDrop : function(dd, e, data){
                	try{
	                    var sm = p.getSelectionModel();
	                    var rows = sm.getSelections();
	                    if(dd.getDragData(e)) {
	                          var cindex=dd.getDragData(e).rowIndex;
	                          if(typeof(cindex) != "undefined") {
	                              for(i = 0; i <  rows.length; i++) {
	                            	  resstore.remove(resstore.getById(rows[i].id));
	                            	  resstore.insert(cindex,rows[i]);
	                              }
	                              sm.clearSelections();
	                              // force row numbering to update
	  	  	                      p.getView().refresh();
	                           }
	                    }
	                    
                	} catch (e){
                		lore.debug.ore("problem",e);
                	}
            	 }
              });
        	// TODO: remove this once MVC is working correctly
        	var sfig = lore.ore.ui.graphicalEditor.getSelectedFigure();
        	if (sfig) {
        		p.selectResource(sfig.url);
        	}
        	/*
            Ext.MessageBox.show({
                   msg: 'Generating Summary',
                   width:250,
                   defaultTextHeight: 0,
                   closable: false,
                   cls: 'co-load-msg'
            });
            
            // TODO:  should listen to model and this should not be regenerated each time
            var currentCO = lore.ore.cache.getLoadedCompoundObject();
            var coContents = currentCO.serialize('rdfquery');
            // preload all nested compound objects to cache
            lore.ore.cache.cacheNested(coContents, 0);
            var tmpCO = new lore.ore.model.CompoundObject();
            tmpCO.load({format: 'rdfquery',content: coContents});
            p.loadContent(tmpCO);
            Ext.Msg.hide();
            */
        } catch (e){
            lore.debug.ore("problem showing resource list",e);
        }
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
    		lore.debug.ore("Problem selecting resource " + uri,e);
    	}
    },
    // TODO: listen to model rather than updating entire view each time, replace with re-orderable tree
    /** Displays a list of the resource URIs aggregated by the compound object 
      */
    loadContent : function (compoundObject){
        var tocsummary = "<div style='padding-top:1em'><p><b>List of resources:</b></p><ul>";
        var allfigures = lore.ore.ui.graphicalEditor.coGraph.getFiguresSorted();
        for (var i = 0; i < allfigures.length; i++) {
            var fig = allfigures[i];
            if (fig instanceof lore.ore.ui.graph.ResourceFigure){
                var figurl = lore.global.util.escapeHTML(fig.url);
                var title = fig.getProperty("dc:title_0") 
                    || fig.getProperty("dcterms:title_0") 
                    || "Untitled Resource";
                tocsummary += "<li>";
                
                var isCompObject = (fig.getProperty("rdf:type_0") == lore.constants.RESOURCE_MAP);
                if (isCompObject){
                    tocsummary += "<a title='Open in LORE' href='#' onclick='lore.ore.controller.loadCompoundObjectFromURL(\"" + figurl + "\");'><img style='padding-right:5px' src='chrome://lore/skin/oaioreicon-sm.png'></a>";
                }
                tocsummary += Ext.util.Format.htmlEncode(title) + ": &lt;"
                + (!isCompObject?"<a onclick='lore.global.util.launchTab(\"" + figurl + "\");' href='#'>" 
                + figurl + "</a>" : figurl) + "&gt;";
                tocsummary += " <a href='#' title='Show in graphical editor' onclick='lore.ore.ui.graphicalEditor.scrollToFigure(\"" + figurl +"\");'><img src='chrome://lore/skin/icons/graph_go.png' alt='View in graphical editor'></a>";
                tocsummary += " <a href='#' title='Show in slideshow view' onclick='Ext.getCmp(\"loreviews\").activate(\"remslideview\");Ext.getCmp(\"newss\").setActiveItem(\"" + figurl + "_" + lore.ore.cache.getLoadedCompoundObjectUri() + "\");'><img src='chrome://lore/skin/icons/picture_empty.png' alt='View in slideshow view'></a>";
                tocsummary += " <a href='#' title='Show in explore view' onclick='try{Ext.getCmp(\"loreviews\").activate(\"remexploreview\");lore.ore.explorePanel.showInExploreView(\"" + figurl + "\",\"" + title.replace(/'/g,'\\\'') + "\"," + isCompObject+ ");}catch(e){lore.debug.ore(\"problem\",e);}'><img src='chrome://lore/skin/icons/chart_line.png' alt='View in explore view'></a>";
                tocsummary += "</li>";
            }
        }
        tocsummary += "</ul></div>";
        this.body.update(tocsummary);
    }
});
Ext.reg('resourcepanel',lore.ore.ui.ResourceListPanel);
/**
 * @class lore.ore.ui.GraphicalEditor Panel that provides the graphical editor for compound objects
 * @extends Ext.Panel
 */
lore.ore.ui.GraphicalEditor = Ext.extend(Ext.Panel,{ 
   constructor: function (config){
        config = config || {};
        config.autoHeight = true;
        config.autoWidth = true;
        config.bodyStyle = { backgroundColor : 'transparent' };
        lore.ore.ui.GraphicalEditor.superclass.constructor.call(this, config);

        /** Default width of new nodes in graphical editor 
          * @const */
        this.NODE_WIDTH   = 220;
        /** Default height of new nodes in graphical editor 
         * @const */
        this.NODE_HEIGHT  = 170;
        /** Default spacing between new nodes in graphical editor 
         * @const */
        this.NODE_SPACING = 40;
        /** Used for layout in graphical editor - Maximum width before nodes are positioned on new row 
         * @const */
        this.ROW_WIDTH        = 400;
        /** Used for layout of new nodes */
        this.dummylayoutx = this.NODE_SPACING;
        /** Used for layout of new nodes */
        this.dummylayouty = this.NODE_SPACING;
         /** Used to lookup figures by their URIs in the graphical editor */
        this.lookup = {};
        this.readOnly = false;
        this.isDirty = false;
   },
   /** bindModel, update listeners */
   bindModel: function(co){
        // TODO: listen to store events not custom events?
        if (this.model) {
            //panel.removeAll();
            this.model.un("addAggregatedResource", this.onAddResource,this);
            this.model.un("removeAggregatedResource", this.onRemoveResource,this);
        }
        this.model = co;
        //this.loadContent(this.model);
        this.model.on("addAggregatedResource", this.onAddResource, this);
        this.model.on("removeAggregatedResource", this.onRemoveResource, this);
        
   },
   /** Initialize the graphical editor */
   initGraph: function(){
    try{
    	this.isDirty = false;
        Ext.getCmp("loreviews").activate("drawingarea");
        this.dummylayoutx = this.NODE_SPACING;
        this.dummylayouty = this.NODE_SPACING;
        this.lookup = {};
        
        var coGraph = this.coGraph;
        if (coGraph) {
            coGraph.getCommandStack().removeCommandStackEventListener(this); 
            coGraph.removeSelectionListener(this);
            coGraph.clear();
        } else {
            coGraph = new lore.ore.ui.graph.COGraph(this.id);
            this.coGraph = coGraph;
            coGraph.setScrollArea(document.getElementById(this.id).parentNode);
            
            // create drop target for dropping new nodes onto editor from the compound objects dataview
            var droptarget = new Ext.dd.DropTarget(this.id, {
                    'ddGroup' : 'coDD',
                    'copy' : false
            });
            droptarget.notifyDrop = function(dd, e, data) {
                //lore.debug.ore("notifydrop codd",data);
                var ge = lore.ore.ui.graphicalEditor;
                var coGraph = ge.coGraph;
                var figopts = {
                    url : data.draggedRecord.data.uri,
                    x : (e.xy[0] - coGraph.getAbsoluteX() + coGraph.getScrollLeft()),
                    y : (e.xy[1] - coGraph.getAbsoluteY() + coGraph.getScrollTop()),
                    props : {
                        "rdf:type_0" : lore.constants.RESOURCE_MAP,
                        "dc:title_0" : data.draggedRecord.data.title
                    }
                };
                ge.addFigure(figopts);
                
                return true;
            };
        }
        coGraph.addSelectionListener(this);
        coGraph.getCommandStack().addCommandStackEventListener(this);
        
    // clear the node properties
    if (lore.ore.ui.nodegrid) {
        lore.ore.ui.grid.expand();
        lore.ore.ui.nodegrid.store.removeAll();
        lore.ore.ui.nodegrid.collapse();
        lore.ore.ui.relsgrid.store.removeAll();
        lore.ore.ui.relsgrid.collapse();
    }
    
    } catch (e) {
        lore.debug.ore("GraphicalEditor: initGraph",e);
    }
   },
   /**
    * Updates the views when nodes or connections are selected
    * @param {draw2d.Figure} figure ResourceFigure or ContextmenuConnection that was selected
    */
   onSelectionChanged : function(figure) {
        //lore.debug.ore("selected figure is",figure);
	   	lore.ore.controller.updateSelection(figure, this);
        if (figure != null) {
            // raise tab first so that properties are rendered and column widths get sized correctly for resource/rels
            Ext.getCmp("propertytabs").activate("properties");
            if (figure.model && figure.model.data && figure.model.data.properties){
                lore.ore.ui.nodegrid.bindModel(figure.model.data.properties);
            }
            lore.ore.ui.nodegrid.store.removeAll();
            if (figure.metadataproperties) {
                for (p in figure.metadataproperties){
                    var pname = p;
                    var pidx = p.indexOf("_");
                    if (pidx != -1){
                        pname = p.substring(0,pidx);
                    } 
                    lore.ore.ui.nodegrid.store.loadData([{id: p, name: pname, value: figure.metadataproperties[p]}],true);
                }
                // get connections
                var relationshipsData = [];
                var ports = figure.getPorts(); 
                for (var port = 0; port < ports.getSize(); port++){
                    var connections = ports.get(port).getConnections();
                    for (var j = 0; j < connections.getSize(); j++) {
                        var theconnector = connections.get(j);
                        var dir;
                       
                        var sp = theconnector.sourcePort.parentNode;
                        var tp = theconnector.targetPort.parentNode;
                        if (figure.url == sp.url){
                            dir = "from";
                        } else {
                            // incoming connection
                            dir = "to";
                        }
                        if (theconnector.symmetric) {
                            dir = "with";
                        }
                        var toURI = tp.url;
                        var toTitle = tp.getProperty("dc:title_0") || tp.url;
                        var fromURI = sp.url;
                        var fromTitle = sp.getProperty("dc:title_0") || sp.url;
                        var relpred = theconnector.edgetype;
                        var relns = theconnector.edgens;
                        var relpfx = lore.constants.nsprefix(relns);
                        relationshipsData.push({
                            id: theconnector.id, 
                            relName: relpred, 
                            relNS: relns,
                            relPrefix: relpfx,
                            fromURI: fromURI,
                            fromTitle: fromTitle,
                            toURI: toURI, 
                            direction: dir, 
                            toTitle: toTitle});
                    }
                }
                lore.ore.ui.relsgrid.store.loadData(relationshipsData);
                // Resource and relationships grid will be visible
                lore.ore.ui.nodegrid.expand();
            }
            else if (figure.edgetype) {
                var tp = figure.targetPort.parentNode;
                var sp = figure.sourcePort.parentNode;
                lore.ore.ui.relsgrid.store.loadData([
                   {id: figure.id, 
                    relName: figure.edgetype,
                    relNS: figure.edgens,
                    relPrefix: lore.constants.nsprefix(figure.edgens),
                    toURI: tp.url,
                    toTitle: tp.getProperty("dc:title_0") || tp.url,
                    fromURI: sp.url,
                    fromTitle: sp.getProperty("dc:title_0") || sp.url,
                    direction: ''}
                   
                ]);
                lore.ore.ui.relsgrid.getSelectionModel().selectFirstRow();
                // Connection: only show relationships grid
                lore.ore.ui.nodegrid.store.removeAll();
                lore.ore.ui.nodegrid.collapse();
               
            }
            lore.ore.ui.relsgrid.expand();
            lore.ore.ui.grid.collapse();
        } else {
            lore.ore.ui.nodegrid.store.removeAll();
            lore.ore.ui.relsgrid.store.removeAll();
            // Background selected: only show compound object properties
            lore.ore.ui.relsgrid.collapse();
            lore.ore.ui.grid.expand();
            //FIXME: gets out of sync when new node is added 
            //lore.ore.ui.nodegrid.collapse();
        }
   },
   /**
     * Respond to move, delete, undo and redo commands in the graphical editor
     * @param {} event
     */
    stackChanged : function(event) {
    	this.isDirty  = true;
        var details = event.getDetails(); // indicates whether post execute, undo or redo
        var comm = event.getCommand();
        var commList;
        // handle a group of commands eg auto layout, multi-select delete etc
        if (comm instanceof lore.ore.ui.graph.CommandGroup){
        	commList = comm.commands;
        } else {
        	commList = [comm];
        }
        for (var i=0; i < commList.length; i++){
        	comm = commList[i];
	        var comm_fig = comm.figure;
	        // don't allow figures to be moved outside bounds of canvas
	        if (comm instanceof draw2d.CommandMove && (comm.newX < 0 || comm.newY < 0)) {
	            comm.undo();
	        }
	        
	        if (comm_fig instanceof lore.ore.ui.graph.ResourceFigure) {
	            // reset dummy graph layout position to prevent new nodes being added too far from content
	            if (comm instanceof draw2d.CommandMove  && comm.oldX == this.dummylayoutprevx 
	                && comm.oldY == this.dummylayoutprevy) {   
	                    this.nextXY(comm.newX, comm.newY);
	            }
	            // remove the url from lookup if node is deleted, add it back if it is undone
	            // update address bar add icon to reflect whether current URL is in compound object
	            if (0!=(details&(draw2d.CommandStack.POST_EXECUTE))) {
	                if (comm instanceof draw2d.CommandDelete) {
	                	try{
	                		this.model.removeAggregatedResource(comm_fig.url);
	                	} catch (x){
	                		lore.debug.ore("problem",x);
	                	}
	                    delete this.lookup[comm_fig.url];
	                    if (lore.ore.ui.topView && lore.ore.controller.currentURL == comm_fig.url){
	                           lore.ore.ui.topView.hideAddIcon(false);
	                    }
	                } else if (comm instanceof draw2d.CommandAdd) {
	                    if (lore.ore.ui.topView && lore.ore.controller.currentURL == comm_fig.url){
	                           lore.ore.ui.topView.hideAddIcon(true);
	                    }
	                }
	            }
	            else if ((0!=(details&(draw2d.CommandStack.POST_UNDO)) && comm instanceof draw2d.CommandDelete)
	                || (0!=(details&(draw2d.CommandStack.POST_REDO)) && comm instanceof draw2d.CommandAdd)) {
	                //  check that URI isn't in resource map (eg another node's resource may have been changed)
	                
	                if (this.lookup[comm_fig.url]){
	                    if (comm instanceof draw2d.CommandDelete) {
	                        lore.ore.ui.vp.warning("Cannot undo deletion: resource is aleady in Compound Object");
	                        comm.redo();
	                    } else {
	                        lore.ore.ui.vp.warning("Cannot redo addition: resource is aleady in Compound Object");
	                        comm.undo();
	                    }
	                }
	                this.lookup[comm_fig.url] = comm_fig.getId();
	                if (lore.ore.ui.topView && lore.ore.controller.currentURL == comm_fig.url){
	                   lore.ore.ui.topView.hideAddIcon(true);
	                }       
	                this.model.addAggregatedResource(comm_fig.model);
	           } 
	             
	            else if ((0!=(details&(draw2d.CommandStack.POST_REDO)) && comm instanceof draw2d.CommandDelete)
	             || (0!=(details&(draw2d.CommandStack.POST_UNDO)) && comm instanceof draw2d.CommandAdd)) {
                    try{
                        this.model.removeAggregatedResource(comm_fig.url);
                    } catch (x){
                        lore.debug.ore("problem",x);
                    }
	                delete this.lookup[comm_fig.url];
	                if (lore.ore.ui.topView && lore.ore.controller.currentURL == comm_fig.url){
	                       lore.ore.ui.topView.hideAddIcon(false);
	                }
	                
	            }
	        }
        }
   },
   /** returns the figure that is currently selected */
   getSelectedFigure : function (){    
        return this.coGraph.getCurrentSelection();
   },
   /** select a figure that represents a resource, scrolling it into view
     * @param {} theURL
     */
   showResource : function(uri){
        Ext.getCmp("loreviews").activate(this.id);
        var fig = this.lookupFigure(uri);
        if (fig) {
            this.coGraph.setCurrentSelection(fig);
            fig.header.style.backgroundColor="yellow";
            setTimeout(function(theFig) {theFig.header.style.backgroundColor = "#e5e5e5";}, 3200, fig);
            this.coGraph.showMask();
            this.coGraph.scrollTo(fig.x, fig.y);
            this.coGraph.hideMask();
        }
   },
   /** Select a figure without activating view or scrolling */
   selectFigure: function(uri){
	   var fig = this.lookupFigure(uri);
	   this.coGraph.setCurrentSelection(fig);
   },
   /** respond to model event: add figure to represent resource */
   onAddResource : function(res){
     lore.debug.ore("onAddResource",res);
   },
   /** respond to model event: remove figure when resource is removed from compound object */
   onRemoveResource : function(res){
     lore.debug.ore("onRemoveResource",res);
   },
   /** load compound object from model object into graphical editor */
   loadContent: function(co){
    
   },
   removeFigure : function(uri){
	    try{
	        var fig = this.lookupFigure(uri);
	        this.coGraph.getCommandStack().execute(fig.createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.DELETE)));
	    } catch (e){
	        lore.debug.ore("removeFigure",e);
	    }
   },
   /**
    * Add a figure to represent a resource to the graphical editor
    * @param {} theURL
    * @param {} opts The options
    * @return {}
    */
   addFigure : function(opts) {
        var fig = null;
        var theURL = lore.global.util.preEncode(opts.url);
        var figRepresentsCO = false;
        var figRepresentsAnno = false;
        opts.props = opts.props || {};
        if (!opts.x){
            opts.x = this.dummylayoutx;
        }
        if (!opts.y){
            opts.y = this.dummylayouty;
        }
        var title = opts.props["dc:title_0"] || opts.props["dcterms:title_0"];
        if (!opts.batch && !title){ 
        	this.isDirty = true;
            // dodgy way of determining if this is a new node
            try{
            // Try getting the page title from the browser history: 
            // getting it from the history avoids any problems with 
            // waiting for the document to be loaded
            // FIXME: this should be in history manager
            var globalHistory = Components.classes["@mozilla.org/browser/global-history;2"].
                        getService(Components.interfaces.nsIGlobalHistory2);
            title  = globalHistory.getPageTitle(Components.classes["@mozilla.org/network/io-service;1"].
                getService(Components.interfaces.nsIIOService).
                newURI(theURL, null, null));
            opts.props["dc:title_0"] = title;
            } catch (e) {
                lore.debug.ore("Error getting title from history",e);
            }
        }
        if (theURL && !this.lookup[theURL]) {
            var theProps = opts.props;
            if (opts.format){
                theProps["dc:format_0"] = opts.format;
            }
            if (opts.rdftype){
                theProps["rdf:type_0"] = opts.rdftype;
                if (opts.rdftype == lore.constants.RESOURCE_MAP){
                    figRepresentsCO = true;
                } else if (opts.rdftype.match(lore.constants.NAMESPACES["annotype"]) 
                            || opts.rdftype.match(lore.constants.NAMESPACES["vanno"]) 
                            || opts.rdftype.match(lore.constants.NAMESPACES["annoreply"])){
                    figRepresentsAnno = true;
                }
            }
            fig = new lore.ore.ui.graph.ResourceFigure(theProps);
            
            if (opts.oh) {
               fig.originalHeight = opts.oh;
            }
            if (opts.w && opts.h){
                fig.setDimension(opts.w, opts.h);    
            } 
            if (opts.sx && opts.sy) {
                fig.scrollx = opts.sx;
                fig.scrolly = opts.sy;
            }
            if (opts.order){
            	fig.orderIndex = opts.order;
            }
            if (opts.abstractPreview == 1){
            	fig.abstractPreview = true;
            }
            fig.setContent(theURL);
           
            if (opts.batch){
                this.coGraph.addFigure(fig, opts.x, opts.y);
            } else {
                var figProps = new lore.ore.model.ResourceProperties();
                // TODO: add properties to figProps object
                this.model.addAggregatedResource({
                        uri: theURL,
                        title: title,
                        representsCO: figRepresentsCO,
                        representsAnno: figRepresentsAnno,
                        properties: figProps
                });   
                // adds to undo stack
                this.coGraph.addResourceFigure(fig, opts.x, opts.y);
               // this is a new resource: create corresponding model object               
            }
            var resource = this.model.getAggregatedResource(theURL);
            if  (resource){
                fig.setModel(resource);
            }
            this.lookup[theURL] = fig.getId();
        } else {
            lore.ore.ui.vp.warning("Resource is already in the compound object: " + theURL);
        }
        if (fig){
            this.nextXY(opts.x,opts.y);
        }
        return fig;
    },
    /**
     * Get the figure that represents a resource
     * 
     * @param {} theURL The URL of the resource to be represented by the node
     * @return {} The figure representing the resource
     */
   lookupFigure : function(theURL) {
        var figid = this.lookup[theURL];
        return this.coGraph.getDocument().getFigure(figid);
   },
   
    /**
     * Updates variables used for layout
     * @param {} prevx
     * @param {} prevy
     */
    nextXY : function(prevx, prevy) {
        this.dummylayoutprevx = prevx;
        this.dummylayoutprevy = prevy;
        if (prevx > this.ROW_WIDTH) {
            this.dummylayoutx = 50;
            this.dummylayouty = prevy + this.NODE_HEIGHT + this.NODE_SPACING;
        } else {
            this.dummylayoutx = prevx + this.NODE_WIDTH + this.NODE_SPACING;
            this.dummylayouty = prevy;
        }
    }
    
});
Ext.reg('grapheditor',lore.ore.ui.GraphicalEditor);
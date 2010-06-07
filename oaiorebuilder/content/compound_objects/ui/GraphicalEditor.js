lore.ore.ui.GraphicalEditor = Ext.extend(Ext.Panel,{ 
   constructor: function (config){
        config = config || {};
        config.bodyStyle = { backgroundColor : 'transparent' }
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
            
   },
   initGraph: function(){
    try{
        this.dummylayoutx = this.NODE_SPACING;
        this.dummylayouty = this.NODE_SPACING;
        this.lookup = {};
        
        var coGraph = this.coGraph;
        if (coGraph) {
            coGraph.getCommandStack().removeCommandStackEventListener(this); 
            coGraph.removeSelectionListener(this);
            coGraph.clear();
        } else {
            coGraph = new lore.ore.ui.graph.COGraph("drawingarea");
            this.coGraph = coGraph;
            coGraph.scrollArea = document.getElementById("drawingarea").parentNode;
            
            // create drop target for dropping new nodes onto editor from the sources and search trees
            var droptarget = new Ext.dd.DropTarget("drawingarea", {
                    'ddGroup' : 'TreeDD',
                    'copy' : false
            });
            droptarget.notifyDrop = function(dd, e, data) {
                var ge = lore.ore.ui.graphicalEditor;
                var coGraph = ge.coGraph;
                var figopts = {
                    url : data.node.attributes.uri,
                    x : (e.xy[0] - coGraph.getAbsoluteX() + coGraph.getScrollLeft()),
                    y : (e.xy[1] - coGraph.getAbsoluteY() + coGraph.getScrollTop()),
                    props : {
                        "rdf:type_0" : lore.constants.RESOURCE_MAP,
                        "dc:title_0" : data.node.text
                    }
                };
                ge.addFigureWithOpts(figopts);
                return true;
            };
        }
        coGraph.addSelectionListener(this);
        coGraph.getCommandStack().addCommandStackEventListener(this);
    
    } catch (e) {
        lore.debug.ore("GraphicalEditor: initGraph",e);
    }
   },
   /**
    * Updates the views when nodes or connections are selected
    * @param {draw2d.Figure} figure ResourceFigure or ContextmenuConnection that was selected
    */
   onSelectionChanged : function(figure) {
        lore.debug.ore("ge selection changed",figure);
        if (figure != null) {
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
                Ext.getCmp("propertytabs").activate("properties");
                lore.ore.ui.nodegrid.expand();
            }
            else if (figure.edgetype) {
                lore.ore.ui.nodegrid.store.loadData([
                    {name:'relationship',id:'relationship',value:figure.edgetype},
                    {name: 'namespace', id: 'namespace', value:figure.edgens}
                ]);
                Ext.getCmp("propertytabs").activate("properties");
                lore.ore.ui.nodegrid.expand();
            }
        } else {
            lore.ore.ui.nodegrid.store.removeAll();
            lore.ore.ui.nodegrid.collapse();
        }
   },
   getSelectedFigure : function (){    
        return this.coGraph.getCurrentSelection();
   },
   /**
     * Respond to move, delete, undo and redo commands in the graphical editor
     * @param {} event
     */
    stackChanged : function(event) {
        lore.debug.ore("ge stack changed",event);
        var details = event.getDetails();
        var comm = event.getCommand();
        var comm_fig = comm.figure;
        lore.ore.ui.graph.modified = true;
        // reset dummy graph layout position to prevent new nodes being added too far from content
        if (comm instanceof draw2d.CommandMove  && comm.oldX == this.dummylayoutprevx 
            && comm.oldY == this.dummylayoutprevy) {   
                this.nextXY(comm.newX, comm.newY);
        }
        // don't allow figures to be moved outside bounds of canvas
        if (comm instanceof draw2d.CommandMove && (comm.newX < 0 || comm.newY < 0)) {
            comm.undo();
        }
        // remove the url from lookup if node is deleted, add it back if it is undone
        // update address bar add icon to reflect whether current URL is in compound object
        if (0!=(details&(draw2d.CommandStack.POST_EXECUTE))) {
            if (comm instanceof draw2d.CommandDelete) {
                delete this.lookup[comm_fig.url];
                if (lore.ore.ui.topView && lore.ore.ui.currentURL == comm_fig.url){
                       lore.ore.ui.topView.hideAddIcon(false);
                }
            } else if (comm instanceof draw2d.CommandAdd) {
                if (lore.ore.ui.topView && lore.ore.ui.currentURL == comm_fig.url){
                       lore.ore.ui.topView.hideAddIcon(true);
                }
            }
        }
        else if ((0!=(details&(draw2d.CommandStack.POST_UNDO)) && comm instanceof draw2d.CommandDelete)
            || (0!=(details&(draw2d.CommandStack.POST_REDO)) && comm instanceof draw2d.CommandAdd)) {
            //  check that URI isn't in resource map (eg another node's resource may have been changed)
            if (this.lookup[comm_fig.url]){
                if (comm instanceof draw2d.CommandDelete) {
                    lore.ore.ui.loreWarning("Cannot undo deletion: resource is aleady in Compound Object");
                    comm.redo();
                } else {
                    lore.ore.ui.loreWarning("Cannot redo addition: resource is aleady in Compound Object");
                    comm.undo();
                }
            }
            this.lookup[comm_fig.url] = comm_fig.getId();
            if (lore.ore.ui.topView && lore.ore.ui.currentURL == comm_fig.url){
               lore.ore.ui.topView.hideAddIcon(true);
            }       
       } 
         
        else if ((0!=(details&(draw2d.CommandStack.POST_REDO)) && comm instanceof draw2d.CommandDelete)
         || (0!=(details&(draw2d.CommandStack.POST_UNDO)) && comm instanceof draw2d.CommandAdd)) {
            delete this.lookup[comm_fig.url];
            if (lore.ore.ui.topView && lore.ore.ui.currentURL == comm_fig.url){
                   lore.ore.ui.topView.hideAddIcon(false);
            }
            
        }
   },
   /** scroll to the figure that represents the URL
     * @param {} theURL
     */
   scrollToFigure : function(theURL) {
        var fig = this.lookupFigure(theURL);
        if (fig) {
            Ext.getCmp("loreviews").activate("drawingarea");
            this.coGraph.scrollTo(fig.x, fig.y);
        }
   },
   /**
     * Add a node figure to the graphical view to represent a resource
     * 
     * @param {} theURL The URL of the resource to be represented by the node
     */
   addFigure : function(theURL,props) {
        lore.debug.ore("add figure props are",props);
        var fig = this.addFigureWithOpts({
            "url": lore.global.util.preEncode(theURL), 
            "x": this.dummylayoutx,
            "y": this.dummylayouty,
            "props": props
        });
        this.scrollToFigure(theURL);
        return fig;
   },
   /**
    * Add a node figure with options
    * @param {} theURL
    * @param {} opts The options
    * @return {}
    */
   addFigureWithOpts : function(opts) {
        var fig = null;
        var theURL = opts.url;
        opts.props = opts.props || {};
        if (!opts.loaded && !(opts.props["dc:title_0"] || opts.props["dcterms:title_0"])){ 
            // dodgy way of determining if this is a new CO
            try{
            // Try getting the page title from the browser history: 
            // getting it from the history avoids any problems with 
            // waiting for the document to be loaded
            var globalHistory = Components.classes["@mozilla.org/browser/global-history;2"].
                        getService(Components.interfaces.nsIGlobalHistory2);
            opts.props["dc:title_0"] = globalHistory.getPageTitle(Components.classes["@mozilla.org/network/io-service;1"].
                getService(Components.interfaces.nsIIOService).
                newURI(theURL, null, null));
            } catch (e) {
                lore.debug.ore("Error getting title from history",e);
            }
        }
        if (theURL && !this.lookup[theURL]) {
            fig = new lore.ore.ui.graph.ResourceFigure(opts.props);
            if (opts.oh) {
               fig.originalHeight = opts.oh;
            }
            if (opts.w && opts.h){
                fig.setDimension(opts.w, opts.h);    
            } 
            if (opts.sx && opts.sy) {
                fig.scrollx = parseInt(opts.sx);
                fig.scrolly = parseInt(opts.sy);
            }
            if (opts.format){
                fig.setProperty("dc:format_0",opts.format);
            }
            if (opts.rdftype){
                fig.setProperty("rdf:type_0",opts.rdftype);
            }
            fig.setContent(theURL);
            this.coGraph.addResourceFigure(fig, opts.x, opts.y);
            this.lookup[theURL] = fig.getId();
            /*
             * TODO: add to model
             * lore.ore.cache.getLoadedCompoundObject.addAggregatedResource(
                new lore.ore.model.Resource({uri: theURL}));
                */
            Ext.getCmp("loreviews").activate("drawingarea");
        } else {
            lore.ore.ui.loreWarning("Resource is already in the compound object: " + theURL);
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
        // TODO: Need a real graph layout algorithm
        this.dummylayoutprevx = prevx;
        this.dummylayoutprevy = prevy;
        if (prevx > this.ROW_WIDTH) {
            this.dummylayoutx = 50;
            this.dummylayouty = prevy + this.NODE_HEIGHT + this.NODE_SPACING;
        } else {
            this.dummylayoutx = prevx + this.NODE_WIDTH + this.NODE_SPACING;
            this.dummylayouty = prevy;
        }
    },
    /**
     *  Sort figures according to their x and y coordinates 
     **/
    figSortingFunction : function(figa,figb){        
        if (figa.y == figb.y)
            return figa.x > figb.x;
        else
            return figa.y > figb.y;
    }
});
Ext.reg('grapheditor',lore.ore.ui.GraphicalEditor);
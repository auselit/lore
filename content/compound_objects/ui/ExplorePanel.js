lore.ore.ui.ExplorePanel = Ext.extend(Ext.Panel,{ 
   constructor: function (config){
        config = config || {};
        config.autoScroll = true;
        config.forceLayout = true;
        this.html = "<a id='exploreReset' href='#' onclick='try{lore.ore.explorePanel.showInExploreView(lore.ore.cache.getLoadedCompoundObjectUri(),\"Current Compound Object\",true);}catch(e){lore.debug.ore(\"problem in reset\",e);}'>RESET VISUALISATION</a>"
            + "<div id='exploreHistory'></div>"
            + "<div id='infovis'></div>";
        lore.ore.ui.ExplorePanel.superclass.constructor.call(this, config);
        this.on("activate", this.updateContent);
        lore.ore.explorePanel = this;
   },
   initGraph : function(){
     if (this.canvas){
        // clear history
        Ext.get('exploreHistory').update("");
        // clear the labels and canvas
        for(var id in this.rg.fx.labels){
               this.rg.fx.disposeLabel(id);
               delete this.rg.fx.labels[id];
        } 
        this.canvas.clear();
        delete this.canvas;
      }
      var infovis = document.getElementById('infovis');
      infovis.innerHTML = "";
      var w = infovis.offsetWidth, h = infovis.offsetHeight;
      // create a new canvas
      /** The canvas used to render the explore visualization */
      this.canvas = new Canvas('explorecanvas', {
            'injectInto':'infovis',
            'width': w,
            'height':h
      });
      /** The JIT RGraph that provides the explore visualization */
        this.rg = rg=new RGraph(this.canvas,  {
            // Controller for rg graph 
            Node: {
               overridable: true,
               type: "square",
               color: "#ddd"
            },
            Edge: {
                overridable: true,
                lineWidth: 2,
                color: "#ddd"
            },
            clickedNode: {},
            /*onBeforePlotNode: function(node){
              if (node.data.type == "rem"){
                node.data["$type"] = "circle";
                node.data["$color"] = "orange";
                node.data["$dim"] = 6;
              }
            },*/
            /*onBeforePlotLine: function(adj) {
               if (adj.data["relType"] == "http://www.openarchives.org/ore/terms/ResourceMap"){
                   adj.data["$color"]="orange";
               } 
            },*/  
            requestGraph: function() {
                try{
                lore.ore.explorePanel.loadRem(this.clickedNode.id, this.clickedNode.name, (this.clickedNode.data["$type"]=='circle'), function(json) {
                    try{
                    lore.ore.explorePanel.rg.op.sum(json, {
                        'type': 'fade:con',
                        duration: 1500,
                        hideLabels: true,
                        onAfterCompute: function(){}
                    });
                    } catch (e){
                        lore.debug.ore("Problem in requestGraph",e);
                    }
                });
                } catch (e){
                    lore.debug.ore("problem in requestGraph",e);
                }
            },
            onCreateLabel: function(domElement, node) {
               lore.debug.ore("onCreateLabel",domElement);
               var d = Ext.get(domElement);
               d.update(node.name);
               d.setOpacity(0.8);
               d.on('mouseover', function() {d.setOpacity(1.0);});
               d.on('mouseout', function() {d.setOpacity(0.8);});
               d.on('click', function() {
                try{
                lore.ore.explorePanel.rg.onClick(node.id);
                } catch (e){
                    lore.debug.ore("Problem with onClick",e);
                }
               });
            },
            onPlaceLabel: function(domElement, node) {
                domElement.style.display = "none";
                 if(node._depth <= 2){
                    domElement.innerHTML = node.name.replace(/&amp;/g,'&');
                    domElement.style.display = "";
                    var left = parseInt(domElement.style.left);
                    domElement.style.width = '';
                    domElement.style.height = '';
                    var w = domElement.offsetWidth;
                    domElement.style.left = (left - w /2) + 'px';
                 }
            }, 
            onAfterCompute: function() {
                try{
                var node = Graph.Util.getClosestNodeToOrigin(lore.ore.explorePanel.rg.graph, "pos");
                this.clickedNode = node;
                var existhistory = Ext.get('exploreHistory').dom.innerHTML;
                var action = "lore.global.util.launchTab(\"" + node.id + "\", window);";
                var icon = "chrome://lore/skin/icons/page_go.png";
                var tooltip = "Show in browser";
                // stylesheet sets type to circle for compound objects
                if (node.data["$type"] == "circle"){
                    action = "lore.ore.readRDF(\"" + node.id + "\");";
                    icon = "chrome://lore/skin/oaioreicon-sm.png";
                    tooltip = "Load in LORE";
                }
                var nodelink = "<a title='" + tooltip + "' href='#' onclick='" + action 
                    + "'><img style='border:none' src='" + icon 
                    + "'></a>&nbsp;<a href='#' onclick=\"lore.ore.explorePanel.rg.onClick('" 
                    + node.id + "');\">" + node.name + "</a>";
                Ext.get('exploreHistory').update(nodelink + (existhistory? " &lt; " + existhistory : ""));
                lore.debug.ore("rg is ",lore.ore.explorePanel.rg);
                lore.debug.ore("this is",this);
                this.requestGraph();
                } catch (e){
                    lore.debug.ore("Problem in onAfterCompute",e);
                }
            }
        });
        lore.debug.ore("added contextmenu to infovis");
        
        if (this.body){
            this.mon(this.body, {
                scope: this,
                contextmenu: this.onContextMenu
            });
        }
    },
    onContextMenu : function (e){
        lore.debug.ore("ExplorePanel.onContextMenu: ",e);
        if (!this.contextmenu) {
            this.contextmenu = new Ext.menu.Menu({
                id : this.id + "-context-menu",
                showSeparator: false
            });
            this.contextmenu.add({
                    text : "Save diagram as image",
                    //iconCls: "delete-icon",
                    handler : function(evt) {
                        lore.debug.ore("save diagram as image",this);
                    }
                });
        }
        this.contextmenu.showAt(e.xy);
        e.stopEvent();
        return false;
    },
    /** Temporary function to regenerate content each time the panel is activated 
     * @param {} p The panel
     */
    updateContent : function (p) {
        var currentREM = lore.ore.cache.getLoadedCompoundObjectUri();
        if (this.exploreLoaded !== currentREM) {
            lore.debug.ore("updateContent: show in explore view", currentREM);
            this.exploreLoaded = currentREM;
            this.showInExploreView(currentREM, lore.ore.getPropertyValue("dc:title",lore.ore.ui.grid), true);
        } else {
            lore.debug.ore("refresh explore view");
            this.rg.refresh();
        }
        lore.ore.ui.loreInfo("Click on the nodes to explore connections between compound objects.");
    },
    /**
     * Gets resource map as RDF, transforms to JSON and applies function to it
     * @param {URI} id Identifier of the compound object to be retrieved
     * @param {String} title Used as a label for the compound object
     * @param {function} f Function to apply
     */
    loadRem : function(id, title, isCompoundObject, f){
        lore.debug.ore("loadRem " + title + " " + id);
        // get json from sparql query
        var json = lore.ore.reposAdapter.getExploreData(id,title,isCompoundObject);
        if (json){
                f(json);
        }
    },
    /** Initialize the explore view to display resources from the repository related to a compound object
     * @param {URI} id The URI of the compound object
     * @param {String} title Label to display for the compound object
     */
        showInExploreView : function (id, title, isCompoundObject){
            lore.debug.ore("show in explore view " + title);
            try{
        this.initGraph();
        this.loadRem(id, title, isCompoundObject, function(json){
            lore.ore.explorePanel.rg.loadJSON(json);
            lore.ore.explorePanel.rg.refresh();
            var existhistory = Ext.get('exploreHistory').dom.innerHTML;
            
            var action = "lore.global.util.launchTab(\"" + id + "\", window);";
            var icon = "chrome://lore/skin/icons/page_go.png";
            var tooltip = "Show in browser";
            // if it is a compound object use lore icon and open in lore instead of browser link
            if (isCompoundObject){
                action = "lore.ore.readRDF(\"" + id + "\");";
                icon = "chrome://lore/skin/oaioreicon-sm.png";
                tooltip = "Load in LORE";
            }
            var nodelink = "<a title='" + tooltip + "' href='#' onclick='" + action 
            + "'><img style='border:none' src='" + icon +"'>" 
            + "</a>&nbsp;<a href='#' onclick=\"try{lore.debug.ore('click history');lore.ore.explorePanel.rg.onClick('" 
            + id + "');}catch(e){lore.ore.debug('problem',e);}\">" + title + "</a>";
            Ext.get('exploreHistory').update(nodelink + (existhistory? " &lt; " + existhistory : ""));
        });  
            } catch (e){
                lore.debug.ore("problem in show in explore view",e);
            }
    }
});
Ext.reg('explorepanel',lore.ore.ui.ExplorePanel);
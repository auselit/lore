lore.ore.ui.ExplorePanel = Ext.extend(Ext.Panel,{ 
   constructor: function (config){ 
        this.hideLabels = false;
        Ext.apply(config, {
            layout: "border",
            items: [
                {
                    region: "center",
                    id: "exploreinfovis",
                    forceLayout: true,
                    html: "<div id='infovis'></div>"
                },
                {
                    region : "north",
                    split: true,
                    id: "exploreHistory",
                    collapseMode: "mini",
                    useSplitTips: true,
                    height: 28,
                    minHeight: 0,
                    bodyStyle: "vertical-align:middle;line-height: 2em;width:100%;text-align:right;overflow:hidden;font-size:smaller;color:#51666b;"
                    
                }
            ]
        })
        lore.ore.ui.ExplorePanel.superclass.constructor.call(this, config);
        this.getComponent(0).on("resize",function(c,adjw, adjh, raww, rawh){
           try{
              if (this.fd) {
                    var canv = this.fd.canvas;
                    var csize = canv.getSize();
                    var w = c.getWidth();
                    var h = c.getHeight();
                    // check if canvas is smaller than current window, if so, resize
    				// by an increment
                    if (csize.width < w || csize.height < h){
                        canv.resize(w + 300, h + 300);
                    } 
              }
           } catch (e){
              lore.debug.ore("problem",e);
           }
        },this);
        this.on("activate", this.updateContent);
        lore.ore.explorePanel = this;
        this.previewCanvas = document.createElement("canvas");
        this.colorKey = {
                    "http://purl.org/dc/elements/1.1/relation": "#E3E851",
                    "http://www.openarchives.org/ore/terms/aggregates": "#eeeeee"
        },
        this.ckTemplate = new Ext.Template("<li style='line-height:1.3em; padding:3px;'>&nbsp;<span style='border:1px solid black;background-color:{color};'>&nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;{rel}</li>",
            {compiled: true}
        );
        this.historyTemplate = new Ext.Template(
            "<span style='white-space:nowrap;'><a title='{tooltip}' href='#' onclick='{action}'><img style='border:none' src='{icon}'></a>&nbsp;{name}</a></span>",
            {compiled: true}
        );
        this.colorKeyWin = new Ext.Window({ 
                closable: true,
                closeAction: 'hide',
                animateTarget: 'remexploreview',
                width: 400,
                height: 200,
                autoScroll: true,
                title: "Explore View Color Key",
                html: "Color Key"
        });
   },
   initGraph : function(){
        lore.debug.ore("init explore view");
        Ext.getCmp("exploreHistory").body.update("");
      /** The JIT Graph that provides the explore visualization */
        this.fd = new $jit.ForceDirected({
            injectInto: 'infovis',
            width: 1200,
            height: 1200,
            Navigation: {
              enable: true,
              panning: 'avoid nodes',
              zooming: 10 
            },
            Node: {
               overridable: true,
               dim: 4,
               type: "square",
               color: "#ddd"
            },
            Edge: {
                overridable: true,
                lineWidth: 2,
                color: "#ddd"
           },
           Tips: {
              enable: true,
              type: 'Native',
              offsetX: 3,
              offsetY: 3,
              onShow: function(tip, node) {
                if (!lore.ore.explorePanel.hideLabels) {
                    tip.innerHTML = "";
                } else {
                    //count connections
                    //var count = 0;
                    //node.eachAdjacency(function() { count++; });
                    var tiptext = "<div class=\"exploretip-title\">" + node.name + "</div><div class=\"exploretip-text\">";
                    //tiptext += "<i>" + node.id + "</i><br>";
                    if (node.data.creator){
                        tiptext += "Created by " + node.data.creator; 
                    } 
                    if (node.data.modified){
                        tiptext += ", modified " + node.data.modified;
                    }
                    tiptext += "</div>";
                    tip.innerHTML = tiptext;
                }
              }
            },
            Events: {
              enable: true,
              type: 'Native',
              //Change cursor style when hovering a node
              onMouseEnter: function() {
                lore.ore.explorePanel.fd.canvas.getElement().style.cursor = 'move';
              },
              onMouseLeave: function() {
                lore.ore.explorePanel.fd.canvas.getElement().style.cursor = '';
              },
              //Update node positions when dragged
              onDragMove: function(node, eventInfo, e) {
                var pos = eventInfo.getPos();
                node.pos.setc(pos.x, pos.y);
                lore.ore.explorePanel.fd.plot();
              },
              onRightClick: function(node, eventInfo, e){
                    this.clickedNode = node;
                    if (node) {
                        lore.ore.explorePanel.onNodeMenu(this,e);
                        // prevent default context menu
                        return false;
                    }
              }
            },
            //Number of iterations for the FD algorithm
            iterations: 200,
            //Edge length
            levelDistance: 130,
            clickedNode: {},
            
            requestGraph: function(node) {
                if (!node.id || !node.id.match ("http")) {
                    lore.debug.ore("requestGraph not http", node);
                    return;
                }
                //lore.debug.ore("requestGraph",node);
                lore.ore.ui.loreProgress("Retrieving data for explore view");
                try{
                var historyData = {
                    name: Ext.util.Format.ellipsis(node.name.toString(),30),
                    action : "lore.global.util.launchTab(\"" + node.id + "\", window);",
                    icon : "chrome://lore/skin/icons/page_go.png",
                    tooltip : "Show in browser"
                };
                
                // stylesheet sets type to circle for compound objects
                if (node.data["$type"] == "circle"){
                    historyData.action = "lore.ore.readRDF(\"" + node.id + "\");";
                    historyData.icon = "chrome://lore/skin/oaioreicon-sm.png";
                    historyData.tooltip = "Load in LORE";
                }
                
                var historyEl = Ext.getCmp("exploreHistory").body.dom;
                
                historyEl.innerHTML = lore.ore.explorePanel.historyTemplate.apply(historyData) 
                    + ((history.innerHTML != '')? " &lt;&nbsp;" : "") + historyEl.innerHTML;
                
              
                lore.ore.explorePanel.loadRem(node.id, node.name, (node.data["$type"]=='circle'), function(json) {
                    try{
                    // TODO: implement a limit on the number of nodes or drop off old ones
                    lore.ore.explorePanel.fd.op.sum(json, {
                        'type': 'fade:con',
                        duration: 1500,
                        hideLabels: true,
                        onAfterCompute: function(){
                            lore.ore.ui.loreInfo("Explore view updated");
                            lore.ore.explorePanel.fd.labels.hideLabels(lore.ore.explorePanel.hideLabels);
                        }
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
              var nameContainer = document.createElement('span'), 
                  style = nameContainer.style;
              nameContainer.className = 'x-unselectable explorename';
              if (!node.name){
                node.name = "Untitled";
              } else {
                node.name = node.name.replace(/&amp;/g, '&');
              }
              nameContainer.innerHTML = node.name;
              nameContainer.setAttribute("title","Show connections for \"" + node.name + "\"");
              domElement.appendChild(nameContainer);
              
              style.fontSize = "1.1em";
              style.color = "#51666b";
              
              nameContainer.onclick = function () {
                lore.ore.explorePanel.fd.controller.requestGraph(node);
              };
            },
            onPlaceLabel: function(domElement, node) {
                 var style = domElement.style;
                  var left = parseInt(style.left);
                  var w = domElement.offsetWidth;
                  style.left = (left - w / 2) + 'px';
                  style.display = '';
              }, 
              onBeforePlotLine: function(adj) {
                   
                   var rel = adj.data["rel"];
                   var newColor = "";
                   if (rel){
                        if (lore.ore.explorePanel.colorKey[rel]){
                            newColor = lore.ore.explorePanel.colorKey[rel];
                        } else {
                            // generate a semi-random color to represent this type of relationship
                            // this tends towards purple shades, but it looks better than actual random colours
                            newColor = "#" + Math.round(0xffffff * Math.random()).toString(16);
                            
                            lore.ore.explorePanel.colorKey[rel] = newColor;                       
                        }
                       adj.data["$color"] = newColor;
                   }
            }
            
        });
        
        if (this.body){
            this.mon(this.body, {
                scope: this,
                contextmenu: this.onContextMenu
            });
        }
    },
    onNodeMenu: function(fdcontroller,e){        
        if (!this.nodemenu) {
            var nodemenu = new Ext.menu.Menu({
                id : "explore-node-menu",
                showSeparator: false
            });
            nodemenu.add({
                text : "Show connections",
                //icon: "chrome://lore/skin/icons/image.png",
                scope: fdcontroller,
                handler : function(evt) {
                    var node = this.clickedNode;
                    lore.ore.explorePanel.fd.controller.requestGraph(node); 
                }
            });
            nodemenu.add({
                text : "Remove from visualisation",
                scope: fdcontroller,
                handler : function(evt) {
                    var node = this.clickedNode;
                    node.setData('alpha', 0, 'end');
                    node.eachAdjacency(function(adj) {
                        adj.setData('alpha', 0, 'end');
                    });
                    lore.ore.explorePanel.fd.fx.animate({
                        modes: ['node-property:alpha',
                            'edge-property:alpha'],
                        duration: 500
                    });
                }
            });
            
            this.nodemenu = nodemenu;
         }
         lore.debug.ore("right click event ",e);
         this.nodemenu.showAt([e.pageX,e.pageY]);          
    },
    onContextMenu : function (e){ 
        if (!this.contextmenu) {
            this.contextmenu = new Ext.menu.Menu({
                id : this.id + "-context-menu",
                showSeparator: false
            });
            
            this.contextmenu.add({
                    text : "Save diagram as image",
                    icon: "chrome://lore/skin/icons/image.png",
                    scope: this,
                    handler : function(evt) {
                        lore.ore.ui.loreProgress("Preparing explore image");
                        this.contextmenu.hide();
                        // use set timeout so that UI updates
                        setTimeout(function(ep) {
                            var imgData = ep.getAsImage();
                            if (imgData) {
                                lore.global.util.writeURIWithSaveAs("explore", "png", window, imgData);
                            } else {
                                lore.ore.ui.loreError("Unable to generate explore image");
                            }
                        }, 10, this);
                        

                    }
             });
             this.contextmenu.add({
                text: "Reset visualisation",
                scope: this,
                handler: function(evt){
                    this.showInExploreView(lore.ore.cache.getLoadedCompoundObjectUri(),"Current Compound Object",true);
                }
             });
             this.contextmenu.add({
                text: "Show color key",
                scope: this,
                handler: function(evt){
                    try{
                    var colorKeyHTML = "";
                    for (c in this.colorKey) { 
                        colorKeyHTML += this.ckTemplate.apply({rel: c, color: this.colorKey[c]});
                    }
                    
                    this.colorKeyWin.show();
                    this.colorKeyWin.body.update("<ul>" + colorKeyHTML + "</ul>");
                    } catch (e) {
                        lore.debug.ore("Problem showing color key",e);
                    }
                }
             });
             this.contextmenu.add({
                // TODO: tooltips for when labels are hidden, provide another option to expand graph
                    text: "Hide Labels",
                    scope: this,
                    handler: function (){
                        try{
                       this.fd.labels.hideLabels(true);
                       this.hideLabels = true;
                        } catch (e){
                            lore.debug.ore("problem",e);
                        }
                    }
             });
             this.contextmenu.add({
                    text: "Show Labels",
                    scope: this,
                    handler: function (){
                        this.fd.labels.hideLabels(false);
                        this.hideLabels = false;
                    }
             });
        }
        this.contextmenu.showAt(e.xy);
        e.stopEvent();
        return false;
    },
    getAsImage : function() {
     try {
       
        var epanel = this.getComponent(0);
        var imageW = epanel.getInnerWidth() + 50;
        var imageH = epanel.getInnerHeight() + 50;
        lore.debug.ore("initial height?" + epanel.body.getWidth() + " " + epanel.body.getHeight());
        // TODO: get height from actual diagram rather than hardcoding image dimensions
        imageW = 1000;
        imageH = 1000;
        
        lore.debug.ore("width " + imageW + " height " + imageH,this);
        // recenter jit canvas in case user has panned
        var fdc = this.fd.canvas;
        var fdcx = fdc.translateOffsetX;
        var fdcy = fdc.translateOffsetY;
        fdc.translate((0 - fdcx),(0 - fdcy));
        var canvas = this.previewCanvas;
        var context = canvas.getContext("2d");
        var pos = this.getPosition();
        var offsetX = pos[0] + 1;
        var offsetY = pos[1] + 31; // don't show history
        
        // resize the viewport so that image captures entire diagram
        var vp = lore.ore.ui.main_window;
        var vpsize = vp.getSize();
        vp.setSize(imageW + offsetX + 50, imageH + offsetY + 50);
        canvas.setAttribute("width", imageW + "px");
        canvas.setAttribute("height", imageH + "px");
        context.clearRect(0,0, imageW, imageH);

        // Draw the window, cropping to display just the visualisation
        context.drawWindow(window, offsetX, offsetY, imageW, imageH, "rgb(255,255,255)");
        
        lore.debug.ore("current height?" + epanel.body.getWidth() + " " + epanel.body.getHeight());
        
        var imgData = canvas.toDataURL();
        // restore viewport original size
        vp.setSize(vpsize);
        vp.syncSize();
        // translate jit canvas back to original position
        this.fd.canvas.translate(fdcx, fdcy);
        lore.ore.ui.loreInfo("Image ready");
        return imgData;
     } catch (e) {
        lore.debug.ore("ExplorePanel.getAsImage: ",e);
     }
        
    },
    /** Temporary function to regenerate content each time the panel is activated 
     * @param {} p The panel
     */
    updateContent : function (p) {
        var currentREM = lore.ore.cache.getLoadedCompoundObjectUri();
        if (this.exploreLoaded !== currentREM) {
            //lore.debug.ore("updateContent: show in explore view", currentREM);
            this.exploreLoaded = currentREM;
            this.showInExploreView(currentREM, lore.ore.getPropertyValue("dc:title",lore.ore.ui.grid), true);
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
        //lore.debug.ore("loadRem " + title + " " + id);
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
            //lore.debug.ore("show in explore view " + title);
            lore.ore.ui.loreProgress("Retrieving data for explore view");
            try{
            if (!this.fd){
                    this.initGraph();
                } else {
                    this.fd.graph.empty();
            }
            this.loadRem(id, title, isCompoundObject, function(json){
                lore.ore.explorePanel.fd.loadJSON(json);
                lore.ore.explorePanel.fd.computeIncremental({
                    iter: 40,
                    property: 'end',
                    onStep: function(perc){
                      //Log.write(perc + '% loaded...');
                    },
                    onComplete: function(){
                      var ep = lore.ore.explorePanel;
                      lore.ore.ui.loreInfo("Explore data loaded");
                      ep.fd.animate({
                        modes: ['linear'],
                        duration: 1000
                      });    
                      // intial adjustment to bring into view
                      var canv = ep.fd.canvas;
                      if (canv.translateOffsetX == 0){
                        var newx = 0 - ((1100 - ep.getWidth()) / 2);
                        var newy = 0 - ((1100 - ep.getHeight()) / 2);
                        lore.debug.ore("translating canvas ", [newx, newy]);
                        canv.translate(newx,newy);
                      }
                    }
                });

                var historyData = {
                        name: Ext.util.Format.ellipsis(title,30),
                        action : "lore.global.util.launchTab(\"" + id + "\", window);",
                        icon : "chrome://lore/skin/icons/page_go.png",
                        tooltip : "Show in browser"
                };
                // if it is a compound object use lore icon and open in lore instead of browser link
                if (isCompoundObject){
                    historyData.action = "lore.ore.readRDF(\"" + id + "\");";
                    historyData.icon = "chrome://lore/skin/oaioreicon-sm.png";
                    historyData.tooltip = "Load in LORE";
                }
                    
                var historyEl = Ext.getCmp("exploreHistory").body.dom;
                    
                historyEl.innerHTML = lore.ore.explorePanel.historyTemplate.apply(historyData);

        });  
            } catch (e){
                lore.debug.ore("problem in show in explore view",e);
            }
    }
});
Ext.reg('explorepanel',lore.ore.ui.ExplorePanel);
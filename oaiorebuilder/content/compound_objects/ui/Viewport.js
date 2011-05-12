// Override Viewport to allow manual resize (for generating images) 
Ext.override(Ext.Viewport, {
    initComponent : function() {
        Ext.Viewport.superclass.initComponent.call(this);
        document.getElementsByTagName('html')[0].className += ' x-viewport';
        this.el = Ext.getBody();
        this.el.setHeight = Ext.emptyFn;
        this.el.setWidth = Ext.emptyFn;
        this.el.dom.scroll = 'no';
        this.allowDomMove = false;
        Ext.EventManager.onWindowResize(this.fireResize, this);
        this.renderTo = this.el;
    },
    syncSize : function(){
        delete this.lastSize;
        this.el.dom.style.height="100%";
        this.el.dom.style.width="auto";
        return this;
    }
});
/**
 * @class lore.ore.ui.Viewport The LORE Compound Objects UI (except for toolbar, status icon etc which are in the overlay)
 * @extends Ext.Viewport
 */
lore.ore.ui.Viewport = Ext.extend(Ext.Viewport, {
    // TODO: implement singleton pattern
    layout : "border",
    border : false,
    initComponent : function() {
        this.items = [{
            region : "center",
            border : false,
            layout : "fit",
            id : "loreviews-container",
            items : [{
                xtype : "tabpanel",
                id : "loreviews",
                /**
                 * Override itemTpl so that we can create menu buttons on the tabs
                 */
                itemTpl: new Ext.XTemplate(
	                '<li class="{cls}" id="{id}"><a class="x-tab-strip-close"></a>',
                    '<tpl if="menuHandler">',
                        '<a title="{text} Menu" href="#" onclick="{menuHandler}" class="x-tab-strip-menu"></a>',
                    '</tpl>',
	                '<a class="x-tab-right" href="#"><em class="x-tab-left">',
	                '<span class="x-tab-strip-inner"><span class="x-tab-strip-text {iconCls}">{text}</span></span>',
	                '</em></a>',
	                '</li>'
				),
				/** 
				 * Override to allow menuHandler to be passed in as config
				 */
			    getTemplateArgs: function(item) {
			        var result = Ext.TabPanel.prototype.getTemplateArgs.call(this, item);
                    if (item.menuHandler){
                        result.cls = result.cls + " x-tab-strip-with-menu";
                    }
			        return Ext.apply(result, {
			            closable: item.closable,
			            menuHandler: item.menuHandler
			        });
			    },
                /** Override to allow mouse clicks on menu button */
                onStripMouseDown: function(e){
                    var menu = e.getTarget('.x-tab-strip-active a.x-tab-strip-menu', this.strip);
                    if (menu || e.button !== 0){
                        // default onclick behaviour will result
                        return;
                    }
			        e.preventDefault();
			        var t = this.findTargets(e);
			        if(t.close){
			            if (t.item.fireEvent('beforeclose', t.item) !== false) {
			                t.item.fireEvent('close', t.item);
			                this.remove(t.item);
			            }
			            return;
			        }
			        if(t.item && t.item != this.activeTab){
			            this.setActiveTab(t.item);
			        }
                },
                enableTabScroll : true,
                // Ext plugin to change hideMode to ensure tab contents are not reloaded
                plugins : new Ext.ux.plugin.VisibilityMode({
                            hideMode : 'nosize',
                            bubble : false
                }),
                deferredRender : false,
                autoScroll : true,
                items : [{
                            title : "Graphical Editor",
                            tabTip: "View or edit the compound object graphically",
                            id : "drawingarea",
                            xtype : "grapheditor",
                            iconCls: "graph-icon"
                        },{
		                    title : "Resource List",
		                    tabTip: "View or edit the list of resources in the compound object",
		                    xtype : "resourcepanel",
		                    id : "remlistview",
		                    iconCls: "list-icon"
		                },  {
                            title : "Details",
                            id: "remdetailsview",
                            tabTip: "View detailed description of compound object contents including properties and relationships",
                            xtype: "narrativepanel",
                            iconCls: "detail-icon"
                        }, {
                            layout : 'fit',
                            id : "remslideview",
                            title : "Slideshow",
                            iconCls: "slide-icon",
                            tabTip: "View compound object contents as a slideshow",
                            items : [{
                                        id : 'newss',
                                        xtype : "slideshowpanel",
                                        autoScroll : true
                                    }]
                        }, {
                            title : "Explore",
                            tabTip: "Discover related resources from the repository",
                            id : "remexploreview",
                            xtype : "explorepanel",
                            iconCls: "explore-icon"
                    }   , {
                            title : "Using Compound Objects",
                            tabTip: "View LORE documentation",
                            id : "welcome",
                            autoWidth : true,
                            autoScroll : true,
                            iconCls : "welcome-icon",
                            html : "<iframe type='content' style='border:none' height='100%' width='100%' src='chrome://lore/content/compound_objects/about_compound_objects.html'></iframe>"

                        }]
            }]
        }, {
            region : "south",
            height : 25,
            xtype : "statusbar",
            id : "lorestatus",
            defaultText : "",
            autoClear : 6000,
            items: [
                '-',
                {
                    xtype:'label',
                    id:'currentCOMsg', 
                    text: 'New compound object'
                },
                ' '
            ]
        }, {
            region : "west",
            width : 280,
            split : true,
            animCollapse : false,
            collapseMode : 'mini',
            useSplitTips: true,
            id : "propertytabs",
            xtype : "tabpanel",
            // Override collapse behaviour to improve UI responsiveness
            onCollapseClick: function(e,args,arg2,arg3,arg4){
                var activetab = Ext.getCmp("loreviews").getActiveTab();
                activetab.hide();
                Ext.layout.BorderLayout.SplitRegion.prototype.onCollapseClick.apply(this,arguments);
                activetab.show();
            },
            onExpandClick : function (e){
                var activetab = Ext.getCmp("loreviews").getActiveTab();
                activetab.hide();
                Ext.layout.BorderLayout.SplitRegion.prototype.onExpandClick.apply(this,arguments);
                activetab.show();
            },
            onSplitMove : function (split, newSize){
                var activetab = Ext.getCmp("loreviews").getActiveTab();
                var propactivetab = Ext.getCmp("propertytabs").getActiveTab();
                activetab.hide();
                // TODO: should hide these but doing this means property grids don't resize
                //propactivetab.hide();
                Ext.layout.BorderLayout.SplitRegion.prototype.onSplitMove.apply(this, arguments);
                activetab.show();
                //propactivetab.show();
                return false;
            },
            deferredRender : false,
            enableTabScroll : true,
            defaults : {
                autoScroll : true
            },
            fitToFrame : true,
            items : [{
                        "xtype": "panel",
                        layout: "anchor",
                        "title": "Browse",
                        tabTip: "Browse related compound objects",
                        "id": "browsePanel",
                        tbar: {
                                "xtype": "lore.paging",
                                "store": "browse",
                                "id": "bpager"
                            },
                        items: [
                            {
                                "xtype": "codataview",
                                "store": "browse",
                                "id": "cobview"
                            }
                        ]
                     },
                     {
                            title: "History",
                            tabTip: "List recently viewed compound objects",
                            id: "historyPanel",
                            xtype: "panel",
                            anchor: "100% 50%",
                            "tbar": {
                                "xtype": "lore.paging",
                                "store": "history",
                                "id": "hpager"
                           
                            },
                        items: [{
                            "xtype": "codataview",
                            "store": "history",
                            "id": "cohview"
                        }]
                    },
                    {
                        xtype: "searchpanel",
                        id : "searchpanel"
                    }, {
                        xtype : "panel",
                        layout : "anchor",
                        title : "Properties",
                        tabTip: "View or edit compound object properties",
                        id : "properties",
                        items : [{
                                    title : 'Compound Object Properties',
                                    id : "remgrid",
                                    propertyType: "property",
                                    xtype : "propertyeditor"
                                }, {
                                    title : "Resource Properties",
                                    id : "nodegrid",
                                    propertyType: "property",
                                    xtype : "propertyeditor"
                                }, {
                                    title: "Relationships",
                                    id: "relsgrid",
                                    propertyType: "relationship",
                                    xtype: "relationshipeditor"
                                }
                                ]
                    }]
        }];
        
        lore.ore.ui.Viewport.superclass.initComponent.call(this);
        
        var loreviews = Ext.getCmp("loreviews");
        loreviews.on("beforeremove", this.closeView, this);
        
        // create a context menu to hide/show optional views
        loreviews.contextmenu = new Ext.menu.Menu({
                    id : "co-context-menu"
        });
        
        /* disable SMIL view for now
         * loreviews.contextmenu.add({
                    text : "Show SMIL View",
                    handler : function() {
                        lore.ore.ui.vp.openView("remsmilview", "SMIL", this.updateSMILView);
                    }
        });*/
        loreviews.contextmenu.add({
            text : "Show RDF/XML",
            handler : function() {
                lore.ore.ui.vp.openView("remrdfview", "RDF/XML",this.updateRDFXMLView);
            },
            scope: this
        });
        loreviews.contextmenu.add({
            text : "Show TriG",
            handler : function() {
                lore.ore.ui.vp.openView("remtrigview", "TriG", this.updateTrigView);
            },
            scope: this
        });
        loreviews.contextmenu.add({
            text : "Show FOXML",
            handler : function() {
                lore.ore.ui.vp.openView("remfoxmlview", "FOXML", this.updateFOXMLView);
            },
            scope: this
        });
    
        loreviews.on("contextmenu", function(tabpanel, tab, e) {
                    Ext.getCmp("loreviews").contextmenu.showAt(e.xy);
        });
    },
    /** @private Create a compound object view displayed in a closeable tab */
    openView : function (/*String*/panelid,/*String*/paneltitle,/*function*/activationhandler){
        var tab = Ext.getCmp(panelid);
        if (!tab) {
           tab = Ext.getCmp("loreviews").add({
                'title' : paneltitle,
                'id' : panelid,
                'autoScroll' : true,
                'closable' : true
            });
            tab.on("activate", activationhandler, this);
        }
        tab.show();
    },
    /**
     * @private Remove listeners and reference to a Compound Object view if it is closed
     * 
     * @param {Object} tabpanel
     * @param {Object} panel
     */
    closeView : function(/*Ext.TabPanel*/tabpanel, /*Ext.panel*/panel) {
        // remove listeners
        var tab = Ext.getCmp(panel.id);
        if (panel.id == 'remrdfview') {
            tab.un("activate", this.updateRDFXMLView);     
        }
        else if (panel.id == 'remsmilview') {
            tab.un("activate", this.updateSMILView);   
        }
        else if (panel.id == 'remfoxmlview') {
            tab.un("activate",this.updateFOXMLView);
        }
        else if (panel.id == 'remtrigview') {
            tab.un("activate",this.updateTriGView);
        }
        return true;
    },
    /** @private Render the current compound object in TriG format in the TriG view*/
    updateTrigView: function(){
        var trig = lore.ore.cache.getLoadedCompoundObject().toTrig();
        Ext.getCmp("remtrigview").body.update("<pre style='white-space:pre-wrap;-moz-pre-wrap:true'>" 
            + Ext.util.Format.htmlEncode(trig) + "</pre>");
    },
    /** @private Render the current compound object as Fedora Object XML in the FOXML view */
    updateFOXMLView : function (){
        var foxml = lore.ore.cache.getLoadedCompoundObject().toFOXML();
        var foxmlString = lore.global.util.transformXML("chrome://lore/content/compound_objects/stylesheets/XMLPrettyPrint.xsl", foxml, {}, window, true);
        if (!foxmlString){
            foxmlString = "Unable to generate FOXML";
        }
        Ext.getCmp("remfoxmlview").body.update(foxmlString);
    },
    /** @private Render the current compound object as RDF/XML in the RDF view */
    updateRDFXMLView : function() {
        var rdfString = lore.ore.cache.getLoadedCompoundObject().transform("chrome://lore/content/compound_objects/stylesheets/XMLPrettyPrint.xsl",{},true);
        if (!rdfString) {
            rdfString = "Unable to generate RDF/XML";
        }
        Ext.getCmp("remrdfview").body.update(rdfString);
    },
    /** @private Generate a SMIL presentation from the current compound object and display a link to launch it */
    updateSMILView : function() {
        var allfigures = lore.ore.ui.graphicalEditor.coGraph.getDocument().getFigures();
        var numfigs = allfigures.getSize();
        var smilcontents = "<p><a title='smil test hover' href='http://www.w3.org/AudioVideo/'>SMIL</a> is the Synchronized Multimedia Integration Language.</p>";
        if (numfigs > 0) {
            var smilpath = lore.ore.cache.getLoadedCompoundObject().generateSMIL(); // generate the new smil file
            // into oresmil.xsl
            smilcontents += "<p>A SMIL slideshow has been generated from the contents of the current compound object.</p><p>"
                    + "<a onclick='lore.global.util.launchWindow(this.href, false, window);return(false);' target='_blank' href='file://"
                    + smilpath
                    + "'>Click here to launch the slideshow in a new window</a><br/>";
        } else {
            smilcontents += "<p>Once you have added some resources to the current compound object a SMIL presentation will be available here.</p>";
        }
        Ext.getCmp("remsmilview").body.update(smilcontents);
        this.info("Display a multimedia presentation generated from the compound object contents");
    },
    /** Display an error message to the user
     * @param {String} message The message to display */
    error : function(/*String*/message){
        var statusopts = {
                'text': message,
                'iconCls': 'error-icon',
                'clear': {
                    'wait': 3000
                }
        };
        lore.ore.ui.status.setStatus(statusopts);
        lore.global.ui.loreError(message);
    },
    /**
     * Display an information message to the user
     * @param {String} message The message to display
     */
    info : function(/*String*/message) {
        var statusopts = {
                    'text': message,
                    'iconCls': 'info-icon',
                    'clear': {
                        'wait': 3000
                    }
        };
        lore.ore.ui.status.setStatus(statusopts);
        lore.global.ui.loreInfo(message);
    },
    /**
     * Display a warning message to the user
     * @param {String} message The message to display
     */
    warning : function(/*String*/message){
        var statusopts = {
            'text': message,
            'iconCls': 'warning-icon',
            'clear': {
                'wait': 3000
            }
        };
        lore.ore.ui.status.setStatus(statusopts);
        lore.global.ui.loreWarning(message);
    },
    /**
     * Display a progress message (with loading icon) to the user
     * @param {} message The message to display
     */
    progress : function(message){
        var statusopts = {
            'text': message,
            'iconCls': 'loading-icon',
            'clear': false
        };
        lore.ore.ui.status.setStatus(statusopts);
        lore.global.ui.loreInfo(message);
    }
});
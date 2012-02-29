/**
 * @class lore.anno.ui.Sidebar Class that creates and controls the UI in the
 * annotations sidebar
 * @extends Ext.util.Observable
 * @cfg {AnnotationManager} annotationManager
 * @cfg {PageView} pageView
 * @cfg {rdfaManager} rdfaManager
 * @constructor
 * Create the Sidebar
 * @param {Object} config The config object
 * 
 */
lore.anno.ui.Sidebar = Ext.extend(Ext.util.Observable, {
    
    rdfaManager: null,
    pageView: null,
    annotationManager: null,
    
    constructor : function(config) {
        this.rdfaManager = config.rdfaManager;
        this.pageView = config.pageView;
        this.annotationManager = config.annotationManager;
        
        this.initGUIConfig();
        
        lore.anno.ui.Sidebar.superclass.constructor.call(this, config);
        /*
         * Construct the Ext based GUI and initialize and show the components
         */
    },
    initGUIConfig: function() {
       
        /*
         * the "Using Annotations" tab
         */
        var aboutPanel = {
            title: "Using Annotations",
            id: "about",
            iconCls: "welcome-icon",
            xtype: 'container',
            autoEl: {
                tag: 'iframe',
                id: 'about_anno',
                style: 'border:none',
                src: '../../content/annotations/about_annotations.html',
                width: '100%',
                height: '100%'
            }
        };
    
        /*
         * 'Annotation Editor' panel
         */
        var loreuieditor = {
            xtype: 'annoeditorpanel',
            region: "south",
            split: true,
            height: 300,
            pageView: this.pageView,
            rdfaManager: this.rdfaManager,
            model: this.annotationManager.annodsunsaved,
            id: "annotationslistform",
            annomode: lore.constants.ANNOMODE_NORMAL,
            buttonsConfig: [{
                text: 'Cancel',
                id: 'canceleditbtn',
                tooltip: 'Cancel Editing this Annotation - Discards any changes'
            },
            {
                text: 'Hide Editor',
                id: 'hideeditbtn',
                tooltip: 'Hides the annotation editor from view'
            },
            {
                text: 'Save',
                id: 'updannobtn',
                tooltip: 'Save the annotation to the repository'
            }]
        };
    
        /*
         * the panel that contains the annotation tree view and editor
         */
        var browsePanel = {
            title: "Browse",
            xtype: "container",
            id: "treeview",
            layout: "border",
            items: [{
                region: "center",
                xtype: "annocolumntreepanel",
                id: "annosourcestree",
                model: this.annotationManager.annods,
                animate: false
            },
            loreuieditor]
        };
    
        
        var dannoSearchPanel = {
            xtype: 'annosearchpanel',
            title: 'Search',
            id: 'searchpanel',
            model: this.annotationManager.annosearchds,
            annotationManager: this.annotationManager
        };
   
        try {
            lore.anno.ui.tabpanel = new Ext.TabPanel({
                anchor: "100% -25",
                xtype: "tabpanel",
                title: "Navigation",
                id: "navigationtabs",
                deferredRender: false,
                activeTab: "treeview",
                items: [
                    browsePanel, 
                    dannoSearchPanel, 
                    aboutPanel
                ]
            });
            // hide or show feed icon when browse is activated/deactivated
            Ext.getCmp('treeview').on("activate", function(){
                Ext.getCmp('feedButton').show();
            });
            Ext.getCmp('treeview').on("deactivate",function(){
                Ext.getCmp('feedButton').hide();
            });
            Ext.getCmp('about').on("activate", function(){
                 var about= Ext.get("about_anno"); 
                 var high_contrast = lore.anno.prefs.high_contrast;
                 if (about && typeof high_contrast != "undefined") { 
                     lore.util.setHighContrast(about.dom.contentWindow, high_contrast); 
                 }  
            });
            var gui_spec = {
                layout: "anchor",
                border: false,
                items: [lore.anno.ui.tabpanel,
                {
                    anchor: "100%",
                    height: 25,
                    xtype: "statusbar",
                    id: "status",
                    defaultText: "",
                    autoClear: 6000,
                    items: [
                        {
                            xtype: 'button',
                            id: 'feedButton',
                            // Feed icon is only displayed when browse or advanced search are active
                            hidden: true,
                            icon: "../../skin/icons/feed.png",
                            handler: this.annotationManager.getFeedURL,
                            scope: this.annotationManager
                        }
                        
                    ]
                }]
            };
    
            var mainWindow = new Ext.Viewport(gui_spec);
            mainWindow.show();
    
            this.initExtComponents();
        }
        catch (ex) {
            lore.debug.ui("Error creating anno UI", ex);
        }
    },
    /*
     * Initialize the Ext Components. Sets globals, visibility of fields
     * and initialize handlers
     */
    initExtComponents: function () {
        try {
            this.initUIGlobals();
            this.attachContextMenus();
            this.attachHandlers();
    
            lore.anno.ui.formpanel.setAnnotationFormUI(false, false);
    
            // tooltips
            Ext.QuickTips.interceptTitles = true;
            Ext.QuickTips.init();
            Ext.apply(Ext.QuickTips.getQuickTip(), {
                dismissDelay: 0
            });
    
            lore.anno.ui.formpanel.setPreferences(lore.anno.prefs);
    
        } catch (e) {
            lore.debug.ui("Error during initExtComponents", e);
        }
    },
       /*
        * Initialize the globals for the UI controls
        */
    initUIGlobals: function () {
       
        lore.anno.ui.views = Ext.getCmp("treeview");
    
        // set up the root tree node, and the two main child nodes 'Current Page' and 'Unsaved Changes'
        lore.anno.ui.treeroot = new lore.anno.ui.AnnoPageTreeNode({
            text: 'Current Page',
            cls: 'x-tree-noicon',
            model: this.annotationManager.annods
        });
        lore.anno.ui.treeunsaved = new lore.anno.ui.AnnoModifiedPageTreeNode({
            text: 'Unsaved Changes',
             cls: 'x-tree-noicon',
            model: this.annotationManager.annodsunsaved,
            postfix: "-unsaved"
        });
        
        var treerealroot = Ext.getCmp("annosourcestree").getRootNode();
        treerealroot.appendChild([lore.anno.ui.treeroot, lore.anno.ui.treeunsaved]);
        lore.anno.ui.treeroot.expand();
    
        // Auto expand child nodes
        Ext.getCmp("annosourcestree").on("expandnode", function (node) {
            if (node != lore.anno.ui.treeroot) {
                node.expandChildNodes(false);
            }
        });
    
        lore.anno.ui.formpanel = Ext.getCmp("annotationslistform");
        lore.anno.ui.formpanel.hide();
    
        lore.anno.ui.search = Ext.getCmp("searchpanel");
    },
    
    /*
     * Add context menu ( right-click) to controls
     */
    attachContextMenus: function () {
        // Context Menu for 'Annotation List' tab
        var contextmenu = new Ext.menu.Menu({
            id: "anno-context-menu"
        });
        contextmenu.add({
            text: "Show RDF/XML",
            handler: function () {
                try {
                    lore.anno.controller.openView("remrdfview", "RDF/XML", function () {
                        Ext.getCmp("remrdfview").body.update(lore.util.escapeHTML(lore.anno.serialize("rdf")));
                    });
                } catch (e) {
                    lore.debug.anno("Error generating RDF view", e);
                }
            }
        });
    
        lore.anno.ui.views.on("contextmenu", function (tabpanel, tab, e) {
            contextmenu.showAt(e.xy);
        });
    
        // Add handler to add Context Menu for Tree Nodes when they're appended
        lore.anno.ui.treeroot.on('append', lore.anno.controller.handleAttachAnnoCtxMenuEvents, lore.anno.controller);
    },
    
    /*
     * Attach event handlers to UI events
     */
    attachHandlers: function () {
        // Add default behaviour when a new annotation is added
        lore.anno.ui.treeroot.on('append', lore.anno.controller.handleAttachNodeLinks, lore.anno.controller);
    
        // Tree node is clicked/double clicked
        Ext.getCmp("annosourcestree").on("click", lore.anno.controller.handleTreeNodeSelection, lore.anno.controller);
        Ext.getCmp("annosourcestree").on("dblclick", lore.anno.controller.handleEdit, lore.anno.controller);
    
        // editor handlers
        Ext.getCmp("hideeditbtn").on('click', lore.anno.controller.handleHideAnnotationEditor, lore.anno.controller);
        Ext.getCmp("updannobtn").on('click', lore.anno.controller.handleSaveAnnotationChanges, lore.anno.controller);
        Ext.getCmp("canceleditbtn").on('click', lore.anno.controller.handleCancelEditing, lore.anno.controller);
    
        // Annotation Manager
        lore.anno.annoMan.on('annotationsloaded', lore.anno.controller.handleAnnotationsLoaded, lore.anno.controller);
        lore.anno.annoMan.on('annotationrepliesloaded', lore.anno.controller.handleAnnotationRepliesLoaded, lore.anno.controller);
        lore.anno.annoMan.on('committedannotation', lore.anno.controller.handleCommittedAnnotation, lore.anno.controller);
        lore.anno.annoMan.on('servererror', lore.anno.controller.handleServerError, lore.anno.controller);
    
        // Authentication Manager
        lore.anno.am.on('signedin', lore.anno.controller.loadAnyPrivateAnnosForPage, lore.anno.controller);
        lore.anno.am.on('signedout', lore.anno.controller.refreshAnnotations, lore.anno.controller);
    }
    
    
    
});

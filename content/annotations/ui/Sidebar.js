/*
 * Copyright (C) 2008 - 2010 School of Information Technology and Electrical
 * Engineering, University of Queensland (www.itee.uq.edu.au).
 *
 * This file is part of LORE. LORE was developed as part of the Aus-e-Lit
 * project.
 *
 * LORE is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * LORE is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * LORE. If not, see <http://www.gnu.org/licenses/>.
 */


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
                style: 'border:none',
                src: 'chrome://lore/content/annotations/about_annotations.html',
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
    
        /*
         * Helper function that constructs the 'Search' tab
         */
//        var keywordSearchPanel = {
//            xtype: 'solrsearchpanel',
////            autoHeight: 'true',
//            title: 'Keyword',
//        };
    
        
        var dannoSearchPanel = {
			xtype: 'annosearchpanel',
//			layout: 'border',
			title: 'Search',
			id: 'searchpanel',
			model: this.annotationManager.annosearchds,
			annotationManager: this.annotationManager
        };
        
//        var searchPanel = {
//    		xtype: 'tabpanel',
//    		title: 'Search',
//			activeTab: 0,
//    		items: [keywordSearchPanel, dannoSearchPanel]
//        };
        
    
        try {
            lore.anno.ui.tabpanel = new Ext.TabPanel({
                anchor: "100% -25",
                xtype: "tabpanel",
                title: "Navigation",
                id: "navigationtabs",
                deferredRender: false,
                activeTab: "treeview",
                items: [browsePanel, dannoSearchPanel, aboutPanel]
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
		                ' '
		            ]
                }]
            };
    
            var mainWindow = new Ext.Viewport(gui_spec);
            mainWindow.show();
    
            this.initExtComponents();
        }
        catch (ex) {
            lore.debug.ui("Exception creating anno UI", ex);
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
            lore.debug.ui("Errors during initExtComponents", e);
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
            model: this.annotationManager.annods
        });
        lore.anno.ui.treeunsaved = new lore.anno.ui.AnnoModifiedPageTreeNode({
            text: 'Unsaved Changes',
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
                    lore.anno.ui.openView("remrdfview", "RDF/XML", function () {
                        Ext.getCmp("remrdfview").body.update(lore.global.util.escapeHTML(lore.anno.serialize("rdf")));
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
        lore.anno.ui.treeroot.on('append', lore.anno.ui.handleAttachAnnoCtxMenuEvents);
    },
    
    /*
     * Attach event handlers to UI events
     */
    attachHandlers: function () {
        // Add default behaviour when a new annotation is added
        lore.anno.ui.treeroot.on('append', lore.anno.ui.handleAttachNodeLinks);
    
        // Tree node is clicked/double clicked
        Ext.getCmp("annosourcestree").on("click", lore.anno.ui.handleTreeNodeSelection);
        Ext.getCmp("annosourcestree").on("dblclick", lore.anno.ui.handleEdit);
    
        // editor handlers
        Ext.getCmp("hideeditbtn").on('click', lore.anno.ui.handleHideAnnotationEditor);
        Ext.getCmp("updannobtn").on('click', lore.anno.ui.handleSaveAnnotationChanges);
        Ext.getCmp("canceleditbtn").on('click', lore.anno.ui.handleCancelEditing);
    
        // Annotation Manager
        lore.anno.annoMan.on('annotationsloaded', lore.anno.ui.handleAnnotationsLoaded);
        lore.anno.annoMan.on('annotationrepliesloaded', lore.anno.ui.handleAnnotationRepliesLoaded);
        lore.anno.annoMan.on('committedannotation', lore.anno.ui.handleCommittedAnnotation);
        lore.anno.annoMan.on('servererror', lore.anno.ui.handleServerError);
    
        // Authentication Manager
        lore.anno.am.on('signedin', lore.anno.ui.loadAnyPrivateAnnosForPage);
        lore.anno.am.on('signedout', lore.anno.ui.refreshAnnotations);
    }
    
    
    
});

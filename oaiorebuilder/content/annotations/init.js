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

/*
 * @include  "/oaiorebuilder/content/annotations/model/AnnotationManager.js"
 * @include  "/oaiorebuilder/content/annotations/model/PageData.js"
 * @include  "/oaiorebuilder/content/annotations/model/Preferences.js"
 * @include  "/oaiorebuilder/content/annotations/model/RDFaManager.js"
 * @include  "/oaiorebuilder/content/annotations/ui/ColumnTree.js"
 * @include  "/oaiorebuilder/content/annotations/ui/EditorPanel.js"
 * @include  "/oaiorebuilder/content/annotations/ui/PageView.js"
 * @include  "/oaiorebuilder/content/annotations/ui/SearchPanel.js"
 * @include  "/oaiorebuilder/content/annotations/ui/TimelinePanel.js"
 * @include  "/oaiorebuilder/content/annotations/handlers.js"
 * @include  "/oaiorebuilder/content/uiglobal.js"
 * @include  "/oaiorebuilder/content/debug.js"
 */

/**
 * Annotations View
 * @singleton
 * @class lore.anno.ui
 */

/**
 * @property extension
 * Reference to the Extension
 */
lore.anno.ui.extension = Components.classes["@mozilla.org/extensions/manager;1"]
                            .getService(Components.interfaces.nsIExtensionManager)
                            .getInstallLocation(lore.constants.EXTENSION_ID)
                            .getItemLocation(lore.constants.EXTENSION_ID);


/*
 * Namespace Globals
 */

// for reference
/**
 * Ext GUI Configuration
 * @property gui_spec
 */
lore.anno.ui.gui_spec = null;
/**
 * Ext main window
 * @property main_window
 */
lore.anno.ui.main_window = null;
/**
 * Reference to the parent view of the annotation view
 * @property topView
 */
lore.anno.ui.topView = null;
/**
 * Preferences object
 * @property prefs
 */
lore.anno.ui.prefs = null;

// annotation view state
/**
 * The current URL of the active tab
 * @property currentURL
 */
lore.anno.ui.currentURL = null;
/**
 * The visibility of the annotation view
 * @property lorevisible
 */
lore.anno.ui.lorevisible = null;
/**
 * The loaded state of the annotation view
 * @property initialized
 */
lore.anno.ui.initialized = null;

/**
 * The URL of the page that has loaded into the annotation view
 * @property loadedURL
 */
lore.anno.ui.loadedURL = null;

/**
 * Reference to the Page Data object
 * @property page
 */
lore.anno.ui.page = null;
/**
 * Refernece to RDFaManager
 * @property rdfaMan
 */
lore.anno.ui.rdfaMan = null;
/**
 * Reference to Page View
 * @property pageui
 */
lore.anno.ui.pageui = null;
/**
 * Reference to Annotation Manager
 * @property annoMan
 */
lore.anno.annoMan = null;


/**
 * Initialize the annotations model and view. Registering the view and loading
 * the annotations for the current page if the annotations view is visible
 */
lore.anno.ui.init = function () {
    try {
        // obtain reference to parent overlay reference
        lore.anno.ui.topView = lore.global.ui.topWindowView.get(window.instanceId);

        // set up preferences
        lore.anno.prefs = new lore.anno.Preferences({
            creator: 'Anonymous',
            server: '',
            cacheTimeout: '1',
            disable: false,
            high_contrast: false
        });

        // Create Authentication Manager
        lore.anno.am = new lore.anno.AuthManager({prefs: lore.anno.prefs});
        lore.debug.anno("Annotation init");

        lore.anno.prefs.on('prefs_changed', lore.anno.ui.handlePrefsChange);

        lore.anno.ui.currentURL = lore.global.util.getContentWindow(window).location.href;
        lore.anno.annoMan = new lore.anno.AnnotationManager({
            url: lore.anno.ui.currentURL,
            prefs: lore.anno.prefs
        });

        // construct GUI
        lore.anno.ui.initView(lore.anno.annoMan.annods);

        lore.anno.ui.topView.on('location_changed', lore.anno.ui.handleLocationChange);
        lore.anno.ui.topView.on('location_refresh', lore.anno.ui.handleContentPageRefresh);

        lore.anno.ui.lorevisible = lore.anno.ui.topView.annotationsVisible();
        lore.global.ui.annotationView.registerView(lore.anno.ui, window.instanceId);

        // Load Preferences
        lore.anno.ui.topView.loadAnnotationPrefs();

        lore.anno.ui.initialized = true;

        if (lore.anno.ui.currentURL && lore.anno.ui.lorevisible) {
            lore.debug.anno("anno init: updating sources");
            lore.anno.ui.handleLocationChange(lore.anno.ui.currentURL);
        }

    } catch (e) {
        lore.debug.ui("Except in anno init ! " + e, e);
    }
}
/**
 * Construct the GUI
 * @param {Object} model
 */
lore.anno.ui.initView = function (model) {
    lore.anno.ui.initPage(model);
    lore.anno.ui.initGUIConfig();
}

/**
 * Initialize page related objects. Set up the page
 * data, the page view that listens to the page data and
 * the RDFaManager which is used to extract RDFa from pages
 * @param {Object} model
 */
lore.anno.ui.initPage = function (model) {
    if (!lore.anno.ui.page) lore.anno.ui.page = new lore.anno.ui.PageData({
        model: model
    });
    if (!lore.anno.ui.rdfaMan) lore.anno.ui.rdfaMan = new lore.anno.ui.RDFaManager({
        page: lore.anno.ui.page
    });
    if (!lore.anno.ui.pageui) {
        lore.anno.ui.pageui = new lore.anno.ui.PageView({
            page: lore.anno.ui.page,
            rdfaManager: lore.anno.ui.rdfaMan,
            model: model
        });
    }
}

/**
 * Destroy any objects and undo any changes made to the current content window
 */
lore.anno.ui.uninit = function () {
    lore.anno.ui.pageui.removeHighlightForCurrentAnnotation();
    lore.anno.ui.topView.un('location_changed', lore.anno.ui.handleLocationChange);
    lore.anno.ui.topView.un('location_refresh', lore.anno.ui.handleContentPageRefresh);
    if (lore.anno.ui.pageui.removeResizeListeners) {
        lore.anno.ui.pageui.removeResizeListeners();
    }
}

/**
 * Construct the Ext based GUI and initialize and show the components
 */
lore.anno.ui.initGUIConfig = function () {

    /**
     * the "Using Annotations" tab
     * @private
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
    }

    /**
     * 'Annotation Editor' panel
     * @private
     */
    var loreuieditor = {
        xtype: 'annoeditorpanel',
        region: "south",
        split: true,
        height: 300,
        pageView: lore.anno.ui.pageui,
        rdfaManager: lore.anno.ui.rdfaMan,
        model: lore.anno.annoMan.annodsunsaved,
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
    }

    /**
     * the panel that contains the annotation tree view and editor
     * @private
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
            model: lore.anno.annoMan.annods,
            animate: false
        },
        loreuieditor]
    }

    /**
     *
     * Helper function that constructs the 'Timeline' panel
     * @private
     */
    var timelinePanel = {
        title: "Timeline",
        xtype: "annotimelinepanel",
        id: "annotimeline",
        model: lore.anno.annoMan.annods
    }

    /**
     * Helper function that constructs the 'Search' tab
     * @private
     */
    var searchPanel = {
        xtype: 'annosearchpanel',
        layout: 'border',
        id: 'searchpanel',
        model: lore.anno.annoMan.annosearchds,
        annoManager: lore.anno.annoMan
    }


    try {

        lore.anno.ui.tabpanel = new Ext.TabPanel({
            anchor: "100% -25",
            xtype: "tabpanel",
            title: "Navigation",
            id: "navigationtabs",
            deferredRender: false,
            activeTab: "treeview",
            items: [browsePanel, searchPanel, timelinePanel, aboutPanel]
        });

        lore.anno.ui.gui_spec = {
            layout: "anchor",
            border: false,
            items: [lore.anno.ui.tabpanel,
            {
                anchor: "100%",
                height: 25,
                xtype: "statusbar",
                id: "status",
                defaultText: "",
                autoClear: 6000
            }]
        };

        lore.anno.ui.main_window = new Ext.Viewport(lore.anno.ui.gui_spec);
        lore.anno.ui.main_window.show();

        lore.anno.ui.initExtComponents();
    }
    catch (ex) {
        lore.debug.ui("Exception creating anno UI", ex);
    }
}


/**
 * Initialize the Ext Components. Sets globals, visibility of fields
 * and initialize handlers
 */
lore.anno.ui.initExtComponents = function () {
    try {

        lore.anno.ui.initUIGlobals();
        lore.anno.ui.attachContextMenus();
        lore.anno.ui.attachHandlers();

        lore.anno.ui.formpanel.setAnnotationFormUI(false, false);

        // tooltips
        Ext.QuickTips.interceptTitles = true;
        Ext.QuickTips.init();
        Ext.apply(Ext.QuickTips.getQuickTip(), {
            dismissDelay: 0
        });

        lore.anno.ui.timeline.initTimeline();
        lore.anno.ui.formpanel.setPreferences(lore.anno.prefs);

    } catch (e) {
        lore.debug.ui("Errors during initExtComponents: " + e, e);
    }
}

/**
 * Initialize the globals for the UI controls
 */
lore.anno.ui.initUIGlobals = function () {

    lore.anno.ui.views = Ext.getCmp("treeview");

    // set up the root tree node, and the two main child nodes 'Current Page' and 'Unsaved Changes'
    lore.anno.ui.treerealroot = Ext.getCmp("annosourcestree").getRootNode();
    lore.anno.ui.treeroot = new lore.anno.ui.AnnoPageTreeNode({
        text: 'Current Page',
        model: lore.anno.annoMan.annods
    });
    lore.anno.ui.treeunsaved = new lore.anno.ui.AnnoModifiedPageTreeNode({
        text: 'Unsaved Changes',
        model: lore.anno.annoMan.annodsunsaved,
        postfix: "-unsaved"
    });

    lore.anno.ui.treerealroot.appendChild([lore.anno.ui.treeroot, lore.anno.ui.treeunsaved]);
    lore.anno.ui.treeroot.expand();

    // Auto expand child nodes
    Ext.getCmp("annosourcestree").on("expandnode", function (node) {
        if (node != lore.anno.ui.treeroot) {
            node.expandChildNodes(false);
        }
    });

    lore.anno.ui.formpanel = Ext.getCmp("annotationslistform");
    lore.anno.ui.formpanel.hide();

    lore.anno.ui.timeline = Ext.getCmp("annotimeline");
    lore.anno.ui.search = Ext.getCmp("searchpanel");
}

/**
 * Add context menu ( right-click) to controls
 */
lore.anno.ui.attachContextMenus = function () {

    // Context Menu for 'Annotation List' tab
    lore.anno.ui.views.contextmenu = new Ext.menu.Menu({
        id: "anno-context-menu"
    });
    lore.anno.ui.views.contextmenu.add({
        text: "Show RDF/XML",
        handler: function () {
            try {
                lore.anno.ui.openView("remrdfview", "RDF/XML", function () {
                    Ext.getCmp("remrdfview").body.update(lore.global.util.escapeHTML(lore.anno.serialize("rdf")));
                });
            } catch (e) {
                lore.debug.anno("Error generating RDF view: " + e, e);
            }
        }
    });

    lore.anno.ui.views.on("contextmenu", function (tabpanel, tab, e) {
        lore.anno.ui.views.contextmenu.showAt(e.xy);
    });

    // Add handler to add Context Menu for Tree Nodes when they're appended
    lore.anno.ui.treeroot.on('append', lore.anno.ui.handleAttachAnnoCtxMenuEvents);
}

/**
 * Attach event handlers to UI events
 */
lore.anno.ui.attachHandlers = function () {
    // Add default behaviour when a new annotation is added
    lore.anno.ui.treeroot.on('append', lore.anno.ui.handleAttachNodeLinks);

    // Tree node is clicked/double clicked
    Ext.getCmp("annosourcestree").on("click", lore.anno.ui.handleTreeNodeSelection);
    Ext.getCmp("annosourcestree").on("dblclick", lore.anno.ui.handleEditTreeNode);

    // editor handlers
    Ext.getCmp("hideeditbtn").on('click', lore.anno.ui.handleHideAnnotationEditor);
    Ext.getCmp("updannobtn").on('click', lore.anno.ui.handleSaveAnnotationChanges);
    Ext.getCmp("canceleditbtn").on('click', lore.anno.ui.handleCancelEditing);

    // Annotation Manager
    lore.anno.annoMan.on('annotationsloaded', lore.anno.ui.handleAnnotationsLoaded);
    lore.anno.annoMan.on('committedannotation', lore.anno.ui.handleCommittedAnnotation);
    lore.anno.annoMan.on('servererror', lore.anno.ui.handleServerError);

    // Authentication Manager
    lore.anno.am.on('signedin', lore.anno.ui.topView.setAnnotationsSignedIn);
    lore.anno.am.on('signedout', lore.anno.ui.topView.setAnnotationsSignedOut);
}


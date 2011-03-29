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
 * @include  "/oaiorebuilder/content/annotations/handlers.js"
 * @include  "/oaiorebuilder/content/uiglobal.js"
 * @include  "/oaiorebuilder/content/debug.js"
 */

/**
 * Annotations View
 * @singleton
 * @class lore.anno.ui
 */


/*
 * Namespace Globals
 */

// for reference

/**
 * Reference to the parent view of the annotation view
 * @property topView
 */
lore.anno.ui.topView = null;


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
 * Reference to the PageData object
 * @property page
 */
lore.anno.ui.page = null;
/**
 * Reference to PageView
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
lore.anno.ui.init = (function() {

   var publicInit = function () {
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
           initView(lore.anno.annoMan);
   
           lore.anno.ui.topView.on('tab_changed', lore.anno.ui.handleTabChange);
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
    
    /*
     * Construct the GUI
     * @param {Object} model
     */
    function initView(annotationManager) {
        lore.anno.ui.page = new lore.anno.ui.PageData({
            model: annotationManager.annods
        });

        var rdfaMan = new lore.anno.ui.RDFaManager({
                page: lore.anno.ui.page
            });
        
        lore.anno.ui.pageui = new lore.anno.ui.PageView({
            page: lore.anno.ui.page,
            rdfaManager: rdfaMan,
            model: annotationManager.annods
        });
        
        new lore.anno.ui.Sidebar({
                rdfaManager       : rdfaMan,
                annotationManager : annotationManager,
                pageView          : lore.anno.ui.pageui});
    }
    

   return publicInit;
})();





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









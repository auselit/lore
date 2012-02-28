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
           
           // Get reference to Authentication Manager (or create if it does not already exist)
           lore.anno.am = lore.anno.ui.topView.getAuthManager();
           if (!lore.anno.am){
                lore.anno.am = lore.anno.ui.topView.setAuthManager(new lore.AuthManager());
           }
           // set up preferences
           lore.anno.prefs = new lore.anno.Preferences({
               creator: 'Anonymous',
               server: '',
               cacheTimeout: '1',
               disable: false,
               high_contrast: false
           });
           
           lore.anno.controller = new lore.anno.Controller();
           lore.anno.prefs.on('prefs_changed', lore.anno.controller.handlePrefsChange,lore.anno.controller);
           lore.anno.controller.currentURL = lore.util.getContentWindow(window).location.href;
           lore.anno.annoMan = new lore.anno.AnnotationManager({
               url: lore.anno.controller.currentURL,
               prefs: lore.anno.prefs
           });

           // construct GUI
           initView(lore.anno.annoMan);
   
           lore.anno.ui.topView.on('tab_changed', lore.anno.controller.handleTabChange, lore.anno.controller);
           lore.anno.ui.topView.on('location_changed', lore.anno.controller.handleLocationChange, lore.anno.controller);
           lore.anno.ui.topView.on('location_refresh', lore.anno.controller.handleContentPageRefresh, lore.anno.controller);
   
           lore.anno.controller.lorevisible = lore.anno.ui.topView.annotationsVisible();
           

           //lore.global.ui.annotationView.registerView(lore.anno.ui, window.instanceId);
           lore.global.ui.annotationView.registerView(lore.anno.controller, window.instanceId);
           
           // Load Preferences
           lore.anno.ui.topView.loadAnnotationPrefs();
   
           lore.anno.controller.initialized = true;
   
           if (lore.anno.controller.currentURL && lore.anno.controller.lorevisible) {
               lore.debug.anno("anno init: updating sources");
               lore.anno.controller.handleLocationChange(lore.anno.controller.currentURL);
           }
   
       } catch (e) {
           lore.debug.ui("Except in anno init", e);
       }
   };
    
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
    lore.anno.ui.topView.un('location_changed', lore.anno.controller.handleLocationChange);
    lore.anno.ui.topView.un('location_refresh', lore.anno.controller.handleContentPageRefresh);
    if (lore.anno.ui.pageui.removeResizeListeners) {
        lore.anno.ui.pageui.removeResizeListeners();
    }
};



    var EXPORTED_SYMBOLS = ['ui'];
    /**
     * @singleton
     * @class lore.global.ui
     */
    ui = {};

    Components.utils["import"]("resource://lore/debug.js");

    /**
     * @param {} win
     * @param {} instId
     */
    ui.reset = function (win, instId ) {
        try {
            ui.compoundObjectView.unregisterView();
        } catch (e1) {
            debug.ui ("error unregistering coview: " + e1,e1);
        }
        try {
            ui.annotationView.unregisterView();
        } catch (e2) {
            debug.ui("error unregistering annoview: " + e2,e2);
        }
        try {
            ui.load(win, instId, true);
        } catch (e3) {
            debug.ui ("error loading ui on reset: " + e3,e3);
        }
    };

    ui.loadAnnotations  = function ( win, instId, reload ) {
        var iframe1 = win.document.getElementById("annographiframe");

        iframe1.addEventListener("load", function onLoadTrigger(event){
                    iframe1.removeEventListener("load", onLoadTrigger, true);
                    iframe1.contentWindow.instanceId = instId;
                    iframe1.contentWindow.lore.anno.ui.init();
        }, true);
        if (reload) {
            win.annographiframe.location.reload(true);
        } else {
            // This iframe displays the UI for the extension eg the graphical user interface, implemented in html and needs to have type=chrome
            // All web content displayed within the UI is sanitized or wrapped in iframes with type='content' see createXULIFrame in util.js
            iframe1.setAttribute("src", "chrome://lore/content/annotations/loreui_anno.html");
        }
    };

    ui.loadCompoundObjects = function ( win, instId, reload ) {
            var iframe2 = win.document.getElementById("graphiframe");
            iframe2.addEventListener("load", function onLoadTrigger(event){
                iframe2.removeEventListener("load", onLoadTrigger, true);
                iframe2.contentWindow.instanceId = instId;
                iframe2.contentWindow.lore.ore.ui.init();
            }, true);
            if (reload) {
                win.graphiframe.location.reload(true);
            } else {
                // This iframe displays the UI for the extension eg the graphical user interface, implemented in html and needs to have type=chrome
                // All web content displayed within the UI is sanitized or wrapped in iframes with type='content' see createXULIFrame in util.js
                iframe2.setAttribute("src", "chrome://lore/content/compound_objects/loreui_ore.html");
            }
    };
    /**
     * @param {} win
     * @param {} instId
     * @param {} reload
     */
    ui.load = function (win, instId, reload) {
        ui.loadAnnotations(win, instId, reload );
        ui.loadCompoundObjects(win, instId, reload);
    };

    /**
     * Called just before the browser window is closed
     */
    ui.onClose = function (window, instId) {
        var annoView = ui.annotationView.get(instId);
        if (!annoView) {
            lore.debug.anno("in ui.onClose, unable to get annoView", {annotationView:ui.annotationView});
            return;
        }
        if (annoView.hasModifiedAnnotations()) {
            if (window.confirm("Click 'Ok' to save changes to modified annotations.")) {
                annoView.handleSaveAllAnnotationChanges();
            }
        }
    };

    /**
     * Called as the window is unloading, just before it disappears
     */
    ui.onUnLoad = function(window, instId) {
        try {
            ui.annotationView.unregisterView(instId);
            ui.compoundObjectView.unregisterView(instId);
            ui.topWindowView.unregisterView(instId);
        } catch (e) {
            debug.ui('ui.onUnLoad(window, instId)', e);
        }
    };

    ui.setCurrentURL = function (instance,url) {
        if ( !ui.currentURLs )
            ui.currentURLs = {};
        ui.currentURLs[instance] = url;
    };

    ui.getCurrentURL = function (instance) {
        return ui.currentURLs ? ui.currentURLs[instance]: null;
    };
    /**
     * @return {}
    */
    ui.genInstanceID = function () {
        if ( !ui.genInstanceID.counter) {
            ui.genInstanceID.counter = 1;
        } else {
            ui.genInstanceID.counter++;
        }
        return ui.genInstanceID.counter;
    };

/**
* UI View
* The intention is that the views are never directly accesses via their iframes
* by other view/overlay code
* @param {} args
*/
function Views(args){

    this.name = args.name;
    this.views = {};
    this.events = {};

    this.loaded = function(instId){
            return this.views[instId] != null;
    };

    this.onload = function(instId, callback) {

            if ( !this.events[instId] )
                    this.events[instId] = [callback];
            else
                    this.events[instId].push(callback);
    };

    this.registerView = function(view, instId){
            this.views[instId] = view;
            var e = this.events[instId];
            if ( e && e.length > 0) {
                    for ( var i =0; i < e.length; i++) {
                            e[i](instId);
                    }
            }
            this.events[instId] = null;
    };

    this.unregisterView = function(instId){
            if (!instId) {
                    for (x in this.views) {
                            if (this.views[x].uninit) {
                                    this.views[x].uninit();
                            }
                    }
                    this.views = {};
            }
            else {
                    try {
                            if (this.views[instId].uninit) {
                                            this.views[instId].uninit();
                            }
                    } catch (e) {
                            debug.ui('unregisterView(' + instId + ')', e);
                    }
                    delete this.views[instId];
                    delete this.events[instId];
            }
    };

    this.get = function(instId){
            return this.views[instId];
    };
}


ui.compoundObjectView = new Views({
        name: 'coView'
});
ui.annotationView = new Views({
        name: 'annoView'
});
ui.topWindowView = new Views({
        name: 'topView'
});

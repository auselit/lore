try {
    var loreoverlay = {
        oreLocationListener: {
            QueryInterface: function(aIID){
                if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
                aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
                aIID.equals(Components.interfaces.nsISupports)) 
                    return this;
                throw Components.results.NS_NOINTERFACE;
            },
            onLocationChange: function(aProgress, aRequest, aURI){
                if (aURI) {
                    if (aURI.spec == this.oldURL) 
                        return;
                    if (window.graphiframe.lore && typeof(window.graphiframe.lore.ore.updateCompoundObjectsSourceList) == 'function' &&
                    window.annographiframe.lore &&
                    typeof(window.annographiframe.lore.ui.anno.handleLocationChange) == 'function') {
                        window.graphiframe.lore.ore.updateCompoundObjectsSourceList(aURI.spec);
                        window.graphiframe.lore.ui.loadedURL = aURI.spec;
                        window.annographiframe.lore.ui.anno.handleLocationChange(aURI.spec);
                        window.annographiframe.lore.ui.loadedURL = aURI.spec;
                        this.oldURL = aURI.spec;
                    }
                }
            },
            onStateChange: function(aProgress, aRequest, stateFlags, status){
                var WPL = Components.interfaces.nsIWebProgressListener;
                if (stateFlags & WPL.STATE_IS_DOCUMENT) {
                    //alert("document");
                }
                if (stateFlags & WPL.STATE_IS_NETWORK) { // entire page has loaded
                    if (stateFlags & WPL.STATE_STOP) {
                        if (window.graphiframe.lore && typeof(window.graphiframe.lore.ui.locationLoaded) == 'function') {
                            window.graphiframe.lore.ui.locationLoaded();
                        }
                    }
                }
            },
            onProgressChange: function(){
            },
            onStatusChange: function(){
            },
            onSecurityChange: function(){
            },
            onLinkIconAvailable: function(){
            }
        },
        oldURL: null,
        onLoad: function(){
            try {
                this.graphiframe = window.graphiframe;
                this.resetGraph();
                gBrowser.addProgressListener(this.oreLocationListener, Components.interfaces.nsIWebProgress.NOTIFY_STATE_ALL);
                this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.lore.");
                this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
                this.prefs.addObserver("", this, false);
                
                this.initialized = true;
                this.strings = document.getElementById("lore-strings");
            } 
            catch (e) {
                alert("Error on load: " + e);
            }
        },
        observe: function(subject, topic, data){
            if (topic != "nsPref:changed") {
                return;
            }
            this.loadPrefs();
            this.loadAnnoPrefs();
        },
        uninit: function(){
            if (this.graphiframe) {
                gBrowser.removeProgressListener(this.oreLocationListener);
            }
        },
        doTextMining: function(){
            window.graphiframe.lore.textm.requestTextMiningMetadata();
        },
        showContextMenu1: function(event){
            document.getElementById("context-lore").hidden = gContextMenu.onImage;
        },
        onClickStatusIcon: function(event){
            this.toggleBar();
        },
        onMenuItemCommand: function(e){
            if (gContextMenu.onLink) 
                window.graphiframe.lore.ore.graph.addFigure(gContextMenu.linkURL);
        },
        onMenuPopup: function(e){
            gContextMenu.showItem('addimage-lore', gContextMenu.onImage);
            gContextMenu.showItem('addlink-lore', gContextMenu.onLink);
            gContextMenu.showItem('addbgimg-lore', gContextMenu.hasBGImage);
            gContextMenu.showItem('oaioresep', gContextMenu.onImage || gContextMenu.onLink || gContextMenu.hasBGImage);
            
        },
        addImageMenuItemCommand: function(e){
            if (gContextMenu.onImage) 
                window.graphiframe.lore.ore.graph.addFigure(gContextMenu.imageURL);
        },
        addBGImageMenuItemCommand: function(e){
            if (gContextMenu.hasBGImage) 
                window.graphiframe.lore.ore.graph.addFigure(gContextMenu.bgImageURL);
        },
        onToolbarButtonCommand: function(e){
            this.toggleBar();
        },
        toggleBar: function(){
            var contentBox = document.getElementById('oobContentBox');
            var contentSplitter = document.getElementById('oobContentSplitter');
            var annoContentBox = document.getElementById('oobAnnoContentBox');
            var annoContentSplitter = document.getElementById('oobAnnoContentSplitter');
            
            var annoContentBox
            var toolsMenuItem = document.getElementById('lore-tools-item');
            if (contentBox.getAttribute("collapsed") == "true") {
                toolsMenuItem.setAttribute("checked", "true");
                contentBox.setAttribute("collapsed", "false");
                contentSplitter.setAttribute("collapsed", "false");
                annoContentBox.setAttribute("collapsed", "false");
                annoContentSplitter.setAttribute("collapsed", "false");
                window.graphiframe.lore.ui.loreOpen();
                window.annographiframe.lore.ui.loreOpen();
                
            }
            else {
                toolsMenuItem.removeAttribute("checked");
                contentBox.setAttribute("collapsed", "true");
                contentSplitter.setAttribute("collapsed", "true");
                annoContentBox.setAttribute("collapsed", "true");
                annoContentSplitter.setAttribute("collapsed", "true");
                window.graphiframe.lore.ui.loreClose();
                window.annographiframe.lore.ui.loreClose();
            }
        },
        loadRDFURL: function(){
            window.graphiframe.lore.ore.loadRDF();
        },
        loadRDF: function() {
            try{
                var nsIFilePicker = Components.interfaces.nsIFilePicker;
                var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
                fp.appendFilters(nsIFilePicker.filterXML | nsIFilePicker.filterAll);
                fp.init(window, "Select Compound Object file", nsIFilePicker.modeOpen);
                var res = fp.show();
                if (res == nsIFilePicker.returnOK){
                    var thefile = fp.file;
                    var data = "";
                    var fistream = Components.classes["@mozilla.org/network/file-input-stream;1"].
                                createInstance(Components.interfaces.nsIFileInputStream);
                    var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
                                createInstance(Components.interfaces.nsIConverterInputStream);
                    fistream.init(thefile, -1, 0, 0);
                    cstream.init(fistream, "UTF-8", 0, 0); 
                    var str = {};
                    cstream.readString(-1, str); 
                    data = str.value;
                    cstream.close();
                    window.graphiframe.lore.ore.loadCompoundObject(data);
                }
            } catch (e){
                alert(e);
                window.graphiframe.lore.debug.ui("exception loading file",e);
            }
        },
        addAnnotation: function(){
            try {
                window.annographiframe.lore.ui.anno.handleAddAnnotation();
            }catch (e ) {
                alert("addAnnotation: " + e) ;
            }
        },
        
        removeAnnotation: function() {
        try {
            window.annographiframe.lore.ui.anno.deleteMsgBoxShow();
        } catch (e) {
            alert(e);
        }
        },
        
        editAnnotation: function () {
            window.annographiframe.lore.ui.anno.handleEditAnnotation();
        },
        
        replyToAnnotation: function () {
            window.annographiframe.lore.ui.anno.handleReplyToAnnotation();
        },
        
        saveAnnotation: function () {
            window.annographiframe.lore.ui.anno.handleSaveAnnotationChanges();
        },
        
        saveAllAnnotations: function () {
            window.annographiframe.lore.ui.anno.handleSaveAllAnnotationChanges();
        },
        
        showAnnotations: function(){
            window.annographiframe.lore.ui.anno.showAllAnnotations();
        },
        saveRDF: function(){
            window.graphiframe.lore.ore.saveRDFToRepository();
        },
        saveXML: function () {
            try{
                var therdf = window.graphiframe.lore.ore.createRDF(false);
                var nsIFilePicker = Components.interfaces.nsIFilePicker;
                var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
                fp.appendFilters(nsIFilePicker.filterXML | nsIFilePicker.filterAll);
                fp.init(window, "Save Compound Object as", nsIFilePicker.modeSave);
                var res = fp.show();
                if (res == nsIFilePicker.returnOK || res == nsIFilePicker.returnReplace){
                    var thefile = fp.file;
                    var fostream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                    .createInstance(Components.interfaces.nsIFileOutputStream);
                    fostream.init(thefile, 0x02 | 0x08 | 0x20, 0666, 0);
                    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                                      createInstance(Components.interfaces.nsIConverterOutputStream);
                    converter.init(fostream, "UTF-8", 0, 0);
                    converter.writeString(therdf);
                    converter.close();
                    window.graphiframe.lore.ui.loreInfo("Compound object saved to " + thefile.path);
                }
            } catch (e) {
                window.graphiframe.lore.debug.ui("exception saving XML",e);
            }
        },
        addGraphNode: function(){
            window.graphiframe.lore.ore.graph.addFigure(window.content.location.href);
        },
        resetGraph: function(){
            window.annographiframe.lore.ui.anno.hideMarker();
            window.annographiframe.location.reload(true);
            window.graphiframe.location.reload(true);
        },
        openAbout: function(){
            window.open("chrome://lore/content/about.xul", "", "chrome,centerscreen,modal");
        },
        openOptions: function(){
            window.open("chrome://lore/content/options.xul", "", "chrome,centerscreen,modal,toolbar");
        },
        loadPrefs: function(){
            if (this.prefs) {
                var dccreator = this.prefs.getCharPref("dccreator");
                var relonturl = this.prefs.getCharPref("relonturl");
                var rdfrepos = this.prefs.getCharPref("rdfrepos");
                var rdfrepostype = this.prefs.getCharPref("rdfrepostype");
                var annoserver = this.prefs.getCharPref("annoserver");
                var disable_tm = this.prefs.getBoolPref("disable_textmining");
                var disable_co = this.prefs.getBoolPref("disable_compoundobjects");
                
                // hide or show XUL toolbar buttons depending on prefs
                document.getElementById('text-mining').hidden = disable_tm;
                document.getElementById('tmsep').hidden = disable_tm;
                
                
                
                document.getElementById('cosep').hidden = disable_co;
                document.getElementById('add-node').hidden = disable_co;
                document.getElementById('save-rdf').hidden = disable_co;
                document.getElementById('load-rdf').hidden = disable_co;
                
                window.graphiframe.lore.ui.setdccreator(dccreator);
                window.graphiframe.lore.ore.setrelonturl(relonturl);
                window.graphiframe.lore.ui.setRepos(rdfrepos, rdfrepostype, annoserver);
                
                // hide or show related Ext UI depending on prefs
                window.graphiframe.lore.ui.ore.disableUIFeatures({
                    'disable_textmining': disable_tm,
                    'disable_compoundobjects': disable_co
                });
                
            } 
        },
        
        loadAnnoPrefs: function(){
            if (this.prefs) {
                var annoserver = this.prefs.getCharPref("annoserver");
                var rdfrepos = this.prefs.getCharPref("rdfrepos");
                var rdfrepostype = this.prefs.getCharPref("rdfrepostype");
                
                var disable_anno = this.prefs.getBoolPref("disable_annotations");
                document.getElementById('annsep').hidden = disable_anno;
                document.getElementById('annsep2').hidden = disable_anno;
                document.getElementById('annsep3').hidden = disable_anno;
                document.getElementById('add-annotation').hidden = disable_anno;
                document.getElementById('show-annotations').hidden = disable_anno;
                document.getElementById('edit-annotation').hidden = disable_anno;
                document.getElementById('remove-annotation').hidden = disable_anno;
                document.getElementById('reply-annotation').hidden = disable_anno;
                document.getElementById('save-annotation').hidden = disable_anno;
                document.getElementById('save-all-annotations').hidden = disable_anno;
                window.annographiframe.lore.ui.setRepos(rdfrepos, rdfrepostype, annoserver);
                window.annographiframe.lore.ui.anno.disableUIFeatures({
                    'disable_annotations': disable_anno
                });
            }
            else {
                window.annographiframe.lore.debug.ui("preferences object not loaded, can't read in annotation preferences!");
            }
        },
        
        loadOntology: function(){
            var prefservice = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
            var loreprefs = prefservice.getBranch("extensions.lore.");
            var relonturl = loreprefs.getCharPref("relonturl");
            this.graphiframe.lore.ore.setrelonturl(relonturl);
            this.graphiframe.lore.ore.loadRelationshipsFromOntology();
            return true;
        },
        fillInHTMLTooltip: function(tipElement){
            // From http://forums.mozillazine.org/viewtopic.php?f=19&t=561451&start=0&st=0&sk=t&sd=a
            var retVal = false;
            if (tipElement.namespaceURI == "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul") {
                return retVal;
            }
            const XLinkNS = "http://www.w3.org/1999/xlink";
            var titleText = null;
            var XLinkTitleText = null;
            while (!titleText && !XLinkTitleText && tipElement) {
                if (tipElement.nodeType == Node.ELEMENT_NODE) {
                    titleText = tipElement.getAttribute("title");
                    XLinkTitleText = tipElement.getAttributeNS(XLinkNS, "title");
                }
                tipElement = tipElement.parentNode;
            }
            var texts = [titleText, XLinkTitleText];
            var tipNode = document.getElementById("aHTMLTooltip");
            for (var i = 0; i < texts.length; ++i) {
                var t = texts[i];
                if (t && t.search(/\S/) >= 0) {
                    tipNode.setAttribute("label", t.replace(/\s+/g, " "));
                    retVal = true;
                }
            }
            return retVal;
        },
        
        showVariationSplitter: function(url, callBack){
            try {
                document.getElementById("oobAnnoVarContentSplitter").setAttribute("collapsed", "false");
                document.getElementById("oobAnnoVarContentBox").setAttribute("collapsed", "false");
                var labelValue = "Annotation Variation Resource: " + url;
                
                document.getElementById("oobAnnoVarContentLabel").setAttribute("value", labelValue);
                var iframe = document.getElementById("oobAnnoVarContent");
                
                if ( iframe.getAttribute("src") == url ) {
                    if ( callBack) 
                        callBack();
                    return;
                }
                
                if (callBack) {
                    iframe.addEventListener("load", function variationCallback(){
                        try {
                            callBack();
                            iframe.removeEventListener("load", variationCallback, true);
                        } catch (e ) {
                            lore.debug.anno("Error showVarionSplitter callback: " +e, e);
                        }
                        
                    }, true);
                }
                iframe.setAttribute("src", url);
            } catch ( e ) {
                alert(e);
            }
        },
        
        hideVariationSplitter: function(){
            var splitter = document.getElementById("oobAnnoVarContentSplitter");
            if (splitter.getAttribute("collapsed") == "false") {
                document.getElementById("oobAnnoVarContentSplitter").setAttribute("collapsed", "true");
                document.getElementById("oobAnnoVarContentBox").setAttribute("collapsed", "true");
                document.getElementById("oobAnnoVarContentLabel").setAttribute("value", "Annotation Variation Resource:");
                document.getElementById("oobAnnoVarContent").setAttribute("src", "about:blank");
            }
        },
        
        getVariationContentWindow: function(){
            return document.getElementById("oobAnnoVarContent").contentWindow;
        },
        
        variationContentWindowIsVisible: function () {
            return document.getElementById("oobAnnoVarContentBox").getAttribute("collapsed") == "false";
            
        }
        
    };
    window.addEventListener("load", function(e){
        loreoverlay.onLoad(e);
    }, false);
    window.addEventListener("unload", function(){
        loreoverlay.uninit()
    }, false);
} catch (e ) {
    alert(e);

}

/**
 * @namespace
 * @name loreoverlay
 */
try {
	// Load and cache global ui functions
	
	// for naming consistency with other code
	var lore = { global: {} };
	// lore.debug
	Components.utils.import("resource://lore/debug.js", lore);	
	// lore.global.ui
	Components.utils.import("resource://lore/uiglobal.js", lore.global);
	// lore.global.store
	Components.utils.import("resource://lore/annotations/store.js", lore.global);
		
	if (!lore.global.ui || !lore.global.store || !lore.debug ) {
		// sanity check
		alert("Not all js modules loaded.");
	}
	
	
	var loreoverlay = {
		
		coView: function () { 
			return lore.global.ui.compoundObjectView.get(this.instId);
		},
		
		annoView: function () { 
			return lore.global.ui.annotationView.get(this.instId);
		},

		oreLocationListener: {
			
			QueryInterface: function(aIID){
				if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
				aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
				aIID.equals(Components.interfaces.nsISupports)) 
					return this;
				throw Components.results.NS_NOINTERFACE;
			},
			onLocationChange: function(aProgress, aRequest, aURI){
				try {
					if (aURI) {
						if (aURI.spec == this.oldURL) 
							return;
						if ( lore.global.ui.compoundObjectView.loaded(loreoverlay.instId) && 
							 lore.global.ui.annotationView.loaded(loreoverlay.instId) ) {
							loreoverlay.coView().handleLocationChange(aURI.spec);
							loreoverlay.annoView().handleLocationChange(aURI.spec);
							this.oldURL = aURI.spec;
						}
					}
				} catch(e) {
					alert(e + " " +  e.stack);
				}
			},
			onStateChange: function(aProgress, aRequest, stateFlags, status){
				var WPL = Components.interfaces.nsIWebProgressListener;
				if (stateFlags & WPL.STATE_IS_DOCUMENT) {
					//alert("document");
				}
				if (stateFlags & WPL.STATE_IS_NETWORK) { // entire page has loaded
					if (stateFlags & WPL.STATE_STOP) {
						lore.global.ui.locationLoaded();
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
				this.instId = lore.global.ui.genInstanceID();
				
				lore.global.ui.topWindowView.registerView(this, this.instId);
				gBrowser.addProgressListener(this.oreLocationListener, Components.interfaces.nsIWebProgress.NOTIFY_STATE_ALL);
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.lore.");
				this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
				this.prefs.addObserver("", this, false);
				
				this.initialized = true;
				this.strings = document.getElementById("lore-strings");
				lore.global.ui.load(window, this.instId);
			} 
			catch (e) {
				alert("Error on load: " + e.stack, e);
			}
		},
		observe: function(subject, topic, data){
			if (topic != "nsPref:changed") {
				return;
			}
			this.loadCompoundObjectPrefs();
			this.loadAnnotationPrefs();
		},
		uninit: function(){
			if ( lore.global.ui.annotationView.loaded(this.instId) || lore.global.ui.compoundObjectView.loaded(this.instId)) {
				gBrowser.removeProgressListener(this.oreLocationListener);
			}
		},
		showContextMenu1: function(event){
			document.getElementById("context-lore").hidden = gContextMenu.onImage;
		},
		onClickStatusIcon: function(event){
			this.toggleBar();
		},
		onMenuItemCommand: function(e){
			if (gContextMenu.onLink) 
				loreoverlay.coView().addFigure(gContextMenu.linkURL);
		},
		onMenuPopup: function(e){
			gContextMenu.showItem('addimage-lore', gContextMenu.onImage);
			gContextMenu.showItem('addlink-lore', gContextMenu.onLink);
			gContextMenu.showItem('addbgimg-lore', gContextMenu.hasBGImage);
			gContextMenu.showItem('oaioresep', gContextMenu.onImage || gContextMenu.onLink || gContextMenu.hasBGImage);
			
		},
		addImageMenuItemCommand: function(e){
			if (gContextMenu.onImage) 
				loreoverlay.coView().addFigure(gContextMenu.imageURL);
		},
		addBGImageMenuItemCommand: function(e){
			if (gContextMenu.hasBGImage) 
				loreoverlay.coView().addFigure(gContextMenu.bgImageURL);
		},
		onToolbarMenuCommand: function(e){
			this.toggleBar();
		},
		toggleBar: function(){
			try {
	            var toolsMenuItem = document.getElementById('lore-tools-item');
	            var annoContentBox = document.getElementById('oobAnnoContentBox');
	            var contentBox = document.getElementById('oobContentBox');
	            
	            if (annoContentBox.getAttribute("collapsed") == "false" || contentBox.getAttribute("collapsed") == "false"){
	               toolsMenuItem.removeAttribute("checked");
	                this.setAnnotationsVisibility(false);
	                this.setCompoundObjectsVisibility(false); 
	            } else {
	               toolsMenuItem.setAttribute("checked", "true");
	               this.setAnnotationsVisibility(true);
	               this.setCompoundObjectsVisibility(true); 
	            }
			} catch (e ) {
				alert(e + " " +  e.stack);
			}
		},
		
        loadRDFURL: function(){
            loreoverlay.coView().loadRDF();
        },
		loadRDF: function(){
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
					loreoverlay.coView().loadCompoundObject(data);
                }
            } catch (e){
                alert(e + " " +  e.stack);
                lore.debug.ui("exception loading file",e);
            }
        },
		addAnnotation: function(){
			try {
				loreoverlay.annoView().handleAddAnnotation();
			}catch (e ) {
				alert("addAnnotation: " + e) ;
			}
		},
		
		removeAnnotation: function() {
			try {
				loreoverlay.annoView().handleDeleteAnnotation();
			} catch (e) {
				alert(e + " " +  e.stack);
			}
		},
		
		editAnnotation: function () {
			loreoverlay.annoView().handleEditAnnotation();
		},
		
		replyToAnnotation: function () {
			loreoverlay.annoView().handleReplyToAnnotation();
		},
		
		saveAnnotation: function () {
			loreoverlay.annoView().handleSaveAnnotationChanges();
		},
		
		saveAllAnnotations: function () {
			loreoverlay.annoView().handleSaveAllAnnotationChanges();
		},
		
		showAnnotations: function(){
			loreoverlay.annoView().showAllAnnotations();
		},
		saveRDF: function(){
			loreoverlay.coView().saveRDFToRepository();
		},
        deleteRDF: function(){
            loreoverlay.coView().deleteFromRepository();
        },
        serializeREM: function (format) {
            loreoverlay.coView().handleSerializeREM(format);
        },
		addGraphNode: function(){
			loreoverlay.coView().addFigure(window.content.location.href);
		},
		resetGraph: function(){
			lore.global.ui.reset(window, this.instId);
		},
		openAbout: function(){
			window.open("chrome://lore/content/about.xul", "", "chrome,centerscreen,modal");
		},
		openOptions: function(){
			window.open("chrome://lore/content/options.xul", "", "chrome,centerscreen,modal,toolbar");
		},
		loadCompoundObjectPrefs: function(){
			
			if (this.prefs) {
				var dccreator = this.prefs.getCharPref("dccreator");
				var relonturl = this.prefs.getCharPref("relonturl");
				var rdfrepos = this.prefs.getCharPref("rdfrepos");
				var rdfrepostype = this.prefs.getCharPref("rdfrepostype");
				var annoserver = this.prefs.getCharPref("annoserver");
				var disable_co = this.prefs.getBoolPref("disable_compoundobjects");
				
				// hide or show XUL toolbar buttons depending on prefs
				
				document.getElementById('cosep').hidden = disable_co;
				document.getElementById('add-node').hidden = disable_co;
				document.getElementById('save-rdf').hidden = disable_co;
				document.getElementById('load-rdf').hidden = disable_co;
				
				// TODO: Cache store, views/model have listeners that listen to
				// changes in settings instead perhaps? 
				//lore.global.store.get("lore_preferences") 

				loreoverlay.coView().setdccreator(dccreator);
				loreoverlay.coView().setrelonturl(relonturl);
				loreoverlay.coView().setRepos(rdfrepos, rdfrepostype);
               
				// hide or show related Ext UI depending on prefs
				loreoverlay.coView().disableUIFeatures({
					'disable_compoundobjects': disable_co
				});
				
			} 
		},
		
		loadAnnotationPrefs: function(){
			if (this.prefs) {
				
				var annoserver = this.prefs.getCharPref("annoserver");
				var dccreator = this.prefs.getCharPref("dccreator");
				
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
				
				// TODO: Cache store, views/model have listeners that listen to
				// changes in settings instead perhaps?  
				loreoverlay.annoView().setdccreator(dccreator);
				loreoverlay.annoView().setRepos(annoserver);
				
				loreoverlay.annoView().disableUIFeatures({
					'disable_annotations': disable_anno
				});
			}
			else {
				lore.debug.ui("preferences object not loaded, can't read in annotation preferences!");
			}
		},
		
		loadOntology: function(){
			var prefservice = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
			var loreprefs = prefservice.getBranch("extensions.lore.");
			var relonturl = loreprefs.getCharPref("relonturl");
			loreoverlay.coView().setrelonturl(relonturl);
			loreoverlay.coView().loadRelationshipsFromOntology();
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
		
		updateVariationSplitter: function(url,title,show, callBack){
			try {
				if (show) {
					document.getElementById("oobAnnoVarContentSplitter").setAttribute("collapsed", "false");
					document.getElementById("oobAnnoVarContentBox").setAttribute("collapsed", "false");
				}
				
				var labelValue = title + ': ' + url;
				document.getElementById("oobAnnoVarContentLabel").setAttribute("value", labelValue);
				var iframe = document.getElementById("oobAnnoVarContent");
		
				if ( iframe.contentWindow.location == url ) {
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
				// Must use .location not the src attriubte of iframe
				// as it's not updated by users action within the iframe
				iframe.contentWindow.location = url;

			} catch ( e ) {
				alert(e + " " +  e.stack);
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
		
		annotationsVisible: function() {
			return document.getElementById('oobAnnoContentBox').getAttribute("collapsed") == "false";	
		},
		
		compoundObjectsVisible: function () {
			return document.getElementById('oobContentBox').getAttribute("collapsed") == "false";
		},
			
		setAnnotationsVisibility: function (show) {
			var annoContentBox = document.getElementById('oobAnnoContentBox');
			var annoContentSplitter = document.getElementById('oobAnnoContentSplitter');
			
			if (show) {
				if (this.prefs) {
					var disable_anno = this.prefs.getBoolPref("disable_annotations");
					if (disable_anno)
						return; // don't make visible a disabled component					
				}
				
				annoContentBox.setAttribute("collapsed", "false");
				annoContentSplitter.setAttribute("collapsed", "false");
				
				if ( lore.global.ui.annotationView.loaded(this.instId)) {
					loreoverlay.annoView().show();
				} else {
					//TODO: need a better way of doing this
					window.setTimeout(function(){
						lore.debug.ui("Annotations: Delayed loreOpen running...");
						loreoverlay.annoView().show();
					}, 2000);
				}
				
			} else {
				annoContentBox.setAttribute("collapsed", "true");
				annoContentSplitter.setAttribute("collapsed", "true");
				
				if ( lore.global.ui.annotationView.loaded(this.instId) ) {
					loreoverlay.annoView().hide();
				} else {
					//TODO: need a better way of doing this
					window.setTimeout(function(){
						lore.debug.ui("Annotations: Delayed loreClose running...");
						loreoverlay.annoView().hide();
					}, 2000);
				}			
			}
		},
		
		setCompoundObjectsVisibility: function (show) {
			var contentBox = document.getElementById('oobContentBox');
			var contentSplitter = document.getElementById('oobContentSplitter');
			if (show) {
				if ( this.prefs) {
					var disable_co = this.prefs.getBoolPref("disable_compoundobjects");
					if ( disable_co)
						return; // don't make visible a disabled component
				}
				contentBox.setAttribute("collapsed", "false");
				contentSplitter.setAttribute("collapsed", "false");
				if ( lore.global.ui.compoundObjectView.loaded(this.instId)) {
					loreoverlay.coView().show();
				}else {
					window.setTimeout(function(){
						lore.debug.ui("Compount Objects: Delayed loreOpen running...");
						loreoverlay.coView().show();
					}, 2000);
					
				}
			} else {
				contentBox.setAttribute("collapsed", "true");
				contentSplitter.setAttribute("collapsed", "true");
				if ( lore.global.ui.compoundObjectView.loaded(this.instId)) {
					loreoverlay.coView().hide();
				} else {
					window.setTimeout(function(){
						lore.debug.ui("Compound Objects: Delayed loreClose running...");
						loreoverlay.coView().hide();
					}, 2000);
				}
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
	alert(e + " " + e.lineNumber);

}

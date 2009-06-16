var loreoverlay = {
  oreLocationListener : {
    QueryInterface: function(aIID)
    {
     if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
       aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
       aIID.equals(Components.interfaces.nsISupports))
        return this;
     throw Components.results.NS_NOINTERFACE;
    },
    onLocationChange: function(aProgress, aRequest, aURI)
    {
        loreoverlay.updateOREBrowser(aURI);
    },
    onStateChange: function() {},
    onProgressChange: function() {},
    onStatusChange: function() {},
    onSecurityChange: function() {},
    onLinkIconAvailable: function() {}
  },
  oldURL: null,
  onLoad: function() {
	this.graphiframe = window.graphiframe;
    if (this.graphiframe){
	   this.resetGraph();
       gBrowser.addProgressListener(this.oreLocationListener,
           Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
       this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefService)
        .getBranch("extensions.lore.");
       this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
       this.prefs.addObserver("", this, false);
    }
	this.initialized = true;
	this.strings = document.getElementById("lore-strings");
  },
  observe: function(subject, topic, data){
  	if (topic != "nsPref:changed"){
  		return;
  	}
  	this.loadPrefs();
  },
  uninit: function(){
    if (this.graphiframe){
  	 gBrowser.removeProgressListener(this.oreLocationListener);
    }
  },
  updateOREBrowser: function(aURI) {
  	if (aURI){
    	if (aURI.spec == this.oldURL) return;
    	if (window.graphiframe.lore && typeof(window.graphiframe.lore.ui.updateSourceLists) == 'function'){
		  window.graphiframe.lore.ui.updateSourceLists(aURI.spec);
		  this.oldURL = aURI.spec;
    	}
  	}
  },
  doTextMining: function() {
  	window.graphiframe.lore.textm.requestTextMiningMetadata();
  },
  showContextMenu1: function(event) {
    document.getElementById("context-lore").hidden = gContextMenu.onImage;
  },
  onClickStatusIcon: function(event){
	this.toggleBar();
  },
  onMenuItemCommand: function(e) {
	if (gContextMenu.onLink)
		window.graphiframe.lore.ore.graph.addFigure(gContextMenu.linkURL);
  },
  onMenuPopup: function (e){
  	gContextMenu.showItem('addimage-lore',gContextMenu.onImage);
	gContextMenu.showItem('addlink-lore', gContextMenu.onLink);
	gContextMenu.showItem('addbgimg-lore',gContextMenu.hasBGImage);
	gContextMenu.showItem('oaioresep', gContextMenu.onImage || gContextMenu.onLink || gContextMenu.hasBGImage);

  },
  onToolbarButtonCommand: function(e) {
    this.toggleBar();
  },
  addImageMenuItemCommand: function(e) {
  	if (gContextMenu.onImage)
		window.graphiframe.lore.ore.graph.addFigure(gContextMenu.imageURL);
  },
  addBGImageMenuItemCommand: function(e) {
  	if (gContextMenu.hasBGImage)
		window.graphiframe.lore.ore.graph.addFigure(gContextMenu.bgImageURL);
  },
  onToolbarButtonCommand: function(e) {
    this.toggleBar();
  },
  toggleBar: function () {
  	var contentBox = document.getElementById('oobContentBox');
		var contentSplitter = document.getElementById('oobContentSplitter');
	if (contentBox.getAttribute("collapsed") == "true") {
		contentBox.setAttribute("collapsed", "false");
		contentSplitter.setAttribute("collapsed", "false");
		window.graphiframe.lore.ui.loreOpen();
		
	} else {
		contentBox.setAttribute("collapsed", "true");
		contentSplitter.setAttribute("collapsed", "true");
		window.graphiframe.lore.ui.loreClose();
	}
  },
  loadRDF: function() {

  	window.graphiframe.lore.ore.loadRDF();
  }/*,
  loadRDFFromRepos: function() {
  	window.graphiframe.lore.ore.loadRDFFromRepos();
  }*/
  ,
  addAnnotation: function () {
  	window.graphiframe.lore.anno.addAnnotation();
  },
  showAnnotations: function (){
    window.graphiframe.lore.anno.showAllAnnotations();
  },
  saveRDF: function () {
  	window.graphiframe.lore.ore.saveRDFToRepository();
  },
  addGraphNode: function () {
		window.graphiframe.lore.ore.graph.addFigure(window.content.location.href);
  },
  resetGraph: function () {
  	window.graphiframe.lore.anno.hideMarker();
  	window.graphiframe.location.reload(true);
  },
  openAbout: function (){
	window.open("chrome://lore/content/about.xul","", "chrome,centerscreen,modal");
  },
  openOptions: function () {
  	 window.open("chrome://lore/content/options.xul", "", "chrome,centerscreen,modal,toolbar");
  },
  loadPrefs: function (){
  	if (this.prefs){
	 var dccreator = this.prefs.getCharPref("dccreator");
	 var relonturl = this.prefs.getCharPref("relonturl");
	 var rdfrepos = this.prefs.getCharPref("rdfrepos");
	 var rdfrepostype = this.prefs.getCharPref("rdfrepostype");
	 var annoserver = this.prefs.getCharPref("annoserver");
     var disable_tm = this.prefs.getBoolPref("disable_textmining");
     var disable_co = this.prefs.getBoolPref("disable_compoundobjects");
     var disable_anno = this.prefs.getBoolPref("disable_annotations"); 
      
	 // hide or show XUL toolbar buttons depending on prefs
     document.getElementById('text-mining').hidden = disable_tm; 
     document.getElementById('tmsep').hidden = disable_tm;
     
     document.getElementById('annsep').hidden = disable_anno;
     document.getElementById('add-annotation').hidden = disable_anno;
     document.getElementById('show-annotations').hidden = disable_anno;
	 
     document.getElementById('cosep').hidden = disable_co;
     document.getElementById('add-node').hidden = disable_co;
     document.getElementById('save-rdf').hidden = disable_co;
     document.getElementById('load-rdf').hidden = disable_co;
     
     window.graphiframe.lore.ui.setdccreator(dccreator);
	 window.graphiframe.lore.ore.setrelonturl(relonturl);
	 window.graphiframe.lore.ui.setRepos(rdfrepos, rdfrepostype, annoserver);
  // hide or show related Ext UI depending on prefs
     window.graphiframe.lore.ui.disableUIFeatures({'disable_textmining': disable_tm, 
        'disable_annotations': disable_anno, 
        'disable_compoundobjects': disable_co});
     
  	}
  },
  loadOntology: function() {
  	var prefservice = Components.classes["@mozilla.org/preferences-service;1"]
                      .getService(Components.interfaces.nsIPrefService);
	var loreprefs = prefservice.getBranch("extensions.lore.");
	var relonturl = loreprefs.getCharPref("relonturl");
  	this.graphiframe.lore.ore.setrelonturl(relonturl);
	this.graphiframe.lore.ore.loadRelationshipsFromOntology();
	return true;
  },
  fillInHTMLTooltip: function(tipElement) {
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
}

};
window.addEventListener("load", function(e) { loreoverlay.onLoad(e); }, false);
window.addEventListener("unload", function() {loreoverlay.uninit()}, false);


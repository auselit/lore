var oreLocationListener = {
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
    oaiorebuilder.updateOREBrowser(aURI);
  },

  onStateChange: function() {},
  onProgressChange: function() {},
  onStatusChange: function() {},
  onSecurityChange: function() {},
  onLinkIconAvailable: function() {}
};
var oaiorebuilder = {
  oldURL: null,
  onLoad: function() {
	this.graphiframe = window.graphiframe;
	this.resetGraph();
	this.initialized = true;
	this.strings = document.getElementById("oaiorebuilder-strings");
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
 	    .getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.lore.");
	gBrowser.addProgressListener(oreLocationListener,
        Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
	this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
	this.prefs.addObserver("", this, false);
  },
  observe: function(subject, topic, data){
  	if (topic != "nsPref:changed"){
  		return;
  	}
  	this.loadPrefs();
  },
  uninit: function(){
  	gBrowser.removeProgressListener(oreLocationListener);

  },
  updateOREBrowser: function(aURI) {
  	if (aURI){
    	if (aURI.spec == this.oldURL) return;
    	if (typeof(window.graphiframe.lore.ui.updateSourceLists) == 'function'){
		  window.graphiframe.lore.ui.updateSourceLists(aURI.spec);
		  this.oldURL = aURI.spec;
    	}
  	}
  },
  doTextMining: function() {
  	window.graphiframe.lore.textm.requestOpenCalaisMetadata();
  },
  showContextMenu1: function(event) {
    document.getElementById("context-oaiorebuilder").hidden = gContextMenu.onImage;
  },
  onClickStatusIcon: function(event){
	oaiorebuilder.toggleBar();
  },
  onMenuItemCommand: function(e) {
	if (gContextMenu.onLink)
		window.graphiframe.lore.ore.graph.addFigure(gContextMenu.linkURL);
  },
  onMenuPopup: function (e){
  	gContextMenu.showItem('addimage-oaiorebuilder',gContextMenu.onImage);
	gContextMenu.showItem('addlink-oaiorebuilder', gContextMenu.onLink);
	gContextMenu.showItem('addbgimg-oaiorebuilder',gContextMenu.hasBGImage);
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
  },
  loadRDFFromRepos: function() {
  	window.graphiframe.lore.ore.loadRDFFromRepos();
  },
  addAnnotation: function () {
  	window.graphiframe.lore.anno.addAnnotation();
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
	window.open("chrome://oaiorebuilder/content/about.xul","", "chrome,centerscreen,modal");
  },
  openOptions: function () {
  	 window.open("chrome://oaiorebuilder/content/options.xul", "", "chrome,centerscreen,modal");
  },
  loadPrefs: function (){
  	if (this.prefs){
	 var dccreator = this.prefs.getCharPref("dccreator");
	 var relonturl = this.prefs.getCharPref("relonturl");
	 var rdfrepos = this.prefs.getCharPref("rdfrepos");
	 var rdfrepostype = this.prefs.getCharPref("rdfrepostype");
	 var annoserver = this.prefs.getCharPref("annoserver");
	 
	 window.graphiframe.lore.ui.setdccreator(dccreator);
	 window.graphiframe.lore.ore.setrelonturl(relonturl);
	 window.graphiframe.lore.ui.setRepos(rdfrepos, rdfrepostype, annoserver);
  	}
  },
  popOutWindow: function (){
  	//oaiorebuilder.toggleBar();
	/*var winmediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
				.getService(Components.interfaces.nsIWindowMediator);*/
    var winFeatures = "titlebar=yes,scrollbars=yes,resizable,dialog=no,centerscreen";
    var parentWindow = (!window.opener || window.opener.closed) ? window : window.opener;
    var win = parentWindow.openDialog("chrome://oaiorebuilder/content/oaiorebuilderwindow.xul", "_blank", winFeatures, window);
    return win;
  },
  loadOntology: function() {
  	var prefservice = Components.classes["@mozilla.org/preferences-service;1"]
                      .getService(Components.interfaces.nsIPrefService);
	var oaiorebuilderprefs = prefservice.getBranch("extensions.lore.");
	var relonturl = oaiorebuilderprefs.getCharPref("relonturl");
  	this.graphiframe.lore.ore.setrelonturl(relonturl);
	this.graphiframe.lore.ore.loadRelationshipsFromOntology();
	return true;
  }

};
window.addEventListener("load", function(e) { oaiorebuilder.onLoad(e); }, false);
window.addEventListener("unload", function() {oaiorebuilder.uninit()}, false);


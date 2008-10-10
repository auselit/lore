var oaiorebuilder = {
	
  onLoad: function() {
	this.graphiframe = window.graphiframe;
    this.initialized = true;
    this.strings = document.getElementById("oaiorebuilder-strings");
  },

  showContextMenu1: function(event) {
    document.getElementById("context-oaiorebuilder").hidden = gContextMenu.onImage;
  },
  onClickStatusIcon: function(event){
	oaiorebuilder.toggleBar();
  },
  onMenuItemCommand: function(e) {
	if (gContextMenu.onLink)
		window.graphiframe.addFigure(gContextMenu.linkURL);		
  },
  onMenuPopup: function (e){
  	gContextMenu.showItem('addimage-oaiorebuilder',gContextMenu.onImage);
	gContextMenu.showItem('addlink-oaiorebuilder', gContextMenu.onLink);
	gContextMenu.showItem('oaioresep', gContextMenu.onImage || gContextMenu.onLink);
	
  },
  onToolbarButtonCommand: function(e) {
    this.toggleBar();
  },
  addImageMenuItemCommand: function(e) {
  	if (gContextMenu.onImage)
		window.graphiframe.addFigure(gContextMenu.imageURL);
  },
  onToolbarButtonCommand: function(e) {
    this.toggleBar();
  },
  toggleBar: function () {
  	var contentBox = document.getElementById('oobContentBox');
	if (contentBox.getAttribute("collapsed") == "true") {
		contentBox.setAttribute("collapsed", "false");
	} else {
		contentBox.setAttribute("collapsed", "true");
	}
  },
  loadRDF: function() {
  	
  	window.graphiframe.loadRDF();
  },
  loadRDFFromRepos: function() {
  	window.graphiframe.loadRDFFromRepos();
  },
  saveRDF: function () {
  	window.graphiframe.saveRDFToRepository();
  },
  addGraphNode: function () {
  	/*var txt = window.getBrowser().contentDocument.getSelection();
	if (txt != null){
		
	}*/
	/*if (window.arguments != null) {
		window.graphiframe.addFigure(window.arguments[0].content.location.href)
	}
	else {*/
		window.graphiframe.addFigure(window.content.location.href);
	//}
  },
  resetGraph: function () {
  	window.graphiframe.location.reload(true);
  },
  openAbout: function (){
	window.open("chrome://oaiorebuilder/content/about.xul","", "chrome,centerscreen,modal");
  },
  openOptions: function () {
  	 window.open("chrome://oaiorebuilder/content/options.xul", "", "chrome,centerscreen,modal"); 
  },
  loadPrefs: function (){
  	 var prefservice = Components.classes["@mozilla.org/preferences-service;1"]
                      .getService(Components.interfaces.nsIPrefService);
	 var oaiorebuilderprefs = prefservice.getBranch("extensions.oaiorebuilder.");
	 var dccreator = oaiorebuilderprefs.getCharPref("dccreator");
	 var relonturl = oaiorebuilderprefs.getCharPref("relonturl");
	 var rdfrepos = oaiorebuilderprefs.getCharPref("rdfrepos");
	 var rdfrepostype = oaiorebuilderprefs.getCharPref("rdfrepostype");
	 window.graphiframe.setdccreator(dccreator);
	 window.graphiframe.setrelonturl(relonturl);
	 window.graphiframe.setrdfrepos(rdfrepos, rdfrepostype);
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
	var oaiorebuilderprefs = prefservice.getBranch("extensions.oaiorebuilder.");
	var relonturl = oaiorebuilderprefs.getCharPref("relonturl");
  	this.graphiframe.setrelonturl(relonturl);
	this.graphiframe.loadRelationshipsFromOntology();
	return true;
  }

};
window.addEventListener("load", function(e) { oaiorebuilder.onLoad(e); }, false);

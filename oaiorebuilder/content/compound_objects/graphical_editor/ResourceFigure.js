
/*
 * Based on ExtJS UI integration example from draw2d.org Modified for use with
 * OAI-ORE Graph Builder Anna Gerber, UQ ITEE eResearch, May 2008 Copyright (c)
 * 2008 The University of Queensland
 * 
 * Displays a resource identified by a url and stored associated metadata
 * 
 */

lore.ore.graph.ResourceFigure = function() {
	this.cornerWidth = 15;
	this.originalHeight = -1;
	this.url = "";
	this.scrollx = 0;
	this.scrolly = 0;
	this.metadataproperties = {
		"Resource" : this.url,
		"dc:title" : ""
	};
	this.cornerHeight = 14.5;
	draw2d.Node.call(this);
	this.setDimension(250, 150);
};

lore.ore.graph.ResourceFigure.prototype = new draw2d.Node;
lore.ore.graph.ResourceFigure.prototype.type = "lore.ore.graph.ResourceFigure";

lore.ore.graph.ResourceFigure.prototype.createHTMLElement = function() {
	var item = document.createElement("div");
	item.id = this.id;
	item.style.position = "absolute";
	item.style.left = this.x + "px";
	item.style.top = this.y + "px";
	item.style.height = this.height + "px";
	item.style.width = this.width + "px";
	item.style.margin = "0px";
	item.style.padding = "0px";
	item.style.outline = "none";
	item.style.zIndex = "" + draw2d.Figure.ZOrderBaseIndex;
	this.top_left = document.createElement("div");
	this.top_left.style.position = "absolute";
	this.top_left.style.width = this.cornerWidth + "px";
	this.top_left.style.height = this.cornerHeight + "px";
	this.top_left.style.left = "0px";
	this.top_left.style.top = "0px";
	this.top_left.style.fontSize = "2px";
	this.top_right = document.createElement("div");
	this.top_right.style.position = "absolute";
	this.top_right.style.width = this.cornerWidth + "px";
	this.top_right.style.height = this.cornerHeight + "px";
	this.top_right.style.left = "0px";
	this.top_right.style.top = "0px";
	this.top_right.style.fontSize = "2px";
	this.bottom_left = document.createElement("div");
	this.bottom_left.style.position = "absolute";
	this.bottom_left.style.width = this.cornerWidth + "px";
	this.bottom_left.style.height = (this.cornerHeight - 1) + "px";
	this.bottom_left.style.left = "0px";
	this.bottom_left.style.top = "0px";
	this.bottom_left.style.fontSize = "2px";
	this.bottom_right = document.createElement("div");
	this.bottom_right.style.position = "absolute";
	this.bottom_right.style.width = this.cornerWidth + "px";
	this.bottom_right.style.height = (this.cornerHeight - 1) + "px";
	this.bottom_right.style.left = "0px";
	this.bottom_right.style.top = "0px";
	this.bottom_right.style.fontSize = "2px";
	this.header = document.createElement("div");
	this.top_left.style.background = "url(chrome://lore/skin/resourcenodecircleminus.gif) no-repeat top left";
	this.bottom_left.style.background = "url(chrome://lore/skin/resourcenodecircleminus.gif) no-repeat bottom left";
	this.bottom_right.style.background = "url(chrome://lore/skin/resourcenodecircleminus.gif) no-repeat bottom right";
	this.createPlusMinusIcon();
	this.header.style.position = "absolute";
	this.header.style.left = this.cornerWidth + "px";
	this.header.style.top = "0px";
	this.header.style.height = (this.cornerHeight) + "px";
	this.header.style.backgroundColor = "#e5e5e5";
	this.header.style.color = "#333333";
	this.header.style.borderTop = "1px solid #aeaeae";
	this.header.style.fontSize = "10px";
	this.header.style.textAlign = "center";
	this.header.style.fontFamily = "tahoma, arial, helvetica";
	this.footer = document.createElement("div");
	this.footer.style.position = "absolute";
	this.footer.style.left = this.cornerWidth + "px";
	this.footer.style.top = "0px";
	this.footer.style.height = (this.cornerHeight - 2) + "px";
	this.footer.style.backgroundColor = "transparent";
	this.footer.style.borderBottom = "1px solid #aeaeae";
	this.footer.style.fontSize = "2px";
	this.textarea = document.createElement("div");
	this.textarea.style.position = "absolute";
	this.textarea.style.left = "0px";
	this.textarea.style.top = this.cornerHeight + "px";
	this.textarea.style.backgroundColor = "white";
	this.textarea.style.borderTop = "1px solid #aeaeae";
	this.textarea.style.borderLeft = "1px solid #aeaeae";
	this.textarea.style.borderRight = "1px solid #aeaeae";
	this.textarea.style.overflow = "hidden";
	this.textarea.style.fontSize = "9pt";
	this.metadataarea = document.createElement("div");
	this.metadataarea.style.paddingLeft = "3px";
	this.metadataarea.style.color = "#333333";
	this.metadataarea.style.borderBottom = "1px solid #aeaeae";
	this.iframearea = document.createElement("div");
	this.iframearea.style.border = "none";
	this.textarea.appendChild(this.metadataarea);
	this.textarea.appendChild(this.iframearea);
	this.disableTextSelection(this.textarea);
	item.appendChild(this.top_left);
	item.appendChild(this.header);
	item.appendChild(this.top_right);
	item.appendChild(this.textarea);
	item.appendChild(this.bottom_left);
	item.appendChild(this.footer);
	item.appendChild(this.bottom_right);
	return item;
};

lore.ore.graph.ResourceFigure.prototype.setDimension = function(w, h) {
	draw2d.Node.prototype.setDimension.call(this, w, h);
	if (this.top_left) {
		this.top_right.style.left = (this.width - this.cornerWidth) + "px";
		this.bottom_right.style.left = (this.width - this.cornerWidth) + "px";
		this.bottom_right.style.top = (this.height - this.cornerHeight) + "px";
		this.bottom_left.style.top = (this.height - this.cornerHeight) + "px";
		this.textarea.style.width = (this.width - 2) + "px";
		this.iframearea.style.width = (this.width - 3) + "px";
		this.textarea.style.height = (this.height - this.cornerHeight * 2)+ "px";
		this.iframearea.style.height = (this.height - this.cornerHeight * 2 - 20)+ "px";
		this.header.style.width = (this.width - this.cornerWidth * 2) + "px";
		this.footer.style.width = (this.width - this.cornerWidth * 2) + "px";
		this.footer.style.top = (this.height - this.cornerHeight) + "px";
		this.createPlusMinusIcon();
	}
	if (this.outputPort) {
		this.outputPort.setPosition(this.width + 5, this.height / 2);
	}
	if (this.inputPort) {
		this.inputPort.setPosition(-5, this.height / 2);
	}

	if (this.inputPort2) {
		this.inputPort2.setPosition(this.width / 2, -5);
	}
	if (this.outputPort2) {
		this.outputPort2.setPosition(this.width / 2, this.height + 5);
	}
};
lore.ore.graph.ResourceFigure.prototype.setTitle = function(title) {
	this.header.innerHTML = title;
};

lore.ore.graph.ResourceFigure.prototype.setContent = function(urlparam) {
    var theurl;
	if (urlparam && urlparam !== "") {
		theurl = urlparam;
	} else {
		theurl = "about:blank";
	}
	this.setMetadata(theurl);
	this.setMimeType(theurl);
};

lore.ore.graph.ResourceFigure.prototype.showContent = function() {
	var theurl = this.url;
	var mimetype = this.metadataproperties["dc:format"];
	this.setIcon(theurl);
	if (mimetype && mimetype.match("rdf")) {
		// resource is most likely to be a compound object - don't display content
		// TODO: allow annotations as contained objects as well
		this.iframearea.innerHTML = "<div class='orelink' id='"
				+ this.id
				+ "-data'><a href='#' onclick=\"lore.ore.readRDF('"
				+ theurl
				+ "');\">Compound Object: <br><img src='../../skin/icons/action_go.gif'>&nbsp;Load in LORE</div>";
		var identifierURI = lore.ore.getOREIdentifier(theurl);
		this.metadataarea.innerHTML = "<ul><li class='mimeicon oreicon'>"
				+ identifierURI + "</li></ul>";

	} else if (mimetype && mimetype.match("image")) {
		this.iframearea.innerHTML = "<img id='" + theurl + "-data' src='"
				+ theurl + "' style='width:auto;z-index:-9001' height='95%'>";
	} else if (mimetype && !mimetype.match("pdf")) { // Don't display PDFs in
														// preview
		try {

			var domObj = this.iframearea.firstChild;
			if (domObj) {
				this.iframearea.removeChild(domObj);
			}

			if (this.originalHeight == -1) {
				this.createPreview(theurl);
			}
		} catch (e) {
			lore.debug.ore("iframe(general): " + e, e);
		}
	}
};

lore.ore.graph.ResourceFigure.prototype.createPreview = function(theurl) {
	var iframe = lore.global.util.createSecureIFrame(window.top, theurl);
	/*
	 * function () { if ( this.scrollx != 0 || this.scrolly != 0 ) {
	 * iframe.contentDocument.body.scrollLeft = this.scrollx;
	 * iframe.contentDocument.body.scrollTop = this.scrolly; } });
	 */

	iframe.style.width = "100%";
	iframe.style.height = "100%";
	iframe.name = theurl + "-data";
	iframe.id = theurl + "-data";
	iframe.style.zIndex = "-9001";
	iframe.scrolling = "yes";
	this.iframearea.appendChild(iframe);
};

lore.ore.graph.ResourceFigure.prototype.setMetadata = function(urlparam) {
	this.url = urlparam;
	this.metadataproperties.Resource = urlparam;

	this.metadataarea.innerHTML = "<ul><li id='" + this.id + "-icon'>"
			+ "<a onclick='lore.global.util.launchTab(\"" + urlparam
			+ "\",window);' href='#'>" + urlparam + "</a></li></ul>";

};

lore.ore.graph.ResourceFigure.prototype.setIcon = function(theurl) {
	var mimetype = this.metadataproperties["dc:format"]
			? this.metadataproperties["dc:format"]
			: "text/html";
	this.icontype = "mimeicon ";
    lore.debug.ore("mimetype is" + mimetype,mimetype);
	if (mimetype.match("html")){
		this.icontype += "htmlicon";
    }
	else if (mimetype.match("image")) {
		this.icontype += "imageicon";
	} else if (mimetype.match("audio")) {
		this.icontype += "audioicon";
	} else if (mimetype.match("video") || mimetype.match("flash")){
		this.icontype += "videoicon";
    }
	else if (mimetype.match("pdf")) {
		this.icontype += "pdficon";
	} else {
		this.icontype += "pageicon";
	}
    var icon = document.getElementById(this.id + '-icon');
    if (icon){
	   icon.className = this.icontype;
    }
};
lore.ore.graph.ResourceFigure.prototype.setMimeType = function(theurl) {
	if (!this.metadataproperties["dc:format"]) {
		var req = new XMLHttpRequest();
		req.open('GET', theurl, true);
		var thisobj = this;
		req.onreadystatechange = function() {
			if (req.readyState == 4) {
				var mimetype;
				try {
					mimetype = req.getResponseHeader('Content-Type');
				} catch (e) {
					lore.debug.ore("exception getting mime type", e);
				}
				if (!mimetype){
					mimetype = "text/html";
                }
				thisobj.metadataproperties["dc:format"] = mimetype;
				thisobj.showContent();
			}
		};
		req.send(null);
	} else {
		lore.debug.ore("using stored mimetype for resource figure", this);
		this.showContent();
	}
};

lore.ore.graph.ResourceFigure.prototype.onDragstart = function(x, y) {
	var _4677 = draw2d.Node.prototype.onDragstart.call(this, x, y);
	if (!this.header) {
		return false;
	}
	if (y < this.cornerHeight && x < this.width
			&& x > (this.width - this.cornerWidth)) {
		this.toggle();
		return false;
	}
	// don't allow move by dragging within iframe
	if (x < 0 || y < 0) {
		return false;
	}
	if (this.originalHeight == -1) {
		if (this.canDrag && x < parseInt(this.header.style.width)
				&& y < parseInt(this.header.style.height)) {
			return true;
		}
	} else {
		return _4677;
	}
};

lore.ore.graph.ResourceFigure.prototype.setCanDrag = function(flag) {
	draw2d.Node.prototype.setCanDrag.call(this, flag);
	this.html.style.cursor = "";
	if (!this.header) {
		return;
	}
	if (flag) {
		this.header.style.cursor = "move";
	} else {
		this.header.style.cursor = "";
	}
};
lore.ore.graph.ResourceFigure.prototype.setWorkflow = function(wf) {
	draw2d.Node.prototype.setWorkflow.call(this, wf);
	if (wf && !this.inputPort) {
		var orange = new draw2d.Color(255, 204, 51);
		var grey = new draw2d.Color(174, 174, 174);
		this.inputPort = new lore.ore.graph.Port();
		this.inputPort.setWorkflow(wf);
		this.inputPort.setName("input");
		this.inputPort.setBackgroundColor(orange);
		this.inputPort.setColor(grey);
		this.addPort(this.inputPort, -5, this.height / 2);

		this.inputPort2 = new lore.ore.graph.Port();
		this.inputPort2.setWorkflow(wf);
		this.inputPort2.setName("input2");
		this.inputPort2.setBackgroundColor(orange);
		this.inputPort2.setColor(grey);
		this.addPort(this.inputPort2, this.width / 2, -5);

		this.outputPort = new lore.ore.graph.Port();
		this.outputPort.setWorkflow(wf);
		this.outputPort.setName("output");
		this.outputPort.setBackgroundColor(orange);
		this.outputPort.setColor(grey);
		this.addPort(this.outputPort, this.width + 5, this.height / 2);

		this.outputPort2 = new lore.ore.graph.Port();
		this.outputPort2.setWorkflow(wf);
		this.outputPort2.setName("output2");
		this.outputPort2.setBackgroundColor(orange);
		this.outputPort2.setColor(grey);
		this.addPort(this.outputPort2, this.width / 2, this.height + 5);

	}
};

lore.ore.graph.ResourceFigure.prototype.toggle = function() {
	if (this.originalHeight == -1) {
		this.originalHeight = this.height;
		this.iframearea.style.display = "none";
		var newHeight = this.metadataarea.offsetHeight
				+ this.header.offsetHeight + this.footer.offsetHeight - 4;
		this.setDimension(this.width, newHeight);
		// this.setResizeable(false);
	} else {
		this.setDimension(this.width, this.originalHeight);
		if (!this.iframearea.firstChild
				&& !this.metadataproperties["dc:format"].match("pdf")) {
			this.createPreview(this.url);
		}
		this.iframearea.style.display = "block";
		this.originalHeight = -1;
		// this.setResizeable(true);
	}
	this.createPlusMinusIcon();
};

lore.ore.graph.clearFields = function() {
	this.scrollx = 0;
	this.scrolly = 0;
};

lore.ore.graph.ResourceFigure.prototype.updateMetadata = function(source) {
	this.metadataproperties = source;
	if (source.Resource != this.url) {
		clearFields();
		this.setContent(source.Resource);
	}
	if (source["dc:title"]) {
		clearFields();
		this.setTitle(source["dc:title"]);
	}
};
lore.ore.graph.ResourceFigure.prototype.createPlusMinusIcon = function() {
	if (this.originalHeight == -1) {
		this.top_right.style.background = "url(chrome://lore/skin/resourcenodecircleminus.gif) no-repeat top right";
	} else {
		this.top_right.style.background = "url(chrome://lore/skin/resourcenodecircleplus.gif) no-repeat top right";
	}
};
lore.ore.graph.ResourceFigure.prototype.getContextMenu = function() {
	var menu = new draw2d.Menu();
	var oThis = this;

	var thisfig = this;
	if (!this.metadataproperties["dc:format"].match("rdf")) {
		menu.appendMenuItem(new draw2d.MenuItem(
				"Open resource in separate window", null, function() {
					lore.global.util.launchWindow(thisfig.url, true, window);
				}));
	}
	if (Ext.getCmp("remexploreview")) {
		menu.appendMenuItem(new draw2d.MenuItem("Show in explore view", null,
				function() {
					lore.ore.ui.oreviews.activate("remexploreview");
					if (thisfig.url) {
						lore.ore.exploreLoaded = thisfig.url;
						lore.ore.explore.showInExploreView(thisfig.url,
								thisfig.metadataproperties["dc:title"]);
					}
				}));
	}
	return menu;
};

// Override onKeyDown to cater for Macs without delete
lore.ore.graph.ResourceFigure.prototype.onKeyDown = function (keyCode, ctrl){
  lore.debug.ore("ResourceFigure onKeyDown " + keyCode,ctrl);
  // on delete or backspace
  if(keyCode==46 || keyCode==8){ 
     this.workflow.getCommandStack().execute(this.createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.DELETE)));
  }
  if(ctrl)
     this.workflow.onKeyDown(keyCode,ctrl);
};
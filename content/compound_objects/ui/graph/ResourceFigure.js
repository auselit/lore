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
/**
 * Displays a resource identified by a url and stored associated metadata
 * @class lore.ore.ui.graph.ResourceFigure
 * @extends draw2d.Node
 * @param {Object} initprops initial properties
 */
lore.ore.ui.graph.ResourceFigure = function(initprops) {
	this.cornerWidth = 15;
	this.cornerHeight = 14.5;
    this.originalHeight = -1;
	this.scrollx = 0;
	this.scrolly = 0;
    this.metadataproperties = initprops || {}
    if(!this.metadataproperties["resource_0"]){
        this.metadataproperties["resource_0"] = "";
    }
    if (!this.metadataproperties["dc:title_0"]){
        this.metadataproperties["dc:title_0"] = "";
    }
    this.url = this.metadataproperties["resource_0"];
	draw2d.Node.call(this);
	this.setDimension(250, 150);
    var title = this.metadataproperties["dc:title_0"];
    this.setTitle((title? title : 'Resource'));
};

lore.ore.ui.graph.ResourceFigure.prototype = new draw2d.Node;
lore.ore.ui.graph.ResourceFigure.prototype.type = "lore.ore.ui.graph.ResourceFigure";
/**
 * Create the HTML to represent the figure
 * @private
 * @return {}
 */
lore.ore.ui.graph.ResourceFigure.prototype.createHTMLElement = function() {
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
	this.footer.style.backgroundColor = "white";
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
    this.metadataarea.style.overflow = "hidden";
    this.uriexpander = "<img class=\"hideuri\" style=\"margin-left:-7px\" onclick=\"if(this.className){this.className = '';this.parentNode.parentNode.className='';} else {this.className = 'hideuri';this.parentNode.parentNode.className='hideuribox';}\" src=\"../../skin/icons/bullet_arrow_down.png\">";
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
/**
 * Set the dimensions of the figure
 * @param {number} w Width in pixels
 * @param {number} h Height in pixels
 */
lore.ore.ui.graph.ResourceFigure.prototype.setDimension = function(w, h) {
	draw2d.Node.prototype.setDimension.call(this, w, h);
	if (this.top_left) {
		this.top_right.style.left = (this.width - this.cornerWidth) + "px";
		this.bottom_right.style.left = (this.width - this.cornerWidth) + "px";
		this.bottom_right.style.top = (this.height - this.cornerHeight) + "px";
		this.bottom_left.style.top = (this.height - this.cornerHeight) + "px";
		this.textarea.style.width = (this.width - 2) + "px";
		this.iframearea.style.width = (this.width - 2) + "px";
		this.textarea.style.height = (this.height - this.cornerHeight * 2)+ "px";
		this.iframearea.style.height = (this.height - this.cornerHeight * 2 - 21)+ "px";
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
/**
 * Set the title in the header of the figure
 * @param {string} title
 */
lore.ore.ui.graph.ResourceFigure.prototype.setTitle = function(title) {
    //lore.debug.ore("ResourceFigure: setTitle " + title);
	this.header.innerHTML = title;
};
/**
 * Set the URL of the resource represented by this figure
 * @param {string} urlparam The URL of the resource
 */
lore.ore.ui.graph.ResourceFigure.prototype.setContent = function(urlparam) {
    var theurl;
	if (urlparam && urlparam !== "") {
		theurl = urlparam;
	} else {
		theurl = "about:blank";
	}
	this.setResourceURL(theurl);
	this.setMimeType(theurl);
    this.setRdfType(theurl);
};
/**
 * Loads the content URL into the preview area
 */
lore.ore.ui.graph.ResourceFigure.prototype.showContent = function() {
	var theurl = this.url;
	var mimetype = this.metadataproperties["dc:format_0"];
    var rdftype = this.metadataproperties["rdf:type_0"];
    this.setIcon(theurl);
	if (mimetype && mimetype.match("rdf")){
        if (rdftype && rdftype.match("ResourceMap")) {
    
			this.iframearea.innerHTML = "<div class='orelink' id='"
					+ this.id
					+ "-data'><a href='#' onclick=\"lore.ore.readRDF('"
					+ theurl
					+ "');\">Compound Object: <br><img src='../../skin/icons/action_go.gif'>&nbsp;Load in LORE</a></div>";
			var identifierURI = lore.ore.getOREIdentifier(theurl);
			this.metadataarea.innerHTML = "<ul class='hideuribox'><li title='" + identifierURI +"' class='mimeicon oreicon'>"
                + this.uriexpander
				+ identifierURI + "</li></ul>";
        } else {
            this.iframearea.innerHTML = "<p style='padding-top:20px;text-align:center;color:#51666b'>RDF document (no preview available)</p>";
        }
    
	} else if (mimetype && mimetype.match("application/xml")){
        // if it is an annotation, add a stylesheet parameter
        var stylesheet = "danno_useStylesheet="; // danno will use default stylesheet
        var displayUrl = theurl;
        try{
        if ((rdftype  && (rdftype.match(lore.constants.NAMESPACES["annotype"]) || 
                    rdftype.match(lore.constants.NAMESPACES["vanno"]) ||
                    rdftype.match(lore.constants.NAMESPACES["annoreply"])))){ 
                        
            if (theurl.match("\\?")&& !theurl.match("danno_useStylesheet")){
                displayUrl = theurl + "&" + stylesheet;
                
            } else {
                displayUrl = theurl + "?" + stylesheet;
            }
            var domObj = this.iframearea.firstChild;
            if (domObj) {
                this.iframearea.removeChild(domObj);
            }
            if (this.originalHeight == -1) {
                this.createPreview(displayUrl);
            }
        } else {
            this.iframearea.innerHTML = "<p style='padding-top:20px;text-align:center;color:#51666b'>XML document (no preview available)</p>";
        }
        } catch (ex){
            lore.debug.ore("problem displaying annotation",ex);
        }
    } else if (mimetype && mimetype.match("pdf")) {
        // Don't display PDFs in preview
        this.iframearea.innerHTML = "<p style='padding-top:20px;text-align:center;color:#51666b'>PDF document (no preview available)</p>";
    }
    else if (mimetype && (mimetype.match("x-shockwave-flash") || mimetype.match("video"))){
        // use object tag to preview videos as plugins are disabled in secure iframe
        // TODO: check if it is from a trusted source eg youtube, google video, 
        // otherwise create link to watch in browser frame
        this.iframearea.innerHTML="<object name='" + theurl 
            + "-data' id='" + theurl + "-data' data='" 
            + theurl + "' style='z-index:-9001' width='100%' height='100%'></object>"; 
    } else if (mimetype && mimetype.match("image")) {
    
		this.iframearea.innerHTML = "<img id='" + theurl + "-data' src='"
				+ theurl + "' style='width:auto;z-index:-9001' height='95%'>";
	} else  { // All other resources displayed in secure iframe 
        var displayUrl = theurl;
         if (theurl.match("austlit.edu.au") && (theurl.match("ex=ShowWork") || theurl.match("ex=ShowAgent"))) {
            displayUrl = theurl + "&printPreview=y";
         }
		try {
			var domObj = this.iframearea.firstChild;
			if (domObj) {
				this.iframearea.removeChild(domObj);
			}

			if (this.originalHeight == -1) {
				this.createPreview(displayUrl);
			}
		} catch (e) {
			lore.debug.ore("ResourceFigure: iframe(general): " + e, e);
		}
	}
};
/**
 * Creates a secure iframe to be used to display the content URL
 * @param {string} theurl
 */
lore.ore.ui.graph.ResourceFigure.prototype.createPreview = function(theurl) {
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
/**
 * Set the URL of the resource represented by this figure
 * @param {string} urlparam
 */
lore.ore.ui.graph.ResourceFigure.prototype.setResourceURL = function(urlparam) {
	this.url = urlparam;
	this.metadataproperties["resource_0"] = urlparam;
	this.metadataarea.innerHTML = "<ul class='hideuribox'><li id='" + this.id + "-icon'>"
            + this.uriexpander
			+ "<a title='" + urlparam +"' onclick='lore.global.util.launchTab(\"" + urlparam
			+ "\",window);' href='#'>" + urlparam + "</a></li></ul>";
    //lore.debug.ore("set url to " + urlparam,this.metadataarea.innerHTML);

};
/**
 * Displays an icon depending on the mimetype of the resource
 */
lore.ore.ui.graph.ResourceFigure.prototype.setIcon = function() {
	var mimetype = this.metadataproperties["dc:format_0"]
			? this.metadataproperties["dc:format_0"]
			: "text/html";
	this.icontype = "mimeicon ";
    //lore.debug.ore("ResourceFigure: mimetype is" + mimetype,mimetype);
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
/**
 * 
 * @param {} theurl
 */
lore.ore.ui.graph.ResourceFigure.prototype.setRdfType = function(theurl){
    if (!this.metadataproperties["rdf:type_0"]){
        if (theurl.match(lore.ore.annoServer)){
            // TODO: could parse xml to support any annotation server
            //this.metadataproperties["rdf:type_0"] = "";
            // How to determine the correct type? eg reply vs comment vs explanation
        } 
        // TODO: try to determine if it's a compound object
    }
}
/**
 * Determine the mime type of the resource and use to populate dc:format property
 * @param {} theurl
 */
lore.ore.ui.graph.ResourceFigure.prototype.setMimeType = function(theurl) {
	if (!this.metadataproperties["dc:format_0"]) { 
		var req = new XMLHttpRequest();
		req.open('GET', theurl, true);
		var thisobj = this;
		req.onreadystatechange = function() {
			if (req.readyState == 4) {
				var mimetype;
				try {
					mimetype = req.getResponseHeader('Content-Type');
				} catch (e) {
					lore.debug.ore("ResourceFigure: exception getting mime type", e);
				}
				if (!mimetype){
					mimetype = "text/html";
                }
				thisobj.metadataproperties["dc:format_0"] = mimetype;
                //lore.debug.ore("ResourceFigure: determined mimetype as " + mimetype,this);
				thisobj.showContent();
			}
		};
		req.send(null);
	} else {
		//lore.debug.ore("ResourceFigure: using stored mimetype for resource figure", this);
		this.showContent();
	}
};
/** Bring figure to front, masking all others - for moving, resizing etc */
lore.ore.ui.graph.ResourceFigure.prototype.raise = function(){
    this.iframearea.style.display="none";
    this.oldZ = this.getZOrder();
    this.setZOrder(10000);
    this.workflow.showMask();
};
/** Restore figure and unmask all others */
lore.ore.ui.graph.ResourceFigure.prototype.lower = function(){
    if (this.oldZ){
        this.setZOrder(this.oldZ);
        delete this.oldZ;
   } 
   this.iframearea.style.display = "block";
   this.workflow.hideMask();
};
/**
 * Override onDragstart to bring node to front and hide preview while dragging.
 * Also check if node should be toggled
 * @param {} x
 * @param {} y
 * @return {Boolean}
 */
lore.ore.ui.graph.ResourceFigure.prototype.onDragstart = function(x, y) {
	var superResult = draw2d.Node.prototype.onDragstart.call(this, x, y);
	if (!this.header) {
		return false;
	}
	if (y < this.cornerHeight && x < this.width
			&& x > (this.width - this.cornerWidth)) {
		this.toggle();
		return false;
	}
	// don't allow move by dragging within iframe or metadataarea
	if (x < 0 || y < 0 || y >= (this.header.offsetHeight - 2)) {
		return false;
	}
    this.raise();
	if (this.originalHeight == -1) {
		if (this.canDrag && x < parseInt(this.header.style.width)
				&& y < parseInt(this.header.style.height)) {
			return true;
		}
	} else {
		return superResult;
	}
};
lore.ore.ui.graph.ResourceFigure.prototype.getMinWidth = function(){
    return 80;
};
lore.ore.ui.graph.ResourceFigure.prototype.getMinHeight = function(){
    return 48;
};
/**
 * Override onDragend to reset ZOrder and redisplay preview
 */
lore.ore.ui.graph.ResourceFigure.prototype.onDragend = function(){
   this.lower();
   draw2d.Node.prototype.onDragend.call(this);
};
/**
 * 
 * @param {} flag
 */
lore.ore.ui.graph.ResourceFigure.prototype.setCanDrag = function(flag) {
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
/**
 * 
 * @param {lore.ore.ui.graph.COGraph} wf The parent draw2d.Workflow object 
 */
lore.ore.ui.graph.ResourceFigure.prototype.setWorkflow = function(wf) {
	draw2d.Node.prototype.setWorkflow.call(this, wf);
    if (this.getZOrder() == draw2d.Figure.ZOrderBaseIndex && wf){
        this.setZOrder(draw2d.Figure.ZOrderBaseIndex + wf.getDocument().getFigures().getSize());
    }
	if (wf && !this.inputPort) {
		this.inputPort = new lore.ore.ui.graph.Port();
		this.inputPort.setWorkflow(wf);
		this.inputPort.setName("input");
		this.addPort(this.inputPort, -5, this.height / 2);

		this.inputPort2 = new lore.ore.ui.graph.Port();
		this.inputPort2.setWorkflow(wf);
		this.inputPort2.setName("input2");
		this.addPort(this.inputPort2, this.width / 2, -5);

		this.outputPort = new lore.ore.ui.graph.Port();
		this.outputPort.setWorkflow(wf);
		this.outputPort.setName("output");
		this.addPort(this.outputPort, this.width + 5, this.height / 2);

		this.outputPort2 = new lore.ore.ui.graph.Port();
		this.outputPort2.setWorkflow(wf);
		this.outputPort2.setName("output2");
		this.addPort(this.outputPort2, this.width / 2, this.height + 5);

	}
};

/** Determine if figure needs to be resized (after toggling or URI hiding 
 * @private
 */
lore.ore.ui.graph.ResourceFigure.prototype.recalcDimensions = function (){
    var newHeight = this.header.offsetHeight 
        + this.metadataarea.offsetHeight
        + this.iframearea.offsetHeight
        + this.footer.offsetHeight - 4; 
    this.setDimension(this.width, newHeight);
}
/**
 * Toggle whether the figure is open or closed
 */
lore.ore.ui.graph.ResourceFigure.prototype.toggle = function() {
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
				&& !this.metadataproperties["dc:format_0"].match("pdf")) {
			this.createPreview(this.url);
		}
		this.iframearea.style.display = "block";
		this.originalHeight = -1;
		// this.setResizeable(true);
	}
	this.createPlusMinusIcon();
};
/**
 * 
 */
lore.ore.ui.graph.clearFields = function() {
	this.scrollx = 0;
	this.scrolly = 0;
};
/** Append a property to the metadata properties
 * @param {} pname The name of the property to append eg dc:title
 * @param {} pval The value of the property
 */
lore.ore.ui.graph.ResourceFigure.prototype.appendProperty = function(pname, pval){
    var counter = 0;
    var oldrdftype = this.metadataproperties["rdf:type_0"];
    var prop = this.metadataproperties[pname + "_" + counter];
    while (prop) {
        counter = counter + 1;
        prop = this.metadataproperties[pname + "_" + counter];
    }
    this.metadataproperties[(pname + "_" + counter)] = pval;
    // if the rdf:type has changed, call show content (as it might be an annotation or compound object
    if (oldrdftype != pval){
        this.showContent();
    }
};
/** 
 * Set (or add) a property with a specific id
 * @param {} pid The id of the metadataproperty eg dc:title_0
 * @param {} pval The value of the property
 */
lore.ore.ui.graph.ResourceFigure.prototype.setProperty = function (pid, pval){
  
  var oldval = this.metadataproperties[pid];
  //lore.debug.ore("ResourceFigure: setProperty " + pid + " " + pval,this);
  this.metadataproperties[pid] = pval;
  if (pid == "resource_0" && pval != oldval){
    this.setContent(pval);
  } else if (pid == "dc:title_0" && pval != oldval){
    if (pval && pval != ""){
        this.setTitle(pval);
    } else {
        this.setTitle("Resource");
    }
  }
};
/**
 * Unset (remove) a property by id
 * @param {} pid The id of the property eg dc:title_0
 */
lore.ore.ui.graph.ResourceFigure.prototype.unsetProperty = function(pid){
    delete this.metadataproperties[pid];
    if (pid == "dc:title_0"){
        // TODO: #2 (refactor) : store properties as arrays instead (this will leave gaps if there are lots of values for this property)
 
            this.setTitle("Resource");
    }
    
}
/**
 * Get a property
 * @param {string} pid Fully qualified property index eg dc:format_0
 * @return {} the property value
 */
lore.ore.ui.graph.ResourceFigure.prototype.getProperty = function(pid){
    return this.metadataproperties[pid];
}
/**
 * Generate the markup for the plus/minus icon used to toggle the preview area
 * @private
 */
lore.ore.ui.graph.ResourceFigure.prototype.createPlusMinusIcon = function() {
	if (this.originalHeight == -1) {
		this.top_right.style.background = "url(chrome://lore/skin/resourcenodecircleminus.gif) no-repeat top right";
	} else {
		this.top_right.style.background = "url(chrome://lore/skin/resourcenodecircleplus.gif) no-repeat top right";
	}
};
/** Generate a context menu for the figure
 * @return {draw2d.Menu} the context menu
 */
lore.ore.ui.graph.ResourceFigure.prototype.getContextMenu = function() {
	var menu = new draw2d.Menu();
    var w = this.workflow;
	var thisfig = this;
    if(thisfig.isSelectable()) {
        w.showResizeHandles(thisfig);
        w.setCurrentSelection(thisfig);
    }
    
    menu.appendMenuItem(new draw2d.MenuItem("Copy URI to clipboard", null,
        function (){
            lore.global.util.copyToClip(thisfig.url);
            lore.ore.ui.loreInfo("URI copied to clipboard: " + thisfig.url);
        }
    ));
    
	if (!this.metadataproperties["dc:format_0"].match("rdf")) {
		menu.appendMenuItem(new draw2d.MenuItem(
				"Open resource in separate window", null, function() {
					lore.global.util.launchWindow(thisfig.url, true, window);
				}));
	}
    menu.appendMenuItem(new draw2d.MenuItem("Show in Narrative view", null,
        function (){
            // TODO jump to resource in summary view
        }
    ));
	if (Ext.getCmp("remexploreview")) {
		menu.appendMenuItem(new draw2d.MenuItem("Show in Explore view", null,
				function() {
					Ext.getCmp("loreviews").activate("remexploreview");
                    
                    var rdftype = thisfig.metadataproperties["rdf:type_0"];
                    var isCO = (rdftype && rdftype.match("ResourceMap"));
                    var title = thisfig.metadataproperties["dc:title_0"];
                    if (!title) title = thisfig.url;
					if (thisfig.url) {
						lore.ore.exploreLoaded = thisfig.url;
						lore.ore.explore.showInExploreView(thisfig.url, title, isCO);
					}
				}));
	}
    menu.appendMenuItem(new draw2d.MenuItem("Show in Slideshow view", null,
        function (){
            // TODO jump to resource in summary view
        }
    ));
	return menu;
};

/** Override onKeyDown to cater for Macs without delete
 * @param {} keyCode
 * @param {} ctrl
 */
lore.ore.ui.graph.ResourceFigure.prototype.onKeyDown = function (keyCode, ctrl){
  //lore.debug.ore("ResourceFigure: onKeyDown " + keyCode,ctrl);
  // on delete or backspace
  if(keyCode==46 || keyCode==8){ 
     this.workflow.getCommandStack().execute(this.createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.DELETE)));
  }
  if(ctrl)
     this.workflow.onKeyDown(keyCode,ctrl);
};

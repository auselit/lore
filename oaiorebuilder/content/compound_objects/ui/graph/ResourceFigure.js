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
 * @class lore.ore.ui.graph.ResourceFigure Displays a resource identified by a url and stored associated metadata
 * @extends draw2d.Node
 * @param {Object} initprops initial properties
 */
lore.ore.ui.graph.ResourceFigure = function(initprops) {
	this.cornerWidth = 15;
	this.cornerHeight = 14.5;
	this.originalHeight = -1;
	this.abstractPreview = false;
	this.scrollx = 0;
	this.scrolly = 0;
	this.metadataproperties = initprops || {}
	if (!this.metadataproperties["resource_0"]) {
		this.metadataproperties["resource_0"] = "";
	}
	if (!(this.metadataproperties["dc:title_0"] || this.metadataproperties["dcterms:title_0"])) {
		this.metadataproperties["dc:title_0"] = "";
	}
	this.url = this.metadataproperties["resource_0"];
	draw2d.Node.call(this);
	this.setDimension(220, 170);
	var title = this.metadataproperties["dc:title_0"]
			|| this.metadataproperties["dcterms:title_0"];
	var abs = this.metadataproperties["dcterms:abstract_0"] || "";
	this.setTitle((title ? title : 'Resource'));
	this.setAbstract(abs);
	this.hasPreview = false;
};
Ext.extend(lore.ore.ui.graph.ResourceFigure, draw2d.Node, {
	type : "lore.ore.ui.graph.ResourceFigure",
	/**
	 * Create the HTML to represent the figure
	 * @private
	 * @return {}
	 */
	createHTMLElement : function() {
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
		this.top_right.title = "Collapse/expand preview";
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
		this.top_left.className = "co-tl";
		this.bottom_left.className = "co-bl";
		this.bottom_right.className = "co-br";
		this.header.style.position = "absolute";
		this.header.style.left = this.cornerWidth + "px";
		this.header.style.top = "0px";
		this.header.style.height = (this.cornerHeight) + "px";
		this.header.className = "x-unselectable co-header";
		this.footer = document.createElement("div");
		this.footer.style.position = "absolute";
		this.footer.style.left = this.cornerWidth + "px";
		this.footer.style.top = "0px";
		this.footer.style.height = (this.cornerHeight - 2) + "px";
		this.footer.className = "co-footer";
		this.textarea = document.createElement("div");
		this.textarea.style.position = "absolute";
		this.textarea.style.left = "0px";
		this.textarea.style.top = this.cornerHeight + "px";
		this.textarea.className = "co-preview";
		this.metadataarea = document.createElement("div");
		this.metadataarea.className = "co-uri";
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
	},
    /** 
     * Returns true if this figure has been collapsed
     * @return {boolean}
     */
	isCollapsed : function() {
		return this.originalHeight != -1;
	},
	/**
	 * Set the dimensions of the figure
	 * 
	 * @param {number} w Width in pixels
	 * @param {number} h Height in pixels
	 */
	setDimension : function(w, h) {
		// override height if node is collapsed
		if (this.isCollapsed()) {
			h = this.metadataarea.offsetHeight + this.header.offsetHeight
					+ this.footer.offsetHeight - 4;
		}
		draw2d.Node.prototype.setDimension.call(this, w, h);
		if (this.top_left) {
			this.top_right.style.left = (this.width - this.cornerWidth) + "px";
			this.bottom_right.style.left = (this.width - this.cornerWidth)
					+ "px";
			this.bottom_right.style.top = (this.height - this.cornerHeight)
					+ "px";
			this.bottom_left.style.top = (this.height - this.cornerHeight)
					+ "px";
			this.textarea.style.width = (this.width - 2) + "px";
			this.iframearea.style.width = (this.width - 2) + "px";
			this.textarea.style.height = (this.height - this.cornerHeight * 2)
					+ "px";
			this.iframearea.style.height = (this.height - this.cornerHeight * 2 - 21)
					+ "px";
			this.header.style.width = (this.width - this.cornerWidth * 2)
					+ "px";
			this.footer.style.width = (this.width - this.cornerWidth * 2)
					+ "px";
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
	},
	/**
	 * Set the title in the header of the figure
	 * 
	 * @param {string} title
	 */
	setTitle : function(title) {
		this.header.innerHTML = title;
		
	},
	setAbstract: function(abs) {
		this.header.title = abs;
		if (this.abstractPreview) {
			if (abs && abs !=""){
				this.iframearea.innerHTML = "<div class='nodeabstract'>" + abs + "</div>";
			} else {
				this.iframearea.innerHTML = "<div class='nodeabstract'>(No abstract)</div>";
			}
		}
	},
	/**
	 * Set the URL of the resource represented by this figure
	 * 
	 * @param {string} urlparam The URL of the resource
	 */
	setContent : function(urlparam) {
		var theurl;
		if (urlparam && urlparam !== "") {
			theurl = urlparam;
		} else {
			theurl = "about:blank";
		}
		this.setResourceURL(theurl);
		this.setMimeType(theurl);
	},
	/**
	 * Loads the content URL into the preview area
	 */
	showContent : function() {
		var theurl = this.url;
		var mimetype = this.metadataproperties["dc:format_0"];
		var rdftype = this.metadataproperties["rdf:type_0"];
		this.setIcon(theurl);
		if (this.hasPreview) {
			lore.debug.ore("Regenerating node preview " + this.url, this);
		} else {
			this.hasPreview = true;
		}
		if (this.abstractPreview){
			this.iframearea.innerHTML = "<div class='nodeabstract'>" + (this.metadataproperties["dcterms:abstract_0"] || "(No abstract)") + "</div>";
		} else if (rdftype && rdftype.match("ResourceMap")) {
			this.iframearea.innerHTML = "<div class='orelink' id='"
					+ this.id
					+ "-data'><a href='#' onclick=\"lore.ore.controller.loadCompoundObjectFromURL('"
					+ theurl
					+ "');\">Compound Object: <br><img src='../../skin/icons/action_go.gif'>&nbsp;Load in LORE</a></div>";

			this.metadataarea.innerHTML = "<ul class='hideuribox'><li title='"
					+ theurl
					+ "' class='mimeicon oreicon'>"
					+ this.uriexpander
					+ "<a onclick='lore.ore.controller.loadCompoundObjectFromURL(\""
					+ theurl + "\");' href='#'>" + theurl + "</a></li></ul>";
		} else if (mimetype && mimetype.match("rdf")) {
			this.iframearea.innerHTML = "<p style='padding-top:20px;text-align:center;'>RDF document (no preview available)</p>";
		} else if (rdftype
				&& (rdftype.match(lore.constants.NAMESPACES["annotype"])
						|| rdftype.match(lore.constants.NAMESPACES["vanno"]) || rdftype
						.match(lore.constants.NAMESPACES["annoreply"]))) {

			// if it is an annotation, add a stylesheet parameter
			var stylesheet = "danno_useStylesheet="; // danno will use
														// default stylesheet
			var displayUrl = theurl;
			if (theurl.match("\\?") && !theurl.match("danno_useStylesheet")) {
				displayUrl = theurl + "&" + stylesheet;
			} else {
				displayUrl = theurl + "?" + stylesheet;
			}

			var domObj = this.iframearea.firstChild;
			if (domObj) {
				this.iframearea.removeChild(domObj);
			}
			if (!this.isCollapsed()) {
				this.createPreview(displayUrl);
			}
			this.metadataarea.innerHTML = "<ul class='hideuribox'><li id='"
					+ this.id + "-icon'>" + this.uriexpander + "<a title='"
					+ theurl + "' onclick='lore.global.util.launchTab(\""
					+ displayUrl + "\",window);' href='#'>" + theurl
					+ "</a></li></ul>";
		} else if (mimetype && mimetype.match("application/xml")) {
			this.iframearea.innerHTML = "<p style='padding-top:20px;text-align:center;'>XML document (no preview available)</p>";
		} else if (mimetype && mimetype.match("pdf")) {
			// Don't display PDFs in preview
			this.iframearea.innerHTML = "<p style='padding-top:20px;text-align:center;'>PDF document (no preview available)</p>";
		} else if (mimetype
				&& (mimetype.match("x-shockwave-flash") || mimetype
						.match("video"))) {
			// use object tag to preview videos as plugins are disabled in
			// secure iframe
			// TODO: check if it is from a trusted source eg youtube, google
			// video,
			// otherwise create link to watch in browser frame
			this.iframearea.innerHTML = "<object name='"
					+ theurl
					+ "-data' id='"
					+ theurl
					+ "-data' data='"
					+ theurl
					+ "' style='z-index:-9001' width='100%' height='100%'></object>";
		} else if (mimetype && mimetype.match("image")) {
			this.iframearea.innerHTML = "<img onclick='var e = arguments[0];lore.global.util.launchTab(this.getAttribute(\"src\"),window);e.stopPropagation();return false' id='"
					+ theurl
					+ "-data' src='"
					+ theurl
					+ "' style='width:auto;z-index:-9001' height='95%'>";
		} else { // All other resources displayed in secure iframe
			var displayUrl = theurl;
			if (theurl.match("austlit.edu.au")
					&& (theurl.match("ex=ShowWork") || theurl
							.match("ex=ShowAgent"))) {
				displayUrl = theurl + "&printPreview=y";
			}
			try {
				var domObj = this.iframearea.firstChild;
				if (domObj) {
					this.iframearea.removeChild(domObj);
				}
				if (!this.isCollapsed()) {
					this.createPreview(displayUrl);
				}
			} catch (e) {
				lore.debug.ore("ResourceFigure: iframe(general): " + e, e);
			}
		}
	},
	/**
	 * Creates a secure iframe to be used to display the content URL
	 * 
	 * @param {string} theurl
	 */
	createPreview : function(theurl) {
		var iframe;
		if (theurl.match("^http") == "http") {
			iframe = lore.global.util.createSecureIFrame(window.top, theurl);
		} else {
			iframe = lore.global.util.createSecureIFrame(window.top,
					"about:blank");
		}
		/*
		 * function () { if ( this.scrollx != 0 || this.scrolly != 0 ) {
		 * iframe.contentDocument.body.scrollLeft = this.scrollx;
		 * iframe.contentDocument.body.scrollTop = this.scrolly; } });
		 */

		iframe.style.width = "100%";
		iframe.style.height = "100%";
		iframe.name = theurl + "-data";
		iframe.id = theurl + "-data";
		this.iframe = iframe;
		this.iframearea.appendChild(iframe);
	},
	/**
	 * Set the URL of the resource represented by this figure
	 * 
	 * @param {string} urlparam
	 */
	setResourceURL : function(urlparam) {
		this.url = urlparam;
		this.metadataproperties["resource_0"] = urlparam;
		this.metadataarea.innerHTML = "<ul class='hideuribox'><li id='"
				+ this.id + "-icon'>" + this.uriexpander + "<a title='"
				+ urlparam + "' onclick='lore.global.util.launchTab(\""
				+ urlparam + "\",window);' href='#'>" + urlparam
				+ "</a></li></ul>";
	},
	/**
	 * Displays an icon depending on the mimetype of the resource
	 */
	setIcon : function() {
		var mimetype = this.metadataproperties["dc:format_0"]
				? this.metadataproperties["dc:format_0"]
				: "text/html";
		this.icontype = "mimeicon ";
		if (mimetype.match("html")) {
			this.icontype += "htmlicon";
		} else if (mimetype.match("image")) {
			this.icontype += "imageicon";
		} else if (mimetype.match("audio")) {
			this.icontype += "audioicon";
		} else if (mimetype.match("video") || mimetype.match("flash")) {
			this.icontype += "videoicon";
		} else if (mimetype.match("pdf")) {
			this.icontype += "pdficon";
		} else {
			this.icontype += "pageicon";
		}
		var icon = document.getElementById(this.id + '-icon');
		if (icon) {
			icon.className = this.icontype;
		}
	},
	/**
	 * Determine the mime type of the resource and use to populate dc:format
	 * property
	 * 
	 * @param {} theurl
	 */
	setMimeType : function(theurl) {
		if (!this.metadataproperties["dc:format_0"]) {
			// If we know it's an annotation or a resource map, set the mime
			// type automatically
			var rdftype = this.metadataproperties["rdf:type_0"];
			if (rdftype && rdftype.match("ResourceMap")) {
				this.metadataproperties["dc:format_0"] = "application/rdf+xml";
				this.showContent();
			} else if ((rdftype && (rdftype
					.match(lore.constants.NAMESPACES["annotype"])
					|| rdftype.match(lore.constants.NAMESPACES["vanno"]) || rdftype
					.match(lore.constants.NAMESPACES["annoreply"])))) {
				this.metadataproperties["dc:format_0"] = "application/xml";
				this.showContent();
			} else {
				// Otherwise, use a HEAD request to find out the content type
				var req = new XMLHttpRequest();
				req.open('HEAD', theurl, true);
				var thisobj = this;
				req.onreadystatechange = function() {
					// TODO: if the HEAD request returns an error, do a get
					// instead
					if (req.readyState == 4) {
						var mimetype;
						try {
							mimetype = req.getResponseHeader('Content-Type');
						} catch (e) {
							lore.debug.ore("ResourceFigure: exception getting mime type", e);
						}
						if (!mimetype) {

							mimetype = "text/html";
						}
						lore.debug.ore("mimetype is " + mimetype, [req,
										req.getAllResponseHeaders()]);
						thisobj.metadataproperties["dc:format_0"] = mimetype;
						thisobj.showContent();
					}
				};
				req.send(null);
			}
		} else {
			this.showContent();
		}
	},
	/** Bring figure to front, masking all others - for moving, resizing etc */
	raise : function() {
		this.iframearea.style.display = "none";
		this.oldZ = this.getZOrder();
		this.setZOrder(10000);
		this.workflow.showMask();
	},
	/** Restore figure and unmask all others */
	lower : function() {
		if (this.oldZ) {
			this.setZOrder(this.oldZ);
			delete this.oldZ;
		}
		this.iframearea.style.display = "block";
		this.workflow.hideMask();
	},
	/**
	 * Override onDragstart to bring node to front and hide preview while
	 * dragging. Also check if node should be toggled
	 * 
	 * @param {} x
	 * @param {} y
	 * @return {Boolean}
	 */
	onDragstart : function(x, y) {
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
		if (!this.isCollapsed()) {
			if (this.canDrag && x < parseInt(this.header.style.width)
					&& y < parseInt(this.header.style.height)) {
				return true;
			}
		} else {
			return superResult;
		}
	},
    /** Return the minimum width */
	getMinWidth : function() {
		return 80;
	},
    /** Return the minimum height */
	getMinHeight : function() {
		return 48;
	},
	/**
	 * Override onDragend to reset ZOrder and redisplay preview
	 */
	onDragend : function() {
		this.lower();
		draw2d.Node.prototype.onDragend.call(this);
	},
	/**
	 * 
	 * @param {}
	 *            flag
	 */
	setCanDrag : function(flag) {
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
	},
    /** Hide or show highlighting of node to indicate selection 
     * @param {boolean} highlight
     */
	setHighlight : function(highlight) {
		if (highlight) {
			this.html.style.border = "3px solid rgb(170,204,246)";
		} else {
			this.html.style.border = "none";
		}
	},
	/**
	 * 
	 * @param {lore.ore.ui.graph.COGraph}  wf The parent draw2d.Workflow object
	 */
	setWorkflow : function(wf) {
		draw2d.Node.prototype.setWorkflow.call(this, wf);
		if (this.getZOrder() == draw2d.Figure.ZOrderBaseIndex && wf) {
			this.setZOrder(draw2d.Figure.ZOrderBaseIndex
					+ wf.getDocument().getFigures().getSize());
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
		this.draggable.removeEventListener("dragstart", this.tmpDragstart);
		var oThis = this;
		// override dragstart to not select figure (we do this by default in
		// setCurrentSelection
		this.tmpDragstart = function(oEvent) {
			var w = oThis.workflow;
			w.showMenu(null);
			// reset old action of the toolbar
			if (w.toolPalette && w.toolPalette.activeTool) {
				oEvent.returnValue = false;
				w.onMouseDown(oThis.x + oEvent.x, oEvent.y + oThis.y);
				w.onMouseUp(oThis.x + oEvent.x, oEvent.y + oThis.y);
				return;
			}
			w.setCurrentSelection(oThis);
			oEvent.returnValue = oThis.onDragstart(oEvent.x, oEvent.y);
		};
		this.draggable.addEventListener("dragstart", this.tmpDragstart);
	},

	/**
	 * Determine if figure needs to be resized (after toggling or URI hiding
	 * 
	 * @private
	 */
	recalcDimensions : function() {
		var newHeight = this.header.offsetHeight
				+ this.metadataarea.offsetHeight + this.iframearea.offsetHeight
				+ this.footer.offsetHeight - 4;
		this.setDimension(this.width, newHeight);
	},
	/**
	 * Toggle whether the figure is open or closed
	 */
	toggle : function() {
		if (!this.isCollapsed()) {
			this.originalHeight = this.height;
			this.iframearea.style.display = "none";
			// don't need to provide height: will be calculated automatically
			this.setDimension(this.width);
		} else {
			var oldHeight = this.originalHeight;
			this.originalHeight = -1;
			this.setDimension(this.width, oldHeight);
			if (!this.iframearea.firstChild) {
				this.showContent();
			}
			this.iframearea.style.display = "block";
		}
	},
	/**
	 * clear the scroll positions
	 */
	clearFields : function() {
		this.scrollx = 0;
		this.scrolly = 0;
	},
	/**
	 * Append a property to the metadata properties
	 * 
	 * @param {} pname The name of the property to append eg dc:title
	 * @param {}  pval The value of the property
	 */
	appendProperty : function(pname, pval) {
		//lore.debug.ore("appendProperty " + pname + " " + this.url, [pval,this]);
		var counter = 0;
		var oldrdftype = this.metadataproperties["rdf:type_0"];
		var prop = this.metadataproperties[pname + "_" + counter];
		while (prop) {
			counter = counter + 1;
			prop = this.metadataproperties[pname + "_" + counter];
		}
		this.metadataproperties[(pname + "_" + counter)] = pval;
		// if the rdf:type has changed, regenerate preview (as it might be an
		// annotation or compound object
		if (pname == "rdf:type" && oldrdftype != pval && this.hasPreview) {
			this.showContent();
		}
	},
	/**
	 * Set (or add) a property with a specific id
	 * 
	 * @param {}  pid The id of the metadataproperty eg dc:title_0
	 * @param {} pval The value of the property
	 */
	setProperty : function(pid, pval) {

		var oldval = this.metadataproperties[pid];
		this.metadataproperties[pid] = pval;
		if (pid == "resource_0" && pval != oldval) {
			delete this.metadataproperties["dc:format_0"];
			this.setContent(pval);
		} else if ((pid == "dc:title_0" || pid == "dcterms:title_0")
				&& pval != oldval) {
			if (pval && pval != "") {
				this.setTitle(pval);
			} else {
				this.setTitle("Resource");
			}
		} else if (pid == "dcterms:abstract_0" && pval != oldval){
			if (pval){
				this.setAbstract(pval);
			} else {
				this.setAbstract("");
			}
		}
	},
	/**
	 * Unset (remove) a property by id
	 * 
	 * @param {} pid The id of the property eg dc:title_0
	 */
	unsetProperty : function(pid) {
		delete this.metadataproperties[pid];
		if (pid == "dc:title_0" || pid == "dcterms:title_0") {
			// TODO: #2 (refactor) : store properties as arrays instead (this
			// will leave gaps if there are lots of values for this property)
			var existingTitle = this.metadataproperties["dc:title_0"]
					|| this.metadataproperties["dcterms:title_0"];
			if (existingTitle) {
				this.setTitle(existingTitle);
			} else {
				this.setTitle("Resource");
			}
		}
		if (pid == "dcterms:abstract_0"){
			this.setAbstract("");
		}

	},
	/**
	 * Get a property
	 * 
	 * @param {string}   pid Fully qualified property index eg dc:format_0
	 * @return {} the property value
	 */
	getProperty : function(pid) {
		return this.metadataproperties[pid];
	},
	/**
	 * Generate the markup for the plus/minus icon used to toggle the preview area
	 * 
	 * @private
	 */
	createPlusMinusIcon : function() {
		if (!this.isCollapsed()) {
			this.top_right.className = "co-tr-minus";
		} else {
			this.top_right.className = "co-tr-plus";
		}
	},
	/**
	 * Show a context menu for the figure
	 * 
	 */
	onContextMenu : function(x, y) {
		var w = this.workflow;
		if (!this.contextmenu) {
            this.contextmenu = new Ext.menu.Menu({
                showSeparator: false
            });
            this.contextmenu.add({
                text: "Copy URI to clipboard",
                icon: "chrome://lore/skin/icons/page_white_paste.png",
                scope: this,
                handler: function(evt){
                	lore.global.util.copyToClip(this.url);
					lore.ore.ui.vp.info("URI copied to clipboard: " + this.url);
                }
             });
            if (this.iframe){
            	this.contextmenu.add({
                    text: "Reset preview",
                    icon: "chrome://lore/skin/icons/arrow_refresh.png",
                    scope: this,
                    handler: function(evt){
                    	if (this.iframe && !this.abstractPreview) {
							this.iframe.contentWindow.location.href = this.iframe.getAttribute("src");
						}
                    }
                 });
            }
            if (!this.metadataproperties["dc:format_0"].match("rdf")) {
            	this.contextmenu.add({
                    text: "Open resource in separate window",
                    icon: "chrome://lore/skin/icons/page_go.png",
                    scope: this,
                    handler: function(evt){
                    	lore.global.util.launchWindow(this.url, true, window);
                    }
                 });
    		}
            this.contextmenu.add({
                text: "Delete resource from Compound Object",
                icon: "chrome://lore/skin/icons/delete.png",
                scope: this,
                handler: function(evt){
                	this.workflow.getCommandStack()
						.execute(this.createCommand(
								new draw2d.EditPolicy(draw2d.EditPolicy.DELETE)));
                }
            });
            this.contextmenu.add("-");
            this.contextmenu.add({
                text: "Show in Resource List",
                icon: "chrome://lore/skin/icons/application_view_detail.png",
                scope: this,
                handler: function(evt){
                	Ext.getCmp("loreviews").activate("remlistview");
					Ext.getCmp("remlistview").selectResource(this.url);
                }
            });
            this.contextmenu.add({
                text: "Show in Slideshow view",
                icon: "chrome://lore/skin/icons/picture_empty.png",
                scope: this,
                handler: function(evt){
                	// TODO: don't hardcode the slideshow id
					Ext.getCmp("loreviews").activate("remslideview");
					Ext.getCmp("newss").setActiveItem(this.url + "_" + lore.ore.cache.getLoadedCompoundObjectUri());
                }
            });
            this.contextmenu.add({
                text: "Show in Explore view",
                icon: "chrome://lore/skin/icons/chart_line.png",
                scope: this,
                handler: function(evt){
                	Ext.getCmp("loreviews").activate("remexploreview");
					var rdftype = this.metadataproperties["rdf:type_0"];
					var isCO = (rdftype && rdftype.match("ResourceMap"));
					var title = this.metadataproperties["dc:title_0"]
							|| this.metadataproperties["dcterms:title_0"];
					if (!title) {
						title = this.url;
					}
					lore.ore.explorePanel.showInExploreView(this.url, title, isCO);
                }
            });
            this.contextmenu.add("-");
            this.contextmenu.add(new Ext.menu.CheckItem({
                text: "Abstract Preview",  
                scope: this,
                checked: this.abstractPreview,
                handler: function(item, evt){
                	if (this.abstractPreview){
    					this.abstractPreview = false;
    					this.showContent();
    				} else {
    					this.abstractPreview = true;
    					this.showContent();
    				}
                }
            }));
		}
		var absx = w.getAbsoluteX() +  x - w.getScrollLeft();
		var absy = w.getAbsoluteY() +  y - w.getScrollTop();
		this.contextmenu.showAt([absx, absy]);
		w.setCurrentSelection(this, false);
         
	},

	/**
	 * Override onKeyDown to cater for Macs without delete
	 * 
	 * @param {} keyCode
	 * @param {}   ctrl
	 */
	onKeyDown : function(keyCode, ctrl) {
		// on delete or backspace
		if (keyCode == 46 || keyCode == 8) {
			this.workflow
					.getCommandStack()
					.execute(this
							.createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.DELETE)));
		}
		if (ctrl) {
			this.workflow.onKeyDown(keyCode, ctrl);
		}
	}
});

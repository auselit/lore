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
    this.NOHIGHLIGHT = "FFFFFF"; // white means no highlight
	this.cornerWidth = 15;
	this.cornerHeight = 14.5;
	this.originalHeight = -1;
	this.abstractPreview = false;
	this.scrollx = 0;
	this.scrolly = 0;
	this.editing = false;
	
	// cached property values : used by graphical editor to load values into property grid
	this.metadataproperties = initprops || {};
	this.highlightColor = this.NOHIGHLIGHT; 
	this.url = this.getProperty("resource_0");
	if (!this.url) {
		this.metadataproperties["resource_0"] = "";
		this.url = "";
	}

	var title = this.getTitle();
	if (!title) {
		this.metadataproperties["dc:title_0"] = "";
		title = "";
	}
	
	draw2d.Node.call(this);
	
	this.createTitleField();
	this.displayTitle((title ? title : 'Untitled Resource'));
	this.setDimension(220, 170);
	var abs = this.getProperty("dcterms:abstract_0") || "";
	this.displayAbstract(abs);
	this.hasPreview = false;
	// use Ext ToolTip instead of title attribute to prevent hiding of abstract after 5 seconds on FF 3.5 and below
	this.tip = new Ext.ToolTip({
		resourceFig: this,
		target: this.header, 
		renderTo: document.body,
		dismissDelay: 0, 
		listeners: {
			beforeshow: function (tip){			
				var abs = tip.resourceFig.getProperty("dcterms:abstract_0");
				if (abs){
					tip.body.dom.innerHTML = abs;
				} else {
					return false;
				}
			}
		}
	});
	Ext.get(this.header).on('dblclick',this.startEditing,this);
    Ext.get(this.menuIcon).on("click", this.onHeaderMenu, this);
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
		this.header.id = 'a' + this.id + "_header";
		this.top_left.className = "co-tl";
		this.bottom_left.className = "co-bl";
		this.bottom_right.className = "co-br";
		this.header.style.position = "absolute";
		this.header.style.left = this.cornerWidth + "px";
		this.header.style.top = "0px";
		this.header.style.height = (this.cornerHeight) + "px";
		this.header.className = "x-unselectable co-header";
        this.menuIcon = document.createElement("div");
        this.menuIcon.style.position = "absolute";
        this.menuIcon.className = "x-unselectable";
        this.menuIcon.title = "Menu";
        this.menuIcon.style.left = "3px";
        this.menuIcon.style.top = "0px";
        this.menuIcon.style.height = (this.cornerHeight) + "px";
        this.menuIcon.innerHTML = "<a class='menuIcon' href='#'><img src='chrome://lore/skin/blank.png'/></a>";
        
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
        item.appendChild(this.menuIcon);
		item.appendChild(this.top_right);
		item.appendChild(this.textarea);
		item.appendChild(this.bottom_left);
		item.appendChild(this.footer);
		item.appendChild(this.bottom_right);
		return item;
	},
	/** Create an editable title field */
	createTitleField : function(){
		this.editField = new Ext.form.TextField({
			width: 200,
			height: 15,
			renderTo: this.html,
			hidden: true,
			style: {
				fontSize: "11px",
				fontFamily: "tahoma, arial, helvetica",
				position:"absolute",
				top: 0,
				left: 10,
				zIndex: "inherit"
			}
		});
		
		this.editField.on("specialkey",function(f,e){	
    		var key = e.getKey();
    		if (e.getKey() == e.ENTER || e.getKey() == e.ESC){
    			// cancel edit if escape is pressed
    			this.stopEditing(key == e.ESC);
    		}
	    	e.stopPropagation();
    	},this);
    	this.editField.on("blur",function(f,n,o){
    			this.stopEditing();
    	},this);
	},
	/** 
     * Stop direct editing of title
     */
    stopEditing : function(cancel){
    	try{
    	if (!cancel && this.editField.isValid()){
    		// update title
    		var t = this.editField.getRawValue();
    		this.setProperty("dc:title_0",t)
    	}
    	this.editField.hide();
    	this.workflow.editingText = false;
    	this.editing = false;
    	} catch (ex){
    		lore.debug.ore("stop editing",ex)
    	}
    },
    /**
     * Start direct editing of relationship
     */
    startEditing : function(){
    	try{
	    	if (this.editing){
	    		return;
	    	}
	    	this.editing = true;
	    	// prevent keystrokes entered into text field being interpreted by editor to move/delete nodes
	    	this.workflow.editingText = true;
			// hide display label
	    	this.displayTitle("");
	    	// display editing field with current value
	    	this.editField.setRawValue(this.getProperty("dc:title_0"));
	    	this.editField.show();	
	    	this.editField.focus();   	
    	} catch (ex){
    		lore.debug.ore("startEditing",ex);
    	}
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
			this.bottom_right.style.left = (this.width - this.cornerWidth) + "px";
			this.bottom_right.style.top = (this.height - this.cornerHeight) + "px";
			this.bottom_left.style.top = (this.height - this.cornerHeight) + "px";
			this.textarea.style.width = (this.width - 2) + "px";
			this.iframearea.style.width = (this.width - 2) + "px";
			this.textarea.style.height = (this.height - this.cornerHeight * 2) + "px";
			this.iframearea.style.height = (this.height - this.cornerHeight * 2 - 21) + "px";
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
	},
	/**
	 * Set the title in the header of the figure
	 * 
	 * @param {string} title
	 */
	displayTitle : function(title) {
		this.header.innerHTML = title;
		
	},
	displayAbstract: function(abs) {
		if (this.abstractPreview) {
			if (abs && abs !=""){
				this.iframearea.innerHTML = "<div class='nodeabstract'>" + abs + "</div>";
			} else {
				this.iframearea.innerHTML = "<div class='nodeabstract'>(No abstract)</div>";
			}
		}
	},
    getHighlightColor: function(){
      if (this.highlightColor != this.NOHIGHLIGHT){
        return this.highlightColor;
      }
    },
    setHighlightColor: function(color){
        this.highlightColor = color;
        if (color != this.NOHIGHLIGHT){
            this.metadataarea.style.backgroundColor = "#" + color;
        } else {
            this.metadataarea.style.backgroundColor = "";
        }
    },
	/**
	 * Set the URL of the resource represented by this figure
	 * 
	 * @param {string} urlparam The URL of the resource
	 */
	setContent : function(urlparam) {
		var theurl;
        this.iframearea.innerHTML = "<div class='nodeabstract'>Loading...</div>";
		if (urlparam && urlparam !== "") {
			theurl = urlparam;
		} else {
			theurl = "about:blank";
		}
		this.setResourceURL(theurl);
		this.setMimeType(theurl);
	},
	setModel : function(modelObj){
        if (this.model){
            var props = this.model.get("properties");
            if (props){
                props.un("propertyChanged",this.handlePropertyChanged, this);
                props.un("propertyRemoved", this.handlePropertyRemoved, this);
            }
        }
		this.model = modelObj;
        var props = modelObj.get("properties");
        if (props){
            props.on("propertyChanged",this.handlePropertyChanged,this);
            props.on("propertyRemoved", this.handlePropertyRemoved, this);
        }
	},
	/**
	 * Loads the content URL into the preview area
	 */
	showContent : function() {
		var theurl = this.url;
		var mimetype = this.getProperty("dc:format_0");
		var rdftype = this.getProperty("rdf:type_0");
		if (this.hasPreview) {
			//lore.debug.ore("Regenerating node preview " + this.url, this);
		} else {
			this.hasPreview = true;
		}
		if (this.abstractPreview){
			this.iframearea.innerHTML = "<div class='nodeabstract'>" + (this.getProperty("dcterms:abstract_0") || "(No abstract)") + "</div>";
		} else if (rdftype && rdftype.match("ResourceMap")) {
			this.iframearea.innerHTML = "<div class='orelink' id='a"
					+ this.id
					+ "-data'><a href='#' onclick=\"lore.ore.controller.loadCompoundObjectFromURL('"
					+ theurl
					+ "');\">Compound Object: <br><img src='../../skin/icons/action_go.gif'>&nbsp;Load in LORE</a></div>";
			this.metadataarea.innerHTML = "<ul class='hideuribox'><li title='Compound Object' class='mimeicon oreicon'>"
					+ this.uriexpander
					+ "<a title='" + theurl + "' onclick='lore.ore.controller.loadCompoundObjectFromURL(\""
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
			this.metadataarea.innerHTML = "<ul class='hideuribox'><li id='a"
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
				lore.debug.ore("ResourceFigure: iframe(general)", e);
			}
		}
        this.setIcon();
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
		if (this.model) {
			this.model.set('uri',urlparam);
			this.model.id = urlparam;
			this.model.commit();
			// Force store to use new ID to index record
			this.model.store.data.replace(urlparam,this.model);	
		} 
		this.metadataproperties["resource_0"] = urlparam;
		this.metadataarea.innerHTML = "<ul class='hideuribox'><li id='a"
				+ this.id + "-icon'>" + this.uriexpander + "<a title='"
				+ urlparam + "' onclick='lore.global.util.launchTab(\""
				+ urlparam + "\",window);' href='#'>" + lore.global.util.escapeHTML(urlparam)
				+ "</a></li></ul>";
	},
	/**
	 * Displays an icon depending on the mimetype of the resource
	 */
	setIcon : function(overrideType) { 
        var typeTitle = overrideType;
        var rdftype = this.getProperty("rdf:type_0");
        if (rdftype && (rdftype.match(lore.constants.NAMESPACES["annotype"])
                        || rdftype.match(lore.constants.NAMESPACES["vanno"]) 
                        || rdftype.match(lore.constants.NAMESPACES["annoreply"]))){
            this.icontype = "annoicon";
            typeTitle = "Annotation";
        } else if (overrideType){
            this.icontype = lore.ore.controller.lookupIcon(overrideType,true);
        } else {
            var mimetype = this.getProperty("dc:format_0")
                ? this.getProperty("dc:format_0")
                : "text/html";
            typeTitle = mimetype;
            this.icontype = lore.ore.controller.lookupIcon(mimetype,false);
        }
        var icon = $('#a' + this.id + "-icon" ,this.metadataarea);
		if (icon) {
           icon.removeClass().addClass('mimeicon').addClass(this.icontype).attr('title',typeTitle);
		} 
	},
	/**
	 * Determine the mime type of the resource and use to populate dc:format
	 * property
	 * 
	 * @param {} theurl
	 */
	setMimeType : function(theurl) {
		if (!this.getProperty("dc:format_0")) {
			// If we know it's an annotation or a resource map, set the mime
			// type automatically
			var rdftype = this.getProperty("rdf:type_0");
			if (rdftype && rdftype.match("ResourceMap")) {
				this.setProperty("dc:format_0", "application/rdf+xml");
				this.showContent();
			} else if ((rdftype && (rdftype
					.match(lore.constants.NAMESPACES["annotype"])
					|| rdftype.match(lore.constants.NAMESPACES["vanno"]) || rdftype
					.match(lore.constants.NAMESPACES["annoreply"])))) {
				this.setProperty("dc:format_0","application/xml");
				this.showContent();
			} else {
				// Otherwise, use a HEAD request to find out the content type
				var xhr = new XMLHttpRequest();
				xhr.open('HEAD', theurl);
				var thisobj = this;
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4) {
                        var mimetype;
                        if (xhr.status == 200){
							try {
								mimetype = xhr.getResponseHeader('Content-Type');
                                // strip out any invalid characters from mimetype
                                mimetype = mimetype.replace(/([\x09\x0A\x0D\x20-\x7E]|[\xC2-\xDF][\x80-\xBF]|\xE0[\xA0-\xBF][\x80-\xBF]|[\xE1-\xEC\xEE\xEF][\x80-\xBF]{2}|\xED[\x80-\x9F][\x80-\xBF]|\xF0[\x90-\xBF][\x80-\xBF]{2}|[\xF1-\xF3][\x80-\xBF]{3}|\xF4[\x80-\x8F][\x80-\xBF]{2})|./g, "$1");
							} catch (e) {
								lore.debug.ore("ResourceFigure: exception getting mime type", e);
						    }
                        }
                        // default
						if (!mimetype) {
							mimetype = "text/html";
						}
						thisobj.setProperty("dc:format_0", mimetype);
						thisobj.showContent();
					}
				};
				xhr.send(null);
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
	setSelected : function(highlight) {
		if (highlight) {
            this.html.style.top = (this.y - 1) + "px";
            this.html.style.left = (this.x - 1) + "px";
            $(this.html).addClass('highlightNode');
		} else {
			this.html.style.top= this.y + "px";
			this.html.style.left= this.x + "px";
            $(this.html).removeClass('highlightNode');
			
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
	 * @param {} ptype optional property type
	 */
	appendProperty : function(pname, pval,ptype) {
		var counter = 0;
		var oldrdftype = this.getProperty("rdf:type_0");
		var prop = this.getProperty(pname + "_" + counter);
		while (prop) {
			counter = counter + 1;
			prop = this.getProperty(pname + "_" + counter);
		}
		this.setProperty(pname + "_" + counter, pval,ptype);
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
     * @param {} type Optional datatype for the property eg string
	 */
	setProperty : function(pid, pval,type) {
        //lore.debug.ore("setProperty " + pid + " " + pval + " " + type);
		if (!this.model) {
			lore.debug.ore("Warning: no model for fig " + this.url,this);
		}
		var oldval = this.getProperty(pid);
		this.metadataproperties[pid] = pval;
		if (pid == "resource_0" && pval != oldval) {
			this.unsetProperty("dc:format_0", true);
			this.setContent(pval);
			// model is updated by setContent
		} else if ((pid == "dc:title_0" || pid == "dcterms:title_0")){
			// Always redisplay title as it may have been cleared during editing	
			if (pval && pval != "") {
				this.displayTitle(pval);
			} else {
				this.displayTitle("Resource");
			}
			// only update model if value has changed
			if (this.model && pval != oldval){
				this.model.set('title',pval);
				this.model.commit();
			} 
		} else if (pid == "dcterms:abstract_0" && pval != oldval){
			if (pval){
				this.displayAbstract(pval);
			} else {
				this.displayAbstract("");
			}
		} else if (pid == "dc:type_0"){
           // override icon
           this.setIcon(pval);
        }
		// Update model
		if (pid != "resource_0" && this.model && pval != oldval){
			try{
    			var pidsplit = pid.split(":");
    			var pfx = pidsplit[0];
    			pidsplit = pidsplit[1].split("_");
    			var idx = pidsplit[1];
    			var propname = pidsplit[0];
    			var ns = lore.constants.NAMESPACES[pfx];
    			var propuri = ns + propname;
                var propData = {
                    id: propuri, 
                    ns: ns, 
                    name: propname, 
                    value: pval, 
                    prefix: pfx
                };
                if (type){
                    propData.type = type;
                }
    			this.model.get('properties').setProperty(propData,idx)
			} catch (ex){
				lore.debug.ore("problem in setProperty",ex);
			}
		}
        
	},
	/**
	 * Unset (remove) a property by id
	 * 
	 * @param {} pid The id of the property eg dc:title_0
	 */
	unsetProperty : function(pid, updateModel) {
		delete this.metadataproperties[pid];
		if (pid == "dc:title_0" || pid == "dcterms:title_0") {
			var existingTitle = this.getProperty("dc:title_0")
					|| this.getProperty("dcterms:title_0");
			if (existingTitle) {
				this.displayTitle(existingTitle);
			} else {
				this.displayTitle("Resource");
			}
		}
		if (pid == "dcterms:abstract_0"){
			this.displayAbstract("");
		}
        if (pid == "dc:type_0"){
            this.setIcon();
        }
		// Update model
		var propData = this.expandPropAbbrev(pid);
    	if (updateModel && propData && propData.id){
    		this.model.get('properties').removeProperty(propData.id, propData.index);
    	}
	},
	/** Return the title of the figure */
	getTitle : function(){
		return this.getProperty("dc:title_0") || this.getProperty("dcterms:title_0");
	},
	/**
	 * Get a property
	 * 
	 * @param {string}   pid Fully qualified property index eg dc:format_0
	 * @return {} the property value
	 */
	getProperty : function(pid) {
        // make sure that subject terms don't still have escaped ampersands in them
        if (pid.match("dc:subject")){
          var subj = this.metadataproperties[pid];
          if (subj){
             return subj.replace(/&amp;/,'&');
          } else {
             return subj;
          }
        } else {
            return this.metadataproperties[pid];
        }
	},
    getPropertyType : function(pid){
        try{
	        var propData = this.expandPropAbbrev(pid);
            if (this.model){
                var ptype = this.model.get('properties').getProperty(propData.id, propData.index).type;     
                if (ptype){
                    return ptype;
                } 
            } else {
                lore.debug.ore("getPropertyType: no model for fig " + this.url + " " + pid,this);
            }
        } catch (ex){
            lore.debug.ore("Problem in getPropertyType",ex);
        
        }
        return "plainstring";
    },
    handlePropertyChanged: function(propData,index){
        //lore.debug.ore("Resource Figure property changed " + index,propData);
        if (propData && propData.id == lore.constants.NAMESPACES["layout"] + "highlightColor"){
            this.setHighlightColor(propData.value);
        }
    },
    handlePropertyRemoved: function(propData, index){
        if (propData){
            this.unsetProperty(propData.ns + ":" + propData.name + "_" + index, false);
        }
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
    /** Show context menu underneath menuIcon in header */
    onHeaderMenu : function(event){ 
        var w = this.workflow;
        var xy = event.getXY();
        var absx = xy[0] - w.getAbsoluteX() + w.getScrollLeft();
        var absy = xy[1] - w.getAbsoluteY() + w.getScrollTop();
        this.onContextMenu(absx,absy);
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
            var format = this.getProperty("dc:format_0");
            if (!format || !format.match("rdf")) {
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
                icon: "chrome://lore/skin/icons/table_edit.png",
                scope: this,
                handler: function(evt){
                	Ext.getCmp("loreviews").activate("remlistview");
					Ext.getCmp("remlistview").selectResource(this.url);
                }
            });
            this.contextmenu.add({
                text: "Show in Details view",
                icon: "chrome://lore/skin/icons/application_view_detail.png",
                scope: this,
                handler: function(evt){
                	Ext.getCmp("loreviews").activate("remdetailsview");
                	Ext.getCmp("remdetailsview").scrollToResource(this.url);				
                }
            });
            this.contextmenu.add({
                text: "Show in Slideshow view",
                icon: "chrome://lore/skin/icons/picture_empty.png",
                scope: this,
                handler: function(evt){    	
					Ext.getCmp("loreviews").activate("remslideview");
					Ext.getCmp("newss").setActiveItem(this.url + "_" + lore.ore.cache.getLoadedCompoundObjectUri());
                }
            });
            this.contextmenu.add({
                text: "Show in Explore view",
                icon: "chrome://lore/skin/icons/network.png",
                scope: this,
                handler: function(evt){
                    this.contextmenu.hide();
                	Ext.getCmp("loreviews").activate("remexploreview");
					var rdftype = this.getProperty("rdf:type_0");
					var isCO = (rdftype && rdftype.match("ResourceMap"));
					var title = this.getTitle();
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
                    lore.ore.controller.setDirty();
                	if (this.abstractPreview){
    					this.abstractPreview = false;
    					this.showContent();
    				} else {
    					this.abstractPreview = true;
    					this.showContent();
    				}
                }
            }));
            this.contextmenu.add("-");
            this.contextmenu.add(
                new Ext.ColorPalette({
                    id: this.id + "_palette",
                    value: this.highlightColor,
                    style: {
                      height: '15px',
                      width: '130px'
                    },
                    colors: [this.NOHIGHLIGHT, "FFFF99","CCFFCC","DBEBFF","EFD7FF","FFE5B4","FFDBFB"],
                    handler: function(cp,color){
                        try{
                            var propData = {
                                id: lore.constants.NAMESPACES["layout"] + "highlightColor", 
    			                ns: lore.constants.NAMESPACES["layout"],
    			                name: "highlightColor", 
    			                value: color, 
    			                prefix: "layout"
                            };
                            if (this.highlightColor != color){
                                this.model.get('properties').setProperty(propData,0);
                                lore.ore.controller.setDirty();
                                this.setHighlightColor(color);
                            }
                            this.contextmenu.hide();
                        } catch (ex){
                            lore.debug.ore("Problem setting highlight color",ex);
                        }
                    },
                    scope: this
                    
                })
            );
		} else {
            var cp = Ext.getCmp(this.id + "_palette");
            cp.select(this.highlightColor,true);
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
	},
	 /** expand prop in form of dc:title_0 to propuri plus index */
    expandPropAbbrev : function(pid){
    	if (pid){
    		var idx, propname;
    		var pidsplit = pid.split(":");
			var pfx = pidsplit[0];
			if (pidsplit[1]){
				pidsplit = pidsplit[1].split("_");
				idx = pidsplit[1] || "0";
				propname = pidsplit[0];
			} 
			var ns = lore.constants.NAMESPACES[pfx];
			var propuri = ns + propname;
			return {id: propuri, name: propname, ns: ns, prefix: pfx, index: idx};
    	}
    }
	
});

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
 * @extends lore.ore.ui.graph.EntityFigure
 * @param {Object} initprops initial properties
 */
lore.ore.ui.graph.ResourceFigure = function(model){
        lore.ore.ui.graph.EntityFigure.call(this, model);
        this.originalHeight = -1;
        this.abstractPreview = false;
        this.canDrag = true;
        this.setDimension(220, 170);
        //var abs = this.getProperty("dcterms:abstract_0") || "";
        //this.displayAbstract(abs);
        this.hasPreview = false;
        
        // use Ext ToolTip instead of title attribute to prevent hiding of abstract after 5 seconds on FF 3.5 and below
        this.tip = new Ext.ToolTip({
            resourceFig: this,
            target: this.header, 
            renderTo: document.body,
            dismissDelay: 0, 
            listeners: {
                beforeshow: function (tip){ 
                    var domObj = tip.body.dom.firstChild;
                    if (domObj) {
                        tip.body.dom.removeChild(domObj);
                    }
                    var abs = tip.resourceFig.getProperty("dcterms:abstract_0");
                    if (abs){
                        tip.body.createChild({
                               tag:"div",
                               children:[abs]
                        });
                    } else {
                        return false;
                    }
                }
            }
        }); 
        Ext.get(this.toggleIcon).on("click",this.toggle,this);
};

Ext.extend(lore.ore.ui.graph.ResourceFigure, lore.ore.ui.graph.EntityFigure, {
    type : "lore.ore.ui.graph.ResourceFigure",
    /**
     * Create the HTML to represent the figure
     * @private
     * @return {}
     */
    createHTMLElement : function() {
        var item = lore.ore.ui.graph.EntityFigure.prototype.createHTMLElement.call(this);
        item.className = "resource_figure";
        this.textarea.className += " co-preview";
        
        this.metadataarea = document.createElement("div");
        this.metadataarea.className = "co-uri";
        this.uriexpander = "<img class=\"hideuri\" style=\"margin-left:-7px\" onclick=\"if(this.className){this.className = '';this.parentNode.parentNode.className='';} else {this.className = 'hideuri';this.parentNode.parentNode.className='hideuribox';}\" src=\"../../skin/icons/bullet_arrow_down.png\">";
        this.iframearea = document.createElement("div");
        this.iframearea.style.border = "none";
        
        // remove the placeholder text created by the superclass, and add preview area
        this.textarea.removeChild(this.textarea.firstChild);
        this.textarea.appendChild(this.metadataarea);
        this.textarea.appendChild(this.iframearea);
        this.disableTextSelection(this.textarea);
        try{
        // create icon for expand/contract
        var toggleIcon = document.createElement("div");
        Ext.apply(toggleIcon.style,{
            position: "absolute",
            height: (this.cornerSize) + "px"
        });
        toggleIcon.className = "toggleIcon x-tool x-unselectable";
        Ext.get(toggleIcon).createChild({
                tag: "img",
                src: "chrome://lore/skin/blank.png"
        });
        this.toggleIcon = toggleIcon;
        item.appendChild(toggleIcon);
        } catch (e){
            lore.debug.ore("problem creating toggle icon",e);
        }
        return item;
    },
    appendProperty: function(pname, pval,ptype){
        var oldrdftype = this.getProperty("rdf:type_0");
        lore.ore.ui.graph.EntitityFigure.prototype.appendProperty.call(this, pname, pval,ptype)
        // if the rdf:type has changed, regenerate preview (as it might be an annotation or compound object
        if (pname == "rdf:type" && oldrdftype != pval && this.hasPreview) {
            this.showContent();
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
        if (this.isCollapsed() && this.metadataarea) {
            h = this.metadataarea.offsetHeight + this.header.offsetHeight - 4;
        }
        lore.ore.ui.graph.EntityFigure.prototype.setDimension.call(this, w, h);
        if (this.iframearea) {
            this.iframearea.style.height = (this.height - (this.cornerSize * 2 + 5)) + "px";
            this.createPlusMinusIcon();
        }
    },
    displayAbstract: function(abs) {
        if (this.abstractPreview) {
            var absText = abs || "(No abstract)";
            var domObj = this.iframearea.firstChild;
            if (domObj) {
                this.iframearea.removeChild(domObj);
            }
            Ext.get(this.iframearea).appendChild({
                tag: "div",
                cls: "nodeabstract",
                children: [absText]
            });
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
        var domObj = this.iframearea.firstChild;
        if (!this.abstractPreview){
            if (domObj) {
                this.iframearea.removeChild(domObj);
            }   
            this.iframearea.textContent = "Loading...";
        }
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
        var mimetype = this.getProperty("dc:format_0");
        var rdftype = this.getProperty("rdf:type_0");
        if (this.hasPreview) {
            //lore.debug.ore("Regenerating node preview " + this.url, this);
        } else {
            this.hasPreview = true;
        }
        // remove existing content preview and url
        var domObj = this.iframearea.firstChild;
        while (domObj) {
            this.iframearea.removeChild(domObj);
            domObj = this.iframearea.firstChild;
        }
        
        domObj = this.metadataarea.firstChild;
        while (domObj){
            this.metadataarea.removeChild(domObj);
            domObj = this.metadataarea.firstChild;
        }
        var isAnnotation = rdftype && (rdftype.match(lore.constants.NAMESPACES["annotea"]) 
                        || rdftype.match(lore.constants.NAMESPACES["thread"]) 
                        || rdftype.match(lore.constants.NAMESPACES["annotype"])
                        || rdftype.match(lore.constants.NAMESPACES["vanno"]) || rdftype
                        .match(lore.constants.NAMESPACES["annoreply"]));
        var isCO = rdftype && rdftype.match("ResourceMap");
        
        var previewArea = Ext.get(this.iframearea);
        
        if (!isAnnotation && !isCO){
            // we update the metadata area below for annotations and COs below instead
           Ext.get(this.metadataarea).createChild({
                tag: "ul",
                cls: "hideuribox",
                children: [
                    {
                       tag: "li",
                       id: "a" + this.id + "-icon",
                       children: [
                        this.uriexpander,
                        {
                            tag: "a",
                            title: theurl,
                            onclick: "lore.ore.controller.loadCompoundObjectFromURL(" + theurl + ");",
                            href: "#",
                            children: [theurl]
                        }
                       ]
                    }
                ]
            }); 
        }
        if (this.abstractPreview){
            var abstext = this.getProperty("dcterms:abstract_0");
            previewArea.createChild({
                tag: "div",
                cls: "nodeabstract",
                children: [(abstext? abstext : "(No abstract)")]
            });
        } else if (isCO) {
            previewArea.createChild({
                tag : "div",
                cls: "orelink",
                id: "a" + this.id + "-data",
                children: [
                  {
                    tag: "a",
                    href: "#",
                    onclick: "lore.ore.controller.loadCompoundObjectFromURL('" + theurl + "');",
                    children: [
                        "Compound Object: ", 
                        {tag: "br"}, 
                        {
                            tag: "img",
                            src: "../../skin/icons/action_go.gif"
                        }, 
                        "&nbsp;Load in LORE"
                    ]
                  }
                ]
            });
            Ext.get(this.metadataarea).createChild({
                tag: "ul",
                cls: "hideuribox",
                children: [
                    {
                       tag: "li",
                       title: "Compound Object",
                       cls: "mimeicon oreicon",
                       children: [
                        this.uriexpander,
                        {
                            tag: "a",
                            title: theurl,
                            onclick: "lore.ore.controller.loadCompoundObjectFromURL(" + theurl + ");",
                            href: "#",
                            children: [theurl]
                        }
                       ]
                    }
                ]
            });     
        } else if (mimetype && mimetype.match("rdf")) {
            previewArea.createChild({
                tag: "p",
                style: "padding-top:20px;text-align:center;",
                children: ["RDF document (no preview available)"]
            });
        } else if (isAnnotation) {
            // if it is an annotation, add a stylesheet parameter
            var stylesheet = "danno_useStylesheet="; 
            var displayUrl = theurl;
            if (theurl.match("\\?") && !theurl.match("danno_useStylesheet")) {
                displayUrl = theurl + "&" + stylesheet;
            } else {
                displayUrl = theurl + "?" + stylesheet;
            }
            if (!this.isCollapsed()) {
                this.createPreview(displayUrl);
            }
             Ext.get(this.metadataarea).createChild({
                tag: "ul",
                cls: "hideuribox",
                children: [
                    {
                       tag: "li",
                       id: "a" + this.id + "-icon",
                       children: [
                        this.uriexpander,
                        {
                            tag: "a",
                            title: theurl,
                            onclick: "lore.ore.controller.loadCompoundObjectFromURL(" + displayUrl + ");",
                            href: "#",
                            children: [theurl]
                        }
                       ]
                    }
                ]
            }); 
        } else if (mimetype && mimetype.match("application/xml")) {
            previewArea.createChild({
                tag: "p",
                style: "padding-top:20px;text-align:center;",
                children: ["XML document (no preview available)"]
            });
        } else if (mimetype && mimetype.match("pdf")) {
            // Don't display PDFs in preview
            previewArea.createChild({
                tag: "p",
                style: "padding-top:20px;text-align:center;",
                children: ["PDF document (no preview available)"]
            });
        } else if (mimetype
                && (mimetype.match("x-shockwave-flash") || mimetype.match("video"))) {
            // use object tag to preview videos as plugins are disabled in secure iframe
            previewArea.createChild({
                tag: "object",
                name: theurl + "-data",
                id: theurl + "-data",
                data: theurl,
                width: "100%",
                height: "100%",
                style: "z-index:-9001"
            });
        } else if (mimetype && mimetype.match("image")) {
            previewArea.createChild({
                tag: "img",
                id: theurl + "-data",
                src: theurl,
                height: "100%",
                style: "width:auto; z-index:-9001"
            });
            previewArea.first().on("click", function(e){
                lore.global.util.launchTab(this.getAttribute("src"), window);
                e.stopPropagation();
                return false
            });
        } else { // All other resources displayed in secure iframe
            var displayUrl = theurl;
            if (theurl.match("austlit.edu.au")
                    && (theurl.match("ex=ShowWork") || theurl
                            .match("ex=ShowAgent"))) {
                displayUrl = theurl + "&printPreview=y";
            }
            try {
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
        this.iframearea.style.display = (this.isCollapsed()? "none" : "block");
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
        try{
            //lore.debug.ore("onDragstart " + x + " " + y,this);
            if (!this.header) {
                return false;
            }
            var wf = this.getWorkflow();
            var scale = wf.scale;
            var actualX = x ;
            var actualY = y ;

            if (scale == 1.0){
                // TODO: fix these checks so that they work with scaling : can't work out why x and y are what they are
                // don't allow move by dragging within iframe or metadataarea or by toggle button
                if  ((actualY < (this.cornerSize) && actualX < (this.width)
                    && actualX > (this.width - this.cornerSize)) || (actualX < 0 || actualY < 0 || actualY >= (this.header.offsetHeight - 2))){
                    return false;
                } 
            } 
            this.raise();
            return draw2d.Node.prototype.onDragstart.call(this, x, y);
        } catch (ex){
            lore.debug.ore("Error in onDragstart",ex);
            return true;
        }
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
     * Set (or add) a property with a specific id
     * 
     * @param {}  pid The id of the property eg dc:title_0
     * @param {} pval The value of the property
     * @param {} type Optional datatype for the property eg string
     */
    setProperty : function(pid, pval,type) {
        if (!this.model) {
            lore.debug.ore("Error: no model for fig " + this.url,this);
        }
        var oldval = this.getProperty(pid);
        if (pid == "resource_0" && pval != oldval) {
            this.unsetProperty("dc:format_0", true);
            // model is updated by setContent
            this.setContent(pval);
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
        // Update model property
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
        lore.debug.ore("setProperty " + pid + " " + pval + " " + type,this.model);
        
    },
    /**
     * Unset (remove) a property by id
     * 
     * @param {} pid The id of the property eg dc:title_0
     */
    unsetProperty : function(pid, updateModel) {
        if (pid == "dcterms:abstract_0"){
            this.displayAbstract("");
        }
        lore.ore.ui.graph.EntityFigure.prototype.unsetProperty.call(this,pid,updateModel);
    },
    /**
     * Generate the markup for the plus/minus icon used to toggle the preview area
     * 
     * @private
     */
    createPlusMinusIcon : function() {
        var ti = Ext.get(this.toggleIcon);
        if (this.isCollapsed()) {
            ti.addClass("x-tool-plus");
            ti.removeClass("x-tool-minus");
        } else {
            ti.removeClass("x-tool-plus");
            ti.addClass("x-tool-minus");
        }
        
    },
    /** 
     * Generate entries for context menu
     */
    populateContextMenu : function(menu){
        if (this.iframe){
            menu.add({
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
        var format = this.getProperty("dc:format_0");
        if (!format || !format.match("rdf")) {
            menu.add({
                text: "Open resource in separate window",
                icon: "chrome://lore/skin/icons/page_go.png",
                scope: this,
                handler: function(evt){
                    lore.global.util.launchWindow(this.url, true, window);
                }
             });
        }
        lore.ore.ui.graph.EntityFigure.prototype.populateContextMenu.call(this,menu);
        
    }
});

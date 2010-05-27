/* 
 * Panel in the slideshow representing an AbstractOREResource
 */
lore.ore.ui.SlidePanel = Ext.extend(Ext.Panel,{ 
   constructor: function (config){
        config = config || {};
        this.ssid = config.ssid; // id of parent SlideShowPanel
        lore.ore.ui.SlidePanel.superclass.constructor.call(this, config);
   },
   initComponent: function(config){
        this.autoScroll = true;
        lore.ore.ui.SlidePanel.superclass.initComponent.call(this, config);
   },
   /** 
    * Set the model represented by the SlidePanel.
    * Model can be added but not changed - create a new Panel to represent a different resource
    * @param {lore.ore.model.AbstractOREResource} resource The model object
    */
   addModel: function(resource){
        if (!this.model){
            this.model = resource;
            // events for general Resources (related to properties)
            this.model.on("addProperty", this.addProperty, this);
            this.model.on("removeProperty", this.removeProperty, this);
            this.model.on("propertyChanged", this.propertyChanged, this);
            // events for CompoundObjects
            this.model.on("addAggregatedResource",this.addResource,this);
            this.model.on("removeAggregatedResource",this.removeResource,this);
            this.loadContent(this.model);  
        }
    },
    /** 
     * Load contents from the model
     * TODO: ssid should be configured at creation not provided to this method
     * 
     */
    loadContent: function(resource){
        /*
         * Helper function: given an array of content, make a table of contents
         */
        var makeTOC = function(contentResources,containerid, ssid){ 
            var tochtml = "";
            tochtml += "<ul style='text-align:left; list-style: disc inside;padding-left:6px;'>"
            for (var i = 0; i < contentResources.length; i++){
                var r = contentResources[i];
                var id = (r.representsCO? r.uri : r.uri + "_" + containerid);
                tochtml += "<li><a href='#' onclick='try{Ext.getCmp(\"" + ssid + "\").setActiveItem(\"" + id + "\");}catch(e){lore.debug.ore(e)}'>" + (r.getTitle() || "Untitled Resource") + "</a></li>";
            }
            tochtml += "</ul>";
            return tochtml;
        }
        /*
         * Helper function: given a resource, produce html to display the properties 
         */
        var displayProperties = function(res, skip){
            var prophtml = "<table class='slideshowProps'>";
            var relhtml = "";
            skip = skip || {};
            var skipProps = Ext.apply(skip, {"rdf:type_0":true, "dc:format_0":true, "ore:describes_0":true,"dc:title_0":true, "dc:description_0":true,"dcterms:abstract_0":true, "dc:rights_0":true});
            var desc = res.getProperty("dc:description_0");
            if (desc) {
             prophtml += "<tr valign='top'>" +
                "<td><b>Description:</b></td><td width='80%'>"
                + desc.value + "</td></tr>";
            }
            var abst = resource.getProperty("dcterms:abstract_0");
            if (abst) {
                prophtml += "<tr valign='top'><td><b>Abstract:</b></td>" +
                    "<td width='80%'>"
                    + abst.value + "</td></tr>";
            }
            var rights = resource.getProperty("dc:rights_0");
            if (rights) {
                prophtml += "<tr valign='top'><td><b>Rights:</b></td>" +
                    "<td width='80%'>"
                    + rights.value + "</td></tr>";
            }
            // all other properties/rels
            for (var p in res.properties){
                if (!(p in skipProps)) {
                    var theProp = res.getProperty(p);
                    if ("layout" != theProp.prefix){
                        if (theProp.value.toString().match("^http://") == "http://") {
                            // Link to resource
                            relhtml += "<tr valign='top'><td><b>" + lore.global.util.capitalizeString(theProp.name) + ":</b>&nbsp;</td>";
                            relhtml += "<a href='#' onclick='lore.global.util.launchTab(\"" + theProp.value + "\");'>";
                            // lookup title
                            var propR = (res.container? res.container.getAggregatedResource(theProp.value): false);
                            if (propR) {
                                relhtml += propR.getTitle() || theProp.value;
                            } else {
                                relhtml += theProp.value;
                            }
                            relhtml += "</a></td></tr>";
                        } else {
                            // Display value as property
                            prophtml += "<tr valign='top'><td><b>" + lore.global.util.capitalizeString(theProp.name) + ":</b>&nbsp;</td>";
                            prophtml += theProp.value;
                            prophtml += "</td></tr>";
                        }  
                    }
                }
            }
            return prophtml + relhtml + "</table>";
        }
        
        // TODO: use Ext Template
        var slidehtml = "";
        var prophtml = "";
        var title = resource.getTitle();
        if (resource instanceof lore.ore.model.CompoundObject){
            // Title slide for entire Slideshow
            title = title || 'Compound object';
            slidehtml += "<div style='padding:0.5em'><div class='slideshowTitle'>" + title + "</div>";
            slidehtml += displayProperties(resource,{"dc:creator_0":true,"dcterms:created_0":true,"dcterms:modified_0":true});
            var contentResources = resource.aggregatedResources;
            if (contentResources.length > 0){
                slidehtml += "<div class='slideshowToc'><p style='font-weight:bold;padding-bottom:0.5em;'>Contents:</p>";
                slidehtml += makeTOC(contentResources, resource.uri, this.ssid);
                slidehtml += "</div>";
            }

            var ccreator = resource.getProperty("dc:creator_0");
            var ccreated = resource.getProperty("dcterms:created_0");
            var cmodified = resource.getProperty("dcterms:modified_0");
            slidehtml += "<div class='slideshowFooter'>Created" + (ccreator? " by " + ccreator.value : "") + ' on  ' + ccreated.value;
            if (cmodified) {
                slidehtml += ', last updated on ' + cmodified.value;
            }
            slidehtml += "</div>";
            slidehtml += "</div>";
            
        } else if (resource.representsCO){
             // content slide representing nested CO
            // Properties
            slidehtml += "<div style='padding:0.5em'>";
            slidehtml += "<div class='sectionTitle'>" + (title || " ") + "</div>";
            slidehtml += displayProperties(resource);
            if (resource.representsCO instanceof lore.ore.model.CompoundObject){
                slidehtml +=  displayProperties(resource.representsCO,{"dc:creator_0":true,"dcterms:created_0":true,"dcterms:modified_0":true});
                var contentResources = resource.representsCO.aggregatedResources;
	            if (contentResources.length > 0){
	                slidehtml += "<div class='slideshowTOC'><p style='font-weight:bold;padding-bottom:0.5em;'>In this section:</p>";
                    slidehtml += makeTOC(contentResources, resource.representsCO.uri,this.ssid);
                    slidehtml += "</div>";
	            }
                var creator = resource.representsCO.getProperty("dc:creator_0");
	            slidehtml += "<div class='slideshowFooter'>This nested compound object created" + (creator? " by " + creator.value : "") + " on " + resource.representsCO.getProperty("dcterms:created_0").value;
	            var mod = resource.representsCO.getProperty("dcterms:modified_0");
	            if (mod){
	                slidehtml += ", last updated on " + mod.value;
	            }
	            slidehtml += "</div>";
            } else {
                slidehtml += "<a title='Open in LORE' href='#' onclick='lore.ore.readRDF(\"" + resource.uri + "\");'>Nested Compound Object:<br>"
                        + "<img src='../../skin/icons/action_go.gif'/> Load in LORE</p>";
            }
            slidehtml += "</div>";
        } else {
            // content slide representing resource
            title = resource.getTitle() || "Untitled Resource";
            var previewhtml = "";
            var format = resource.getProperty("dc:format_0");
            var rdftype = resource.getProperty("rdf:type_0");
            var hasPreview = true;

            var icontype = "pageicon";
            if (format){
		        if (format.value.match("html")){
		            icontype += " htmlicon";
		        } else if (format.value.match("image")) {
		            icontype += " imageicon";
		        } else if (format.value.match("audio")) {
		            icontype += " audioicon";
                    // Disable preview as secure iframe does not allow plugins
                    hasPreview = false;
		        } else if (format.value.match("video") || format.value.match("flash")){
		            icontype += " videoicon";
                    // Disable preview as secure iframe does not allow plugins
                    hasPreview = false;
		        } else if (format.value.match("pdf")) {
		            icontype += " pdficon";
                    // Disable preview as secure iframe does not allow plugins
                    hasPreview = false;
		        } else {
                    hasPreview = false;
                }
            }
            slidehtml += "<div style='padding:2px;border-bottom: 1px solid #dce0e1;'>";
            slidehtml += "<a onclick='lore.global.util.launchTab(\"" + resource.uri + "\");' href='#' title='Open in a new tab'><li class='" + icontype + "'>&nbsp;"  + title + "</li></a>";
            slidehtml += "</div>";
            slidehtml += displayProperties(resource);
            if (format && format.value.match("image")){
                previewhtml += "<img class='sspreview' src='" + resource.uri + "' alt='image preview' style='max-height:100%;'/>";
            } else if (resource.uri.match('austlit.edu.au') && (resource.uri.match('ShowWork') || resource.uri.match('ShowAgent'))){
                previewhtml += '<object class="sspreview" data="' + resource.uri + '&amp;printPreview=y"  height="100%" width="100%"></object>';
            } else if (rdftype && (rdftype.value.toString().match('http://www.w3.org/2000/10/annotation') || rdftype.value.toString().match('http://www.w3.org/2001/12/replyType'))){
                previewhtml += '<object class="sspreview" data="' + resource.uri + '?danno_useStylesheet="  height="100%" width="100%"></object>';
            } else {
                var previewFrame = lore.global.util.createSecureIFrame(window.top, resource.uri);
                previewFrame.style.width = "100%";
                previewFrame.style.height = "100%";
                previewFrame.name = resource.uri + "-ss";
                previewFrame.id = resource.uri + "-ss";
                previewFrame.style.zIndex = "-9001"; 
            }
            // Only allow http/https previews (ie no chrome, data, view-source etc uris) for security reasons
            if (!(resource.uri.match("^http") == "http")){
                hasPreview = false;
            }
            
            // TODO: Add source info + container info
            
            slidehtml += "<p class='slideshowFooter'>Viewing <a onclick='lore.global.util.launchTab(\"" + resource.uri + "\");' href='#'>"  + resource.uri + "</a>";
            if (resource.container){
                // TODO: remove hardcoded ref to slideshow
                slidehtml += " &nbsp;&nbsp;&nbsp; from &nbsp;&nbsp;&nbsp;<a href='#' onclick='Ext.getCmp(\"" + this.ssid + "\").setActiveItem(\""  + resource.container.uri + "\");'>" + (resource.container.getTitle() || resource.container.uri) + "</a>"; 
            }
            slidehtml += "</p>";
            
        }
        
        if (hasPreview) {
            this.layout = 'anchor';
            //this.layout = 'border';
            if (previewFrame){
                this.add({anchor: '100% 70%', autoScroll: true, contentEl: previewFrame}); 
                //this.add({region:'center', autoScroll: true,  contentEl: previewFrame});  
            } else {
                this.add({anchor: '100% 70%', autoScroll: true, html: previewhtml});
                //this.add({region:'center', autoScroll: true, html: previewhtml});
            }
            this.add({anchor: '100% 30%', autoScroll: true, html: slidehtml});
            //this.add({region:'south', height: 100,  split: true, collapseMode: 'mini', autoScroll: true, html: slidehtml});
        } else {
            this.html = slidehtml;   
        }
    },
    /**
     * Add to displayed props
     * @param {} aProp
     */
    addProperty : function(aProp) {
        
    },
    /**
     * Remove from displayed props
     * @param {} aProp
     */
    removeProperty : function(aProp) {
        
    },
    /** 
     * Update displayed list of properties
     * @param {} oldProp
     * @param {} newProp
     */
    propertyChanged : function(oldProp,newProp) {
        
    },
    /**
     * Add to TOC
     * @param {} aResource
     */
    addResource : function(aResource){
        
    },
    /**
     * Remove from TOC
     * @param {} aResource
     */
    removeResource : function(aResource){
        
    }
});
Ext.reg('slidepanel',lore.ore.ui.SlidePanel);
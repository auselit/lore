
 /**
  * 
  * @class lore.ore.ui.SlidePanel Panel in the slideshow representing an AbstractOREResource
  * @extends Ext.Panel
  */
lore.ore.ui.SlidePanel = Ext.extend(Ext.Panel,{ 
   constructor: function (config){
        config = config || {};
        this.ssid = config.ssid; // id of parent SlideShowPanel

        // Templates
        this.tocTemplate = new Ext.Template("<li><a href='#' onclick='Ext.getCmp(\"" 
            + this.ssid + "\").setActiveItem(\"{id}\");'>{title}</a></li>",
            {compiled: true}
        );
        this.propTemplate = new Ext.XTemplate('<tpl for="."><p><span title="{uri}" style="font-weight:bold">{[fm.capitalize(values.name)]}:&nbsp;</span> {value}</p></tpl>',
            {compiled:true}
        );
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
    /*
     * Helper function: given a resource, produce html to display the properties 
     */
    displayProperties : function(res, container, skip){
      try{
    	var ns = lore.constants.NAMESPACES;
    	var dc = ns["dc"];
    	var dcterms = ns["dcterms"];
        var prophtml = "<div class='slideshowProps'>";
        var relhtml = "";
        var currentProp;
        
        var skipProps = skip || {};
        skipProps[ns["rdf"]+"type"] = true;
        skipProps[dc+"format"]=true;
        skipProps[ns["ore"]+"describes"]=true;
        skipProps[dc+"title"]=true;
        skipProps[dc+"description"]=true;
        skipProps[dcterms+"abstract"]=true;
        skipProps[dc+"rights"]=true;
        
        // ordering: description, abstract, rights, then all other props, then rels
        currentProp = res.properties.data[dc+"description"];
        if (currentProp) {prophtml += this.propTemplate.apply(currentProp);}
        currentProp = res.properties.data[dcterms+"abstract"];  	
        if (currentProp) {prophtml += this.propTemplate.apply(currentProp);}
        currentProp = res.properties.data[dc+"rights"];
        if (currentProp) {prophtml += this.propTemplate.apply(currentProp);}
        try{
        var sortedProps = res.properties.getSortedArray(skipProps);
	 	for (var k =0; k < sortedProps.length; k++) {
	 		var valArray = sortedProps[k];
            for (var i = 0; i < valArray.length; i++){
            	var theProp = valArray[i];
                if ("layout" != theProp.prefix){
                    if (theProp.value.toString().match("^http://") == "http://") {
                    	// property data for related resource: for looking up title etc
                        var propR = (container? container.getAggregatedResource(theProp.value): false);
                        // Link to resource
                        relhtml += "<p><b>" + Ext.util.Format.capitalize(theProp.name) + ":</b>&nbsp;";
                        // Open in browser link
                        relhtml += "<a href='#' title='Show in browser' onclick='lore.global.util.launchTab(\"" 
                        	+ theProp.value 
                        	+ ((propR && propR.data.representsAnno) ? "?danno_useStylesheet=" : "") 
                        	+ "\");'>";
                        // use title when available
                        if (propR) {
                            relhtml += propR.data.properties.getTitle() || theProp.value;
                        } else {
                            relhtml += theProp.value;
                        }
                        relhtml += "</a>";
                        if (propR){
                        	// Goto slide link (only if resource is in same compound object)
	                        relhtml += "&nbsp;<a href='#' title='Go to slide' onclick='Ext.getCmp(\"" 
	                        	+ this.ssid + "\").setActiveItem(\"" + theProp.value + "_" + container.uri+"\");'>"
	                        	+ "<img src='chrome://lore/skin/icons/picture_empty.png'></a>";
                        }
                        relhtml += "</p>";
                    } else {
                        // Display value as property
                        prophtml += this.propTemplate.apply(theProp);
                    }  
                }
            }
        }
        } catch (e){
        	lore.debug.ore("problem",e);
        }
        return prophtml + relhtml + "</div>";
      } catch (e){
    	  lore.debug.ore("displayProperties:",e);
      }
    },
    /** 
     * Load contents from the model
     * 
     */
    loadContent: function(resource){
      try{
    	var ns = lore.constants.NAMESPACES;
    	var dc = ns["dc"];
    	var dcterms = ns["dcterms"];
        var displayDate = function(cprop, desc){
            var cval;
            var datehtml = "";
            if (cprop){
                cval = cprop.value;
                if (Ext.isDate(cval)){
                    datehtml += desc + cval.format("j M Y");
                } else {
                    datehtml += desc + cval;
                }
            }
            return datehtml;
        };
        // TODO: remove this when we use MVC properly
        if (!this.model) {
            this.model = resource;
        }
        var oThis = this;
        /*
         * Helper function: given an array of content, make a table of contents
         */
        var makeTOC = function(contentResources,containerid, ssid){
            var tochtml = "";
            tochtml += "<ul id='" + this.id + "_toc' style='text-align:left; list-style: disc inside;padding-left:6px;'>";
            contentResources.each(function(rec){
                var r = rec.data;
                if (r){
                    tochtml += oThis.tocTemplate.apply({
                        id: (r.representsCO? r.uri : r.uri + "_" + containerid),
                        title: (r.properties.getTitle() || "Untitled Resource")
                    });
                }
            });
            tochtml += "</ul>";
            return tochtml;
        };
        
        
        // TODO: use Ext Template
        var slidehtml = "";
        var prophtml = "";
        
        var ccreator;
        var resourceprops = resource.data;
        if (resourceprops){
        	var title = resourceprops.properties.getTitle();
        } else {
        	var title = resource.properties.getTitle();
        }
        var skip = {};
        skip[dc + "creator"] = true;
        skip[dcterms + "created"] = true;
        skip[dcterms + "modified"] = true;
        if (resource instanceof lore.ore.model.CompoundObject){
        	
            // Title slide for entire Slideshow
            title = title || 'Compound object';
            slidehtml += "<div style='padding:0.5em'><div class='slideshowTitle'>" + title + "</div>";

            
            slidehtml += this.displayProperties(resource,false,skip);
            var contentResources = resource.aggregatedResourceStore;
            if (contentResources.getTotalCount() > 0){
                slidehtml += "<div class='slideshowToc'><p style='font-weight:bold;padding-bottom:0.5em;'>Contents:</p>";
                slidehtml += makeTOC(contentResources, resource.uri, this.ssid);
                slidehtml += "</div>";
            }
            slidehtml += "<div class='slideshowFooter'>Created";
            ccreator = resource.properties.data[dc+"creator"];
            if (ccreator){
            	slidehtml += " by";
            	for (var i = 0; i< ccreator.length; i++){
            		 if (i > 0) {
            			 slidehtml += ",";
            		 }
            		 slidehtml += "  " + ccreator[i].value;
            	}
            }
            slidehtml += displayDate(resource.properties.getProperty(dcterms+"created",0),' on ');
            slidehtml += displayDate(resource.properties.getProperty(dcterms+"modified",0), ', last updated ');
            slidehtml += "</div>";
            slidehtml += "</div>";
            
        } else  {
        	if (resourceprops.representsCO){
	        
	             // content slide representing nested CO
	            // Properties
	            slidehtml += "<div style='padding:0.5em'>";
	            slidehtml += "<div class='sectionTitle'>" + (title || " ") + "</div>";
	            slidehtml += this.displayProperties(resourceprops, resource.store.co);
	            if (resourceprops.representsCO instanceof lore.ore.model.CompoundObject){
	                slidehtml +=  this.displayProperties(resourceprops.representsCO,resource.store.co,skip);
	                var contentResources = resourceprops.representsCO.aggregatedResourceStore;
		            if (contentResources.getTotalCount() > 0){
		                slidehtml += "<div class='slideshowTOC'><p style='font-weight:bold;padding-bottom:0.5em;'>In this section:</p>";
	                    slidehtml += makeTOC(contentResources, resourceprops.representsCO.uri,this.ssid);
	                    slidehtml += "</div>";
		            }
		            slidehtml += "<div class='slideshowFooter'>This nested compound object created";
	                ccreator = resourceprops.representsCO.properties.data[dc+"creator"];
	                if (ccreator){
	                	slidehtml += " by";
	                	for (var i = 0; i< ccreator.length; i++){
	                		 if (i > 0) {
	                			 slidehtml += ",";
	                		 }
	                		 slidehtml += "  " + ccreator[i].value;
	                	}
	                }
	                slidehtml += displayDate(resourceprops.representsCO.properties.getProperty(dcterms+"created",0), ' on ');
	                slidehtml += displayDate(resourceprops.representsCO.properties.getProperty(dcterms+"modified",0),", last updated ");
		            slidehtml += "</div>";
	            } else {
	                slidehtml += "<a title='Open in LORE' href='#' onclick='lore.ore.controller.loadCompoundObjectFromURL(\"" + resourceprops.uri + "\");'>Nested Compound Object:<br>"
	                        + "<img src='../../skin/icons/action_go.gif'/> Load in LORE</p>";
	            }
	            slidehtml += "</div>";
	        } else {
	            // content slide representing resource
	            title = resourceprops.properties.getTitle() || "Untitled Resource";
	            var format = resourceprops.properties.getProperty(dc+"format",0);
	            
	            var hasPreview = false; // preview disabled by default as secure iframe does not allow plugins
	            var icontype = "pageicon";
	            if (format){
			        if (format.value.match("html")){
			            icontype += " htmlicon";
	                    hasPreview = true;
			        } else if (format.value.match("image")) {
			            icontype += " imageicon";
	                    hasPreview = true;
			        } else if (format.value.match("audio")) {
			            icontype += " audioicon";
			        } else if (format.value.match("video") || format.value.match("flash")){
			            icontype += " videoicon";
			        } else if (format.value.match("pdf")) {
			            icontype += " pdficon";
			        } 
	            }
	            if (resourceprops.representsAnno){
	                hasPreview = true;
	            }
	            // Only allow http/https previews (ie no chrome, data, view-source etc uris) for security reasons
	            if (!(resourceprops.uri.match("^http") == "http")){
	                hasPreview = false;
	            }
	            slidehtml += "<div style='padding:2px;border-bottom: 1px solid #dce0e1;'>";
	            slidehtml += "<a onclick='lore.global.util.launchTab(\"" + resourceprops.uri + "\");' href='#' title='Open in a new tab'><li class='" + icontype + "'>&nbsp;"  + title + "</li></a>";
	            slidehtml += "</div>";
	            slidehtml += this.displayProperties(resourceprops, resource.store.co);
	            var previewEl;
	            if (format && format.value.match("image")){
	                previewEl = document.createElement('img');
	                previewEl.src=resourceprops.uri;
	                previewEl.alt = "image preview";
	                previewEl.onclick= function(e){lore.global.util.launchTab(this.getAttribute('src'),window);e.stopPropagation();return false;};
	                previewEl.style.maxHeight = "100%";
	            } else if (hasPreview) {
	                var theURL = resourceprops.uri;
	                if (resourceprops.representsAnno){
	                    theURL = theURL + '?danno_useStylesheet=';
	                } else if (resourceprops.uri.match('austlit.edu.au') && (resourceprops.uri.match('ShowWork') || resourceprops.uri.match('ShowAgent'))){
	                    theURL = theURL + '&printPreview=y';
	                }
	                previewEl = lore.global.util.createSecureIFrame(window.top, theURL);
	                previewEl.style.width = "100%";
	                previewEl.style.height = "100%";
	                previewEl.name = resourceprops.uri + "-ss";
	                previewEl.id = resourceprops.uri + "-ss";
	                previewEl.style.zIndex = "-9001";
	            } 
	        }   
        	slidehtml += "<p class='slideshowFooter'>";
        	var container = resource.store.co;
        	
        	slidehtml += "Viewing "
        		+ (resourceprops.representsCO ? "nested compound object " :
        		 "<a onclick='lore.global.util.launchTab(\"" + resourceprops.uri + (resourceprops.representsAnno? "?danno_useStylesheet=" : "") +"\");' href='#'>"  + resourceprops.uri + "</a>");
        	// TODO: refactor: remove hardcoding
            if (container){
                slidehtml += " &nbsp; from &nbsp;&nbsp;<a href='#' onclick='Ext.getCmp(\"" + this.ssid + "\").setActiveItem(\""  + container.uri + "\");'>" + (container.properties.getTitle() || container.uri) + "</a>"; 
            }
            slidehtml += "<br>";
            if (container && container.uri.match(lore.ore.cache.getLoadedCompoundObjectUri())){
                slidehtml += " <a href='#' title='Show in graphical editor' onclick='lore.ore.ui.graphicalEditor.scrollToFigure(\"" + resourceprops.uri +"\");'><img src='chrome://lore/skin/icons/graph_go.png' alt='View in graphical editor'></a>";
                slidehtml += " <a href='#' title='Show in details view' onclick='Ext.getCmp(\"loreviews\").activate(\"remdetailsview\");Ext.getCmp(\"remdetailsview\").scrollToResource(\"" + resourceprops.uri + "\")'><img src='chrome://lore/skin/icons/application_view_detail.png'></a>";
                slidehtml += " <a href='#' title='Show in resource list' onclick='Ext.getCmp(\"loreviews\").activate(\"remlistview\");Ext.getCmp(\"remlistview\").selectResource(\"" + resourceprops.uri + "\")'><img src='chrome://lore/skin/icons/application_view_list.png'></a>";
            }   
            slidehtml += " <a href='#' title='Show in explore view' onclick='Ext.getCmp(\"loreviews\").activate(\"remexploreview\");lore.ore.explorePanel.showInExploreView(\"" + resourceprops.uri + "\",\"" + title + "\",false);'><img src='chrome://lore/skin/icons/chart_line.png' alt='View in explore view'></a>";
            
            slidehtml += "</p>";
        }
        if (hasPreview) {
            this.layout = "border";
            this.previewEl = previewEl;
            this.add({
                region: "center",
                autoScroll: true, 
                contentEl: previewEl}); 
            this.add({
                useSplitTips: true,
                region: "south",
                height: 90,
                split: true,
                collapseMode: "mini",
                autoScroll: true, 
                html: slidehtml});
        } else {
            this.html = slidehtml;   
        }
      } catch (e){
    	  lore.debug.ore("loadContent",e);
      }
    },
    /** Reset the iframe to show resource URL */
    resetPreview: function(){ 
      if (this.previewEl && this.previewEl.tagName == 'iframe'){
        this.previewEl.contentWindow.location.href=this.previewEl.getAttribute("src");
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
     * @param {} The data stored for the resource
     */
    addResource : function(resourceData){
        
    },
    /**
     * Remove from TOC
     * @param {} aResource
     */
    removeResource : function(aResource){
        
    }
});
Ext.reg('slidepanel',lore.ore.ui.SlidePanel);
/**
 * @class lore.ore.ui.NarrativePanel Display a text-heavy view of the entire compound object with embedded previews
 * @extends Ext.Panel
 */
 // TODO: allow to be configured eg select which properties to display in this view
lore.ore.ui.NarrativePanel = Ext.extend(Ext.Panel,{ 
   constructor: function (config){
        config = config || {};
        config.bodyStyle = "padding:10px;font-family: arial;font-size:90%"; 
        config.autoScroll = true;
        lore.ore.ui.NarrativePanel.superclass.constructor.call(this, config);
        this.loaded = "";
    },
    initComponent: function(){
        Ext.apply(this,{
            items: [{
                    xtype: "panel", // For Compound object properties
                    border: false
                },
                {xtype: "narrativedataview", selectedClass: 'detailsselected'}]
        });
      lore.ore.ui.NarrativePanel.superclass.initComponent.call(this);
      this.on("activate", this.updateBinding);
    },
    /** Update model binding when panel is activated: in case loaded CO has changed 
     * @param {} p The panel
     */
    updateBinding : function (p) {
        try{
        var currentCO = lore.ore.cache.getLoadedCompoundObject();
        var currentREM = currentCO.uri;
        Ext.MessageBox.show({
               msg: 'Generating Summary',
               width:250,
               defaultTextHeight: 0,
               closable: false,
               cls: 'co-load-msg'
        });
            
         // TODO:  generate tmp co until mvc fixed
         //var currentCO = lore.ore.cache.getLoadedCompoundObject();
         var coContents = currentCO.serialize('rdfquery');
         
         // preload all nested compound objects to cache
         lore.ore.cache.cacheNested(coContents, 0);
         var tmpCO = new lore.ore.model.CompoundObject();
         tmpCO.load({format: 'rdfquery',content: coContents});

        

        /*if (currentREM != this.loaded) {
            // rebind store 
            this.getComponent(1).bindStore(currentCO.aggregatedResourceStore);
            this.loaded = currentREM;
        }*/
        this.getComponent(1).bindStore(tmpCO.aggregatedResourceStore);
        tmpCO.representsCO = false;
        tmpCO.title = tmpCO.properties.getTitle();
        this.getComponent(0).body.update(lore.ore.ui.narrativeCOTemplate.apply([tmpCO]));
        Ext.Msg.hide();
        } catch(e){
        	lore.debug.ore("problem in updateBinding",e);
        	Ext.Msg.hide();
        }
    },
    showResource: function(uri){
    	Ext.getCmp("loreviews").activate(this.id);
    	this.scrollToResource(uri);
    },
    scrollToResource: function(id){
        try{
            var dv = this.getComponent(1);
            if (dv){
	            var node = Ext.get(id);
                node.scrollIntoView(this.body, false);
                dv.select(id);
            }
        } catch (e){
            lore.debug.ore("scrollToResource",e);
        }
    }
});
Ext.reg('narrativepanel',lore.ore.ui.NarrativePanel);

lore.ore.ui.narrativeCOTemplate = new Ext.XTemplate(
    '<tpl for=".">',
    '<div style="width:100%">',
        '<table style="whitespace:normal;width:100%;font-family:arial;padding-bottom;0.5em"><tr><td>',
        '<span style="font-size:140%;font-weight:bold;color:#cc0000;">{title}<tpl if="!title">Untitled Compound Object</tpl></span></td><td style="text-align:right" width="30">',
        '&nbsp;<a href="#" onclick="lore.ore.controller.exportCompoundObject(\'wordml\');">',
        '<img src="chrome://lore/skin/icons/page_white_word.png" title="Export to MS Word"></a>',
        '</td></tr></table>',
        '<p style="font-style:italic;padding-bottom:0.3em;">{uri}</p>',
        '<tpl for="properties">{[this.displayProperties(values)]}</tpl>',
        '<p>&nbsp;</p>',
    '</div>',
    '</tpl>',
    {
        propTpl: new Ext.XTemplate('<tpl for="."><p style="padding-bottom:0.3em;"><span title="{id}" style="font-weight:bold">{[fm.capitalize(values.name)]}:&nbsp;&nbsp;</span>{value}</p></tpl>'),
        /** Custom function to display properties because XTemplate doesn't support wildcard for iterating over object properties 
         *  @param {lore.ore.model.ResourceProperties} o
         */
        displayProperties: function(o){
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
          try {
            
            var ns = lore.constants.NAMESPACES;
            var dcterms = ns["dcterms"];
            var dc = ns["dc"];
            
            var res="";
            var ccreator = o.data[dc+"creator"];
            if (ccreator){
                res += "<p style='padding-bottom:0.5em'>Created";
                res += " by";
                for (var i = 0; i< ccreator.length; i++){
                     if (i > 0) {
                         res += ",";
                     }
                     res += "  " + ccreator[i].value;
                }
                res += displayDate(o.getProperty(dcterms+"created",0),' on ');
                res += displayDate(o.getProperty(dcterms+"modified",0), ', last updated ');
                res += "</p>";
            } 
  
            var skipProps = {};
            skipProps[ns["ore"]+"describes"] = true;
            skipProps[dcterms+"created"] = true;
            skipProps[dcterms+"modified"] = true;
            skipProps[dc+"creator"] = true;
            skipProps[dc+"title"]=true;
            skipProps[ns["rdf"]+"type"]=true;
            skipProps[ns["lorestore"]+"user"]=true;
            
            var sortedProps = o.getSortedArray(skipProps);
            for (var k = 0; k < sortedProps.length; k ++){
                res += this.propTpl.apply(sortedProps[k]);
            }   
            return res;
          } catch (ex){
            lore.debug.ore("problem with template",ex);
          }
        }
    }
);
lore.ore.ui.narrativeResTemplate = new Ext.XTemplate(  
    '<tpl for=".">',
    '<div id="{uri}">',
        '<div style="border-top: 1px solid rgb(220, 224, 225); margin-top: 0.5em;"> </div>',
        '<table style="white-space:normal;width:100%;font-family:arial;padding-bottom:0.5em"><tr><td>',
        '<span style="font-size:130%;font-weight:bold">{title}<tpl if="!title">Untitled Resource</tpl></span></td>',
        '<td width="80"><a href="#" title="Show in graphical editor" onclick="lore.ore.ui.graphicalEditor.showResource(\'{uri}\');"><img src="chrome://lore/skin/icons/layout_pencil.png" alt="View in graphical editor"></a>',
        '&nbsp;<a href="#" title="Show in resource list" onclick="Ext.getCmp(\'remlistview\').showResource(\'{uri}\')"><img src="chrome://lore/skin/icons/table_edit.png"></a>',
        '&nbsp;<a href="#" title="Show in slideshow view" onclick="Ext.getCmp(\'newss\').showResource(\'{uri}\');"><img src="chrome://lore/skin/icons/picture_empty.png" alt="View in slideshow view"></a>',
        '&nbsp;<a href="#" title="Show in explore view" onclick="lore.ore.explorePanel.showInExploreView(\'{uri}\',\'{title}\',{representsCO});"><img src="chrome://lore/skin/icons/network.png" alt="View in explore view"></a>',
        '</td></tr></table>',
        '<tpl if="representsCO == true"><ul><li class="mimeicon oreicon" style="font-style:italic;padding-bottom:0.5em;"><a title="Open in LORE" href="#" onclick="lore.ore.controller.loadCompoundObjectFromURL(\'{uri}\');">{uri}</a></li></ul></tpl>',
        '<tpl if="representsCO == false && representsAnno == true"><ul><li class="mimeicon annoicon" style="font-style:italic;padding-bottom:0.5em;"><a title="Show in browser" onclick="lore.global.util.launchTab(\'{uri}?danno_useStylesheet=\')" href="#">{uri}</a></li></ul></tpl>',
        '<tpl if="representsCO == false && representsAnno == false"><ul><li class="mimeicon {[lore.ore.controller.lookupIcon(values.properties.getProperty(lore.constants.NAMESPACES["dc"]+"type",0) || values.properties.getProperty(lore.constants.NAMESPACES["dc"]+"format",0), values.properties.getProperty(lore.constants.NAMESPACES["dc"]+"type",0))]}" style="font-style:italic;padding-bottom:0.5em;"><a title="Show in browser" onclick="lore.global.util.launchTab(\'{uri}\')" href="#">{uri}</a></li></ul></tpl>',
        '<tpl for="properties">{[this.displayProperties(values)]}</tpl>',
    '</div>',
    '</tpl>',
    {
        propTpl: new Ext.XTemplate('<p style="padding-bottom:0.3em;"><span title="{id}" style="font-weight:bold">{[fm.capitalize(values.name)]}:&nbsp;&nbsp;</span>{value}</p>'),
        relTpl: new Ext.XTemplate('<p style="padding-bottom:0.3em;"><a href="#" onclick="Ext.getCmp(\'remdetailsview\').scrollToResource(\'{value}\')"><span title="{id}" style="font-weight:bold">{[fm.capitalize(values.name)]}:&nbsp;&nbsp;</span></a><a href="#" title="Show {url} in browser" onclick="lore.global.util.launchTab(\'{url}\')">{title}</a></p>'),
        /** Custom function to display properties because XTemplate doesn't support wildcard for iterating over object properties 
         *  @param {lore.ore.model.ResourceProperties} o
         */
        displayProperties: function(o){
          try{
            var ns = lore.constants.NAMESPACES;
            var dcterms = ns["dcterms"];
            var dc = ns["dc"];
            var skipProps = {};
            skipProps[dc+"title"]=true;
            skipProps[dc+"format"]=true;
            skipProps[ns["rdf"]+"type"]=true;
            var sortedProps = o.getSortedArray(skipProps);
            var res = "";
            for (var k = 0; k < sortedProps.length; k ++){
                var propArray = sortedProps[k];
                for (var i=0; i < propArray.length; i++){
                    var prop = propArray[i];
                    // don't include layout props
                    if(prop.prefix != "layout"){
                        // look up title for rels
                        if (prop.value.toString().match("^http://") == "http://") {
	                        // property data for related resource: for looking up title etc
	                        var propR = lore.ore.cache.getLoadedCompoundObject().getAggregatedResource(prop.value);
                            if (propR) {
                                prop.title = propR.get('properties').getTitle() || prop.value;
                                prop.url = propR.get('representsAnno') ? prop.value + "?danno_useStylesheet=" : prop.value;
	                        } else {
	                            prop.title = prop.value;
                                prop.url = prop.value;
	                        }
                            res += this.relTpl.apply(prop);
                        } else {
                            res += this.propTpl.apply(prop);
                        }
                    }
                }
            }   
            return res;
          } catch (ex){
                lore.debug.ore("problem with template",ex);
          }
        }
    }
);

/**
 * @class lore.ore.ui.NarrativeDataView Data view to render aggregated resources in Narrative view
 * @extends Ext.DataView
 */
/**
 * @class lore.ore.ui.NarrativeDataView Displays the properties and relationships of every resource in the compound object in full (text format)
 * @extends Ext.DataView
 */
lore.ore.ui.NarrativeDataView = Ext.extend(Ext.DataView, {
    initComponent : function(){
        Ext.apply(this, { 
            tpl :  lore.ore.ui.narrativeResTemplate,
            loadingText: "Loading resource summaries...",
            singleSelect: true,
            autoScroll: false,
            itemSelector : "div.resourceSummary"
        });
        lore.ore.ui.NarrativeDataView.superclass.initComponent.call(this,arguments); 
    }
    
});
Ext.reg('narrativedataview', lore.ore.ui.NarrativeDataView);


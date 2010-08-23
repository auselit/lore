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
        this.on("activate", this.updateContent);
        this.loaded = "";
    },
    initComponent: function(){
        Ext.apply(this,{
            items: [{
                    xtype: "panel" // For Compound object properties
                },
                {xtype: "narrativedataview"}]
        });
      lore.ore.ui.NarrativePanel.superclass.initComponent.call(this);  
    },
    /** Temporary function to regenerate content each time the panel is activated 
     * @param {} p The panel
     */
    updateContent : function (p) {
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
         //var coContents = currentCO.serialize('rdfquery');
         
         // preload all nested compound objects to cache
         //lore.ore.cacheNested(coContents, 0);
         //var tmpCO = new lore.ore.model.CompoundObject();
         //tmpCO.load({format: 'rdfquery',content: coContents});

        if (currentREM != this.loaded) {
            // rebind store
            //this.getComponent(0).bindStore(tmpCO.aggregatedResourceStore);
            this.getComponent(0).bindStore(currentCO.aggregatedResourceStore);
            this.loaded = currentREM;
        }
        Ext.Msg.hide();
        
    }
});
Ext.reg('narrativepanel',lore.ore.ui.NarrativePanel);
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
            tpl :  new Ext.XTemplate(  
                '<tpl for=".">',
                '<div class="resourceSummary" id="res{#}">',
                    '<div style="border-top: 1px solid rgb(220, 224, 225); width: 100%; margin-top: 0.5em;"> </div>',
                    '<table style="width:100%;font-family:arial;padding-bottom:0.5em"><tr><td>',
                    '<tpl if="representsCO == true"><a title="Open in LORE" href="#" onclick="lore.ore.controller.loadCompoundObjectFromURL(\'{uri}\');"><img style="padding-right:5px" src="chrome://lore/skin/oaioreicon-sm.png"></a></tpl>',  
                    '<span style="font-size:130%;font-weight:bold">{title}<tpl if="!title">Untitled Resource</tpl></span></td>',
                    '<td width="60"><a href="#" title="Show in graphical editor" onclick="lore.ore.ui.graphicalEditor.scrollToFigure(\'{uri}\');"><img src="chrome://lore/skin/icons/graph_go.png" alt="View in graphical editor"></a>',
                    '&nbsp;<a href="#" title="Show in slideshow view" onclick="Ext.getCmp(\'loreviews\').activate(\'remslideview\');Ext.getCmp(\'newss\').setActiveItem(\'{uri}_{[lore.ore.cache.getLoadedCompoundObjectUri()]}\');"><img src="chrome://lore/skin/icons/picture_empty.png" alt="View in slideshow view"></a>',
                    '&nbsp;<a href="#" title="Show in explore view" onclick="Ext.getCmp(\'loreviews\').activate(\'remexploreview\');lore.ore.explorePanel.showInExploreView(\'{uri}\',\'{title}\',{representsCO});"><img src="chrome://lore/skin/icons/chart_line.png" alt="View in explore view"></a>',
                    '</td></tr></table>',
                    '<tpl if="representsCO == false"><p style="font-style:italic;padding-bottom:0.5em;"><a title="Show in browser" onclick="lore.global.util.launchTab(\'{uri}\')" href="#">{uri}</a></p></tpl>',
                    '<tpl for="properties">{[this.displayProperties(values)]}</tpl>',
                '</div>',
                '</tpl>',
                {
                    propTpl: new Ext.XTemplate('<p><span title="{id}" style="font-weight:bold">{[fm.capitalize(values.name)]}:&nbsp;&nbsp;</span>{value}</p>'),
                    /** Custom function to display properties because XTemplate doesn't support wildcard for iterating over object properties 
                     *  @param {lore.ore.model.ResourceProperties} o
                     */
                    displayProperties: function(o){
                        // TODO: sort these
                      try{
                        var res = "";
                        for (var p in o.data){
                            var propArray = o.data[p];
                            for (var i=0; i < propArray.length; i++){
                                var prop = propArray[i];
                                // don't include layout TODO: filter out some other props like dc:format?
                                if(prop.prefix != "layout" && prop.prefix != 'rdf'){
                                    res += this.propTpl.apply(prop);
                                }
                            }
                        }   
                        return res;
                      } catch (ex){
                            lore.debug.ore("problem",ex);
                      }
                    }
                }
            ),
            loadingText: "Loading resource summaries...",
            singleSelect: true,
            autoScroll: true,
            itemSelector : "div.resourceSummary"
        });
        lore.ore.ui.NarrativeDataView.superclass.initComponent.call(this,arguments); 
    }
    
});
Ext.reg('narrativedataview', lore.ore.ui.NarrativeDataView);

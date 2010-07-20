/**
 * @class lore.ore.ui.SummaryPanel Display a text-based summary of the entire compound object
 * @extends Ext.Panel
 */
lore.ore.ui.SummaryPanel = Ext.extend(Ext.Panel,{ 
   constructor: function (config){
        config = config || {};
        config.autoScroll = true;
        lore.ore.ui.SummaryPanel.superclass.constructor.call(this, config);
        this.on("activate", this.updateContent);
    },
    /** Temporary function to regenerate content each time the panel is activated 
     * @param {} p The panel
     */
    updateContent : function (p) {
        try{
            Ext.MessageBox.show({
                   msg: 'Generating Summary',
                   width:250,
                   defaultTextHeight: 0,
                   closable: false,
                   cls: 'co-load-msg'
            });
            
            // TODO:  should listen to model and this should not be regenerated each time
            var coContents = lore.ore.serializeREM('rdfquery');
            // preload all nested compound objects to cache
            lore.ore.cacheNested(coContents, 0);
            var tmpCO = new lore.ore.model.CompoundObject();
            tmpCO.load({format: 'rdfquery',content: coContents});
            p.loadContent(tmpCO);
            Ext.Msg.hide();
        } catch (e){
            lore.debug.ore("problem showing summary",e);
        }
    },
    // TODO: listen to model rather than updating entire view each time
    /** Displays a summary of the resource URIs aggregated by the compound object 
      */
    loadContent : function (compoundObject){
        lore.debug.ore("Summary loadContent",compoundObject);
        
        var newsummary = 
                "<table style='width:100%;border:none'>"
                + "<tr valign='top'><td width='23%'>" 
                + "<b>Compound object:</b></td><td>"
                + "<div style='float:right;padding-right:5px'>" 
                + "<a href='#' onclick='lore.ore.handleSerializeREM(\"wordml\")'>"
                + "<img src='chrome://lore/skin/icons/page_white_word.png' title='Export summary to MS Word'>"
                + "</a></div>"
                + lore.ore.cache.getLoadedCompoundObjectUri() + "</td></tr>";
        var title = lore.ore.getPropertyValue("dc:title",lore.ore.ui.grid) 
            || lore.ore.getPropertyValue("dcterms:title",lore.ore.ui.grid);
        if (title) {
            newsummary += "<tr valign='top'><td width='23%'><b>Title:</b></td><td>"
                    + title + "</td></tr>";
        }
       
        var desc = lore.ore.getPropertyValue("dc:description",lore.ore.ui.grid);
        if (desc) {
            newsummary += "<tr valign='top'><td><b>Description:</b></td><td width='77%'>"
                    + desc + "</td></tr>";
        }
        var abst = lore.ore.getPropertyValue("dcterms:abstract",lore.ore.ui.grid);
        if (abst) {
            newsummary += "<tr valign='top'><td><b>Abstract:</b></td><td width='77%'>"
                + abst + "</td></tr>";
        }
        newsummary += "</table>";
        var newsummarydetail = "<div style='padding-top:1em'>";
        var tocsummary = "<div style='padding-top:1em'><p><b>List of resources:</b></p><ul>";
        var allfigures = lore.ore.ui.graphicalEditor.coGraph.getDocument().getFigures().data;
        allfigures.sort(lore.ore.ui.graphicalEditor.figSortingFunction);
        for (var i = 0; i < allfigures.length; i++) {
            var fig = allfigures[i];
            if (fig instanceof lore.ore.ui.graph.ResourceFigure){
                var figurl = lore.global.util.escapeHTML(fig.url);
                var title = fig.getProperty("dc:title_0") 
                    || fig.getProperty("dcterms:title_0") 
                    || "Untitled Resource";
                tocsummary += "<li>";
                
                var isCompObject = (fig.getProperty("rdf:type_0") == lore.constants.RESOURCE_MAP);
                if (isCompObject){
                    tocsummary += "<a title='Open in LORE' href='#' onclick='lore.ore.readRDF(\"" + figurl + "\");'><img style='padding-right:5px' src='chrome://lore/skin/oaioreicon-sm.png'></a>";
                }
                tocsummary += title + ": &lt;"
                + (!isCompObject?"<a onclick='lore.global.util.launchTab(\"" + figurl + "\");' href='#'>" 
                + figurl + "</a>" : figurl) + "&gt;<a href='#res" + i + "'> (details)</a>";
                tocsummary += " <a href='#' title='Show in graphical editor' onclick='lore.ore.ui.graphicalEditor.scrollToFigure(\"" + figurl +"\");'><img src='chrome://lore/skin/icons/graph_go.png' alt='View in graphical editor'></a>";
                tocsummary += " <a href='#' title='Show in slideshow view' onclick='Ext.getCmp(\"loreviews\").activate(\"remslideview\");Ext.getCmp(\"newss\").setActiveItem(\"" + figurl + "_" + lore.ore.cache.getLoadedCompoundObjectUri() + "\");'><img src='chrome://lore/skin/icons/picture_empty.png' alt='View in slideshow view'></a>";
                tocsummary += " <a href='#' title='Show in explore view' onclick='Ext.getCmp(\"loreviews\").activate(\"remexploreview\");lore.ore.explorePanel.showInExploreView(\"" + figurl + "\",\"" + title + "\"," + isCompObject+ ");'><img src='chrome://lore/skin/icons/chart_line.png' alt='View in explore view'></a>";
                tocsummary += "</li>";
                newsummarydetail += "<div style='border-top: 1px solid rgb(220, 224, 225); width: 100%; margin-top: 0.5em;'> </div>";
                newsummarydetail += "<p id='res"+ i + "'>";
                if (isCompObject){
                    newsummarydetail += "<a title='Open in LORE' href='#' onclick='lore.ore.readRDF(\"" + figurl + "\");'><img style='padding-right:5px' src='chrome://lore/skin/oaioreicon-sm.png'></a>";
                }
                newsummarydetail += "<b>" + title + "</b><br>&lt;" + (!isCompObject? "<a onclick='lore.global.util.launchTab(\"" + figurl + "\");' href='#'>" + figurl + "</a>" : figurl) + "&gt;</p><p>";
                
                for (p in fig.metadataproperties){
                    var pname = p;
                    var pidx = p.indexOf("_");
                    if (pidx != -1){
                        pname = p.substring(0,pidx);
                    }
                    if (pname != 'resource' && pname != 'dc:format' && pname != 'rdf:type' && fig.metadataproperties[p]){
                        newsummarydetail += //"<a href='#' onclick='lore.ore.editResDetail(\"" + fig.url + "\",\"" +  p + "\");'><img title='Edit in Resource Details view' src='chrome://lore/skin/icons/pencil.png'></a>&nbsp;" +
                                "<b>" + pname + "</b>: " + fig.metadataproperties[p] + "<br>";
                    }
                    else if (pname == 'rdf:type' && fig.metadataproperties[p] == lore.constants.RESOURCE_MAP){
                        isCompObject = true;
                    }
                }
                /*
                if (isCompObject){
                    newsummarydetail += "<a href='#' onclick='lore.ore.loadCompoundObjectContents(\"" + fig.url + "\",jQuery(\"#content" + i + "\"))'><span id='content" + i + "' style='font-size:smaller'> View contents</span></a>";
                }
                */
                newsummarydetail += "</p>";        
            }
        }
        tocsummary += "</ul></div>";
        newsummarydetail += "</div>";
        this.body.update(newsummary + newsummarydetail + tocsummary);
        
        lore.ore.ui.loreInfo("Displaying a summary of compound object contents"); 
    }
});
Ext.reg('summarypanel',lore.ore.ui.SummaryPanel);
/**
 * Object which manages retrieving RDFa from a page
 * @param {Object} config
 * @class lore.anno.ui.RDFaManager
 * @extends Ext.util.Observable
 */
lore.anno.ui.RDFaManager = Ext.extend(Ext.util.Observable, {
    
    /**
     * @constructor
     * @param {Object} config
     * page: The current page
     */
    constructor:function (config) {
        this.page = config.page;
        this.addEvents(
            /**
             * @event rdfaloaded
             * Fires when the RDFa for the page is finished loading.
             */
            'rdfaloaded');
    },

    /**
     * Load the RDFa for the page
     * Fires 'rdfaloaded' event.
     * @param {Object} contentWindow
     */
    load: function (contentWindow ){
        // TODO: add check for store, and get cached RDFA
        if (!this.page.rdfa.triples) {
            this.gleanRDFa(contentWindow.document);
            this.fireEvent('rdfaloaded');
        }
    },
    
    /**
     * Retrieve RDFa from a page and
     * store it in the PageData object
     * @param {Object} doc
     */
    gleanRDFa : function (doc) {    
        try {
            var myrdf = $('body', doc).rdfa();
            
            this.page.rdfa = {
                triples: myrdf.databank.triples(),
                rdf: myrdf
            };
            
            lore.debug.anno('gleanRDFa', [doc, this.page.rdfa]);        
        }catch (e) {
            lore.debug.anno("Error gleaning potential rdfa from page", e);
        }
    }
    
    // current not used
    /*isRDFaEnabled : function (doc) {
        var enabled = false;
        if (doc.doctype) {
            enabled = doc.doctype.publicId == "-//W3C//DTD HTML4+RDFa 1.0//EN" || doc.doctype.publicId == "-//W3C//DTD XHTML+RDFa 1.0//EN";
        }
        return enabled;
    }*/
});


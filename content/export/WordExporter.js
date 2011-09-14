
Ext.namespace("lore.exporter");
lore.exporter.WordExporter = function(){
    this.zipWriter = Components.classes["@mozilla.org/zipwriter;1"]
         .createInstance(Components.interfaces.nsIZipWriter);
    this.converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
         .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    this.converter.charset = "UTF-8";
    // File pointer to template word docx file
    var wordDocPath = lore.util.chromeToPath("chrome://lore/content/export/template.docx");  
    this.wordTemplate = Components.classes["@mozilla.org/file/local;1"]
         .createInstance(Components.interfaces.nsILocalFile);
    this.wordTemplate.initWithPath(wordDocPath);
}
lore.exporter.WordExporter.prototype = {
    coreXMLTemplate: new Ext.Template(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',
        '<dc:creator>LORE</dc:creator>',
        '<cp:lastModifiedBy>LORE</cp:lastModifiedBy>',
        '<cp:revision>1</cp:revision>',
        '<dcterms:created xsi:type="dcterms:W3CDTF">{date}</dcterms:created>',
        '<dcterms:modified xsi:type="dcterms:W3CDTF">{date}</dcterms:modified>',
        '</cp:coreProperties>'
    ),
    relTemplate : new Ext.XTemplate(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
        '<Relationship Id="rIdws" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings" Target="webSettings.xml" />', 
        '<Relationship Id="rIdst" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml" />',
        '<Relationship Id="rIdsl" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml" />', 
        '<Relationship Id="rIdt" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml" />' ,
        '<Relationship Id="rIdf" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml" />', 
        '<tpl for=".">',
        '<Relationship Id="rId{#}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="{[lore.util.escapeHTML(values)]}" TargetMode="External"/>',
        '</tpl>',
        '</Relationships>'
    ),
    PR_RW : 0x04,
    PR_CREATE_FILE: 0x08,
    PR_TRUNCATE: 0x20,
    PR_APPEND: 0x10,
    PR_SYNC: 0x40,
    /**
     * Prompt user for file location and create a Word 2007 (docx) file
     * @param {} docxml main document content - refer to hyperlinks using rId# where # is the index in the rels array
     * @param {} rels an array of urls that should be turned into hyperlinks in the document
     */
    createWordFile: function(docxml,rels) {
         lore.debug.ui("exporting to docx",[docxml,rels]);
         try{
            if (typeof docxml == "undefined" || typeof rels == "undefined"){
                lore.debug.ui("createWordFile: not enough params",[docxml,rels]);
                return;
            }
            
            // prompt user to choose file location and name for new word doc
            var nsIFilePicker = Components.interfaces.nsIFilePicker;
            var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
            fp.defaultExtension = "docx";
            fp.defaultString = "LORE-export.docx";
            fp.appendFilter("MS Word 2007 documents","*.docx");
            fp.init(window, "Save Word document as", nsIFilePicker.modeSave);
            var res = fp.show();
            
            if (res == nsIFilePicker.returnOK || res == nsIFilePicker.returnReplace) {
                // copy template docx to new file
                this.wordTemplate.copyTo(fp.file.parent, fp.file.leafName);
                // create core.xml file contents
                var created = new Date();
                var corexml = this.coreXMLTemplate.apply({date: created.format('c')});
                // create rels xml file content
                var relsxml =  this.relTemplate.apply(rels)
                // convert all contents to streams
                var stream = this.converter.convertToInputStream(corexml);
                var docxmlStream = this.converter.convertToInputStream(docxml);
                var relsxmlStream = this.converter.convertToInputStream(relsxml);

                // open the new docx file (docx is a zip file)
                this.zipWriter.open(fp.file, this.PR_RW | this.PR_CREATE_FILE | this.PR_APPEND | this.PR_SYNC);
                // add entries for content files
                this.zipWriter.addEntryStream("docProps/core.xml", created, this.zipWriter.COMPRESSION_DEFAULT, stream, true);
                this.zipWriter.addEntryStream("word/document.xml", created, this.zipWriter.COMPRESSION_DEFAULT, docxmlStream, true);
                this.zipWriter.addEntryStream("word/_rels/document.xml.rels", created, this.zipWriter.COMPRESSION_DEFAULT, relsxmlStream, true);
                this.zipWriter.processQueue(new lore.exporter.QueueObserver(this.zipWriter), null);
            }
         } catch (ex){
            lore.debug.ui("Error exporting to docx",ex);
         }
    }
    
}
lore.exporter.QueueObserver = function(zipWriter){
    this.zipWriter = zipWriter;
}
lore.exporter.QueueObserver.prototype = {
    onStartRequest: function(aRequest, aContext){
    },
    onStopRequest: function(aRequest, aContext, aStatusCode){
        this.zipWriter.close();
        lore.debug.ui("done exporting to docx");
    }
}
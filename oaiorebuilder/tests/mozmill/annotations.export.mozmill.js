try { 
var jumlib = {};

Components.utils["import"]("resource://mozmill/modules/jum.js", jumlib);

var lore = { global : {}};
Components.utils["import"]("resource://lore/util.js", lore.global);
Components.utils["import"]("resource://loretest/mozmill/modules/LoreController.js");

var testExport = function () {
	/*var oldFunction = lore.global.util.writeFileWithSaveAs;
	controller = mozmill.getBrowserController();
	
	lore.global.util.writeFileWithSaveAs = function(w) {
		w.alert('hi!');
	};
	
	lore.global.util.writeFileWithSaveAs = oldFunction;
	controller.click(new elementslib.ID(controller.window.document, "import-export-anno"));
	controller.click(new elementslib.ID(controller.window.document, "save-xml"));
	
	
	//loreController.anno.lore.debug.anno('zzzz',{oldf: oldFunction, newf: lore.global.util.writeFileWithSaveAs});
	
	//lore.global.util.writeFileWithSaveAs(controller.window);
	
	//TODO: problems with opening the dialog
	// may have to just rely upon unit test for preforming serialization... although not actively testing code
	// that saves to file, could
	*/
}
	
	
} catch (e ) {
	controller.window.alert(e);
}
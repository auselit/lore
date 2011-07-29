
var jumlib = {};
Components.utils["import"]("resource://mozmill/modules/jum.js", jumlib);

var setupModule = function(module) {
  controller = mozmill.getBrowserController();
}

var testLoadRdfaPage = function (){
  controller.open("chrome://loretest/content/agent_rdfa.html");
  controller.waitForPageLoad(controller.tabs.activeTab);
}

var testOpenLore = function (){
   if (!controller.window.loreoverlay.compoundObjectsVisible()){
     controller.click(new elementslib.ID(controller.window.document, "loreStatusIcon"));
   }
   jumlib.assertTrue(controller.window.loreoverlay.compoundObjectsVisible(),'lore compound objects should be open');
};

var testProcessRDFa = function(){
  
};

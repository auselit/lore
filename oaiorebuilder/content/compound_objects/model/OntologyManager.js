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
Ext.namespace("lore.ore.model");
/** @class lore.ore.model.OntologyManager Manage object and datatype properties from domain ontology that can be used in compound objects */
lore.ore.model.OntologyManager = function() {
    /** Default list of properties that can be specified for compound objects or resources 
    * @const */
    this.METADATA_PROPS = ["dcterms:abstract", "dcterms:audience", "dc:creator",
        "dc:contributor", "dc:coverage", "dc:description",
        //"dc:format", "dcterms:hasFormat", 
        "dcterms:created", "dcterms:modified",
        "dc:identifier", "dc:language",
        "dc:publisher", "dc:rights", "dc:source",
        "dc:subject", "dc:title"];
    /** Properties that are mandatory for compound objects
     *  @const */
    this.CO_REQUIRED = ["dc:creator","dcterms:created",
        "dcterms:modified", "ore:describes", "rdf:about", "rdf:type"
    ];
    /** Properties that are mandatory for an aggregated resource
     *  @const */
    this.RES_REQUIRED = ["resource"];
    /** Properties that are mandatory for a relationship 
     * @const */
    this.REL_REQUIRED = ["relationship", "namespace"];

    /** URL from which current ontology was loaded (may be different from URL e.g. when ontology is loaded from local chrome URL)*/
    this.ontologyURL = "";
    
    /** URI identifying current ontology */
    this.ontologyURI = "";
    
    /** RDFQuery object representing current ontology */
    this.ontology = {};
    
    this.dataTypeProps = [];
    
	/*
	 * this.objectPropertiesStore = new Ext.data.JsonStore({ idProperty : "uri",
	 * sortInfo: { field: "term" }, storeId: "objectProperties", data: [],
	 * fields : [{ "name" : "uri" }, { "name" : "term" }, { "name" : "ns" }, {
	 * "name" : "prefix" }, { "name" : "valueType" }, { "name" : "description" }, {
	 * "name" : "subPropertyOf" } ] }),
	 */
	// Trees to keep track of properties
	/*this.datatypePropertiesTree = new Ext.data.Tree({
				root : new Ext.tree.TreeNode({
							hidden : true
						})
			});
	this.objectPropertiesTree = new Ext.data.Tree({
				root : new Ext.tree.TreeNode({
							hidden : true
						})
			});*/
};
// SPARQL query to get all top level object props:
// select ?p ?p2 where {?p a owl:ObjectProperty . OPTIONAL {?p
// rdfs:subPropertyOf ?p2} . FILTER (!BOUND(?p2))}

// select ?p where {?p rdfs:subPropertyOf <>}

Ext.apply(lore.ore.model.OntologyManager.prototype, {
	/**
	 * Populate connection context menu with relationship types from the
	 * ontology. Assumes that onturl has been set in init from preferences
	 */
	loadOntology : function(onturl) {
		try {
            var om = this;
            this.ontologyURL = onturl;
			this.ontrelationships = {};
            lore.ore.ontrelationships = this.ontrelationships;
			//lore.ore.resource_metadata_props = ["rdf:type","ore:isAggregatedBy"];
			if (onturl) {
				var xhr = new XMLHttpRequest();
				xhr.overrideMimeType('text/xml');
				xhr.open("GET", onturl, true);
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4) {
						try {
							var db = jQuery.rdf.databank();
							for (ns in lore.constants.NAMESPACES) {
								db.prefix(ns, lore.constants.NAMESPACES[ns]);
							}
							db.load(xhr.responseXML);
							var relOntology = jQuery.rdf({
								databank : db
							});
							//lore.debug.ore("loading relationships from " + onturl,relOntology);
							// RDF properties
							relOntology.where('?prop rdf:type <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property>')
									.each(function() {
										var relresult = lore.global.util
												.splitTerm(this.prop.value
														.toString());
										om.ontrelationships[relresult.term] = relresult.ns;
									});
							// OWL Object properties
							relOntology.where('?prop rdf:type <'
									+ lore.constants.OWL_OBJPROP + '>').each(
									function() {
										try {
											var relresult = lore.global.util
													.splitTerm(this.prop.value
															.toString());
											om.ontrelationships[relresult.term] = relresult.ns;

										} catch (e) {
											lore.debug.ore("problem loading rels", e);
										}
									});
                            om.ontology = relOntology;
							//lore.debug.ore("ontology relationships are", this.ontrelationships);
							// TODO: #13 load datatype properties for prop grids
							// update properties UI eg combo box in search, menu
							// for selecting rel type
							om.dataTypeProps = om.METADATA_PROPS.slice(0);
							relOntology.where('?prop rdf:type <' + lore.constants.OWL_DATAPROP + '>').each(
									function (){
										try {
											var relresult = lore.global.util.splitTerm(this.prop.value.toString());
											var ns = lore.constants.nsprefix(relresult.ns);
											om.dataTypeProps.push(ns + ":" + relresult.term);
										} catch (e){
											lore.debug.ore("Problem loading data props",e);
										}
									}
							);
							
						} catch (e) {
							lore.debug.ore("problem loading rels", e);
						}
					}
				};
				xhr.send(null);
			}
		} catch (e) {
			lore.debug.ore("loadOntology:", e);
		}
	},
	getDataTypeProperties : function(){
		return this.dataTypeProps;
	}
});
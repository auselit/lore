/**
 * @class Ext.data.RdfStore
 * @extends Ext.data.Store
 *          <p>
 *          Small helper class to wrapper an rdfquery databank as an
 *          Ext.data.Store An RdfStore is automatically configured with a
 *          {@link Ext.data.JsonReader} with three fields (subject, predicate
 *          and object) and listeners to update the rdfquery databank.
 *          </p>
 * @constructor
 * @param {jQuery.rdf.databank}
 *            db The databank to be wrappered
 * @xtype rdfstore
 */
Ext.ux.RdfStore = Ext.extend(Ext.data.Store, {
	constructor : function(db) {
		Ext.ux.RdfStore.superclass.constructor.call(this, {
					// Json Reader for triples
					reader : new Ext.data.JsonReader({
								fields : [{
											name : 'subject',
                                            type: 'string'
										}, {
											name : 'property',
                                            type: 'string'
										}, {
											name : 'object',
                                            type: 'string'
										}]
							})

				});
		this.loadData(db.triples());
		this.databank = db;
		// listeners to keep the rdfquery databank up to date with the json
		this.on({
					"add" : {
						fn : function(store, records, index) {
							try {
								for (var i = 0; i < records.length; i++) {
									var rec = records[i];
									if (rec.data.subject && rec.data.predicate
											&& rec.data.object) {
										this.databank
												.add(new jQuery.rdf.triple(
														rec.data.subject,
														rec.data.predicate,
														rec.data.object));
									}
								}
								lore.debug.ore(
										"RdfStore: added records, databank now of size "
												+ this.databank.size(),
										this.databank);
							} catch (ex) {
								lore.debug.ore(
										"RdfStore: error on add to databank",
										ex);
							}
						}
					},
					"update" : {
						fn : function(store, rec, op) {
							try {
								// if (op == Ext.data.Record.COMMIT) {
								var subj = rec.modified.subject
										? rec.modified.subject
										: rec.data.subject;
								var pred = rec.modified.property
										? rec.modified.property
										: rec.data.property;
								var obj = rec.modified.object
										? rec.modified.object
										: rec.data.object;
								if (subj && pred && obj) {
									this.databank.remove(new jQuery.rdf.triple(
											subj, pred, obj));
								}

								if (rec.data.subject && rec.data.property
										&& rec.data.object) {
									this.databank
											.add(new jQuery.rdf.triple(
													rec.data.subject,
													rec.data.property,
													rec.data.object));
								}
								lore.debug.ore("RdfStore: updated databank",
										this.databank);
								// }
								// lore.debug.ore("RdfStore: update handler");
							} catch (ex) {
								lore.debug.ore(
										"RdfStore: error on update databank",
										ex);
							}
						}
					},
					"remove" : {
						fn : function(store, rec, index) {
							try {
								this.databank.remove(rec.json);
								lore.debug.ore(
										"RdfStore: removed record, databank now of size "
												+ this.databank.size(),
										this.databank);
							} catch (ex) {
								lore.debug
										.ore(
												"RdfStore: error on delete from databank",
												ex);
							}
						}
					}

				});
	}
});
Ext.reg('rdfstore', Ext.ux.RdfStore);

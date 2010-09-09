/**
 * A grid to display RDF triples
 */
Ext.ux.RdfGrid = Ext.extend(Ext.grid.EditorGridPanel,{
    frame: true,
    title: 'RDF',
    height: 300,
    width: 500,
    initComponent: function (){
        this.relayEvents(this.store, ['destroy', 'save', 'update']);
        this.plugins = [
            new Ext.ux.grid.RowEditor({saveText: 'Update'})
        ];
        this.colModel = new Ext.grid.ColumnModel({
            defaults: {
                sortable: true, 
                width: 120
            },
            columns: [
                {
                    header: 'Subject', 
                    dataIndex: 'subject', 
                    renderer: 'htmlEncode',
                    editor: {
                        xtype: 'textfield',
                        allowBlank: false
                    }
                },
                {
                    header: 'Predicate',
                    dataIndex: 'property',
                    renderer: 'htmlEncode',
                    editor: {
                        xtype: 'textfield',
                        allowBlank: false
                    }
                },
                {
                    header: 'Object', 
                    dataIndex: 'object',
                    renderer: 'htmlEncode',
                    editor: {
                        xtype: 'textfield',
                        allowBlank: false
                    }
                }
            ]
        });
        this.viewConfig = {
            markDirty: false,
            forceFit: true
        };
        this.tbar = [{
            text: 'Add',
            handler: this.onAdd,
            scope:this
       },{
            text: 'Delete',
            handler: this.onDelete,
            scope:this
       }, {
            text: 'Update',
            handler: this.onSave,
            scope:this
       }];
       this.selModel =  new Ext.grid.RowSelectionModel({singleSelect:true});
       Ext.ux.RdfGrid.superclass.initComponent.call(this);
    },
    onSave: function(btn,ev){
        try{
        this.store.save();
        } catch (ex) {
            lore.debug.ore("RdfGrid: error on save",ex);
        }
    },
    onAdd: function(btn,ev){
         try{
            var u = new this.store.recordType({
                'subject' : '',
                'predicate': '',
                'object' : ''
            });
	        this.stopEditing();
	        this.store.insert(0, u);
            this.getView().refresh();
            this.getSelectionModel().selectRow(0);
	        this.startEditing(0);
          } catch (ex) {
            lore.debug.ore("RdfGrid: error on add",ex);
          }
    },
    onDelete: function(btn,ev){
        try{
            this.store.remove(this.getSelectionModel().getSelected());
        } catch (ex) {
            lore.debug.ore("RdfGrid: error on delete",ex);
        }
    }
});
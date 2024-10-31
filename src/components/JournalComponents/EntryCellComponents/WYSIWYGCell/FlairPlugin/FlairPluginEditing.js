import Plugin from '@ckeditor/ckeditor5-core/src/plugin'
import Widget from '@ckeditor/ckeditor5-widget/src/widget'
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils'
import store from '@/store'
import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import { EntryClassEnum, IRElement, IRElementQuickButton, IRElementType, Entry, NewEntry, IRElementStatus} from '@/store/modules/IRElements/types'
export default class FlairPluginEditing extends Plugin {
    static get requires(){
        return [Widget]
    }
init(){
    this._defineSchema()
    this._defineConverters()
}

_defineSchema() {
    const schema = this.editor.model.schema
    schema.register('flairEntity', {
        allowWhere: ['$text', 'flairEntity'],
        isInline: true,
        isObject: true,
        allowAttributes: ['id', 'value', 'type']
    });
}

_defineConverters(){
    const conversion = this.editor.conversion


    conversion
    .for('upcast')
    .elementToElement({
        view:{
            name:'span',
            classes: ['entity']
        },
        model: ( viewElement, { writer } ) => {
            let flairChildren = []
            const value = viewElement.getAttribute('data-entity-value')
            const type = viewElement.getAttribute('data-entity-type')
            
            if (viewElement.childCount > 1)
            {
                flairChildren = viewElement._children.filter((el) => el._classes != undefined && el._classes.has('entity'))
                flairChildren = flairChildren.map((el) => {
                    
                    return {value: el.getAttribute('data-entity-value'), type: el.getAttribute('data-entity-type')}
                
                } )
            }
            const flairEntityElement = writer.createElement( 'flairEntity', 
            {  value: value, type: type, children: JSON.stringify(flairChildren)
        })
            return flairEntityElement
        }
    })

    conversion
    .for( 'editingDowncast' )
    .elementToElement( {
        model: 'flairEntity',
        view: ( modelItem, { writer:viewWriter } ) => createFlairEntityView(this.editor, modelItem, viewWriter)
          
    } ); 


    conversion.for('dataDowncast').elementToElement({
        model: 'flairEntity',
        view: (modelItem, {writer: viewWriter}) => createFlairEntityView(this.editor, modelItem, viewWriter)
    })

    function createFlairEntityView(editor, modelItem, viewWriter){
        const type = modelItem.getAttribute('type')        
        const value = modelItem.getAttribute('value')
        const children = modelItem.getAttribute('children')
        const flairView = viewWriter.createRawElement( 'span', { class:'entityFlair', value:value, type:type, children:children})
        return flairView
    }

}

}
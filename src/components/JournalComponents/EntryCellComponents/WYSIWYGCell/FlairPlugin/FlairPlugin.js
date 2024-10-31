import Plugin from '@ckeditor/ckeditor5-core/src/plugin'
import FlairPluginEditing from './FlairPluginEditing'
import FlairPluginUI from './FlairPluginUI'

export default class FlairPlugin extends Plugin{

    static get requires() {
        return [FlairPluginEditing, FlairPluginUI]
    }
}
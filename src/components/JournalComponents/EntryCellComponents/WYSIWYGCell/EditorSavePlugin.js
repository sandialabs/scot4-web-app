import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import pencilIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg'
class EditorSavePlugin extends Plugin {
    init() {
        const editor = this.editor;
        editor.ui.componentFactory.add( 'editorSavePlugin', locale => {
            const view = new ButtonView( locale );

            view.set( {
                label: 'Submit',
                icon: pencilIcon,
                tooltip: true,
                withText: true,
                class: "ml-auto mb-n9 green--text" // Somewhat-evil margin hacking (button must be on left of top toolbar row to work)
            } );

            view.on('execute', () => {
                this.editor.getData() // Force data update before we save
                view.isEnabled = false
                window.journal.$root.$emit(`onEditorSave+${this.editor.entryId}+${this.editor.fullScreen}`,
                    { entryId: this.editor.entryId, submitButtonView: view })
            });


            return view;
        } );
    }
}

export default EditorSavePlugin;
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg'
class EditorCancelPlugin extends Plugin {
    init() {
        const editor = this.editor;

        editor.ui.componentFactory.add( 'editorCancelPlugin', locale => {
            const view = new ButtonView( locale );

            view.set( {
                label: 'Cancel',
                icon: cancelIcon,
                tooltip: true,
                withText: true,
                class: "mb-n9 large-right-neg-margin red--text"  // Somewhat-evil margin hacking (button must be on right of top toolbar row to work)
            } );

            view.on( 'execute', () => {
                window.journal.$root.$emit(`onEditorCancel+${this.editor.entryId}+${this.editor.fullScreen}`, this.editor.entryId)

            } );

            return view;
        } );
    }
}

export default EditorCancelPlugin;
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import icon from "@ckeditor/ckeditor5-ckfinder/theme/icons/browse-files.svg";

export default class InsertFile extends Plugin {
  init() {
    const editor = this.editor;
    editor.editing.view.document.on(
      "drop",
      async (event, data) => {
        if (
          data.dataTransfer.files &&
          !data.dataTransfer.files[0].type.includes("image")
        ) {
          event.stop();
          data.preventDefault();
          this.insert(data.dataTransfer.files[0], editor);
        }
      },
      { priority: "high" }
    );

    editor.editing.view.document.on(
      "dragover",
      (event, data) => {
        event.stop();
        data.preventDefault();
      },
      { priority: "high" }
    );

    editor.ui.componentFactory.add("insertFile", (locale) => {
      const inputElement = document.createElement("input");
      inputElement.type = "file";
      inputElement.accept =
        ".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf";
      inputElement.addEventListener("change", (event) => {
        this.insert(event.target.files[0], editor);
      });

      const view = new ButtonView(locale);

      view.set({
        label: "Insert file",
        icon: icon,
        tooltip: true,
      });

      view.on("execute", () => {
        inputElement.dispatchEvent(new MouseEvent("click"));
      });

      return view;
    });
  }

  insert(file, editor) {
    if (file) {
            console.log('HERE I SHOULD INSERT')
    }
  }
}

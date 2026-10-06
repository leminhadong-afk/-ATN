import { memo } from "react";
import "./style-view-jodit-editor.css";
import JoditEditor from "jodit-react";

const ViewJoditEditor = ({ value }) => {
  return (
    <div style={{ minHeight: "70px", position: "relative" }}>
      <JoditEditor
        value={value}
        tabIndex={-1}
        className="view_editor_jodit"
        config={{
          readonly: true,
          toolbar: false,
          showCharsCounter: false,
          showWordsCounter: false,
          showStatusbar: true,
          showPoweredBy: false,
        }}
      />
    </div>
  );
};

export default memo(ViewJoditEditor);

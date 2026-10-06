import { memo, useRef } from "react";
import "./style-form-jodit-editor.css";
import JoditEditor from "jodit-react";
import Cookies from "js-cookie";
import { AppConfig } from "../../../AppConfig";

const FormJoditEditor = ({ value, onChange }) => {
  const editor = useRef(null);
  const urlFileUpload = `${AppConfig.apiUrl}/admin/upload/form-editor`;

  // Custom config upload image (Convert file -> Url Image Cloudinary)
  const config = {
    minHeight: 500,
    uploader: {
      insertImageAsBase64URI: false,
      imagesExtensions: ["jpg", "png", "jpeg", "gif"],
      withCredentials: false,
      format: "json",
      method: "POST",
      url: urlFileUpload,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      prepareData: function (formData) {
        var file = formData.getAll("files[0]")[0];
        formData.forEach((value, key) => {
          if (key !== "files[0]") {
            formData.delete(key);
          }
        });
        formData.append("file", file);
        return formData;
      },
      isSuccess: function (resp) {
        return !resp.error;
      },
      process: function (resp) {
        if (resp && resp.url) {
          if (editor.current) {
            const [tagName, attr] = ["img", "src"];
            const elm = editor.current.createInside.element(tagName);
            elm.setAttribute(attr, resp.url);
            editor.current.selection.insertImage(elm, null, 300);
          } else {
            console.error("editor.current is undefined.");
          }
        }
        return {
          files: [""],
          path: "",
          baseurl: "",
          error: 0,
          msg: "Image uploaded successfully",
        };
      },
    },
  };

  return (
    <>
      <JoditEditor
        ref={editor}
        editorRef={(ref) => (editor.current = ref)}
        value={value}
        config={config}
        tabIndex={1}
        onBlur={onChange}
      />
    </>
  );
};

export default memo(FormJoditEditor);

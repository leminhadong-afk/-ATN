import { request } from "../../../util/axios/request.helper";

const baseUrl = `/admin/file-management`;

export class FileUploadApi {
  static uploadFileImage = (formData) => {
    return request({
      method: "POST",
      url: `${baseUrl}/upload`,
      data: formData,
      // Don't set Content-Type manually - let axios set it automatically with boundary
      // Axios will automatically set Content-Type: multipart/form-data; boundary=...
    });
  };
}

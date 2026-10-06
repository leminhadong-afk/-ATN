package com.web.jewelry.config.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Component
public class CloudinaryUploadImages {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadImage(MultipartFile file, String folderName) {
        try {
            Map<String, Object> params = ObjectUtils.asMap(
                    "folder", folderName,
                    "resource_type", "auto"
            );
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
            return (String) uploadResult.get("url");
        } catch (Exception e) {
            e.printStackTrace();
            return "Upload failed";
        }
    }

    public String deleteImage(String publicId) {
        try {
            Map deleteResult = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            if (deleteResult.containsKey("result") && deleteResult.get("result").equals("ok")) {
                return "Image deleted successfully";
            } else {
                return "Image deletion failed";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Image deletion failed";
        }
    }

}


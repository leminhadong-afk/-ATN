package com.web.jewelry.business.admin.fileManagement.web;

import com.web.jewelry.config.cloudinary.CloudinaryUploadImages;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin/file-management")
@RequiredArgsConstructor
public class FileMngController {

    private final CloudinaryUploadImages cloudinaryUploadImages;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFileImage(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "multipartFile", required = false) MultipartFile multipartFile) {
        // Support both "file" and "multipartFile" parameter names for compatibility
        MultipartFile fileToUpload = file != null ? file : multipartFile;
        if (fileToUpload == null || fileToUpload.isEmpty()) {
            return new ResponseEntity<>("File is required", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(cloudinaryUploadImages.uploadImage(fileToUpload, "image_product"), HttpStatus.CREATED);
    }

}

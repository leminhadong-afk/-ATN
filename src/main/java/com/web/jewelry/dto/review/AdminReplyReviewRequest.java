package com.web.jewelry.dto.review;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdminReplyReviewRequest {

    @NotBlank(message = "Nội dung phản hồi không được để trống")
    private String reply;
}

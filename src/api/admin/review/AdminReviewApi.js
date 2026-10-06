import { request } from "../../../util/axios/request.helper";

const baseUrl = `/admin/reviews`;

export class AdminReviewApi {
  static getAllReviews = (params) => {
    return request({
      method: "GET",
      url: `${baseUrl}`,
      params,
    });
  };

  static getReviewStatistics = () => {
    return request({
      method: "GET",
      url: `${baseUrl}/statistics`,
    });
  };

  static replyReview = (reviewId, data) => {
    return request({
      method: "PUT",
      url: `${baseUrl}/${reviewId}/reply`,
      data,
    });
  };

  static toggleReviewStatus = (reviewId, status) => {
    return request({
      method: "PUT",
      url: `${baseUrl}/${reviewId}/status`,
      params: { status },
    });
  };
}

import { request } from "../../../util/axios/request.helper";

const baseUrl = `/client/reviews`;

export class ReviewApi {
  static getProductReviews = (productId, params) => {
    return request({
      method: "GET",
      url: `${baseUrl}/product/${productId}`,
      params,
    });
  };

  static getProductReviewStat = (productId) => {
    return request({
      method: "GET",
      url: `${baseUrl}/stat/${productId}`,
    });
  };

  static createReview = (data) => {
    return request({
      method: "POST",
      url: `${baseUrl}`,
      data,
    });
  };

  static checkEligibleToReview = (billId, productId) => {
    return request({
      method: "GET",
      url: `${baseUrl}/check-eligible`,
      params: { billId, productId },
    });
  };
}

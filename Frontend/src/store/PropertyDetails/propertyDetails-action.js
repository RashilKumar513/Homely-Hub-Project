import { propertyDetailsAction } from "./propertyDetails-slice";
import { axiosInstance } from "../../utils/axios";

export const getPropertyDetails = (id) => async (dispatch) => {
  try {
    dispatch(propertyDetailsAction.getListRequest());
    const response = await axiosInstance.get(`/v1/rent/listing/${id}`);
    if (!response || !response.data) {
      throw new Error("Could not fetch property details");
    }
    const data = response.data.data;
    dispatch(propertyDetailsAction.getPropertyDetails(data));
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to load property";
    dispatch(propertyDetailsAction.getErrors(errorMsg));
  }
};
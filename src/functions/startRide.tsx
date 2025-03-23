import axios from "axios";
import StartRideDetails from "../types/StartRideDetails";

const startRide = async (d: StartRideDetails) => {
  let result;
  try {
    let data = await axios.get(
      "https://ridesync-backend-9chk.onrender.com/start_ride",
      {
        params: {
          userId: d?.userId,
          vehicleId: d?.vehicleId,
          totalDistance: d?.totalDistance,
          s_lat: d?.sourceLatLng?.lat,
          s_lng: d?.sourceLatLng?.lng,
          s_str: d?.sourceInput,
          d_lat: d?.destinationLatLng?.lat,
          d_lng: d?.destinationLatLng?.lng,
          d_str: d?.destinationInput,
          isNow: d?.isNow,
          startTime: d?.startTime,
          seatingCapacity: d?.seatingCapacity,
        },
      }
    );
    result = data.data;
  } catch (error) {
    console.log("error", error);
  }
  return result;
};

export default startRide;

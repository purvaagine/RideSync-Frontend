import axios from "axios";
import JoinRideDetails from "../types/JoinRideDetails";

const joinRide = async (d: JoinRideDetails) => {
  let message;
  try {
    let data = await axios.get("https://ridesync-backend-9chk.onrender.com/join_ride", {
      params: {
        userId: d?.userId,
        rideId: d?.rideId,
        p_lat: d?.pickup?.lat,
        p_lng: d?.pickup?.lng,
        p_str: d?.pickupInput,
        d_lat: d?.drop?.lat,
        d_lng: d?.drop?.lng,
        d_str: d?.dropInput,
        amount: d?.amount,
      },
    });
    console.log("join ride data", d);
    message = data.data.message;
  } catch (error) {
    console.error(error);
  }
  return message;
};

export default joinRide;

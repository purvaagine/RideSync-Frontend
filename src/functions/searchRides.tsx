import axios from "axios";
import LatLng from "../types/LatLng";

const searchRides = async (sourceLatLng: LatLng, destinationLatLng: LatLng) => {
  let rides;
  let rideIds: string[] = [];
  try {
    let data = await axios.get(
      "https://ridesync-backend-9chk.onrender.com/search_rides",
      {
        params: {
          s_lat: sourceLatLng.lat,
          s_lng: sourceLatLng.lng,
          d_lat: destinationLatLng.lat,
          d_lng: destinationLatLng.lng,
        },
      }
    );

    rides = data.data.rides;
  } catch (error) {
    console.log("error", error);
  }
  return rides;
};

export default searchRides;

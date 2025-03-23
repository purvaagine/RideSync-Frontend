import axios from "axios";

const getPlaces = async (query: string, src_lat: number, src_lng: number) => {
  let places;
  try {
    let data = await axios.get(
      "https://ridesync-backend-9chk.onrender.com/get_places",
      {
        params: {
          src_lat: src_lat,
          src_lng: src_lng,
          query: query,
        },
      }
    );

    places = data.data;
  } catch (error) {
    return [];
  }
  return places;
};

export default getPlaces;

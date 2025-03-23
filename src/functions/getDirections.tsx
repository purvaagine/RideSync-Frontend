import axios from "axios";

const getDirections = async (origin: any, destination: any) => {
  console.log("origin", origin);
  console.log("destination", destination);
  let directions;
  try {
    let data = await axios.get(
      "https://ridesync-backend-9chk.onrender.com/get_directions",
      {
        params: {
          s1: origin.lat,
          s2: origin.lng,
          d1: destination.lat,
          d2: destination.lng,
        },
      }
    );

    let coords: google.maps.LatLng[] = [];
    console.log("data", data);
    let list = data.data.polyline_coordinates;

    for (let i = 0; i < list.length; i++) {
      coords.push(new google.maps.LatLng(list[i][0], list[i][1]));
    }

    directions = coords;
    console.log("new coords", directions);
  } catch (error) {
    console.error(error);
  }
  return directions;
};

export default getDirections;

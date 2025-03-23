import axios from "axios";

const acceptRequest = async (rideId: string, coriderId: string) => {
  let msg;
  try {
    let data = await axios.get(
      "https://ridesync-backend-9chk.onrender.com/accept_join_request",
      {
        params: {
          rideId: rideId,
          coriderId: coriderId,
        },
      }
    );

    msg = data.data?.message;
  } catch (error) {
    console.error(error);
  }
  return msg;
};

export default acceptRequest;

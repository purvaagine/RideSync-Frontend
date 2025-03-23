import axios from "axios";

const getHistory = async (userId: string) => {
  let history;
  try {
    let data = await axios.get(
      "https://ridesync-backend-9chk.onrender.com/get_history",
      {
        params: {
          userId: userId,
        },
      }
    );

    history = data.data;
  } catch (error) {
    console.error(error);
  }
  return history;
};

export default getHistory;

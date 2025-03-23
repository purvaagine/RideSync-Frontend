import React from "react";
import axios from "axios";

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const isToday = (storedDate: string) => {
  const today = getTodayDateString();
  return storedDate === today;
};

const getUser = async (userId: string, cached: boolean = true) => {
  let user;
  try {
    const cachedUserData = localStorage.getItem("savedUser");
    const lastUpdatedDate = localStorage.getItem("lastUpdatedDate");

    if (
      cached === true &&
      cachedUserData &&
      lastUpdatedDate &&
      isToday(lastUpdatedDate)
    ) {
      console.log("fetched from cache");
      return JSON.parse(cachedUserData);
    }

    let data = await axios.get("https://ridesync-backend-9chk.onrender.com/get_user", {
      params: {
        // userId: "qfwnh0T4TkYnzJIbGOfV",
        userId: userId,
      },
    });

    localStorage.setItem("savedUser", JSON.stringify(data.data));
    localStorage.setItem("user", JSON.stringify(data.data));
    localStorage.setItem("lastUpdatedDate", getTodayDateString());

    user = data.data;
  } catch (error) {
    console.error(error);
  }
  return user;
};

export default getUser;

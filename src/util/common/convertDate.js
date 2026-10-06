import moment from "moment";

export const formatDateTime = (date) => {
  const options = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedDate = new Date(date).toLocaleDateString("en-US", options);
  return formattedDate;
};

export const formatDateToString = (timeString) => {
  let timeStr = new Date(timeString);
  let yearTimeStr = timeStr.getFullYear();
  let monthTimeStr = String(timeStr.getMonth() + 1).padStart(2, "0");
  let dateTimeStr = String(timeStr.getDate()).padStart(2, "0");
  let hoursTimeStr = String(timeStr.getHours()).padStart(2, "0");
  let minutesTimeStr = String(timeStr.getMinutes()).padStart(2, "0");
  let secondsTimeStr = String(timeStr.getSeconds()).padStart(2, "0");

  return `${yearTimeStr}-${monthTimeStr}-${dateTimeStr} ${hoursTimeStr}:${minutesTimeStr}:${secondsTimeStr}`;
};

export const convertDateToStringTodo = (timestamp) => {
  const date = moment(timestamp);
  const formattedTime = date.format("MMM DD");
  return formattedTime;
};

// Convert local date to string
// Example: "2024-07-19" --> New Date("2024-07-19 00:00:00)
export const convertStringToDateTodo = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day, 0, 0, 0);
  return date;
};

export const convertLongToDate = (long) => {
  const date = new Date(long);

  const formattedStartTime = `${date.getDate()}/${
    date.getMonth() + 1
  }/${date.getFullYear()}`;

  return formattedStartTime;
};

export const formatYearMonthDate = (date) => {
  // Clone the date object to avoid modifying the original date
  const adjustedDate = new Date(date.getTime() + 7 * 60 * 60 * 1000); // Adjusted for UTC+7

  // Get year, month, and day in UTC+7 timezone
  const year = adjustedDate.getUTCFullYear();
  const month = adjustedDate.getUTCMonth() + 1; // Month starts from 0
  const day = adjustedDate.getUTCDate();

  // Format the date string as YYYY-MM-DD
  const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;

  return formattedDate;
};

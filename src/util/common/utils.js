import jwt_decode from "jwt-decode";

export const filterOptions = (input, option) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

export const rowClassName = (record, index) => {
  return index % 2 === 0 ? "even-row" : "odd-row";
};

export const handleKeyPress = (event, customFunction) => {
  if (event.key === "Enter") {
    customFunction();
  }
};

export const isTokenExpired = (token) => {
  const t = token || localStorage.getItem("token");
  if (!t) return true;
  try {
    const decodedToken = jwt_decode(t);
    if (decodedToken.exp === undefined) {
      return false;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime;
  } catch (error) {
    return true;
  }
};
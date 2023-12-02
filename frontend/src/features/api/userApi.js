import axios from "axios";

export function signupUser(userData) {
  return axios.post("/signup", userData);
}

export function loginUser(userData) {
  return axios.post("/login", userData);
}

export function checkUser() {
  return axios.get("/check");
}

export function logoutUser() {
  return axios.get("/logout");
}

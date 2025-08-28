import axios from "axios";

const API_URL = "http://localhost:3000";

export async function signin(email, password) {
    const res = await axios.post(`${API_URL}/auth/signin`, { email, password });
    return res.data.token;
}

export async function signup(email, password) {
    const res = await axios.post(`${API_URL}/auth/signup`, { email, password });
    return res.data.token;
}

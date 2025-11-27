import api, { setAuthToken } from "./api";

export const register = async (data: {
  email: string;
  password: string;
  full_name: string;
  role: string;
}) => {
  const res = await api.post("/users/register/", data);
  return res.data;
};

export const login = async (email: string, password: string) => {
  const res = await api.post("/users/login/", {
    email,
    password,
  });

  const accessToken = res.data.tokens.access;

  // simpan token
  setAuthToken(accessToken);

  return res.data;
};

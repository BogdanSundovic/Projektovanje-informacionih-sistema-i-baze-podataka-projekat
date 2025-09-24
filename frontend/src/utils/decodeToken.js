import { jwtDecode } from 'jwt-decode';

export const decodeToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const user = jwtDecode(token);
    console.log("Decoded token:", user);
    return user;
  } catch (error) {
    console.error('Nevažeći token:', error);
    return null;
  }
};

export default function getUserDataFromCookie() {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; app_user_data=`);

  if (parts.length === 2) {
    try {
      const cookieValue = parts.pop()?.split(";").shift();
      if (!cookieValue) return null;
      return JSON.parse(decodeURIComponent(cookieValue));
    } catch (e) {
      console.error("Gagal parsing cookie user data", e);
      return null;
    }
  }
  return null;
}

import { Redirect } from "expo-router";

export default function TabsIndexRedirect() {
  // Biar tidak ada halaman Home bawaan
  return <Redirect href="/Login/login" />;
}

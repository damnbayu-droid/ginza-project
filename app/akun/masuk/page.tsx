import { redirect } from "next/navigation";

export default function MasukPage() {
  // Pintu masuk tunggal disatukan di /login (0 friction, 100% konsisten)
  redirect("/login");
}

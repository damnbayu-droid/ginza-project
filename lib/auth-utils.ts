/**
 * Utility to convert raw technical errors into clear, human-friendly Indonesian error messages.
 */
export function getHumanErrorMessage(err: any): string {
  if (!err) return "Terjadi kesalahan. Silakan coba beberapa saat lagi.";

  let raw = "";
  if (typeof err === "string") {
    raw = err;
  } else if (typeof err === "object") {
    raw = err.message || err.error || err.msg || JSON.stringify(err);
  }

  if (!raw || raw === "{}" || raw === "[object Object]") {
    return "Email ini sudah terdaftar di sistem. Silakan masuk dengan kata sandi Anda atau gunakan Lupa Password.";
  }

  const lower = raw.toLowerCase();

  // User Already Registered / Exists
  if (
    lower.includes("user already registered") ||
    lower.includes("user_already_exists") ||
    lower.includes("already registered") ||
    lower.includes("already exists") ||
    lower.includes("email already in use")
  ) {
    return "Email ini sudah terdaftar. Silakan masuk dengan kata sandi Anda atau gunakan Lupa Password.";
  }

  // Invalid Credentials / Wrong Password
  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid_credentials") ||
    lower.includes("invalid_grant") ||
    lower.includes("email atau password salah") ||
    lower.includes("wrong password")
  ) {
    return "Email atau kata sandi yang Anda masukkan salah. Silakan periksa kembali.";
  }

  // Rate limit / Too many attempts
  if (
    lower.includes("terlalu banyak") ||
    lower.includes("too many requests") ||
    lower.includes("rate limit") ||
    lower.includes("rate_limit") ||
    (lower.includes("t00:") && lower.endsWith("z"))
  ) {
    return "Terlalu banyak percobaan. Silakan tunggu 1 menit sebelum mencoba lagi.";
  }

  // Email not confirmed
  if (lower.includes("email not confirmed")) {
    return "Email Anda belum dikonfirmasi. Silakan periksa kotak masuk email Anda untuk verifikasi.";
  }

  // Password too short
  if (lower.includes("password should be at least")) {
    return "Kata sandi minimal 6 karakter. Silakan buat kata sandi yang lebih aman.";
  }

  return raw;
}

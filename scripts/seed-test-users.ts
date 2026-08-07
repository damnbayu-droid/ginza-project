import { loadEnvLocal } from "./_load-env";
loadEnvLocal();

import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("❌ Credentials Supabase tidak ditemukan di .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const testAccounts = [
    {
      email: "test.user@mongondowpedia.test",
      password: "N7srab5AZYi7zE",
      fullName: "Test User",
      role: "user",
    },
    {
      email: "test.verifikator@mongondowpedia.test",
      password: "8qF6odFkcyGBjY",
      fullName: "Test Verifikator",
      role: "verificator",
    },
  ];

  for (const acc of testAccounts) {
    console.log(`⏳ Memproses akun: ${acc.email} (${acc.role})...`);

    // 1. Check if user already exists in auth.users
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === acc.email);

    let userId = existingUser?.id;

    if (!existingUser) {
      // Create in auth.users
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: { full_name: acc.fullName, role: acc.role },
      });

      if (createErr) {
        console.error(`❌ Gagal membuat auth user ${acc.email}:`, createErr.message);
        continue;
      }
      userId = created.user.id;
      console.log(`   ✅ Supabase Auth user dibuat: ${userId}`);
    } else {
      console.log(`   ℹ️ User ${acc.email} sudah ada di Auth, memperbarui password & metadata...`);
      const { error: updateErr } = await supabase.auth.admin.updateUserById(userId!, {
        password: acc.password,
        email_confirm: true,
        user_metadata: { full_name: acc.fullName, role: acc.role },
      });
      if (updateErr) {
        console.warn(`   ⚠️ Gagal update password Auth:`, updateErr.message);
      }
    }

    // 2. Update profiles table with display_name and role
    if (userId) {
      const { error: profileErr } = await supabase.from("profiles").upsert(
        {
          id: userId,
          display_name: acc.fullName,
          role: acc.role,
          avatar_url: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (profileErr) {
        console.warn(`   ⚠️ Gagal update profiles:`, profileErr.message);
      } else {
        console.log(`   ✅ Profil & role (${acc.role}) berhasil disimpan di tabel profiles!`);
      }
    }
  }

  console.log("\n🎉 Selesai! Kedua akun test kini 100% Siap untuk Login di /login atau /akun/masuk!");
}

main().catch(err => {
  console.error("❌ Fatal Error:", err);
  process.exit(1);
});

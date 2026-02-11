const supabase = supabase.createClient(
  "YOUR_SUPABASE_URL",
  "YOUR_ANON_KEY"
);

const chat = document.getElementById("chat");

async function loadMessages() {
  const { data } = await supabase
    .from("messages")
    .select("content, profiles(name)")
    .order("created_at");

  chat.innerHTML = data.map(
    m => `<p><b>${m.profiles.name}:</b> ${m.content}</p>`
  ).join("");
}

supabase
  .channel("messages")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "messages" },
    payload => loadMessages()
  )
  .subscribe();

async function sendMessage() {
  const msg = document.getElementById("msg").value;
  const user = (await supabase.auth.getUser()).data.user;

  await supabase.from("messages").insert({
    content: msg,
    user_id: user.id
  });

  document.getElementById("msg").value = "";
}

loadMessages();

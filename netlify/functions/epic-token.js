exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    const { code } = JSON.parse(event.body || "{}");
    if (!code) return { statusCode: 400, body: JSON.stringify({ error: "Missing code" }) };

    const clientId = process.env.EPIC_CLIENT_ID;
    const clientSecret = process.env.EPIC_CLIENT_SECRET;
    const redirectUri = process.env.EPIC_REDIRECT_URI;

    const auth = "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri
    });

    const res = await fetch("https://api.epicgames.dev/epic/oauth/v2/token", {
      method: "POST",
      headers: {
        "Authorization": auth,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Epic token error:", data);
      return { statusCode: res.status, body: JSON.stringify(data) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in
      })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Server error" }) };
  }
};

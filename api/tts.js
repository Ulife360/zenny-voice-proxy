export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text required" });

    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "api-subscription-key": process.env.SARVAM_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: "en-IN",
        speaker: "ritu",
        model: "bulbul:v3",
        pace: 1.05,
        speech_sample_rate: 22050,
        enable_preprocessing: true
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

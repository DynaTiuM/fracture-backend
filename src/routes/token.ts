import { Router } from "express";
import fetch from "node-fetch";
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  throw new Error("CLIENT_ID, CLIENT_SECRET and REDIRECT_URI must be set in environment variables");
}

router.post("/", async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code missing" });

    try {
        const params = new URLSearchParams();
        params.append("client_id", CLIENT_ID);
        params.append("client_secret", CLIENT_SECRET);
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_uri", REDIRECT_URI);

        const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            body: params.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const raw = await tokenResponse.text();
        if (!tokenResponse.ok) {
            console.error("Token endpoint returned non-ok status:", tokenResponse.status, raw);
            return res.status(502).json({ error: "Token exchange failed", details: raw });
        }

        let data: { access_token?: string; [key: string]: any } = {};
        try {
            data = JSON.parse(raw);
        } catch (parseErr) {
            console.error("Failed parsing token response JSON:", parseErr, "raw:", raw);
            return res.status(502).json({ error: "Invalid token response", details: raw });
        }

        if (!data.access_token) {
            console.error("No access_token in token response:", data);
            return res.status(502).json({ error: "No access token returned", details: data });
        }

        res.json({ access_token: data.access_token });
    } catch (err) {
        console.error("Token exchange caught error:", err);
        res.status(500).json({ error: "Failed to get access token" });
    }
});

export default router;

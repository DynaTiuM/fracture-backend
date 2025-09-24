import { Router } from 'express';
import Player from '../models/Player';
import { playerBonusService } from '../services/PlayerBonusService';
import { crystalService } from '../services/CrystalService';
import { playerScoreHistoryService } from '../services/PlayerScoreHistoryService';
import { BonusHandler } from '../game/BonusHandler';

const router = Router();

router.post('/', async (req, res) => {
  const { id, username } = req.body;

  try {
    const existingUser = await Player.findOne({ discordId: id });

    if (!existingUser) {
        const result = await Player.insertOne({
            discordId: id,
            username: username,
            createdAt: new Date()
        });
        return res.json(result);
    }

    res.json({message: "The user already exists.", user: existingUser });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.get('/', async (req, res) => {
  try {
    const players = await Player.find();

    if (!players) {
        return res.status(502).json({ error: "No players found." });
    }

    res.json(players);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});


router.get('/:id/avatar', async (req, res) => {
  const playerId = req.params.id;

  try {
    const response = await fetch(`https://discord.com/api/v10/users/${playerId}`, {
        headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`
        }
    });

    if (!response.ok) {
        return res.status(502).json({ error: "Failed to fetch user data from Discord" });
    }

    const userData = await response.json();
    const avatarHash = userData.avatar;
    const discriminator = userData.discriminator;

    const avatarUrl = avatarHash
      ? `https://cdn.discordapp.com/avatars/${playerId}/${avatarHash}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${Number(discriminator) % 5}.png`;
      
    res.json({ avatar: avatarUrl });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

router.get('/:id/has-drawn', async (req, res) => {
    const playerId = req.params.id;
    try {
        const hasDrown = await playerBonusService.hasPlayerDrawnBonus(playerId);
        res.status(200).json({ hasDrawn: hasDrown });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/action', async (req, res) => {
  const { playerId, action } = req.body;

  try {
    const result = await crystalService.addAction(playerId, action);

    res.status(200).send(result);
  }
  catch (err: any) {
    res.status(400).send(err.message);
  }
});

router.get('/:id/has-played', async (req, res) => {
  const playerId = req.params.id;

  try {
    const result = await playerScoreHistoryService.hasPlayerPlayedToday(playerId);

    res.status(200).send({ has_played: result.played, action: result.action } );
  }
  catch (err: any) {
    res.status(400).send(err.message);
  }
});

router.get('/:playerId/bonus', async (req, res) => {
    try {
        const { playerId } = req.params;
        const player_bonus = await playerBonusService.getPlayerBonus(playerId);
        if(!player_bonus) {
            res.status(404).json({ message: "No player bonus found"});
        }
        res.json(player_bonus);
    }
    catch (err: any) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// TEST
router.get('/reveal-action', async (req, res) => {

  try {
    const result = await BonusHandler.erasePlayerBestItem("336940403796344856", "33");

    res.status(200).send(result);
  }
  catch (err: any) {
    res.status(400).send(err.message);
  }
});


export default router;

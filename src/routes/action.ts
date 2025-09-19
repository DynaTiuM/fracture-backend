import { Router } from 'express';
import { GameService } from '../services/GameService';

const router = Router();

router.post('/', async (req, res) => {
  const { discordId, username, action } = req.body;

  try {
    const gameService = new GameService();
    const result = await gameService.addAction(discordId, username, action);

    res.status(200).send(result);
  } catch (err: any) {
    res.status(400).send(err.message);
  }
});

export default router;
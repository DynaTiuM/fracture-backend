import { Router } from 'express';
import { CrystalService } from '../services/CrystalService';

const router = Router();

router.post('/', async (req, res) => {
  const { discordId, username, action } = req.body;

  try {
    const crystalService = new CrystalService();
    const result = await crystalService.addAction(discordId, username, action);

    res.status(200).send(result);
  }
  catch (err: any) {
    res.status(400).send(err.message);
  }
});

export default router;
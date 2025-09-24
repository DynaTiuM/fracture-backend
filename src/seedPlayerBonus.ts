import { connectDB } from "./config/db";
import Bonus from "./models/Bonus";
import PlayerBonus from "./models/PlayerBonus";

async function giveAllBonusesToPlayer(playerId: string) {
  await connectDB();

  await PlayerBonus.deleteMany({});

  // Récupère tous les bonus
  const allBonuses = await Bonus.find({}, 'id');

  if (allBonuses.length === 0) {
    console.log("No bonuses found in DB.");
    process.exit(0);
  }

  const playerBonusDocs = allBonuses.map(bonus => ({
    playerId,       // ici le joueur spécifique
    bonusId: bonus.id,
    dateAcquired: new Date(),
    used: false,
    erasedBy: null,
  }));

  await PlayerBonus.insertMany(playerBonusDocs);
  console.log(`Created ${playerBonusDocs.length} PlayerBonus entries for player ${playerId}!`);

  process.exit(0);
}

giveAllBonusesToPlayer("336940403796344856").catch(console.error);

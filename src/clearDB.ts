import { connectDB } from './config/db';
import Rope from './models/Rope';
import Player from './models/Player';
import PlayerScoreHistory from './models/PlayerScoreHistory';

async function clearDB() {
  await connectDB();

  await Rope.deleteMany({});
  await Player.deleteMany({});
  await PlayerScoreHistory.deleteMany({});

  console.log('Database Empty');
  process.exit(0);
}

clearDB().catch(err => {
  console.error(err);
  process.exit(1);
});

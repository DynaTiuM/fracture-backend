import { connectDB } from './config/db';
import Crystal from './models/Crystal';
import Player from './models/Player';
import PlayerScoreHistory from './models/PlayerScoreHistory';

async function clearDB() {
  await connectDB();

  await Crystal.deleteMany({});
  await Player.deleteMany({});
  await PlayerScoreHistory.deleteMany({});

  console.log('Database Empty');
  process.exit(0);
}

clearDB().catch(err => {
  console.error(err);
  process.exit(1);
});

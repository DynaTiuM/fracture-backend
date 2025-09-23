import { connectDB } from "./config/db";
import PlayerBonus from "./models/PlayerBonus";

async function clearPlayerBonus() {
    await connectDB();

    await PlayerBonus.deleteMany({});

    process.exit(0);
}

clearPlayerBonus().catch(err => {
  console.error(err);
  process.exit(1);
});

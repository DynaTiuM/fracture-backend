import cron from 'node-cron';
import Crystal from '../models/Crystal'
import { GameService } from './GameService';

export class SchedulerService {
  private gameService = new GameService();

  startDailyTasks() {
    // Triggers and manages what has been done yesterday
    cron.schedule('* * * * *', async () => {
      console.log("CRON Executed!")
      const broken = await this.gameService.checkCrystalBreak();
      // If the crystal broke, we have to assign the Badges and start a new session
      if (broken) {
        await this.gameService.assignEndOfSessionBadges();
        await this.gameService.startNewSession();
        return;
      }
      // Otherwise, we enable the action for the new day
      await this.gameService.enableAction();
      
      // We verify that the crystal exists
      const crystal = await Crystal.findOne();
      if (!crystal) {
        console.error("No crystal found!, creating a new one....");
        this.gameService.createNewCrystal();
        return;
      };
      // We calculate the difference of days
      const today = new Date();
      const sessionStart = new Date(crystal.sessionStart);
      const diffDays = Math.floor((today.getTime() - sessionStart.getTime()) / (1000 * 60 * 60 * 24));

      // for test only
      const diffMinutes = Math.floor(
        (today.getTime() - sessionStart.getTime()) / (1000 * 60)
      );

      // And if the session ends
      if (diffMinutes >= 3) {
        // We assign the badges
        await this.gameService.assignEndOfSessionBadges();
        // And we start a new session
        await this.gameService.startNewSession();
      }

    });
  }
}

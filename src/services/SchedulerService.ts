import cron from 'node-cron';
import Rope from '../models/Rope'
import { GameService } from './GameService';

export class SchedulerService {
  private gameService = new GameService();

  startDailyTasks() {
    // Triggers and manages what has been done yesterday
    cron.schedule('* * * * *', async () => {
      console.log("CRON Executed!")
      const broken = await this.gameService.checkRopeBreak();
      // If the rope broke, we have to assign the Badges and start a new session
      if (broken) {
        await this.gameService.assignEndOfSessionBadges();
        await this.gameService.startNewSession();
        return;
      }
      // Otherwise, we enable the action for the new day
      await this.gameService.enableAction();
      
      // We verify that the rope exists
      const rope = await Rope.findOne();
      if (!rope) {
        console.error("NO ROPE FOUND!, creating a new one....");
        this.gameService.createNewRope();
        return;
      };
      // We calculate the difference of days
      const today = new Date();
      const sessionStart = new Date(rope.sessionStart);
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

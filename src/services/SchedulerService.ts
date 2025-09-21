import cron from 'node-cron';
import Crystal from '../models/Crystal'
import { CrystalService } from './CrystalService';

export class SchedulerService {
  private crystalService = new CrystalService();

  startDailyTasks() {
    // Triggers and manages what has been done yesterday
    /*cron.schedule('* * * * *', async () => {
      console.log("CRON Executed!")
      const broken = await this.crystalService.checkCrystalBreak();
      // If the crystal broke, we have to assign the Badges and start a new session
      if (broken) {
        await this.crystalService.assignEndOfSessionBadges();
        await this.crystalService.startNewSession();
        return;
      }
      // Otherwise, we enable the action for the new day
      await this.crystalService.enableAction();
      
      // We verify that the crystal exists
      const crystal = await Crystal.findOne();
      if (!crystal) {
        console.error("No crystal found!, creating a new one....");
        this.crystalService.createNewCrystal();
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
        await this.crystalService.assignEndOfSessionBadges();
        // And we start a new session
        await this.crystalService.startNewSession();
      }

    });*/
  }
}

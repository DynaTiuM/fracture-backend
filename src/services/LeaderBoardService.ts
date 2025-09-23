import Crystal from "../models/Crystal";
import Player from "../models/Player";
import PlayerScoreHistory from "../models/PlayerScoreHistory";

export class LeaderBoardService {
    async getLeaderboard() {
        const crystal = await Crystal.findOne().sort({ sessionStart: -1 });

        const players = await Player.find();

        const leaderboard = await Promise.all(
            players.map(async (player) => {
                const history = await PlayerScoreHistory.findOne({ 
                    playerId: player.discordId,
                    sessionStart: { $eq: crystal?.sessionStart }
                });

                const allTimeScoreAgg = await PlayerScoreHistory.aggregate([
                    { $match: { playerId: player.discordId } },
                    { $group: { _id: null, total: { $sum: "$weeklyScore" } } }
                ]);

                const allTimeScore = allTimeScoreAgg[0]?.total ?? 0;

                return {
                    discordId: player.discordId,
                    username: player.username,
                    weeklyScore: history?.weeklyScore ?? 0,
                    allTimeScore,
                    badge: history?.badge ? { name: history.badge.name, type: history.badge.type } : null,
                };
            })
        );

        return leaderboard;
    }
}

export const leaderBoardService = new LeaderBoardService();
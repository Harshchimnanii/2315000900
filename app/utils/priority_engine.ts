import { Log } from '../../logging_middleware';

export interface CampusNotification {
    ID: string;
    Type: "Placement" | "Result" | "Event";
    Message: string;
    Timestamp: string;
}

const WeightConfig: Record<string, number> = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
};

export const getRankedNotifications = async (
    rawList: CampusNotification[], 
    maxItems: number = 10
): Promise<CampusNotification[]> => {
    
    try {
        await Log("frontend", "info", "utils", "Executing multi-tier priority sort on notifications");

        const sorted = [...rawList].sort((first, second) => {
            const weightFirst = WeightConfig[first.Type] || 0;
            const weightSecond = WeightConfig[second.Type] || 0;

            // Tier 1: Sort by Weight
            if (weightFirst !== weightSecond) {
                return weightSecond - weightFirst; 
            }

            // Tier 2: Sort by Timestamp
            return new Date(second.Timestamp).getTime() - new Date(first.Timestamp).getTime();
        });

        return sorted.slice(0, maxItems);
    } catch (err) {
        await Log("frontend", "error", "utils", "Failed to sort notifications");
        return [];
    }
};
import { useState, useEffect, useCallback } from 'react';
import { Log } from '../../logging_middleware';
import { CampusNotification } from '../utils/priority_engine';
const NOTIF_URL = "/api/notifications";

export const useCampusData = (currentPage: number, itemsPerPage: number, activeFilter?: string) => {
    const [notifications, setNotifications] = useState<CampusNotification[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    const loadData = useCallback(async () => {
        setIsFetching(true);
        try {
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
            });
            if (activeFilter) queryParams.append("notification_type", activeFilter);

            await Log("frontend", "info", "api", `Triggering API fetch for Page: ${currentPage}`);

            const token = localStorage.getItem('access_token');
            const res = await fetch(`${NOTIF_URL}?${queryParams.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error(`Server returned status ${res.status}`);

            const parsed = await res.json();
            setNotifications(parsed.notifications || []);
            
            await Log("frontend", "info", "api", "Successfully synchronized client state with server data");
        } catch (error: any) {
            await Log("frontend", "error", "api", `Synchronization failed: ${error.message}`);
        } finally {
            setIsFetching(false);
        }
    }, [currentPage, itemsPerPage, activeFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return { notifications, isFetching };
};
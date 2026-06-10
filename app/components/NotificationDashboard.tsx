'use client';

import React, { useState, useEffect } from 'react';
import { 
    Card, CardContent, Typography, Chip, Select, MenuItem, 
    Pagination, CircularProgress, Container, Box 
} from '@mui/material';
import { useCampusData } from '../hooks/useCampusData';
import { getRankedNotifications, CampusNotification } from '../utils/priority_engine';
import { Log } from '../../logging_middleware';

const NotificationDashboard = () => {
    // Ye naya state hydration error fix karega
    const [isMounted, setIsMounted] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [readSet, setReadSet] = useState<Set<string>>(new Set());
    const [prioritizedData, setPrioritizedData] = useState<CampusNotification[]>([]);

    const pageSize = 10;
    const { notifications, isFetching } = useCampusData(currentPage, pageSize, categoryFilter);

    useEffect(() => {
        setIsMounted(true); // Component browser me load ho gaya
        const locallyStored = localStorage.getItem('viewed_notifications');
        if (locallyStored) setReadSet(new Set(JSON.parse(locallyStored)));
    }, []);

    useEffect(() => {
        if (notifications.length > 0) {
            getRankedNotifications(notifications, 10).then(setPrioritizedData);
        } else {
            setPrioritizedData([]);
        }
    }, [notifications]);

    const handleCardClick = async (notificationId: string) => {
        if (!readSet.has(notificationId)) {
            const updatedSet = new Set(readSet).add(notificationId);
            setReadSet(updatedSet);
            localStorage.setItem('viewed_notifications', JSON.stringify(Array.from(updatedSet)));
            await Log("frontend", "info", "component", `Notification ID ${notificationId} marked as viewed`);
        }
    };

    const fetchBadgeColor = (category: string) => {
        if (category === "Placement") return "success";
        if (category === "Result") return "warning";
        return "info";
    };

    // Agar server par hai, toh kuch mat dikha (hydration mismatch se bachne ke liye)
    if (!isMounted) return null; 

    return (
        <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: '800', color: 'primary.main' }}>
                    Campus Notification Center
                </Typography>
                
                <Select
                    value={categoryFilter}
                    displayEmpty
                    onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        setCurrentPage(1);
                        Log("frontend", "info", "state", `Filter modified to: ${e.target.value || 'All'}`);
                    }}
                    size="small"
                    sx={{ minWidth: 160 }}
                >
                    <MenuItem value="">All Notifications</MenuItem>
                    <MenuItem value="Placement">Placements Only</MenuItem>
                    <MenuItem value="Result">Results Only</MenuItem>
                    <MenuItem value="Event">Events Only</MenuItem>
                </Select>
            </Box>

            {isFetching ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <CircularProgress size={50} />
                </Box>
            ) : (
                <Box sx={{ minHeight: '60vh' }}>
                    {prioritizedData.map((item) => {
                        const hasBeenOpened = readSet.has(item.ID);
                        return (
                            <Card 
                                key={item.ID} 
                                onClick={() => handleCardClick(item.ID)}
                                sx={{ 
                                    mb: 2, 
                                    cursor: 'pointer',
                                    borderLeft: hasBeenOpened ? '5px solid #9e9e9e' : '5px solid #1976d2',
                                    backgroundColor: hasBeenOpened ? '#f5f5f5' : '#ffffff',
                                    opacity: hasBeenOpened ? 0.7 : 1,
                                    boxShadow: hasBeenOpened ? 1 : 3,
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': { transform: 'translateY(-2px)' }
                                }}
                            >
                                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography 
                                            variant="body1" 
                                            sx={{ fontWeight: hasBeenOpened ? '400' : '600', color: 'text.primary', pr: 2 }}
                                        >
                                            {item.Message}
                                        </Typography>
                                        <Chip 
                                            label={item.Type} 
                                            color={fetchBadgeColor(item.Type) as any} 
                                            size="small" 
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Issued: {item.Timestamp}
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ fontWeight: 'bold', color: hasBeenOpened ? 'text.disabled' : 'primary.main' }}
                                        >
                                            {hasBeenOpened ? "Read" : "New Update"}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        )
                    })}
                </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                    count={5} 
                    page={currentPage} 
                    onChange={(_, value) => setCurrentPage(value)} 
                    color="primary" 
                    size="large"
                />
            </Box>
        </Container>
    );
};

export default NotificationDashboard;
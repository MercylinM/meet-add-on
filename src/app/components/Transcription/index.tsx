'use client';

import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import React, { useState, useEffect } from 'react';

export const TranscriptionStatus: React.FC = () => {
    const [transcriptionStatus, setTranscriptionStatus] = useState<string>('Checking...');
    const [spaceId, setSpaceId] = useState<string>('');

    useEffect(() => {
        // Check if we're in a Google Meet context
        if (window.parent !== window) {
            // We're in an iframe, likely in Google Meet
            try {
                // Try to get the meeting space ID from the URL
                const urlParams = new URLSearchParams(window.location.search);
                const space = urlParams.get('space');
                if (space) {
                    setSpaceId(space);
                    setTranscriptionStatus('✅ Live transcription is enabled');
                } else {
                    setTranscriptionStatus('❌ No meeting space ID available');
                }
            } catch (error) {
                setTranscriptionStatus('❌ Unable to check transcription status');
            }
        } else {
            setTranscriptionStatus('❌ Not running in Google Meet');
        }
    }, []);

    return (
        <Card title="Transcription Status">
            <Text>{transcriptionStatus}</Text>
            {spaceId && <Text className="text-sm text-gray-500">Space ID: {spaceId}</Text>}
        </Card>
    );
};
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import React, { useState, useEffect, useRef } from 'react';


interface AnalysisSectionProps {
    isAnalysisRunning: boolean;
    startAnalysis: () => void;
    stopAnalysis: () => void;
    interviewId: string;
}

export const AnalysisSection: React.FC<AnalysisSectionProps> = ({
    isAnalysisRunning,
    startAnalysis,
    stopAnalysis,
    interviewId
}) => {
    const [transcript, setTranscript] = useState<string>('');
    const [analysisResults, setAnalysisResults] = useState<null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const analyzeTranscript = async () => {
        if (!transcript.trim() || !interviewId) return;

        setLoading(true);
        try {
            const payload = {
                interview_id: interviewId,
                transcript: transcript,
                chunk_number: Date.now(),
                transcript_time: new Date().toISOString()
            };

            const response = await fetch(`${process.env.RECOS_API_BASE}/recos/analysis/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${process.env.RECOS_API_TOKEN}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setAnalysisResults(result);
        } catch (error) {
            console.error('Error analyzing transcript:', error);
            setAnalysisResults({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAnalysisRunning) {
            intervalRef.current = setInterval(() => {
                const sampleTranscripts = [
                    "So, tell me about your experience with Python.",
                    "I've been working with Python for 3 years and Django for 2 years.",
                    "That's great. Can you explain how Django's ORM works?",
                    "Django ORM provides an abstraction layer for database operations."
                ];

                const randomTranscript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
                setTranscript(prev => prev + ' ' + randomTranscript);
            }, 5000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isAnalysisRunning]);

    return (
        <Card title="Live Analysis">
            <div className="space-y-4">
                <div className="flex space-x-2">
                    <Button
                        onClick={isAnalysisRunning ? stopAnalysis : startAnalysis}
                        disabled={!interviewId}
                    >
                        {isAnalysisRunning ? 'Stop Listening' : 'Start Listening'}
                    </Button>
                    <Button onClick={analyzeTranscript} disabled={loading || !transcript.trim()}>
                        {loading ? 'Analyzing...' : 'Analyze Transcript'}
                    </Button>
                </div>

                {transcript && (
                    <div>
                        <Text className="font-medium">Current Transcript:</Text>
                        <div className="mt-1 p-2 bg-gray-100 rounded text-sm max-h-32 overflow-y-auto">
                            {transcript}
                        </div>
                    </div>
                )}

                {analysisResults && (
                    <div>
                        <Text className="font-medium">Analysis Results:</Text>
                        <div className="mt-1 p-2 bg-blue-50 rounded text-sm">
                            <pre>{JSON.stringify(analysisResults, null, 2)}</pre>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
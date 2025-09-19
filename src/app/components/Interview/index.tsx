'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

interface InterviewContextProps {
    interviewId: string;
    setInterviewId: (id: string) => void;
    interviewData: null;
    loadInterviewContext: () => void;
    loading: boolean;
    error: string;
}

export const InterviewContext: React.FC<InterviewContextProps> = ({
    interviewId,
    setInterviewId,
    interviewData,
    loadInterviewContext,
    loading,
    error
}) => {
    if (!interviewData) {
        return (
            <Card title="Interview Context">
                <div className="space-y-3">
                    <Input
                        placeholder="Enter Interview ID"
                        value={interviewId}
                        onChange={(e) => setInterviewId(e.target.value)}
                    />
                    <Button onClick={loadInterviewContext} disabled={loading}>
                        {loading ? 'Loading...' : 'Load Interview'}
                    </Button>
                    {error && <Text className="text-red-500">{error}</Text>}
                </div>
            </Card>
        );
    }

    return (
        <Card title="Interview Context">
            <div className="space-y-2">
                <Text><strong>Interview ID:</strong> {interviewData.interview_id}</Text>
                <Text><strong>Candidate:</strong> {interviewData.candidate_name}</Text>
                <Text><strong>Recruiter:</strong> {interviewData.recruiter_name}</Text>
                <Text><strong>Title:</strong> {interviewData.title}</Text>
                <Button onClick={() => setInterviewData(null)}>Change Interview</Button>
            </div>
        </Card>
    );
};
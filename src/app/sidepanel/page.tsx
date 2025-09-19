'use client';

import { useEffect, useState } from 'react';
import {
    meet,
    MeetSidePanelClient,
} from '@googleworkspace/meet-addons/meet.addons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InterviewContext } from '../components/Interview';
import { TranscriptionStatus } from '../components/Transcription';
import { AnalysisSection } from '../components/Analysis';

type Interview = {
    id: string;
    candidate_name?: string;
    recruiter_name?: string;
    title?: string;
};

export default function SidePanel() {
    const [sidePanelClient, setSidePanelClient] = useState<MeetSidePanelClient>();
    const [interviewId, setInterviewId] = useState<string>('');
    const [isAnalysisRunning, setIsAnalysisRunning] = useState<boolean>(false);
    const [interviewData, setInterviewData] = useState<Interview>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isInMeet, setIsInMeet] = useState<boolean>(false);

    useEffect(() => {
        const inIframe = window.parent !== window;

        const urlParams = new URLSearchParams(window.location.search);
        const hasMeetSdkParam = urlParams.has('meet_sdk');

        setIsInMeet(inIframe && hasMeetSdkParam);
    }, []);

    async function startActivity() {
        if (!sidePanelClient) {
            throw new Error('Side Panel is not yet initialized!');
        }
        await sidePanelClient.startActivity({
            mainStageUrl: `${window.location.origin}/mainstage`
        });
    }

    /**
     * Prepares the add-on Side Panel Client.
     */
    useEffect(() => {
        if (!isInMeet) return;

        (async () => {
            try {
                const session = await meet.addon.createAddonSession({
                    cloudProjectNumber: `${process.env.CLOUD_PROJECT_NUMBER}`,
                });
                setSidePanelClient(await session.createSidePanelClient());
            } catch (error) {
                console.error('Error initializing Meet SDK:', error);
            }
        })();
    }, [isInMeet]);

    const loadInterviewContext = async () => {
        if (!interviewId) {
            setError('Please enter an interview ID');
            return;
        }

        setLoading(true);
        setError('');

        const url = `${process.env.RECOS_API_BASE}/interview/${interviewId}/`

        console.log({url});
        

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${process.env.RECOS_API_TOKEN}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log({data});
            
            setInterviewData(data);
        } catch (err) {
            setError('Failed to load interview details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const startAnalysis = () => {
        if (!interviewId) {
            setError('Please load an interview first');
            return;
        }
        setIsAnalysisRunning(true);
    };

    const stopAnalysis = () => {
        setIsAnalysisRunning(false);
    };

    if (!isInMeet) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <Card title="🎯 Recos AI Assistant - Development Mode">
                    <Text>
                        This is the development version of the Recos AI Assistant add-on.
                        The Meet SDK is only available when the add-on is running within Google Meet.
                    </Text>
                    <div className="mt-4 p-3 bg-yellow-50 rounded">
                        <Text className="font-medium">Development Notes:</Text>
                        <ul className="list-disc pl-5 mt-2">
                            <li>The Meet SDK requires the `meet_sdk` URL parameter which is automatically added by Google Meet</li>
                            <li>This parameter is not present when running locally</li>
                            <li>Deploy the add-on to test it within Google Meet</li>
                        </ul>
                    </div>
                </Card>

                <Card title="Interview Context" className="mt-4">
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

                {interviewData && (
                    <Card title="Interview Details" className="mt-4">
                        <div className="space-y-2">
                            <Text><strong>Candidate:</strong> {interviewData.candidate_name}</Text>
                            <Text><strong>Recruiter:</strong> {interviewData.recruiter_name}</Text>
                            <Text><strong>Title:</strong> {interviewData.title}</Text>
                        </div>
                    </Card>
                )}

                <Card title="Live Analysis" className="mt-4">
                    <div className="space-y-4">
                        <div className="flex space-x-2">
                            <Button
                                onClick={isAnalysisRunning ? stopAnalysis : startAnalysis}
                                disabled={!interviewId}
                            >
                                {isAnalysisRunning ? 'Stop Listening' : 'Start Listening'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <Card title="🎯 Recos AI Assistant - Live Interview Analysis">
                <Text>Real-time interview analysis and transcription</Text>
            </Card>

            <InterviewContext
                interviewId={interviewId}
                setInterviewId={setInterviewId}
                interviewData={interviewData}
                loadInterviewContext={loadInterviewContext}
                loading={loading}
                error={error}
            />

            <TranscriptionStatus />

            <AnalysisSection
                isAnalysisRunning={isAnalysisRunning}
                startAnalysis={startAnalysis}
                stopAnalysis={stopAnalysis}
                interviewId={interviewId}
            />

            <div className="mt-4">
                <Button onClick={startActivity}>
                    Launch in Main Stage
                </Button>
            </div>
        </div>
    );
}
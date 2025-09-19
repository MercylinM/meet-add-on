'use client';

import { useEffect, useState } from 'react';
import { meet } from '@googleworkspace/meet-addons/meet.addons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { AnalysisSection } from '../components/Analysis';

export default function MainStage() {
    const [isInMeet, setIsInMeet] = useState<boolean>(false);

    // Check if we're running in Google Meet
    useEffect(() => {
        // Check if we're in an iframe (which is how Meet loads add-ons)
        const inIframe = window.parent !== window;

        // Check if the meet_sdk parameter is present in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const hasMeetSdkParam = urlParams.has('meet_sdk');

        setIsInMeet(inIframe && hasMeetSdkParam);
    }, []);

    /**
     * Prepares the add-on Main Stage Client, which signals that the add-on
     * has successfully launched in the main stage.
     */
    useEffect(() => {
        // Only initialize the Meet SDK if we're actually running in Meet
        if (!isInMeet) return;

        (async () => {
            try {
                const session = await meet.addon.createAddonSession({
                    cloudProjectNumber:`${process.env.CLOUD_PROJECT_NUMBER}`,
                });
                await session.createMainStageClient();
            } catch (error) {
                console.error('Error initializing Meet SDK:', error);
            }
        })();
    }, [isInMeet]);

    // Show a development mode message when not running in Meet
    if (!isInMeet) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <Card title="🎯 Recos AI Assistant - Main Stage (Development Mode)">
                    <Text>
                        This is the development version of the Recos AI Assistant main stage.
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

                <Card title="Main Stage Preview" className="mt-4">
                    <Text>This is a preview of the main stage interface. Everyone in the call will see this when the add-on is launched in the main stage.</Text>
                </Card>

                <AnalysisSection
                    isAnalysisRunning={true}
                    startAnalysis={() => { }}
                    stopAnalysis={() => { }}
                    interviewId="main-stage"
                />
            </div>
        );
    }

    // Normal Meet add-on UI when running in Meet
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <Card title="🎯 Recos AI Assistant - Main Stage">
                <Text>This is the main stage view. Everyone in the call can see this.</Text>
            </Card>

            <AnalysisSection
                isAnalysisRunning={true}
                startAnalysis={() => { }}
                stopAnalysis={() => { }}
                interviewId="main-stage"
            />
        </div>
    );
}
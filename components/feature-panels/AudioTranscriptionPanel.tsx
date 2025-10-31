
import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../../services/geminiService';
import Button from '../common/Button';

type RecordingState = 'idle' | 'recording' | 'processing';

const AudioTranscriptionPanel: React.FC<{ setStatusMessage: (msg: string) => void }> = ({ setStatusMessage }) => {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [transcription, setTranscription] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                setRecordingState('processing');
                setStatusMessage('Transcribing audio...');
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = (reader.result as string).split(',')[1];
                    const result = await transcribeAudio(base64Audio);
                    setTranscription(result);
                    setStatusMessage('Transcription complete.');
                    setRecordingState('idle');
                };
                 stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setRecordingState('recording');
            setStatusMessage('Recording... Click stop when you are done.');
            setTranscription('');
        } catch (error) {
            console.error("Error accessing microphone:", error);
            setStatusMessage('Could not access microphone. Please grant permission.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recordingState === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    return (
        <div className="p-4 flex flex-col gap-4 h-full">
            <h2 className="text-lg font-bold">Audio Transcription</h2>
            <div className="flex gap-4">
                <Button onClick={startRecording} disabled={recordingState !== 'idle'}>
                    {recordingState === 'idle' ? 'Start Recording' : 'Recording...'}
                </Button>
                <Button onClick={stopRecording} disabled={recordingState !== 'recording'} className="bg-[#a03333] border-[#a03333] hover:bg-[#b04343]">
                    Stop Recording
                </Button>
            </div>
             {recordingState === 'processing' && <p>Processing...</p>}
            <div className="flex-1 mt-4 bg-[#22241e] rounded-lg p-4 overflow-y-auto">
                <p className="whitespace-pre-wrap">{transcription || 'Your transcription will appear here.'}</p>
            </div>
        </div>
    );
};

export default AudioTranscriptionPanel;

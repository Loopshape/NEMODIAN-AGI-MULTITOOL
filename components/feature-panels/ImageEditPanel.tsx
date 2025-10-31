
import React, { useState, useRef } from 'react';
import { editImage } from '../../services/geminiService';
import Button from '../common/Button';

interface ImageEditPanelProps {
    setStatusMessage: (message: string) => void;
}

const ImageEditPanel: React.FC<ImageEditPanelProps> = ({ setStatusMessage }) => {
    const [prompt, setPrompt] = useState('Add a retro, grainy film filter.');
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(reader.result as string);
                setEditedImage(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = async () => {
        if (!prompt.trim() || !imageFile || !originalImage) return;
        setIsLoading(true);
        setEditedImage(null);
        setStatusMessage('Editing image...');
        
        const base64 = originalImage.split(',')[1];
        const result = await editImage(prompt, base64, imageFile.type);
        
        if (result) {
            setEditedImage(result);
            setStatusMessage('Image edited successfully.');
        } else {
            setStatusMessage('Failed to edit image.');
        }
        setIsLoading(false);
    };

    return (
        <div className="p-4 flex flex-col gap-4 h-full">
             <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            <div className="flex flex-col gap-2">
                <label htmlFor="edit-prompt" className="text-sm font-bold">Edit Instruction</label>
                <input
                    id="edit-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Make the sky purple"
                    className="w-full p-2 rounded bg-[#22241e] border border-[#4a4c41] focus:outline-none focus:ring-1 focus:ring-[#4ac94a]"
                />
            </div>
            <div className="flex items-center gap-4">
                 <Button onClick={() => fileInputRef.current?.click()} className="bg-[#5bc0de] border-[#5bc0de] hover:bg-[#6fc9e7]">Upload Image</Button>
                 <Button onClick={handleEdit} isLoading={isLoading} disabled={!originalImage}>Apply Edit</Button>
            </div>
            <div className="flex-1 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-[#22241e] rounded-lg flex flex-col items-center justify-center p-2">
                    <h3 className="text-sm text-[#999966] mb-2">Original</h3>
                    {originalImage ? <img src={originalImage} alt="Original" className="max-h-full max-w-full object-contain" /> : <p>Upload an image to start</p>}
                </div>
                <div className="bg-[#22241e] rounded-lg flex flex-col items-center justify-center p-2">
                    <h3 className="text-sm text-[#999966] mb-2">Edited</h3>
                    {isLoading && <p>Editing...</p>}
                    {editedImage && <img src={editedImage} alt="Edited" className="max-h-full max-w-full object-contain" />}
                    {!isLoading && !editedImage && <p>Your edited image will appear here</p>}
                </div>
            </div>
        </div>
    );
};

export default ImageEditPanel;

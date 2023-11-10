import React, { useRef, ChangeEvent, useState } from 'react';
import './index.css';
import axios from "axios";

interface Props {
    setStepper: React.Dispatch<React.SetStateAction<number>>
    setCsvFileUrl: React.Dispatch<React.SetStateAction<string>>
    setUploadedVideoLink: React.Dispatch<React.SetStateAction<string>>
}

const Upload: React.FC<Props> = ({ setStepper, setCsvFileUrl, setUploadedVideoLink }) => {
    const csvInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const [csvFilename, setCsvFilename] = useState<string>('')
    const [videoname, setVideoname] = useState<string>('')

    const handleCSVUpload = () => {
        if (csvInputRef.current) {
            csvInputRef.current.click();
        }
    };

    const handleVideoUpload = () => {
        if (videoInputRef.current) {
            videoInputRef.current.click();
        }
    };

    const handleCSVFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // Handle the CSV file here
            const selectedFile = e.target.files[0]; 
            if (selectedFile) { 
                // uploading the file on cloudnary  
                    try {  
                        const folderName = 'Easybell';
                        const formData = new FormData();
                        formData.append('file', selectedFile);
                        formData.append('upload_preset', 'jhujouxl');
                        formData.append('folder', folderName);

                        const response = await axios.post(
                            `https://api.cloudinary.com/v1_1/simplefind/upload`,
                            formData,
                        ); 
                        if (response?.data?.secure_url) { 
                            setCsvFileUrl(response?.data?.secure_url) 
                            setCsvFilename(selectedFile?.name)
                        }

                    } catch (error) {
                         console.log("🚀 ~ file: index.tsx:54 ~ handleCSVFileChange ~ error:", error)
                    }
                
            }
        }
    };

    const handleVideoFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // Handle the video file here
            const selectedFile = e.target.files[0];
            if (selectedFile) { 
                // uploading video on cloudnary 
                try {  
                    const folderName = 'Easybell';
                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    formData.append('upload_preset', 'jhujouxl');
                    formData.append('folder', folderName);

                    const response = await axios.post(
                        `https://api.cloudinary.com/v1_1/simplefind/upload`,
                        formData,
                    ); 
                    if(response?.data){
                        setVideoname(selectedFile.name)
                        setUploadedVideoLink(response?.data?.secure_url)
                    } 

                } catch (error) {
                     console.log("🚀 ~ file: index.tsx:54 ~ handleCSVFileChange ~ error:", error)
                }
            }
        }
    };

    const handleContinue = () => {
        setStepper(2);
    }

    return (
        <div className="button-container">
            <input
                type="file"
                accept=".csv"
                ref={csvInputRef}
                style={{ display: 'none' }}
                onChange={handleCSVFileChange}
            />
            <input
                type="file"
                accept="video/*"
                ref={videoInputRef}
                style={{ display: 'none' }}
                onChange={handleVideoFileChange}
            />
            <button className="outlined-button" onClick={handleCSVUpload} title={csvFilename ? csvFilename:""}>
                {csvFilename ? csvFilename : "Upload CSV"}
            </button>
            <button className="outlined-button" onClick={handleVideoUpload}>
                {videoname ? videoname : "Upload Video"}
            </button>
            <button className="filled-button1" onClick={handleContinue}>
                Continue
            </button>
        </div>
    );
};

export default Upload;

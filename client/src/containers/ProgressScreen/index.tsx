import React, { useEffect, useState } from "react";
import './index.css';
import axios from "axios";  

interface Props {
    filteredCsvData: any[]
    uploadedVideoLink: string
}
const ProgressScreen: React.FC<Props> = ({ filteredCsvData, uploadedVideoLink }) => {

    const [videoLink, setVideoLink] = useState<any>([])
    let percentage = 5;

    useEffect(() => {
        if (filteredCsvData) {
            processNextURL(filteredCsvData)
            handlePercentage()
        }
    }, [filteredCsvData])


    const handlePercentage = () => {
        const progressBarHtml: HTMLElement | null = document.getElementById("progress");
        setTimeout(() => {
            updateProgressBar(percentage)
            
            handlePercentage() 
            if (videoLink?.length > 0) {
                percentage = percentage + 100 
                return;
            }
            if(!videoLink?.videoLink && percentage < 80){
                percentage = percentage + 4; 
            }
            if(!videoLink?.videoLink && percentage >= 80 ){
                percentage = percentage + 3; 
            }  
        }, 3000);
        const updateProgressBar = (percentage: number) => {
            if (progressBarHtml) {
                progressBarHtml.style.width = `${percentage}%`;
            }
        };
    } 


    const processNextURL = async (urls: any) => {


        if (urls.length === 0) {
            return; // Base case: if no more URLs, stop recursion
        }
        const url = urls[0].url;
        try {
            const response = await axios.get(`http://16.170.220.59:3001/capture?url=${url}&videoLink=${uploadedVideoLink}`); 
            if (response.status === 200) {  
                setVideoLink((prevVideoLink: any) => {
                    const newArray = [...prevVideoLink];
                    newArray?.push({ url: url, videoUrl: response.data?.videoUrl });
                    return newArray;
                });
            }

        } catch (error) {
            console.log("Error occurred:", error);
            // Handle errors if necessary
        }
        await processNextURL(urls.slice(1));
    };


    const handleClick = () => {
        // if (progressBarHtml)
        //     progressBarHtml.style.width = "80%"
    }


    return (
        <div className="button-container" style={{ padding: 20 }}>
            <table>
                <thead>
                    <tr>
                        <th >Website</th>
                        <th>Progress</th>
                        <th>Video</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCsvData?.map((item, index) => {
                        const matchedVideoLink = videoLink.find((item2: any) => item2.url === item.url);
                        const videoUrl = matchedVideoLink ? matchedVideoLink.videoUrl : '';

                        return (
                            <tr key={index + 445}>
                                <td>{item?.url}</td>
                                <td>
                                    <div className="progress-container">
                                        <div className="progress-bar" id="progress" style={{width:videoUrl && "100% !important"}}></div>
                                    </div>
                                </td>
                                <td>
                                    {videoUrl && <a href={videoUrl} target="_blank" onClick={handleClick}>{videoUrl}</a>}
                                </td>
                            </tr>
                        );
                    })}


                </tbody>
            </table>
        </div>
    )
}
export default ProgressScreen;


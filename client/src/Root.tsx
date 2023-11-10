import ProgressScreen from "./containers/ProgressScreen"
import Upload from './containers/Upload';
import { useState } from 'react';
import ColumnSelector from './containers/ColumnSelector';

export const RemotionRoot: React.FC = () => {
    const [stepper, setStepper] = useState<number>(1);
    const [csvFileUrl, setCsvFileUrl] = useState<string>('');
    const [uploadedVideoLink, setUploadedVideoLink] = useState<string>('');
    const [filteredCsvData, setFilteredCsvData] = useState<Array<any>>([]) 
    switch (stepper) {
        case 1:
            return <Upload setStepper={setStepper} setCsvFileUrl={setCsvFileUrl} setUploadedVideoLink={setUploadedVideoLink} />;

        case 2:
            return <ColumnSelector setStepper={setStepper} csvFileUrl={csvFileUrl} setFilteredCsvData={setFilteredCsvData} />
        
        case 3:
            return <ProgressScreen filteredCsvData={filteredCsvData} uploadedVideoLink={uploadedVideoLink}   /> 
        

        default:
            return <p>Loading ...</p>
    }
};

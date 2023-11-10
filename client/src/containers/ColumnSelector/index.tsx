import React, { useEffect, useState } from 'react';
import './index.css'; 
const Papa = require('papaparse');

interface Props {
    setStepper: React.Dispatch<React.SetStateAction<number>>
    csvFileUrl: string
    setFilteredCsvData: React.Dispatch<React.SetStateAction<any[]>>
}

const ColumnSelector: React.FC<Props> = ({ setStepper, csvFileUrl, setFilteredCsvData }) => {
    const [selectedColumn, setSelectedColumn] = useState<string>(''); // Store the selected column here
    const [columnOptions, setColumnOptions] = useState<Array<any>>([])
    const [csvData, setCsvData] = useState<Array<any>>([])
    

    useEffect(() => {
        processCSV()
    }, [])

    // fetching the columns names from that uploaded file
    function processCSV() {
        // Fetch CSV file from Cloudinary
        fetch(csvFileUrl)
            .then(response => response.text())
            .then(csvData => {
                // using PapaParse library for file data conversion
                const parsedData = Papa.parse(csvData, {
                    header: true // Treat the first row as header/column names
                }); 
                setColumnOptions(parsedData?.meta?.fields)
                const filteredArray = parsedData?.data?.slice();
                filteredArray.splice(-1, 1);
                setCsvData(filteredArray)
            })
            .catch(error => {
                console.error('Error fetching or processing CSV data:', error);
            });
    }

    useEffect (()=>{
        if(selectedColumn){ 
            const filteredData = csvData?.map((item: any) => ({url: item[selectedColumn]}));
            setFilteredCsvData(filteredData)
        }
    },[selectedColumn])

    const handleColumnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedColumn(event.target.value);
    };

    const handleContinueClick = async () => {
        // Handle the "Continue" button click here, e.g., submit the selected column  
        setStepper(3)
    };

    return (
        <div className="button-container">
            <select
                value={selectedColumn}
                onChange={handleColumnChange}
                className="column-dropdown"
            >
                <option value="">Select a Column</option>
                {columnOptions.map((column, index) => (
                    <option key={index} value={column}>
                        {column}
                    </option>
                ))}
            </select>
            <button className="filled-button" onClick={handleContinueClick}>
                Continue
            </button>
        </div>
    );
};

export default ColumnSelector;

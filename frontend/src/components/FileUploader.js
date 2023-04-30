import { Button } from '@chakra-ui/react';
import React, { useState } from 'react';

function FileUploader({ onFileParsed }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('Upload a file (JSON)');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      onFileParsed(reader.result);
    };
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="file-upload border rounded-md bg-white text-gray-700 hover:bg-gray-50 flex justify-between items-center w-[300px]">
        <input type="file" onChange={handleFileChange} className="hidden" />
        <span className="truncate text-sm w-[200px] px-2">{fileName}</span>
        <Button type="submit" className="grow" fontSize={{ base: '10px', md: '14px' }}>
          Import
        </Button>
      </label>
    </form>
  );
}

export default FileUploader;

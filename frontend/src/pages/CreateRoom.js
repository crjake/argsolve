import {
  Button,
  ButtonGroup,
  Input,
  InputGroup,
  InputLeftAddon,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Select,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { API_URL } from '../config';

import { Frame } from '../components/Frame';
import FileUploader from '../components/FileUploader';

const CreateRoom = (props) => {
  const navigate = useNavigate();
  const [proposal, setProposal] = useState('');
  const [message, setMessage] = useState('');
  const [examples, setExamples] = useState(null);

  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  // On mount, fetch examples from backend
  useEffect(() => {
    const fetchExamples = async () => {
      try {
        const response = await axios.get(API_URL + 'get-examples');
        if (response) {
          setExamples(response.data.examples);
        }
      } catch (error) {
        console.log('Error fetching examples');
      }
    };
    fetchExamples();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(API_URL + 'create-room', {
        host: props.username,
        topic: proposal,
      });
      if (response.data && response.data.success) {
        navigate('/rooms/' + response.data.roomId);
      }
    } catch (error) {
      if (error.response.data && error.response.data.failure) {
        setMessage(error.response.data.failure);
      } else {
        setMessage('Something went wrong. Please try again later.');
      }
    }
  };

  const handleCreateExample = async () => {
    if (!selectedOption) {
      console.warn("We shouldn't be here...");
      return;
    }

    try {
      const selectedExample = examples.find((example) => {
        return example.topic === selectedOption;
      });
      const response = await axios.post(API_URL + 'create-room', {
        host: props.username,
        topic: selectedExample.topic,
        existing_framework: selectedExample,
      });

      if (response.data && response.data.success) {
        navigate('/rooms/' + response.data.roomId);
      }
    } catch (error) {
      if (error.response.data && error.response.data.failure) {
        setMessage(error.response.data.failure);
      } else {
        setMessage('Something went wrong. Please try again later.');
      }
    }
  };

  return (
    <Frame>
      <div className="flex flex-col mt-20 items-start w-full md:w-[75%] mx-auto space-y-2">
        <div className="flex justify-start w-full">
          <p className="text-xl border-b-2 mt-2 w-full">Debate Creation</p>
        </div>
        <Tabs isFitted variant="unstyled" defaultIndex={0} className="w-full border rounded-md">
          <TabList>
            <Tab>Create</Tab>
            <Tab>Upload</Tab>
            <Tab>Examples</Tab>
          </TabList>
          <TabIndicator mt="-1.5px" height="2px" bg="blue.500" borderRadius="1px" />
          <TabPanels>
            <TabPanel>
              <form onSubmit={handleSubmit} className="w-full" onKeyDown={(event) => event.key != 'Enter'}>
                <InputGroup
                  size={{ base: 'xs', md: 'sm' }}
                  fontSize={{ base: 'xs', md: 'sm' }}
                  className=""
                  width="100%"
                >
                  <InputLeftAddon children="Initial argument" />
                  <Input
                    value={proposal}
                    onChange={(event) => setProposal(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                      }
                    }}
                  ></Input>
                </InputGroup>
                {/* <p className="mt-4">TODO: Aggregation method, number of rounds...</p> */}
                <ButtonGroup variant="outline" spacing="2" className="mt-2 flex justify-between w-full">
                  <Button
                    onClick={() => {
                      navigate('/rooms');
                    }}
                    className=""
                    size={{ base: 'xs', md: 'sm' }}
                    width="lg"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="" size={{ base: 'xs', md: 'sm' }} width="lg" variant="outline">
                    Create
                  </Button>
                </ButtonGroup>
              </form>
              {message && <p className="text-red-500">{message}</p>}
            </TabPanel>
            <TabPanel>
              <div className="flex flex-col items-center space-y-2">
                <FileUploader></FileUploader>
                <Button
                  onClick={() => {
                    navigate('/rooms');
                  }}
                  className=""
                  size={{ base: 'xs', md: 'sm' }}
                  width="full"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </TabPanel>
            <TabPanel>
              <div className="flex flex-col items-center space-y-2">
                {examples && (
                  <Select placeholder="Select option" size="sm" onChange={handleOptionChange}>
                    {examples.map((example) => {
                      return (
                        <option value={example?.topic} key={example.topic}>
                          {example.topic}
                        </option>
                      );
                    })}
                  </Select>
                )}
                {!examples && <div className="mt-2 text-sm">There were no examples found.</div>}
                <ButtonGroup variant="outline" spacing="2" className="flex justify-between w-full">
                  <Button
                    onClick={() => {
                      navigate('/rooms');
                    }}
                    className=""
                    size={{ base: 'xs', md: 'sm' }}
                    width="lg"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  {/* // TODO: disable create when no example is selected */}
                  <Button
                    onClick={handleCreateExample}
                    className=""
                    size={{ base: 'xs', md: 'sm' }}
                    width="lg"
                    variant="outline"
                    isDisabled={!examples || !(selectedOption && selectedOption != 'Select option')}
                  >
                    Create
                  </Button>
                </ButtonGroup>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </Frame>
  );
};

export default CreateRoom;

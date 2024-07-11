import * as client from 'dataforseo-client';
import { useState } from 'react';
import './App.css';

function createAuthenticatedFetch(username: string, password: string) {
  return (url: RequestInfo, init?: RequestInit): Promise<Response> => {
    const token = btoa(`${username}:${password}`);
    const authHeader = { 'Authorization': `Basic ${token}` };

    console.log("authHeader: ", authHeader);

    const newInit: RequestInit = {
      ...init,
      headers: {
        ...init?.headers,
        ...authHeader
      }
    };

    return fetch(url, newInit);
  };
}

async function loadTrendingKeywords(keyword: string, url: string, username: string, password: string) {
  const authFetch = createAuthenticatedFetch(username, password);
  const keywordApi = new client.KeywordsDataApi(url, { fetch: authFetch });

  const task = new client.KeywordsDataGoogleTrendsExploreLiveRequestInfo();
  task.keywords = [keyword];
  task.location_name = "United States";
  task.time_range = "past_7_days";

  const resp = await keywordApi.googleTrendsExploreLive([task]);

  return resp?.toJSON();
}

async function loadFromDataForSEO(keyword: string, url: string, username: string, password: string) {
  const authFetch = createAuthenticatedFetch(username, password);
  const serpApi = new client.SerpApi(url, { fetch: authFetch });

  const task = new client.SerpGoogleOrganicLiveAdvancedRequestInfo();
  task.language_name = "English (United Kingdom)";
  task.location_name = "London,England,United Kingdom";
  task.keyword = keyword

  const resp = await serpApi.googleOrganicLiveAdvanced([task]);

  return resp?.toJSON();
}

async function getDataFromTrafilatura(url: string) {
  const response = await fetch(url);
  const data = await response.text();

  return data;
}

function App() {
  const [keyword, setKeyword] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [options, setOptions] = useState<string[]>([
    'Option 1',
    'Option 2',
    'Option 3',
    'Option 4'
  ]);
  const [resp, setResp] = useState('');

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div>
      <h1>Hello</h1>
      <div className="card">
        <div>
          <label htmlFor="username">Username: </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password: </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <p>
          <label htmlFor="keyWord">Keyword: </label>
          <input
            type="text"
            id="keyword"
            placeholder="Type here..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </p>
        <button onClick={async () => {
          // Change the text of options by "waiting..." for the response from DataForSEO
          setOptions(["waiting...", "waiting...", "waiting...", "waiting...", "waiting..."]);

          // Clear resp
          setResp('');

          const response = await loadFromDataForSEO(keyword, "https://api.dataforseo.com", username, password)

          const trendingKeywords = await loadTrendingKeywords(keyword, "https://api.dataforseo.com", username, password)
          console.log("trendingKeywords: ", trendingKeywords);

          // get first 5 Organic Serp results
          const first5OrganicSerpElementItem = response["tasks"][0]["result"][0]["items"].filter((item: never) => item["type"] === "organic").slice(0, 5);

          // Change the text of options by ['url'] of the first 5 Organic Serp results
          setOptions(first5OrganicSerpElementItem.map((item: never) => item["url"]));
        }}>
          Query Google
        </button>
        <div className="form-group">
          <label className="OptionsLabel">Select an Option:</label>
          <div className="radio-group">
            {options.map((option, index) => (
              <div key={index} className="radio-option">
                <input
                  type="radio"
                  id={`option${index + 1}`}
                  name="option"
                  value={option}
                  checked={selectedOption === option}
                  onChange={handleOptionChange}
                />
                <label htmlFor={`option${index + 1}`}>{option}</label>
              </div>
            ))}
          </div>
        </div>
        <button onClick={async () => {
          // set resp to "waiting..."
          setResp('waiting...');

          const extractUrl = 'http://46.250.232.35:17590/extract-text?url=' + selectedOption
          const resText = await getDataFromTrafilatura(extractUrl)
          setResp(resText)
        }}>
          Extract Text
        </button>
        <p className="response">
          {resp.toString()}
        </p>
      </div>
    </div>
  );
}

export default App;

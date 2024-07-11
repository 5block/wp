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

  console.log(data);

  return data;
}

function App() {
  const [keyword, setKeyword] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [resp, setResp] = useState('');

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
          const response = await loadFromDataForSEO(keyword, "https://api.dataforseo.com", username, password)
          const extractUrl = 'http://46.250.232.35:17590/extract-text?url=' + response["tasks"][0]["result"][0]["items"][1]["url"]
          const resText = await getDataFromTrafilatura(extractUrl)
          setResp(resText)
        }}>
          Get
        </button>
        <p className="response">
          {resp.toString()}
        </p>
      </div>
    </div>
  );
}

export default App;

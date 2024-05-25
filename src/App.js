import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';


const CLIENT_ID = "afbc3698bcc84631969ccfef611b71a7";
const REDIRECT_URI = "http://localhost:3000";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";

function App() {
  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    setToken(token);
  }, []);

  const handleLogout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  const searchArtists = async (e) => {
    e.preventDefault();
    if (!token) {
      console.error("No token available");
      return;
    }
    try {
      const { data } = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          q: searchKey,
          type: "artist"
        }
      });
      setArtists(data.artists.items);
    } catch (error) {
      console.error("Error fetching data from Spotify API", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Search</h1>
        {!token ? (
          <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login To Spotify</a>
        ) : (
          <>
            <button onClick={handleLogout}>Logout</button>
            <form onSubmit={searchArtists}>
              <input
                type="text"
                onChange={e => setSearchKey(e.target.value)}
                placeholder="Search for an artist"
              />
              <button type="submit">Search</button>
            </form>
            <div>
              {artists.map(artist => (
                <div key={artist.id}>
                  <h3>{artist.name}</h3>
                  {artist.images.length > 0 && <img src={artist.images[0].url} alt={artist.name} />}
                </div>
              ))}
            </div>
          </>
        )}
        {!token && <h2>Please Login</h2>}
      </header>
    </div>
  );
}

export default App;

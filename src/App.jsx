import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from 'react-use'
import { useEffect, useState } from 'react'

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET', 
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}


const App = () => {
  const [searchTerm, setSearchTerm]= useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [newRelease, setNewRelease] = useState([]);

  // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 500ms
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])
  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try{
      const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if(!response.ok){
        throw new Error();
      }
      const data = await response.json();
      
      if (data.Response === 'False'){
        setErrorMessage(data.Error || 'Error fetching movies. Please try again later.'); 
        setMovieList([]);
        return;
      }
      setMovieList(data.results||[]);
    } catch (error){
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }
  const loadLatestMovies = async () => {
    try{
      const endpoint = `${API_BASE_URL}/discover/movie?release_date.lte=2025-02-20?sort_by=primary_release_date.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if(!response.ok){
        throw new Error();
      }
      const data = await response.json();
      console.log(data);
      if (data.Response === 'False'){
        setErrorMessage(data.Error || 'Error fetching movies. Please try again later.'); 
        setNewRelease([]);
        return;
      }
      setNewRelease(data.results.slice(0,5)||[]);
    } catch (error){
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      
    }
  }
  
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);
  

  useEffect(() => {
    loadLatestMovies();
  }, []);

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          < img src="./hero-img.png" alt="Hero Banner"/>
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>

        <section className="trending">
          <h2>New Releases</h2>
          <ul>
            {newRelease.map((movie, index)=>(
              <li key={movie.id}>
                <p>{index + 1}</p>
                <img 
                src={movie.poster_path?
                `https://image.tmdb.org/t/p/w500/${movie.poster_path}`:'/No-Poster.png'}
                alt={movie.title}/>
              </li>
            ))}
          </ul>

        </section>
        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ?(
            <Spinner />
          ): errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ): (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
import pandas as pd
import requests
import os

# insert personal key
API_KEY = ''

def find_TMDB_Ids(title):
    # identify movie title and year
    if '(' in title:
        title_lst = title.split(' (')
        movie_title = title_lst[0]
        year = title_lst[-1][:4]
    else:
        movie_title = title
        year = None
    # query movie details
    url = f"https://api.themoviedb.org/3/search/movie?api_key={API_KEY}&query={movie_title}"
    response = requests.get(url)
    data = response.json()
    # find the movie ID
    mov_id = None
    if len(data['results']) == 1:
        mov_id = data['results'][0]['id']
    else:
        if year is None:
            mov_id = data['results'][0]['id']
        else:
            for movie in data['results']:
                if movie['title'] == movie_title and movie['release_date'][:4] == year:
                    mov_id = movie['id']
                elif movie['title'] == movie_title:
                    mov_id = movie['id']
                elif movie['release_date'][:4] == year:
                    mov_id = movie['id']
    return mov_id

def get_poster(movie_Id):
    movie_Id = str(movie_Id)
    url = f'https://api.themoviedb.org/3/movie/{movie_Id}?api_key={API_KEY}'

    response = requests.get(url)
    data = response.json()
    if response.status_code == 200:
        poster_path = data['poster_path']
        poster_url = f'https://image.tmdb.org/t/p/w500{poster_path}'
        return poster_url

def edit_title(movie_title):
    """
    Edit some movie titles by replacing "The" at the beginning of the title.

    :param: a movie title
    :return: a modified movie title, if applicable
    """
    if ", The" in movie_title:
        title = movie_title.split(", The")
        title = "The " + title[0] + title[1]
        return title
    else:
        return movie_title


# load files
MovieLens_links = pd.read_csv('data/ml-latest-small/links.csv')
MovieLens_movies = pd.read_csv('data/ml-latest-small/movies.csv')
# find movies with no TMDB ID
df_links = MovieLens_links[(MovieLens_links['tmdbId'].isna())].copy()
movies = df_links.movieId.values
# find titles of movies with no TMDB ID
missing_movies = MovieLens_movies[MovieLens_movies.movieId.isin(movies)].iloc[:,:-1].copy()
missing_movies.title = missing_movies.title.apply(edit_title)
# look up IDs by title
missing_movies['tmdbId'] = missing_movies['title'].apply(find_TMDB_Ids)
# manually add the one missing value
missing_movies.at[7382, 'tmdbId'] = 7154
# fill the initially missing values with the found IDs
MovieLens_links['tmdbId'].fillna(missing_movies['tmdbId'], inplace=True)
# create a poster column and store the poster links
MovieLens_links['poster'] = MovieLens_links['tmdbId'].apply(get_poster)
# add movie titles
movies = MovieLens_movies[["movieId", "title"]].copy()
MovieLens_links = MovieLens_links.merge(movies, how="left", left_on="movieId", right_on="movieId")
# store the new dataframe as a csv
os.makedirs('./data/preprocessed_data', exist_ok=True)
MovieLens_links.to_csv('./data/preprocessed_data/movie_poster_links.csv')

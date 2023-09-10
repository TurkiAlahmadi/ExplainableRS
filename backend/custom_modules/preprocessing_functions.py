from collections import Counter

##### Define Preprocessing Functions #####

def edit_title(movie_title):
    """
    Edit some movie titles by removing "A", "An", and "The" from the end
    of a title and adding them at the beginning of the title.

    :param: a movie title
    :return: a modified movie title, if applicable
    """
    if ", The" in movie_title:
        title = movie_title.split(", The")
        title = "The " + title[0] + title[1]
        return title
    elif ", An" in movie_title:
        title = movie_title.split(", An")
        title = "An " + title[0] + title[1]
        return title
    elif ", A" in movie_title:
        title = movie_title.split(", A")
        title = "A " + title[0] + title[1]
        return title
    else:
        return movie_title

def create_titles_col(lst, movies_df):
    """
    convert list of movie ids to list of movie titles
    :param lst: a list of movie IDs
    :param movies_df: movies dataframe
    :return: a list of movie titles corresponding to the ids in the input
    """
    title_lst = []
    for iid in lst:
        title_lst.append(movies_df[(movies_df.movieId == iid)]['title'].values[0])
    return title_lst

def movie_tag_count(lst):
    """
    count tag frequency for a movie.

    :param lst: a list of tags
    :return: a list of tuples containing tags and tag frequencies for a movie
    """
    tag_count = Counter(lst).most_common()
    return tag_count

def reset_tag_count(lst):
    """
    reset tag frequency to aggregate movie tags for each user.

    :param lst: a list of tags
    :return: a list of tuples containing tags and tag frequencies of 1 for a movie
    """
    tags = [x[0] for x in lst]
    counts = [1]*len(tags)
    return list(zip(tags, counts))

def movie_top_5_tags(lst):
    """
    find the 5 most frequent tags for a movie.

    :param lst: a list of tuples containing tags and tag frequencies
    :return: a string of the top 5 tags for a movie
    """
    top_five = lst[:5]
    top_five = ["{}".format(x[0]) for x in top_five]
    top_five = ", ".join(top_five)
    return top_five

def user_top_5(lst):
    """
    find the 5 most frequent tags or genres for a user.

    :param lst: a list of tuples containing tags/genres and their frequencies
    :return: a string of the top 5 tags/genres for a user
    """
    top_five = lst[:5]
    top_five = ["{} ({} movies)".format(x[0], x[1]) for x in top_five]
    top_five = ", ".join(top_five)
    return top_five

def add_genre_columns(movie_dataset):
    """

    :param movie_dataset: the MovieLens movies dataframe
    :return: a dataframe with movies, their genres collected, and columns for each genre
    """
    dataset = movie_dataset.copy()
    # find unique genres and store them
    genres = []
    for i in list(dataset.genres.unique()):
        for g in i.split("|"):
            if g not in genres:
                genres.append(g)
    # Add genre columns
    for i in genres:
        dataset[i] = dataset.genres.apply(lambda x: 1 if i in x else 0)
    return dataset
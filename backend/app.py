from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from MFExplainer import MFExplainer

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/data", methods= ["GET", "POST"])
@cross_origin()
def post_and_get_data():
    if request.method == 'POST':
        data = request.get_json()
        movie_titles = []
        movie_ratings = []
        for movie in data:
            movie_titles.append(movie['title'])
            movie_ratings.append(float(movie['rating']))
        explainer = MFExplainer()
        recommendations = explainer.get_recommendation_data(movie_titles, movie_ratings)
        user_movies, movie_users, user_data, item_data = explainer.get_user_and_item_data()
        data = {"userData": user_data,
                "itemData": item_data,
                "userMovies": user_movies,
                "movieUsers": movie_users,
                "recommendedItems": recommendations['titles']
                }
        return jsonify(data)

    else:
        explainer = MFExplainer()
        titles = explainer.movies.get_titles()
        return jsonify({"movieTitles": titles})


if __name__ == '__main__':
    app.run()

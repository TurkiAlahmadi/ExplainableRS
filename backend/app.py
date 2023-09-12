from flask import Flask, request, jsonify, make_response
from MFExplainer import MFExplainer

app = Flask(__name__)

@app.route("/data", methods= ["GET", "POST", "OPTIONS"])
def post_and_get_data():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    elif request.method == 'POST':
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
        return _corsify_actual_response(jsonify(data))

    else:
        explainer = MFExplainer()
        titles = explainer.movies.get_titles()
        return _corsify_actual_response(jsonify({"movieTitles": titles}))


def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response


def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


if __name__ == '__main__':
    app.run()

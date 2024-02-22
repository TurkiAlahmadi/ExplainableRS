# MFExplain
MFExplain is an Interactive tool for explaining movie recommendations generated with matrix factorization. The tool provides the means to explore and interact with spaces that display all movies and users. It is developed as part of a master's thesis at the University of Zurich. The tool is designed for academic and research purposes only. Any questions about this tool can be sent to talahmadi36@gmail.com.

## Thesis Abstract
Recommender systems have become integral in guiding users through the overwhelming abundance of online content. As these systems assume an ever-increasing role in shaping user decisions and preferences, there is a growing demand for clarity in their decision-making processes to instill trust. Recommendation algorithms with a high degree of accuracy such as matrix factorization are highly regarded and widely adopted. Nonetheless, these algorithms tend to exhibit high complexity in their logic and architecture, rendering them challenging to explain to end-users. This issue has been recognized and many tools have presented possible solutions. Many of the implemented approaches, however, have demonstrated shortcomings due to disregarding some user-centered properties or overly concentrating on unraveling the underlying algorithmic intricacy. This work presents MFExplain, an innovative tool for explaining movie recommendations generated with matrix factorization. The tool aims to explain recommendations by relying on the provision of intuitive justifications. Leveraging interactivity and cutting-edge dimensionality reduction techniques enables the tool to also encourage exploration, allow user feedback, and foster many desirable recommender system properties that enrich the user experience.

## Tool Architecture and Libraries
The tool is implemented with Python for the backend and JavaScript, CSS, HTML for the frontend. The API endpoint is implemented with Flask.

### Backend librarires:
* NumPy
* Pandas
* Surprise
* UMAP

### Frontend libraries:
* React
* D3

## Data Source
The tool uses data obtained from MovieLens, a collection of open source movie ratings datasets. More information about the datasets can be found [here](https://grouplens.org/datasets/movielens/). 

## Running the Tool
### Backend
In the backend directory, run the following command:
```python
FLASK_APP = app.py
FLASK_ENV = development
FLASK_DEBUG = 0
flask run
```
### Frontend
In the frontend directory, run the following command:
```javascript
npm run start
```


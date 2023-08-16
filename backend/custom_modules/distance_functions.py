import numpy as np

def euclidean_similarity_matrix(matrix):
    euclidean_similarities = np.sqrt(np.sum((matrix[:, np.newaxis] - matrix) ** 2, axis=-1))
    return euclidean_similarities

def cosine_similarity_matrix(matrix):
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    normalized_matrix = matrix / norms
    return np.dot(normalized_matrix, normalized_matrix.T)
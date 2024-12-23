"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieSchema = void 0;
exports.validateMovie = validateMovie;
exports.validatePartialMovie = validatePartialMovie;
const { z } = require('zod');
exports.MovieSchema = z.object({
    "title": z.string({ invalid_type_error: 'Movie title must be a string', required_error: 'Movie title is required' }),
    "year": z.number().int().min(1900).max(2025),
    "director": z.string(),
    "duration": z.number().int().positive(),
    "poster": z.string().url(),
    "genre": z.array(z.enum(["Action", "Comedy", "Drama", "Horror", "Romance", "Thriller"]), {
        invalid_type_error: 'Movie genre must be an array of strings',
        required_error: 'Movie genre is required'
    }),
    "rate": z.number().min(0).max(10).default(5),
});
function validateMovie(movie) {
    return exports.MovieSchema.safeParse(movie);
}
function validatePartialMovie(movie) {
    return exports.MovieSchema.partial().safeParse(movie);
}

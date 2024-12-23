"use strict";
import * as z from "zod";
export const MovieSchema = z.object({
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
export function validateMovie(movie) {
    return MovieSchema.safeParse(movie);
}
export function validatePartialMovie(movie) {
    return MovieSchema.partial().safeParse(movie);
}

"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
process.chdir(path.resolve(__dirname));
console.log(process.cwd());
const typesAndSchemas_mjs_1 = require("./typesAndSchemas/typesAndSchemas.mjs");
const crypto = require('node:crypto');
const express = require('express');
const cors = require('cors'); //middleware
const app = express();
const moviesJson = require('../data/movies.json');
//CORS
const ACCEPTED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://seba.ink'
];
app.options('movies/:id', (req, res) => {
    const origin = req.headers.origin;
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,POST,PATCH,DELETE,OPTIONS');
    }
    res.send(200);
});
app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://seba.ink'
        ];
        if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.disable('x-powered-by');
app.use(express.json()); //detecta si la cabecera de la request es de tipo json y la convierte en objeto jscript / middleware
app.get('/', (req, res) => {
    res.json({ message: 'Hola desde backend!' });
});
//cada {} es una parte de la url, el primer son Params, el segundo es el body, el tercer es ReqBody, el cuarto es el ReqQuery
app.get('/movies', (req, res) => {
    // Establecer origin solo a una ruta, funciona solo en GET/HEAD/POST
    const origin = req.headers.origin;
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    const { genre, page } = req.query;
    if (genre) {
        const filteredMovies = moviesJson.filter((movie) => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()));
        return res.json(filteredMovies);
    }
    else if (page) {
        return res.json(moviesJson.slice((page - 1) * 10, page * 10));
    }
    return res.json(moviesJson);
});
app.get('/movies/:id', (req, res) => {
    const { id } = req.params;
    const movie = moviesJson.find((movie) => movie.id === id);
    if (movie)
        return res.json(movie);
    res.status(404).json({ message: 'Movie not found' });
});
app.post('/movies', (req, res) => {
    const result = (0, typesAndSchemas_mjs_1.validateMovie)(req.body);
    if (result.error)
        return res.status(400).json({ message: JSON.parse(result.error.message) });
    //concurrencia iria aqui
    const newMovie = Object.assign({ id: crypto.randomUUID() }, result.data);
    moviesJson.push(newMovie);
    res.status(201).json(newMovie);
});
app.patch('/movies/:id', (req, res) => {
    const { id } = req.params;
    const movieIndex = moviesJson.findIndex((movie) => movie.id === id);
    if (movieIndex === -1)
        return res.status(404).json({ message: 'Movie not found' });
    const result = (0, typesAndSchemas_mjs_1.validatePartialMovie)(req.body);
    if (result.error)
        return res.status(400).json({ message: JSON.parse(result.error.message) });
    moviesJson[movieIndex] = Object.assign(Object.assign({}, moviesJson[movieIndex]), result.data);
    return res.json(moviesJson[movieIndex]);
});
app.delete('/movies/:id', (req, res) => {
    const { id } = req.params;
    const movieIndex = moviesJson.findIndex((movie) => movie.id === id);
    if (movieIndex === -1)
        return res.status(404).json({ message: 'Movie not found' });
    moviesJson.splice(movieIndex, 1);
    res.status(200).json({ message: 'Movie deleted' });
});
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 1401;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

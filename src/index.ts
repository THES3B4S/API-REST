const path = require('path');
process.chdir(path.resolve(__dirname));

console.log(process.cwd())

import {Movies, validateMovie, validatePartialMovie} from "./typesAndSchemas/typesAndSchemas.cjs";
const crypto = require('node:crypto');
const express = require('express');
const cors = require('cors'); //middleware

const app = express();

//importamos tipado para las request
import {Request, Response} from 'express';

const moviesJson = require('../data/movies.json');

//CORS
const ACCEPTED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://seba.ink'
];

app.options('movies/:id', (req: Request, res: Response) => { //este es para DELETE, PATCH y PUT estos requieren un pre-flight
    const origin = req.headers.origin;
    if (ACCEPTED_ORIGINS.includes(<string>origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,POST,PATCH,DELETE,OPTIONS');
    }
    res.send(200);
})
//CORS Middleware
type CorsOriginCallback = (err: Error | null, allow?: boolean) => void;
app.use(cors({
    origin: (origin: string | undefined, callback: CorsOriginCallback) => {
        const ACCEPTED_ORIGINS = [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://seba.ink'
        ];
        if (ACCEPTED_ORIGINS.includes(<string>origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }}
))



app.disable('x-powered-by');
app.use(express.json()); //detecta si la cabecera de la request es de tipo json y la convierte en objeto jscript / middleware

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Hola desde backend!'})
});

//cada {} es una parte de la url, el primer son Params, el segundo es el body, el tercer es ReqBody, el cuarto es el ReqQuery
app.get('/movies', (req: Request<{}, {}, {}, {genre?:string, page?:number}>, res: Response) => {

    // Establecer origin solo a una ruta, funciona solo en GET/HEAD/POST
    const origin = req.headers.origin;
    if (ACCEPTED_ORIGINS.includes(<string>origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    const {genre, page} = req.query;
    if (genre) {
        const filteredMovies = moviesJson.filter((movie: Movies) =>
            movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()));
        return res.json(filteredMovies);

    } else if (page) {
        return res.json(moviesJson.slice((page - 1) * 10, page * 10));
    }

    return res.json(moviesJson)
});

app.get('/movies/:id', (req: Request, res: Response) => {
    const {id} = req.params;
    const movie: Movies = moviesJson.find((movie: Movies) => movie.id === id);
    if (movie) return res.json(movie)
    res.status(404).json({message: 'Movie not found'})
})

app.post('/movies', (req: Request<{},{},Movies>, res: Response) => {

    const result = validateMovie(req.body);

    if (result.error) return res.status(400).json({message: JSON.parse(result.error.message)});
    //concurrencia iria aqui
    const newMovie: Movies = {
        id: crypto.randomUUID(),
        ...result.data, //como ya hemos confirmado la request con zod, podemos directamente unpack las propiedades de result.data
    }
    moviesJson.push(newMovie);
    res.status(201).json(newMovie);
})

app.patch('/movies/:id', (req: Request, res: Response) => {
    const {id} = req.params;

    const movieIndex = moviesJson.findIndex((movie: Movies) => movie.id === id);
    if (movieIndex === -1) return res.status(404).json({message: 'Movie not found'});

    const result = validatePartialMovie(req.body);
    if (result.error) return res.status(400).json({message: JSON.parse(result.error.message)});

    moviesJson[movieIndex] = {...moviesJson[movieIndex], ...result.data};

    return res.json(moviesJson[movieIndex]);
})

app.delete('/movies/:id', (req: Request, res: Response) => {
    const {id} = req.params;
    const movieIndex = moviesJson.findIndex((movie: Movies) => movie.id === id);
    if (movieIndex === -1) return res.status(404).json({message: 'Movie not found'});

    moviesJson.splice(movieIndex, 1);
    res.status(200).json({message: 'Movie deleted'});
})

const PORT = process.env.PORT ?? 1401;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
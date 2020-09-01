import express from 'express';
import gradesRouter from './routes/grades.js';
import { promises as fs } from 'fs';

global.gradesFile = 'grades.json';
const { readFile, writeFile } = fs;

const app = express();
app.use(express.json());
app.use('/grades', gradesRouter);

app.listen(3001, async () => {
  try {
    await readFile(gradesFile);
    console.log('API Started and File Read!');
  } catch (err) {
    console.log('Failed to read file!', err.message);
  }
});

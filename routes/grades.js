import express from 'express';
import { promises as fs } from 'fs';

const { readFile, writeFile } = fs;
const router = express.Router();

// POST new grade
router.post('/', async (req, res, next) => {
  try {
    const grades = JSON.parse(await readFile(gradesFile));
    const gradeInput = req.body;

    // Validação de campos
    if (
      !gradeInput.student ||
      !gradeInput.subject ||
      !gradeInput.type ||
      gradeInput.value == null ||
      typeof gradeInput.value != 'number'
    ) {
      throw new Error(
        'Sua entrada deve conter os campos student(string), subject(string), type(string) e value(number)'
      );
    }

    // Atualização do registro e escrita do arquivo
    const newGrade = {
      id: grades.nextId++,
      student: gradeInput.student,
      subject: gradeInput.subject,
      type: gradeInput.type,
      value: gradeInput.value,
      timestamp: new Date(),
    };
    grades.grades.push(newGrade);
    await writeFile(gradesFile, JSON.stringify(grades, null, 2));

    res.send(newGrade);
    res.end();
  } catch (err) {
    next(err);
  }
});

// PUT overwrite existing grade
router.put('/', async (req, res, next) => {
  try {
    const grades = JSON.parse(await readFile(gradesFile));
    const gradeInput = req.body;

    // Validação de campos
    if (
      !gradeInput.id ||
      typeof gradeInput.id != 'number' ||
      !gradeInput.student ||
      !gradeInput.subject ||
      !gradeInput.type ||
      gradeInput.value == null ||
      typeof gradeInput.value != 'number'
    ) {
      throw new Error(
        'Sua entrada deve conter os campos id(number), student(string), subject(string), type(string) e value(number)'
      );
    }

    // Buscando o índice e verificando a existência do registro
    const index = grades.grades.findIndex((grade) => {
      return grade.id === gradeInput.id;
    });
    if (index === -1) {
      throw new Error('Record not found!');
    }

    // Atualização do registro e escrita do arquivo
    const newGrade = {
      id: gradeInput.id,
      student: gradeInput.student,
      subject: gradeInput.subject,
      type: gradeInput.type,
      value: gradeInput.value,
      timestamp: new Date(),
    };
    grades.grades[index] = newGrade;
    await writeFile(gradesFile, JSON.stringify(grades, null, 2));

    res.send(newGrade);
    res.end();
  } catch (err) {
    next(err);
  }
});

// DELETE grade by ID
router.delete('/:id', async (req, res, next) => {
  try {
    const grades = JSON.parse(await readFile(gradesFile));

    // Buscando o índice e verificando a existência do registro
    const index = grades.grades.findIndex((grade) => {
      return grade.id === parseInt(req.params.id);
    });
    if (index === -1) {
      throw new Error('Record not found!');
    }

    // Remoção do registro e escrita do arquivo
    const deletedGrade = grades.grades[index];
    grades.grades = grades.grades.filter((grade) => {
      return grade.id !== parseInt(req.params.id);
    });
    await writeFile(gradesFile, JSON.stringify(grades, null, 2));

    res.send(deletedGrade);
    res.end();
  } catch (err) {
    next(err);
  }
});

// GET grade by ID
router.get('/getgrade/:id', async (req, res, next) => {
  try {
    const grades = JSON.parse(await readFile(gradesFile));

    // Buscando o índice e verificando a existência do registro
    const index = grades.grades.findIndex((grade) => {
      return grade.id === parseInt(req.params.id);
    });
    if (index === -1) {
      throw new Error('Record not found!');
    }
    const resultGrade = grades.grades[index];

    res.send(resultGrade);
    res.end();
  } catch (err) {
    next(err);
  }
});

// GET sum of grades by student and subject
router.get('/finalgrade', async (req, res, next) => {
  try {
    const grades = JSON.parse(await readFile(gradesFile));
    const { student, subject } = req.query;

    // Calculando a soma
    const soma = grades.grades.reduce((acc, curr) => {
      if (curr.student === student && curr.subject === subject) {
        acc += curr.value;
      }
      return acc;
    }, 0);

    res.send(
      `Soma das notas de "${student}" na disciplina "${subject}": ${soma}`
    );
    res.end();
  } catch (err) {
    next(err);
  }
});

// GET avg of grades by subject and type
router.get('/avg', async (req, res, next) => {
  try {
    const grades = JSON.parse(await readFile(gradesFile));
    const { subject, type } = req.query;

    // Calculando a média
    const filteredGrades = grades.grades.filter((grade) => {
      if (grade.subject === subject && grade.type === type) {
        return grade;
      }
    });

    const media =
      filteredGrades.reduce((acc, curr) => {
        return (acc += curr.value);
      }, 0) / filteredGrades.length;

    res.send(
      `Média das notas do tipo "${type}" da disciplina "${subject}": ${media}`
    );
    res.end();
  } catch (err) {
    next(err);
  }
});

router.get('/bestgrades', async (req, res, next) => {
  try {
    const grades = JSON.parse(await readFile(gradesFile));
    const { subject, type } = req.query;

    const filteredGrades = grades.grades.filter((grade) => {
      if (grade.subject === subject && grade.type === type) {
        return grade;
      }
    });

    const orderedGrades = filteredGrades.sort((a, b) => {
      return b.value - a.value;
    });

    const bestGrades = orderedGrades.slice(0, 3);

    res.send(bestGrades);
    res.end();
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  res
    .status(400)
    .send({ error: `${req.method} ${req.baseUrl} - ${err.message}` });
});

export default router;

import express from 'express';
import { eq } from 'drizzle-orm';
import { index } from './db';
import { subjects, type NewSubject } from './db/schema';

const app = express();
const PORT = 8000;

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.send('Bem-vindo à API do Classroom! Acesse /subjects para gerenciar cursos.');
});

// CREATE: Add a new subject
app.post('/subjects', async (req, res) => {
  try {
    const newSubject: NewSubject = req.body;
    const [result] = await index
      .insert(subjects)
      .values(newSubject)
      .returning();
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar subject', details: String(error) });
  }
});

// READ: Get all subjects
app.get('/subjects', async (req, res) => {
  try {
    const allSubjects = await index.select().from(subjects);
    res.json(allSubjects);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar subjects', details: String(error) });
  }
});

// READ: Get a specific subject by ID
app.get('/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await index
      .select()
      .from(subjects)
      .where(eq(subjects.id, parseInt(id, 10)));

    if (!result) {
      return res.status(404).json({ error: 'Subject não encontrado' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar subject', details: String(error) });
  }
});

// UPDATE: Update a subject
app.put('/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData: Partial<NewSubject> = req.body;
    const [result] = await index
      .update(subjects)
      .set(updateData)
      .where(eq(subjects.id, parseInt(id, 10)))
      .returning();

    if (!result) {
      return res.status(404).json({ error: 'Subject não encontrado' });
    }
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar subject', details: String(error) });
  }
});

// DELETE: Delete a subject
app.delete('/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await index
      .delete(subjects)
      .where(eq(subjects.id, parseInt(id, 10)))
      .returning();

    if (!result) {
      return res.status(404).json({ error: 'Subject não encontrado' });
    }
    res.json({ message: 'Subject deletado com sucesso', deleted: result });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar subject', details: String(error) });
  }
});

// SEED: Populate mock subjects (useful for testing)
app.post('/subjects/seed/mock', async (req, res) => {
  try {
    const result = await index
      .insert(subjects)
      .values(mockSubjects)
      .returning();
    res.status(201).json({ message: 'Mock subjects adicionados', count: result.length, subjects: result });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao popular mock subjects', details: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📚 Endpoints disponíveis:`);
  console.log(`   GET  /              - Mensagem de boas-vindas`);
  console.log(`   POST /subjects      - Criar novo subject`);
  console.log(`   GET  /subjects      - Listar todos os subjects`);
  console.log(`   GET  /subjects/:id  - Obter subject por ID`);
  console.log(`   PUT  /subjects/:id  - Atualizar subject`);
  console.log(`   DELETE /subjects/:id - Deletar subject`);
  console.log(`   POST /subjects/seed/mock - Popular com mock subjects`);
});
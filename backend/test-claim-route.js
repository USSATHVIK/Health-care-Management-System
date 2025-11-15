import express from 'express';
import claimSubmissionRoutes from './routes/claimSubmissionRoutes.js';

const app = express();
app.use(express.json());

// Add claim submission route
app.use('/api/_claims', claimSubmissionRoutes);

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});
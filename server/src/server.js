import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { startExpiryJob } from './jobs/expiryJob.js';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required.');
const port = Number(process.env.PORT || 5000);
await connectDB();
startExpiryJob();
app.listen(port, () => console.log(`MIDSA WishLink API running on http://localhost:${port}`));

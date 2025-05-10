import { query } from "../../utils/db";

export default async function handler(req, res) {
  // console.log("Inside GET notes API");
  if (req.method === 'GET') {
    try {
      // TODO: Implement logic to fetch notes from your chosen data store (e.g., MongoDB, PostgreSQL, JSON file).
      // - Connect to the database/data source.
      // - Fetch all notes.
      // - Consider sorting notes, e.g., by creation date (descending).
      // - Replace the example response below with the actual notes.
      const result = await query('SELECT * FROM notes');
      const notes = result.rows

      res.status(200).json(notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
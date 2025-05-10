import {query} from "../../utils/db";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query('SELECT * FROM tags');
      const tags = result.rows

      res.status(200).json(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      res.status(500).json({ error: 'Failed to fetch tags' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
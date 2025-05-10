import {query} from "../../utils/db";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
        const tagData = req.body;
      const result = await query(
        'INSERT INTO tags (tagname) VALUES ($1)',
        [tagData.tagname]
      );
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
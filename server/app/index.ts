  import express, { Request, Response } from 'express';

  async function main() {
    startAPI();
  }

  const startAPI = (): void => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });

    app.use(express.json());

    app.get('/', (req: Request, res: Response) => {
      res.send('Hello, World!');
    });
  }

  main();

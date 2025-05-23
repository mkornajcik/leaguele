import { NextFunction, Request, Response } from "express";

export const getPage = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).render("index");
};

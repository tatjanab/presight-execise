import { Router } from "express";
import { findTopHobbies, findTopNationalities } from "../repositories/users.js";
import type { Facets } from "../types.js";
import { parseFilters } from "./users.js";

export const facetsRouter = Router();

/** GET /api/facets — top 20 hobbies and nationalities for the current search and filters. */
facetsRouter.get("/", (req, res) => {
  const filters = parseFilters(req.query);
  const body: Facets = {
    hobbies: findTopHobbies(filters),
    nationalities: findTopNationalities(filters),
  };
  res.json(body);
});

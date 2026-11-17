import { jam } from "./jam.js";
import { pimplenet } from "./pimplenet.js";
import { vault } from "./vault.js";

export const caseStudies = [pimplenet, jam, vault];

export const getCaseStudy = (slug) => caseStudies.find((c) => c.slug === slug);

import { v4 as uuidv4 } from "uuid";

import { Triple } from "@trustgraph/client";

export const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
export const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";
export const DIGITAL_DOCUMENT = "https://schema.org/DigitalDocument";
export const SCHEMA_URL = "https://schema.org/url";
export const SCHEMA_KEYWORDS = "https://schema.org/keywords";

export interface DocumentParameters {
  title?: string;
  url?: string;
  keywords?: string[];
  comments?: string;
}

export const createDocId = () => {
  return "https://trustgraph.ai/doc/" + uuidv4();
};

export const prepareMetadata = (doc_id: string, params) => {
  let doc_meta: Triple[] = [
    {
      s: { v: doc_id, e: true },
      p: { v: RDF_TYPE, e: true },
      o: { v: DIGITAL_DOCUMENT, e: true },
    },
  ];

  if (params.title != "")
    doc_meta = [
      ...doc_meta,
      {
        s: { v: doc_id, e: true },
        p: { v: RDFS_LABEL, e: true },
        o: { v: params.title, e: false },
      },
    ];

  if (params.url != "")
    doc_meta = [
      ...doc_meta,
      {
        s: { v: doc_id, e: true },
        p: { v: SCHEMA_URL, e: true },
        o: { v: params.url, e: true },
      },
    ];

  for (const keyword of params.keywords)
    doc_meta = [
      ...doc_meta,
      {
        s: { v: doc_id, e: true },
        p: { v: SCHEMA_KEYWORDS, e: true },
        o: { v: keyword, e: false },
      },
    ];

  return doc_meta;
};

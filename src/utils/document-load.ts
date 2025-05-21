import { v4 as uuidv4 } from "uuid";

import { Triple } from "../api/trustgraph/Triple";

export const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
export const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";
export const DIGITAL_DOCUMENT = "https://schema.org/DigitalDocument";
export const SCHEMA_URL = "https://schema.org/url";
export const SCHEMA_KEYWORDS = "https://schema.org/keywords";

export interface LoadParameters {
  title?: string;
  url?: string;
  keywords?: string[];
  comments?: string;
  socket;
}

export const b64encode = (input) => {
  return btoa(
    encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_match, p1) => {
      return String.fromCharCode("0x" + p1);
    }),
  );
};

export const create_doc_id = () => {
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

export const loadFile = (file, kind: string, params: LoadParameters) => {
  return new Promise((resolve, reject) => {
    try {
      const doc_id = create_doc_id();
      const doc_meta = prepareMetadata(doc_id, params);

      const reader = new FileReader();

      reader.onloadend = function () {
        // FIXME: Type is 'string | ArrayBuffer'?  is this safe?
        // FIXME: Use Blob.arrayBuffer API?
        const data = (reader.result as string)
          .replace("data:", "")
          .replace(/^.+,/, "");

        params.socket
          .loadLibraryDocument(
            data,
            doc_id,
            doc_meta,
            kind,
            params.title,
            params.comments,
            params.keywords,
            null,
          )
          .then(() => {
            resolve();
          })
          .catch((e) => {
            console.log("Error:", e);
            reject(e);
          });
      };

      reader.readAsDataURL(file);
    } catch (e) {
      reject(e);
    }
  });
};

export const loadText = (text, params: LoadParameters) => {
  return new Promise((resolve, reject) => {
    try {
      const doc_id = create_doc_id();
      const doc_meta = prepareMetadata(doc_id, params);

      const encoded = b64encode(text);

      params.socket
        .loadLibraryDocument(
          encoded,
          doc_id,
          doc_meta,
          "text/plain",
          params.title,
          params.comments,
          params.keywords,
          null,
        )
        .then(() => {
          resolve();
        })
        .catch((e) => {
          console.log("Error:", e);
          reject(e);
        });
    } catch (e) {
      reject(e);
    }
  });
};

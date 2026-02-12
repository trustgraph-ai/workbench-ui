// Functionality here helps construct subgraphs for react-force-graph
// visualisation

import { Triple, BaseApi, Term, IriTerm, LiteralTerm } from "@trustgraph/client";
import {
  query,
  labelS,
  labelP,
  labelO,
  filterInternals,
} from "./knowledge-graph";

// Helper to get the string value from a Term (IRI or Literal)
const getTermValue = (term: Term): string => {
  if (term.t === "i") return (term as IriTerm).i;
  if (term.t === "l") return (term as LiteralTerm).v;
  if (term.t === "b") return term.d;
  return "";
};

// Helper to check if a Term is an IRI
const isIri = (term: Term): term is IriTerm => term.t === "i";

// Extended Term type that includes optional label (added by labeling functions)
type LabeledTerm = Term & { label?: string };

interface Node {
  id: string;
  label: string;
  group: number;
}

interface Link {
  id: string;
  source: string;
  target: string;
  label: string;
  value: number;
}

export interface Subgraph {
  nodes: Node[];
  links: Link[];
}

export const createSubgraph = (): Subgraph => {
  return {
    nodes: [],
    links: [],
  };
};

export const updateSubgraphTriples = (sg: Subgraph, triples: Triple[]) => {
  const groupId = 1;

  const nodeIds = new Set<string>(sg.nodes.map((n) => n.id));
  const linkIds = new Set<string>(sg.links.map((n) => n.id));

  for (const t of triples) {
    // Skip triples where the object is a literal (property edges)
    // These are now shown in the node details drawer instead
    if (!isIri(t.o)) {
      continue;
    }
    // Source has a URI, that can be its unique ID
    const sourceId = getTermValue(t.s);

    // Target is always an entity now (we filtered out literals above)
    const targetId = getTermValue(t.o);

    // Links have an ID so that this edge is unique
    const linkId = getTermValue(t.s) + "@@" + getTermValue(t.p) + "@@" + getTermValue(t.o);

    if (!nodeIds.has(sourceId)) {
      const sLabeled = t.s as LabeledTerm;
      const n: Node = {
        id: sourceId,
        label: sLabeled.label ? sLabeled.label : "unknown",
        group: groupId,
      };
      nodeIds.add(sourceId);
      sg = {
        ...sg,
        nodes: [...sg.nodes, n],
      };
    }

    if (!nodeIds.has(targetId)) {
      const oLabeled = t.o as LabeledTerm;
      const n: Node = {
        id: targetId,
        label: oLabeled.label ? oLabeled.label : "unknown",
        group: groupId,
      };
      nodeIds.add(targetId);
      sg = {
        ...sg,
        nodes: [...sg.nodes, n],
      };
    }

    if (!linkIds.has(linkId)) {
      const pLabeled = t.p as LabeledTerm;
      const l: Link = {
        source: sourceId,
        target: targetId,
        id: linkId,
        label: pLabeled.label ? pLabeled.label : "unknown",
        value: 1,
      };
      linkIds.add(linkId);
      sg = {
        ...sg,
        links: [...sg.links, l],
      };
    }
  }

  return sg;
};

export const updateSubgraph = (
  socket: BaseApi,
  flowId: string,
  uri: string,
  sg: Subgraph,
  add: (s: string) => void,
  remove: (s: string) => void,
  collection?: string,
) => {
  const api = socket.flow(flowId);
  return query(api, uri, add, remove, undefined, collection)
    .then((d) => labelS(api, d, add, remove, collection))
    .then((d) => labelP(api, d, add, remove, collection))
    .then((d) => labelO(api, d, add, remove, collection))
    .then((d) => filterInternals(d))
    .then((d) => updateSubgraphTriples(sg, d));
};

export const updateSubgraphByRelationship = (
  socket: BaseApi,
  flowId: string,
  selectedNodeId: string,
  relationshipUri: string,
  direction: "incoming" | "outgoing",
  sg: Subgraph,
  add: (s: string) => void,
  remove: (s: string) => void,
  collection?: string,
) => {
  const api = socket.flow(flowId);
  const activityName = `Following ${direction} relationship: ${relationshipUri}`;

  add(activityName);

  // Build the query based on direction
  const queryPromise =
    direction === "outgoing"
      ? api.triplesQuery(
          { t: "i", i: selectedNodeId }, // s = selectedNode
          { t: "i", i: relationshipUri }, // p = relationship
          undefined, // o = ??? (what we want to find)
          20, // Limit results
          collection,
        )
      : api.triplesQuery(
          undefined, // s = ??? (what we want to find)
          { t: "i", i: relationshipUri }, // p = relationship
          { t: "i", i: selectedNodeId }, // o = selectedNode
          20, // Limit results
          collection,
        );

  return queryPromise
    .then((triples) => {
      remove(activityName);
      return triples;
    })
    .then((d) => labelS(api, d, add, remove, collection))
    .then((d) => labelP(api, d, add, remove, collection))
    .then((d) => labelO(api, d, add, remove, collection))
    .then((d) => filterInternals(d))
    .then((d) => updateSubgraphTriples(sg, d));
};

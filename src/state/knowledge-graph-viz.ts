
// Functionality here helps construct subgraphs for react-force-graph
// visualisation

import { Triple } from './Triple';
import {
    query, labelS, labelP, labelO, filterInternals
} from './knowledge-graph';
import { Socket } from '../socket/trustgraph-socket';

interface Node {
    id : string,
    label : string,
    group : number,
};

interface Link {
    id : string;
    source : string;
    target : string;
    label : string;
    value : number;
};

export interface Subgraph {
    nodes : Node[];
    links : Link[];
};

export const createSubgraph = () : Subgraph => {
    return {
        nodes: [],
        links: [],
    };
};

export const updateSubgraphTriples = (
    sg : Subgraph, triples : Triple[]
) => {

    const groupId = 1;

    let nodeIds = new Set<string>(sg.nodes.map(n => n.id));
    let linkIds = new Set<string>(sg.links.map(n => n.id));

    for (let t of triples) {

        // Source has a URI, that can be its unique ID
        const sourceId = t.s.v;

        // Same for target, unless it's a literal, in which case
        // use an ID which is unique to this edge so that it gets its
        // own node
        const targetId = t.o.e ? t.o.v : (t.s.v + "@@" + t.p.v + "@@" + t.o.e);

        // Links have an ID so that this edge is unique
        const linkId = (t.s.v + "@@" + t.p.v + "@@" + t.o.e);

        if (!nodeIds.has(sourceId)) {
            const n : Node = {
                id: sourceId,
                label: t.s.label ? t.s.label : "unknown",
                group: groupId,
            };
            nodeIds.add(sourceId);
            sg = {
                ...sg,
                nodes: [
                    ...sg.nodes,
                    n,
                ]
            }
        }

        if (!nodeIds.has(targetId)) {
            const n : Node = {
                id: targetId,
                label: t.o.label ? t.o.label : "unknown",
                group: groupId,
            };
            nodeIds.add(targetId);
            sg = {
                ...sg,
                nodes: [
                    ...sg.nodes,
                    n,
                ]
            }
        }

        if (!linkIds.has(linkId)) {
            const l : Link = {
                source: sourceId,
                target: targetId,
                id: linkId,
                label: t.p.label ? t.p.label : "unknown",
                value: 1,
            };
            linkIds.add(linkId);
            sg = {
                ...sg,
                links: [
                    ...sg.links,
                    l,
                ]
            }
        }

    }

    return sg;

};

export const updateSubgraph = (
    socket : Socket, uri : string, sg : Subgraph,
    add : (s : string) => void, remove : (s : string) => void
) => {

    return query(socket, uri, add, remove).then(
        (d) => labelS(socket, d, add, remove)
    ).then(
        (d) => labelP(socket, d, add, remove)
    ).then(
        (d) => labelO(socket, d, add, remove)
    ).then(
        (d) => filterInternals(d)
    ).then(
        (d) => updateSubgraphTriples(sg, d)
    );

};


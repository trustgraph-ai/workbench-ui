/**
 * Represents an entity in the knowledge graph
 * Entities are nodes that represent real-world objects, concepts, or resources
 */
export interface Entity {
  // Human-readable display name for the entity
  label: string;
  // Unique Resource Identifier (URI) that uniquely identifies the entity
  // Used as the primary key for the entity in the knowledge graph
  uri: string;
}

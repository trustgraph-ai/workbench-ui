/**
 * Taxonomy Quality Assurance Utilities
 *
 * This module provides tools for automatically fixing common taxonomy issues
 * and enhancing taxonomy quality.
 */

import { Taxonomy, TaxonomyConcept } from "../state/taxonomies";
import { validateTaxonomy, ValidationError } from "./skos-validation";

export interface QAFix {
  type: "auto" | "manual";
  description: string;
  conceptId?: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
}

export interface QAResult {
  taxonomy: Taxonomy;
  fixes: QAFix[];
  remainingIssues: ValidationError[];
}

export class TaxonomyQA {
  /**
   * Auto-fix common taxonomy issues
   */
  static autoFix(taxonomy: Taxonomy, issueTypes?: string[]): QAResult {
    let updatedTaxonomy = { ...taxonomy };
    const fixes: QAFix[] = [];

    // Fix missing scheme URI
    if (!updatedTaxonomy.scheme.uri && updatedTaxonomy.metadata.namespace) {
      const newUri = `${updatedTaxonomy.metadata.namespace}${updatedTaxonomy.metadata.name.replace(/\s+/g, "-").toLowerCase()}`;
      updatedTaxonomy = {
        ...updatedTaxonomy,
        scheme: {
          ...updatedTaxonomy.scheme,
          uri: newUri,
        },
      };
      fixes.push({
        type: "auto",
        description: "Generated missing scheme URI",
        field: "scheme.uri",
        newValue: newUri,
      });
    }

    // Fix missing scheme prefLabel
    if (!updatedTaxonomy.scheme.prefLabel && updatedTaxonomy.metadata.name) {
      updatedTaxonomy = {
        ...updatedTaxonomy,
        scheme: {
          ...updatedTaxonomy.scheme,
          prefLabel: updatedTaxonomy.metadata.name,
        },
      };
      fixes.push({
        type: "auto",
        description: "Set scheme prefLabel from taxonomy name",
        field: "scheme.prefLabel",
        newValue: updatedTaxonomy.metadata.name,
      });
    }

    // Fix relationship inconsistencies
    const relationshipFixes =
      this.fixRelationshipInconsistencies(updatedTaxonomy);
    updatedTaxonomy = relationshipFixes.taxonomy;
    fixes.push(...relationshipFixes.fixes);

    // Remove duplicate relationships
    const duplicateFixes = this.removeDuplicateRelationships(updatedTaxonomy);
    updatedTaxonomy = duplicateFixes.taxonomy;
    fixes.push(...duplicateFixes.fixes);

    // Fix orphaned concepts by connecting them to existing hierarchy
    const orphanFixes = this.fixOrphanedConcepts(updatedTaxonomy);
    updatedTaxonomy = orphanFixes.taxonomy;
    fixes.push(...orphanFixes.fixes);

    // Clean up empty relationships
    const cleanupFixes = this.cleanupEmptyRelationships(updatedTaxonomy);
    updatedTaxonomy = cleanupFixes.taxonomy;
    fixes.push(...cleanupFixes.fixes);

    // Validate the fixed taxonomy
    const validation = validateTaxonomy(updatedTaxonomy);

    return {
      taxonomy: updatedTaxonomy,
      fixes,
      remainingIssues: [...validation.errors, ...validation.warnings],
    };
  }

  /**
   * Fix relationship inconsistencies (ensure broader/narrower relationships are reciprocated)
   */
  private static fixRelationshipInconsistencies(taxonomy: Taxonomy): {
    taxonomy: Taxonomy;
    fixes: QAFix[];
  } {
    const updatedConcepts = { ...taxonomy.concepts };
    const fixes: QAFix[] = [];

    Object.values(updatedConcepts).forEach((concept) => {
      // Ensure broader relationships are reciprocated
      if (concept.broader && updatedConcepts[concept.broader]) {
        const broaderConcept = updatedConcepts[concept.broader];
        if (!broaderConcept.narrower?.includes(concept.id)) {
          updatedConcepts[concept.broader] = {
            ...broaderConcept,
            narrower: [...(broaderConcept.narrower || []), concept.id],
          };
          fixes.push({
            type: "auto",
            description: `Added ${concept.prefLabel} as narrower concept to ${broaderConcept.prefLabel}`,
            conceptId: concept.broader,
            field: "narrower",
          });
        }
      }

      // Ensure narrower relationships are reciprocated
      if (concept.narrower) {
        concept.narrower.forEach((narrowerId) => {
          const narrowerConcept = updatedConcepts[narrowerId];
          if (narrowerConcept && narrowerConcept.broader !== concept.id) {
            updatedConcepts[narrowerId] = {
              ...narrowerConcept,
              broader: concept.id,
            };
            fixes.push({
              type: "auto",
              description: `Set ${concept.prefLabel} as broader concept for ${narrowerConcept.prefLabel}`,
              conceptId: narrowerId,
              field: "broader",
            });
          }
        });
      }

      // Ensure related relationships are symmetric
      if (concept.related) {
        concept.related.forEach((relatedId) => {
          const relatedConcept = updatedConcepts[relatedId];
          if (
            relatedConcept &&
            !relatedConcept.related?.includes(concept.id)
          ) {
            updatedConcepts[relatedId] = {
              ...relatedConcept,
              related: [...(relatedConcept.related || []), concept.id],
            };
            fixes.push({
              type: "auto",
              description: `Made ${concept.prefLabel} and ${relatedConcept.prefLabel} mutually related`,
              conceptId: relatedId,
              field: "related",
            });
          }
        });
      }
    });

    return {
      taxonomy: {
        ...taxonomy,
        concepts: updatedConcepts,
      },
      fixes,
    };
  }

  /**
   * Remove duplicate relationships within concepts
   */
  private static removeDuplicateRelationships(taxonomy: Taxonomy): {
    taxonomy: Taxonomy;
    fixes: QAFix[];
  } {
    const updatedConcepts = { ...taxonomy.concepts };
    const fixes: QAFix[] = [];

    Object.values(updatedConcepts).forEach((concept) => {
      let hasChanges = false;

      // Remove duplicate narrower relationships
      if (concept.narrower && concept.narrower.length > 0) {
        const uniqueNarrower = [...new Set(concept.narrower)];
        if (uniqueNarrower.length !== concept.narrower.length) {
          updatedConcepts[concept.id] = {
            ...concept,
            narrower: uniqueNarrower,
          };
          hasChanges = true;
        }
      }

      // Remove duplicate related relationships
      if (concept.related && concept.related.length > 0) {
        const uniqueRelated = [...new Set(concept.related)];
        if (uniqueRelated.length !== concept.related.length) {
          updatedConcepts[concept.id] = {
            ...updatedConcepts[concept.id],
            related: uniqueRelated,
          };
          hasChanges = true;
        }
      }

      // Remove duplicate alternative labels
      if (concept.altLabel && concept.altLabel.length > 0) {
        const uniqueAltLabels = [...new Set(concept.altLabel)];
        if (uniqueAltLabels.length !== concept.altLabel.length) {
          updatedConcepts[concept.id] = {
            ...updatedConcepts[concept.id],
            altLabel: uniqueAltLabels,
          };
          hasChanges = true;
        }
      }

      if (hasChanges) {
        fixes.push({
          type: "auto",
          description: `Removed duplicate relationships and labels from ${concept.prefLabel}`,
          conceptId: concept.id,
        });
      }
    });

    return {
      taxonomy: {
        ...taxonomy,
        concepts: updatedConcepts,
      },
      fixes,
    };
  }

  /**
   * Fix orphaned concepts by suggesting connections or promoting to top concepts
   */
  private static fixOrphanedConcepts(taxonomy: Taxonomy): {
    taxonomy: Taxonomy;
    fixes: QAFix[];
  } {
    const updatedTaxonomy = { ...taxonomy };
    const fixes: QAFix[] = [];
    const concepts = Object.values(taxonomy.concepts);
    const topConceptIds = new Set(taxonomy.scheme.hasTopConcept);

    // Find orphaned concepts (no broader and not a top concept)
    const orphanedConcepts = concepts.filter(
      (concept) => !concept.broader && !topConceptIds.has(concept.id),
    );

    if (orphanedConcepts.length > 0) {
      // If there are few orphaned concepts and the taxonomy is small, promote them to top concepts
      if (orphanedConcepts.length <= 3 && concepts.length <= 20) {
        updatedTaxonomy.scheme = {
          ...updatedTaxonomy.scheme,
          hasTopConcept: [
            ...updatedTaxonomy.scheme.hasTopConcept,
            ...orphanedConcepts.map((c) => c.id),
          ],
        };

        orphanedConcepts.forEach((concept) => {
          fixes.push({
            type: "auto",
            description: `Promoted "${concept.prefLabel}" to top concept`,
            conceptId: concept.id,
          });
        });
      } else {
        // For larger taxonomies, suggest manual review
        orphanedConcepts.forEach((concept) => {
          fixes.push({
            type: "manual",
            description: `Orphaned concept "${concept.prefLabel}" needs to be connected to the hierarchy or marked as a top concept`,
            conceptId: concept.id,
          });
        });
      }
    }

    return {
      taxonomy: updatedTaxonomy,
      fixes,
    };
  }

  /**
   * Clean up empty or invalid relationships
   */
  private static cleanupEmptyRelationships(taxonomy: Taxonomy): {
    taxonomy: Taxonomy;
    fixes: QAFix[];
  } {
    const updatedConcepts = { ...taxonomy.concepts };
    const fixes: QAFix[] = [];

    Object.values(updatedConcepts).forEach((concept) => {
      let hasChanges = false;

      // Remove invalid narrower relationships (pointing to non-existent concepts)
      if (concept.narrower && concept.narrower.length > 0) {
        const validNarrower = concept.narrower.filter(
          (id) => updatedConcepts[id],
        );
        if (validNarrower.length !== concept.narrower.length) {
          updatedConcepts[concept.id] = {
            ...concept,
            narrower: validNarrower.length > 0 ? validNarrower : undefined,
          };
          hasChanges = true;
        }
      }

      // Remove invalid related relationships
      if (concept.related && concept.related.length > 0) {
        const validRelated = concept.related.filter(
          (id) => updatedConcepts[id],
        );
        if (validRelated.length !== concept.related.length) {
          updatedConcepts[concept.id] = {
            ...updatedConcepts[concept.id],
            related: validRelated.length > 0 ? validRelated : undefined,
          };
          hasChanges = true;
        }
      }

      // Remove invalid broader relationship
      if (concept.broader && !updatedConcepts[concept.broader]) {
        updatedConcepts[concept.id] = {
          ...updatedConcepts[concept.id],
          broader: undefined,
        };
        hasChanges = true;
      }

      if (hasChanges) {
        fixes.push({
          type: "auto",
          description: `Cleaned up invalid relationships for ${concept.prefLabel}`,
          conceptId: concept.id,
        });
      }
    });

    // Clean up invalid top concepts
    const validTopConcepts = taxonomy.scheme.hasTopConcept.filter(
      (id) => updatedConcepts[id],
    );
    if (validTopConcepts.length !== taxonomy.scheme.hasTopConcept.length) {
      const updatedScheme = {
        ...taxonomy.scheme,
        hasTopConcept: validTopConcepts,
      };

      fixes.push({
        type: "auto",
        description: "Removed invalid top concept references",
        field: "scheme.hasTopConcept",
      });

      return {
        taxonomy: {
          ...taxonomy,
          concepts: updatedConcepts,
          scheme: updatedScheme,
        },
        fixes,
      };
    }

    return {
      taxonomy: {
        ...taxonomy,
        concepts: updatedConcepts,
      },
      fixes,
    };
  }

  /**
   * Generate quality improvement suggestions
   */
  static generateSuggestions(taxonomy: Taxonomy): QAFix[] {
    const suggestions: QAFix[] = [];
    const concepts = Object.values(taxonomy.concepts);

    // Suggest adding definitions for concepts without them
    concepts
      .filter((c) => !c.definition)
      .forEach((concept) => {
        suggestions.push({
          type: "manual",
          description: `Add definition for "${concept.prefLabel}" to improve clarity`,
          conceptId: concept.id,
          field: "definition",
        });
      });

    // Suggest adding alternative labels for better searchability
    concepts
      .filter((c) => !c.altLabel || c.altLabel.length === 0)
      .forEach((concept) => {
        suggestions.push({
          type: "manual",
          description: `Consider adding alternative labels for "${concept.prefLabel}" to improve searchability`,
          conceptId: concept.id,
          field: "altLabel",
        });
      });

    // Suggest notation for concepts in larger taxonomies
    if (concepts.length > 20) {
      concepts
        .filter((c) => !c.notation)
        .forEach((concept) => {
          suggestions.push({
            type: "manual",
            description: `Consider adding notation/code for "${concept.prefLabel}" to aid in referencing`,
            conceptId: concept.id,
            field: "notation",
          });
        });
    }

    // Suggest improving hierarchy depth if too shallow
    const maxDepth = this.calculateMaxDepth(taxonomy);
    if (maxDepth < 3 && concepts.length > 10) {
      suggestions.push({
        type: "manual",
        description: `Taxonomy hierarchy is shallow (max depth: ${maxDepth}). Consider adding more specific subconcepts.`,
      });
    }

    return suggestions;
  }

  /**
   * Calculate maximum hierarchy depth
   */
  private static calculateMaxDepth(taxonomy: Taxonomy): number {
    const concepts = taxonomy.concepts;
    const topConcepts = taxonomy.scheme.hasTopConcept;

    if (topConcepts.length === 0) return 0;

    let maxDepth = 1;

    const calculateDepth = (
      conceptId: string,
      currentDepth: number,
    ): void => {
      const concept = concepts[conceptId];
      if (!concept) return;

      maxDepth = Math.max(maxDepth, currentDepth);

      if (concept.narrower) {
        concept.narrower.forEach((narrowerId) => {
          calculateDepth(narrowerId, currentDepth + 1);
        });
      }
    };

    topConcepts.forEach((topConceptId) => {
      calculateDepth(topConceptId, 1);
    });

    return maxDepth;
  }
}
